import React, { useState, useEffect } from 'react';
import { 
  auth, 
  googleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  getFirebaseAuthErrorMessage
} from './lib/firebase';
import { fetchWithAuth } from './lib/api';
import { Expense, Income, Goal } from './types';

// Icons for navigation
import { 
  Bot, 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  ShieldAlert, 
  Activity, 
  Target, 
  ShieldCheck, 
  FileText, 
  Settings, 
  LogOut, 
  Globe, 
  Menu, 
  X, 
  Sparkles, 
  ArrowRight,
  Loader
} from 'lucide-react';

// Subcomponents
import DashboardView from './components/DashboardView';
import ExpenseTrackerView from './components/ExpenseTrackerView';
import IncomeTrackerView from './components/IncomeTrackerView';
import AiAnalysisView from './components/AiAnalysisView';
import MoneyLeaksView from './components/MoneyLeaksView';
import InvestmentAdvisorView from './components/InvestmentAdvisorView';
import GoalPlannerView from './components/GoalPlannerView';
import EmergencyFundView from './components/EmergencyFundView';
import AiChatView from './components/AiChatView';
import ReportsInsightsView from './components/ReportsInsightsView';

export default function App() {
  const [fUser, setFUser] = useState<FirebaseUser | null>(null);
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);
  
  // App state
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [lang, setLang] = useState('en'); // 'en' | 'ta'
  const [currency, setCurrency] = useState('₹');

  // Transactions / configurations state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Navigation & UI controls
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Monitor Firebase auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          setFUser(user);
          try {
            const idToken = await user.getIdToken();
            setToken(idToken);

            // Sync with database & get user data
            setLoadingData(true);
            const syncRes = await fetchWithAuth('/api/auth/sync', idToken, { method: 'POST' });
            setDbUser(syncRes.user);
            setProfile(syncRes.profile);
            setSettings(syncRes.settings);
            if (syncRes.settings?.lang) {
              setLang(syncRes.settings.lang);
            }

            // Fetch operational lists
            await fetchFinancialData(idToken);
          } catch (err) {
            console.error('Sync session error:', err);
            setLoginError('Your account was signed in, but the application could not load your data.');
          } finally {
            setLoadingData(false);
          }
        } else {
          setFUser(null);
          setToken(null);
          setDbUser(null);
          setProfile(null);
          setSettings(null);
        }
        setLoadingAuth(false);
      },
      (error) => {
        console.error('Firebase auth state error:', error);
        setLoginError(getFirebaseAuthErrorMessage(error));
        setLoadingAuth(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchFinancialData = async (activeToken: string) => {
    try {
      const [expList, incList, goalsList] = await Promise.all([
        fetchWithAuth('/api/expenses', activeToken),
        fetchWithAuth('/api/income', activeToken),
        fetchWithAuth('/api/goals', activeToken)
      ]);
      setExpenses(expList);
      setIncome(incList);
      setGoals(goalsList);
    } catch (err) {
      console.error('Failed to fetch financial transactions:', err);
    }
  };

  // Login action
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError(getFirebaseAuthErrorMessage(error));
    }
  };

  const handleDemoLogin = async () => {
    setLoginError(null);
    setLoadingData(true);
    const mockUser: any = {
      uid: 'demo_user_wealthsense',
      email: 'demo@wealthsense.ai',
      displayName: 'Demo User',
      photoURL: null,
      getIdToken: async () => 'demo-token-wealthsense'
    };
    setFUser(mockUser);
    const demoToken = 'demo-token-wealthsense';
    setToken(demoToken);
    try {
      const syncRes = await fetchWithAuth('/api/auth/sync', demoToken, { method: 'POST' });
      setDbUser(syncRes.user);
      setProfile(syncRes.profile);
      setSettings(syncRes.settings);
      if (syncRes.settings?.lang) {
        setLang(syncRes.settings.lang);
      }
      await fetchFinancialData(demoToken);
    } catch (err: any) {
      console.error('Demo sync error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Sign out action
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out failed:', error);
      setLoginError(getFirebaseAuthErrorMessage(error));
    }
    setFUser(null);
    setToken(null);
    setDbUser(null);
    setProfile(null);
    setSettings(null);
    setExpenses([]);
    setIncome([]);
    setGoals([]);
  };

  // Language toggle
  const toggleLanguage = async (newLang: string) => {
    setLang(newLang);
    if (token) {
      try {
        await fetchWithAuth('/api/settings', token, {
          method: 'PUT',
          body: JSON.stringify({ lang: newLang, theme: 'dark' })
        });
      } catch (err) {
        console.error('Failed to persist language setting:', err);
      }
    }
  };

  // Expense CRUD Handlers
  const handleAddExpense = async (data: { amount: number; category: string; note: string; date: string; time: string }) => {
    if (!token) return;
    try {
      const added = await fetchWithAuth('/api/expenses', token, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setExpenses(prev => [added, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateExpense = async (id: number, data: Partial<Expense>) => {
    if (!token) return;
    try {
      const updated = await fetchWithAuth(`/api/expenses/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      setExpenses(prev => prev.map(e => e.id === id ? updated : e));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (!token) return;
    try {
      await fetchWithAuth(`/api/expenses/${id}`, token, { method: 'DELETE' });
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Income CRUD Handlers
  const handleAddIncome = async (data: { amount: number; sourceType: string; note: string; date: string }) => {
    if (!token) return;
    try {
      const added = await fetchWithAuth('/api/income', token, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setIncome(prev => [added, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateIncome = async (id: number, data: Partial<Income>) => {
    if (!token) return;
    try {
      const updated = await fetchWithAuth(`/api/income/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      setIncome(prev => prev.map(i => i.id === id ? updated : i));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIncome = async (id: number) => {
    if (!token) return;
    try {
      await fetchWithAuth(`/api/income/${id}`, token, { method: 'DELETE' });
      setIncome(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Goal CRUD Handlers
  const handleAddGoal = async (data: { name: string; targetAmount: number; savedAmount: number; category: string; targetDate?: string }) => {
    if (!token) return;
    try {
      const added = await fetchWithAuth('/api/goals', token, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      setGoals(prev => [added, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGoal = async (id: number, data: Partial<Goal>) => {
    if (!token) return;
    try {
      const updated = await fetchWithAuth(`/api/goals/${id}`, token, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      setGoals(prev => prev.map(g => g.id === id ? updated : g));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!token) return;
    try {
      await fetchWithAuth(`/api/goals/${id}`, token, { method: 'DELETE' });
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunGoalAi = async (id: number, monthlySavings: number) => {
    if (!token) return;
    try {
      const updated = await fetchWithAuth(`/api/goals/${id}/ai-calculate`, token, {
        method: 'POST',
        body: JSON.stringify({ monthlySavings, lang })
      });
      setGoals(prev => prev.map(g => g.id === id ? updated : g));
    } catch (err) {
      console.error(err);
    }
  };

  // UI labels based on selected language
  const isTa = lang === 'ta';
  const UI_LABELS = {
    dashboard: isTa ? 'கண்ணோட்டம்' : 'Dashboard',
    expenses: isTa ? 'செலவுகள்' : 'Expenses',
    income: isTa ? 'வருமானம்' : 'Income',
    aiAnalysis: isTa ? 'AI பகுப்பாய்வு' : 'AI Diagnostics',
    leaks: isTa ? 'பணக் கசிவுகள்' : 'Money Leaks',
    investments: isTa ? 'ஆலோசகர்' : 'AI Advisor',
    goals: isTa ? 'இலக்குகள்' : 'Goals',
    emergencyFund: isTa ? 'அவசரகால நிதி' : 'Emergency Fund',
    aiChat: isTa ? 'AI அரட்டை' : 'AI Assistant',
    reports: isTa ? 'அறிக்கைகள்' : 'Reports & Export',
  };

  const menuItems = [
    { id: 'dashboard', label: UI_LABELS.dashboard, icon: LayoutDashboard },
    { id: 'expenses', label: UI_LABELS.expenses, icon: TrendingDown },
    { id: 'income', label: UI_LABELS.income, icon: TrendingUp },
    { id: 'aiAnalysis', label: UI_LABELS.aiAnalysis, icon: Brain },
    { id: 'leaks', label: UI_LABELS.leaks, icon: ShieldAlert },
    { id: 'investments', label: UI_LABELS.investments, icon: Activity },
    { id: 'goals', label: UI_LABELS.goals, icon: Target },
    { id: 'emergencyFund', label: UI_LABELS.emergencyFund, icon: ShieldCheck },
    { id: 'chat', label: UI_LABELS.aiChat, icon: Bot },
    { id: 'reports', label: UI_LABELS.reports, icon: FileText },
  ];

  if (loadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-bg">
        <div className="inline-block p-4 bg-brand-primary/10 rounded-full text-brand-primary mb-4">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-brand-muted text-sm font-semibold tracking-wider uppercase font-mono">Launching WealthSense AI...</p>
      </div>
    );
  }

  // Not signed in layout
  if (!fUser) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="max-w-md w-full bg-brand-card border border-brand-border p-8 rounded-2xl relative shadow-2xl text-center space-y-6">
          <div className="inline-block p-4 bg-brand-primary/10 text-brand-primary rounded-xl relative">
            <Bot className="w-12 h-12" />
            <Sparkles className="w-5 h-5 text-brand-green absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">WealthSense AI</h1>
            <p className="text-brand-muted text-sm">
              Empowering Tamil & English communities with localized AI-driven financial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 bg-brand-card-light border border-brand-border rounded-xl space-y-1">
              <span className="text-xs font-bold text-brand-green uppercase tracking-wider block">Diagnostics</span>
              <p className="text-[11px] text-brand-muted">Scan categories, detect subscriptions, and track leaks.</p>
            </div>
            <div className="p-3 bg-brand-card-light border border-brand-border rounded-xl space-y-1">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider block">Tamil Support</span>
              <p className="text-[11px] text-brand-muted">Interactive guidance in classical Tamil letters.</p>
            </div>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-xs text-left">
              <p className="font-semibold">{loginError}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-brand-primary hover:opacity-90 active:scale-[0.98] text-[#002e6a] font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-brand-primary/10 text-sm cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.742-.08-1.302-.177-1.859H12.24z"/>
            </svg>
            Sign In with Google
          </button>

          <button
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 active:scale-[0.98] text-brand-muted hover:text-white font-semibold py-3 rounded-xl border border-brand-border/60 transition duration-200 text-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-green" />
            Instant Demo Access / மாதிரி பயன்முறை
          </button>

          <p className="text-xs text-brand-muted-dark">
            Secure cloud architecture connected to your real operations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-sidebar border-r border-brand-border transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:flex lg:flex-col justify-between ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-brand-primary font-display flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-[#002e6a]">
                <Bot className="w-5 h-5" />
              </div>
              WealthSense
            </span>
            <button className="lg:hidden p-1 text-brand-muted hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'chat' && activeTab === 'chat');
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    isActive 
                      ? 'bg-brand-card text-brand-primary border border-brand-primary/20' 
                      : 'text-brand-muted hover:bg-brand-card-light hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User detail card */}
        <div className="p-4 border-t border-brand-border">
          <div className="flex items-center gap-3 p-2 bg-brand-card-light rounded-xl border border-brand-border/40">
            <div className="w-8 h-8 rounded-full bg- gradient-to-tr from-brand-primary to-brand-green flex items-center justify-center font-bold text-xs text-[#002e6a] uppercase">
              {profile?.displayName?.substring(0, 2) || fUser.email?.substring(0, 2) || 'US'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{profile?.displayName || 'Active User'}</p>
              <p className="text-[10px] text-brand-muted-dark truncate">{fUser.email}</p>
            </div>
            <Settings className="w-4 h-4 text-brand-muted-dark hover:text-brand-primary cursor-pointer" />
          </div>
        </div>
      </aside>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top bar controls */}
        <header className="sticky top-0 z-30 bg-brand-bg/90 border-b border-brand-border backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 bg-brand-card text-brand-muted rounded-xl hover:text-white transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="lg:hidden text-lg font-bold text-white font-display">WealthSense</span>
            <div className="hidden sm:flex items-center gap-4">
              <h2 className="text-sm font-bold text-white capitalize">{UI_LABELS[activeTab as keyof typeof UI_LABELS] || activeTab}</h2>
              <div className="px-2 py-0.5 bg-[#005236] text- [#4edea3] text-[9px] font-bold rounded uppercase tracking-wider">System Online</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language switch */}
            <div className="flex items-center gap-1 bg-brand-card-light border border-brand-border p-1 rounded-xl">
              <button
                onClick={() => toggleLanguage('en')}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${lang === 'en' ? 'bg-brand-primary text-[#002e6a]' : 'text-brand-muted'}`}
              >
                EN
              </button>
              <button
                onClick={() => toggleLanguage('ta')}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${lang === 'ta' ? 'bg-brand-primary text-[#002e6a]' : 'text-brand-muted'}`}
              >
                தமிழ்
              </button>
            </div>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="p-2 bg-brand-card border border-brand-border text-brand-muted hover:text-brand-rose rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content canvas with transitions */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-16">
          {activeTab === 'dashboard' && (
            <DashboardView 
              expenses={expenses} 
              income={income} 
              goals={goals} 
              currency={currency} 
              onNavigate={(tab) => setActiveTab(tab)}
              lang={lang}
            />
          )}
          {activeTab === 'expenses' && (
            <ExpenseTrackerView 
              expenses={expenses} 
              currency={currency} 
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              lang={lang}
            />
          )}
          {activeTab === 'income' && (
            <IncomeTrackerView 
              income={income} 
              currency={currency} 
              onAddIncome={handleAddIncome}
              onUpdateIncome={handleUpdateIncome}
              onDeleteIncome={handleDeleteIncome}
              lang={lang}
            />
          )}
          {activeTab === 'aiAnalysis' && (
            <AiAnalysisView 
              token={token} 
              lang={lang} 
              currency={currency} 
            />
          )}
          {activeTab === 'leaks' && (
            <MoneyLeaksView 
              token={token} 
              lang={lang} 
              currency={currency} 
            />
          )}
          {activeTab === 'investments' && (
            <InvestmentAdvisorView 
              token={token} 
              lang={lang} 
              currency={currency} 
            />
          )}
          {activeTab === 'goals' && (
            <GoalPlannerView 
              goals={goals} 
              currency={currency} 
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
              onRunGoalAi={handleRunGoalAi}
              lang={lang}
            />
          )}
          {activeTab === 'emergencyFund' && (
            <EmergencyFundView 
              token={token} 
              currency={currency} 
              lang={lang} 
            />
          )}
          {activeTab === 'chat' && (
            <AiChatView 
              token={token} 
              lang={lang} 
            />
          )}
          {activeTab === 'reports' && (
            <ReportsInsightsView 
              expenses={expenses} 
              income={income} 
              goals={goals} 
              currency={currency} 
              lang={lang} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
