import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_WORKSHEETS, INITIAL_PERIODIC_REPORTS, INITIAL_ALERTS, INITIAL_USERS } from '@/lib/sample-data';
import { CURRENT_APP_VERSION } from '@/lib/version-config';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'fmea-database.json');
const BACKUP_FILE = path.join(DATA_DIR, 'fmea-database.backup.json');

// Ensure data folder and initial JSON exist
function getDbData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        version: CURRENT_APP_VERSION.version,
        lastUpdated: new Date().toISOString(),
        worksheets: INITIAL_WORKSHEETS,
        reports: INITIAL_PERIODIC_REPORTS,
        alerts: INITIAL_ALERTS,
        users: INITIAL_USERS,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading central database:', error);
    return {
      version: CURRENT_APP_VERSION.version,
      lastUpdated: new Date().toISOString(),
      worksheets: INITIAL_WORKSHEETS,
      reports: INITIAL_PERIODIC_REPORTS,
      alerts: INITIAL_ALERTS,
      users: INITIAL_USERS,
    };
  }
}

export async function GET() {
  try {
    const data = getDbData();
    return NextResponse.json({
      success: true,
      serverStatus: 'online',
      serverMode: 'central_windows_server',
      version: CURRENT_APP_VERSION.version,
      lastUpdated: data.lastUpdated,
      worksheets: data.worksheets || INITIAL_WORKSHEETS,
      reports: data.reports || INITIAL_PERIODIC_REPORTS,
      alerts: data.alerts || INITIAL_ALERTS,
      users: data.users || INITIAL_USERS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'خطا در دریافت داده‌های دیتابیس متمرکز سرور', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { worksheets, reports, alerts } = body;

    if (!Array.isArray(worksheets)) {
      return NextResponse.json(
        { error: 'ساختار داده‌های ارسالی نامعتبر است.' },
        { status: 400 }
      );
    }

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Create a backup of existing file before overwrite
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, BACKUP_FILE);
      } catch (backupErr) {
        console.warn('Could not create DB backup:', backupErr);
      }
    }

    const payloadToSave = {
      version: CURRENT_APP_VERSION.version,
      lastUpdated: new Date().toISOString(),
      worksheets: worksheets,
      reports: Array.isArray(reports) ? reports : [],
      alerts: Array.isArray(alerts) ? alerts : [],
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(payloadToSave, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'داده‌ها با موفقیت در دیتابیس متمرکز سرور ذخیره شدند.',
      lastUpdated: payloadToSave.lastUpdated,
      totalWorksheets: worksheets.length,
      totalHazards: worksheets.reduce((acc: number, w: any) => acc + (w.hazards?.length || 0), 0),
    });
  } catch (error: any) {
    console.error('Error writing to central database:', error);
    return NextResponse.json(
      { error: 'خطا در ذخیره‌سازی داده‌ها در سرور', details: error?.message },
      { status: 500 }
    );
  }
}
