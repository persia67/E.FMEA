'use client';

import React from 'react';
import { FmeaWorksheet } from '@/types/fmea';
import { exportWorksheetToWord } from '@/lib/word-export';
import { Printer, CheckCircle2, FileText } from 'lucide-react';

interface OfficialPrintViewProps {
  worksheet: FmeaWorksheet;
  onPrint: () => void;
}

export const OfficialPrintView: React.FC<OfficialPrintViewProps> = ({ worksheet, onPrint }) => {
  return (
    <div className="space-y-6">
      
      {/* Print Trigger Toolbar (Hidden on actual print) */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <h3 className="font-bold text-sm text-white">پیش‌نمایش فرم چاپی استاندارد کارگاهی (مطابق نسخه اصلی FMEA)</h3>
          <p className="text-xs text-slate-400">
            طراحی شده با ابعاد رسمی A4 افقی، مناسب برای ارائه به ممیزان ایزو ۴۵۰۰۱، وزارت کار و گزارش‌های هیئت مدیره
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportWorksheetToWord(worksheet)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>دانلود فایل Word (.doc)</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>ارسال به چاپگر / ذخیره PDF</span>
          </button>
        </div>
      </div>

      {/* Official Paper Sheet (A4 Landscape Form) */}
      <div className="bg-white text-black p-8 rounded-xl shadow-2xl border border-slate-300 font-sans [direction:rtl] max-w-[1280px] mx-auto print:shadow-none print:border-none print:p-0">
        
        {/* Form Main Title */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-black tracking-wide border-b-2 border-black inline-block pb-1">
            فرم FMEA
          </h1>
        </div>

        {/* Top Information Row */}
        <div className="flex items-center justify-between text-xs font-bold mb-4 border-b border-black pb-2">
          <div>
            <span>نام کارگاه : </span>
            <span className="font-black text-sm">{worksheet.workshopName}</span>
          </div>

          <div>
            <span>۲- تاریخ اجرا : </span>
            <span>{worksheet.executionDate}</span>
          </div>

          <div>
            <span>۳ - اعضای تیم : </span>
            <span>{worksheet.teamMembers.join(' - ')}</span>
          </div>
        </div>

        {/* The Exact Official Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-center text-[10px] border-collapse border border-black leading-tight">
            <thead>
              <tr className="bg-slate-100 font-black text-black">
                <th rowSpan={2} className="border border-black p-1.5 w-6">ردیف</th>
                <th rowSpan={2} className="border border-black p-2 min-w-[90px]">فعالیت</th>
                <th rowSpan={2} className="border border-black p-2 min-w-[100px]">خطرات بالقوه</th>
                <th rowSpan={2} className="border border-black p-2 min-w-[90px]">پیامد خطر</th>
                <th rowSpan={2} className="border border-black p-2 min-w-[110px]">علت / علل</th>

                {/* ارزیابی ۱ */}
                <th colSpan={4} className="border border-black p-1.5 bg-slate-200">
                  ارزیابی ۱ <br />
                  <span className="font-normal text-[9px]">با درنظر گرفتن اقدامات کنترلي موجود</span>
                </th>

                {/* قضاوت */}
                <th rowSpan={2} className="border border-black p-1 w-10">قضاوت</th>

                {/* اقدامات کنترلی پیشنهادی */}
                <th rowSpan={2} className="border border-black p-2 min-w-[130px]">اقدامات کنترلي پیشنهادي</th>

                {/* ستون درخواستی کاربر: اقدام اصلاحی */}
                <th rowSpan={2} className="border border-black p-2 min-w-[140px] bg-amber-50">
                  اقدام اصلاحی (CAPA) <br />
                  <span className="font-normal text-[8px]">شرح و مراحل / مهلت اجرا (۱۴۰۵)</span>
                </th>

                {/* ارزیابی ۲ */}
                <th colSpan={4} className="border border-black p-1.5 bg-slate-200">
                  ارزیابی ۲ <br />
                  <span className="font-normal text-[9px]">با درنظرگرفتن اقدامات کنترلي پیشنهادي</span>
                </th>
              </tr>

              <tr className="bg-slate-100 font-bold">
                {/* ارزیابی ۱ */}
                <th className="border border-black p-1 w-7">شدت</th>
                <th className="border border-black p-1 w-7">احتمال</th>
                <th className="border border-black p-1 w-7">کشف</th>
                <th className="border border-black p-1 w-8 font-black">RPN</th>

                {/* ارزیابی ۲ */}
                <th className="border border-black p-1 w-7">شدت</th>
                <th className="border border-black p-1 w-7">احتمال</th>
                <th className="border border-black p-1 w-7">کشف</th>
                <th className="border border-black p-1 w-8 font-black">RPN</th>
              </tr>
            </thead>

            <tbody>
              {worksheet.hazards.map((h, idx) => (
                <tr key={h.id} className="border-b border-black">
                  <td className="border border-black p-1 font-bold">{h.rowNumber || idx + 1}</td>
                  <td className="border border-black p-1.5 text-right font-medium">{h.activity}</td>
                  <td className="border border-black p-1.5 text-right font-bold">{h.potentialHazard}</td>
                  <td className="border border-black p-1.5 text-right">{h.consequence}</td>
                  <td className="border border-black p-1.5 text-right">{h.rootCauses}</td>

                  {/* ارزیابی ۱ */}
                  <td className="border border-black p-1 font-bold">{h.severity1}</td>
                  <td className="border border-black p-1 font-bold">{h.occurrence1}</td>
                  <td className="border border-black p-1 font-bold">{h.detection1}</td>
                  <td className="border border-black p-1 font-black bg-slate-100">{h.rpn1}</td>

                  {/* قضاوت */}
                  <td className={`border border-black p-1 font-black ${
                    h.judgment1 === 'H' ? 'bg-rose-200' : h.judgment1 === 'M' ? 'bg-amber-200' : 'bg-emerald-200'
                  }`}>
                    {h.judgment1}
                  </td>

                  {/* اقدامات کنترلی پیشنهادی */}
                  <td className="border border-black p-1.5 text-right text-[9px] leading-tight">
                    {h.proposedControls}
                  </td>

                  {/* ستون جدید اقدام اصلاحی */}
                  <td className="border border-black p-1.5 text-right text-[9px] bg-amber-50/50 leading-tight">
                    <div className="font-bold text-black">{h.correctiveAction.title}</div>
                    <div className="text-[8px] text-slate-700 mt-0.5">{h.correctiveAction.description}</div>
                    <div className="text-[8px] font-bold text-amber-900 mt-1">
                      مهلت اجرا: {h.correctiveAction.targetDate}
                    </div>
                  </td>

                  {/* ارزیابی ۲ */}
                  <td className="border border-black p-1 font-bold">{h.severity2}</td>
                  <td className="border border-black p-1 font-bold">{h.occurrence2}</td>
                  <td className="border border-black p-1 font-bold">{h.detection2}</td>
                  <td className="border border-black p-1 font-black bg-slate-100">{h.rpn2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Signatures matching original form */}
        <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t-2 border-black text-xs font-bold">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span>تایید اعضای تیم:</span>
              {worksheet.teamApproved && (
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> امضا و تایید شده ({worksheet.teamApprovedDate || '۱۴۰۴/۰۷/۱۶'})
                </span>
              )}
            </div>
            <div className="h-14 border border-dashed border-slate-400 rounded p-2 flex items-center justify-around text-[10px] text-slate-600">
              {worksheet.teamMembers.map((m, i) => (
                <div key={i} className="text-center">
                  <div>{m}</div>
                  <div className="text-[8px] italic text-slate-500">(امضا شد)</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span>تایید رئیس ایمنی وبهداشت حرفه ای:</span>
              {worksheet.hseManagerApproved && (
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> تایید و مهر سازمانی شد ({worksheet.hseManagerApprovedDate || '۱۴۰۴/۰۷/۱۸'})
                </span>
              )}
            </div>
            <div className="h-14 border border-dashed border-slate-400 rounded p-2 flex items-center justify-between text-[11px]">
              <div>
                <div className="font-bold text-slate-900">{worksheet.hseManagerName || 'حمید رفیعیان'}</div>
                <div className="text-[9px] text-slate-600 font-medium">مسئول واحد ایمنی و بهداشت (HSE)</div>
              </div>
              <div className="border-2 border-emerald-700 text-emerald-800 px-3 py-1 rounded text-[10px] font-black transform -rotate-6">
                مهر و تایید واحد HSE
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
