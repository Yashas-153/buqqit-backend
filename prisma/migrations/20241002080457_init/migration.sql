/*
  Warnings:

  - Added the required column `studio_type` to the `Studio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Studio" ADD COLUMN     "studio_type" TEXT NOT NULL;
