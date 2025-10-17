import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type TimeWindow = 'day' | 'week' | 'month';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

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
        orderItems: Array<{ quantity: number }>;
        createdAt: Date;
        updatedAt: Date;
      };

      // First, get all menu items with their order items
      const menuItems = await this.prisma.menuItem.findMany({
        where: { 
          restaurantId,
          // isActive: true 
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
          ...menuItem,
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
      const result = await this.prisma.$queryRaw<{ hour: number; count: bigint }[]>`
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
        hour: item.hour,
        orderCount: Number(item.count),
        timeRange: `${item.hour}:00 - ${item.hour + 1}:00`
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
            //   contactNumber: true 
            }
          },
        //   delivery: true
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
}
