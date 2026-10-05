'use client';

import React, { useState } from 'react';
import { HighRiskAlert, FmeaWorksheet, UserProfile } from '@/types/fmea';
import { 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  AlertTriangle, 
  Sliders, 
  CheckCheck,
  RefreshCw,
  Flame,
  Radio,
  Eye
} from 'lucide-react';

interface AlertsManagerProps {
  alerts: HighRiskAlert[];
  worksheets: FmeaWorksheet[];
  currentUser: UserProfile;
  onUpdateAlertStatus: (alertId: string, status: 'active' | 'acknowledged' | 'resolved') => void;
  onDispatchAlert: (alertId: string, channels: ('sms' | 'email' | 'in_app')[]) => void;
  onAutoScanWorksheets: () => void;
}

export const AlertsManager: React.FC<AlertsManagerProps> = ({
  alerts,
  worksheets,
  currentUser,
  onUpdateAlertStatus,
  onDispatchAlert,
  onAutoScanWorksheets,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('active');
  const [rpnThreshold, setRpnThreshold] = useState(140);
  const [isSimulatingSend, setIsSimulatingSend] = useState<string | null>(null);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const handleSendSimulatedNotification = (alert: HighRiskAlert) => {
    setIsSimulatingSend(alert.id);
    setTimeout(() => {
      onDispatchAlert(alert.id, ['sms', 'email', 'in_app']);
      setIsSimulatingSend(null);
      setDispatchSuccessMsg(`هشدار اضطراری برای «${alert.hazardTitle}» با موفقیت به شماره رئیس ایمنی و سرپرست کارگاه ارسال شد.`);
      setTimeout(() => setDispatchSuccessMsg(null), 5000);
    }, 1200);
  };

  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const criticalCount = alerts.filter((a) => a.severityLevel === 'critical' && a.status === 'active').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center animate-pulse">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">مرکز فرماندهی و هشدارهای خودکار ریسک‌های بحرانی</h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-ping" />
                  سامانه پایش زنده
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                تشخیص بلادرنگ خطرات با RPN بالا یا شدت بحرانی (S ≥ 8) و ارسال آنی نوتیفیکیشن، پیامک و ایمیل به مسئولین
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onAutoScanWorksheets}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>اسکن مجدد کاربرگ‌ها</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400">هشدارهای فعال</div>
            <div className="text-2xl font-black text-rose-400 mt-0.5">{activeCount} مورد</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400">سطح فوق‌بحرانی (Critical)</div>
            <div className="text-2xl font-black text-rose-500 mt-0.5">{criticalCount} مورد</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400">آستانه هشدار خودکار</div>
            <div className="text-2xl font-black text-amber-400 mt-0.5">RPN ≥ {rpnThreshold}</div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400">کانال‌های ارسال</div>
            <div className="text-sm font-bold text-cyan-400 mt-1 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> پیامک + <Mail className="w-4 h-4" /> ایمیل
            </div>
          </div>
        </div>
      </div>

      {dispatchSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCheck className="w-5 h-5 text-emerald-400" />
          <span>{dispatchSuccessMsg}</span>
        </div>
      )}

      {/* Threshold & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === 'active'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            هشدارهای فعال ({activeCount})
          </button>
          <button
            onClick={() => setFilter('acknowledged')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === 'acknowledged'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            مشاهده‌شده و در دست بررسی
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === 'resolved'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            رفع‌شده (Resolved)
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            همه ({alerts.length})
          </button>
        </div>

        {/* Threshold setting */}
        <div className="flex items-center gap-3 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">آستانه RPN هشدار:</span>
          <select
            value={rpnThreshold}
            onChange={(e) => setRpnThreshold(Number(e.target.value))}
            className="bg-transparent font-bold text-amber-400 focus:outline-none cursor-pointer"
          >
            <option value={100} className="bg-slate-900">RPN ≥ 100 (ریسک متوسط به بالا)</option>
            <option value={140} className="bg-slate-900">RPN ≥ 140 (ریسک بالا - استاندارد)</option>
            <option value={180} className="bg-slate-900">RPN ≥ 180 (فوق بحرانی)</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-slate-200">هیچ هشداری در این وضعیت وجود ندارد</h3>
            <p className="text-xs text-slate-400 mt-1">تمام خطرات بحرانی بررسی شده یا تحت کنترل هستند.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severityLevel === 'critical';
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all ${
                  alert.status === 'active'
                    ? isCritical
                      ? 'bg-rose-950/20 border-rose-600/50 shadow-lg shadow-rose-950/30'
                      : 'bg-amber-950/20 border-amber-600/50'
                    : 'bg-slate-900 border-slate-800 opacity-80'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  
                  {/* Left hazard title & workshop */}
                  <div className="space-y-2 flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-black flex items-center gap-1 ${
                        isCritical ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-500 text-slate-950'
                      }`}>
                        <Flame className="w-3.5 h-3.5" />
                        {isCritical ? 'سطح فوق‌بحرانی (Critical)' : 'سطح هشدار بالا (High)'}
                      </span>
                      <span className="text-xs font-bold text-slate-300">کارگاه: {alert.workshopName}</span>
                      <span className="text-xs text-slate-400">فرآیند: {alert.activity}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ثبت: {alert.triggeredAt}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">
                      {alert.hazardTitle}
                    </h3>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="font-bold text-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        اقدام فوری الزامی:
                      </div>
                      <p className="leading-relaxed">{alert.actionRequired}</p>
                    </div>

                    {/* Recipients Log */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pt-1">
                      <span className="text-slate-300 font-semibold">ارسال خودکار به:</span>
                      {alert.recipientsNotified.map((rec, idx) => (
                        <span key={idx} className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                          {rec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right Score & Actions */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="text-center px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400">شدت (S)</div>
                        <div className="text-lg font-black text-rose-400">{alert.severity} / ۱۰</div>
                      </div>
                      <div className="text-center px-3 py-1.5 bg-slate-950 rounded-xl border border-rose-800/60">
                        <div className="text-[10px] text-rose-300 font-bold">RPN</div>
                        <div className="text-xl font-black text-rose-400">{alert.rpn}</div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      
                      {alert.status === 'active' && (
                        <button
                          onClick={() => handleSendSimulatedNotification(alert)}
                          disabled={isSimulatingSend === alert.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition cursor-pointer"
                          title="ارسال پیامک و ایمیل اضطراری به مسئولین"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSimulatingSend === alert.id ? 'در حال ارسال پیامک...' : 'ارسال مجدد هشدار به گوشی'}</span>
                        </button>
                      )}

                      {alert.status === 'active' && (
                        <button
                          onClick={() => onUpdateAlertStatus(alert.id, 'acknowledged')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>تایید رویت و پیگیری</span>
                        </button>
                      )}

                      {alert.status !== 'resolved' && (
                        <button
                          onClick={() => onUpdateAlertStatus(alert.id, 'resolved')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>بستن و رفع خطر</span>
                        </button>
                      )}

                      {alert.status === 'resolved' && (
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/40 rounded-lg">
                          <CheckCheck className="w-4 h-4" /> رفع شده و امن
                        </span>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
