/*
  Warnings:

  - You are about to drop the column `fat_mass` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gander` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `muscle_mass` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "fat_mass",
DROP COLUMN "gander",
DROP COLUMN "muscle_mass",
ADD COLUMN     "BodyFat" DOUBLE PRECISION,
ADD COLUMN     "FatMass" DOUBLE PRECISION,
ADD COLUMN     "LeanMass" DOUBLE PRECISION,
ADD COLUMN     "gender" TEXT;
