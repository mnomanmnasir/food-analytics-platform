import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

type TimeWindow = 'day' | 'week' | 'month';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async getTopPopularDishes(restaurantId: number) {
    try {
      // Define the type for the menu item with order items
      type MenuItemWithOrderItems = {
        id: number;
        name: string;
        description: string | null;
        price: number;
        category: string;
        imageUrl: string | null;
        restaurantId: number;
        popularityScore: number;
        orderItems: Array<{ quantity: number }>;
        createdAt: Date;
        updatedAt: Date;
      };

      // First, get all menu items with their order items
      const menuItems = await this.prisma.menuItem.findMany({
        where: { 
          restaurantId,
          isAvailable: true 
        },
        include: {
          orderItems: {
            where: {
              order: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                },
                status: 'DELIVERED' // Only count delivered orders
              }
            },
            select: {
              quantity: true
            }
          }
        }
      }) as unknown as MenuItemWithOrderItems[];

      // Process to get total quantity ordered for each menu item
      const popularDishes = menuItems
        .map(menuItem => ({
          id: menuItem.id,
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          category: menuItem.category,
          imageUrl: menuItem.imageUrl,
          popularityScore: menuItem.popularityScore,
          totalOrdered: menuItem.orderItems?.length 
            ? menuItem.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0) 
            : 0
        }))
        .sort((a, b) => b.totalOrdered - a.totalOrdered)
        .slice(0, 5);

      return popularDishes;
    } catch (error) {
      this.logger.error(`Error in getTopPopularDishes: ${error.message}`, error.stack);
      throw new Error('Failed to fetch popular dishes');
    }
  }

  async getAverageDeliveryTime(restaurantId: number, timeWindow: TimeWindow = 'week') {
    try {
      const now = new Date();
      let startDate = new Date();

      switch (timeWindow) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }

      const result = await this.prisma.$queryRaw<{ avg_delivery_time: number }[]>`
        SELECT AVG(TIMESTAMPDIFF(MINUTE, o.createdAt, o.updatedAt)) as avg_delivery_time
        FROM \`Order\` o
        WHERE o.restaurantId = ${restaurantId}
          AND o.status = 'DELIVERED'
          AND o.createdAt >= ${startDate}
      `;

      return {
        averageDeliveryTime: result[0]?.avg_delivery_time || 0,
        timeWindow,
        unit: 'minutes'
      };
    } catch (error) {
      this.logger.error(`Error in getAverageDeliveryTime: ${error.message}`, error.stack);
      throw new Error('Failed to calculate average delivery time');
    }
  }

  async getPeakOrderingTimes(restaurantId: number) {
    try {
      const result = await this.prisma.$queryRaw<{ hour: bigint; count: bigint }[]>`
        SELECT 
          HOUR(createdAt) as hour,
          COUNT(*) as count
        FROM \`Order\`
        WHERE restaurantId = ${restaurantId}
          AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY HOUR(createdAt)
        ORDER BY count DESC
        LIMIT 5
      `;

      return result.map(item => ({
        hour: Number(item.hour),
        orderCount: Number(item.count),
        timeRange: `${Number(item.hour)}:00 - ${Number(item.hour) + 1}:00`
      }));
    } catch (error) {
      this.logger.error(`Error in getPeakOrderingTimes: ${error.message}`, error.stack);
      throw new Error('Failed to get peak ordering times');
    }
  }

  async getStaleOrders(thresholdMinutes: number = 30) {
    try {
      const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);
      
      return await this.prisma.order.findMany({
        where: {
          status: {
            in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY']
          },
          createdAt: {
            lt: threshold
          }
        },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
            }
          }
          // Note: `delivery` is intentionally not included to avoid runtime errors when the Delivery table isn't migrated yet.
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
    } catch (error) {
      this.logger.error(`Error in getStaleOrders: ${error.message}`, error.stack);
      throw new Error('Failed to fetch stale orders');
    }
  }

  // NEW: Update dish popularity scores based on recent sales
  async updateDishPopularityScores(restaurantId: number) {
    try {
      const dishes = await this.getTopPopularDishes(restaurantId);
      
      // Update popularity scores in database
      for (const dish of dishes) {
        await this.prisma.menuItem.update({
          where: { id: dish.id },
          data: { 
            popularityScore: dish.totalOrdered 
          }
        });
      }

      this.logger.log(`Updated popularity scores for restaurant ${restaurantId}`);
      return dishes;
    } catch (error) {
      this.logger.error(`Error updating popularity scores: ${error.message}`, error.stack);
      throw error;
    }
  }

  // NEW: Broadcast complete analytics dashboard to restaurant
  async broadcastRestaurantAnalytics(restaurantId: number) {
    try {
      const [popularDishes, deliveryTime, peakTimes, staleOrders] = await Promise.all([
        this.getTopPopularDishes(restaurantId),
        this.getAverageDeliveryTime(restaurantId, 'week'),
        this.getPeakOrderingTimes(restaurantId),
        this.getStaleOrders(30)
      ]);

      const analyticsData = {
        restaurantId,
        timestamp: new Date().toISOString(),
        popularDishes,
        deliveryTime,
        peakTimes,
        staleOrders: staleOrders.filter(order => order.restaurantId === restaurantId),
        summary: {
          totalPopularDishes: popularDishes.length,
          avgDeliveryMinutes: Math.round(deliveryTime.averageDeliveryTime),
          peakHour: peakTimes[0]?.timeRange || 'N/A',
          staleOrdersCount: staleOrders.filter(o => o.restaurantId === restaurantId).length
        }
      };

      // Emit to restaurant room
      this.eventsGateway.emitAnalyticsUpdate(restaurantId, analyticsData);
      
      this.logger.log(`Broadcasted analytics to restaurant ${restaurantId}`);
      return analyticsData;
    } catch (error) {
      this.logger.error(`Error broadcasting analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  // NEW: Trigger analytics update after order events
  async triggerAnalyticsUpdateOnOrderChange(restaurantId: number) {
    try {
      // Update popularity scores first
      await this.updateDishPopularityScores(restaurantId);
      
      // Then broadcast full analytics
      await this.broadcastRestaurantAnalytics(restaurantId);
    } catch (error) {
      this.logger.error(`Error triggering analytics update: ${error.message}`, error.stack);
    }
  }
}
