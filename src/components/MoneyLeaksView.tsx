import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../lib/api';
import { MoneyLeak } from '../types';
import { Sparkles, Trash2, Check, ShieldAlert, ShieldCheck, RefreshCw, Loader } from 'lucide-react';

interface MoneyLeaksViewProps {
  token: string | null;
  lang: string;
  currency: string;
}

export default function MoneyLeaksView({ token, lang, currency }: MoneyLeaksViewProps) {
  const isTa = lang === 'ta';
  const [leaks, setLeaks] = useState<MoneyLeak[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaks = async () => {
    setLoading(true);
    try {
      const data = await fetchWithAuth('/api/money-leaks', token);
      setLeaks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leaks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaks();
  }, [token]);

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    try {
      const newLeaks = await fetchWithAuth('/api/money-leaks/detect', token, {
        method: 'POST',
        body: JSON.stringify({ lang })
      });
      // Refresh full list to include newly detected and existing items
      await fetchLeaks();
    } catch (err: any) {
      setError(err.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleAcknowledge = async (id: number) => {
    try {
      await fetchWithAuth(`/api/money-leaks/${id}/acknowledge`, token, {
        method: 'POST'
      });
      // Update local state
      setLeaks(prev => prev.map(l => l.id === id ? { ...l, acknowledged: true } : l));
    } catch (err: any) {
      console.error(err);
    }
  };

  // Active (unacknowledged) leaks
  const activeLeaks = leaks.filter(l => !l.acknowledged);
  const fixedLeaks = leaks.filter(l => l.acknowledged);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            {isTa ? 'பணக் கசிவு கண்டறிதல்' : 'Money Leak Detector'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isTa ? 'தேவையற்ற சந்தாக்கள் மற்றும் வீண் செலவுகளைக் கண்டறிந்து தடுத்து நிறுத்துங்கள்' : 'Identify recurring unused purchases, subscription overlap, and impulsive leaks'}
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={scanning}
          className="flex items-center gap-2 bg- gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold px-5 py-3 rounded-xl transition disabled:opacity-50 text-sm"
        >
          {scanning ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              {isTa ? 'ஆராய்கிறது...' : 'Auditing Transactions...'}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {isTa ? 'கசிவுகளைத் தேடு' : 'Scan for Leaks'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {scanning && (
        <div className="py-20 text-center space-y-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl animate-pulse">
          <div className="inline-block p-4 bg-rose-500/10 text-rose-400 rounded-full">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <p className="text-slate-200 text-sm font-semibold">{isTa ? 'உங்களின் முந்தைய செலவுப் பழக்கவழக்கங்களை AI அலசுகிறது...' : 'AI is parsing past shopping bills & subscription buckets...'}</p>
          <p className="text-slate-500 text-xs">{isTa ? 'தேவையற்ற தொடர் செலவுகள் மற்றும் கசிவுகள் உடனே கண்டறியப்படும்' : 'Checking for duplicate streaming services, utility leaks, and impulse gaps'}</p>
        </div>
      )}

      {!scanning && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active leaks */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              {isTa ? 'கண்டறியப்பட்ட கசிவுகள்' : 'Potential Money Leaks'}
              <span className="text-xs bg-rose-500/15 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-full font-mono font-bold">
                {activeLeaks.length}
              </span>
            </h3>

            {activeLeaks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeLeaks.map((leak) => {
                  const isHigh = leak.severity === 'High';
                  const isMed = leak.severity === 'Medium';
                  return (
                    <div key={leak.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between relative backdrop-blur-md">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            {leak.category}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                            isHigh 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                              : isMed 
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {leak.severity}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white leading-snug">{leak.title}</h4>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400">{isTa ? 'மாதாந்திர இழப்பு:' : 'Monthly Leak:'}</span>
                            <p className="text-sm font-bold text-slate-200 font-mono">{currency}{leak.monthlyAvg}/mo</p>
                          </div>
                          <div>
                            <span className="text-slate-400">{isTa ? 'வருடாந்திர சேமிப்பு:' : 'Annual Savings:'}</span>
                            <p className="text-sm font-bold text-emerald-400 font-mono">{currency}{leak.annualPotential}/yr</p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcknowledge(leak.id)}
                        className="mt-6 flex items-center justify-center gap-1.5 w-full bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-semibold py-2 rounded-xl transition text-xs border border-slate-700/50"
                      >
                        <Check className="w-4 h-4" />
                        {isTa ? 'சரிகிட்டுவிட்டேன்' : 'Acknowledge Leak'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <p className="text-slate-400 text-sm">
                  {isTa ? 'தற்போது வரை எந்தவொரு கசிவும் கண்டறியப்படவில்லை!' : 'No active leaks currently flagged. All operations running efficiently.'}
                </p>
              </div>
            )}
          </div>

          {/* Resolved leaks list */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              {isTa ? 'சரிசெய்யப்பட்டவை' : 'Leaks Fixed / Acknowledged'}
              <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-mono font-bold">
                {fixedLeaks.length}
              </span>
            </h3>

            {fixedLeaks.length > 0 ? (
              <div className="space-y-3">
                {fixedLeaks.map((leak) => (
                  <div key={leak.id} className="p-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-300 line-clamp-1">{leak.title}</h5>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Saved: +{currency}{leak.annualPotential.toLocaleString()}/yr</p>
                    </div>
                    <span className="p-1 bg-emerald-400/10 text-emerald-400 rounded-full">
                      <Check className="w-4 h-4" />
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-600 text-xs italic">
                {isTa ? 'இன்னும் கசிவுகள் சரிசெய்யப்படவில்லை.' : 'Once acknowledged, leaking items will show here.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
