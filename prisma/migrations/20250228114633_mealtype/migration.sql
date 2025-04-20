/*
  Warnings:

  - Added the required column `meal` to the `Meals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Meals" ADD COLUMN     "meal" TEXT NOT NULL;
