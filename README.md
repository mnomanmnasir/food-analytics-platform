# Food Analytics Platform

A real-time food restaurant analytics platform built with NestJS, Prisma, and PostgreSQL. This application helps restaurant owners track orders, manage inventory, and analyze business performance.

## Features

- 🍽️ Restaurant Management
- 📊 Real-time Analytics
- 📦 Order Processing
- 📈 Sales & Inventory Reports

## Prerequisites
- NestJS Core: ^11.0.1
- NestJS CLI: ^11.0.0
- MySQL Server (v8.0 or later)
- MySQL Workbench (for database management)
- Git

## Setup Instructions (English)

### 1. Clone the repository
```bash
git clone https://github.com/mnomanmnasir/food-analytics-platform.git
cd food-analytics-platform
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add:
```env
DATABASE_URL="mysql://root:password@localhost:3306/food_analytics?schema=public"
PORT=3000
```

### 4. Database Setup
```bash
# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 5. Start the Development Server
```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 6. Access the Application
- API: `http://localhost:3000`
- API Documentation: `http://localhost:3000/api` (After starting the server)

## Project Structure

```
src/
├── analytics/       # Analytics module
├── orders/          # Order management
│   ├── dto/         # Data Transfer Objects
│   ├── orders.controller.ts
│   ├── orders.module.ts
│   └── orders.service.ts
├── prisma/          # Database configuration
├── restaurants/     # Restaurant management
│   ├── dto/         # Data Transfer Objects
│   ├── restaurants.controller.ts
│   ├── restaurants.module.ts
│   └── restaurants.service.ts
└── app.module.ts    # Root module
```

## Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot-reload
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run format` - Format code using Prettier

## Seeding the Database

To populate the database with sample data:
```bash
npx prisma db seed
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

# رہنما ہدایات (Roman Urdu Main)

## ضروریات

- Node.js (v16 ya is se zyada)
- npm ya yarn
- PostgreSQL database
- Git

## ترتیب دینے کا طریقہ

### 1. Repository کو Clone Karein
```bash
git clone https://github.com/yourusername/food-analytics-platform.git
cd food-analytics-platform
```

### 2. Dependencies Install Karein
```bash
npm install
# ya
# yarn install
```

### 3. Environment Ki Setting
Root directory main `.env` file banayein aur ye add karein:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/food_analytics?schema=public"
JWT_SECRET="apna-secret-key"
PORT=3000
```

### 4. Database Ki Setting
```bash
# Database migrations chalaein
npx prisma migrate dev --name init

# Prisma Client generate karein
npx prisma generate
```

### 5. Development Server Start Karein
```bash
# Development mode main
npm run start:dev

# Production ke liye
npm run build
npm run start:prod
```

### 6. Application Ko Access Karein
- API: `http://localhost:3000`
- API Documentation: `http://localhost:3000/api` (Server start karne ke baad)

## Project Ki Structure

```
src/
├── analytics/       # Analytics ka hissa
├── orders/          # Order management
│   ├── dto/         # Data Transfer Objects
│   ├── orders.controller.ts
│   ├── orders.module.ts
│   └── orders.service.ts
├── prisma/          # Database configuration
├── restaurants/     # Restaurant management
└── app.module.ts    # Root module
```

## Available Commands

- `npm run start` - Application start karein
- `npm run start:dev` - Development mode main start karein
- `npm run build` - Application ko build karein
- `npm run test` - Unit tests chalaein
- `npm run test:e2e` - End-to-end tests chalaein
- `npm run format` - Code ko format karein

## Database Main Sample Data Dalna

Sample data add karne ke liye:
```bash
npx prisma db seed
```

## Madad Karne Ka Tariqa

1. Repository ko fork karein
2. Naya branch banayein (`git checkout -b feature/naya-feature`)
3. Apne changes commit karein (`git commit -m 'Naya feature add kiya'`)
4. Branch ko push karein (`git push origin feature/naya-feature`)
5. Pull Request bhejein

## License

Yeh project MIT License ke tahat available hai.
