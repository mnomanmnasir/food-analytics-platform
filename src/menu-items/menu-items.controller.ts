import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/create-menu-item.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('menu-items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiResponse({ status: 201, description: 'The menu item has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  create(@Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuItemsService.create(createMenuItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items' })
  @ApiQuery({ name: 'restaurantId', required: false, description: 'Filter by restaurant ID' })
  @ApiResponse({ status: 200, description: 'Return all menu items.' })
  async findAll(@Query('restaurantId', ParseIntPipe) restaurantId?: number) {
    return this.menuItemsService.findAll(restaurantId);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get menu items by restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant ID' })
  @ApiResponse({ status: 200, description: 'Return menu items for the restaurant.' })
  @ApiResponse({ status: 404, description: 'Restaurant not found.' })
  findByRestaurant(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.menuItemsService.findByRestaurant(restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu item by ID' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'Return the menu item.' })
  @ApiResponse({ status: 404, description: 'Menu item not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a menu item' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'The menu item has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Menu item not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuItemsService.update(id, updateMenuItemDto);
  }

  @Patch(':id/toggle-availability')
  @ApiOperation({ summary: 'Toggle menu item availability' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'The menu item availability has been toggled.' })
  @ApiResponse({ status: 404, description: 'Menu item not found.' })
  toggleAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.toggleAvailability(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a menu item' })
  @ApiParam({ name: 'id', description: 'Menu item ID' })
  @ApiResponse({ status: 200, description: 'The menu item has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Menu item not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemsService.remove(id);
  }
}
