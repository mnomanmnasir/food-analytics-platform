import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: 'status must be a valid order status',
  })
  @IsNotEmpty()
  status: OrderStatus;
}
  