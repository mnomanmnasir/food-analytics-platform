import { IsString, IsOptional, IsNumber, IsUrl, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  address: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  openingHours?: string;

  @IsString()
  @IsOptional()
  cuisineType?: string;

  @IsString()
  @IsOptional()
  priceRange?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
