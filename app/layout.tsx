import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'سامانه هوشمند ارزیابی ریسک و FMEA ایمنی صنعتی (HSE RiskPro)',
  description: 'سیستم جامع ارزیابی ریسک FMEA، امتیازدهی هوشمند، پیشنهادات کنترلی، ثبت اقدامات اصلاحی، گزارش‌های دوره‌ای و هشدارهای خودکار ریسک بالا',
  openGraph: {
    title: 'سامانه هوشمند ارزیابی ریسک و FMEA ایمنی صنعتی (HSE RiskPro)',
    description: 'سیستم جامع ارزیابی ریسک FMEA با هوش مصنوعی و هشدارهای خودکار ایمنی',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سامانه هوشمند ارزیابی ریسک و FMEA ایمنی صنعتی (HSE RiskPro)',
    description: 'سیستم جامع ارزیابی ریسک FMEA با هوش مصنوعی و هشدارهای خودکار ایمنی',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-amber-500 selection:text-slate-950" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
