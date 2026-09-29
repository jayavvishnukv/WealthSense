import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Sparkles, TrendingUp, AlertTriangle, ShieldCheck, Activity, Users, Radio, Loader } from 'lucide-react';

interface InvestmentAdvisorViewProps {
  token: string | null;
  lang: string;
  currency: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function InvestmentAdvisorView({ token, lang, currency }: InvestmentAdvisorViewProps) {
  const isTa = lang === 'ta';
  
  // Profile states
  const [age, setAge] = useState('28');
  const [riskLevel, setRiskLevel] = useState('Medium');
  const [liquidSavings, setLiquidSavings] = useState('50000');
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [advice, setAdvice] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileAndAdvice = async () => {
    setLoading(true);
    try {
      const profile = await fetchWithAuth('/api/investment-profile', token);
      if (profile) {
        setAge(profile.age.toString());
        setRiskLevel(profile.riskLevel);
        setLiquidSavings(profile.liquidSavings?.toString() || '');
        
        // Fetch advice automatically if profile exists
        const adviceData = await fetchWithAuth('/api/investment-profile/ai-advice', token, {
          method: 'POST',
          body: JSON.stringify({ lang })
        });
        setAdvice(adviceData);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndAdvice();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await fetchWithAuth('/api/investment-profile', token, {
        method: 'POST',
        body: JSON.stringify({
          age: parseInt(age),
          riskLevel,
          liquidSavings: liquidSavings ? parseFloat(liquidSavings) : 0
        })
      });
      // Fetch advice
      const adviceData = await fetchWithAuth('/api/investment-profile/ai-advice', token, {
        method: 'POST',
        body: JSON.stringify({ lang })
      });
      setAdvice(adviceData);
    } catch (err: any) {
      setError(err.message || 'Failed to submit profile');
    } finally {
      setSubmitting(false);
    }
  };

  // Pie chart data
  const pieData = advice ? [
    { name: isTa ? 'பங்குகள் (Equities)' : 'Equities', value: advice.equities },
    { name: isTa ? 'கடன் பத்திரங்கள் (Debt)' : 'Debt & Bonds', value: advice.debt },
    { name: isTa ? 'தங்கம் (Gold)' : 'Gold & Precious', value: advice.gold },
    { name: isTa ? 'பணம் (Cash)' : 'Liquid Cash', value: advice.cash },
  ].filter(p => p.value > 0) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2">
          <Activity className="w-8 h-8 text-emerald-400" />
          {isTa ? 'AI முதலீட்டு ஆலோசகர்' : 'Investment Advisor'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isTa ? 'உங்களின் வயது மற்றும் விருப்பத்திற்கு ஏற்ப முதலீட்டு ஆலோசனைகள்' : 'Dynamic asset allocations, SIP paths, and institutional flow psychology indicators'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Inputs Form */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md h-fit">
          <h3 className="text-lg font-bold text-white mb-4">{isTa ? 'முதலீட்டாளர் சுயவிவரம்' : 'Investor Risk Profile'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'வயது' : 'Age'}</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'இடர் எடுக்கும் திறன்' : 'Risk Appetite'}</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Low">{isTa ? 'குறைந்த இடர் (Conservative)' : 'Low (Conservative)'}</option>
                <option value="Medium">{isTa ? 'மிதமான இடர் (Moderate)' : 'Medium (Balanced)'}</option>
                <option value="High">{isTa ? 'அதிக இடர் (Aggressive)' : 'High (Growth/Aggressive)'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'கைவசம் உள்ள திரவ சேமிப்பு' : 'Liquid Savings (Optional)'}</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={liquidSavings}
                  onChange={(e) => setLiquidSavings(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2.5 rounded-xl transition disabled:opacity-50 text-sm"
            >
              {submitting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {isTa ? 'ஆலோசனை உருவாக்குகிறது...' : 'Generating Advice...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {isTa ? 'அறிவுரை பெறு' : 'Get AI Allocation'}
                </>
              )}
            </button>
          </form>
          {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
        </div>

        {/* Advisor Output Results */}
        <div className="lg:col-span-2 space-y-6">
          {submitting || loading ? (
            <div className="py-24 text-center space-y-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl animate-pulse">
              <BrainIcon className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
              <p className="text-slate-300 text-sm font-semibold">{isTa ? 'AI முதலீட்டு மேலாளர் உங்களின் சுயவிவரத்தை ஆராய்கிறது...' : 'AI Portfolio Manager is calibrating your assets...'}</p>
              <p className="text-slate-500 text-xs">{isTa ? 'சந்தையின் தற்போதைய நகர்வுகள் மற்றும் உங்களின் உகந்த விகிதம் கணக்கிடப்படுகிறது' : 'Mapping Equities, Mutual Funds, Sector rotations, and FII psychology'}</p>
            </div>
          ) : advice ? (
            <div className="space-y-6">
              {/* Asset Allocation Pie Chart and List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
                <div>
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">{isTa ? 'உகந்த சொத்து ஒதுக்கீடு' : 'Optimal Asset Allocation'}</h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `${v}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex flex-col justify-center space-y-3 text-sm">
                  {pieData.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-800/40 rounded-xl border border-slate-800/50">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-slate-300 font-medium">{p.name}</span>
                      </div>
                      <span className="font-mono font-bold text-white">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIP Mutual Funds Suggestions */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-4">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{isTa ? 'பரிந்துரைக்கப்படும் SIP திட்டங்கள்' : 'Recommended Monthly SIP Split'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advice.sipRecommendations?.map((rec: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-800/40 border border-slate-800/60 rounded-xl relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {rec.category}
                        </span>
                        <span className="font-mono font-bold text-white">{currency}{rec.amount}/mo</span>
                      </div>
                      <h5 className="text-sm font-bold text-white mt-3 leading-tight">{rec.fundName}</h5>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Stock Market Flow Psychology & Sentiment indicators */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    {isTa ? 'மேம்பட்ட சந்தை ஓட்டம் மற்றும் உளவியல்' : 'Advanced Market Flow Psychology'}
                  </h4>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700/60">
                    <span className="text-xs text-slate-400">{isTa ? 'இடர்ப்பாடு:' : 'Flow Risk:'}</span>
                    <span className={`text-xs font-bold ${
                      advice.flowRiskLevel === 'Green' ? 'text-emerald-400' : advice.flowRiskLevel === 'Yellow' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      ● {advice.flowRiskLevel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
                  <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-semibold text-emerald-400 block uppercase tracking-wider">{isTa ? 'FII / FPI ஓட்ட பகுப்பாய்வு' : 'Institutional Flow (FII/FPI)'}</span>
                    <p className="text-slate-300 font-medium">{advice.institutionalFlowAnalysis}</p>
                  </div>
                  <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-semibold text-emerald-400 block uppercase tracking-wider">{isTa ? 'சில்லறை வர்த்தக உணர்வு இடைவெளி' : 'Retail Sentiment Gap'}</span>
                    <p className="text-slate-300 font-medium">{advice.retailSentimentGap}</p>
                  </div>
                  <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-semibold text-emerald-400 block uppercase tracking-wider">{isTa ? 'துறை வாரியான சுழற்சி' : 'Sector Rotation Alert'}</span>
                    <p className="text-slate-300 font-medium">{advice.sectorRotation}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic mt-2">
                  * {isTa ? 'குறிப்பு: இந்தத் தரவு AI வழிமுறைகளால் உருவாக்கப்பட்டது. முதலீடு செய்வதற்கு முன் உங்கள் நிதி ஆலோசகரைக் கலந்தாலோசிக்கவும்.' : 'Disclaimer: This contains algorithmic analysis of capital markets. Verify allocations against personal targets prior to investing.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-3xl">
              <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">
                {isTa ? 'முதலீட்டு ஆலோசனைகள் எதுவும் பெறப்படவில்லை. பெற சுயவிவரத்தைச் சமர்ப்பிக்கவும்.' : 'Submit your risk appetite on the left to map custom asset classes.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/>
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
    </svg>
  );
}
