import { Controller, Post, Body, Get, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    // For now using userId = 1 for testing
    // In production, get userId from auth token: const userId = req.user.id;
    const userId = 1;
    return this.ordersService.create(createOrderDto, userId);
  }

  @Get()
  async findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(+id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }
}
