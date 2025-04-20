/*
  Warnings:

  - You are about to drop the column `calorieSurplus` on the `HealthMetrics` table. All the data in the column will be lost.
  - Added the required column `dailySurplus` to the `HealthMetrics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weeklySurplus` to the `HealthMetrics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HealthMetrics" DROP COLUMN "calorieSurplus",
ADD COLUMN     "dailySurplus" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "weeklySurplus" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dietType" INTEGER,
ADD COLUMN     "goal" INTEGER,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "age" DROP NOT NULL,
ALTER COLUMN "height" DROP NOT NULL,
ALTER COLUMN "weight" DROP NOT NULL,
ALTER COLUMN "gender" DROP NOT NULL;
