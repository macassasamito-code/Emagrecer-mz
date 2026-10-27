export type Gender = 'female' | 'male';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

export type FocusGoal =
  | 'abdomen' // Perder Gordura Abdominal (Secar Barriga)
  | 'general' // Redução Geral do Corpo
  | 'glutes_legs'; // Definição de Pernas/Glúteos

export type SubscriptionStatus = 'active' | 'pending' | 'suspended' | 'expired';

export interface UserProfileInput {
  name: string;
  age: number;
  gender: Gender;
  currentWeightKg: number;
  heightCm: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  focusGoal: FocusGoal;
}

export interface CalculatedMetrics {
  bmrKcal: number; // Taxa Metabólica Basal (TMB)
  tdeeKcal: number; // Gasto Energético Total Diário
  safeDeficitKcal: number; // Défice Calórico Seguro
  dailyCaloriesKcal: number; // Meta Diária de Calorias (kcal)
  dailyProteinGrams: number; // Meta Diária de Proteínas (g)
  dailyCarbsGrams: number; // Hidratos de Carbono (g)
  dailyFatsGrams: number; // Gorduras Saudáveis (g)
  dailyWaterGlasses: number; // Copos de 250ml
  weightToLoseKg: number; // Peso restante para a meta
  estimatedWeeks: number; // Estimativa saudável em semanas
  bmi: number;
}

export interface MealItem {
  id: string;
  slot: 'Pequeno-almoço' | 'Almoço' | 'Lanche' | 'Jantar';
  time: string;
  title: string;
  localIngredients: string[];
  prepTip: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  costMznEstimate: number;
  illustrationType: 'cassava_eggs' | 'fish_sweetpotato' | 'peanuts_fruit' | 'chicken_nhemba';
}

