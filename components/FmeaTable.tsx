'use client';

import React, { useState } from 'react';
import { FmeaWorksheet, FmeaHazardItem, RiskLevel, ActionStatus, UserProfile } from '@/types/fmea';
import { 
  SEVERITY_OPTIONS, 
  OCCURRENCE_OPTIONS, 
  DETECTION_OPTIONS, 
  computeRiskMetrics 
} from '@/lib/fmea-scores';
import { 
  Edit3, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  ArrowDownRight, 
  TrendingDown, 
  ShieldAlert, 
  ShieldCheck,
  Calendar,
  Users,
  Award,
  Filter,
  Check,
  FileText,
  Plus,
  Save,
  ChevronDown
} from 'lucide-react';

interface FmeaTableProps {
  worksheet: FmeaWorksheet;
  currentUser: UserProfile;
  onEditHazard: (hazard: FmeaHazardItem) => void;
  onDeleteHazard: (hazardId: string) => void;
  onAiAutoReanalyze: (hazard: FmeaHazardItem) => void;
  onToggleActionStatus: (hazardId: string, currentStatus: ActionStatus) => void;
  onInlineUpdateHazard: (hazard: FmeaHazardItem) => void;
  onExportWord: () => void;
  onAddNewRow: () => void;
}

export const FmeaTable: React.FC<FmeaTableProps> = ({
  worksheet,
  currentUser,
  onEditHazard,
  onDeleteHazard,
  onAiAutoReanalyze,
  onToggleActionStatus,
  onInlineUpdateHazard,
  onExportWord,
  onAddNewRow,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ActionStatus>('all');

  const filteredHazards = worksheet.hazards.filter((h) => {
    const matchesSearch =
      h.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.potentialHazard.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.consequence.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.rootCauses.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.proposedControls.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.correctiveAction.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'all' || h.judgment1 === riskFilter;
    const matchesStatus = statusFilter === 'all' || h.correctiveAction.status === statusFilter;

    return matchesSearch && matchesRisk && matchesStatus;
  });

  // Calculate stats
  const totalHazards = worksheet.hazards.length;
  const highRisks = worksheet.hazards.filter((h) => h.rpn1 >= 180 || h.judgment1 === 'H' || h.severity1 >= 8).length;
  const completedActions = worksheet.hazards.filter((h) => h.correctiveAction.status === 'completed').length;
  const avgRpn1 = totalHazards > 0 ? Math.round(worksheet.hazards.reduce((acc, h) => acc + h.rpn1, 0) / totalHazards) : 0;
  const avgRpn2 = totalHazards > 0 ? Math.round(worksheet.hazards.reduce((acc, h) => acc + h.rpn2, 0) / totalHazards) : 0;
  const totalReduction = avgRpn1 > 0 ? Math.round(((avgRpn1 - avgRpn2) / avgRpn1) * 100) : 0;

  // Handle live inline updates for text fields
  const handleFieldChange = (hazard: FmeaHazardItem, fieldName: keyof FmeaHazardItem, value: any) => {
    const updated = { ...hazard, [fieldName]: value, updatedAt: new Date().toISOString().split('T')[0] };
    onInlineUpdateHazard(updated);
  };

  // Handle live inline updates for CAPA fields
  const handleCapaChange = (hazard: FmeaHazardItem, fieldName: string, value: any) => {
    const updated = {
      ...hazard,
      correctiveAction: {
        ...hazard.correctiveAction,
        [fieldName]: value,
      },
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onInlineUpdateHazard(updated);
  };

  // Handle Assessment 1 score changes via dropdown
  const handleScore1Change = (hazard: FmeaHazardItem, type: 's' | 'o' | 'd', newVal: number) => {
    const s = type === 's' ? newVal : hazard.severity1;
    const o = type === 'o' ? newVal : hazard.occurrence1;
    const d = type === 'd' ? newVal : hazard.detection1;
    const { rpn, judgment } = computeRiskMetrics(s, o, d);

    const updated: FmeaHazardItem = {
      ...hazard,
      severity1: s,
      occurrence1: o,
      detection1: d,
      rpn1: rpn,
      judgment1: judgment,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onInlineUpdateHazard(updated);
  };

  // Handle Assessment 2 score changes via dropdown
  const handleScore2Change = (hazard: FmeaHazardItem, type: 's' | 'o' | 'd', newVal: number) => {
    const s = type === 's' ? newVal : hazard.severity2;
    const o = type === 'o' ? newVal : hazard.occurrence2;
    const d = type === 'd' ? newVal : hazard.detection2;
    const { rpn, judgment } = computeRiskMetrics(s, o, d);

    const updated: FmeaHazardItem = {
      ...hazard,
      severity2: s,
      occurrence2: o,
      detection2: d,
      rpn2: rpn,
      judgment2: judgment,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onInlineUpdateHazard(updated);
  };

  const getJudgmentBadge = (judgment: RiskLevel, rpn: number) => {
    if (judgment === 'H' || rpn >= 200) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[11px] shadow-sm">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          H (بحرانی)
        </span>
      );
    }
    if (judgment === 'M' || rpn >= 100) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[11px] shadow-sm">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          M (متوسط)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] shadow-sm">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        L (پایین)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Official Form Header Summary Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                فرم استاندارد FMEA با قابلیت ویرایش مستقیم جدول
              </span>
              <span className="text-xs text-slate-400">شناسه: {worksheet.id}</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              کارگاه: <span className="text-amber-400">{worksheet.workshopName}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <strong>تاریخ اجرا:</strong> {worksheet.executionDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <strong>اعضای تیم:</strong> {worksheet.teamMembers.join(' - ')}
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <strong>تایید رئیس بهداشت حرفه‌ای:</strong>{' '}
                {worksheet.hseManagerApproved ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> تایید شده ({worksheet.hseManagerName})
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">در انتظار بررسی و امضا</span>
                )}
              </span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
              <div className="text-slate-400 text-[11px] mb-0.5">تعداد کل خطرات</div>
              <div className="text-xl font-black text-white">{totalHazards}</div>
            </div>

            <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
              <div className="text-rose-300 text-[11px] mb-0.5">موارد ریسک بالا</div>
              <div className="text-xl font-black text-rose-400">{highRisks}</div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
              <div className="text-emerald-300 text-[11px] mb-0.5">کاهش میانگین RPN</div>
              <div className="text-xl font-black text-emerald-400 flex items-center justify-center gap-1">
                <TrendingDown className="w-4 h-4" />
                <span>{totalReduction}٪</span>
              </div>
            </div>

            <div className="bg-cyan-950/40 border border-cyan-800/50 rounded-xl px-4 py-2.5 text-center min-w-[100px]">
              <div className="text-cyan-300 text-[11px] mb-0.5">اقدامات اصلاحی انجام‌شده</div>
              <div className="text-xl font-black text-cyan-400">
                {completedActions} / {totalHazards}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter, Search & Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو در فعالیت، خطر، علل، اقدامات کنترلی و اصلاحی..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pr-9 pl-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">سطح ریسک:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">همه</option>
              <option value="H" className="bg-slate-900 text-rose-400">بحرانی (H)</option>
              <option value="M" className="bg-slate-900 text-amber-400">متوسط (M)</option>
              <option value="L" className="bg-slate-900 text-emerald-400">پایین (L)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">وضعیت CAPA:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">همه</option>
              <option value="completed" className="bg-slate-900 text-emerald-400">تکمیل شده</option>
              <option value="in_progress" className="bg-slate-900 text-cyan-400">در حال انجام</option>
              <option value="pending" className="bg-slate-900 text-slate-300">در انتظار</option>
              <option value="overdue" className="bg-slate-900 text-rose-400">منقضی</option>
            </select>
          </div>

          {/* Word Export Button */}
          <button
            onClick={onExportWord}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-md shadow-blue-600/20 cursor-pointer"
            title="دانلود خروجی کامل جدول به فرمت استاندارد مایکروسافت ورد (.doc)"
          >
            <FileText className="w-4 h-4" />
            <span>خروجی Word (.doc)</span>
          </button>

          {/* Quick Add Row Button */}
          <button
            onClick={onAddNewRow}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن ردیف</span>
          </button>
        </div>

      </div>

      {/* Main Interactive FMEA Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-2xl bg-slate-900/90">
        <table className="w-full text-right text-xs border-collapse min-w-[1300px]">
          
          {/* Main Table Headers */}
          <thead>
            
            {/* Top Level Category Headers */}
            <tr className="bg-slate-800/95 text-slate-200 font-bold border-b border-slate-700 text-center">
              <th rowSpan={2} className="py-3 px-2 border-l border-slate-700 w-10">ردیف</th>
              <th rowSpan={2} className="py-3 px-2.5 border-l border-slate-700 w-36 text-right">فعالیت</th>
              <th rowSpan={2} className="py-3 px-2.5 border-l border-slate-700 w-44 text-right">خطرات بالقوه</th>
              <th rowSpan={2} className="py-3 px-2.5 border-l border-slate-700 w-40 text-right">پیامد خطر</th>
              <th rowSpan={2} className="py-3 px-2.5 border-l border-slate-700 w-44 text-right">علت / علل</th>
              
              {/* ارزیابی ۱ */}
              <th colSpan={4} className="py-2 px-2 border-l border-slate-700 bg-slate-800/90 text-amber-300 font-black">
                ارزیابی ۱ <br />
                <span className="text-[10px] font-normal text-slate-300">با در نظر گرفتن اقدامات کنترلی موجود</span>
              </th>

              {/* قضاوت */}
              <th rowSpan={2} className="py-3 px-2 border-l border-slate-700 w-24 text-center font-black text-amber-300">
                قضاوت
              </th>

              {/* اقدامات کنترلی پیشنهادی */}
              <th rowSpan={2} className="py-3 px-2.5 border-l border-slate-700 w-48 text-right text-cyan-300">
                اقدامات کنترلی پیشنهادی
              </th>

              {/* ستون درخواستی: اقدام اصلاحی */}
              <th rowSpan={2} className="py-3 px-2.5 border-l border-slate-700 w-64 text-right text-amber-300 bg-amber-950/20">
                اقدام اصلاحی (CAPA)
                <span className="block text-[10px] font-normal text-amber-400/80">شرح مراحل، مهلت اجرا (۱۴۰۵) و وضعیت</span>
              </th>

              {/* ارزیابی ۲ */}
              <th colSpan={5} className="py-2 px-2 border-l border-slate-700 bg-emerald-950/30 text-emerald-300 font-black">
                ارزیابی ۲ <br />
                <span className="text-[10px] font-normal text-slate-300">با در نظر گرفتن اقدامات کنترلی پیشنهادی و اصلاحی</span>
              </th>

              <th rowSpan={2} className="py-3 px-2 text-center w-20 no-print">عملیات</th>
            </tr>

            {/* Sub-headers with Dropdown indicator */}
            <tr className="bg-slate-850 text-slate-300 text-[11px] font-bold border-b border-slate-700 text-center">
              {/* ارزیابی ۱ */}
              <th className="py-1.5 px-1 border-l border-slate-700 w-24 text-amber-400" title="لیست کشویی انتخاب شدت ۱ تا ۱۰">
                شدت (S) ▼
              </th>
              <th className="py-1.5 px-1 border-l border-slate-700 w-24 text-amber-400" title="لیست کشویی انتخاب احتمال ۱ تا ۱۰">
                احتمال (O) ▼
              </th>
              <th className="py-1.5 px-1 border-l border-slate-700 w-24 text-amber-400" title="لیست کشویی انتخاب قابلیت کشف ۱ تا ۱۰">
                کشف (D) ▼
              </th>
              <th className="py-1.5 px-1 border-l border-slate-700 w-12 font-black text-amber-300 bg-amber-500/10">RPN</th>

              {/* ارزیابی ۲ */}
              <th className="py-1.5 px-1 border-l border-slate-700 w-24 text-emerald-400" title="لیست کشویی انتخاب شدت ثانویه">
                شدت ۲ ▼
              </th>
              <th className="py-1.5 px-1 border-l border-slate-700 w-24 text-emerald-400" title="لیست کشویی انتخاب احتمال ثانویه">
                احتمال ۲ ▼
              </th>
              <th className="py-1.5 px-1 border-l border-slate-700 w-24 text-emerald-400" title="لیست کشویی انتخاب کشف ثانویه">
                کشف ۲ ▼
              </th>
              <th className="py-1.5 px-1 border-l border-slate-700 w-12 font-black text-emerald-300 bg-emerald-500/10">RPN</th>
              <th className="py-1.5 px-1 border-l border-slate-700 w-12 font-bold text-emerald-400">کاهش</th>
            </tr>

          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-800">
            {filteredHazards.length === 0 ? (
              <tr>
                <td colSpan={18} className="py-8 text-center text-slate-400">
                  هیچ ردیف ارزیابی خطری با این مشخصات یافت نشد.
                </td>
              </tr>
            ) : (
              filteredHazards.map((hazard, index) => {
                const reductionPct = hazard.rpn1 > 0 
                  ? Math.max(0, Math.round(((hazard.rpn1 - hazard.rpn2) / hazard.rpn1) * 100))
                  : 0;

                const isHigh = hazard.rpn1 >= 180 || hazard.judgment1 === 'H' || hazard.severity1 >= 8;

                return (
                  <tr
                    key={hazard.id}
                    className={`transition hover:bg-slate-800/40 ${
                      isHigh ? 'bg-rose-950/15' : index % 2 === 1 ? 'bg-slate-900/50' : 'bg-slate-900/10'
                    }`}
                  >
                    {/* ردیف */}
                    <td className="py-2.5 px-2 text-center font-bold text-slate-400 border-l border-slate-800 align-top">
                      {hazard.rowNumber || index + 1}
                    </td>

                    {/* فعالیت (مستقیماً قابل ویرایش) */}
                    <td className="py-2 px-2 border-l border-slate-800 align-top">
                      <textarea
                        rows={2}
                        value={hazard.activity}
                        onChange={(e) => handleFieldChange(hazard, 'activity', e.target.value)}
                        placeholder="فعالیت..."
                        className="w-full bg-slate-950/60 hover:bg-slate-950 border border-transparent hover:border-slate-700 focus:border-amber-500 focus:bg-slate-950 rounded px-2 py-1 text-xs text-slate-100 font-medium focus:outline-none transition resize-none leading-relaxed"
                      />
                    </td>

                    {/* خطرات بالقوه (مستقیماً قابل ویرایش) */}
                    <td className="py-2 px-2 border-l border-slate-800 align-top">
                      <div className="relative">
                        <textarea
                          rows={2}
                          value={hazard.potentialHazard}
                          onChange={(e) => handleFieldChange(hazard, 'potentialHazard', e.target.value)}
                          placeholder="خطر بالقوه..."
                          className="w-full bg-slate-950/60 hover:bg-slate-950 border border-transparent hover:border-slate-700 focus:border-amber-500 focus:bg-slate-950 rounded px-2 py-1 text-xs text-amber-200 font-bold focus:outline-none transition resize-none leading-relaxed"
                        />
                        {isHigh && (
                          <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        )}
                      </div>
                    </td>

                    {/* پیامد خطر (مستقیماً قابل ویرایش) */}
                    <td className="py-2 px-2 border-l border-slate-800 align-top">
                      <textarea
                        rows={2}
                        value={hazard.consequence}
                        onChange={(e) => handleFieldChange(hazard, 'consequence', e.target.value)}
                        placeholder="پیامد خطر..."
                        className="w-full bg-slate-950/60 hover:bg-slate-950 border border-transparent hover:border-slate-700 focus:border-amber-500 focus:bg-slate-950 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none transition resize-none leading-relaxed"
                      />
                    </td>

                    {/* علت / علل (مستقیماً قابل ویرایش) */}
                    <td className="py-2 px-2 border-l border-slate-800 align-top">
                      <textarea
                        rows={2}
                        value={hazard.rootCauses}
                        onChange={(e) => handleFieldChange(hazard, 'rootCauses', e.target.value)}
                        placeholder="علل ریشه‌ای..."
                        className="w-full bg-slate-950/60 hover:bg-slate-950 border border-transparent hover:border-slate-700 focus:border-amber-500 focus:bg-slate-950 rounded px-2 py-1 text-[11px] text-slate-400 focus:outline-none transition resize-none leading-relaxed"
                      />
                    </td>

                    {/* ارزیابی ۱: S1 Dropdown */}
                    <td className="py-2 px-1 border-l border-slate-800 align-top text-center">
                      <select
                        value={hazard.severity1}
                        onChange={(e) => handleScore1Change(hazard, 's', Number(e.target.value))}
                        aria-label="انتخاب شدت ۱"
                        className={`w-full bg-slate-950 border text-center rounded px-1 py-1 text-xs font-black cursor-pointer focus:outline-none ${
                          hazard.severity1 >= 8
                            ? 'border-rose-500/60 text-rose-300 bg-rose-950/40'
                            : 'border-slate-700 text-amber-300'
                        }`}
                        title="انتخاب شدت خطر از ۱ تا ۱۰"
                      >
                        {SEVERITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 text-right">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="text-[9px] text-slate-400 mt-1 truncate max-w-[90px]" title={SEVERITY_OPTIONS.find(o => o.value === hazard.severity1)?.description}>
                        {SEVERITY_OPTIONS.find(o => o.value === hazard.severity1)?.description.substring(0, 15)}...
                      </div>
                    </td>

                    {/* ارزیابی ۱: O1 Dropdown */}
                    <td className="py-2 px-1 border-l border-slate-800 align-top text-center">
                      <select
                        value={hazard.occurrence1}
                        onChange={(e) => handleScore1Change(hazard, 'o', Number(e.target.value))}
                        aria-label="انتخاب احتمال ۱"
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-center rounded px-1 py-1 text-xs font-bold cursor-pointer focus:outline-none focus:border-amber-500"
                        title="انتخاب احتمال وقوع از ۱ تا ۱۰"
                      >
                        {OCCURRENCE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 text-right">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="text-[9px] text-slate-400 mt-1 truncate max-w-[90px]" title={OCCURRENCE_OPTIONS.find(o => o.value === hazard.occurrence1)?.description}>
                        {OCCURRENCE_OPTIONS.find(o => o.value === hazard.occurrence1)?.description.substring(0, 15)}...
                      </div>
                    </td>

                    {/* ارزیابی ۱: D1 Dropdown */}
                    <td className="py-2 px-1 border-l border-slate-800 align-top text-center">
                      <select
                        value={hazard.detection1}
                        onChange={(e) => handleScore1Change(hazard, 'd', Number(e.target.value))}
                        aria-label="انتخاب کشف ۱"
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-center rounded px-1 py-1 text-xs font-bold cursor-pointer focus:outline-none focus:border-amber-500"
                        title="انتخاب قابلیت کشف/کنترل از ۱ تا ۱۰"
                      >
                        {DETECTION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 text-right">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <div className="text-[9px] text-slate-400 mt-1 truncate max-w-[90px]" title={DETECTION_OPTIONS.find(o => o.value === hazard.detection1)?.description}>
                        {DETECTION_OPTIONS.find(o => o.value === hazard.detection1)?.description.substring(0, 15)}...
                      </div>
                    </td>

                    {/* RPN 1 Calculated */}
                    <td className="py-2 px-1 text-center font-black text-amber-300 bg-amber-500/10 border-l border-slate-800 text-sm align-middle">
                      {hazard.rpn1}
                    </td>

                    {/* قضاوت */}
                    <td className="py-2 px-2 text-center border-l border-slate-800 align-middle">
                      {getJudgmentBadge(hazard.judgment1, hazard.rpn1)}
                    </td>

                    {/* اقدامات کنترلی پیشنهادی (مستقیماً قابل ویرایش) */}
                    <td className="py-2 px-2 text-slate-200 border-l border-slate-800 align-top">
                      <textarea
                        rows={2}
                        value={hazard.proposedControls}
                        onChange={(e) => handleFieldChange(hazard, 'proposedControls', e.target.value)}
                        placeholder="اقدامات پیشنهادی..."
                        className="w-full bg-slate-950/60 hover:bg-slate-950 border border-transparent hover:border-slate-700 focus:border-cyan-500 focus:bg-slate-950 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none transition resize-none leading-relaxed"
                      />
                    </td>

                    {/* اقدام اصلاحی (CAPA) - مستقیماً قابل ویرایش */}
                    <td className="py-2 px-2 border-l border-slate-800 align-top bg-amber-950/10 space-y-1.5">
                      <input
                        type="text"
                        value={hazard.correctiveAction.title}
                        onChange={(e) => handleCapaChange(hazard, 'title', e.target.value)}
                        placeholder="عنوان اقدام اصلاحی..."
                        className="w-full bg-slate-950 border border-slate-800 hover:border-amber-500/60 focus:border-amber-500 rounded px-2 py-0.5 text-xs text-amber-200 font-bold focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        value={hazard.correctiveAction.description}
                        onChange={(e) => handleCapaChange(hazard, 'description', e.target.value)}
                        placeholder="شرح مراحل اجرایی..."
                        className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded px-2 py-1 text-[10px] text-slate-300 focus:outline-none resize-none leading-tight"
                      />
                      
                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="flex-1 flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-2 py-0.5">
                          <span className="text-[10px] text-slate-400 shrink-0">مهلت:</span>
                          <input
                            type="text"
                            value={hazard.correctiveAction.targetDate}
                            onChange={(e) => handleCapaChange(hazard, 'targetDate', e.target.value)}
                            placeholder="1405/03/30"
                            className="bg-transparent text-[10px] text-amber-300 font-bold focus:outline-none w-full"
                          />
                        </div>

                        <select
                          value={hazard.correctiveAction.status}
                          onChange={(e) => handleCapaChange(hazard, 'status', e.target.value as ActionStatus)}
                          aria-label="وضعیت اقدام اصلاحی"
                          className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-[10px] font-bold text-cyan-300 focus:outline-none cursor-pointer"
                        >
                          <option value="pending" className="bg-slate-900 text-slate-300">در انتظار بررسی</option>
                          <option value="in_progress" className="bg-slate-900 text-cyan-300">در حال انجام</option>
                          <option value="completed" className="bg-slate-900 text-emerald-300">تکمیل شده</option>
                          <option value="overdue" className="bg-slate-900 text-rose-300">منقضی شده</option>
                        </select>
                      </div>

                      {hazard.correctiveAction.status === 'completed' && (
                        <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 pt-0.5">
                          <Check className="w-3 h-3" /> اثربخشی اقدام تایید شد
                        </div>
                      )}
                    </td>

                    {/* ارزیابی ۲: S2 Dropdown */}
                    <td className="py-2 px-1 border-l border-slate-800 align-top text-center">
                      <select
                        value={hazard.severity2}
                        onChange={(e) => handleScore2Change(hazard, 's', Number(e.target.value))}
                        aria-label="انتخاب شدت ۲"
                        className="w-full bg-slate-950 border border-slate-700 text-emerald-300 text-center rounded px-1 py-1 text-xs font-bold cursor-pointer focus:outline-none focus:border-emerald-500"
                        title="شدت ثانویه پس از کنترل"
                      >
                        {SEVERITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 text-right">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* ارزیابی ۲: O2 Dropdown */}
                    <td className="py-2 px-1 border-l border-slate-800 align-top text-center">
                      <select
                        value={hazard.occurrence2}
                        onChange={(e) => handleScore2Change(hazard, 'o', Number(e.target.value))}
                        aria-label="انتخاب احتمال ۲"
                        className="w-full bg-slate-950 border border-slate-700 text-emerald-300 text-center rounded px-1 py-1 text-xs font-bold cursor-pointer focus:outline-none focus:border-emerald-500"
                        title="احتمال ثانویه پس از کنترل"
                      >
                        {OCCURRENCE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 text-right">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* ارزیابی ۲: D2 Dropdown */}
                    <td className="py-2 px-1 border-l border-slate-800 align-top text-center">
                      <select
                        value={hazard.detection2}
                        onChange={(e) => handleScore2Change(hazard, 'd', Number(e.target.value))}
                        aria-label="انتخاب کشف ۲"
                        className="w-full bg-slate-950 border border-slate-700 text-emerald-300 text-center rounded px-1 py-1 text-xs font-bold cursor-pointer focus:outline-none focus:border-emerald-500"
                        title="کشف ثانویه پس از کنترل"
                      >
                        {DETECTION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100 text-right">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* RPN 2 Calculated */}
                    <td className="py-2 px-1 text-center font-black text-emerald-400 bg-emerald-500/10 border-l border-slate-800 text-sm align-middle">
                      {hazard.rpn2}
                    </td>

                    {/* کاهش ریسک */}
                    <td className="py-2 px-1 text-center border-l border-slate-800 align-middle">
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        <ArrowDownRight className="w-3 h-3" />
                        {reductionPct}٪
                      </span>
                    </td>

                    {/* عملیات */}
                    <td className="py-2 px-1 text-center no-print align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onAiAutoReanalyze(hazard)}
                          className="p-1 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 transition"
                          title="تحلیل مجدد با AI"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditHazard(hazard)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                          title="فرم پیشرفته ویرایش"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteHazard(hazard.id)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition"
                          title="حذف ردیف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
};
