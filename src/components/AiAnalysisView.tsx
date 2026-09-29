import React, { useState } from 'react';
import { fetchWithAuth } from '../lib/api';
import { Sparkles, Brain, CheckCircle, AlertTriangle, Info, Calendar, Loader } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AiAnalysisViewProps {
  token: string | null;
  lang: string;
  currency: string;
}

export default function AiAnalysisView({ token, lang, currency }: AiAnalysisViewProps) {
  const isTa = lang === 'ta';
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth('/api/reports/ai-analysis', token, {
        method: 'POST',
        body: JSON.stringify({ month, lang })
      });
      setAnalysis(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Analysis failed. Please ensure you have added income/expense records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2">
          <Brain className="w-8 h-8 text-emerald-400" />
          {isTa ? 'AI நிதி பகுப்பாய்வு' : 'AI Spend Analysis'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isTa ? 'உங்களின் மாதாந்திர பரிவர்த்தனைகளைப் பகுப்பாய்வு செய்து நுண்ணறிவுகளைப் பெறுங்கள்' : 'Generate smart bento-style insights, savings rate metrics, and localized diagnostics'}
        </p>
      </div>

      {/* Control Card */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              {isTa ? 'பகுப்பாய்வு மாதம்' : 'Select Month'}
            </span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        <button
          onClick={runAnalysis}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition duration-200 disabled:opacity-50 text-sm"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              {isTa ? 'கணக்கிடுகிறது...' : 'Computing Intelligence...'}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {isTa ? 'பகுப்பாய்வைத் தொடங்கு' : 'Run Deep Audit'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Loading state indicator */}
      {loading && (
        <div className="py-20 text-center space-y-4">
          <div className="inline-block p-4 bg-emerald-500/10 rounded-full text-emerald-400 animate-pulse">
            <Brain className="w-10 h-10 animate-spin" />
          </div>
          <p className="text-slate-300 text-sm font-semibold">{isTa ? 'WealthSense AI உங்களின் செலவுகளை ஆராய்கிறது...' : 'WealthSense AI is auditing your transactions...'}</p>
          <p className="text-slate-500 text-xs">{isTa ? 'பொறுமையாக இருக்கவும், இது சில நொடிகள் ஆகலாம்' : 'Compiling bento indicators, dynamic ratings, and diagnostics'}</p>
        </div>
      )}

      {/* Analysis Results */}
      {!loading && analysis && (
        <div className="space-y-6">
          {/* Header Score & Rate Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between backdrop-blur-md">
              <span className="text-slate-400 text-sm font-semibold block uppercase tracking-wider">{isTa ? 'AI நிதி ஆரோக்கிய மதிப்பெண்' : 'AI Financial Health'}</span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-emerald-400 font-mono">{analysis.healthScore}</span>
                <span className="text-slate-500 text-sm">/ 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                {analysis.healthScore >= 80 
                  ? (isTa ? 'சிறந்த நிதி மேலாண்மை! உங்களின் சேமிப்பு விகிதம் மிகச் சிறப்பாக உள்ளது.' : 'Excellent financial position! High savings and balanced ratios detected.')
                  : (isTa ? 'கவனம் தேவை. சேமிப்பை அதிகரிக்க செலவுகளைக் குறைப்பது நல்லது.' : 'Moderate. Potential room to scale back auxiliary subscriptions or food leaks.')}
              </p>
            </div>

            <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
              <span className="text-slate-400 text-sm font-semibold block uppercase tracking-wider">{isTa ? 'செலவு முறிவு பகுப்பாய்வு' : 'AI Expense Analysis Summary'}</span>
              <p className="text-sm text-slate-300 mt-4 leading-relaxed font-medium">
                {analysis.expenseDistributionSummary}
              </p>
            </div>
          </div>

          {/* Bento-style Insights (3 Cards) */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">{isTa ? 'முக்கிய நிதி நுண்ணறிவுகள் (Bento)' : 'Bento Insights'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.bentoInsights?.map((insight: any, idx: number) => {
                const isSuccess = insight.type === 'success';
                const isWarning = insight.type === 'warning';
                return (
                  <div 
                    key={idx} 
                    className={`p-5 rounded-2xl border flex flex-col justify-between h-48 relative overflow-hidden backdrop-blur-md ${
                      isSuccess 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                        : isWarning 
                          ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' 
                          : 'bg-blue-500/5 border-blue-500/20 text-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold tracking-wider opacity-80">{insight.title}</span>
                      {isSuccess ? <CheckCircle className="w-5 h-5" /> : isWarning ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    </div>
                    <div className="my-3">
                      <p className="text-slate-200 text-sm leading-relaxed line-clamp-3">{insight.text}</p>
                    </div>
                    <div className="text-xs font-semibold opacity-90 font-mono mt-auto">
                      {isTa ? 'தாக்கம்:' : 'Potential Savings:'} {insight.impact}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Advisor Deep Diagnostics String */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              {isTa ? 'AI ஆலோசகரின் விரிவான பரிந்துரை' : 'AI Advisor Detailed Diagnostics'}
            </h3>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
              {analysis.diagnostics}
            </div>
          </div>
        </div>
      )}

      {!loading && !analysis && (
        <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
          <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">
            {isTa ? 'செலவுப் பகுப்பாய்வை இயக்கவில்லை. பகுப்பாய்வைத் தொடங்கவும்.' : 'Click "Run Deep Audit" to compile personalized diagnostics and bento ratings.'}
          </p>
        </div>
      )}
    </div>
  );
}
