import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(createRestaurantDto: CreateRestaurantDto) {
    return this.prisma.restaurant.create({
      data: createRestaurantDto,
    });
  }

  async findAll(filters?: { cuisineType?: string; minRating?: number }) {
    return this.prisma.restaurant.findMany({
      where: {
        cuisineType: filters?.cuisineType ? { equals: filters.cuisineType } : undefined,
        rating: filters?.minRating ? { gte: Number(filters.minRating) } : undefined,
      },
      include: {
        menuItems: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  async update(id: number, updateRestaurantDto: UpdateRestaurantDto) {
    await this.findOne(id);
    return this.prisma.restaurant.update({
      where: { id },
      data: updateRestaurantDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.restaurant.delete({
      where: { id },
    });
  }

  async getRestaurantAnalytics(id: number) {
    const restaurant = await this.findOne(id);
    
    const [totalOrders, totalRevenue, averageRating] = await Promise.all([
      this.prisma.order.count({
        where: { restaurantId: id },
      }),
      this.prisma.order.aggregate({
        where: { 
          restaurantId: id,
          paymentStatus: 'COMPLETED',
        },
        _sum: {
          totalAmount: true,
        },
      }),
      this.prisma.review.aggregate({
        where: { restaurantId: id },
        _avg: {
          rating: true,
        },
      }),
    ]);

    const popularItems = await this.prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          restaurantId: id,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const popularItemsWithDetails = await Promise.all(
      popularItems.map(async (item) => {
        const menuItem = await this.prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          select: {
            name: true,
            price: true,
          },
        });
        return {
          ...menuItem,
          totalQuantity: item._sum.quantity,
        };
      }),
    );

    return {
      ...restaurant,
      analytics: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        averageRating: averageRating._avg.rating || 0,
        popularItems: popularItemsWithDetails,
      },
    };
  }
}
