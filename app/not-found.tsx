import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4 text-2xl font-black">
        ۴۰۴
      </div>
      <h2 className="text-xl font-bold mb-2">صفحه مورد نظر یافت نشد</h2>
      <p className="text-xs text-slate-400 mb-6 max-w-md">
        صفحه‌ای که به دنبال آن بودید در سامانه ارزیابی ریسک و FMEA وجود ندارد یا به آدرس دیگری منتقل شده است.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition"
      >
        بازگشت به کاربرگ اصلی
      </Link>
    </div>
  );
}
