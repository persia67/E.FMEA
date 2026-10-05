'use client';

import React, { useState } from 'react';
import { PeriodicReport, FmeaWorksheet, UserProfile } from '@/types/fmea';
import { 
  CalendarCheck, 
  Plus, 
  Printer, 
  TrendingDown, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  BarChart3,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';

interface PeriodicReportsProps {
  reports: PeriodicReport[];
  worksheets: FmeaWorksheet[];
  currentUser: UserProfile;
  onCreateReport: (newReport: PeriodicReport) => void;
  onPrintReport: (report: PeriodicReport) => void;
}

export const PeriodicReports: React.FC<PeriodicReportsProps> = ({
  reports,
  worksheets,
  currentUser,
  onCreateReport,
  onPrintReport,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [isCreatingModal, setIsCreatingModal] = useState(false);

  // New report form state
  const [title, setTitle] = useState('گزارش پایش و ارزیابی ریسک فصلی ۱۴۰۴');
  const [period, setPeriod] = useState('سه ماهه پاییز ۱۴۰۴');
  const [selectedWorksheetId, setSelectedWorksheetId] = useState<string>(worksheets[0]?.id || 'all');
  const [summary, setSummary] = useState('');
  const [recommendationsText, setRecommendationsText] = useState(
    '۱. پایش مستمر عملکرد پرده‌های نوری گیوتین و پرس\n۲. تداوم برنامه PM دوره‌ای سیستم تهویه موضعی\n۳. اجرای ممیزی داخلی ۵S در کارگاه نورد'
  );

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Aggregate data from chosen worksheets
    const targetWorksheets = selectedWorksheetId === 'all'
      ? worksheets
      : worksheets.filter((w) => w.id === selectedWorksheetId);

    const allHazards = targetWorksheets.flatMap((w) => w.hazards);
    const totalHazards = allHazards.length;
    const highRisks = allHazards.filter((h) => h.rpn1 >= 180 || h.judgment1 === 'H' || h.severity1 >= 8).length;
    const mediumRisks = allHazards.filter((h) => (h.rpn1 >= 100 && h.rpn1 < 180) || h.judgment1 === 'M').length;
    const lowRisks = allHazards.filter((h) => h.rpn1 < 100 && h.judgment1 === 'L').length;

    const avg1 = totalHazards > 0 ? Number((allHazards.reduce((a, b) => a + b.rpn1, 0) / totalHazards).toFixed(1)) : 0;
    const avg2 = totalHazards > 0 ? Number((allHazards.reduce((a, b) => a + b.rpn2, 0) / totalHazards).toFixed(1)) : 0;
    const reduction = avg1 > 0 ? Number((((avg1 - avg2) / avg1) * 100).toFixed(1)) : 0;

    const completedActions = allHazards.filter((h) => h.correctiveAction.status === 'completed').length;
    const pendingActions = totalHazards - completedActions;
    const compliance = totalHazards > 0 ? Math.round((completedActions / totalHazards) * 100) : 100;

    const recList = recommendationsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newRep: PeriodicReport = {
      id: `rep-${Date.now()}`,
      title: title.trim(),
      period: period.trim(),
      workshopName: selectedWorksheetId === 'all' ? 'کلیه کارگاه‌های تولیدی' : (targetWorksheets[0]?.workshopName || 'کارگاه'),
      createdAt: new Date().toISOString().split('T')[0],
      reporterName: `${currentUser.name} (${currentUser.roleTitle})`,
      totalHazards,
      highRiskCount: highRisks,
      mediumRiskCount: mediumRisks,
      lowRiskCount: lowRisks,
      averageRpnInitial: avg1,
      averageRpnResidual: avg2,
      riskReductionPercentage: reduction,
      completedActionsCount: completedActions,
      pendingActionsCount: pendingActions,
      complianceScore: compliance,
      summaryText: summary.trim() || `گزارش ادواری بررسی اثربخشی ارزیابی ریسک FMEA و اقدامات اصلاحی در ${period}`,
      keyRecommendations: recList,
    };

    onCreateReport(newRep);
    setSelectedReportId(newRep.id);
    setIsCreatingModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">مدیریت گزارش‌های دوره‌ای ارزیابی ریسک و HSE</h2>
            <p className="text-xs text-slate-400">
              ثبت و تحلیل گزارش‌های ماهانه و سه ماهه، شاخص‌های بهبود و اثربخشی اقدامات اصلاحی (CAPA)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت گزارش دوره‌ای جدید</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {reports.map((rep) => (
          <button
            key={rep.id}
            onClick={() => setSelectedReportId(rep.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              selectedReportId === rep.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{rep.period}</span>
            <span className="text-[10px] opacity-75">({rep.workshopName})</span>
          </button>
        ))}
      </div>

      {/* Active Report View */}
      {activeReport ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          
          {/* Report Meta & Actions */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  {activeReport.period}
                </span>
                <span className="text-xs text-slate-400">تاریخ تدوین: {activeReport.createdAt}</span>
              </div>
              <h3 className="text-2xl font-black text-white">{activeReport.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                تدوین‌کننده: <strong className="text-slate-200">{activeReport.reporterName}</strong> | کارگاه:{' '}
                <strong className="text-amber-400">{activeReport.workshopName}</strong>
              </p>
            </div>

            <button
              onClick={() => onPrintReport(activeReport)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>چاپ گزارش مدیریتی</span>
            </button>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">کل خطرات ارزیابی‌شده</div>
              <div className="text-2xl font-black text-white">{activeReport.totalHazards} خطر</div>
              <div className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {activeReport.highRiskCount} مورد ریسک بالا
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">میانگین RPN قبل و بعد</div>
              <div className="text-xl font-black text-amber-400">
                {activeReport.averageRpnInitial} ← <span className="text-emerald-400">{activeReport.averageRpnResidual}</span>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                {activeReport.riskReductionPercentage}٪ کاهش شاخص ریسک
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">اقدامات اصلاحی (CAPA)</div>
              <div className="text-2xl font-black text-cyan-400">
                {activeReport.completedActionsCount} / {activeReport.totalHazards}
              </div>
              <div className="text-[11px] text-slate-400">
                {activeReport.pendingActionsCount} مورد در دست اجرا
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">شاخص انطباق ایمنی (Compliance)</div>
              <div className="text-2xl font-black text-emerald-400">{activeReport.complianceScore}٪</div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${activeReport.complianceScore}%` }}
                />
              </div>
            </div>

          </div>

          {/* Executive Summary */}
          <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>خلاصه مدیریتی نتایج پایش دوره:</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{activeReport.summaryText}</p>
          </div>

          {/* Key Recommendations */}
          <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>مصوبات و پیشنهادات کلیدی برای دوره بعدی:</span>
            </h4>
            <div className="space-y-2">
              {activeReport.keyRecommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

      {/* Modal for Creating New Periodic Report */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-amber-400" />
                <span>ثبت گزارش دوره‌ای جدید FMEA / HSE</span>
              </h3>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان گزارش</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">دوره زمانی پایش</label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="مثلاً: سه ماهه پاییز ۱۴۰۴"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">کارگاه هدف</label>
                  <select
                    value={selectedWorksheetId}
                    onChange={(e) => setSelectedWorksheetId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">تمام کارگاه‌های فعال</option>
                    {worksheets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.workshopName} ({w.hazards.length} خطر)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">خلاصه تحلیل مدیریتی و اقدامات</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="شرح تغییرات ریسک، دستاوردها و وضعیت ایمنی در این دوره..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">مصوبات و توصیه‌های کلیدی (هر سطر یک مورد)</label>
                <textarea
                  rows={3}
                  value={recommendationsText}
                  onChange={(e) => setRecommendationsText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/25 cursor-pointer"
                >
                  تولید و ثبت گزارش دوره‌ای
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
