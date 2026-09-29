import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { EmergencyFund } from '../types';
import { ShieldCheck, ShieldAlert, Sparkles, RefreshCw, Loader, Info } from 'lucide-react';

interface EmergencyFundViewProps {
  token: string | null;
  currency: string;
  lang: string;
}

export default function EmergencyFundView({ token, currency, lang }: EmergencyFundViewProps) {
  const isTa = lang === 'ta';

  const [monthlyExpenses, setMonthlyExpenses] = useState('25000');
  const [currentAmount, setCurrentAmount] = useState('50000');
  const [jobType, setJobType] = useState('Salaried');
  const [monthlyAddition, setMonthlyAddition] = useState('5000');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const multiplier = jobType === 'Salaried' ? 6 : 9;
  const targetFund = Number(monthlyExpenses) * multiplier;
  const percentage = Math.min(100, Math.round((Number(currentAmount) / targetFund) * 100)) || 0;

  const fetchFundData = async () => {
    setLoading(true);
    try {
      const fund = await fetchWithAuth('/api/emergency-fund', token);
      if (fund) {
        setMonthlyExpenses(fund.monthlyExpenses.toString());
        setCurrentAmount(fund.currentAmount.toString());
        setJobType(fund.jobType);
        setMonthlyAddition(fund.monthlyAddition.toString());
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFundData();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await fetchWithAuth('/api/emergency-fund', token, {
        method: 'PUT',
        body: JSON.stringify({
          monthlyExpenses: Number(monthlyExpenses),
          currentAmount: Number(currentAmount),
          multiplier,
          jobType,
          monthlyAddition: Number(monthlyAddition)
        })
      });
      // Fetch AI guidance automatically after saving
      handleGetAiAdvice();
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetAiAdvice = async () => {
    setAiLoading(true);
    try {
      const results = await fetchWithAuth('/api/emergency-fund/ai-guidance', token, {
        method: 'POST',
        body: JSON.stringify({ lang })
      });
      setAiAdvice(results.guidance);
    } catch (err: any) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          {isTa ? 'அவசரகால நிதித் திட்டமிடல்' : 'Emergency Fund Planner'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isTa ? 'வேலை இழப்பு அல்லது அவசரக் காலங்களில் உதவும் பாதுகாப்பு வளையத்தை உருவாக்குங்கள்' : 'Establish 6-9 months of salary buffer mapped to job-type risk indexes'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Setup Config Card */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md h-fit">
          <h3 className="text-lg font-bold text-white mb-4">{isTa ? 'நிதி கட்டமைப்பு' : 'Configure Safety parameters'}</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'வேலை வகை' : 'Employment Type'}</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Salaried">{isTa ? 'மாதாந்திர சம்பளம் பெறுபவர் (Salaried)' : 'Salaried employee (6mo buffer)'}</option>
                <option value="Freelancer">{isTa ? 'சுயதொழில் / ஃப்ரீலான்சர் (Freelancer)' : 'Freelancer / Self-employed (9mo buffer)'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'மாதாந்திர சராசரி செலவுகள்' : 'Average Monthly Expenses'}</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  required
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'தற்போது சேமிப்பில் உள்ள தொகை' : 'Current Saved Amount'}</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  required
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'மாதாந்திர அவசரகால பங்களிப்பு' : 'Intended Monthly Addition'}</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">{currency}</span>
                <input
                  type="number"
                  required
                  value={monthlyAddition}
                  onChange={(e) => setMonthlyAddition(e.target.value)}
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
                  {isTa ? 'சேமிக்கிறது...' : 'Saving...'}
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  {isTa ? 'அமைப்புகளைச் சேமி' : 'Save Safety Plan'}
                </>
              )}
            </button>
          </form>
          {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
        </div>

        {/* Dynamic visualizers & AI Advisor output block */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visual safety ring meter */}
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{isTa ? 'பாதுகாப்பு விகிதம்' : 'Safety Ratio'}</span>
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* SVG Radial progress */}
                <svg className="w-full h-full transform -rotate-95">
                  <circle cx="64" cy="64" r="50" strokeWidth="8" stroke="#1e293b" fill="transparent" />
                  <circle cx="64" cy="64" r="50" strokeWidth="8" stroke="#10b981" fill="transparent"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - percentage / 100)}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-extrabold text-white font-mono">{percentage}%</span>
                </div>
              </div>
            </div>

            {/* Calculations summaries */}
            <div className="md:col-span-2 flex flex-col justify-center space-y-4">
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800/50">
                <span className="text-xs text-slate-400 font-medium">{isTa ? 'தேவைப்படும் அவசரகால சேமிப்பு இலக்கு:' : 'Recommended Emergency Target:'}</span>
                <p className="text-2xl font-bold text-white font-mono mt-1">{currency}{targetFund.toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 mt-1">({monthlyExpenses} x {multiplier} {isTa ? 'மாத செலவுகள்' : 'months budget based on risk multiplier'})</p>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800/50">
                <span className="text-xs text-slate-400 font-medium">{isTa ? 'இலக்கை அடைய இன்னும் தேவைப்படும் தொகை:' : 'Gap to Target Amount:'}</span>
                <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
                  {currency}{Math.max(0, targetFund - Number(currentAmount)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* AI Guidance advice block */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                {isTa ? 'AI பாதுகாப்பு ஆலோசகரின் அறிக்கை' : 'AI Safety Guidance Reports'}
              </h3>
              <button
                onClick={handleGetAiAdvice}
                disabled={aiLoading}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition"
                title="Get AI Advice"
              >
                <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {aiLoading ? (
              <div className="py-12 text-center space-y-2">
                <Loader className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">{isTa ? 'AI ஆலோசகர் உங்களின் அவசரகால திட்டத்தைப் பகுப்பாய்வு செய்கிறது...' : 'Generating dynamic job-type resilience analysis...'}</p>
              </div>
            ) : aiAdvice ? (
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-800/30 p-4 border border-slate-800/80 rounded-xl">
                {aiAdvice}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>{isTa ? 'பாதுகாப்பு திட்டத்தைச் சேமித்தவுடன் AI அறிவுரை தானாகவே தோன்றும்.' : 'AI safety diagnostics and accelerate suggestions will show here.'}</p>
                <button
                  type="button"
                  onClick={handleGetAiAdvice}
                  className="mt-3 text-emerald-400 text-xs font-semibold hover:underline"
                >
                  {isTa ? 'ஆலோசனை உருவாக்கு' : 'Generate Advisor Diagnosis Now'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
