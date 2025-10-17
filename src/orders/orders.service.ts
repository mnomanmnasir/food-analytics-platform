import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AnalyticsService } from '../analytics/analytics.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService
  ) { }

  async create(createOrderDto: CreateOrderDto, userId: number) {
    const { restaurantId, deliveryAddress, paymentMethod, phoneNumber, items, notes } = createOrderDto;

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('At least one menu item is required to create an order');
    }

    // Fetch valid menu items
    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: items.map(item => item?.menuItemId).filter(Boolean) },
      },
    });

    // Check if all requested items were found
    if (menuItems.length !== items.length) {
      const foundIds = menuItems.map(item => item.id);
      const missingItems = items.filter(item => !foundIds.includes(item.menuItemId));
      throw new Error(`The following menu items were not found: ${missingItems.map(i => i.menuItemId).join(', ')}`);
    }

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) return total;
      return total + (menuItem.price * item.quantity);
    }, 0);

    // Create order with nested items
    const order = await this.prisma.order.create({
      data: {
        userId,
        restaurantId,
        deliveryAddress,
        phoneNumber,
        paymentMethod,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        totalAmount,
        notes,
        items: {
          create: items.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: menuItems.find(mi => mi.id === item.menuItemId)?.price || 0,
          })),
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
        user: true,
      },
    });

    return order;
  }


  async updateOrderStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto) {
    const { status } = updateOrderStatusDto;

    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
        user: true,
      },
    });

    return order;
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async getOrderById(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
        user: true,
        // delivery: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async getOrdersByRestaurant(restaurantId: number) {
    return this.prisma.order.findMany({
      where: { restaurantId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        user: true,
        // delivery: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrdersByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        restaurant: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
