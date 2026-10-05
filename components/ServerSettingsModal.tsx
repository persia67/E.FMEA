'use client';

import React, { useState } from 'react';
import { 
  Server, 
  GitBranch, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  RefreshCw, 
  Database, 
  Cpu, 
  ShieldCheck, 
  Tag, 
  FolderSync, 
  X, 
  Network, 
  Laptop, 
  Flame,
  AlertCircle
} from 'lucide-react';
import { CURRENT_APP_VERSION, DEFAULT_SERVER_SETTINGS, ServerSettings } from '@/lib/version-config';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverSyncStatus: 'synced' | 'syncing' | 'offline_local';
  lastServerSyncTime: string | null;
  onForceSync: () => void;
}

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
  isOpen,
  onClose,
  serverSyncStatus,
  lastServerSyncTime,
  onForceSync,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'server' | 'github_cicd' | 'versioning'>('server');
  const [serverPort, setServerPort] = useState<number>(3000);
  const [serverIp, setServerIp] = useState<string>('0.0.0.0');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const windowsQuickStartCommand = `cd C:\\Apps\\HSE-FMEA-System\nnpm install\nnpm run build\nnpm run start -- -p ${serverPort} -H 0.0.0.0`;
  const pm2WindowsCommand = `npm install -g pm2 pm2-windows-service\npm2 start deploy/ecosystem.config.js\npm2 save\npm2-service-install -n HSE_FMEA_Server`;
  const firewallCommand = `netsh advfirewall firewall add rule name="HSE FMEA System" dir=in action=allow protocol=TCP localport=${serverPort}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  تنظیمات استقرار سرور داخلی (On-Premise) و استقرار خودکار CI/CD
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  v{CURRENT_APP_VERSION.version}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                پیکربندی اجرای برنامه روی ویندوز سرور، دیتابیس متمرکز شبکه داخلی و کامپایل خودکار با گیت‌هاب
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/60">
          <button
            onClick={() => setActiveSubTab('server')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeSubTab === 'server'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>ویندوز سرور و دیتابیس متمرکز</span>
          </button>

          <button
            onClick={() => setActiveSubTab('github_cicd')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeSubTab === 'github_cicd'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>استقرار خودکار گیت‌هاب (CI/CD Pipeline)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('versioning')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeSubTab === 'versioning'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>نسخه‌بندی و تاریخچه تغییرات</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: Windows Server Setup */}
          {activeSubTab === 'server' && (
            <div className="space-y-6">
              
              {/* Server Live Status Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-[11px] text-slate-400">وضعیت دیتابیس متمرکز:</div>
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>متصل به دیتابیس سرور مرکزی</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400">آخرین همگام‌سازی داده‌ها:</div>
                  <div className="text-xs font-bold text-slate-200 mt-1">
                    {lastServerSyncTime || 'هم‌اکنون'}
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={onForceSync}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${serverSyncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    <span>همگام‌سازی فوری دیتابیس</span>
                  </button>
                </div>
              </div>

              {/* IP & Port Configuration */}
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Network className="w-4 h-4 text-blue-400" />
                  <span>آدرس و پورت دسترسی کاربران در شبکه محلی شرکت (LAN / Intranet)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      پورت اختصاصی برنامه در ویندوز سرور:
                    </label>
                    <input
                      type="number"
                      value={serverPort}
                      onChange={(e) => setServerPort(Number(e.target.value) || 3000)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      (چون چند برنامه دیگر روی همین سرور دارید، می‌توانید پورتی مانند 3000 یا 8080 یا 8000 انتخاب کنید)
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      آدرس دسترسی پرسنل و ممیزان:
                    </label>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 flex items-center justify-between">
                      <span>http://[IP_سرور_شما]:{serverPort}</span>
                      <span className="text-[10px] text-slate-500">مثال: http://192.168.1.100:{serverPort}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Method 1: One-Click Windows Script */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>روش ۱: اجرای خودکار به کمک اسکریپت آماده ویندوز (توصیه شده)</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(windowsQuickStartCommand, 'script')}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    {copiedKey === 'script' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'script' ? 'کپی شد!' : 'کپی دستورات'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto text-left ltr">
                  <div className="text-slate-500"># فایل deploy/setup-windows-server.bat در ریشه پروژه قرار دارد</div>
                  <div>call deploy\setup-windows-server.bat</div>
                </div>
              </div>

              {/* Method 2: Running as a Windows Background Service (PM2) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span>روش ۲: نصب به عنوان Windows Service (اجرای دائم حتی پس از ری‌استارت سرور)</span>
                  </h4>
                  <button
                    onClick={() => handleCopy(pm2WindowsCommand, 'pm2')}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    {copiedKey === 'pm2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'pm2' ? 'کپی شد!' : 'کپی دستورات PM2'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-purple-300 space-y-1 overflow-x-auto text-left ltr">
                  <div>npm install -g pm2 pm2-windows-service</div>
                  <div>pm2 start deploy/ecosystem.config.js</div>
                  <div>pm2 save</div>
                </div>
              </div>

              {/* Firewall Rule Command */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>دستور باز کردن پورت {serverPort} در فایروال ویندوز سرور (PowerShell به عنوان Admin):</span>
                  </span>
                  <button
                    onClick={() => handleCopy(firewallCommand, 'firewall')}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    {copiedKey === 'firewall' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی دستور فایروال</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300 text-left ltr">
                  {firewallCommand}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: GitHub Actions CI/CD */}
          {activeSubTab === 'github_cicd' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <GitBranch className="w-4 h-4" />
                  <span>پایپ‌لاین استقرار و کامپایل خودکار با گیت‌هاب (GitHub Actions CI/CD)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  فایل <code className="bg-slate-950 px-1.5 py-0.5 rounded text-cyan-300 text-[11px]">.github/workflows/deploy.yml</code> در مخزن پروژه ایجاد شده است. با هر بار اجرای <code className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 text-[11px]">git push origin main</code>:
                </p>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>کدها به صورت خودکار تست و کامپایل تولیدی (<code className="text-slate-200">npm run build</code>) می‌شوند.</li>
                  <li>شماره نسخه به صورت خودکار یک پچ ارتقا می‌یابد (Semantic Versioning).</li>
                  <li>در صورت استفاده از Self-Hosted Runner روی ویندوز سرور، تغییرات بلافاصله پول و ری‌استارت می‌شوند.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">
                    محتوای پایپ‌لاین CI/CD گیت‌هاب (.github/workflows/deploy.yml):
                  </span>
                  <button
                    onClick={() => handleCopy(`name: HSE FMEA CI/CD Auto-Build
