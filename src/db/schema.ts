import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, doublePrecision } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  currency: text('currency').default('₹'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  amount: doublePrecision('amount').notNull(),
  category: text('category').notNull(), // Food, Transport, Rent, Entertainment, Subscriptions, Healthcare, Shopping, Other
  note: text('note'),
  date: text('date').notNull(), // YYYY-MM-DD
  time: text('time'), // HH:MM
  createdAt: timestamp('created_at').defaultNow(),
});

export const income = pgTable('income', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  amount: doublePrecision('amount').notNull(),
  sourceType: text('source_type').notNull(), // Salary, Freelance, Business, Other
  note: text('note'),
  date: text('date').notNull(), // YYYY-MM-DD
  createdAt: timestamp('created_at').defaultNow(),
});

export const goals = pgTable('goals', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  targetAmount: doublePrecision('target_amount').notNull(),
  savedAmount: doublePrecision('saved_amount').default(0.0),
  category: text('category').notNull(), // Saving, Asset, Event
  targetDate: text('target_date'), // YYYY-MM-DD
  aiMonthsNeeded: integer('ai_months_needed'),
  aiMonthlySaving: doublePrecision('ai_monthly_saving'),
  aiMotivation: text('ai_motivation'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emergencyFunds = pgTable('emergency_funds', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  monthlyExpenses: doublePrecision('monthly_expenses').notNull(),
  currentAmount: doublePrecision('current_amount').default(0.0),
  multiplier: integer('multiplier').default(6),
  jobType: text('job_type').default('salaried'),
  monthlyAddition: doublePrecision('monthly_addition').default(500.0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const investmentProfiles = pgTable('investment_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  age: integer('age').notNull(),
  riskLevel: text('risk_level').notNull(), // Low, Medium, High
  liquidSavings: doublePrecision('liquid_savings'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const moneyLeaks = pgTable('money_leaks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  monthlyAvg: doublePrecision('monthly_avg').notNull(),
  annualPotential: doublePrecision('annual_potential').notNull(),
  severity: text('severity').notNull(), // High, Medium, Low
  acknowledged: boolean('acknowledged').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const aiAnalysisHistory = pgTable('ai_analysis_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  month: text('month').notNull(), // YYYY-MM
  insights: text('insights').notNull(), // JSON or formatted text
  savingsRate: integer('savings_rate'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const userSettings = pgTable('user_settings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  lang: text('lang').default('en'), // en, ta
  theme: text('theme').default('dark'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  month: text('month').notNull(), // YYYY-MM
  summary: text('summary'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  expenses: many(expenses),
  income: many(income),
  goals: many(goals),
  emergencyFund: one(emergencyFunds, { fields: [users.id], references: [emergencyFunds.userId] }),
  investmentProfile: one(investmentProfiles, { fields: [users.id], references: [investmentProfiles.userId] }),
  moneyLeaks: many(moneyLeaks),
  aiAnalysisHistory: many(aiAnalysisHistory),
  userSettings: one(userSettings, { fields: [users.id], references: [userSettings.userId] }),
  reports: many(reports),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, { fields: [expenses.userId], references: [users.id] }),
}));

export const incomeRelations = relations(income, ({ one }) => ({
  user: one(users, { fields: [income.userId], references: [users.id] }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
}));

export const moneyLeaksRelations = relations(moneyLeaks, ({ one }) => ({
  user: one(users, { fields: [moneyLeaks.userId], references: [users.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  user: one(users, { fields: [reports.userId], references: [users.id] }),
}));
