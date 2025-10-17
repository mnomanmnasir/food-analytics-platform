import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new restaurant' })
  @ApiResponse({ status: 201, description: 'The restaurant has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all restaurants' })
  @ApiQuery({ name: 'cuisineType', required: false, description: 'Filter by cuisine type' })
  @ApiQuery({ name: 'minRating', required: false, description: 'Filter by minimum rating' })
  @ApiResponse({ status: 200, description: 'Return all restaurants.' })
  async findAll(
    @Query('cuisineType') cuisineType?: string,
    @Query('minRating') minRating?: number,
  ) {
    return this.restaurantsService.findAll({ cuisineType, minRating });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a restaurant by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Return the restaurant.' })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  findOne(@Param('id') id: string) {
    return this.restaurantsService.findOne(+id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get analytics for a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Return restaurant analytics.' })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  getAnalytics(@Param('id') id: string) {
    return this.restaurantsService.getRestaurantAnalytics(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'The restaurant has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(+id, updateRestaurantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'The restaurant has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  remove(@Param('id') id: string) {
    return this.restaurantsService.remove(+id);
  }
}
