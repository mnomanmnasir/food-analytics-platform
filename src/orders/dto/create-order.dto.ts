import { IsArray, IsNumber, IsString, ValidateNested, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNumber()
  menuItemId: number;

  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  restaurantId: number;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsNotEmpty()
  items: OrderItemDto[];
}
