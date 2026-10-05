'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FmeaWorksheet, 
  FmeaHazardItem, 
  UserProfile, 
  HighRiskAlert, 
  PeriodicReport,
  ActionStatus,
  RiskLevel
} from '@/types/fmea';
import { 
  INITIAL_USERS, 
  INITIAL_WORKSHEETS, 
  INITIAL_ALERTS, 
  INITIAL_PERIODIC_REPORTS 
} from '@/lib/sample-data';
import { exportWorksheetToWord } from '@/lib/word-export';
import { Header } from '@/components/Header';
import { FmeaTable } from '@/components/FmeaTable';
import { HazardModal } from '@/components/HazardModal';
import { AiAssistantModal } from '@/components/AiAssistantModal';
import { FileImportModal } from '@/components/FileImportModal';
import { ArchiveManager } from '@/components/ArchiveManager';
import { AlertsManager } from '@/components/AlertsManager';
import { PeriodicReports } from '@/components/PeriodicReports';
import { RiskMatrix } from '@/components/RiskMatrix';
import { DatabaseSchemaView } from '@/components/DatabaseSchemaView';
import { OfficialPrintView } from '@/components/OfficialPrintView';
import { ServerSettingsModal } from '@/components/ServerSettingsModal';

const STORAGE_KEY_WORKSHEETS = 'fmea_pro_worksheets_v2';
const STORAGE_KEY_REPORTS = 'fmea_pro_reports_v2';
const STORAGE_KEY_ALERTS = 'fmea_pro_alerts_v2';

