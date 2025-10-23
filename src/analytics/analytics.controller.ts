import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { EventsGateway } from '../events/events.gateway'; 
// import { AuthGuard } from '@nestjs/passport';

@ApiTags('analytics')
@Controller('analytics')
// @UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly eventsGateway: EventsGateway, 
  ) {}

  @Get('restaurants/:id/top-dishes')
  @ApiOperation({ summary: 'Get top 5 popular dishes for a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Returns top 5 popular dishes' })
  async getTopDishes(@Param('id') restaurantId: string) {
    const data = await this.analyticsService.getTopPopularDishes(parseInt(restaurantId));
    await this.analyticsService.broadcastRestaurantAnalytics(parseInt(restaurantId));
    return data;
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
    const data = await this.analyticsService.getAverageDeliveryTime(parseInt(restaurantId), timeWindow);
    await this.analyticsService.broadcastRestaurantAnalytics(parseInt(restaurantId));
    return data;
  }

  @Get('restaurants/:id/peak-times')
  @ApiOperation({ summary: 'Get peak ordering times for a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Returns peak ordering hours' })
  async getPeakTimes(@Param('id') restaurantId: string) {
    const data = await this.analyticsService.getPeakOrderingTimes(parseInt(restaurantId));
    await this.analyticsService.broadcastRestaurantAnalytics(parseInt(restaurantId));
    return data;
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

  @Get('restaurant/:restaurantId/popular-dishes')
  @ApiOperation({ summary: 'Get restaurant\'s top 5 popular dishes based on popularity scores and recent sales' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Returns top 5 popular dishes' })
  async getTopPopularDishes(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    const data = await this.analyticsService.getTopPopularDishes(restaurantId);
    await this.analyticsService.broadcastRestaurantAnalytics(restaurantId);
    return data;
  }

  @Get('restaurant/:restaurantId/delivery-time')
  @ApiOperation({ summary: 'Get average delivery time for completed orders across different time windows' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiQuery({ 
    name: 'timeWindow', 
    required: false, 
    enum: ['day', 'week', 'month'],
    description: 'Time window for analysis (default: week)'
  })
  @ApiResponse({ status: 200, description: 'Returns average delivery time' })
  async getAverageDeliveryTime(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Query('timeWindow') timeWindow?: 'day' | 'week' | 'month',
  ) {
    const data = await this.analyticsService.getAverageDeliveryTime(restaurantId, timeWindow || 'week');
    await this.analyticsService.broadcastRestaurantAnalytics(restaurantId);
    return data;
  }

  @Get('restaurant/:restaurantId/peak-times')
  @ApiOperation({ summary: 'Analyze peak ordering times for each restaurant with timestamps' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Returns peak ordering times' })
  async getPeakOrderingTimes(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    const data = await this.analyticsService.getPeakOrderingTimes(restaurantId);
    await this.analyticsService.broadcastRestaurantAnalytics(restaurantId);
    return data;
  }

  @Get('stale-orders')
  @ApiOperation({ summary: 'List all incomplete orders older than a specific threshold' })
  @ApiQuery({ 
    name: 'threshold', 
    required: false, 
    type: Number,
    description: 'Threshold in minutes (default: 30)'
  })
  @ApiResponse({ status: 200, description: 'Returns list of stale orders' })
  async getStaleOrders(@Query('threshold', ParseIntPipe) threshold: number = 30) {
    const data = await this.analyticsService.getStaleOrders(threshold);
    // No need to emit here as it's not restaurant-specific
    return data;
  }

  @Get('restaurant/:restaurantId/dashboard')
  @ApiOperation({ summary: 'Get complete analytics dashboard for a restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Returns analytics dashboard' })
  async getRestaurantDashboard(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.analyticsService.broadcastRestaurantAnalytics(restaurantId);
  }

  @Get('restaurant/:restaurantId/refresh')
  @ApiOperation({ summary: 'Manually trigger analytics update and broadcast' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Returns analytics dashboard' })
  async refreshAnalytics(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    await this.analyticsService.updateDishPopularityScores(restaurantId);
    return this.analyticsService.broadcastRestaurantAnalytics(restaurantId);
  }
}
