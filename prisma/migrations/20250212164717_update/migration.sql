/*
  Warnings:

  - You are about to drop the column `activityLevel` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `dietType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `goal` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Macronutrients` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `carbs` to the `HealthMetrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fat` to the `HealthMetrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `protein` to the `HealthMetrics` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Macronutrients" DROP CONSTRAINT "Macronutrients_healthMetricsId_fkey";

-- DropIndex
DROP INDEX "HealthMetrics_userId_key";

-- AlterTable
ALTER TABLE "HealthMetrics" ADD COLUMN     "activityLevel" INTEGER,
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "carbs" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "dietType" INTEGER,
ADD COLUMN     "fat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "gender" INTEGER,
ADD COLUMN     "goal" INTEGER,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "protein" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "activityLevel",
DROP COLUMN "age",
DROP COLUMN "dietType",
DROP COLUMN "gender",
DROP COLUMN "goal",
DROP COLUMN "height",
DROP COLUMN "weight";

-- DropTable
DROP TABLE "Macronutrients";