export default function FmeaDashboardPage() {
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]); // حمید رفیعیان
  const [worksheets, setWorksheets] = useState<FmeaWorksheet[]>(INITIAL_WORKSHEETS);
  const [activeWorksheetId, setActiveWorksheetId] = useState<string>(INITIAL_WORKSHEETS[0].id);
  const [alerts, setAlerts] = useState<HighRiskAlert[]>(INITIAL_ALERTS);
  const [reports, setReports] = useState<PeriodicReport[]>(INITIAL_PERIODIC_REPORTS);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);
  
  // Central Server Sync State
  const [serverSyncStatus, setServerSyncStatus] = useState<'synced' | 'syncing' | 'offline_local'>('synced');
  const [lastServerSyncTime, setLastServerSyncTime] = useState<string | null>(null);

  // UI Tabs & Modals
  const [activeTab, setActiveTab] = useState<string>('table');
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);
  const [editingHazard, setEditingHazard] = useState<FmeaHazardItem | null>(null);
  const [isAiBatchOpen, setIsAiBatchOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isServerSettingsOpen, setIsServerSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Initial Load: Fetch from Central Server API (/api/fmea/data), fallback to LocalStorage
  useEffect(() => {
    async function loadCentralData() {
      setServerSyncStatus('syncing');
      try {
        const res = await fetch('/api/fmea/data', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.worksheets && Array.isArray(json.worksheets) && json.worksheets.length > 0) {
            setWorksheets(json.worksheets);
            setActiveWorksheetId(json.worksheets[0].id);
          }
          if (json.reports && Array.isArray(json.reports)) setReports(json.reports);
          if (json.alerts && Array.isArray(json.alerts)) setAlerts(json.alerts);
          if (json.users && Array.isArray(json.users)) setUsers(json.users);
          
          setServerSyncStatus('synced');
          setLastServerSyncTime(new Date().toLocaleTimeString('fa-IR'));
          setIsLoadedFromStorage(true);
          return;
        }
      } catch (err) {
        console.warn('Central server load failed, loading local storage:', err);
      }

      // Fallback: LocalStorage
      try {
        const savedWs = localStorage.getItem(STORAGE_KEY_WORKSHEETS);
        if (savedWs) {
          const parsed = JSON.parse(savedWs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWorksheets(parsed);
            setActiveWorksheetId(parsed[0].id);
          }
        }
        const savedReps = localStorage.getItem(STORAGE_KEY_REPORTS);
        if (savedReps) {
          const parsed = JSON.parse(savedReps);
          if (Array.isArray(parsed)) setReports(parsed);
        }
        const savedAlerts = localStorage.getItem(STORAGE_KEY_ALERTS);
        if (savedAlerts) {
          const parsed = JSON.parse(savedAlerts);
          if (Array.isArray(parsed)) setAlerts(parsed);
        }
        setServerSyncStatus('offline_local');
      } catch (e) {
        console.warn('LocalStorage load error:', e);
      } finally {
        setIsLoadedFromStorage(true);
      }
    }

    loadCentralData();
  }, []);

  // 2. Sync to Central Server Database & LocalStorage
  const syncToCentralServer = useCallback(async (currentWorksheets: FmeaWorksheet[], currentReports: PeriodicReport[], currentAlerts: HighRiskAlert[]) => {
    try {
      setServerSyncStatus('syncing');
      const res = await fetch('/api/fmea/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worksheets: currentWorksheets,
          reports: currentReports,
          alerts: currentAlerts,
        }),
      });

      if (res.ok) {
        setServerSyncStatus('synced');
        setLastServerSyncTime(new Date().toLocaleTimeString('fa-IR'));
      } else {
        setServerSyncStatus('offline_local');
      }
    } catch (e) {
      console.warn('Sync to server failed:', e);
      setServerSyncStatus('offline_local');
    }
  }, []);

  useEffect(() => {
    if (!isLoadedFromStorage) return;

    // 1. Always save to client LocalStorage as backup
    try {
      localStorage.setItem(STORAGE_KEY_WORKSHEETS, JSON.stringify(worksheets));
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // 2. Debounced save to Central Server Database
    const timer = setTimeout(() => {
      syncToCentralServer(worksheets, reports, alerts);
    }, 1000);

    return () => clearTimeout(timer);
  }, [worksheets, reports, alerts, isLoadedFromStorage, syncToCentralServer]);

  const activeWorksheet = worksheets.find((w) => w.id === activeWorksheetId) || worksheets[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to re-scan worksheets for high-risk hazards and generate automated alerts
  const handleAutoScanWorksheets = (targetWorksheets?: FmeaWorksheet[]) => {
    const listToScan = targetWorksheets || worksheets;
    const existingHazardAlertIds = new Set(alerts.map((a) => a.hazardId));
    const generatedAlerts: HighRiskAlert[] = [];

    listToScan.forEach((ws) => {
      ws.hazards.forEach((h) => {
        const isHigh = h.rpn1 >= 140 || h.judgment1 === 'H' || h.severity1 >= 8;
        if (isHigh && !existingHazardAlertIds.has(h.id)) {
          generatedAlerts.push({
            id: `alt-auto-${Date.now()}-${h.id}`,
            hazardId: h.id,
            workshopName: ws.workshopName,
            activity: h.activity,
            hazardTitle: `${h.potentialHazard} (RPN: ${h.rpn1}, شدت: ${h.severity1})`,
            rpn: h.rpn1,
            severity: h.severity1,
            judgment: h.judgment1,
            triggeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: 'active',
            severityLevel: h.severity1 >= 10 || h.rpn1 >= 200 ? 'critical' : 'high',
            recipientsNotified: ['حمید رفیعیان (مسئول ایمنی و بهداشت)', 'افسران ایمنی', 'مسئول تعمیرات'],
            dispatchChannels: ['in_app', 'sms'],
            actionRequired: `بررسی فوری اقدامات اصلاحی و بازرسی میدانی در کارگاه ${ws.workshopName}`,
          });
        }
      });
    });

    if (generatedAlerts.length > 0) {
      setAlerts((prev) => [...generatedAlerts, ...prev]);
      showToast(`${generatedAlerts.length} مورد ریسک بالا شناسایی و به مرکز هشدار ارسال شد.`);
    } else {
      showToast('تمام خطرات پایش شدند. هیچ هشدار جدیدی وجود ندارد.');
    }
  };

  // Archive Current Active Worksheet
  const handleArchiveCurrentWorksheet = () => {
    if (!activeWorksheet) return;

    setWorksheets((prev) =>
      prev.map((ws) => {
        if (ws.id !== activeWorksheet.id) return ws;
        return {
          ...ws,
          status: 'archived',
          archivedAt: new Date().toISOString().split('T')[0],
          archivedBy: currentUser.name,
        };
      })
    );

    showToast(`کاربرگ «${activeWorksheet.workshopName}» با موفقیت بایگانی و در بخش آرشیو ذخیره شد.`);
  };

  // Restore Archived Worksheet
  const handleRestoreWorksheet = (worksheetId: string) => {
    setWorksheets((prev) =>
      prev.map((ws) => {
        if (ws.id !== worksheetId) return ws;
        return {
          ...ws,
          status: 'under_review',
        };
      })
    );
    setActiveWorksheetId(worksheetId);
    showToast('کاربرگ با موفقیت از آرشیو بازیابی و فعال گردید.');
  };

  // Delete Archived Worksheet
  const handleDeleteArchivedWorksheet = (worksheetId: string) => {
    if (!confirm('آیا از حذف دائمی این کاربرگ بایگانی‌شده مطمئن هستید؟ این عملیات غیرقابل بازگشت است.')) return;

    setWorksheets((prev) => {
      const remaining = prev.filter((w) => w.id !== worksheetId);
      if (activeWorksheetId === worksheetId && remaining.length > 0) {
        setActiveWorksheetId(remaining[0].id);
      }
      return remaining;
    });
    showToast('کاربرگ بایگانی‌شده با موفقیت حذف شد.');
  };

  // File Import Success Handler
  const handleImportSuccess = (importedWorksheet: FmeaWorksheet, mode: 'create_new' | 'append_current') => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    if (mode === 'create_new') {
      const uniqueId = `ws-imported-${uniqueSuffix}`;
      const uniqueWorksheet: FmeaWorksheet = {
        ...importedWorksheet,
        id: uniqueId,
        hazards: (importedWorksheet.hazards || []).map((h, i) => ({
          ...h,
          id: `h-${uniqueId}-${i + 1}-${Math.random().toString(36).substring(2, 6)}`,
          rowNumber: i + 1,
          correctiveAction: {
            ...h.correctiveAction,
            id: `ca-${uniqueId}-${i + 1}`,
          },
        })),
      };

      setWorksheets((prev) => {
        const cleanPrev = prev.filter((w) => w.id !== uniqueWorksheet.id);
        return [uniqueWorksheet, ...cleanPrev];
      });

      setActiveWorksheetId(uniqueWorksheet.id);
      setActiveTab('table');
      showToast(`کاربرگ «${uniqueWorksheet.workshopName}» با موفقیت ایجاد و ذخیره شد.`);
      handleAutoScanWorksheets([uniqueWorksheet]);
    } else {
      setWorksheets((prev) =>
        prev.map((ws) => {
          if (ws.id !== activeWorksheet.id) return ws;
          const currentCount = ws.hazards.length;
          const adjustedHazards = (importedWorksheet.hazards || []).map((h, i) => ({
            ...h,
            id: `h-${ws.id}-${currentCount + i + 1}-${uniqueSuffix}`,
            rowNumber: currentCount + i + 1,
            correctiveAction: {
              ...h.correctiveAction,
              id: `ca-${ws.id}-${currentCount + i + 1}-${uniqueSuffix}`,
            },
          }));
          return {
            ...ws,
            hazards: [...ws.hazards, ...adjustedHazards],
          };
        })
      );
      showToast(`${importedWorksheet.hazards.length} ردیف خطر به کاربرگ «${activeWorksheet.workshopName}» اضافه گردید.`);
      handleAutoScanWorksheets();
    }
  };

  // Save / Update Hazard
  const handleSaveHazard = (savedHazard: FmeaHazardItem) => {
    setWorksheets((prevWorksheets) =>
      prevWorksheets.map((ws) => {
        if (ws.id !== activeWorksheet.id) return ws;

        const exists = ws.hazards.some((h) => h.id === savedHazard.id);
        let updatedHazards: FmeaHazardItem[];

        if (exists) {
          updatedHazards = ws.hazards.map((h) => (h.id === savedHazard.id ? savedHazard : h));
        } else {
          const nextRowNumber = ws.hazards.length + 1;
          updatedHazards = [...ws.hazards, { ...savedHazard, rowNumber: nextRowNumber }];
        }

        return {
          ...ws,
          hazards: updatedHazards,
          status: ws.status === 'archived' ? 'archived' : 'under_review',
        };
      })
    );

    // Check if new hazard is high risk to trigger automated alert
    if (savedHazard.rpn1 >= 140 || savedHazard.severity1 >= 8 || savedHazard.judgment1 === 'H') {
      const newAlert: HighRiskAlert = {
        id: `alt-${Date.now()}`,
        hazardId: savedHazard.id,
        workshopName: activeWorksheet.workshopName,
        activity: savedHazard.activity,
        hazardTitle: `${savedHazard.potentialHazard} (RPN: ${savedHazard.rpn1})`,
        rpn: savedHazard.rpn1,
        severity: savedHazard.severity1,
        judgment: savedHazard.judgment1,
        triggeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'active',
        severityLevel: savedHazard.severity1 >= 10 || savedHazard.rpn1 >= 200 ? 'critical' : 'high',
        recipientsNotified: ['حمید رفیعیان (مسئول ایمنی و بهداشت)', 'سرپرست کارگاه', currentUser.name],
        dispatchChannels: ['sms', 'in_app'],
        actionRequired: `اجرای فوری اقدام اصلاحی: ${savedHazard.correctiveAction.title}`,
      };

      setAlerts((prev) => [newAlert, ...prev]);
      showToast(`⚠️ هشدار خودکار برای خطر بحرانی «${savedHazard.potentialHazard}» صادر شد.`);
    } else {
      showToast('ردیف ارزیابی ریسک با موفقیت ذخیره شد.');
    }

    setEditingHazard(null);
  };

  // Direct Inline Update from Table
  const handleInlineUpdateHazard = (updatedHazard: FmeaHazardItem) => {
    setWorksheets((prevWorksheets) =>
      prevWorksheets.map((ws) => {
        if (ws.id !== activeWorksheet.id) return ws;
        return {
          ...ws,
          hazards: ws.hazards.map((h) => (h.id === updatedHazard.id ? updatedHazard : h)),
        };
      })
    );
  };

  // Quick Add New Empty Row
  const handleAddNewRow = () => {
    const nextRow = activeWorksheet.hazards.length + 1;
    const newHazard: FmeaHazardItem = {
      id: `h-${Date.now()}`,
      rowNumber: nextRow,
      activity: 'فرآیند جدید',
      potentialHazard: 'عنوان خطر بالقوه...',
      consequence: 'پیامد آسیب...',
      rootCauses: 'علت ریشه‌ای...',
      severity1: 6,
      occurrence1: 4,
      detection1: 4,
      rpn1: 96,
      judgment1: 'L',
      proposedControls: 'اقدامات کنترلی مهندسی و اداری...',
      correctiveAction: {
        id: `ca-${Date.now()}`,
        title: 'اقدام اصلاحی شماره ' + nextRow,
        description: 'شرح مراحل اجرایی...',
        responsiblePerson: '',
        department: 'HSE و فنی',
        targetDate: '1405/03/30',
        status: 'pending',
      },
      severity2: 5,
      occurrence2: 2,
      detection2: 3,
      rpn2: 30,
      judgment2: 'L',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    handleSaveHazard(newHazard);
    showToast('ردیف جدید به جدول اضافه شد.');
  };

  // Delete hazard
  const handleDeleteHazard = (hazardId: string) => {
    if (!confirm('آیا از حذف این ردیف ارزیابی ریسک مطمئن هستید؟')) return;

    setWorksheets((prev) =>
      prev.map((ws) => {
        if (ws.id !== activeWorksheet.id) return ws;
        const remaining = ws.hazards.filter((h) => h.id !== hazardId);
        const renumbered = remaining.map((h, i) => ({ ...h, rowNumber: i + 1 }));
        return { ...ws, hazards: renumbered };
      })
    );
    showToast('ردیف با موفقیت حذف شد.');
  };

  // Inline AI Re-analyze
  const handleAiAutoReanalyze = async (hazard: FmeaHazardItem) => {
    showToast(`در حال تحلیل هوشمند مجدد برای «${hazard.potentialHazard}»...`);
    try {
      const res = await fetch('/api/fmea/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: hazard.activity,
          potentialHazard: hazard.potentialHazard,
          workshopName: activeWorksheet.workshopName,
          cause: hazard.rootCauses,
          consequence: hazard.consequence,
        }),
      });

      if (!res.ok) throw new Error('خطا در پاسخ هوش مصنوعی');
      const data = await res.json();

      const updatedHazard: FmeaHazardItem = {
        ...hazard,
        severity1: data.severity1 || hazard.severity1,
        occurrence1: data.occurrence1 || hazard.occurrence1,
        detection1: data.detection1 || hazard.detection1,
        rpn1: data.rpn1 || (data.severity1 * data.occurrence1 * data.detection1),
        judgment1: data.judgment1 || hazard.judgment1,
        proposedControls: data.proposedControls || hazard.proposedControls,
        correctiveAction: {
          ...hazard.correctiveAction,
          title: data.correctiveAction?.title || hazard.correctiveAction.title,
          description: data.correctiveAction?.description || hazard.correctiveAction.description,
          targetDate: '1405/03/30',
        },
        severity2: data.severity2 || hazard.severity2,
        occurrence2: data.occurrence2 || hazard.occurrence2,
        detection2: data.detection2 || hazard.detection2,
        rpn2: data.rpn2 || (data.severity2 * data.occurrence2 * data.detection2),
        judgment2: data.judgment2 || hazard.judgment2,
        updatedAt: new Date().toISOString().split('T')[0],
      };

      handleSaveHazard(updatedHazard);
      showToast('امتیازها و اقدامات اصلاحی با هوش مصنوعی به‌روزرسانی شد.');
    } catch (err: any) {
      showToast('خطا در تحلیل هوش مصنوعی: ' + err.message);
    }
  };

  // Toggle CAPA status
  const handleToggleActionStatus = (hazardId: string, currentStatus: ActionStatus) => {
    const cycle: Record<ActionStatus, ActionStatus> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending',
      overdue: 'in_progress',
      reviewed: 'completed',
    };
    const nextStatus = cycle[currentStatus] || 'in_progress';

    setWorksheets((prev) =>
      prev.map((ws) => {
        if (ws.id !== activeWorksheet.id) return ws;
        return {
          ...ws,
          hazards: ws.hazards.map((h) => {
            if (h.id === hazardId) {
              return {
                ...h,
                correctiveAction: {
                  ...h.correctiveAction,
                  status: nextStatus,
                  completedDate: nextStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
                },
              };
            }
            return h;
          }),
        };
      })
    );

    showToast(`وضعیت اقدام اصلاحی به «${nextStatus === 'completed' ? 'تکمیل شده' : nextStatus === 'in_progress' ? 'در حال انجام' : 'در انتظار'}» تغییر یافت.`);
  };

  // HSE Manager Approval
  const handleApproveWorksheet = () => {
    if (currentUser.role !== 'hse_manager') {
      alert('تنها مسئول واحد ایمنی و بهداشت (حمید رفیعیان) دسترسی به تایید نهایی کاربرگ را دارد.');
      return;
    }

    setWorksheets((prev) =>
      prev.map((ws) => {
        if (ws.id !== activeWorksheet.id) return ws;
        return {
          ...ws,
          hseManagerApproved: true,
          hseManagerApprovedDate: new Date().toISOString().split('T')[0],
          hseManagerName: currentUser.name,
          status: 'approved',
        };
      })
    );
    showToast(`کاربرگ ${activeWorksheet.workshopName} با موفقیت توسط ${currentUser.name} تایید و مهر رسمی شد.`);
  };

  // Add Batch AI items
  const handleAddBatchAiHazards = (newHazards: FmeaHazardItem[]) => {
    setWorksheets((prev) =>
      prev.map((ws) => {
        if (ws.id !== activeWorksheet.id) return ws;
        const currentCount = ws.hazards.length;
        const adjustedNew = newHazards.map((item, idx) => ({
          ...item,
          rowNumber: currentCount + idx + 1,
        }));
        return {
          ...ws,
          hazards: [...ws.hazards, ...adjustedNew],
        };
      })
    );
    showToast(`${newHazards.length} ردیف شناسایی شده توسط AI به کاربرگ افزوده شد.`);
    handleAutoScanWorksheets();
  };

  // Update alert status
  const handleUpdateAlertStatus = (alertId: string, status: 'active' | 'acknowledged' | 'resolved') => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status } : a))
    );
    showToast(`وضعیت هشدار به «${status === 'resolved' ? 'رفع شده' : status === 'acknowledged' ? 'مشاهده شده' : 'فعال'}» تغییر یافت.`);
  };

  // Dispatch simulated alert
  const handleDispatchAlert = (alertId: string, channels: ('sms' | 'email' | 'in_app')[]) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, dispatchChannels: channels } : a))
    );
  };

  // Create Periodic Report
  const handleCreateReport = (newReport: PeriodicReport) => {
    setReports((prev) => [newReport, ...prev]);
    showToast(`گزارش دوره‌ای «${newReport.title}» با موفقیت ثبت شد.`);
  };

  // Export to Word
  const handleExportWord = () => {
    exportWorksheetToWord(activeWorksheet);
    showToast(`فایل Word کاربرگ ${activeWorksheet.workshopName} با موفقیت دانلود شد.`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 bg-slate-900 border border-amber-500/50 text-amber-300 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        onUserChange={setCurrentUser}
        worksheets={worksheets}
        activeWorksheetId={activeWorksheetId}
        onWorksheetChange={setActiveWorksheetId}
        alerts={alerts}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewHazard={() => {
          setEditingHazard(null);
          setIsHazardModalOpen(true);
        }}
        onOpenAiBatch={() => setIsAiBatchOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenServerSettings={() => setIsServerSettingsOpen(true)}
        onArchiveCurrentWorksheet={handleArchiveCurrentWorksheet}
        onPrint={handlePrint}
        onExportWord={handleExportWord}
        onApproveWorksheet={handleApproveWorksheet}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Tab 1: Primary FMEA Table */}
        {activeTab === 'table' && (
          <FmeaTable
            worksheet={activeWorksheet}
            currentUser={currentUser}
            onEditHazard={(h) => {
              setEditingHazard(h);
              setIsHazardModalOpen(true);
            }}
            onDeleteHazard={handleDeleteHazard}
            onAiAutoReanalyze={handleAiAutoReanalyze}
            onToggleActionStatus={handleToggleActionStatus}
            onInlineUpdateHazard={handleInlineUpdateHazard}
            onExportWord={handleExportWord}
            onAddNewRow={handleAddNewRow}
          />
        )}

        {/* Tab 2: Archive Manager */}
        {activeTab === 'archive' && (
          <ArchiveManager
            worksheets={worksheets}
            currentUser={currentUser}
            onRestoreWorksheet={handleRestoreWorksheet}
            onDeleteArchivedWorksheet={handleDeleteArchivedWorksheet}
            onSelectAndInspect={(id) => {
              setActiveWorksheetId(id);
              setActiveTab('table');
            }}
            onPrintWorksheet={(ws) => {
              setActiveWorksheetId(ws.id);
              setActiveTab('official_print');
            }}
          />
        )}

        {/* Tab 3: Interactive Risk Matrix */}
        {activeTab === 'matrix' && (
          <RiskMatrix
            worksheet={activeWorksheet}
            onSelectHazard={(h) => {
              setEditingHazard(h);
              setIsHazardModalOpen(true);
            }}
          />
        )}

        {/* Tab 4: Periodic HSE Reports */}
        {activeTab === 'reports' && (
          <PeriodicReports
            reports={reports}
            worksheets={worksheets}
            currentUser={currentUser}
            onCreateReport={handleCreateReport}
            onPrintReport={() => handlePrint()}
          />
        )}

        {/* Tab 5: High-Risk Alert Center */}
        {activeTab === 'alerts' && (
          <AlertsManager
            alerts={alerts}
            worksheets={worksheets}
            currentUser={currentUser}
            onUpdateAlertStatus={handleUpdateAlertStatus}
            onDispatchAlert={handleDispatchAlert}
            onAutoScanWorksheets={handleAutoScanWorksheets}
          />
        )}

        {/* Tab 6: Database Schema, SQL & File Format Viewer */}
        {activeTab === 'database' && (
          <DatabaseSchemaView
            activeWorksheet={activeWorksheet}
            allWorksheets={worksheets}
          />
        )}

        {/* Tab 7: Official Paper Print View */}
        {activeTab === 'official_print' && (
          <OfficialPrintView
            worksheet={activeWorksheet}
            onPrint={handlePrint}
          />
        )}

      </main>

      {/* Add / Edit Hazard Modal */}
      <HazardModal
        isOpen={isHazardModalOpen}
        onClose={() => {
          setIsHazardModalOpen(false);
          setEditingHazard(null);
        }}
        onSave={handleSaveHazard}
        initialHazard={editingHazard}
        workshopName={activeWorksheet.workshopName}
      />

      {/* AI Batch Generator Modal */}
      <AiAssistantModal
        isOpen={isAiBatchOpen}
        onClose={() => setIsAiBatchOpen(false)}
        workshopName={activeWorksheet.workshopName}
        onAddHazards={handleAddBatchAiHazards}
      />

      {/* AI File & Image OCR Importer Modal */}
      <FileImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
        currentWorkshopName={activeWorksheet.workshopName}
      />

      {/* Central Server & CI/CD Settings Modal */}
      <ServerSettingsModal
        isOpen={isServerSettingsOpen}
        onClose={() => setIsServerSettingsOpen(false)}
        serverSyncStatus={serverSyncStatus}
        lastServerSyncTime={lastServerSyncTime}
        onForceSync={() => syncToCentralServer(worksheets, reports, alerts)}
      />

    </div>
  );
}
