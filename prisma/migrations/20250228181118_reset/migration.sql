/*
  Warnings:

  - Added the required column `day` to the `Meals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `week` to the `Meals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meals" ADD COLUMN     "day" TEXT NOT NULL,
ADD COLUMN     "week" INTEGER NOT NULL;
