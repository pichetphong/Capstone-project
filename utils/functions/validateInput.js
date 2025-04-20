const VALID_GENDERS = ['MALE', 'FEMALE'];
const VALID_GOALS = ['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_WEIGHT'];
const VALID_DIET_TYPES = ['LOW_CARB', 'BALANCED', 'HIGH_PROTEIN'];
const VALID_ACTIVITY_LEVELS = [
  'SEDENTARY',
  'LIGHTLY_ACTIVE',
  'MODERATELY_ACTIVE',
  'VERY_ACTIVE',
  'SUPER_ACTIVE',
];

export function validateInput({
  userId,
  age,
  weight,
  height,
  gender,
  goal,
  dietType,
  activityLevel,
}) {
  if (
    !userId ||
    !age ||
    !weight ||
    !height ||
    !gender ||
    !goal ||
    !dietType ||
    !activityLevel
  ) {
    return { isValid: false, error: 'Missing required fields' };
  }

  if (
    typeof age !== 'number' ||
    typeof weight !== 'number' ||
    typeof height !== 'number'
  ) {
    return { isValid: false, error: 'Age, weight, and height must be numbers' };
  }

  if (!VALID_GENDERS.includes(gender)) {
    return { isValid: false, error: `Invalid gender: ${gender}` };
  }

  if (!VALID_GOALS.includes(goal)) {
    return { isValid: false, error: `Invalid goal: ${goal}` };
  }

  if (!VALID_DIET_TYPES.includes(dietType)) {
    return { isValid: false, error: `Invalid dietType: ${dietType}` };
  }

  if (!VALID_ACTIVITY_LEVELS.includes(activityLevel)) {
    return { isValid: false, error: `Invalid activityLevel: ${activityLevel}` };
  }

  return { isValid: true };
}
