import { db } from './index.ts';
import {
  users,
  profiles,
  expenses,
  income,
  goals,
  emergencyFunds,
  investmentProfiles,
  moneyLeaks,
  aiAnalysisHistory,
  userSettings,
  reports
} from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';

// Two-layer Error Handling wrapper
async function runQuery<T>(queryDescription: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`Database query failed [${queryDescription}]:`, error);
    throw new Error(`Database operation failed: ${queryDescription}`, { cause: error });
  }
}

// User & Profile Queries
export async function syncUserSession(uid: string, email: string) {
  return runQuery('syncUserSession', async () => {
    // 1. Get or create user
    let userResult = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    let user = userResult[0];
    
    if (!user) {
      const inserted = await db.insert(users).values({ uid, email }).returning();
      user = inserted[0];
    } else if (user.email !== email) {
      const updated = await db.update(users).set({ email }).where(eq(users.id, user.id)).returning();
      user = updated[0];
    }

    // 2. Ensure Profile exists
    let profileResult = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    if (!profileResult[0]) {
      await db.insert(profiles).values({
        userId: user.id,
        displayName: email.split('@')[0],
        currency: '₹'
      }).onConflictDoNothing();
    }

    // 3. Ensure User Settings exist
    let settingsResult = await db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1);
    if (!settingsResult[0]) {
      await db.insert(userSettings).values({
        userId: user.id,
        lang: 'en',
        theme: 'dark'
      }).onConflictDoNothing();
    }

    // 4. Ensure Emergency Fund exists
    let fundResult = await db.select().from(emergencyFunds).where(eq(emergencyFunds.userId, user.id)).limit(1);
    if (!fundResult[0]) {
      await db.insert(emergencyFunds).values({
        userId: user.id,
        monthlyExpenses: 25000, // Default base
        currentAmount: 0,
        multiplier: 6,
        jobType: 'salaried',
        monthlyAddition: 2000
      }).onConflictDoNothing();
    }

    return user;
  });
}

export async function getUserProfile(userId: number) {
  return runQuery('getUserProfile', async () => {
    const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    return result[0] || null;
  });
}

export async function updateUserProfile(userId: number, data: { displayName?: string; currency?: string; avatarUrl?: string }) {
  return runQuery('updateUserProfile', async () => {
    const result = await db.update(profiles)
      .set(data)
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  });
}

export async function getUserSettings(userId: number) {
  return runQuery('getUserSettings', async () => {
    const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
    return result[0] || null;
  });
}

export async function updateUserSettings(userId: number, lang: string, theme: string) {
  return runQuery('updateUserSettings', async () => {
    const result = await db.update(userSettings)
      .set({ lang, theme })
      .where(eq(userSettings.userId, userId))
      .returning();
    return result[0];
  });
}

// Expenses Queries
export async function getExpenses(userId: number) {
  return runQuery('getExpenses', async () => {
    return await db.select().from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.date), desc(expenses.createdAt));
  });
}

export async function addExpense(userId: number, data: { amount: number; category: string; note?: string; date: string; time?: string }) {
  return runQuery('addExpense', async () => {
    const result = await db.insert(expenses).values({
      userId,
      amount: data.amount,
      category: data.category,
      note: data.note || '',
      date: data.date,
      time: data.time || '12:00'
    }).returning();
    return result[0];
  });
}

export async function updateExpense(userId: number, id: number, data: { amount?: number; category?: string; note?: string; date?: string; time?: string }) {
  return runQuery('updateExpense', async () => {
    const result = await db.update(expenses)
      .set(data)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return result[0];
  });
}

export async function deleteExpense(userId: number, id: number) {
  return runQuery('deleteExpense', async () => {
    const result = await db.delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return result[0];
  });
}

// Income Queries
export async function getIncome(userId: number) {
  return runQuery('getIncome', async () => {
    return await db.select().from(income)
      .where(eq(income.userId, userId))
      .orderBy(desc(income.date));
  });
}

export async function addIncome(userId: number, data: { amount: number; sourceType: string; note?: string; date: string }) {
  return runQuery('addIncome', async () => {
    const result = await db.insert(income).values({
      userId,
      amount: data.amount,
      sourceType: data.sourceType,
      note: data.note || '',
      date: data.date
    }).returning();
    return result[0];
  });
}

export async function updateIncome(userId: number, id: number, data: { amount?: number; sourceType?: string; note?: string; date?: string }) {
  return runQuery('updateIncome', async () => {
    const result = await db.update(income)
      .set(data)
      .where(and(eq(income.id, id), eq(income.userId, userId)))
      .returning();
    return result[0];
  });
}

