import React, { useState } from 'react';
import { Expense, Income, Goal } from '../types';
import { jsPDF } from 'jspdf';
import { Download, FileText, Sparkles, TrendingUp, HelpCircle, ShieldCheck } from 'lucide-react';

interface ReportsInsightsViewProps {
  expenses: Expense[];
  income: Income[];
  goals: Goal[];
  currency: string;
  lang: string;
}

const BUDGET_TIPS = [
  {
    title_en: "The 50/30/20 Rule",
    text_en: "Allocate 50% of your net income to Needs (rent, utilities), 30% to Wants (entertainment, dining), and save 20% immediately.",
    title_ta: "50/30/20 நிதி விதி",
    text_ta: "உங்கள் நிகர வருமானத்தில் 50% தேவைகளுக்கும், 30% விருப்பங்களுக்கும் ஒதுக்கி, மீதமுள்ள 20% தொகையை சேமிக்கவும்."
  },
  {
    title_en: "Avoid Lifestyle Creep",
    text_en: "When your income or freelance payout rises, keep your spending baseline steady. Put the surplus directly into your investment SIPs.",
    title_ta: "ஆடம்பரச் செலவுகளைத் தவிர்த்தல்",
    text_ta: "வருமானம் அதிகரிக்கும் போது, உங்களின் செலவுகளை அதே நிலையில் வைத்திருங்கள். கூடுதல் பணத்தை நேரடியாக முதலீடு செய்யுங்கள்."
  },
  {
    title_en: "Track the Tiny Leakages",
    text_en: "Daily tiny tea or beverage expenses (~₹50/day) cumulative into ₹18,250 a year. Use the Money Leak Detector to catch unmonitored items.",
    title_ta: "சிறு கசிவுகளைக் கண்காணித்தல்",
    text_ta: "தினசரி ₹50 போன்ற சிறிய செலவுகள் ஆண்டிற்கு ₹18,250-ஆக மாறும். சிறு கசிவு கண்டறிதலைப் பயன்படுத்தி விழிப்புடன் இருக்கவும்."
  }
];

export default function ReportsInsightsView({ expenses, income, goals, currency, lang }: ReportsInsightsViewProps) {
  const isTa = lang === 'ta';
  const [downloading, setDownloading] = useState(false);
  const [activeTip, setActiveTip] = useState(0);

  const totalIncome = income.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netSavings = Math.max(0, totalIncome - totalExpenses);

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();
      
      // Document title and headers
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text("WealthSense AI - Financial Statement", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} | System Language: ${lang.toUpperCase()}`, 14, 27);
      
      // Line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 30, 196, 30);
      
      // Financial Summary Box
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("1. Overall Financial Summary", 14, 40);
      
      doc.setFontSize(11);
      doc.text(`Total Cumulative Income: Rs. ${totalIncome.toLocaleString()}`, 18, 48);
      doc.text(`Total Cumulative Expenses: Rs. ${totalExpenses.toLocaleString()}`, 18, 55);
      doc.text(`Net Financial Savings: Rs. ${netSavings.toLocaleString()}`, 18, 62);
      doc.text(`Estimated Savings Rate: ${totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0}%`, 18, 69);
      
      // Active Goals List
      doc.setFontSize(14);
      doc.text("2. Established Financial Targets", 14, 82);
      let goalY = 90;
      if (goals.length > 0) {
        goals.forEach((g, idx) => {
          doc.setFontSize(10);
          doc.text(`${idx + 1}. ${g.name} - Target: Rs. ${g.targetAmount.toLocaleString()} | Saved: Rs. ${g.savedAmount.toLocaleString()} (${Math.round((g.savedAmount / g.targetAmount) * 100)}%)`, 18, goalY);
          goalY += 7;
        });
      } else {
        doc.setFontSize(10);
        doc.text("No active financial goals configured yet.", 18, 90);
        goalY = 97;
      }
      
      // Recent Transactions table
      doc.setFontSize(14);
      doc.text("3. Transaction Ledger", 14, goalY + 8);
      
      let ledgerY = goalY + 16;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Date", 14, ledgerY);
      doc.text("Type", 45, ledgerY);
      doc.text("Category / Source", 75, ledgerY);
      doc.text("Amount", 160, ledgerY);
      
      doc.line(14, ledgerY + 2, 196, ledgerY + 2);
      ledgerY += 8;
      doc.setTextColor(30, 41, 59);
      
      const allTransactions = [
        ...income.map(i => ({ type: 'Income', amount: i.amount, cat: i.sourceType, date: i.date })),
        ...expenses.map(e => ({ type: 'Expense', amount: e.amount, cat: e.category, date: e.date }))
      ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
      
      if (allTransactions.length > 0) {
        allTransactions.forEach((t) => {
          doc.text(t.date, 14, ledgerY);
          doc.text(t.type, 45, ledgerY);
          doc.text(t.cat, 75, ledgerY);
          doc.text(`Rs. ${t.amount.toLocaleString()}`, 160, ledgerY);
          ledgerY += 6;
        });
      } else {
        doc.text("No active transactions available inside statement ledger.", 14, ledgerY);
      }
      
      doc.save(`WealthSense_Financial_Statement_${new Date().toISOString().substring(0, 10)}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const tip = BUDGET_TIPS[activeTip];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-white flex items-center gap-2">
          <FileText className="w-8 h-8 text-emerald-400" />
          {isTa ? 'நிதிக்கூற்று மற்றும் அறிக்கைகள்' : 'Reports & Export'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isTa ? 'சேமிக்கப்பட்ட தரவுகளைக் கொண்டு நிதி அறிக்கைகளை PDF வடிவில் பதிவிறக்கம் செய்யுங்கள்' : 'Generate audit ledgers, print official statements, and read cognitive budgeting rules'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PDF Exporter Panel */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              {isTa ? 'நிதிக்கூற்றைப் பதிவிறக்கம் செய்' : 'Official Financial Statements'}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isTa ? 'உங்களின் வருமானம், செலவுகள் மற்றும் இலக்குகளின் முழுமையான விவரங்களை உள்ளடக்கிய அதிகாரப்பூர்வ நிதிக்கூற்றை PDF வடிவில் பதிவிறக்கலாம்.' : 'Compiles all established goals, budget summaries, and transaction ledgers into an offline-ready printable format.'}
            </p>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold px-6 py-3.5 rounded-xl transition text-sm disabled:opacity-50 w-full sm:w-fit"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                {isTa ? 'கோப்பு உருவாகிறது...' : 'Compiling PDF Statement...'}
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                {isTa ? 'PDF பதிவிறக்கம் செய்' : 'Download Ledger Statement'}
              </>
            )}
          </button>
        </div>

        {/* Tip of the day Carousel Slider */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between space-y-4 h-64">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {isTa ? 'இன்றைய நிதி அறிவுரை' : 'Budget Rule of the day'}
              </span>
              <div className="flex gap-1.5">
                {BUDGET_TIPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTip(idx)}
                    className={`w-2 h-2 rounded-full transition ${activeTip === idx ? 'bg-emerald-400' : 'bg-slate-700'}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-base font-bold text-white leading-snug">{isTa ? tip.title_ta : tip.title_en}</h4>
              <p className="text-slate-300 text-xs mt-2.5 leading-relaxed">{isTa ? tip.text_ta : tip.text_en}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>WealthSense Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