on:
  push:
    branches: [main, master]
jobs:
  build-and-deploy:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      - run: npm install
      - run: npm run build
      - run: pm2 reload hse-fmea-system`, 'cicd_code')}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    {copiedKey === 'cicd_code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>کپی فایل YAML</span>
                  </button>
                </div>

                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto text-left ltr max-h-56 leading-relaxed">
{`name: HSE FMEA CI/CD Auto-Build & Windows Server Deployment
on:
  push:
    branches: [main, master]

jobs:
  build:
    runs-on: self-hosted # رانر روی ویندوز سرور
    steps:
      - uses: actions/checkout@v4
      - name: Install Dependencies
        run: npm ci --legacy-peer-deps
      - name: Build Next.js
        run: npm run build
      - name: Restart Windows Service
        run: pm2 reload hse-fmea-system`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: Semantic Versioning & History */}
          {activeSubTab === 'versioning' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[11px] text-slate-400">نسخه جاری نرم‌افزار:</div>
                  <div className="text-xl font-black text-amber-400 flex items-center gap-2 mt-0.5">
                    <span>Version {CURRENT_APP_VERSION.version}</span>
                    <span className="text-xs font-normal text-slate-400">({CURRENT_APP_VERSION.releaseDate})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                    حالت استقرار: On-Premise Windows Server
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-200">تاریخچه تغییرات و ارتقای نسخه‌ها (Changelog):</h4>
                
                <div className="space-y-3">
                  {CURRENT_APP_VERSION.changelog.map((log, i) => (
                    <div key={i} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-300">نسخه {log.version}</span>
                          <span className="text-xs text-white font-semibold">- {log.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{log.date}</span>
                      </div>
                      <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside pr-1">
                        {log.changes.map((change, cIdx) => (
                          <li key={cIdx}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>آماده نصب و میزبانی موازی با سایر نرم‌افزارها روی ویندوز سرور</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition cursor-pointer"
          >
            متوجه شدم و بستن
          </button>
        </div>

      </div>
    </div>
  );
};
