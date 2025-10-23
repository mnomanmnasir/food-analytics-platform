# Real-Time Features Documentation

## Overview
This food delivery analytics platform now includes real-time WebSocket functionality using Socket.IO. Restaurants can receive instant updates about orders, deliveries, and analytics without polling the server.

## Architecture

### WebSocket Gateway
- **Location**: `src/events/events.gateway.ts`
- **Port**: Same as HTTP server (default: 3000)
- **Technology**: Socket.IO with NestJS WebSocket gateway

### Real-Time Events

#### 1. Order Events
- **`orderCreated`**: Fired when a new order is placed
- **`orderStatusUpdate`**: Fired when an order status changes

#### 2. Delivery Events
- **`deliveryStatusUpdate`**: Fired when delivery status or location updates

#### 3. Analytics Events
- **`analyticsUpdate`**: Fired when analytics data changes

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Update Database Schema
```bash
npx prisma generate
npx prisma migrate dev --name add_deliveries_and_realtime
```

### 3. Start the Server
```bash
npm run start:dev
```

The WebSocket server will run on `http://localhost:3000`

## Client Integration

### Using Socket.IO Client

#### HTML/JavaScript
```html
<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
<script>
  const socket = io('http://localhost:3000');
  
  socket.on('connect', () => {
    console.log('Connected to server');
    
    // Join a restaurant room to receive updates
    socket.emit('joinRestaurant', { restaurantId: 1 });
  });
  
  socket.on('orderCreated', (order) => {
    console.log('New order:', order);
    // Update UI with new order
  });
  
  socket.on('orderStatusUpdate', (order) => {
    console.log('Order updated:', order);
    // Update order status in UI
  });
  
  socket.on('deliveryStatusUpdate', (delivery) => {
    console.log('Delivery updated:', delivery);
    // Update delivery tracking in UI
  });
</script>
```

#### React/Next.js
```javascript
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

function RestaurantDashboard({ restaurantId }) {
  const [socket, setSocket] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected');
      newSocket.emit('joinRestaurant', { restaurantId });
    });

    newSocket.on('orderCreated', (order) => {
      setOrders(prev => [order, ...prev]);
      // Show notification
    });

    newSocket.on('orderStatusUpdate', (order) => {
      setOrders(prev => prev.map(o => 
        o.id === order.id ? order : o
      ));
    });

    return () => newSocket.close();
  }, [restaurantId]);

  return (
    <div>
      {/* Your dashboard UI */}
    </div>
  );
}
```

#### Angular
```typescript
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  joinRestaurant(restaurantId: number) {
    this.socket.emit('joinRestaurant', { restaurantId });
  }

  onOrderCreated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('orderCreated', (data) => {
        observer.next(data);
      });
    });
  }

  onOrderStatusUpdate(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('orderStatusUpdate', (data) => {
        observer.next(data);
      });
    });
  }
}
```

## API Endpoints

### REST Endpoints

#### Orders
- `POST /orders` - Create new order (emits `orderCreated` event)
- `PATCH /orders/:id/status` - Update order status (emits `orderStatusUpdate` event)
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get specific order
- `GET /orders/restaurant/:restaurantId` - Get restaurant orders

#### Deliveries
- `POST /deliveries` - Create delivery (emits `deliveryStatusUpdate` event)
- `PATCH /deliveries/:id` - Update delivery (emits `deliveryStatusUpdate` event)
- `GET /deliveries` - Get all deliveries
- `GET /deliveries/:id` - Get specific delivery
- `GET /deliveries/order/:orderId` - Get delivery by order ID
- `GET /deliveries/active` - Get all active deliveries
- `GET /deliveries/restaurant/:restaurantId` - Get restaurant deliveries
- `GET /deliveries/restaurant/:restaurantId/average-time` - Get average delivery time

#### Analytics
- `GET /analytics/restaurant/:restaurantId/popular-dishes` - Top 5 popular dishes
- `GET /analytics/restaurant/:restaurantId/delivery-time?timeWindow=week` - Average delivery time
- `GET /analytics/restaurant/:restaurantId/peak-times` - Peak ordering times
- `GET /analytics/stale-orders?threshold=30` - Incomplete orders older than threshold

### WebSocket Events

#### Client → Server

##### `joinRestaurant`
Join a restaurant room to receive updates
```javascript
socket.emit('joinRestaurant', { restaurantId: 1 });
```

##### `leaveRestaurant`
Leave a restaurant room
```javascript
socket.emit('leaveRestaurant', { restaurantId: 1 });
```

#### Server → Client

##### `orderCreated`
Emitted when a new order is created
```javascript
socket.on('orderCreated', (order) => {
  // order object with full details
});
```

##### `orderStatusUpdate`
Emitted when order status changes
```javascript
socket.on('orderStatusUpdate', (order) => {
  // Updated order object
});
```

