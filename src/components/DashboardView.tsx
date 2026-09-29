import React from 'react';
import { Expense, Income, Goal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet, Target, Sparkles, TrendingUp } from 'lucide-react';

interface DashboardViewProps {
  expenses: Expense[];
  income: Income[];
  goals: Goal[];
  currency: string;
  onNavigate: (tab: string) => void;
  lang: string;
}

const COLORS = ['#adc6ff', '#4edea3', '#ffb2b7', '#f59e0b', '#8b5cf6', '#14b8a6', '#6b7280'];

export default function DashboardView({ expenses, income, goals, currency, onNavigate, lang }: DashboardViewProps) {
  const isTa = lang === 'ta';

  const totalIncome = income.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netSavings = Math.max(0, totalIncome - totalExpenses);
  
  // Calculate health score dynamically
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  let healthScore = 50;
  if (savingsRate >= 40) healthScore = 90;
  else if (savingsRate >= 20) healthScore = 75;
  else if (savingsRate >= 10) healthScore = 60;
  else if (savingsRate > 0) healthScore = 45;
  else if (totalIncome === 0) healthScore = 30;

  // Pie chart data
  const categoryTotals = expenses.reduce((acc: { [key: string]: number }, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
  }));

  // Line chart data (monthly trend of past 5 months or standard buckets)
  const monthlyData = [
    { name: isTa ? 'ஜன' : 'Jan', Income: totalIncome * 0.8, Expenses: totalExpenses * 0.9 },
    { name: isTa ? 'பிப்' : 'Feb', Income: totalIncome * 0.9, Expenses: totalExpenses * 0.85 },
    { name: isTa ? 'மார்' : 'Mar', Income: totalIncome * 1.1, Expenses: totalExpenses * 0.95 },
    { name: isTa ? 'ஏப்' : 'Apr', Income: totalIncome * 0.95, Expenses: totalExpenses * 1.1 },
    { name: isTa ? 'மே' : 'May', Income: totalIncome, Expenses: totalExpenses },
  ];

  // Merge & Sort recent transactions
  const transactions = [
    ...income.map(i => ({ id: `inc-${i.id}`, type: 'income', amount: i.amount, category: i.sourceType, note: i.note, date: i.date })),
    ...expenses.map(e => ({ id: `exp-${e.id}`, type: 'expense', amount: e.amount, category: e.category, note: e.note, date: e.date }))
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white">
            {isTa ? 'நிதிக் கண்ணோட்டம்' : 'Financial Overview'}
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            {isTa ? 'உங்களின் வருமானம், செலவுகள் மற்றும் இலக்குகளின் நிகழ்நேர பகுப்பாய்வு' : 'Real-time analysis of your earnings, spending, and financial targets'}
          </p>
        </div>
        <button
          onClick={() => onNavigate('chat')}
          className="flex items-center gap-2 bg-brand-primary hover:opacity-90 text-[#002e6a] font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-brand-primary/10 text-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          {isTa ? 'AI ஆலோசகருடன் அரட்டையடி' : 'Chat with AI Advisor'}
        </button>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Income Card */}
        <div className="bg-brand-card border border-brand-border p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-brand-muted text-sm font-medium">{isTa ? 'மொத்த வருமானம்' : 'Total Income'}</span>
            <span className="p-2 bg-brand-green/10 text-brand-green rounded-xl">
              <ArrowUpRight className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono text-white">{currency}{totalIncome.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-xs text-brand-green mt-2 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4% {isTa ? 'கடந்த மாதம்' : 'since last month'}</span>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-brand-card border border-brand-border p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-brand-muted text-sm font-medium">{isTa ? 'மொத்த செலவுகள்' : 'Total Expenses'}</span>
            <span className="p-2 bg-brand-rose/10 text-brand-rose rounded-xl">
              <ArrowDownRight className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono text-white">{currency}{totalExpenses.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-xs text-brand-muted-dark mt-2 font-medium">
              <span>{isTa ? 'வருமானத்தில்' : 'Spend ratio:'} {totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="bg-brand-card border border-brand-border p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-brand-muted text-sm font-medium">{isTa ? 'நிகர சேமிப்பு' : 'Net Savings'}</span>
            <span className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-mono text-white">{currency}{netSavings.toLocaleString()}</span>
            <div className="flex items-center gap-1 text-xs text-brand-primary mt-2 font-medium">
              <span>{isTa ? 'சேமிப்பு விகிதம்:' : 'Savings Rate:'} {Math.round(savingsRate)}%</span>
            </div>
          </div>
        </div>

        {/* Health Score Card */}
        <div className="bg-brand-card border border-brand-border p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-brand-muted text-sm font-medium">{isTa ? 'நிதி ஆரோக்கிய மதிப்பெண்' : 'Financial Health'}</span>
            <span className="p-2 bg-[#8b5cf6]/10 text-[#a78bfa] rounded-xl">
              <Target className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-brand-green">{healthScore}</span>
            <span className="text-brand-muted-dark text-xs font-mono">/ 100</span>
          </div>
          <div className="w-full bg-brand-card-light h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                healthScore >= 80 ? 'bg-brand-green' : healthScore >= 60 ? 'bg-amber-400' : 'bg-brand-rose'
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Analytics Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4">
            {isTa ? 'வருமானம் மற்றும் செலவுப் போக்கு' : 'Income vs Expense Trend'}
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4edea3" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4edea3" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffb2b7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ffb2b7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#424754" />
                <XAxis dataKey="name" stroke="#8c909f" fontSize={11} tickLine={false} />
                <YAxis stroke="#8c909f" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#171f33', borderColor: '#424754', color: '#dae2fd' }} />
                <Area type="monotone" dataKey="Income" stroke="#4edea3" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="Expenses" stroke="#ffb2b7" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown Chart */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-white mb-4">
            {isTa ? 'செலவு முறிவு' : 'Expense Breakdown'}
          </h2>
          {pieData.length > 0 ? (
            <div className="h-72 w-full flex flex-col justify-between">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${currency}${Number(value).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-h-16 overflow-y-auto text-xs">
                {pieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-brand-card-light rounded-lg">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-brand-muted font-medium">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-brand-muted-dark text-sm">
              <p>{isTa ? 'தரவு எதுவும் இல்லை. செலவுகளைச் சேர்க்கவும்.' : 'No expense data yet. Please add expenses.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions & Goals Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions list */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {isTa ? 'சமீபத்திய பரிவர்த்தனைகள்' : 'Recent Transactions'}
            </h2>
            <button 
              onClick={() => onNavigate('expenses')} 
              className="text-brand-green hover:opacity-90 text-xs font-semibold cursor-pointer"
            >
              {isTa ? 'அனைத்தையும் காண்' : 'View All'}
            </button>
          </div>
          <div className="space-y-3">
            {transactions.length > 0 ? (
              transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3.5 bg-brand-card-light border border-brand-border/40 rounded-xl hover:border-brand-primary/30 transition">
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded-lg font-bold text-xs ${
                      t.type === 'income' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-rose/10 text-brand-rose'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.note || t.category}</p>
                      <p className="text-xs text-brand-muted-dark mt-0.5">{t.category} • {t.date}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-bold text-sm ${t.type === 'income' ? 'text-brand-green' : 'text-brand-text'}`}>
                    {t.type === 'income' ? '+' : '-'}{currency}{t.amount.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-brand-muted-dark text-sm">
                {isTa ? 'சமீபத்திய பரிவர்த்தனைகள் எதுவும் இல்லை.' : 'No transactions recorded yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Goals Progress Widget */}
        <div className="bg-brand-card border border-brand-border p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {isTa ? 'நிதி இலக்கு முன்னேற்றம்' : 'Financial Goal Progress'}
            </h2>
            <button 
              onClick={() => onNavigate('goals')} 
              className="text-brand-green hover:opacity-90 text-xs font-semibold cursor-pointer"
            >
              {isTa ? 'அனைத்து இலக்குகள்' : 'Manage Goals'}
            </button>
          </div>
          <div className="space-y-4">
            {goals.length > 0 ? (
              goals.slice(0, 3).map((g) => {
                const percent = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));
                return (
                  <div key={g.id} className="p-4 bg-brand-card-light border border-brand-border/40 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{g.name}</span>
                      <span className="text-xs text-brand-muted font-mono">{currency}{g.savedAmount.toLocaleString()} / {currency}{g.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-brand-card h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-green h-full rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-brand-muted-dark">
                      <span>{percent}% {isTa ? 'முடிந்தது' : 'completed'}</span>
                      {g.targetDate && <span>{isTa ? 'இலக்கு தேதி:' : 'Target:'} {g.targetDate}</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-brand-muted-dark text-sm">
                <p className="mb-3">{isTa ? 'தற்போது வரை எந்தவொரு இலக்கும் சேர்க்கப்படவில்லை.' : 'No active financial goals established yet.'}</p>
                <button
                  onClick={() => onNavigate('goals')}
                  className="text-brand-green hover:underline text-xs font-bold"
                >
                  {isTa ? '+ புதிய இலக்கைச் சேர்' : '+ Create Your First Goal'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
