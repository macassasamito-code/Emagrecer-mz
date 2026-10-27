import {
  ActivityLevel,
  FocusGoal,
  Gender,
  SubscriptionStatus,
  WeightLogEntry,
} from '../utils/nutrition';

export interface ClientAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  registeredAt: string;
  subscriptionStatus: SubscriptionStatus;
  paymentMethod: 'M-Pesa' | 'e-Mola';
  monthlyFeeMzn: number;
  lastPaymentRef: string;
  nextBillingDate: string;
  age: number;
  gender: Gender;
  currentWeightKg: number;
  heightCm: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  focusGoal: FocusGoal;
  weightHistory?: WeightLogEntry[];
}

export interface TribeComment {
  id: string;
  author: string;
  text: string;
  timeAgo: string;
}

export interface TribePost {
  id: string;
  authorName: string;
  authorCity: string;
  authorInitials: string;
  timeAgo: string;
  category: 'prato_saudavel' | 'pesagem_semanal' | 'treino_concluido' | 'motivacao';
  content: string;
  dishTitle?: string;
  dishCalories?: number;
  weightDeltaKg?: string;
  illustrationVariant: 'fish_plate' | 'cassava_bowl' | 'workout_mat' | 'none';
  reactions: {
    clap: number;
    fire: number;
    heart: number;
  };
  userReacted: {
    clap?: boolean;
    fire?: boolean;
    heart?: boolean;
  };
  comments: TribeComment[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
}

export const INITIAL_CLIENTS: ClientAccount[] = [
  {
    id: 'usr-1',
    name: 'Neyma Mondlane',
    email: 'neyma.mondlane@corpofit.co.mz',
    phone: '+258 84 382 9104',
    city: 'Maputo (Polana)',
    registeredAt: '2026-09-14',
    subscriptionStatus: 'active',
    paymentMethod: 'M-Pesa',
    monthlyFeeMzn: 450,
    lastPaymentRef: 'MP261014.992A',
    nextBillingDate: '2026-11-14',
    age: 29,
    gender: 'female',
    currentWeightKg: 76.5,
    heightCm: 165,
    targetWeightKg: 66.0,
    activityLevel: 'moderate',
    focusGoal: 'abdomen',
    weightHistory: [
      { weekLabel: 'Sem 1', date: '14 Set', weightKg: 80.8, targetWeightKg: 66.0, note: 'Início do protocolo' },
      { weekLabel: 'Sem 2', date: '21 Set', weightKg: 79.9, targetWeightKg: 66.0, note: 'Troca do pão por mandioca' },
      { weekLabel: 'Sem 3', date: '28 Set', weightKg: 79.1, targetWeightKg: 66.0, note: 'Mais água e chá de capim-limão' },
      { weekLabel: 'Sem 4', date: '05 Out', weightKg: 78.2, targetWeightKg: 66.0, note: '4 treinos em casa concluídos' },
      { weekLabel: 'Sem 5', date: '12 Out', weightKg: 77.3, targetWeightKg: 66.0, note: 'Redução de cintura visível' },
      { weekLabel: 'Sem 6', date: '19 Out', weightKg: 76.5, targetWeightKg: 66.0, note: 'Pesagem atual em jejum' },
    ],
  },
  {
    id: 'usr-2',
    name: 'Samito Macassa',
    email: 'macassasamito@gmail.com',
    phone: '+258 86 714 5520',
    city: 'Matola (Machava)',
    registeredAt: '2026-09-20',
    subscriptionStatus: 'active',
    paymentMethod: 'e-Mola',
    monthlyFeeMzn: 450,
    lastPaymentRef: 'EM261020.441B',
    nextBillingDate: '2026-11-20',
    age: 32,
    gender: 'male',
    currentWeightKg: 86.0,
    heightCm: 176,
    targetWeightKg: 77.0,
    activityLevel: 'moderate',
    focusGoal: 'general',
    weightHistory: [
      { weekLabel: 'Sem 1', date: '20 Set', weightKg: 89.6, targetWeightKg: 77.0 },
      { weekLabel: 'Sem 2', date: '27 Set', weightKg: 88.8, targetWeightKg: 77.0 },
      { weekLabel: 'Sem 3', date: '04 Out', weightKg: 87.9, targetWeightKg: 77.0 },
      { weekLabel: 'Sem 4', date: '11 Out', weightKg: 87.1, targetWeightKg: 77.0 },
      { weekLabel: 'Sem 5', date: '18 Out', weightKg: 86.0, targetWeightKg: 77.0 },
    ],
  },
  {
    id: 'usr-3',
    name: 'Zenaida Cossa',
    email: 'zenaida.cossa@gmail.com',
    phone: '+258 84 910 2231',
    city: 'Beira (Ponta Gêa)',
    registeredAt: '2026-08-05',
    subscriptionStatus: 'suspended',
    paymentMethod: 'M-Pesa',
    monthlyFeeMzn: 450,
    lastPaymentRef: 'MP260905.118C',
    nextBillingDate: '2026-10-05',
    age: 35,
    gender: 'female',
    currentWeightKg: 82.0,
    heightCm: 162,
    targetWeightKg: 70.0,
    activityLevel: 'light',
    focusGoal: 'abdomen',
  },
  {
    id: 'usr-4',
    name: 'Edson Bila',
    email: 'edson.bila@outlook.com',
    phone: '+258 87 402 8819',
    city: 'Nampula',
    registeredAt: '2026-10-02',
    subscriptionStatus: 'pending',
    paymentMethod: 'e-Mola',
    monthlyFeeMzn: 450,
    lastPaymentRef: 'EM261002.773D',
    nextBillingDate: '2026-11-02',
    age: 27,
    gender: 'male',
    currentWeightKg: 91.0,
    heightCm: 180,
    targetWeightKg: 81.0,
    activityLevel: 'light',
    focusGoal: 'general',
  },
  {
    id: 'usr-5',
    name: 'Sheila Muianga',
    email: 'sheila.muianga@yahoo.com',
    phone: '+258 85 619 3042',
    city: 'Maputo (Sommerschield)',
    registeredAt: '2026-07-19',
    subscriptionStatus: 'active',
    paymentMethod: 'M-Pesa',
    monthlyFeeMzn: 450,
    lastPaymentRef: 'MP261019.650E',
    nextBillingDate: '2026-11-19',
    age: 26,
    gender: 'female',
    currentWeightKg: 68.0,
    heightCm: 168,
    targetWeightKg: 62.0,
    activityLevel: 'active',
    focusGoal: 'glutes_legs',
  },
  {
    id: 'usr-6',
    name: 'Dércio Nhantumbo',
    email: 'dercio.nhantumbo@gmail.com',
    phone: '+258 84 205 7190',
    city: 'Xai-Xai',
    registeredAt: '2026-08-11',
    subscriptionStatus: 'expired',
    paymentMethod: 'M-Pesa',
    monthlyFeeMzn: 450,
    lastPaymentRef: 'MP260811.309F',
    nextBillingDate: '2026-09-11',
    age: 38,
    gender: 'male',
    currentWeightKg: 94.5,
    heightCm: 174,
    targetWeightKg: 82.0,
    activityLevel: 'sedentary',
    focusGoal: 'abdomen',
  },
];

export const INITIAL_TRIBE_POSTS: TribePost[] = [
  {
    id: 'post-1',
    authorName: 'Sheila Muianga',
    authorCity: 'Maputo · Sommerschield',
    authorInitials: 'SM',
    timeAgo: 'Há 2 horas',
    category: 'prato_saudavel',
    content:
      'Almoço de hoje preparado em 20 minutos: carapau grelhado com limão, feijão nhemba cozido e couve salteada no vapor sem exagerar no óleo. Saciedade total e dentro da minha meta!',
    dishTitle: 'Carapau Grelhado + Feijão Nhemba & Couve',
    dishCalories: 510,
    illustrationVariant: 'fish_plate',
    reactions: {
      clap: 24,
      fire: 19,
      heart: 31,
    },
    userReacted: {},
    comments: [
      {
        id: 'c-1',
        author: 'Neyma Mondlane',
        text: 'Que prato lindo mana! O feijão nhemba segura mesmo a fome toda a tarde.',
        timeAgo: 'Há 1 hora',
      },
      {
        id: 'c-2',
        author: 'Coach Amina IA',
        text: 'Excelente equilíbrio de proteína magra e fibras locais, Sheila! 38g de proteína nesse prato.',
        timeAgo: 'Há 45 min',
      },
    ],
  },
  {
    id: 'post-2',
    authorName: 'Samito Macassa',
    authorCity: 'Matola · Machava',
    authorInitials: 'SM',
    timeAgo: 'Há 5 horas',
    category: 'pesagem_semanal',
    content:
      'Pesagem da 3ª semana concluída! Troquei o pão branco da manhã por batata-doce cozida com ovos e cortei o refrigerante ao almoço. Menos 2,4 kg na balança e a cintura já desinchou.',
    weightDeltaKg: '-2,4 kg em 21 dias',
    illustrationVariant: 'cassava_bowl',
    reactions: {
      clap: 42,
      fire: 35,
      heart: 28,
    },
    userReacted: {},
    comments: [
      {
        id: 'c-3',
        author: 'Edson Bila',
        text: 'Força irmão! Também comecei a substituir o pão por mandioca cozida e faz muita diferença.',
        timeAgo: 'Há 3 horas',
      },
    ],
  },
  {
    id: 'post-3',
    authorName: 'Neyma Mondlane',
    authorCity: 'Maputo · Polana',
    authorInitials: 'NM',
    timeAgo: 'Ontem às 18:40',
    category: 'treino_concluido',
    content:
      'Treino funcional na sala de casa concluído antes do jantar! 4 séries de agachamentos, passadas e prancha abdominal sem precisar de ginásio. Quem mais já treinou hoje?',
    dishTitle: 'Circuito Secar Barriga · 25 min',
    dishCalories: 240,
    illustrationVariant: 'workout_mat',
    reactions: {
      clap: 18,
      fire: 27,
      heart: 22,
    },
    userReacted: {},
    comments: [],
  },
];

export const INITIAL_COACH_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'coach',
    text: 'Olá! Sou a Coach Amina, a tua nutricionista e personal trainer digital no CorpoFit MZ. Já analisei as tuas metas calóricas e o teu foco corporal. Podes perguntar-me como substituir alimentos locais (ex: pão, xima, matapa), ideias de lanches rápidos ou como ajustar a postura nos exercícios em casa!',
    timestamp: 'Agora',
  },
];
