'use client';

import React, { useState } from 'react';
import { FmeaWorksheet, FmeaHazardItem } from '@/types/fmea';
import { Grid3X3, ArrowLeftRight, CheckCircle2, AlertTriangle, Eye, Shield } from 'lucide-react';

interface RiskMatrixProps {
  worksheet: FmeaWorksheet;
  onSelectHazard: (hazard: FmeaHazardItem) => void;
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ worksheet, onSelectHazard }) => {
  const [viewMode, setViewMode] = useState<'initial' | 'residual' | 'comparison'>('comparison');
  const [matrixSize, setMatrixSize] = useState<5 | 10>(5);
  const [activeHazard, setActiveHazard] = useState<FmeaHazardItem | null>(null);

  // Helper to map 1-10 scale into 1-5 scale if 5x5 is chosen
  const scaleValue = (val: number, size: 5 | 10) => {
    if (size === 10) return Math.min(10, Math.max(1, val));
    return Math.min(5, Math.max(1, Math.ceil(val / 2)));
  };

  const getCellColor = (sev: number, occ: number, size: 5 | 10) => {
    const score = sev * occ;
    const maxScore = size * size;
    const ratio = score / maxScore;

    if (ratio >= 0.45 || (size === 5 && (sev >= 4 && occ >= 3))) {
      return 'bg-rose-950/70 border-rose-600/60 text-rose-300';
    }
    if (ratio >= 0.2 || (size === 5 && (sev >= 3 || occ >= 3))) {
      return 'bg-amber-950/60 border-amber-600/50 text-amber-300';
    }
    return 'bg-emerald-950/50 border-emerald-600/40 text-emerald-300';
  };

  const rows = Array.from({ length: matrixSize }, (_, i) => matrixSize - i); // e.g. 5, 4, 3, 2, 1 (Severity)
  const cols = Array.from({ length: matrixSize }, (_, i) => i + 1); // e.g. 1, 2, 3, 4, 5 (Probability)

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Grid3X3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">ماتریس دوبعدی ارزیابی ریسک (شدت × احتمال)</h2>
            <p className="text-xs text-slate-400">
              نمایش بصری توزیع خطرات کارگاه {worksheet.workshopName} و مقایسه جابجایی ریسک قبل و بعد از اقدامات اصلاحی
            </p>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                viewMode === 'comparison' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              مقایسه اولیه و ثانویه
            </button>
            <button
              onClick={() => setViewMode('initial')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                viewMode === 'initial' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ریسک اولیه (ارزیابی ۱)
            </button>
            <button
              onClick={() => setViewMode('residual')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                viewMode === 'residual' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ریسک ثانویه (ارزیابی ۲)
            </button>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMatrixSize(5)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                matrixSize === 5 ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ماتریس ۵×۵
            </button>
            <button
              onClick={() => setMatrixSize(10)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                matrixSize === 10 ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ماتریس ۱۰×۱۰ (استاندارد FMEA)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: The Visual Grid */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-rose-500/80 inline-block" />
              <span>ریسک بحرانی / غیرقابل قبول</span>
              <span className="w-3 h-3 rounded bg-amber-500/80 inline-block mr-3" />
              <span>ریسک متوسط / مشروط به کنترل</span>
              <span className="w-3 h-3 rounded bg-emerald-500/80 inline-block mr-3" />
              <span>ریسک قابل قبول / پایین</span>
            </div>
            <div className="text-slate-400">
              {viewMode === 'comparison' && (
                <span className="text-cyan-400 font-bold">● دایره نارنجی: اولیه | ■ مربع سبز: ثانویه</span>
              )}
            </div>
          </div>

          {/* Matrix Container */}
          <div className="flex gap-4">
            
            {/* Y-Axis Label */}
            <div className="flex flex-col items-center justify-center py-4 text-xs font-black text-amber-400 [writing-mode:vertical-rl] rotate-180">
              شدت پیامد خطر (Severity) ↑
            </div>

            {/* Matrix Body */}
            <div className="flex-1 space-y-2">
              <div className="grid gap-2" style={{ gridTemplateRows: `repeat(${matrixSize}, minmax(0, 1fr))` }}>
                {rows.map((sevVal) => (
                  <div key={sevVal} className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs font-black text-slate-400">{sevVal}</span>
                    <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${matrixSize}, minmax(0, 1fr))` }}>
                      {cols.map((occVal) => {
                        const cellStyle = getCellColor(sevVal, occVal, matrixSize);
                        
                        // Find hazards in this cell
                        const initialHazards = worksheet.hazards.filter(
                          (h) => scaleValue(h.severity1, matrixSize) === sevVal && scaleValue(h.occurrence1, matrixSize) === occVal
                        );

                        const residualHazards = worksheet.hazards.filter(
                          (h) => scaleValue(h.severity2, matrixSize) === sevVal && scaleValue(h.occurrence2, matrixSize) === occVal
                        );

                        return (
                          <div
                            key={occVal}
                            className={`min-h-[58px] p-1.5 rounded-xl border flex flex-wrap items-center justify-center gap-1 relative group transition hover:scale-105 hover:z-10 ${cellStyle}`}
                          >
                            <span className="absolute top-1 right-1 text-[9px] opacity-40 font-mono">
                              {sevVal * occVal}
                            </span>

                            {/* Show Initial Pins */}
                            {(viewMode === 'initial' || viewMode === 'comparison') &&
                              initialHazards.map((h) => (
                                <button
                                  key={`init-${h.id}`}
                                  onClick={() => setActiveHazard(h)}
                                  className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] shadow-lg shadow-amber-500/30 flex items-center justify-center hover:ring-2 hover:ring-white transition"
                                  title={`خطر اولیه: ${h.potentialHazard} (ردیف ${h.rowNumber})`}
                                >
                                  {h.rowNumber}
                                </button>
                              ))}

                            {/* Show Residual Pins */}
                            {(viewMode === 'residual' || viewMode === 'comparison') &&
                              residualHazards.map((h) => (
                                <button
                                  key={`res-${h.id}`}
                                  onClick={() => setActiveHazard(h)}
                                  className="w-5 h-5 rounded bg-emerald-500 text-slate-950 font-black text-[10px] shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:ring-2 hover:ring-white transition"
                                  title={`خطر پس از اقدام اصلاحی: ${h.potentialHazard} (ردیف ${h.rowNumber})`}
                                >
                                  {h.rowNumber}
                                </button>
                              ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* X-Axis Numbers & Label */}
              <div className="flex items-center gap-2 pt-2">
                <span className="w-6" />
                <div className="flex-1 grid gap-2" style={{ gridTemplateColumns: `repeat(${matrixSize}, minmax(0, 1fr))` }}>
                  {cols.map((c) => (
                    <div key={c} className="text-center text-xs font-black text-slate-400">
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center text-xs font-black text-cyan-400 pt-1">
                احتمال وقوع خطر (Occurrence / Probability) →
              </div>
            </div>

          </div>

        </div>

        {/* Right 1 Col: Selected Hazard Detail Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Eye className="w-4 h-4 text-amber-400" />
            <span>اطلاعات جزئی موقعیت در ماتریس</span>
          </h3>

          {activeHazard ? (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs text-amber-400 font-bold">ردیف {activeHazard.rowNumber}: {activeHazard.activity}</div>
                <div className="text-sm font-black text-white">{activeHazard.potentialHazard}</div>
                <div className="text-xs text-slate-400 mt-1">{activeHazard.consequence}</div>
              </div>

              {/* Score comparison */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-3 bg-amber-950/30 border border-amber-600/40 rounded-xl">
                  <div className="text-amber-300 font-bold mb-1">ارزیابی اولیه</div>
                  <div className="text-slate-300">شدت: {activeHazard.severity1}</div>
                  <div className="text-slate-300">احتمال: {activeHazard.occurrence1}</div>
                  <div className="text-slate-300">کشف: {activeHazard.detection1}</div>
                  <div className="text-base font-black text-amber-400 mt-1">RPN: {activeHazard.rpn1}</div>
                </div>

                <div className="p-3 bg-emerald-950/30 border border-emerald-600/40 rounded-xl">
                  <div className="text-emerald-300 font-bold mb-1">ارزیابی ثانویه (پس از اصلاح)</div>
                  <div className="text-slate-300">شدت: {activeHazard.severity2}</div>
                  <div className="text-slate-300">احتمال: {activeHazard.occurrence2}</div>
                  <div className="text-slate-300">کشف: {activeHazard.detection2}</div>
                  <div className="text-base font-black text-emerald-400 mt-1">RPN: {activeHazard.rpn2}</div>
                </div>
              </div>

              {/* Corrective Action Summary */}
              <div className="p-3 bg-slate-950 rounded-xl border border-cyan-800/40 text-xs space-y-1">
                <div className="font-bold text-cyan-300">اقدام اصلاحی پیاده‌شده:</div>
                <p className="text-slate-300">{activeHazard.correctiveAction.title}</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  مسئول: {activeHazard.correctiveAction.responsiblePerson} | وضعیت: {activeHazard.correctiveAction.status}
                </div>
              </div>

              <button
                onClick={() => onSelectHazard(activeHazard)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
              >
                مشاهده و ویرایش کامل در کاربرگ
              </button>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Shield className="w-10 h-10 text-slate-600 mx-auto" />
              <p>روی هر یک از شماره‌های ردیف در ماتریس کلیک کنید تا جزئیات انتقال ریسک را ببینید.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
