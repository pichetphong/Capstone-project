export const Calculation = ({
  weight,
  height,
  age,
  gender,
  activityLevel,
  goal,
}) => {
  if (
    !weight ||
    !height ||
    !age ||
    gender === undefined ||
    activityLevel === undefined ||
    goal === undefined
  ) {
    console.error('Calculation received invalid values:', {
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
    });
    return null;
  }

  try {
    const heightInMeters = height / 100;
    const BMI = weight / (heightInMeters * heightInMeters);

    let BMR;
    if (gender === 1) {
      BMR = 66 + 13.7 * weight + 5 * height - 6.8 * age;
    } else {
      BMR = 655 + 9.6 * weight + 1.8 * height - 4.7 * age;
    }

    const TDEE = BMR * activityLevel;
    const BodyFat = 1.2 * BMI + 0.23 * age - 10.8 * gender - 5.4;
    const FatMass = weight * (BodyFat / 100);
    const LeanMass = weight - FatMass;

    const calorieSurplus = TDEE * (1 + goal / 100);
    const protein = 2.2 * weight;
    const fat = (calorieSurplus * 0.25) / 9;
    const carbs = (calorieSurplus - protein * 4 - fat * 9) / 4;

    return {
      BMI: BMI.toFixed(2),
      BMR: BMR.toFixed(2),
      TDEE: TDEE.toFixed(2),
      BodyFat: BodyFat.toFixed(2),
      FatMass: FatMass.toFixed(2),
      LeanMass: LeanMass.toFixed(2),
      calorieSurplus: calorieSurplus.toFixed(2),
      macronutrients: {
        protein: protein.toFixed(2),
        fat: fat.toFixed(2),
        carbs: carbs.toFixed(2),
      },
    };
  } catch (error) {
    console.error('Error inside Calculation():', error);
    return null;
  }
};
