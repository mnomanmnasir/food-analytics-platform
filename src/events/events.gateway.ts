import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure appropriately for production
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');
  private restaurantRooms = new Map<number, Set<string>>(); // restaurantId -> Set of socket IDs

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove client from all restaurant rooms
    this.restaurantRooms.forEach((clients, restaurantId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        this.logger.log(`Client ${client.id} left restaurant room ${restaurantId}`);
      }
    });
  }

  @SubscribeMessage('joinRestaurant')
  handleJoinRestaurant(
    @MessageBody() data: { restaurantId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { restaurantId } = data;
    const roomName = `restaurant_${restaurantId}`;
    
    client.join(roomName);
    
    // Track the client in restaurant room
    if (!this.restaurantRooms.has(restaurantId)) {
      this.restaurantRooms.set(restaurantId, new Set());
    }
    const roomClients = this.restaurantRooms.get(restaurantId);
    if (roomClients) {
      roomClients.add(client.id);
    }
    
    this.logger.log(`Client ${client.id} joined restaurant room ${restaurantId}`);
    
    return { status: 'success', message: `Joined restaurant ${restaurantId}` };
  }

  @SubscribeMessage('leaveRestaurant')
  handleLeaveRestaurant(
    @MessageBody() data: { restaurantId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { restaurantId } = data;
    const roomName = `restaurant_${restaurantId}`;
    
    client.leave(roomName);
    
    // Remove client from tracking
    const clients = this.restaurantRooms.get(restaurantId);
    if (clients) {
      clients.delete(client.id);
    }
    
    this.logger.log(`Client ${client.id} left restaurant room ${restaurantId}`);
    
    return { status: 'success', message: `Left restaurant ${restaurantId}` };
  }

  // Emit order created event to restaurant
  emitOrderCreated(restaurantId: number, order: any) {
    const roomName = `restaurant_${restaurantId}`;
    this.server.to(roomName).emit('orderCreated', order);
    this.logger.log(`Emitted orderCreated to restaurant ${restaurantId}`);
  }

  // Emit order status update to restaurant
  emitOrderStatusUpdate(restaurantId: number, order: any) {
    const roomName = `restaurant_${restaurantId}`;
    this.server.to(roomName).emit('orderStatusUpdate', order);
    this.logger.log(`Emitted orderStatusUpdate to restaurant ${restaurantId}`);
  }

  // Emit delivery status update
  emitDeliveryStatusUpdate(restaurantId: number, delivery: any) {
    const roomName = `restaurant_${restaurantId}`;
    this.server.to(roomName).emit('deliveryStatusUpdate', delivery);
    this.logger.log(`Emitted deliveryStatusUpdate to restaurant ${restaurantId}`);
  }

  // Emit analytics update
  emitAnalyticsUpdate(restaurantId: number, analytics: any) {
    const roomName = `restaurant_${restaurantId}`;
    this.server.to(roomName).emit('analyticsUpdate', analytics);
    this.logger.log(`Emitted analyticsUpdate to restaurant ${restaurantId}`);
  }

  // Emit menu item created
  emitMenuItemCreated(restaurantId: number, menuItem: any) {
    const roomName = `restaurant_${restaurantId}`;
    this.server.to(roomName).emit('menuItemCreated', menuItem);
    this.logger.log(`Emitted menuItemCreated to restaurant ${restaurantId}`);
  }

  // Emit menu item updated
  emitMenuItemUpdated(restaurantId: number, menuItem: any) {
    const roomName = `restaurant_${restaurantId}`;
    this.server.to(roomName).emit('menuItemUpdated', menuItem);
    this.logger.log(`Emitted menuItemUpdated to restaurant ${restaurantId}`);
  }

  // Emit menu item deleted
  emitMenuItemDeleted(restaurantId: number, menuItemId: number) {
    const roomName = `restaurant_${restaurantId}`;
    this.server.to(roomName).emit('menuItemDeleted', { id: menuItemId });
    this.logger.log(`Emitted menuItemDeleted to restaurant ${restaurantId}`);
  }

  // Emit menu item availability toggled
  emitMenuItemAvailabilityToggled(restaurantId: number, menuItem: any) {
    const roomName = `restaurant_${restaurantId}`;
    this.server.to(roomName).emit('menuItemAvailabilityToggled', menuItem);
    this.logger.log(`Emitted menuItemAvailabilityToggled to restaurant ${restaurantId}`);
  }

  // Broadcast to all connected clients
  broadcastMessage(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.log(`Broadcasted ${event} to all clients`);
  }
}
