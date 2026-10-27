import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMetabolicPlan,
  generateMozambicanMealPlan,
  generateHomeWorkoutPlan,
  isSubscriptionLocked,
  formatMzn,
  getBase64SizeBytes,
  normalizeScannedMealResult,
  calculateDailyConsumedTotals,
  buildWeightHistorySeries,
  calculateWeightProgressSummary,
  appendWeightLogEntry,
} from './nutrition';

test('calculateMetabolicPlan computes accurate BMR, TDEE, safe deficit and macros for female weight loss', () => {
  const result = calculateMetabolicPlan({
    name: 'Neyma Mondlane',
    age: 29,
    gender: 'female',
    currentWeightKg: 78,
    heightCm: 164,
    targetWeightKg: 65,
    activityLevel: 'moderate',
    focusGoal: 'abdomen',
  });

  // Mifflin-St Jeor female: 10*78 + 6.25*164 - 5*29 - 161 = 780 + 1025 - 145 - 161 = 1499
  assert.equal(result.bmrKcal, 1499);
  // TDEE: round(1499 * 1.55) = 2323
  assert.equal(result.tdeeKcal, 2323);
  // Weight to lose: 13kg (>12kg so deficit is 550)
  assert.equal(result.weightToLoseKg, 13);
  assert.equal(result.safeDeficitKcal, 550);
  assert.equal(result.dailyCaloriesKcal, 1773);
  assert.ok(result.dailyProteinGrams >= 130);
  assert.ok(result.dailyWaterGlasses >= 10);
});

test('calculateMetabolicPlan enforces safety calorie floor for low TDEE users', () => {
  const result = calculateMetabolicPlan({
    name: 'Cláudia',
    age: 45,
    gender: 'female',
    currentWeightKg: 58,
    heightCm: 155,
    targetWeightKg: 52,
    activityLevel: 'sedentary',
    focusGoal: 'general',
  });

  assert.ok(result.dailyCaloriesKcal >= 1250, 'Female daily calories should never drop below 1250 kcal');
});

test('generateMozambicanMealPlan splits calories and proteins across 4 traditional Mozambican meals', () => {
  const metrics = calculateMetabolicPlan({
    name: 'Samito Macassa',
    age: 32,
    gender: 'male',
    currentWeightKg: 88,
    heightCm: 176,
    targetWeightKg: 78,
    activityLevel: 'moderate',
    focusGoal: 'abdomen',
  });

  const meals = generateMozambicanMealPlan(metrics, 'abdomen');
  assert.equal(meals.length, 4);

  const totalMealCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalMealProtein = meals.reduce((sum, m) => sum + m.proteinGrams, 0);

  assert.equal(totalMealCalories, metrics.dailyCaloriesKcal);
  assert.equal(totalMealProtein, metrics.dailyProteinGrams);
});

test('generateHomeWorkoutPlan returns 5 bodyweight exercises tailored to focusGoal', () => {
  const abdomenWorkout = generateHomeWorkoutPlan('abdomen');
  const glutesWorkout = generateHomeWorkoutPlan('glutes_legs');

  assert.equal(abdomenWorkout.length, 5);
  assert.equal(glutesWorkout.length, 5);
  assert.notEqual(abdomenWorkout[0].name, glutesWorkout[0].name);
});

test('isSubscriptionLocked blocks suspended and expired users while allowing active and pending', () => {
  assert.equal(isSubscriptionLocked('active'), false);
  assert.equal(isSubscriptionLocked('pending'), false);
  assert.equal(isSubscriptionLocked('suspended'), true);
  assert.equal(isSubscriptionLocked('expired'), true);
});

test('formatMzn formats Meticais amounts cleanly', () => {
  const formatted = formatMzn(350);
  assert.ok(formatted.includes('350'));
  assert.ok(formatted.endsWith('MZN'));
});

