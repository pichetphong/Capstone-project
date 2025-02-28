/*
  Warnings:

  - Added the required column `reason` to the `Meals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meals" ADD COLUMN     "reason" TEXT NOT NULL;
