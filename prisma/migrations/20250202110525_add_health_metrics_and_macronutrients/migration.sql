-- CreateTable
CREATE TABLE "HealthMetrics" (
    "id" TEXT NOT NULL,
    "bmi" DOUBLE PRECISION NOT NULL,
    "bmr" DOUBLE PRECISION NOT NULL,
    "tdee" DOUBLE PRECISION NOT NULL,
    "bodyFat" DOUBLE PRECISION NOT NULL,
    "fatMass" DOUBLE PRECISION NOT NULL,
    "leanMass" DOUBLE PRECISION NOT NULL,
    "calorieSurplus" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Macronutrients" (
    "id" TEXT NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "healthMetricsId" TEXT NOT NULL,

    CONSTRAINT "Macronutrients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Macronutrients_healthMetricsId_key" ON "Macronutrients"("healthMetricsId");

-- AddForeignKey
ALTER TABLE "Macronutrients" ADD CONSTRAINT "Macronutrients_healthMetricsId_fkey" FOREIGN KEY ("healthMetricsId") REFERENCES "HealthMetrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