test('getBase64SizeBytes and normalizeScannedMealResult validate compressed photo under 300KB and nutrition fields', () => {
  const sampleDataUrl =
    'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const bytes = getBase64SizeBytes(sampleDataUrl);
  assert.ok(bytes > 0 && bytes < 300 * 1024, 'Compressed image must be under 300KB');

  const normalized = normalizeScannedMealResult(
    {
      dishName: 'Carapau Grelhado com Xima e Matapa Leve',
      identifiedFoods: ['Carapau grelhado', 'Xima de milho', 'Matapa leve'],
      calories: 520,
      proteinGrams: 41,
      carbsGrams: 48,
      fatsGrams: 16,
      weightLossTip: 'Comece pelas verduras para aumentar a saciedade.',
    },
    sampleDataUrl
  );

  assert.equal(normalized.calories, 520);
  assert.equal(normalized.proteinGrams, 41);
  assert.equal(normalized.identifiedFoods.length, 3);
});

test('calculateDailyConsumedTotals sums checked plan meals and scanned camera meals accurately', () => {
  const metrics = calculateMetabolicPlan({
    name: 'Neyma',
    age: 29,
    gender: 'female',
    currentWeightKg: 76.5,
    heightCm: 165,
    targetWeightKg: 66,
    activityLevel: 'moderate',
    focusGoal: 'abdomen',
  });
  const meals = generateMozambicanMealPlan(metrics, 'abdomen');
  const firstMeal = meals[0];

  const scanned = normalizeScannedMealResult(
    {
      calories: 480,
      proteinGrams: 36,
      carbsGrams: 42,
      fatsGrams: 15,
    },
    'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  );

  const totals = calculateDailyConsumedTotals(meals, [firstMeal.id], [scanned]);
  assert.equal(totals.totalCalories, firstMeal.calories + 480);
  assert.equal(totals.totalProteinGrams, firstMeal.proteinGrams + 36);
});

test('buildWeightHistorySeries, calculateWeightProgressSummary, and appendWeightLogEntry track weekly weight loss accurately', () => {
  const initialSeries = buildWeightHistorySeries(
    [
      { weekLabel: 'Sem 1', date: '14 Set', weightKg: 80.8, targetWeightKg: 66.0 },
      { weekLabel: 'Sem 2', date: '21 Set', weightKg: 79.9, targetWeightKg: 66.0 },
      { weekLabel: 'Sem 3', date: '28 Set', weightKg: 79.1, targetWeightKg: 66.0 },
      { weekLabel: 'Sem 4', date: '05 Out', weightKg: 78.2, targetWeightKg: 66.0 },
      { weekLabel: 'Sem 5', date: '12 Out', weightKg: 77.3, targetWeightKg: 66.0 },
      { weekLabel: 'Sem 6', date: '19 Out', weightKg: 76.5, targetWeightKg: 66.0 },
    ],
    76.5,
    66.0
  );

  assert.equal(initialSeries.length, 6);
  const summaryBefore = calculateWeightProgressSummary(initialSeries, 66.0);
  assert.equal(summaryBefore.startWeightKg, 80.8);
  assert.equal(summaryBefore.currentWeightKg, 76.5);
  assert.equal(summaryBefore.totalLostKg, 4.3);
  assert.equal(summaryBefore.remainingToGoalKg, 10.5);

  const updatedSeries = appendWeightLogEntry(
    initialSeries,
    75.8,
    66.0,
    '26 Out',
    'Mais uma semana consistente'
  );
  assert.equal(updatedSeries.length, 7);
  assert.equal(updatedSeries[6].weekLabel, 'Sem 7');
  assert.equal(updatedSeries[6].weightKg, 75.8);

  const summaryAfter = calculateWeightProgressSummary(updatedSeries, 66.0);
  assert.equal(summaryAfter.totalLostKg, 5.0);
  assert.equal(summaryAfter.remainingToGoalKg, 9.8);
});


