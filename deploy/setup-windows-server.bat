@echo off
chcp 65001 > nul
title سامانه هوشمند FMEA و ارزیابی ریسک HSE - راه‌اندازی ویندوز سرور

echo =========================================================================
echo    سامانه جامع ارزیابی ریسک و FMEA ایمنی صنعتی (HSE RiskPro)
echo    اسکریپت نصب، پیکربندی و اجرای خودکار روی ویندوز سرور (Windows Server)
echo =========================================================================
echo.

:: 1. بررسی نصب بودن Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [خطا] Node.js روی سرور یافت نشد. لطفاً نسخه LTS را از nodejs.org نصب کنید.
    pause
    exit /b 1
)

echo [۱/۵] بررسی نسخه Node.js و npm...
node -v
npm -v
echo.

:: 2. تنظیم متغیرهای پورت و هاست سرور
set PORT=3000
set HOSTNAME=0.0.0.0
echo [۲/۵] تنظیم پورت سرور روی %PORT% و اتصال به تمام کارت‌های شبکه (%HOSTNAME%)...
echo.

:: 3. نصب وابستگی‌ها
echo [۳/۵] در حال نصب بسته‌ها و کتابخانه‌های نرم‌افزار (npm install)...
call npm install --omit=dev --legacy-peer-deps
echo.

:: 4. کامپایل و بیلد نسخه نهایی
echo [۴/۵] در حال کامپایل و بیلد نسخه بهینه تولید (npm run build)...
call npm run build
echo.

:: 5. باز کردن پورت در فایروال ویندوز سرور (اختیاری اما توصیه شده)
echo [۵/۵] پیکربندی فایروال ویندوز برای دسترسی کلاینت‌ها در شبکه محلی...
netsh advfirewall firewall add rule name="HSE FMEA System Web" dir=in action=allow protocol=TCP localport=%PORT% >nul 2>nul

echo.
echo =========================================================================
echo    نرم‌افزار با موفقیت کامپایل شد و آماده سرویس‌دهی است!
echo.
echo    آدرس دسترسی در سرور و سایر کامپیوترهای شبکه داخلی (LAN):
echo    http://127.0.0.1:%PORT%
echo    http://[SERVER_LOCAL_IP]:%PORT%
echo =========================================================================
echo.

:: اجرای پروسه سرور با پورت مشخص و شنود روی تمام کارت‌های شبکه
call npm run start -- -p %PORT% -H 0.0.0.0
pause
