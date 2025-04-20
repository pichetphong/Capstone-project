/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `BodyFat` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `FatMass` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `LeanMass` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `allergies` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `HealthMetrics` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `HealthMetrics` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `age` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `height` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weight` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HealthMetrics" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "BodyFat",
DROP COLUMN "FatMass",
DROP COLUMN "LeanMass",
DROP COLUMN "allergies",
DROP COLUMN "password",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "age" SET NOT NULL,
ALTER COLUMN "height" SET NOT NULL,
ALTER COLUMN "height" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "weight" SET NOT NULL,
ALTER COLUMN "weight" SET DATA TYPE DOUBLE PRECISION,
DROP COLUMN "gender",
ADD COLUMN     "gender" INTEGER NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "HealthMetrics_userId_key" ON "HealthMetrics"("userId");

-- AddForeignKey
ALTER TABLE "HealthMetrics" ADD CONSTRAINT "HealthMetrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
