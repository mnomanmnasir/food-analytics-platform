import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class DeliveriesService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createDeliveryDto: CreateDeliveryDto) {
    const { orderId, driverName, driverPhone, estimatedDeliveryTime } = createDeliveryDto;

    // Check if order exists
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Create delivery
    const delivery = await this.prisma.delivery.create({
      data: {
        orderId,
        driverName,
        driverPhone,
        estimatedDeliveryTime: estimatedDeliveryTime ? new Date(estimatedDeliveryTime) : null,
      },
      include: {
        order: {
          include: {
            restaurant: true,
            user: true,
          },
        },
      },
    });

    // Emit real-time update
    this.eventsGateway.emitDeliveryStatusUpdate(order.restaurantId, delivery);

    return delivery;
  }

  async findAll() {
    return this.prisma.delivery.findMany({
      include: {
        order: {
          include: {
            restaurant: true,
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            restaurant: true,
            user: true,
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery with ID ${id} not found`);
    }

    return delivery;
  }

  async findByOrderId(orderId: number) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            restaurant: true,
            user: true,
          },
        },
      },
    });

    if (!delivery) {
      throw new NotFoundException(`Delivery for order ID ${orderId} not found`);
    }

    return delivery;
  }

  async update(id: number, updateDeliveryDto: UpdateDeliveryDto) {
    const existingDelivery = await this.prisma.delivery.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!existingDelivery) {
      throw new NotFoundException(`Delivery with ID ${id} not found`);
    }

    const delivery = await this.prisma.delivery.update({
      where: { id },
      data: {
        ...updateDeliveryDto,
        pickupTime: updateDeliveryDto.status === 'PICKED_UP' && !existingDelivery.pickupTime
          ? new Date()
          : existingDelivery.pickupTime,
        actualDeliveryTime: updateDeliveryDto.status === 'DELIVERED' && !existingDelivery.actualDeliveryTime
          ? new Date()
          : existingDelivery.actualDeliveryTime,
      },
      include: {
        order: {
          include: {
            restaurant: true,
            user: true,
          },
        },
      },
    });

    // Emit real-time update
    this.eventsGateway.emitDeliveryStatusUpdate(delivery.order.restaurantId, delivery);

    return delivery;
  }

  async getActiveDeliveries() {
    return this.prisma.delivery.findMany({
      where: {
        status: {
          in: ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'NEARBY'],
        },
      },
      include: {
        order: {
          include: {
            restaurant: true,
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getDeliveriesByRestaurant(restaurantId: number) {
    return this.prisma.delivery.findMany({
      where: {
        order: {
          restaurantId,
        },
      },
      include: {
        order: {
          include: {
            restaurant: true,
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAverageDeliveryTime(restaurantId: number) {
    const deliveries = await this.prisma.delivery.findMany({
      where: {
        order: {
          restaurantId,
        },
        status: 'DELIVERED',
        pickupTime: { not: null },
        actualDeliveryTime: { not: null },
      },
      select: {
        pickupTime: true,
        actualDeliveryTime: true,
      },
    });

    if (deliveries.length === 0) {
      return { averageTime: 0, unit: 'minutes', count: 0 };
    }

    const totalMinutes = deliveries.reduce((sum, delivery) => {
      if (!delivery.pickupTime || !delivery.actualDeliveryTime) {
        return sum;
      }
      const pickupTime = new Date(delivery.pickupTime).getTime();
      const deliveryTime = new Date(delivery.actualDeliveryTime).getTime();
      const diffMinutes = (deliveryTime - pickupTime) / (1000 * 60);
      return sum + diffMinutes;
    }, 0);

    return {
      averageTime: Math.round(totalMinutes / deliveries.length),
      unit: 'minutes',
      count: deliveries.length,
    };
  }
}
