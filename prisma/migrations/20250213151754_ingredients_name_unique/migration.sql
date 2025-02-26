/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Ingredients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Ingredients_name_key" ON "Ingredients"("name");
