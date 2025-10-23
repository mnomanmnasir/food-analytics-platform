import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { DeliveryStatus } from '@prisma/client';

export class UpdateDeliveryDto {
  @IsEnum(DeliveryStatus)
  @IsOptional()
  status?: DeliveryStatus;

  @IsString()
  @IsOptional()
  driverName?: string;

  @IsString()
  @IsOptional()
  driverPhone?: string;

  @IsString()
  @IsOptional()
  currentLocation?: string;

  @IsDateString()
  @IsOptional()
  estimatedDeliveryTime?: string;
}
