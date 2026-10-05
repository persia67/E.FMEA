'use client';

import React, { useState } from 'react';
import { FmeaWorksheet } from '@/types/fmea';
import { exportWorksheetToWord } from '@/lib/word-export';
import { 
  Database, 
  Copy, 
  Check, 
  Download, 
  FileCode2, 
  Table, 
  Layers, 
  FileJson, 
  Server,
  Share2,
  FileText
} from 'lucide-react';

interface DatabaseSchemaViewProps {
  activeWorksheet: FmeaWorksheet;
  allWorksheets: FmeaWorksheet[];
}

export const DatabaseSchemaView: React.FC<DatabaseSchemaViewProps> = ({
  activeWorksheet,
  allWorksheets,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'json' | 'sql' | 'csv' | 'erd'>('json');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allWorksheets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fmea_database_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadCsv = () => {
    const headers = [
      'ردیف',
      'کارگاه',
      'فعالیت',
      'خطر بالقوه',
      'پیامد خطر',
      'علل ریشه‌ای',
      'شدت ۱',
      'احتمال ۱',
      'کشف ۱',
      'RPN 1',
      'قضاوت ۱',
      'اقدامات کنترلی پیشنهادی',
      'عنوان اقدام اصلاحی (CAPA)',
      'شرح اقدام اصلاحی',
      'مسئول اقدام',
      'مهلت اجرا',
      'وضعیت اقدام',
      'شدت ۲',
      'احتمال ۲',
      'کشف ۲',
      'RPN 2',
      'قضاوت ۲'
    ];

    const rows = activeWorksheet.hazards.map((h) => [
      h.rowNumber,
      `"${activeWorksheet.workshopName}"`,
      `"${h.activity}"`,
      `"${h.potentialHazard}"`,
      `"${h.consequence}"`,
      `"${h.rootCauses.replace(/"/g, '""')}"`,
      h.severity1,
      h.occurrence1,
      h.detection1,
      h.rpn1,
      h.judgment1,
      `"${h.proposedControls.replace(/"/g, '""')}"`,
      `"${h.correctiveAction.title.replace(/"/g, '""')}"`,
      `"${h.correctiveAction.description.replace(/"/g, '""')}"`,
      `"${h.correctiveAction.responsiblePerson}"`,
      `"${h.correctiveAction.targetDate}"`,
      `"${h.correctiveAction.status}"`,
      h.severity2,
      h.occurrence2,
      h.detection2,
      h.rpn2,
      h.judgment2,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fmea_${activeWorksheet.workshopName}_export.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const sqlSchema = `-- ========================================================
-- ساختار دیتابیس استاندارد ارزیابی ریسک صنعتی و FMEA (PostgreSQL / MySQL)
-- ========================================================

-- جدول ۱: کارگاه‌ها و کاربرگ‌های ارزیابی ریسک (Worksheets)
CREATE TABLE fmea_worksheets (
    id VARCHAR(64) PRIMARY KEY,
    workshop_name VARCHAR(128) NOT NULL,            -- نام کارگاه (مثلا: نورد سرد)
    execution_date VARCHAR(20) NOT NULL,             -- تاریخ اجرا (مثلا: 1404/07/15)
    review_period VARCHAR(32) DEFAULT 'سه ماهه',     -- دوره بازنگری
    team_members JSONB NOT NULL,                     -- اعضای تیم ارزیابی (Array)
    team_approved BOOLEAN DEFAULT FALSE,
    team_approved_date VARCHAR(20),
    hse_manager_approved BOOLEAN DEFAULT FALSE,      -- تایید رئیس ایمنی و بهداشت
    hse_manager_approved_date VARCHAR(20),
    hse_manager_name VARCHAR(128),
    status VARCHAR(32) DEFAULT 'draft',              -- draft, under_review, approved, archived
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول ۲: خطرات شناسایی‌شده و امتیازدهی FMEA (Hazard Items)
CREATE TABLE fmea_hazards (
    id VARCHAR(64) PRIMARY KEY,
    worksheet_id VARCHAR(64) REFERENCES fmea_worksheets(id) ON DELETE CASCADE,
    row_number INT NOT NULL,
    activity VARCHAR(255) NOT NULL,                  -- فعالیت / فرآیند
    potential_hazard VARCHAR(255) NOT NULL,          -- خطرات بالقوه
    consequence TEXT NOT NULL,                       -- پیامد خطر (جراحت، فوت، قطع عضو)
    root_causes TEXT NOT NULL,                       -- علت / علل بروز خطر
    existing_controls TEXT,                          -- اقدامات کنترلی موجود
    
    -- ارزیابی ۱ (با در نظر گرفتن اقدامات موجود)
    severity_1 INT NOT NULL CHECK (severity_1 BETWEEN 1 AND 10),
    occurrence_1 INT NOT NULL CHECK (occurrence_1 BETWEEN 1 AND 10),
    detection_1 INT NOT NULL CHECK (detection_1 BETWEEN 1 AND 10),
    rpn_1 INT GENERATED ALWAYS AS (severity_1 * occurrence_1 * detection_1) STORED,
    judgment_1 VARCHAR(2) NOT NULL,                  -- 'L', 'M', 'H'
    
    -- اقدامات کنترلی پیشنهادی
    proposed_controls TEXT NOT NULL,
    
    -- ارزیابی ۲ (پس از اجرای کنترل‌ها و اقدام اصلاحی)
    severity_2 INT NOT NULL CHECK (severity_2 BETWEEN 1 AND 10),
    occurrence_2 INT NOT NULL CHECK (occurrence_2 BETWEEN 1 AND 10),
    detection_2 INT NOT NULL CHECK (detection_2 BETWEEN 1 AND 10),
    rpn_2 INT GENERATED ALWAYS AS (severity_2 * occurrence_2 * detection_2) STORED,
    judgment_2 VARCHAR(2) NOT NULL,                  -- 'L', 'M', 'H'
    
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول ۳: اقدامات اصلاحی تخصصی (Corrective Actions / CAPA)
CREATE TABLE fmea_corrective_actions (
    id VARCHAR(64) PRIMARY KEY,
    hazard_id VARCHAR(64) UNIQUE REFERENCES fmea_hazards(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,                       -- شرح مراحل اجرایی
    responsible_person VARCHAR(128) NOT NULL,        -- مسئول اقدام
    department VARCHAR(64),                          -- واحد سازمانی مسئول
    target_date VARCHAR(20) NOT NULL,                -- مهلت اجرا (Due Date)
    completed_date VARCHAR(20),
    status VARCHAR(32) DEFAULT 'pending',            -- pending, in_progress, completed, overdue
    estimated_cost VARCHAR(64),
    effectiveness_review TEXT,                       -- بازبینی اثربخشی
    is_approved_by_hse BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول ۴: هشدارهای بلادرنگ ریسک‌های بحرانی (High Risk Alerts)
CREATE TABLE high_risk_alerts (
    id VARCHAR(64) PRIMARY KEY,
    hazard_id VARCHAR(64) REFERENCES fmea_hazards(id) ON DELETE CASCADE,
    workshop_name VARCHAR(128) NOT NULL,
    activity VARCHAR(255) NOT NULL,
    hazard_title VARCHAR(255) NOT NULL,
    rpn INT NOT NULL,
    severity INT NOT NULL,
    judgment VARCHAR(2) NOT NULL,
    triggered_at VARCHAR(32) NOT NULL,
    status VARCHAR(32) DEFAULT 'active',             -- active, acknowledged, resolved
    severity_level VARCHAR(32) DEFAULT 'critical',   -- critical, high, warning
    recipients_notified JSONB,
    dispatch_channels JSONB,
    action_required TEXT NOT NULL
);

-- جدول ۵: گزارش‌های دوره‌ای HSE (Periodic Reports)
CREATE TABLE fmea_periodic_reports (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    period VARCHAR(64) NOT NULL,                     -- مثلا: پاییز ۱۴۰۴
    workshop_name VARCHAR(128) NOT NULL,
    reporter_name VARCHAR(128) NOT NULL,
    total_hazards INT DEFAULT 0,
    high_risk_count INT DEFAULT 0,
    medium_risk_count INT DEFAULT 0,
    low_risk_count INT DEFAULT 0,
    avg_rpn_initial NUMERIC(5,2),
    avg_rpn_residual NUMERIC(5,2),
    risk_reduction_pct NUMERIC(5,2),
    compliance_score INT,
    summary_text TEXT,
    key_recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  const jsonSample = JSON.stringify(activeWorksheet, null, 2);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                ساختار داده‌ها، دیتابیس رابطه‌ای (SQL) و فرمت فایل FMEA
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                فرمت ساختاریافته داده‌ها جهت طراحی پایگاه‌داده در بک‌اند و اتصال به سامانه‌های سازمانی (ERP / HSE Core)
              </p>
            </div>
          </div>

          {/* Download buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportWorksheetToWord(activeWorksheet)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>دانلود فایل Word (.doc)</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>دانلود خروجی Excel / CSV</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>دانلود کل دیتابیس (JSON)</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1 border-t border-slate-800 pt-3">
          <button
            onClick={() => setActiveSubTab('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'json' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>فرمت فایل فعلی (JSON Schema)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'sql' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>اسکریپت SQL دیتابیس (PostgreSQL DDL)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('csv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'csv' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>پیش‌نمایش خروجی جدول اکسل (CSV)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('erd')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'erd' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>مدل مفهومی موجودیت‌ها (ERD)</span>
          </button>
        </div>
      </div>

      {/* Subtab Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
        
        {/* JSON TAB */}
        {activeSubTab === 'json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <FileJson className="w-4 h-4 text-cyan-400" />
                <span>نمونه فایل JSON کاربرگ جاری ({activeWorksheet.workshopName}):</span>
              </div>
              <button
                onClick={() => handleCopy(jsonSample, 'json')}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition cursor-pointer"
              >
                {copiedKey === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'json' ? 'کپی شد!' : 'کپی ساختار JSON'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] text-cyan-300 font-mono overflow-x-auto max-h-[500px] leading-relaxed text-left [direction:ltr]">
              {jsonSample}
            </pre>
          </div>
        )}

        {/* SQL TAB */}
        {activeSubTab === 'sql' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-amber-400" />
                <span>کدهای ایجاد جداول دیتابیس (SQL DDL):</span>
              </div>
              <button
                onClick={() => handleCopy(sqlSchema, 'sql')}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition cursor-pointer"
              >
                {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'sql' ? 'کپی شد!' : 'کپی اسکریپت SQL'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] text-amber-200 font-mono overflow-x-auto max-h-[500px] leading-relaxed text-left [direction:ltr]">
              {sqlSchema}
            </pre>
          </div>
        )}

        {/* CSV TAB */}
        {activeSubTab === 'csv' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-300">
                پیش‌نمایش ساختار ستون‌های خروجی Excel:
              </div>
              <button
                onClick={handleDownloadCsv}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>دانلود فایل CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-right text-[11px] text-slate-300 divide-y divide-slate-800">
                <thead className="bg-slate-950 text-slate-200 font-bold">
                  <tr>
                    <th className="p-2 border-l border-slate-800">ردیف</th>
                    <th className="p-2 border-l border-slate-800">فعالیت</th>
                    <th className="p-2 border-l border-slate-800">خطر بالقوه</th>
                    <th className="p-2 border-l border-slate-800">RPN1</th>
                    <th className="p-2 border-l border-slate-800">اقدام اصلاحی (CAPA)</th>
                    <th className="p-2 border-l border-slate-800">مسئول</th>
                    <th className="p-2 border-l border-slate-800">RPN2</th>
                    <th className="p-2">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                  {activeWorksheet.hazards.map((h) => (
                    <tr key={h.id}>
                      <td className="p-2 border-l border-slate-800 font-bold">{h.rowNumber}</td>
                      <td className="p-2 border-l border-slate-800">{h.activity}</td>
                      <td className="p-2 border-l border-slate-800 font-semibold text-amber-300">{h.potentialHazard}</td>
                      <td className="p-2 border-l border-slate-800 font-black text-amber-400">{h.rpn1}</td>
                      <td className="p-2 border-l border-slate-800 text-cyan-300">{h.correctiveAction.title}</td>
                      <td className="p-2 border-l border-slate-800">{h.correctiveAction.responsiblePerson}</td>
                      <td className="p-2 border-l border-slate-800 font-black text-emerald-400">{h.rpn2}</td>
                      <td className="p-2 font-bold">{h.correctiveAction.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ERD TAB */}
        {activeSubTab === 'erd' && (
          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-200">مدل مفهومی روابط موجودیت‌ها (Entity Relationship):</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Table className="w-4 h-4" />
                  <span>fmea_worksheets (کاربرگ‌ها)</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 font-mono [direction:ltr] text-left">
                  <li><strong>id</strong>: PK string</li>
                  <li>workshop_name: string</li>
                  <li>execution_date: string</li>
                  <li>hse_manager_approved: bool</li>
                  <li>team_members: jsonb</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Table className="w-4 h-4" />
                  <span>fmea_hazards (خطرات FMEA)</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 font-mono [direction:ltr] text-left">
                  <li><strong>id</strong>: PK string</li>
                  <li>worksheet_id: FK string</li>
                  <li>activity, potential_hazard: string</li>
                  <li>severity_1, occurrence_1, detection_1: int</li>
                  <li>rpn_1: int</li>
                  <li>proposed_controls: text</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Table className="w-4 h-4" />
                  <span>fmea_corrective_actions (اقدام اصلاحی)</span>
                </div>
                <ul className="text-[11px] text-slate-300 space-y-1 font-mono [direction:ltr] text-left">
                  <li><strong>id</strong>: PK string</li>
                  <li>hazard_id: FK (1:1) string</li>
                  <li>title, description: text</li>
                  <li>responsible_person: string</li>
                  <li>target_date, status: string</li>
                  <li>is_approved_by_hse: bool</li>
                </ul>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
