import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/create-menu-item.dto';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class MenuItemsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createMenuItemDto: CreateMenuItemDto) {
    try {
      // Check if restaurant exists
      const restaurant = await this.prisma.restaurant.findUnique({
        where: { id: createMenuItemDto.restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException(
          `Restaurant with ID ${createMenuItemDto.restaurantId} not found`,
        );
      }

      const menuItem = await this.prisma.menuItem.create({
        data: createMenuItemDto,
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Emit real-time event
      this.eventsGateway.emitMenuItemCreated(createMenuItemDto.restaurantId, menuItem);

      return menuItem;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Menu item with this name already exists in this restaurant');
      }
      throw error;
    }
  }

  async findAll(restaurantId?: number) {
    const where = restaurantId ? { restaurantId } : {};

    return await this.prisma.menuItem.findMany({
      where,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        orderItems: {
          select: {
            quantity: true,
            order: {
              select: {
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isAvailable: 'desc' },
        { popularityScore: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: number) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
        orderItems: {
          select: {
            quantity: true,
            order: {
              select: {
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return menuItem;
  }

  async update(id: number, updateMenuItemDto: UpdateMenuItemDto) {
    // Check if menu item exists
    await this.findOne(id);

    try {
      const updatedMenuItem = await this.prisma.menuItem.update({
        where: { id },
        data: updateMenuItemDto,
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Emit real-time event
      this.eventsGateway.emitMenuItemUpdated(updatedMenuItem.restaurantId, updatedMenuItem);

      return updatedMenuItem;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Menu item with this name already exists in this restaurant');
      }
      throw error;
    }
  }

  async remove(id: number) {
    // Check if menu item exists
    const menuItem = await this.findOne(id);

    const deletedMenuItem = await this.prisma.menuItem.delete({
      where: { id },
    });

    // Emit real-time event
    this.eventsGateway.emitMenuItemDeleted(menuItem.restaurantId, id);

    return deletedMenuItem;
  }

  async findByRestaurant(restaurantId: number) {
    return await this.findAll(restaurantId);
  }

  async toggleAvailability(id: number) {
    const menuItem = await this.findOne(id);

    const updatedMenuItem = await this.prisma.menuItem.update({
      where: { id },
      data: {
        isAvailable: !menuItem.isAvailable,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Emit real-time event
    this.eventsGateway.emitMenuItemAvailabilityToggled(menuItem.restaurantId, updatedMenuItem);

    return updatedMenuItem;
  }
}
