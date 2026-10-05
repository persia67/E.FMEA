'use client';

import React, { useState, useEffect } from 'react';
import { FmeaHazardItem, RiskLevel, ActionStatus } from '@/types/fmea';
import { 
  X, 
  Sparkles, 
  Loader2, 
  ShieldAlert, 
  CheckCircle2, 
  Sliders, 
  ArrowLeft, 
  CheckSquare, 
  HelpCircle,
  AlertOctagon,
  Calendar,
  User,
  Wrench,
  DollarSign
} from 'lucide-react';

interface HazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hazard: FmeaHazardItem) => void;
  initialHazard?: FmeaHazardItem | null;
  workshopName: string;
}

export const HazardModal: React.FC<HazardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHazard,
  workshopName,
}) => {
  const [activity, setActivity] = useState('');
  const [potentialHazard, setPotentialHazard] = useState('');
  const [consequence, setConsequence] = useState('');
  const [rootCauses, setRootCauses] = useState('');
  const [existingControls, setExistingControls] = useState('');

  // Assessment 1
  const [severity1, setSeverity1] = useState(7);
  const [occurrence1, setOccurrence1] = useState(5);
  const [detection1, setDetection1] = useState(4);
  const [judgment1, setJudgment1] = useState<RiskLevel>('M');

  // Proposed Controls
  const [proposedControls, setProposedControls] = useState('');

  // Corrective Action (CAPA)
  const [caTitle, setCaTitle] = useState('');
  const [caDescription, setCaDescription] = useState('');
  const [caDepartment, setCaDepartment] = useState('');
  const [caTargetDate, setCaTargetDate] = useState('1405/03/30');
  const [caStatus, setCaStatus] = useState<ActionStatus>('pending');
  const [caCost, setCaCost] = useState('');
  const [caEffectiveness, setCaEffectiveness] = useState('');

  // Assessment 2 (Residual Risk)
  const [severity2, setSeverity2] = useState(5);
  const [occurrence2, setOccurrence2] = useState(3);
  const [detection2, setDetection2] = useState(4);
  const [judgment2, setJudgment2] = useState<RiskLevel>('L');

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiUrgencyNote, setAiUrgencyNote] = useState<string | null>(null);

  // Computed RPNs
  const rpn1 = severity1 * occurrence1 * detection1;
  const rpn2 = severity2 * occurrence2 * detection2;
  const reductionPercent = rpn1 > 0 ? Math.max(0, Math.round(((rpn1 - rpn2) / rpn1) * 100)) : 0;

  // Auto update judgment based on RPN
  useEffect(() => {
    if (rpn1 >= 200 || severity1 >= 9) {
      setJudgment1('H');
    } else if (rpn1 >= 100 || severity1 >= 7) {
      setJudgment1('M');
    } else {
      setJudgment1('L');
    }
  }, [severity1, occurrence1, detection1, rpn1]);

  useEffect(() => {
    if (rpn2 >= 200 || severity2 >= 9) {
      setJudgment2('H');
    } else if (rpn2 >= 100) {
      setJudgment2('M');
    } else {
      setJudgment2('L');
    }
  }, [severity2, occurrence2, detection2, rpn2]);

  useEffect(() => {
    if (initialHazard) {
      setActivity(initialHazard.activity);
      setPotentialHazard(initialHazard.potentialHazard);
      setConsequence(initialHazard.consequence);
      setRootCauses(initialHazard.rootCauses);
      setExistingControls(initialHazard.existingControls || '');
      setSeverity1(initialHazard.severity1);
      setOccurrence1(initialHazard.occurrence1);
      setDetection1(initialHazard.detection1);
      setJudgment1(initialHazard.judgment1);
      setProposedControls(initialHazard.proposedControls);
      
      setCaTitle(initialHazard.correctiveAction.title);
      setCaDescription(initialHazard.correctiveAction.description);
      setCaDepartment(initialHazard.correctiveAction.department || '');
      setCaTargetDate(initialHazard.correctiveAction.targetDate || '1405/03/30');
      setCaStatus(initialHazard.correctiveAction.status);
      setCaCost(initialHazard.correctiveAction.estimatedCost || '');
      setCaEffectiveness(initialHazard.correctiveAction.effectivenessReview || '');

      setSeverity2(initialHazard.severity2);
      setOccurrence2(initialHazard.occurrence2);
      setDetection2(initialHazard.detection2);
      setJudgment2(initialHazard.judgment2);
    } else {
      // Default empty state
      setActivity('تعیین ضخامت ورق فولادی');
      setPotentialHazard('');
      setConsequence('');
      setRootCauses('');
      setExistingControls('');
      setSeverity1(7);
      setOccurrence1(5);
      setDetection1(4);
      setProposedControls('');
      setCaTitle('');
      setCaDescription('');
      setCaDepartment('واحد فنی و HSE');
      setCaTargetDate('1405/03/30');
      setCaStatus('pending');
      setCaCost('');
      setCaEffectiveness('');
      setSeverity2(5);
      setOccurrence2(3);
      setDetection2(3);
      setAiUrgencyNote(null);
    }
  }, [initialHazard, isOpen]);

  const handleAiAutoFill = async () => {
    if (!potentialHazard.trim() || !activity.trim()) {
      alert('لطفاً ابتدا نام فعالیت و عنوان خطر بالقوه را وارد نمایید تا هوش مصنوعی بتواند ارزیابی کند.');
      return;
    }

    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/fmea/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity,
          potentialHazard,
          existingControls,
          workshopName,
          cause: rootCauses,
          consequence,
        }),
      });

      if (!res.ok) throw new Error('خطا در دریافت پاسخ از سرور');

      const data = await res.json();
      
      // Populate fields
      setSeverity1(data.severity1 || 7);
      setOccurrence1(data.occurrence1 || 5);
      setDetection1(data.detection1 || 4);
      setJudgment1(data.judgment1 || 'M');
      if (data.consequence) setConsequence(data.consequence);
      if (data.rootCauses) setRootCauses(data.rootCauses);
      if (data.proposedControls) setProposedControls(data.proposedControls);

      if (data.correctiveAction) {
        setCaTitle(data.correctiveAction.title || `اقدام اصلاحی جهت کنترل ${potentialHazard}`);
        setCaDescription(data.correctiveAction.description || '');
        if (data.correctiveAction.recommendedVerification) setCaEffectiveness(data.correctiveAction.recommendedVerification);
      }

      setSeverity2(data.severity2 || 5);
      setOccurrence2(data.occurrence2 || 3);
      setDetection2(data.detection2 || 3);
      setJudgment2(data.judgment2 || 'L');

      if (data.urgencyExplanation) {
        setAiUrgencyNote(data.urgencyExplanation);
      }
    } catch (err: any) {
      alert('خطا در ارتباط با هوش مصنوعی: ' + err.message);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activity.trim() || !potentialHazard.trim()) {
      alert('نام فعالیت و عنوان خطر الزامی است.');
      return;
    }

    const hazardItem: FmeaHazardItem = {
      id: initialHazard?.id || `h-${Date.now()}`,
      rowNumber: initialHazard?.rowNumber || 1,
      activity: activity.trim(),
      potentialHazard: potentialHazard.trim(),
      consequence: consequence.trim() || 'جراحت و آسیب فیزیکی',
      rootCauses: rootCauses.trim() || 'نقص در پایش یا کنترل استاندارد',
      existingControls: existingControls.trim(),
      
      severity1,
      occurrence1,
      detection1,
      rpn1,
      judgment1,
      
      proposedControls: proposedControls.trim() || 'طراحی حفاظ مهندسی و آموزش اپراتورها',
      
      correctiveAction: {
        id: initialHazard?.correctiveAction.id || `ca-${Date.now()}`,
        title: caTitle.trim() || `اقدام اصلاحی کنترل خطر ${potentialHazard}`,
        description: caDescription.trim() || 'اجرای دستورالعمل ایمنی و نظارت مستمر',
        responsiblePerson: '',
        department: caDepartment.trim() || 'فنی و ایمنی',
        targetDate: caTargetDate || '1405/03/30',
        status: caStatus,
        estimatedCost: caCost.trim(),
        effectivenessReview: caEffectiveness.trim(),
        isApprovedByHSE: initialHazard?.correctiveAction.isApprovedByHSE || false,
      },
      
      severity2,
      occurrence2,
      detection2,
      rpn2,
      judgment2,
      
      createdAt: initialHazard?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      aiSuggested: Boolean(aiUrgencyNote),
    };

    onSave(hazardItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {initialHazard ? 'ویرایش ردیف ارزیابی ریسک FMEA' : 'ثبت و ارزیابی خطر جدید در کارگاه'}
              </h3>
              <p className="text-xs text-slate-400">
                کارگاه: <span className="text-amber-400 font-semibold">{workshopName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* AI Quick Analysis Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-800/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-purple-200">
                  امتیازدهی و استخراج اقدامات اصلاحی با هوش مصنوعی (AI FMEA)
                </h4>
                <p className="text-[11px] text-slate-400">
                  نام فعالیت و خطر را وارد کنید، هوش مصنوعی کل فرم، امتیازهای S/O/D، علل، کنترل‌ها و اقدام اصلاحی را تکمیل می‌کند.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAiAutoFill}
              disabled={isLoadingAi}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              {isLoadingAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ارزیابی هوشمند...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>تحلیل و تکمیل خودکار با AI</span>
                </>
              )}
            </button>
          </div>

          {aiUrgencyNote && (
            <div className="p-3 bg-purple-900/30 border border-purple-600/40 rounded-lg text-xs text-purple-200 flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <span>{aiUrgencyNote}</span>
            </div>
          )}

          {/* Section 1: Hazard Identification */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4" />
              <span>۱. شناسایی فعالیت، خطر، پیامد و علل ریشه‌ای</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  فعالیت / فرآیند <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="مثال: تعیین ضخامت ورق فولادی، تراشکاری، تعویض قالب پرس"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  خطر بالقوه <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={potentialHazard}
                  onChange={(e) => setPotentialHazard(e.target.value)}
                  placeholder="مثال: برخورد ورق به اپراتور، برخورد دست با گیوتین، سروصدا"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  پیامد خطر (اثرات و عواقب)
                </label>
                <textarea
                  rows={2}
                  value={consequence}
                  onChange={(e) => setConsequence(e.target.value)}
                  placeholder="مثال: جراحت شدید، فوت، قطع عضو، افت شنوایی، شکستگی..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  علت / علل بروز خطر (Root Causes)
                </label>
                <textarea
                  rows={2}
                  value={rootCauses}
                  onChange={(e) => setRootCauses(e.target.value)}
                  placeholder="مثال: سرعت بالای دستگاه، نداشتن سنسور قطع‌کن، عدم تمرکز، ریختن آب صابون..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                اقدامات کنترلی موجود (وضعیت فعلی در کارگاه)
              </label>
              <input
                type="text"
                value={existingControls}
                onChange={(e) => setExistingControls(e.target.value)}
                placeholder="مثال: کلید قطع دستی، آموزش اولیه، تابلو هشدار"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Section 2: Assessment 1 (Current Risk) */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-amber-500/20">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" />
                <span>۲. ارزیابی ۱ (با در نظر گرفتن اقدامات کنترلی موجود)</span>
              </h4>
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-300">
                  نمره اولویت ریسک: <strong className="text-amber-400 text-sm">{rpn1}</strong> = {severity1} × {occurrence1} × {detection1}
                </div>
                <span className={`px-2.5 py-0.5 rounded text-xs font-black ${
                  judgment1 === 'H' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                  judgment1 === 'M' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  قضاوت: {judgment1} ({judgment1 === 'H' ? 'بحرانی' : judgment1 === 'M' ? 'متوسط' : 'پایین'})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Severity 1 */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">شدت (Severity - S1):</span>
                  <span className="font-black text-amber-400 text-sm">{severity1} / ۱۰</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity1}
                  onChange={(e) => setSeverity1(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  {severity1 >= 9 ? 'فاجعه‌بار / فوت یا قطع عضو' : severity1 >= 7 ? 'جراحت شدید / بیماری مزمن' : severity1 >= 4 ? 'جراحت متوسط' : 'آسیب جزئی'}
                </p>
              </div>

              {/* Occurrence 1 */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">احتمال (Occurrence - O1):</span>
                  <span className="font-black text-amber-400 text-sm">{occurrence1} / ۱۰</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={occurrence1}
                  onChange={(e) => setOccurrence1(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  {occurrence1 >= 8 ? 'بسیار زیاد و مکرر' : occurrence1 >= 5 ? 'متوسط و محتمل در ماه' : 'نادر و کم'}
                </p>
              </div>

              {/* Detection 1 */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">کشف/کنترل (Detection - D1):</span>
                  <span className="font-black text-amber-400 text-sm">{detection1} / ۱۰</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={detection1}
                  onChange={(e) => setDetection1(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  {detection1 >= 7 ? 'عدم قابلیت کشف / پایش ضعیف' : detection1 >= 4 ? 'کشف با بازرسی دوره‌ای' : 'کشف خودکار و سنسوردار'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Proposed Controls & Corrective Actions */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Wrench className="w-4 h-4" />
              <span>۳. اقدامات کنترلی پیشنهادی و اقدام اصلاحی (CAPA)</span>
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                اقدامات کنترلی پیشنهادی (مهندسی / مدیریتی / حفاظتی)
              </label>
              <textarea
                rows={2}
                value={proposedControls}
                onChange={(e) => setProposedControls(e.target.value)}
                placeholder="مثال: کنترل سرعت دستگاه – طراحی و ساخت مناسب حفاظ – ساخت اتاقک اپراتوری – نصب سنسور قطع‌کن"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Detailed Corrective Action Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/30 space-y-3">
              <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4" />
                <span>تعریف دقیق اقدام اصلاحی (Corrective Action) برای این قسمت:</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">عنوان اقدام اصلاحی</label>
                <input
                  type="text"
                  value={caTitle}
                  onChange={(e) => setCaTitle(e.target.value)}
                  placeholder="مثال: خرید و تجهیز پرده نوری ایمنی روی گیوتین"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">شرح مراحل اجرایی اقدام اصلاحی</label>
                <textarea
                  rows={2}
                  value={caDescription}
                  onChange={(e) => setCaDescription(e.target.value)}
                  placeholder="شرح گام‌به‌گام پیاده‌سازی، مناقصه خرید، تست و راه‌اندازی و آموزش کارکنان..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">مهلت اجرا (سال ۱۴۰۵)</label>
                  <input
                    type="text"
                    value={caTargetDate}
                    onChange={(e) => setCaTargetDate(e.target.value)}
                    placeholder="1405/03/30"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">وضعیت اجرای اقدام</label>
                  <select
                    value={caStatus}
                    onChange={(e) => setCaStatus(e.target.value as ActionStatus)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="pending">در انتظار بررسی</option>
                    <option value="in_progress">در حال انجام</option>
                    <option value="completed">تکمیل و اجرا شده</option>
                    <option value="overdue">منقضی شده</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">برآورد هزینه</label>
                  <input
                    type="text"
                    value={caCost}
                    onChange={(e) => setCaCost(e.target.value)}
                    placeholder="مثال: ۲۵ میلیون تومان"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Assessment 2 (Residual Risk) */}
          <div className="space-y-4 p-4 rounded-xl bg-slate-950/60 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>۴. ارزیابی ۲ (با در نظر گرفتن اقدامات کنترلی پیشنهادی و اصلاحی)</span>
              </h4>
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-300">
                  RPN ثانویه: <strong className="text-emerald-400 text-sm">{rpn2}</strong>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  {reductionPercent}٪ کاهش ریسک
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Severity 2 */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">شدت ثانویه (S2):</span>
                  <span className="font-black text-emerald-400 text-sm">{severity2}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity2}
                  onChange={(e) => setSeverity2(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Occurrence 2 */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">احتمال ثانویه (O2):</span>
                  <span className="font-black text-emerald-400 text-sm">{occurrence2}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={occurrence2}
                  onChange={(e) => setOccurrence2(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Detection 2 */}
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">کشف ثانویه (D2):</span>
                  <span className="font-black text-emerald-400 text-sm">{detection2}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={detection2}
                  onChange={(e) => setDetection2(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              انصراف
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialHazard ? 'ذخیره تغییرات' : 'ثبت در کاربرگ FMEA'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
