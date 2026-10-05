'use client';

import React, { useState } from 'react';
import { FmeaWorksheet, UserProfile } from '@/types/fmea';
import { exportWorksheetToWord } from '@/lib/word-export';
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  FileText, 
  Printer, 
  Eye, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  Search, 
  ShieldCheck, 
  Layers, 
  HardHat,
  Clock,
  Inbox
} from 'lucide-react';

interface ArchiveManagerProps {
  worksheets: FmeaWorksheet[];
  currentUser: UserProfile;
  onRestoreWorksheet: (worksheetId: string) => void;
  onDeleteArchivedWorksheet: (worksheetId: string) => void;
  onSelectAndInspect: (worksheetId: string) => void;
  onPrintWorksheet: (worksheet: FmeaWorksheet) => void;
}

export const ArchiveManager: React.FC<ArchiveManagerProps> = ({
  worksheets,
  currentUser,
  onRestoreWorksheet,
  onDeleteArchivedWorksheet,
  onSelectAndInspect,
  onPrintWorksheet,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const archivedWorksheets = worksheets.filter((w) => w.status === 'archived');

  const filteredArchived = archivedWorksheets.filter((w) => {
    const matchesSearch =
      w.workshopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.executionDate.includes(searchTerm) ||
      (w.notes && w.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      w.teamMembers.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const totalArchivedHazards = archivedWorksheets.reduce((acc, w) => acc + w.hazards.length, 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-500 to-indigo-500" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Archive className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">بایگانی و آرشیو سوابق کاربرگ‌های FMEA</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {archivedWorksheets.length} کاربرگ بایگانی شده
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                نگهداری دائمی سوابق ممیزی، تاریخچه ارزیابی‌های گذشته، بازیابی سریع و استخراج خروجی‌های معتبر
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">کل خطرات آرشیو شده</div>
              <div className="text-lg font-black text-amber-400">{totalArchivedHazards} خطر</div>
            </div>
            <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400">وضعیت ذخیره‌سازی</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ذخیره پایدار در دیتابیس
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="جستجو در نام کارگاه آرشیو شده، تاریخ اجرا یا اعضای تیم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pr-9 pl-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
        <span className="text-xs text-slate-400">
          نمایش {filteredArchived.length} از {archivedWorksheets.length} کاربرگ بایگانی شده
        </span>
      </div>

      {/* Archived Cards List */}
      {filteredArchived.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">هیچ کاربرگی در بخش آرشیو وجود ندارد</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            برای بایگانی کردن هر یک از کاربرگ‌های فعال، می‌توانید از دکمه «آرشیو کردن این کاربرگ» در بالای جدول استفاده نمایید. سوابق ارزیابی گذشته همواره در این قسمت قابل بازیابی و چاپ خواهند بود.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArchived.map((ws) => {
            const totalH = ws.hazards.length;
            const highRisks = ws.hazards.filter((h) => h.rpn1 >= 180 || h.judgment1 === 'H' || h.severity1 >= 8).length;
            const avg1 = totalH > 0 ? Math.round(ws.hazards.reduce((a, b) => a + b.rpn1, 0) / totalH) : 0;
            const avg2 = totalH > 0 ? Math.round(ws.hazards.reduce((a, b) => a + b.rpn2, 0) / totalH) : 0;
            const reduction = avg1 > 0 ? Math.round(((avg1 - avg2) / avg1) * 100) : 0;

            return (
              <div
                key={ws.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition flex flex-col justify-between gap-4"
              >
                {/* Card Top */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                      <Archive className="w-3 h-3" /> بایگانی‌شده
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> تاریخ اجرا: {ws.executionDate}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white">کارگاه: {ws.workshopName}</h3>
                  
                  {ws.notes && (
                    <p className="text-xs text-slate-400 line-clamp-2">{ws.notes}</p>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                    <span className="font-semibold text-slate-300">اعضای تیم:</span>
                    <span>{ws.teamMembers.join(' - ')}</span>
                  </div>

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400">تعداد خطرات</div>
                      <div className="font-black text-slate-100">{totalH} خطر</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-rose-400">ریسک بالا</div>
                      <div className="font-black text-rose-400">{highRisks} مورد</div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-emerald-400">کاهش RPN</div>
                      <div className="font-black text-emerald-400">{reduction}٪</div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800 flex-wrap">
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectAndInspect(ws.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                      title="مشاهده و بررسی در جدول"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>مشاهده</span>
                    </button>

                    <button
                      onClick={() => exportWorksheetToWord(ws)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold transition cursor-pointer"
                      title="دانلود فایل Word این سابقه"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Word</span>
                    </button>

                    <button
                      onClick={() => onPrintWorksheet(ws)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                      title="چاپ یا ذخیره PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>چاپ</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onRestoreWorksheet(ws.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
                      title="خروج از آرشیو و بازگشت به لیست کاربرگ‌های فعال"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>بازیابی به فعال</span>
                    </button>

                    <button
                      onClick={() => onDeleteArchivedWorksheet(ws.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-400 transition cursor-pointer"
                      title="حذف دائمی این کاربرگ از حافظه"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
