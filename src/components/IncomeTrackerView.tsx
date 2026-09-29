import React, { useState } from 'react';
import { Income } from '../types';
import { Plus, Search, Trash2, Edit2, Wallet, ArrowUpRight } from 'lucide-react';

interface IncomeTrackerViewProps {
  income: Income[];
  currency: string;
  onAddIncome: (data: { amount: number; sourceType: string; note: string; date: string }) => Promise<void>;
  onUpdateIncome: (id: number, data: Partial<Income>) => Promise<void>;
  onDeleteIncome: (id: number) => Promise<void>;
  lang: string;
}

const SOURCES = ['Salary', 'Freelance', 'Business', 'Investments', 'Gifts', 'Other'];

export default function IncomeTrackerView({ income, currency, onAddIncome, onUpdateIncome, onDeleteIncome, lang }: IncomeTrackerViewProps) {
  const isTa = lang === 'ta';

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [amount, setAmount] = useState('');
  const [sourceType, setSourceType] = useState(SOURCES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Submit new income
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    await onAddIncome({
      amount: Number(amount),
      sourceType,
      note,
      date
    });
    setAmount('');
    setNote('');
    setIsAddOpen(false);
  };

  // Start edit mode
  const handleStartEdit = (inc: Income) => {
    setEditingId(inc.id);
    setAmount(inc.amount.toString());
    setSourceType(inc.sourceType);
    setNote(inc.note || '');
    setDate(inc.date);
    setIsEditOpen(true);
  };

  // Submit edited income
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !amount || isNaN(Number(amount))) return;
    await onUpdateIncome(editingId, {
      amount: Number(amount),
      sourceType,
      note,
      date
    });
    setIsEditOpen(false);
    setEditingId(null);
    setAmount('');
    setNote('');
  };

  const filteredIncome = income.filter(inc => {
    const matchesSearch = (inc.note?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          inc.sourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inc.amount.toString().includes(searchTerm);
    return matchesSearch;
  });

  const totalIncome = income.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white">
            {isTa ? 'வருமான கண்காணிப்பாளர்' : 'Income Tracker'}
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            {isTa ? 'உங்களின் வருவாய் ஆதாரங்கள் மற்றும் வைப்புத்தொகைகளை பதிவு செய்யுங்கள்' : 'Record your earning streams, freelance payouts, and investments'}
          </p>
        </div>
        <button
          onClick={() => {
            setAmount('');
            setNote('');
            setDate(new Date().toISOString().split('T')[0]);
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 bg-brand-primary hover:opacity-90 text-[#002e6a] font-bold px-4 py-2.5 rounded-xl transition text-sm cursor-pointer shadow-lg shadow-brand-primary/10"
        >
          <Plus className="w-4 h-4" />
          {isTa ? 'வருமானத்தைச் சேர்' : 'Add Income'}
        </button>
      </div>

      {/* Income Summary Card */}
      <div className="bg-brand-card border border-brand-border p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-brand-green/10 text-brand-green rounded-2xl">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-brand-muted text-sm font-medium">{isTa ? 'மொத்த திரட்டப்பட்ட வருமானம்' : 'Total Cumulative Earnings'}</p>
            <h3 className="text-3xl font-bold font-mono text-brand-green mt-1">{currency}{totalIncome.toLocaleString()}</h3>
          </div>
        </div>
        <div className="text-sm text-brand-muted font-medium">
          {isTa ? 'சகை ஆதாரங்களின் எண்ணிக்கை:' : 'Active earning streams:'} <span className="text-white font-bold">{new Set(income.map(i => i.sourceType)).size}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-brand-card-light p-4 border border-brand-border/80 rounded-2xl">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-brand-muted-dark absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isTa ? 'தேடு (குறிப்பு, மூலம் அல்லது தொகை)...' : 'Search earnings (note, source, amount)...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary transition font-mono"
          />
        </div>
      </div>

      {/* Income Table */}
      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border bg-brand-card-light/50 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                <th className="p-4">{isTa ? 'மூலம்' : 'Source'}</th>
                <th className="p-4">{isTa ? 'தேதி' : 'Date'}</th>
                <th className="p-4">{isTa ? 'குறிப்பு' : 'Note'}</th>
                <th className="p-4 text-right">{isTa ? 'தொகை' : 'Amount'}</th>
                <th className="p-4 text-right">{isTa ? 'செயல்பாடுகள்' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-sm">
              {filteredIncome.length > 0 ? (
                filteredIncome.map((inc) => (
                  <tr key={inc.id} className="hover:bg-brand-card-light/40 transition">
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-brand-green/10 border border-brand-green/20 rounded-lg text-xs font-medium text-brand-green">
                        {inc.sourceType}
                      </span>
                    </td>
                    <td className="p-4 text-brand-text font-mono text-xs">
                      {inc.date}
                    </td>
                    <td className="p-4 text-brand-text">
                      {inc.note || <span className="text-brand-muted-dark italic">-</span>}
                    </td>
                    <td className="p-4 text-right font-bold text-brand-green font-mono">
                      +{currency}{inc.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleStartEdit(inc)}
                          className="p-1.5 hover:bg-brand-card-light text-brand-muted hover:text-brand-green rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteIncome(inc.id)}
                          className="p-1.5 hover:bg-brand-card-light text-brand-muted hover:text-brand-rose rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-brand-muted-dark">
                    {isTa ? 'பொருந்தும் வருமானப் பதிவுகள் எதுவும் இல்லை.' : 'No income records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {isTa ? 'வருமானத்தைச் சேர்' : 'Add Income Entry'}
            </h2>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'தொகை' : 'Amount'}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-brand-muted-dark">{currency}</span>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-brand-card-light border border-brand-border/60 rounded-xl pl-8 pr-4 py-2 text-white focus:outline-none focus:border-brand-primary font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'வருவாய் ஆதாரம்' : 'Source Type'}</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full bg-brand-card-light border border-brand-border/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-primary"
                >
                  {SOURCES.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'தேதி' : 'Date'}</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-brand-card-light border border-brand-border/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'குறிப்பு' : 'Note (Optional)'}</label>
                <input
                  type="text"
                  placeholder={isTa ? 'எ.கா. மாதாந்திர ஊதியம்' : 'e.g. Monthly corporate salary'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-brand-card-light border border-brand-border/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 bg-brand-card-light hover:opacity-95 text-brand-muted border border-brand-border/40 font-semibold py-2 rounded-xl transition text-sm cursor-pointer"
                >
                  {isTa ? 'ரத்துசெய்' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary hover:opacity-90 text-[#002e6a] font-bold py-2 rounded-xl transition text-sm cursor-pointer"
                >
                  {isTa ? 'வருமானத்தைச் சேர்' : 'Save Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {isTa ? 'வருமானத்தைத் திருத்து' : 'Edit Income Entry'}
            </h2>
            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'தொகை' : 'Amount'}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-brand-muted-dark">{currency}</span>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-brand-card-light border border-brand-border/60 rounded-xl pl-8 pr-4 py-2 text-white focus:outline-none focus:border-brand-primary font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'வருவாய் ஆதாரம்' : 'Source Type'}</label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full bg-brand-card-light border border-brand-border/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-primary"
                >
                  {SOURCES.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'தேதி' : 'Date'}</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-brand-card-light border border-brand-border/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'குறிப்பு' : 'Note (Optional)'}</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-brand-card-light border border-brand-border/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 bg-brand-card-light hover:opacity-95 text-brand-muted border border-brand-border/40 font-semibold py-2 rounded-xl transition text-sm cursor-pointer"
                >
                  {isTa ? 'ரத்துசெய்' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-primary hover:opacity-90 text-[#002e6a] font-bold py-2 rounded-xl transition text-sm cursor-pointer"
                >
                  {isTa ? 'புதுப்பி' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
