import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
// import { AuthGuard } from '@nestjs/passport';

@ApiTags('analytics')
@Controller('analytics')
// @UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('restaurants/:id/top-dishes')
  @ApiOperation({ summary: 'Get top 5 popular dishes for a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Returns top 5 popular dishes' })
  async getTopDishes(@Param('id') restaurantId: string) {
    return this.analyticsService.getTopPopularDishes(parseInt(restaurantId));
  }

  @Get('restaurants/:id/delivery-times')
  @ApiOperation({ summary: 'Get average delivery time for a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiQuery({ 
    name: 'timeWindow', 
    required: false, 
    enum: ['day', 'week', 'month'],
    description: 'Time window for analysis (default: week)'
  })
  @ApiResponse({ status: 200, description: 'Returns average delivery time' })
  async getDeliveryTimes(
    @Param('id') restaurantId: string,
    @Query('timeWindow') timeWindow: 'day' | 'week' | 'month' = 'week'
  ) {
    return this.analyticsService.getAverageDeliveryTime(parseInt(restaurantId), timeWindow);
  }

  @Get('restaurants/:id/peak-times')
  @ApiOperation({ summary: 'Get peak ordering times for a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Returns peak ordering hours' })
  async getPeakTimes(@Param('id') restaurantId: string) {
    return this.analyticsService.getPeakOrderingTimes(parseInt(restaurantId));
  }

  @Get('orders/stale')
  @ApiOperation({ summary: 'Get stale/incomplete orders' })
  @ApiQuery({ 
    name: 'minutes', 
    required: false, 
    type: Number,
    description: 'Threshold in minutes (default: 30)'
  })
  @ApiResponse({ status: 200, description: 'Returns list of stale orders' })
  async getStaleOrders(@Query('minutes') minutes: string = '30') {
    return this.analyticsService.getStaleOrders(parseInt(minutes));
  }
}
