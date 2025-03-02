/*
  Warnings:

  - The `activityLevel` column on the `HealthMetrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `dietType` column on the `HealthMetrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `gender` column on the `HealthMetrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `goal` column on the `HealthMetrics` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('FEMALE', 'MALE');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('LOSE_WEIGHT', 'MAINTAIN', 'GAIN_WEIGHT');

-- CreateEnum
CREATE TYPE "DietType" AS ENUM ('LOW_CARB', 'BALANCED', 'HIGH_PROTEIN');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE', 'SUPER_ACTIVE');

-- AlterTable
ALTER TABLE "HealthMetrics" DROP COLUMN "activityLevel",
ADD COLUMN     "activityLevel" "ActivityLevel",
DROP COLUMN "dietType",
ADD COLUMN     "dietType" "DietType",
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender",
DROP COLUMN "goal",
ADD COLUMN     "goal" "Goal";
