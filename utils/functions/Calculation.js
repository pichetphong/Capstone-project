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
    gender === undefined ||
    activityLevel === undefined ||
    goal === undefined ||
    dietType === undefined
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
    if (gender === 1) {
      BMR = 66 + 13.7 * weight + 5 * height - 6.8 * age;
    } else {
      BMR = 655 + 9.6 * weight + 1.8 * height - 4.7 * age;
    }

    const BodyFat = 1.2 * BMI + 0.23 * age - 10.8 * gender - 5.4;
    const FatMass = weight * (BodyFat / 100);
    const LeanMass = weight - FatMass;

    const TDEE = BMR * activityLevel;
    const newTDEE = TDEE * 7;

    let weeklySurplus;
    // goal เพิ่มน้ำหนัก = 1 คงน้ำหนัก = 0 ลดน้ำหนัก = -1
    if (goal === 1) {
      weeklySurplus = newTDEE + 500;
    } else if (goal === 0) {
      weeklySurplus = newTDEE;
    } else {
      weeklySurplus = newTDEE - 500;
    }

    const dailySurplus = weeklySurplus / 7;

    // dietType เลือก สัดส่วนของโปรตีน ไขมัน คาร์โบไฮเดรต high protein = 1, balanced = 0, low carb = -1
    // high protein : 40 30 30
    // balanced : 30 35 35
    // low carb : 25 50 25
    let protein;
    let fat;
    let carbs;
    if (dietType === 1) {
      protein = (dailySurplus * 0.4) / 4;
      fat = (dailySurplus * 0.3) / 9;
      carbs = (dailySurplus * 0.3) / 4;
    } else if (dietType === 0) {
      protein = (dailySurplus * 0.3) / 4;
      fat = (dailySurplus * 0.35) / 9;
      carbs = (dailySurplus * 0.35) / 4;
    } else {
      protein = (dailySurplus * 0.25) / 4;
      fat = (dailySurplus * 0.5) / 9;
      carbs = (dailySurplus * 0.25) / 4;
    }

    // const calorieSurplus = TDEE * (1 + goal / 100);
    // const protein = 2.2 * weight;
    // const fat = (calorieSurplus * 0.25) / 9;
    // const carbs = (calorieSurplus - protein * 4 - fat * 9) / 4;

    return {
      BMI: BMI.toFixed(2),
      BMR: BMR.toFixed(2),
      TDEE: TDEE.toFixed(2),
      BodyFat: BodyFat.toFixed(2),
      FatMass: FatMass.toFixed(2),
      LeanMass: LeanMass.toFixed(2),
      weeklySurplus: weeklySurplus.toFixed(2),
      dailySurplus: dailySurplus.toFixed(2),
      // calorieSurplus: calorieSurplus.toFixed(2),
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
