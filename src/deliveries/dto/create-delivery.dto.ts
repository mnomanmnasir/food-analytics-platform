import { IsInt, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateDeliveryDto {
  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @IsString()
  @IsOptional()
  driverName?: string;

  @IsString()
  @IsOptional()
  driverPhone?: string;

  @IsDateString()
  @IsOptional()
  estimatedDeliveryTime?: string;
}
