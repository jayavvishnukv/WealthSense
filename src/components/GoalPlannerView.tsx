import React, { useState } from 'react';
import { Goal } from '../types';
import { Target, Plus, Search, Trash2, Edit2, Sparkles, AlertCircle, Loader } from 'lucide-react';

interface GoalPlannerViewProps {
  goals: Goal[];
  currency: string;
  onAddGoal: (data: { name: string; targetAmount: number; savedAmount: number; category: string; targetDate?: string }) => Promise<void>;
  onUpdateGoal: (id: number, data: Partial<Goal>) => Promise<void>;
  onDeleteGoal: (id: number) => Promise<void>;
  onRunGoalAi: (id: number, monthlySavings: number) => Promise<void>;
  lang: string;
}

const CATEGORIES = ['House', 'Car', 'Marriage', 'Education', 'Travel', 'Emergency', 'Retirement', 'Other'];

export default function GoalPlannerView({ goals, currency, onAddGoal, onUpdateGoal, onDeleteGoal, onRunGoalAi, lang }: GoalPlannerViewProps) {
  const isTa = lang === 'ta';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [monthlySavings, setMonthlySavings] = useState('5000');
  const [runningAi, setRunningAi] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('0');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [targetDate, setTargetDate] = useState('');

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || isNaN(Number(targetAmount))) return;
    await onAddGoal({
      name,
      targetAmount: Number(targetAmount),
      savedAmount: Number(savedAmount || 0),
      category,
      targetDate: targetDate || undefined
    });
    setName('');
    setTargetAmount('');
    setSavedAmount('0');
    setTargetDate('');
    setIsAddOpen(false);
  };

  const handleStartAi = (id: number) => {
    setSelectedGoalId(id);
    setIsAiOpen(true);
  };

  const handleRunAi = async () => {
    if (!selectedGoalId || !monthlySavings || isNaN(Number(monthlySavings))) return;
    setRunningAi(true);
    try {
      await onRunGoalAi(selectedGoalId, Number(monthlySavings));
      setIsAiOpen(false);
      setSelectedGoalId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningAi(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <Target className="w-8 h-8 text-emerald-400" />
            {isTa ? 'இலக்கு திட்டமிடுபவர்' : 'Goal Planner'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isTa ? 'உங்களின் எதிர்கால கனவு இலக்குகளை அமைத்து அவற்றின் முன்னேற்றத்தைக் கண்காணியுங்கள்' : 'Map your long-term dreams and trigger AI projections for savings paths'}
          </p>
        </div>
        <button
          onClick={() => {
            setName('');
            setTargetAmount('');
            setSavedAmount('0');
            setTargetDate('');
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-4 py-2.5 rounded-xl transition text-sm"
        >
          <Plus className="w-4 h-4" />
          {isTa ? 'புதிய இலக்கு' : 'Add New Goal'}
        </button>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
            return (
              <div key={goal.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-md text-xs font-semibold text-slate-300 uppercase">
                      {goal.category}
                    </span>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{goal.name}</h3>
                    {goal.targetDate && <p className="text-slate-500 text-xs mt-1">{isTa ? 'இலக்கு தேதி:' : 'Target date:'} {goal.targetDate}</p>}
                  </div>

                  {/* Progress meters */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-emerald-400 font-mono">{currency}{goal.savedAmount.toLocaleString()}</span>
                      <span className="text-slate-500 font-mono">/ {currency}{goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 block text-right">{percent}% {isTa ? 'சேமிக்கப்பட்டது' : 'completed'}</span>
                  </div>

                  {/* AI Prediction Section within Card */}
                  {goal.aiMonthsNeeded !== null && goal.aiMonthsNeeded !== undefined ? (
                    <div className="mt-4 p-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isTa ? 'AI பகுப்பாய்வு முடிவு' : 'AI Saving Timeline'}</span>
                      </div>
                      <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
                        <p>{isTa ? 'தேவைப்படும் மாதங்கள்:' : 'Months Needed:'} <span className="text-white font-bold font-mono">{goal.aiMonthsNeeded} months</span></p>
                        <p className="text-slate-400 italic text-[11px] mt-1">"{goal.aiMotivation}"</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <button
                  onClick={() => handleStartAi(goal.id)}
                  className="mt-6 flex items-center justify-center gap-1.5 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl transition text-xs border border-slate-700/50"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  {isTa ? 'AI சேமிப்பு காலக்கோடு கணக்கிடு' : 'Calculate AI Timeline'}
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
            <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">
              {isTa ? 'இலக்குகள் எதுவும் சேர்க்கப்படவில்லை. சேர்ப்பதன் மூலம் தொடங்கவும்.' : 'Click "Add New Goal" to establish custom targets & financial timelines.'}
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {isTa ? 'புதிய இலக்கு' : 'Establish New Goal'}
            </h2>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'இலக்கின் பெயர்' : 'Goal Name'}</label>
                <input
                  type="text"
                  required
                  placeholder={isTa ? 'எ.கா. புதிய வீடு' : 'e.g. New Electric SUV'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'இலக்கு தொகை' : 'Target Amount'}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">{currency}</span>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'தற்போது சேமித்தது' : 'Current Saved Amount'}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">{currency}</span>
                  <input
                    type="number"
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'வகை' : 'Category'}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'இலக்கு தேதி (விரும்பினால்)' : 'Target Date (Optional)'}</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl transition text-sm"
                >
                  {isTa ? 'ரத்துசெய்' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 rounded-xl transition text-sm"
                >
                  {isTa ? 'சேமி' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Months Projections input popup */}
      {isAiOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              {isTa ? 'AI சேமிப்புத் திட்ட கணக்கீடு' : 'AI Goal Timeline Calculator'}
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {isTa ? 'இந்த இலக்கிற்காக மாதந்தோறும் உங்களால் எவ்வளவு சேமிக்க முடியும்?' : 'Provide your intended monthly savings. WealthSense AI will compute the precise months needed and customized motivational advice.'}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">{isTa ? 'மாதாந்திர சேமிப்புத் தொகை' : 'Planned Monthly Savings'}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">{currency}</span>
                  <input
                    type="number"
                    required
                    value={monthlySavings}
                    onChange={(e) => setMonthlySavings(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  disabled={runningAi}
                  onClick={() => {
                    setIsAiOpen(false);
                    setSelectedGoalId(null);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl transition text-sm"
                >
                  {isTa ? 'ரத்துசெய்' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleRunAi}
                  disabled={runningAi}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-2 rounded-xl transition text-sm flex items-center justify-center gap-1.5"
                >
                  {runningAi ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      {isTa ? 'கணக்கிடுகிறது...' : 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {isTa ? 'சேமிப்புத் திட்டத்தை உருவாக்கு' : 'Run Projection'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
