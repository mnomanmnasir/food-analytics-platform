# Database Migration Guide

## Problem
Getting error: "The column `MenuItem.popularityScore` does not exist in the current database"

## Solution

Run these commands in your terminal:

### Step 1: Generate Prisma Client
```bash
npx prisma generate
```

### Step 2: Create and Apply Migration
```bash
npx prisma migrate dev --name add_popularity_and_availability
```

This will:
- Add `popularityScore` column to MenuItem table (default: 0)
- Add `isAvailable` column to MenuItem table (default: true)
- Create Delivery table with all fields
- Add DeliveryStatus enum

### Step 3: Restart Server
```bash
npm run start:dev
```

## If Migration Fails

If you get any errors, you can reset and recreate:

```bash
# Reset database (WARNING: This will delete all data)
npx prisma migrate reset

# Then run migrations
npx prisma migrate dev
```

## Alternative: Manual SQL (if migrate fails)

If Prisma migrate gives issues, run this SQL directly in MySQL:

```sql
-- Add new columns to MenuItem
ALTER TABLE `MenuItem` 
ADD COLUMN `popularityScore` DOUBLE NOT NULL DEFAULT 0,
ADD COLUMN `isAvailable` BOOLEAN NOT NULL DEFAULT true;

-- Create Delivery table
CREATE TABLE `Delivery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `driverName` VARCHAR(191),
    `driverPhone` VARCHAR(191),
    `status` ENUM('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'NEARBY', 'DELIVERED', 'FAILED') NOT NULL DEFAULT 'ASSIGNED',
    `estimatedDeliveryTime` DATETIME(3),
    `actualDeliveryTime` DATETIME(3),
    `pickupTime` DATETIME(3),
    `currentLocation` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `Delivery_orderId_key`(`orderId`),
    CONSTRAINT `Delivery_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Then regenerate Prisma client
-- Run: npx prisma generate
```

## Verify Migration

Check if columns exist:

```sql
DESCRIBE MenuItem;
DESCRIBE Delivery;
```

You should see:
- `popularityScore` in MenuItem table
- `isAvailable` in MenuItem table
- Complete Delivery table
