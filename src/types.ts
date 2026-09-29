export interface User {
  id: number;
  uid: string;
  email: string;
  createdAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  displayName: string;
  currency: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserSettings {
  id: number;
  userId: number;
  lang: string;
  theme: string;
  createdAt: string;
}

export interface Expense {
  id: number;
  userId: number;
  amount: number;
  category: string;
  note?: string;
  date: string;
  time?: string;
  createdAt: string;
}

export interface Income {
  id: number;
  userId: number;
  amount: number;
  sourceType: string;
  note?: string;
  date: string;
  createdAt: string;
}

export interface Goal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  savedAmount: number;
  category: string;
  targetDate?: string;
  aiMonthsNeeded?: number;
  aiMonthlySaving?: number;
  aiMotivation?: string;
  createdAt: string;
}

export interface EmergencyFund {
  id: number;
  userId: number;
  monthlyExpenses: number;
  currentAmount: number;
  multiplier: number;
  jobType: string;
  monthlyAddition: number;
  createdAt: string;
}

export interface InvestmentProfile {
  id: number;
  userId: number;
  age: number;
  riskLevel: string;
  liquidSavings?: number;
  createdAt: string;
}

export interface MoneyLeak {
  id: number;
  userId: number;
  title: string;
  category: string;
  monthlyAvg: number;
  annualPotential: number;
  severity: string;
  acknowledged: boolean;
  createdAt: string;
}

export interface AIAnalysis {
  healthScore: number;
  bentoInsights: {
    title: string;
    type: 'success' | 'warning' | 'info';
    text: string;
    impact: string;
  }[];
  diagnostics: string;
  expenseDistributionSummary: string;
}