##### `deliveryStatusUpdate`
Emitted when delivery is created or updated
```javascript
socket.on('deliveryStatusUpdate', (delivery) => {
  // Delivery object with order details
});
```

##### `analyticsUpdate`
Emitted when analytics data changes
```javascript
socket.on('analyticsUpdate', (analytics) => {
  // Analytics data
});
```

## Database Schema

### Delivery Model
```prisma
model Delivery {
  id                    Int            @id @default(autoincrement())
  order                 Order          @relation(fields: [orderId], references: [id])
  orderId               Int            @unique
  driverName            String?
  driverPhone           String?
  status                DeliveryStatus @default(ASSIGNED)
  estimatedDeliveryTime DateTime?
  actualDeliveryTime    DateTime?
  pickupTime            DateTime?
  currentLocation       String?
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
}

enum DeliveryStatus {
  ASSIGNED
  PICKED_UP
  IN_TRANSIT
  NEARBY
  DELIVERED
  FAILED
}
```

## Testing Real-Time Features

### 1. Using the HTML Client
Open `client-example.html` in your browser:
```bash
# Open the file in your default browser
start client-example.html  # Windows
open client-example.html   # Mac
xdg-open client-example.html  # Linux
```

### 2. Using Postman/Thunder Client

#### Create an Order
```bash
POST http://localhost:3000/orders
Content-Type: application/json

{
  "restaurantId": 1,
  "deliveryAddress": "123 Main St",
  "phoneNumber": "+1234567890",
  "paymentMethod": "CARD",
  "items": [
    { "menuItemId": 1, "quantity": 2 }
  ]
}
```

#### Update Order Status
```bash
PATCH http://localhost:3000/orders/1/status
Content-Type: application/json

{
  "status": "CONFIRMED"
}
```

#### Create Delivery
```bash
POST http://localhost:3000/deliveries
Content-Type: application/json

{
  "orderId": 1,
  "driverName": "John Doe",
  "driverPhone": "+1234567890",
  "estimatedDeliveryTime": "2025-10-23T15:30:00Z"
}
```

#### Update Delivery Status
```bash
PATCH http://localhost:3000/deliveries/1
Content-Type: application/json

{
  "status": "PICKED_UP",
  "currentLocation": "Restaurant location"
}
```

## Use Cases

### 1. Restaurant Dashboard
Restaurants can monitor orders in real-time:
- New orders appear instantly
- Order status updates without refresh
- Track deliveries in real-time

### 2. Delivery Tracking
Customers can track their delivery:
- See when driver picks up order
- Track delivery status changes
- Get notified when delivery is nearby

### 3. Analytics Dashboard
Real-time analytics updates:
- Popular dishes update as orders come in
- Peak times analysis updates automatically
- Delivery performance metrics update in real-time

### 4. Admin Monitoring
System administrators can:
- Monitor all restaurant activities
- Track stale orders for intervention
- View system-wide analytics

## Production Considerations

### 1. CORS Configuration
Update the CORS settings in `events.gateway.ts`:
```typescript
@WebSocketGateway({
  cors: {
    origin: ['https://yourdomain.com', 'https://admin.yourdomain.com'],
    credentials: true
  },
})
```

### 2. Authentication
Add authentication to the gateway:
```typescript
@UseGuards(WsAuthGuard)
@WebSocketGateway()
export class EventsGateway {
  // ... implementation
}
```

### 3. Rate Limiting
Implement rate limiting for WebSocket connections to prevent abuse.

### 4. Scaling
For multiple server instances, use Redis adapter:
```bash
npm install @socket.io/redis-adapter redis
```

```typescript
import { RedisIoAdapter } from './redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  await app.listen(3000);
}
```

## Troubleshooting

### Connection Issues
- Ensure server is running on correct port
- Check CORS settings
- Verify firewall rules

### Events Not Received
- Confirm you've joined the restaurant room
- Check restaurant ID matches
- Verify event names are correct

### Performance Issues
- Limit number of events
- Implement event throttling
- Use Redis for scaling

## Example Scenarios

### Scenario 1: New Order Flow
1. Customer places order via REST API
2. Server creates order in database
3. `orderCreated` event emitted to restaurant room
4. Restaurant dashboard updates instantly
5. Restaurant confirms order
6. `orderStatusUpdate` event emitted
7. Customer receives notification

### Scenario 2: Delivery Tracking
1. Restaurant marks order ready
2. Delivery created via REST API
3. `deliveryStatusUpdate` event emitted
4. Driver picks up order
5. Status updated to `PICKED_UP`
6. `deliveryStatusUpdate` event emitted
7. Customer sees real-time tracking

### Scenario 3: Analytics Update
1. Multiple orders completed
2. Analytics service recalculates metrics
3. `analyticsUpdate` event emitted
4. Dashboard charts update automatically

## Support
For issues or questions about real-time features, please refer to:
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
