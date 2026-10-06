'use client';

import React, { useEffect } from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mb-4 text-2xl font-black">
        ⚠️
      </div>
      <h2 className="text-xl font-bold mb-2">خطا در اجرای سامانه</h2>
      <p className="text-xs text-slate-400 mb-6 max-w-md">
        متأسفانه در پردازش درخواست خطایی رخ داده است. داده‌های شما در حافظه ذخیره هستند.
      </p>
      <button
        onClick={() => reset()}
        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
      >
        تلاش مجدد
      </button>
    </div>
  );
}
