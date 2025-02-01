const calculateAll = ({ weight, height, age, gender, activityLevel }) => {
  const BMI = weight / (height * height);

  const BMR = 10 * weight + 6.25 * height - 5 * age + 5;

  const TDEE = BMR * (activityLevel || 1);

  const BodyFat = 1.2 * BMI + 0.23 * age - 10.8 * gender - 5.4;

  const FatMass = weight * (BodyFat / 100);

  const LeanMass = weight - FatMass;
  return {
    BMI: BMI.toFixed(2),
    BMR: BMR.toFixed(2),
    TDEE: TDEE.toFixed(2),
    BodyFat: BodyFat.toFixed(2),
    FatMass: FatMass.toFixed(2),
    LeanMass: LeanMass.toFixed(2),
  };
};

const result = calculateAll({
  weight: 70,
  height: 1.75,
  age: 25,
  gender: 1, // 1 = male, 0 = female
  activityLevel: 1.55,
});

console.log(result);