export interface ExerciseItem {
  id: string;
  name: string;
  sets: number;
  repsOrDuration: string;
  restSeconds: number;
  targetArea: string;
  cue: string;
  caloriesBurned: number;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export const FOCUS_LABELS: Record<FocusGoal, string> = {
  abdomen: 'Perder Gordura Abdominal (Secar Barriga)',
  general: 'Redução Geral do Corpo',
  glutes_legs: 'Definição de Pernas/Glúteos',
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentário (Trabalho sentado, pouco movimento)',
  light: 'Leve (Caminhadas 1 a 3 dias/semana)',
  moderate: 'Moderado (Treino em casa 3 a 5 dias/semana)',
  active: 'Intenso (Treino diário ou trabalho físico pesado)',
};

/**
 * Calcula a Taxa Metabólica Basal (fórmula de Mifflin-St Jeor),
 * Défice Calórico Seguro, Meta Diária de Calorias e Proteínas.
 */
export function calculateMetabolicPlan(input: UserProfileInput): CalculatedMetrics {
  const age = Math.max(16, Math.min(90, Number(input.age) || 30));
  const weight = Math.max(35, Math.min(250, Number(input.currentWeightKg) || 75));
  const target = Math.max(35, Math.min(250, Number(input.targetWeightKg) || 65));
  const height = Math.max(130, Math.min(220, Number(input.heightCm) || 165));

  // Mifflin-St Jeor Equation
  const baseBmr = 10 * weight + 6.25 * height - 5 * age;
  const bmrRaw = input.gender === 'male' ? baseBmr + 5 : baseBmr - 161;
  const bmrKcal = Math.round(bmrRaw);

  const multiplier = ACTIVITY_MULTIPLIERS[input.activityLevel] ?? 1.375;
  const tdeeKcal = Math.round(bmrKcal * multiplier);

  const weightDiff = Number((weight - target).toFixed(1));
  const weightToLoseKg = Math.max(0, weightDiff);

  // Safe deficit: 450 kcal for general/abdomen fat loss, 350 kcal for glutes/legs recomposition
  let safeDeficitKcal = 450;
  if (weightToLoseKg === 0) {
    safeDeficitKcal = 0;
  } else if (input.focusGoal === 'glutes_legs') {
    safeDeficitKcal = 350;
  } else if (weightToLoseKg > 12) {
    safeDeficitKcal = 550;
  }

  // Minimum safe floor (1250 kcal female, 1500 kcal male)
  const safetyFloor = input.gender === 'male' ? 1500 : 1250;
  const dailyCaloriesKcal =
    weightToLoseKg > 0
      ? Math.max(safetyFloor, tdeeKcal - safeDeficitKcal)
      : tdeeKcal;

  // Actual applied deficit after safety floor
  const effectiveDeficit = Math.max(0, tdeeKcal - dailyCaloriesKcal);

  // High protein for muscle preservation and satiety (1.8g - 2.0g per kg of target/lean weight)
  const referenceWeight = weightToLoseKg > 15 ? (weight + target) / 2 : weight;
  const proteinFactor = input.focusGoal === 'glutes_legs' ? 2.0 : 1.8;
  const dailyProteinGrams = Math.round(referenceWeight * proteinFactor);

  // Fats ~25% of total calories, remainder Carbs
  const dailyFatsGrams = Math.round((dailyCaloriesKcal * 0.25) / 9);
  const remainingKcal = Math.max(
    200,
    dailyCaloriesKcal - dailyProteinGrams * 4 - dailyFatsGrams * 9
  );
  const dailyCarbsGrams = Math.round(remainingKcal / 4);

  // Water: 35ml per kg divided into 250ml glasses (min 8 glasses)
  const dailyWaterGlasses = Math.max(8, Math.round((weight * 35) / 250));

  // Estimated weeks at ~0.5 - 0.7kg/week
  const weeklyLossKg = effectiveDeficit > 0 ? (effectiveDeficit * 7) / 7700 : 0.5;
  const estimatedWeeks =
    weightToLoseKg > 0 ? Math.max(1, Math.ceil(weightToLoseKg / Math.max(0.35, weeklyLossKg))) : 0;

  const heightMeters = height / 100;
  const bmi = Number((weight / (heightMeters * heightMeters)).toFixed(1));

  return {
    bmrKcal,
    tdeeKcal,
    safeDeficitKcal: effectiveDeficit,
    dailyCaloriesKcal,
    dailyProteinGrams,
    dailyCarbsGrams,
    dailyFatsGrams,
    dailyWaterGlasses,
    weightToLoseKg,
    estimatedWeeks,
    bmi,
  };
}

/**
 * Gera o plano alimentar diário adaptado à realidade e culinária de Moçambique
 * ajustando porções conforme a meta calórica e proteica do cliente.
 */
export function generateMozambicanMealPlan(
  metrics: CalculatedMetrics,
  focusGoal: FocusGoal
): MealItem[] {
  const totalKcal = metrics.dailyCaloriesKcal;
  const totalProtein = metrics.dailyProteinGrams;

  const breakfastKcal = Math.round(totalKcal * 0.25);
  const lunchKcal = Math.round(totalKcal * 0.35);
  const snackKcal = Math.round(totalKcal * 0.15);
  const dinnerKcal = totalKcal - breakfastKcal - lunchKcal - snackKcal;

  const breakfastProt = Math.round(totalProtein * 0.25);
  const lunchProt = Math.round(totalProtein * 0.35);
  const snackProt = Math.round(totalProtein * 0.15);
  const dinnerProt = totalProtein - breakfastProt - lunchProt - snackProt;

  return [
    {
      id: 'meal-breakfast',
      slot: 'Pequeno-almoço',
      time: '07:30',
      title:
        focusGoal === 'abdomen'
          ? 'Mandioca Cozida Moderada com Ovos Mexidos & Folhas de Couve'
          : 'Batata-doce Cozida com Ovos Escalfados & Chá de Capim-Limão',
      localIngredients: [
        '120g de batata-doce ou mandioca cozida com sal marinho',
        '3 ovos inteiros mexidos com tomate, cebola e cheiro-verde (1 fio de azeite/óleo)',
        '1 chávena de folhas de couve salteadas no vapor',
        'Chá natural de capim-limão (cymbopogon) ou gengibre sem açúcar',
      ],
      prepTip:
        'Substitui o pão branco da padaria pela batata-doce ou mandioca cozida: dá 3x mais saciedade e evita picos de insulina logo de manhã.',
      calories: breakfastKcal,
      proteinGrams: breakfastProt,
      carbsGrams: Math.round((breakfastKcal * 0.42) / 4),
      fatsGrams: Math.round((breakfastKcal * 0.28) / 9),
      costMznEstimate: 65,
      illustrationType: 'cassava_eggs',
    },
    {
      id: 'meal-lunch',
      slot: 'Almoço',
      time: '12:45',
      title: 'Peixe Carapau ou Pedra Grelhado com Feijão Nhemba & Couve à Moçambicana',
      localIngredients: [
        '180g de peixe fresco grelhado (carapau, peixe-pedra ou tilápia) com limão, alho e piri-piri opcional',
        '1 concha média (110g) de feijão nhemba cozido com tomate e cebola',
        'Porção controlada (90g) de xima de milho branco ou arroz integral/parboilizado',
        'Prato farto de folhas de abóbora (matapa leve sem óleo excessivo) ou salada de pepino',
      ],
      prepTip:
        'Cozinhe as folhas de abóbora ou couve com pouco amendoim pilado (1 colher de sopa) em vez de fritar com muito óleo vegetal.',
      calories: lunchKcal,
      proteinGrams: lunchProt,
      carbsGrams: Math.round((lunchKcal * 0.44) / 4),
      fatsGrams: Math.round((lunchKcal * 0.22) / 9),
      costMznEstimate: 140,
      illustrationType: 'fish_sweetpotato',
    },
    {
      id: 'meal-snack',
      slot: 'Lanche',
      time: '16:15',
      title: 'Amendoim Torrado Natural, Ovo Cozido & Papaia Madura',
      localIngredients: [
        '1 punhado pequeno (25g) de amendoim torrado na hora sem excesso de sal',
        '1 a 2 ovos cozidos ou 150ml de maheu caseiro leve sem açúcar refinado',
        '1 fatia média de papaia (mamão) ou ½ abacate pequeno',
      ],
      prepTip:
        'O amendoim é riquíssimo em gorduras boas e proteína, mas é calórico: meça sempre um punhado fechado (cerca de 25g).',
      calories: snackKcal,
      proteinGrams: snackProt,
      carbsGrams: Math.round((snackKcal * 0.35) / 4),
      fatsGrams: Math.round((snackKcal * 0.38) / 9),
      costMznEstimate: 45,
      illustrationType: 'peanuts_fruit',
    },
    {
      id: 'meal-dinner',
      slot: 'Jantar',
      time: '19:30',
      title:
        focusGoal === 'glutes_legs'
          ? 'Peito de Frango Grelhado Zambeziano Leve com Batata-doce & Legumes'
          : 'Frango Grelhado com Limão, Alho & Caldo Verde de Folhas de Abóbora',
      localIngredients: [
        '170g de peito ou coxa de frango sem pele grelhado na brasa ou frigideira antiaderente',
        '2 chávenas de folhas de abóbora, repolho e feijão verde salteados',
        focusGoal === 'glutes_legs'
          ? '100g de batata-doce assada com alecrim para recuperação muscular'
          : '80g de feijão nhemba em grão temperado com cebola roxa e limão',
      ],
      prepTip:
        'Jantar até às 20:00 melhora a qualidade do sono e acelera a queima de gordura visceral durante a noite.',
      calories: dinnerKcal,
      proteinGrams: dinnerProt,
      carbsGrams: Math.round((dinnerKcal * 0.3) / 4),
      fatsGrams: Math.round((dinnerKcal * 0.25) / 9),
      costMznEstimate: 120,
      illustrationType: 'chicken_nhemba',
    },
  ];
}

/**
 * Gera o treino funcional diário sem equipamento adaptado ao foco escolhido.
 */
export function generateHomeWorkoutPlan(focusGoal: FocusGoal): ExerciseItem[] {
  if (focusGoal === 'abdomen') {
    return [
      {
        id: 'ex-1',
        name: 'Polichinelos + Corrida Estacionária (Aquecimento)',
        sets: 3,
        repsOrDuration: '45 segundos',
        restSeconds: 15,
        targetArea: 'Cardio & Ativação Metabólica',
        cue: 'Mantenha o abdómen contraído e respire pelo nariz.',
        caloriesBurned: 45,
      },
      {
        id: 'ex-2',
        name: 'Agachamento Livre com Peso do Corpo',
        sets: 4,
        repsOrDuration: '15 repetições',
        restSeconds: 30,
        targetArea: 'Pernas, Glúteos & Gasto Calórico',
        cue: 'Desça como se fosse sentar numa cadeira, calcanhares firmes no chão.',
        caloriesBurned: 65,
      },
      {
        id: 'ex-3',
        name: 'Abdominal Bicicleta Controlado',
        sets: 4,
        repsOrDuration: '20 repetições alternadas',
        restSeconds: 25,
        targetArea: 'Oblíquos & Abdómen Inferior',
        cue: 'Não puxe o pescoço com as mãos; gire o tronco levando o cotovelo ao joelho oposto.',
        caloriesBurned: 40,
      },
      {
        id: 'ex-4',
        name: 'Prancha Isométrica Abdominal',
        sets: 3,
        repsOrDuration: '40 segundos',
        restSeconds: 30,
        targetArea: 'Core Profundo (Cinta Natural)',
        cue: 'Corpo em linha reta dos ombros aos tornozelos, sem deixar a lombar cair.',
        caloriesBurned: 35,
      },
      {
        id: 'ex-5',
        name: 'Escalador Dinâmico (Mountain Climbers)',
        sets: 3,
        repsOrDuration: '35 segundos',
        restSeconds: 25,
        targetArea: 'Secar Barriga & HIIT Finalizador',
        cue: 'Mãos firmes abaixo dos ombros, puxe os joelhos rápido em direção ao peito.',
        caloriesBurned: 55,
      },
    ];
  }

  if (focusGoal === 'glutes_legs') {
    return [
      {
        id: 'ex-1',
        name: 'Agachamento Sumo com Pausa de 2s em Baixo',
        sets: 4,
        repsOrDuration: '15 repetições',
        restSeconds: 35,
        targetArea: 'Glúteos & Interior da Coxa',
        cue: 'Pés afastados além da largura dos ombros, pontas levemente para fora.',
        caloriesBurned: 65,
      },
      {
        id: 'ex-2',
        name: 'Passadas Alternadas (Afundo / Lunges)',
        sets: 4,
        repsOrDuration: '12 repetições por perna',
        restSeconds: 40,
        targetArea: 'Glúteo Máximo & Quadríceps',
        cue: 'Dê um passo firme à frente, tronco levemente inclinado e coluna neutra.',
        caloriesBurned: 70,
      },
      {
        id: 'ex-3',
        name: 'Elevação Pélvica no Chão (Ponte de Glúteos)',
        sets: 4,
        repsOrDuration: '20 repetições (contrair 2s no topo)',
        restSeconds: 25,
        targetArea: 'Tonificação de Glúteos & Posterior',
        cue: 'Empurre o chão com os calcanhares e contraia forte o glúteo no topo.',
        caloriesBurned: 50,
      },
      {
        id: 'ex-4',
        name: 'Agachamento Búlgaro com Apoio no Sofá/Cadeira',
        sets: 3,
        repsOrDuration: '10 repetições por perna',
        restSeconds: 40,
        targetArea: 'Definição Profunda de Pernas',
        cue: 'Apoie o peito do pé de trás numa cadeira e concentre a força no calcanhar da frente.',
        caloriesBurned: 60,
      },
      {
        id: 'ex-5',
        name: 'Prancha Abdominal + Coice de Glúteo',
        sets: 3,
        repsOrDuration: '15 repetições por lado',
        restSeconds: 25,
        targetArea: 'Core & Glúteo Médio',
        cue: 'Mantenha o abdómen firme para proteger a coluna lombar.',
        caloriesBurned: 40,
      },
    ];
  }

  return [
    {
      id: 'ex-1',
      name: 'Marcha Atlética + Polichinelos sem Impacto',
      sets: 3,
      repsOrDuration: '50 segundos',
      restSeconds: 15,
      targetArea: 'Cardio Geral & Mobilidade',
      cue: 'Ritmo constante para elevar os batimentos cardíacos com segurança.',
      caloriesBurned: 45,
    },
    {
      id: 'ex-2',
      name: 'Agachamento + Elevação de Joelhos',
      sets: 4,
      repsOrDuration: '15 repetições',
      restSeconds: 30,
      targetArea: 'Corpo Inteiro & Queima Calórica',
      cue: 'Agache com controlo e, ao subir, eleve um joelho em direção ao peito.',
      caloriesBurned: 65,
    },
    {
      id: 'ex-3',
      name: 'Flexão de Braços Adaptada + Toque no Ombro',
      sets: 3,
      repsOrDuration: '12 repetições',
      restSeconds: 30,
      targetArea: 'Braços, Peito & Postura',
      cue: 'Pode apoiar os joelhos no tapete ou capulana dobrada se necessário.',
      caloriesBurned: 45,
    },
    {
      id: 'ex-4',
      name: 'Passadas Atrás Alternadas (Reverse Lunges)',
      sets: 3,
      repsOrDuration: '12 repetições por perna',
      restSeconds: 30,
      targetArea: 'Pernas & Equilíbrio',
      cue: 'Dar o passo para trás reduz a pressão nos joelhos e ativa mais os glúteos.',
      caloriesBurned: 55,
    },
    {
      id: 'ex-5',
      name: 'Prancha Isométrica + Abdominal Supra',
      sets: 3,
      repsOrDuration: '35s prancha + 15 abdominais',
      restSeconds: 30,
      targetArea: 'Abdómen & Estabilidade Lombar',
      cue: 'Solte todo o ar pela boca ao subir no abdominal.',
      caloriesBurned: 45,
    },
  ];
}

export interface ScannedMealResult {
  id: string;
  dishName: string;
  identifiedFoods: string[];
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  weightLossTip: string;
  imageDataUrl: string;
  compressedSizeKb: number;
  scannedAt: string;
}

/**
 * Calcula o tamanho em bytes de uma string Data URL ou Base64.
 */
export function getBase64SizeBytes(dataUrlOrBase64: string): number {
  const base64 = dataUrlOrBase64.includes(',')
    ? dataUrlOrBase64.split(',')[1] || ''
    : dataUrlOrBase64;
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

/**
 * Normaliza e garante valores seguros para o resultado nutricional do Gemini.
 */
export function normalizeScannedMealResult(
  raw: Partial<ScannedMealResult>,
  imageDataUrl: string
): ScannedMealResult {
  const sizeBytes = getBase64SizeBytes(imageDataUrl);
  const compressedSizeKb = Math.max(1, Math.round((sizeBytes / 1024) * 10) / 10);

  return {
    id: raw.id || `scan-${Date.now()}`,
    dishName: raw.dishName?.trim() || 'Prato Moçambicano Grelhado & Equilibrado',
    identifiedFoods:
      Array.isArray(raw.identifiedFoods) && raw.identifiedFoods.length > 0
        ? raw.identifiedFoods
        : [
            'Peixe Carapau Grelhado (160g)',
            'Xima de Milho Controlada (90g)',
            'Feijão Nhemba Cozido (80g)',
            'Folhas de Abóbora / Matapa Leve (100g)',
          ],
    calories: Math.max(50, Math.min(2500, Math.round(Number(raw.calories) || 485))),
    proteinGrams: Math.max(2, Math.min(200, Math.round(Number(raw.proteinGrams) || 38))),
    carbsGrams: Math.max(2, Math.min(300, Math.round(Number(raw.carbsGrams) || 46))),
    fatsGrams: Math.max(1, Math.min(150, Math.round(Number(raw.fatsGrams) || 14))),
    weightLossTip:
      raw.weightLossTip?.trim() ||
      'Excelente combinação de proteína magra do peixe com fibras do feijão nhemba! Para acelerar o emagrecimento, começa sempre por comer as folhas verdes antes da xima.',
    imageDataUrl,
    compressedSizeKb,
    scannedAt:
      raw.scannedAt ||
      new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' }),
  };
}

/**
 * Calcula o total diário consumido somando as refeições do plano marcadas
 * e as refeições extras escaneadas por foto.
 */
export function calculateDailyConsumedTotals(
  meals: MealItem[],
  completedMealIds: string[],
  scannedMeals: ScannedMealResult[]
): {
  totalCalories: number;
  totalProteinGrams: number;
  totalCarbsGrams: number;
  totalFatsGrams: number;
} {
  const checkedMeals = meals.filter((m) => completedMealIds.includes(m.id));
  const planCalories = checkedMeals.reduce((sum, m) => sum + m.calories, 0);
  const planProtein = checkedMeals.reduce((sum, m) => sum + m.proteinGrams, 0);
  const planCarbs = checkedMeals.reduce((sum, m) => sum + m.carbsGrams, 0);
  const planFats = checkedMeals.reduce((sum, m) => sum + m.fatsGrams, 0);

  const scanCalories = scannedMeals.reduce((sum, s) => sum + s.calories, 0);
  const scanProtein = scannedMeals.reduce((sum, s) => sum + s.proteinGrams, 0);
  const scanCarbs = scannedMeals.reduce((sum, s) => sum + s.carbsGrams, 0);
  const scanFats = scannedMeals.reduce((sum, s) => sum + s.fatsGrams, 0);

  return {
    totalCalories: planCalories + scanCalories,
    totalProteinGrams: planProtein + scanProtein,
    totalCarbsGrams: planCarbs + scanCarbs,
    totalFatsGrams: planFats + scanFats,
  };
}

/**
 * Verifica se o acesso do cliente está bloqueado por mensalidade suspensa ou expirada.
 */
export function isSubscriptionLocked(status: SubscriptionStatus): boolean {
  return status === 'suspended' || status === 'expired';
}

/**
 * Formata valor monetário em Meticais (MZN).
 */
export function formatMzn(amount: number): string {
  return `${Math.round(amount).toLocaleString('pt-MZ')} MZN`;
}

export interface WeightLogEntry {
  weekLabel: string;
  date: string;
  weightKg: number;
  targetWeightKg: number;
  note?: string;
}

export interface WeightProgressSummary {
  startWeightKg: number;
  currentWeightKg: number;
  targetWeightKg: number;
  totalLostKg: number;
  remainingToGoalKg: number;
  averageWeeklyLossKg: number;
  progressPercentage: number;
  weeksTracked: number;
}

/**
 * Gera ou sincroniza a série histórica de pesagens semanais do utilizador.
 */
export function buildWeightHistorySeries(
  entries: WeightLogEntry[] | undefined,
  currentWeightKg: number,
  targetWeightKg: number
): WeightLogEntry[] {
  const safeCurrent = Math.max(35, Math.min(250, Number(currentWeightKg) || 75));
  const safeTarget = Math.max(35, Math.min(250, Number(targetWeightKg) || 65));

  if (!entries || entries.length === 0) {
    const defaultOffsets = [3.8, 3.0, 2.3, 1.5, 0.8, 0];
    const defaultDates = ['21 Set', '28 Set', '05 Out', '12 Out', '19 Out', '26 Out'];
    return defaultOffsets.map((offset, idx) => ({
      weekLabel: `Sem ${idx + 1}`,
      date: defaultDates[idx],
      weightKg: Number((safeCurrent + offset).toFixed(1)),
      targetWeightKg: safeTarget,
    }));
  }

  return entries.map((entry, idx) => ({
    ...entry,
    weekLabel: entry.weekLabel || `Sem ${idx + 1}`,
    weightKg: Number(Number(entry.weightKg).toFixed(1)),
    targetWeightKg: safeTarget,
  }));
}

/**
 * Calcula estatísticas de evolução da perda de peso com base no histórico de pesagens.
 */
export function calculateWeightProgressSummary(
  entries: WeightLogEntry[],
  targetWeightKg: number
): WeightProgressSummary {
  const safeTarget = Math.max(35, Math.min(250, Number(targetWeightKg) || 65));
  if (!entries || entries.length === 0) {
    return {
      startWeightKg: safeTarget,
      currentWeightKg: safeTarget,
      targetWeightKg: safeTarget,
      totalLostKg: 0,
      remainingToGoalKg: 0,
      averageWeeklyLossKg: 0,
      progressPercentage: 100,
      weeksTracked: 0,
    };
  }

  const startWeightKg = Number(entries[0].weightKg.toFixed(1));
  const currentWeightKg = Number(entries[entries.length - 1].weightKg.toFixed(1));
  const totalLostKg = Number((startWeightKg - currentWeightKg).toFixed(1));
  const remainingToGoalKg = Math.max(
    0,
    Number((currentWeightKg - safeTarget).toFixed(1))
  );

  const intervals = Math.max(1, entries.length - 1);
  const averageWeeklyLossKg = Number((totalLostKg / intervals).toFixed(2));

  const totalGoalDelta = Math.max(0.1, startWeightKg - safeTarget);
  const rawPct =
    startWeightKg > safeTarget
      ? Math.round(((startWeightKg - currentWeightKg) / totalGoalDelta) * 100)
      : 100;
  const progressPercentage = Math.max(0, Math.min(100, rawPct));

  return {
    startWeightKg,
    currentWeightKg,
    targetWeightKg: safeTarget,
    totalLostKg,
    remainingToGoalKg,
    averageWeeklyLossKg,
    progressPercentage,
    weeksTracked: entries.length,
  };
}

/**
 * Adiciona uma nova pesagem semanal ao histórico do utilizador.
 */
export function appendWeightLogEntry(
  entries: WeightLogEntry[],
  newWeightKg: number,
  targetWeightKg: number,
  dateLabel?: string,
  note?: string
): WeightLogEntry[] {
  const numericWeight = Number(newWeightKg);
  if (!Number.isFinite(numericWeight) || numericWeight < 35 || numericWeight > 250) {
    return entries;
  }

  const safeWeight = Number(numericWeight.toFixed(1));
  const safeTarget = Math.max(35, Math.min(250, Number(targetWeightKg) || 65));
  const nextWeekNumber = entries.length + 1;
  const formattedDate =
    dateLabel?.trim() ||
    new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' });

  const newEntry: WeightLogEntry = {
    weekLabel: `Sem ${nextWeekNumber}`,
    date: formattedDate,
    weightKg: safeWeight,
    targetWeightKg: safeTarget,
    note: note?.trim() || undefined,
  };

  return [
    ...entries.map((item) => ({ ...item, targetWeightKg: safeTarget })),
    newEntry,
  ];
}

