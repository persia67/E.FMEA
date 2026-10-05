export interface VersionInfo {
  version: string;
  releaseDate: string;
  buildNumber: number;
  environment: 'production' | 'development' | 'on-premise-server';
  commitHash: string;
  changelog: {
    version: string;
    date: string;
    title: string;
    changes: string[];
  }[];
}

export const CURRENT_APP_VERSION: VersionInfo = {
  version: '1.3.0',
  releaseDate: '1404/07/26 (2026-10-05)',
  buildNumber: 130,
  environment: 'on-premise-server',
  commitHash: 'git-main-c48f2a',
  changelog: [
    {
      version: '1.3.0',
      date: '1404/07/26',
      title: 'نسخه سازمانی سرور داخلی (On-Premise) و استقرار خودکار CI/CD',
      changes: [
        'افزودن دیتابیس متمرکز سروری جهت ذخیره داده‌ها در شبکه داخلی شرکت (Windows Server)',
        'پشتیبانی از دسترسی کلیه کاربران از طریق IP و پورت سرور در شبکه محلی (LAN / Intranet)',
        'پیکربندی استقرار و کامپایل خودکار با گیت‌هاب (GitHub Actions CI/CD)',
        'افزودن اسکریپت‌های نصب و اجرای خودکار به عنوان Windows Service و وب‌سرور IIS',
        'سیستم ارتقای خودکار شماره نسخه (Semantic Versioning)',
      ],
    },
    {
      version: '1.2.0',
      date: '1404/07/20',
      title: 'بخش بایگانی سوابق و ویرایش مهلت‌های ۱۴۰۵',
      changes: [
        'افزودن سیستم آرشیو و نگهداری سوابق کاربرگ‌های FMEA',
        'حذف فیلد مسئول از ستون اقدام اصلاحی و ثبت مهلت‌های سال ۱۴۰۵',
        'مقاوم‌سازی پردازشگر و موتور فشرده‌سازی تصاویر فرم‌های اسکن‌شده',
      ],
    },
    {
      version: '1.1.0',
      date: '1404/07/18',
      title: 'به‌روزرسانی چارت سازمانی و خروجی رسمی Word',
      changes: [
        'تنظیم حمید رفیعیان به عنوان مسئول واحد ایمنی و بهداشت',
        'تعریف افسران ایمنی (سعید شفیعی، محمد مونسان، مهدی احمدی)',
        'افزودن مسئول واحد PM (مهندس مهدی نوری) و مسئول تعمیرات (عادل مرادی)',
        'تولید خروجی استاندارد Word (.doc) و فرم چاپی ممیزی ایزو ۴۵۰۰۱',
      ],
    },
  ],
};

export interface ServerSettings {
  serverIp: string;
  serverPort: number;
  serverMode: 'central_server' | 'hybrid_local_cache';
  windowsServiceName: string;
  iisReverseProxyEnabled: boolean;
  autoSyncIntervalSec: number;
  githubRepoUrl: string;
  autoVersionBump: boolean;
}

export const DEFAULT_SERVER_SETTINGS: ServerSettings = {
  serverIp: '0.0.0.0', // Listen on all network interfaces
  serverPort: 3000,
  serverMode: 'central_server',
  windowsServiceName: 'HseRiskProFmeaService',
  iisReverseProxyEnabled: true,
  autoSyncIntervalSec: 10,
  githubRepoUrl: 'https://github.com/company/hse-fmea-system.git',
  autoVersionBump: true,
};
