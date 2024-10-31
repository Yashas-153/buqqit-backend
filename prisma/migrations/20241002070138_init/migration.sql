/*
  Warnings:

  - The values [pending,confirmed,canceled] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,completed,failed] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `address` on the `Studio` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Studio` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Studio` table. All the data in the column will be lost.
  - You are about to drop the column `photos` on the `Studio` table. All the data in the column will be lost.
  - You are about to drop the column `pincode` on the `Studio` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Studio` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,studio_id]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `max_people` to the `Studio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `min_duration` to the `Studio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Studio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('Pending', 'Confirmed', 'Canceled');
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('Pending', 'Completed', 'Failed', 'Refunded');
ALTER TABLE "Payment" ALTER COLUMN "payment_status" TYPE "PaymentStatus_new" USING ("payment_status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Studio" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "photos",
DROP COLUMN "pincode",
DROP COLUMN "state",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "max_people" INTEGER NOT NULL,
ADD COLUMN     "min_duration" INTEGER NOT NULL,
ADD COLUMN     "size" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "profile_picture" TEXT;

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "studio_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL DEFAULT 0.0000000,
    "longitude" DECIMAL(65,30) NOT NULL DEFAULT 0.0000000,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" SERIAL NOT NULL,
    "studio_id" INTEGER NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIME NOT NULL,
    "end_time" TIME NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prop" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "studio_id" INTEGER NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Prop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "studio_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "upload_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_studio_id_key" ON "Address"("studio_id");

-- CreateIndex
CREATE UNIQUE INDEX "Review_user_id_studio_id_key" ON "Review"("user_id", "studio_id");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prop" ADD CONSTRAINT "Prop_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_studio_id_fkey" FOREIGN KEY ("studio_id") REFERENCES "Studio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
