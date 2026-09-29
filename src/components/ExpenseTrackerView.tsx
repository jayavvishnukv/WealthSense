import React, { useState } from 'react';
import { Expense } from '../types';
import { Plus, Search, Filter, Trash2, Edit2, Calendar, FileText, IndianRupee } from 'lucide-react';

interface ExpenseTrackerViewProps {
  expenses: Expense[];
  currency: string;
  onAddExpense: (data: { amount: number; category: string; note: string; date: string; time: string }) => Promise<void>;
  onUpdateExpense: (id: number, data: Partial<Expense>) => Promise<void>;
  onDeleteExpense: (id: number) => Promise<void>;
  lang: string;
}

const CATEGORIES = ['Food', 'Transport', 'Rent', 'Entertainment', 'Subscriptions', 'Healthcare', 'Shopping', 'Utilities', 'Other'];

export default function ExpenseTrackerView({ expenses, currency, onAddExpense, onUpdateExpense, onDeleteExpense, lang }: ExpenseTrackerViewProps) {
  const isTa = lang === 'ta';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');

  // Submit new expense
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;
    await onAddExpense({
      amount: Number(amount),
      category,
      note,
      date,
      time
    });
    // Reset Form
    setAmount('');
    setNote('');
    setIsAddOpen(false);
  };

  // Trigger edit mode
  const handleStartEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setAmount(exp.amount.toString());
    setCategory(exp.category);
    setNote(exp.note || '');
    setDate(exp.date);
    setTime(exp.time || '12:00');
    setIsEditOpen(true);
  };

  // Submit edited expense
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !amount || isNaN(Number(amount))) return;
    await onUpdateExpense(editingId, {
      amount: Number(amount),
      category,
      note,
      date,
      time
    });
    setIsEditOpen(false);
    setEditingId(null);
    setAmount('');
    setNote('');
  };

  // Filter list
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = (exp.note?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exp.amount.toString().includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white">
            {isTa ? 'செலவு கண்காணிப்பாளர்' : 'Expense Tracker'}
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            {isTa ? 'உங்களின் அன்றாட செலவுகளைப் பதிவு செய்து வகைப்படுத்துங்கள்' : 'Log, track, and categorize your day-to-day spending'}
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
          {isTa ? 'புதிய செலவு' : 'Add Expense'}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-brand-card-light p-4 border border-brand-border/80 rounded-2xl">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-brand-muted-dark absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isTa ? 'தேடு (குறிப்பு, வகை அல்லது தொகை)...' : 'Search expense (note, category, amount)...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-card border border-brand-border rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary transition font-mono"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-muted-dark" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-brand-card border border-brand-border rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary transition"
          >
            <option value="All">{isTa ? 'அனைத்து வகைகள்' : 'All Categories'}</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expense List Table/Cards */}
      <div className="bg-brand-card border border-brand-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border bg-brand-card-light/50 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                <th className="p-4">{isTa ? 'வகை' : 'Category'}</th>
                <th className="p-4">{isTa ? 'தேதி' : 'Date'}</th>
                <th className="p-4">{isTa ? 'குறிப்பு' : 'Note'}</th>
                <th className="p-4 text-right">{isTa ? 'தொகை' : 'Amount'}</th>
                <th className="p-4 text-right">{isTa ? 'செயல்பாடுகள்' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-sm">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-brand-card-light/40 transition">
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-brand-card-light border border-brand-border/40 rounded-lg text-xs font-medium text-brand-text">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-brand-text font-mono text-xs">
                      {exp.date} <span className="text-brand-muted-dark">{exp.time}</span>
                    </td>
                    <td className="p-4 text-brand-text">
                      {exp.note || <span className="text-brand-muted-dark italic">-</span>}
                    </td>
                    <td className="p-4 text-right font-bold text-white font-mono">
                      {currency}{exp.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleStartEdit(exp)}
                          className="p-1.5 hover:bg-brand-card-light text-brand-muted hover:text-brand-green rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 hover:bg-brand-card-light text-brand-muted hover:text-brand-rose rounded-lg transition cursor-pointer"
                          title="Delete"
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
                    {isTa ? 'பொருந்தும் செலவுகள் எதுவும் இல்லை.' : 'No expenses found matching the filters.'}
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
              {isTa ? 'செலவைச் சேர்' : 'Add New Expense'}
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
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'வகை' : 'Category'}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-brand-card-light border border-brand-border/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-primary"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
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
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'நேரம்' : 'Time'}</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-brand-card-light border border-brand-border/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'குறிப்பு' : 'Note (Optional)'}</label>
                <input
                  type="text"
                  placeholder={isTa ? 'எ.கா. மளிகை சாமான்கள்' : 'e.g. Grocery items'}
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
                  {isTa ? 'சேமி' : 'Save'}
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
              {isTa ? 'செலவைத் திருத்து' : 'Edit Expense'}
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
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'வகை' : 'Category'}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-brand-card-light border border-brand-border/60 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-primary"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
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
                <label className="block text-xs font-semibold text-brand-muted uppercase mb-1">{isTa ? 'நேரம்' : 'Time'}</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
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
