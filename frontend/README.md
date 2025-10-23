# Real-Time Food Analytics Platform - Frontend

A modern React frontend for the Food Analytics Platform built with Vite, Socket.io, and Bootstrap. This frontend provides real-time analytics dashboard and menu management capabilities for restaurant owners.

## Features

- **Menu Items Management**: Add, edit, delete, and manage menu items with real-time updates
- **Real-time Analytics Dashboard**: Live analytics and performance metrics
- **WebSocket Integration**: Real-time data synchronization using Socket.io
- **Responsive Design**: Modern UI with Bootstrap styling
- **Multi-Restaurant Support**: Manage multiple restaurants and their menus

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API server running (NestJS application)

## Setup Instructions

### 1. Install Dependencies

Navigate to the frontend directory and install all required packages:

```bash
cd frontend/Real-time-analytics-frontend
npm install
```

### 2. Start Development Server

Run the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 3. Build for Production

To build the application for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Menu Items Management

The platform includes a dedicated HTML interface for managing menu items:

### File: `menu-items-management.html`

This standalone HTML file provides a complete menu management interface that allows you to:

- **Add New Menu Items**: Create new menu items with name, description, price, category, and image
- **Edit Existing Items**: Modify menu item details and availability status
- **Delete Items**: Remove menu items from the restaurant's menu
- **Toggle Availability**: Enable or disable menu items for ordering
- **View Menu Grid**: Display all menu items in an organized card layout

### How to Use Menu Management

1. **Access the Interface**: Open `menu-items-management.html` in your web browser
2. **Select Restaurant**: Choose a restaurant from the dropdown menu
3. **View Current Menu**: See all menu items for the selected restaurant
4. **Add Menu Items**: Click the "+ Add Menu Item" button to create new items
5. **Edit Items**: Click the "Edit" button on any menu item card
6. **Manage Availability**: Use the "Enable/Disable" button to control item availability

### Menu Item Features

- **Rich Information**: Store item name, description, price, category, and image URL
- **Category Organization**: Organize items into Appetizers, Main Course, Desserts, Beverages, Snacks, and Sides
- **Availability Control**: Mark items as available or unavailable for ordering
- **Real-time Updates**: Changes are immediately reflected across the platform
- **Visual Management**: Clean card-based interface for easy management

### API Integration

The menu management interface connects to the backend API at:
- Base URL: `http://localhost:3000`
- Endpoints:
  - `GET /restaurants` - Fetch available restaurants
  - `GET /menu-items/restaurant/:id` - Get menu items for a restaurant
  - `POST /menu-items` - Create new menu item
  - `PATCH /menu-items/:id` - Update existing menu item
  - `DELETE /menu-items/:id` - Delete menu item
  - `PATCH /menu-items/:id/toggle-availability` - Toggle item availability

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview the production build locally

## Technologies Used

- **React 19.1.1**: Modern React with latest features
- **Vite**: Fast build tool and development server
- **Socket.io Client**: Real-time communication
- **Bootstrap 5.3.3**: Responsive UI components and styling
- **TypeScript**: Type-safe JavaScript development

## Project Structure

```
frontend/Real-time-analytics-frontend/
├── public/              # Static assets
├── src/                 # React source code
│   ├── components/      # Reusable React components
│   ├── pages/          # Page components
│   ├── services/       # API services and utilities
│   └── styles/         # CSS and styling files
├── menu-items-management.html  # Standalone menu management interface
├── package.json        # Dependencies and scripts
└── README.md          # This documentation
```

## Development

The frontend is designed to work seamlessly with the NestJS backend. Make sure the backend server is running on `http://localhost:3000` for full functionality.

For real-time features to work properly, ensure Socket.io is properly configured on both frontend and backend.
