-- AlterTable
ALTER TABLE `menuitem` ADD COLUMN `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `popularityScore` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Delivery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `driverName` VARCHAR(191) NULL,
    `driverPhone` VARCHAR(191) NULL,
    `status` ENUM('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'NEARBY', 'DELIVERED', 'FAILED') NOT NULL DEFAULT 'ASSIGNED',
    `estimatedDeliveryTime` DATETIME(3) NULL,
    `actualDeliveryTime` DATETIME(3) NULL,
    `pickupTime` DATETIME(3) NULL,
    `currentLocation` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Delivery_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Delivery` ADD CONSTRAINT `Delivery_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
