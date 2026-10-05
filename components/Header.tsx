'use client';

import React from 'react';
import { UserProfile, FmeaWorksheet, HighRiskAlert } from '@/types/fmea';
import { 
  ShieldAlert, 
  FileSpreadsheet, 
  Plus, 
  Sparkles, 
  Printer, 
  Bell, 
  CheckCircle2, 
  UserCheck, 
  Layers, 
  Grid3X3, 
  Database,
  CalendarCheck,
  Building2,
  HardHat,
  FileText,
  UploadCloud,
  Archive,
  RotateCcw,
  Server
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onUserChange: (user: UserProfile) => void;
  worksheets: FmeaWorksheet[];
  activeWorksheetId: string;
  onWorksheetChange: (id: string) => void;
  alerts: HighRiskAlert[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenNewHazard: () => void;
  onOpenAiBatch: () => void;
  onOpenImportModal: () => void;
  onOpenServerSettings: () => void;
  onArchiveCurrentWorksheet: () => void;
  onPrint: () => void;
  onExportWord: () => void;
  onApproveWorksheet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onUserChange,
  worksheets,
  activeWorksheetId,
  onWorksheetChange,
  alerts,
  activeTab,
  onTabChange,
  onOpenNewHazard,
  onOpenAiBatch,
  onOpenImportModal,
  onOpenServerSettings,
  onArchiveCurrentWorksheet,
  onPrint,
  onExportWord,
  onApproveWorksheet,
}) => {
  const activeWorksheet = worksheets.find((w) => w.id === activeWorksheetId);
  const activeAlertsCount = alerts.filter((a) => a.status === 'active').length;
  const archivedCount = worksheets.filter((w) => w.status === 'archived').length;

  const canApprove = currentUser.role === 'hse_manager' && !activeWorksheet?.hseManagerApproved;
  const isCurrentlyArchived = activeWorksheet?.status === 'archived';

  return (
    <header className="no-print bg-slate-900/90 border-b border-slate-800 backdrop-blur sticky top-0 z-40">
      {/* Top Banner: Logo, Role, Alerts, Status */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 text-slate-950 font-black text-xl">
            <HardHat className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                سامانه هوشمند ارزیابی ریسک و FMEA
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                v1.3.0 سرور داخلی
              </span>
            </div>
            <p className="text-xs text-slate-400">
              دیتابیس متمرکز ویندوز سرور، استقرار خودکار CI/CD، بایگانی سوابق، منوی بازشو و خروجی Word
            </p>
          </div>
        </div>

        {/* User Role Switcher, Workshop Selector & Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          
          {/* Workshop Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs text-slate-200">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 hidden sm:inline">کارگاه:</span>
            <select
              value={activeWorksheetId}
              onChange={(e) => onWorksheetChange(e.target.value)}
              aria-label="انتخاب کارگاه"
              className="bg-transparent font-medium text-amber-300 focus:outline-none cursor-pointer"
            >
              {worksheets.map((ws) => (
                <option key={ws.id} value={ws.id} className="bg-slate-900 text-slate-100">
                  {ws.status === 'archived' ? '📦 [آرشیو] ' : ''}{ws.workshopName} ({ws.executionDate})
                </option>
              ))}
            </select>
          </div>

          {/* Role selector */}
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 rounded-lg px-3 py-1.5 text-xs text-slate-200">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 hidden sm:inline">نقش جاری:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const found = allUsers.find((u) => u.id === e.target.value);
                if (found) onUserChange(found);
              }}
              aria-label="انتخاب نقش کاربری"
              className="bg-transparent font-medium text-cyan-300 focus:outline-none cursor-pointer"
            >
              {allUsers.map((user) => (
                <option key={user.id} value={user.id} className="bg-slate-900 text-slate-100">
                  {user.name} ({user.roleTitle})
                </option>
              ))}
            </select>
          </div>

          {/* Alert Notification Button */}
          <button
            onClick={() => onTabChange('alerts')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              activeAlertsCount > 0
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25 animate-pulse'
                : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="مرکز هشدارهای ریسک بالا"
          >
            <Bell className="w-4 h-4 text-rose-400" />
            <span>هشدارها</span>
            {activeAlertsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* HSE Approval Action */}
          {canApprove && (
            <button
              onClick={onApproveWorksheet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition"
              title="تایید نهایی کاربرگ FMEA توسط رئیس ایمنی"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تایید رئیس HSE</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs & Quick Action Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60 pt-2 pb-2.5">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onTabChange('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'table'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>کاربرگ FMEA</span>
          </button>

          <button
            onClick={() => onTabChange('archive')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'archive'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>آرشیو کاربرگ‌ها</span>
            {archivedCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'archive' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {archivedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('matrix')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'matrix'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>ماتریس ریسک</span>
          </button>

          <button
            onClick={() => onTabChange('reports')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'reports'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>گزارش‌های دوره‌ای</span>
          </button>

          <button
            onClick={() => onTabChange('alerts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'alerts'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>هشدارهای خودکار ({alerts.length})</span>
          </button>

          <button
            onClick={() => onTabChange('database')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'database'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>دیتابیس و خروجی</span>
          </button>

          <button
            onClick={() => onTabChange('official_print')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'official_print'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>فرم چاپی استاندارد</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Server & CI/CD Settings button */}
          <button
            onClick={onOpenServerSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-blue-300 text-xs font-bold border border-blue-500/30 shadow-md transition cursor-pointer"
            title="تنظیمات اجرای برنامه روی ویندوز سرور، دیتابیس متمرکز و CI/CD گیت‌هاب"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Server className="w-3.5 h-3.5 text-blue-400" />
            <span>سرور و CI/CD</span>
          </button>

          {/* Archive Current Worksheet Button */}
          {!isCurrentlyArchived ? (
            <button
              onClick={onArchiveCurrentWorksheet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition cursor-pointer"
              title="انتقال کاربرگ جاری به بایگانی و ذخیره سوابق"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>آرشیو کاربرگ</span>
            </button>
          ) : (
            <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-bold flex items-center gap-1">
              <Archive className="w-3.5 h-3.5" /> بایگانی شده
            </span>
          )}

          {/* Upload / Import Worksheet button */}
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition cursor-pointer"
            title="بارگذاری عکس، PDF یا فایل کاربرگ سایر کارگاه‌ها جهت تحلیل خودکار"
          >
            <UploadCloud className="w-4 h-4" />
            <span>بارگذاری فایل / عکس</span>
          </button>

          <button
            onClick={onExportWord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition cursor-pointer"
            title="دانلود جدول کامل ارزیابی ریسک در قالب فایل Word (.doc)"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Word (.doc)</span>
          </button>

          <button
            onClick={onOpenAiBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>دستیار AI</span>
          </button>

          <button
            onClick={onOpenNewHazard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت خطر جدید</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700 cursor-pointer"
            title="چاپ و دانلود PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>

      </div>
    </header>
  );
};