export async function deleteIncome(userId: number, id: number) {
  return runQuery('deleteIncome', async () => {
    const result = await db.delete(income)
      .where(and(eq(income.id, id), eq(income.userId, userId)))
      .returning();
    return result[0];
  });
}

// Goals Queries
export async function getGoals(userId: number) {
  return runQuery('getGoals', async () => {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  });
}

export async function addGoal(userId: number, data: { name: string; targetAmount: number; savedAmount?: number; category: string; targetDate?: string }) {
  return runQuery('addGoal', async () => {
    const result = await db.insert(goals).values({
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      savedAmount: data.savedAmount || 0,
      category: data.category,
      targetDate: data.targetDate
    }).returning();
    return result[0];
  });
}

export async function updateGoal(userId: number, id: number, data: { name?: string; targetAmount?: number; savedAmount?: number; category?: string; targetDate?: string; aiMonthsNeeded?: number; aiMonthlySaving?: number; aiMotivation?: string }) {
  return runQuery('updateGoal', async () => {
    const result = await db.update(goals)
      .set(data)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return result[0];
  });
}

export async function deleteGoal(userId: number, id: number) {
  return runQuery('deleteGoal', async () => {
    const result = await db.delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return result[0];
  });
}

// Emergency Fund Queries
export async function getEmergencyFund(userId: number) {
  return runQuery('getEmergencyFund', async () => {
    const result = await db.select().from(emergencyFunds).where(eq(emergencyFunds.userId, userId)).limit(1);
    return result[0] || null;
  });
}

export async function updateEmergencyFund(userId: number, data: { monthlyExpenses?: number; currentAmount?: number; multiplier?: number; jobType?: string; monthlyAddition?: number }) {
  return runQuery('updateEmergencyFund', async () => {
    const result = await db.update(emergencyFunds)
      .set(data)
      .where(eq(emergencyFunds.userId, userId))
      .returning();
    return result[0];
  });
}

// Investment Profile Queries
export async function getInvestmentProfile(userId: number) {
  return runQuery('getInvestmentProfile', async () => {
    const result = await db.select().from(investmentProfiles).where(eq(investmentProfiles.userId, userId)).limit(1);
    return result[0] || null;
  });
}

export async function updateInvestmentProfile(userId: number, data: { age: number; riskLevel: string; liquidSavings?: number }) {
  return runQuery('updateInvestmentProfile', async () => {
    // Upsert
    const existing = await db.select().from(investmentProfiles).where(eq(investmentProfiles.userId, userId)).limit(1);
    if (existing[0]) {
      const result = await db.update(investmentProfiles)
        .set(data)
        .where(eq(investmentProfiles.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(investmentProfiles)
        .values({ userId, ...data })
        .returning();
      return result[0];
    }
  });
}

// Money Leaks Queries
export async function getMoneyLeaks(userId: number) {
  return runQuery('getMoneyLeaks', async () => {
    return await db.select().from(moneyLeaks).where(eq(moneyLeaks.userId, userId));
  });
}

export async function addMoneyLeak(userId: number, data: { title: string; category: string; monthlyAvg: number; annualPotential: number; severity: string }) {
  return runQuery('addMoneyLeak', async () => {
    const result = await db.insert(moneyLeaks).values({
      userId,
      title: data.title,
      category: data.category,
      monthlyAvg: data.monthlyAvg,
      annualPotential: data.annualPotential,
      severity: data.severity,
      acknowledged: false
    }).returning();
    return result[0];
  });
}

export async function acknowledgeLeak(userId: number, id: number) {
  return runQuery('acknowledgeLeak', async () => {
    const result = await db.update(moneyLeaks)
      .set({ acknowledged: true })
      .where(and(eq(moneyLeaks.id, id), eq(moneyLeaks.userId, userId)))
      .returning();
    return result[0];
  });
}

// AI Analysis History
export async function getAIAnalysisHistory(userId: number) {
  return runQuery('getAIAnalysisHistory', async () => {
    return await db.select().from(aiAnalysisHistory)
      .where(eq(aiAnalysisHistory.userId, userId))
      .orderBy(desc(aiAnalysisHistory.createdAt));
  });
}

export async function addAIAnalysis(userId: number, month: string, insights: string, savingsRate: number) {
  return runQuery('addAIAnalysis', async () => {
    const result = await db.insert(aiAnalysisHistory).values({
      userId,
      month,
      insights,
      savingsRate
    }).returning();
    return result[0];
  });
}
