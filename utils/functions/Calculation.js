export const Calculation = ({
  weight,
  height,
  age,
  gender,
  activityLevel,
  goal,
  dietType,
}) => {
  if (
    !weight ||
    !height ||
    !age ||
    !gender ||
    !activityLevel ||
    !goal ||
    !dietType
  ) {
    console.error('Calculation received invalid values:', {
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
      dietType,
    });
    return null;
  }

  try {
    const heightInMeters = height / 100;
    const BMI = weight / (heightInMeters * heightInMeters);

    let BMR;
    if (gender === 'MALE') {
      BMR = 66 + 13.7 * weight + 5 * height - 6.8 * age;
    } else if (gender === 'FEMALE') {
      BMR = 655 + 9.6 * weight + 1.8 * height - 4.7 * age;
    } else {
      throw new Error(`Invalid gender: ${gender}`);
    }

    const BodyFat =
      1.2 * BMI + 0.23 * age - (gender === 'MALE' ? 10.8 : 0) - 5.4;
    const FatMass = weight * (BodyFat / 100);
    const LeanMass = weight - FatMass;

    let TDEE;
    switch (activityLevel) {
      case 'SEDENTARY':
        TDEE = BMR * 1.2;
        break;
      case 'LIGHTLY_ACTIVE':
        TDEE = BMR * 1.375;
        break;
      case 'MODERATELY_ACTIVE':
        TDEE = BMR * 1.55;
        break;
      case 'VERY_ACTIVE':
        TDEE = BMR * 1.725;
        break;
      case 'SUPER_ACTIVE':
        TDEE = BMR * 1.9;
        break;
      default:
        throw new Error(`Invalid activityLevel: ${activityLevel}`);
    }
    const newTDEE = TDEE * 7;

    let weeklySurplus;
    switch (goal) {
      case 'GAIN_WEIGHT':
        weeklySurplus = newTDEE + 500;
        break;
      case 'MAINTAIN':
        weeklySurplus = newTDEE;
        break;
      case 'LOSE_WEIGHT':
        weeklySurplus = newTDEE - 500;
        break;
      default:
        throw new Error(`Invalid goal: ${goal}`);
    }

    const dailySurplus = weeklySurplus / 7;

    let protein, fat, carbs;
    switch (dietType) {
      case 'HIGH_PROTEIN':
        protein = (dailySurplus * 0.4) / 4;
        fat = (dailySurplus * 0.3) / 9;
        carbs = (dailySurplus * 0.3) / 4;
        break;
      case 'BALANCED':
        protein = (dailySurplus * 0.3) / 4;
        fat = (dailySurplus * 0.35) / 9;
        carbs = (dailySurplus * 0.35) / 4;
        break;
      case 'LOW_CARB':
        protein = (dailySurplus * 0.25) / 4;
        fat = (dailySurplus * 0.5) / 9;
        carbs = (dailySurplus * 0.25) / 4;
        break;
      default:
        throw new Error(`Invalid dietType: ${dietType}`);
    }

    return {
      BMI: BMI.toFixed(2),
      BMR: BMR.toFixed(2),
      TDEE: TDEE.toFixed(2),
      BodyFat: BodyFat.toFixed(2),
      FatMass: FatMass.toFixed(2),
      LeanMass: LeanMass.toFixed(2),
      weeklySurplus: weeklySurplus.toFixed(2),
      dailySurplus: dailySurplus.toFixed(2),
      protein: protein.toFixed(2),
      fat: fat.toFixed(2),
      carbs: carbs.toFixed(2),
    };
  } catch (error) {
    console.error('❌ Error inside Calculation():', error);
    return null;
  }
};
