import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { activity, potentialHazard, existingControls, workshopName, cause, consequence } = body;

    if (!activity || !potentialHazard) {
      return NextResponse.json(
        { error: 'نام فعالیت و خطر بالقوه الزامی است.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback deterministic smart calculator if API key is not yet set
      const fallbackResult = generateDeterministicAnalysis(activity, potentialHazard, existingControls, workshopName);
      return NextResponse.json(fallbackResult);
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
شما یک متخصص ارشد مهندسی ایمنی صنعتی، بهداشت حرفه‌ای (HSE) و ممیز ارزیابی ریسک به روش FMEA (تحلیل حالات و اثرات خرابی/خطر) هستید.

بر اساس اطلاعات ارائه‌شده زیر، ارزیابی کامل FMEA را به زبان فارسی و با خروجی دقیق JSON انجام دهید:

- نام کارگاه: ${workshopName || 'کارگاه صنعتی'}
- فرآیند / فعالیت: ${activity}
- خطر بالقوه شناسایی شده: ${potentialHazard}
- اقدامات کنترلی فعلی (در صورت وجود): ${existingControls || 'اقدامات پایه‌ای'}
- علل محتمل (در صورت وجود): ${cause || 'عوامل انسانی و نقایص تجهیزاتی'}
- پیامدها (در صورت وجود): ${consequence || 'احتمال آسیب فیزیکی و شغلی'}

قوانین امتیازدهی FMEA ایمنی و بهداشت حرفه‌ای (مقیاس ۱ تا ۱۰):
۱. شدت (Severity - S1): از ۱ (بدون آسیب یا جراحت بسیار ناچیز) تا ۱۰ (فوت، قطع عضو، صدمات فاجعه‌بار).
۲. احتمال وقوع (Occurrence - O1): از ۱ (بسیار بعید و نادر) تا ۱۰ (بسیار زیاد، تقریباً حتمی و مکرر در هر شیفت).
۳. قابلیت کشف/کنترل (Detection - D1): از ۱ (احتمال کشف بسیار بالا و خودکار با سنسور) تا ۱۰ (غیرقابل کشف تا لحظه وقوع حادثه، عدم پایش).
۴. نمره اولویت ریسک (RPN1 = S1 * O1 * D1).
۵. قضاوت ریسک اول (judgment1):
   - اگر RPN < 100 باشد: "L" (ریسک کم - Low)
   - اگر 100 <= RPN < 200 یا S بین 7 تا 9 باشد: "M" (ریسک متوسط - Medium)
   - اگر RPN >= 200 یا S = 10 باشد: "H" (ریسک بحرانی/بالا - High)

۶. اقدامات کنترلی پیشنهادی (proposedControls): شامل ترکیب کنترل مهندسی (طراحی حفاظ، سنسور قطع‌کن، تهویه)، کنترل مدیریتی (دستورالعمل، آموزش، بازرسی ادواری PM) و تجهیزات حفاظت فردی (PPE).
۷. اقدام اصلاحی تفصیلی (Corrective Action - CAPA): شامل عنوان اجرایی، شرح مراحل گام‌به‌گام استاندارد، سمت سازمانی مسئول، مهلت پیشنهادی (تعداد روز)، و نحوه اثربخشی.
۸. ارزیابی ثانویه پس از اجرای اقدامات اصلاحی و کنترلی:
   - S2 (شدت ثانویه، معمولا اندکی کاهش می‌یابد یا ثابت می‌ماند)
   - O2 (احتمال وقوع ثانویه، به دلیل کنترل‌های مهندسی به شدت کاهش می‌یابد، مثلا ۲ الی ۴)
   - D2 (قابلیت کشف ثانویه، به دلیل پایش و سنسورها بهبود می‌یابد، مثلا ۲ الی ۴)
   - RPN2 = S2 * O2 * D2
   - judgment2: "L" یا "M"

خروجی شما باید منحصراً یک JSON معتبر بدون هرگونه متن اضافی یا markdown wrapper به ساختار زیر باشد:
{
  "severity1": number,
  "occurrence1": number,
  "detection1": number,
  "rpn1": number,
  "judgment1": "L" | "M" | "H",
  "consequence": "شرح دقیق پیامد خطر (مثلاً: قطع عضو، جراحت شدید، ضرب دیدگی، افت شنوایی)",
  "rootCauses": "شرح دقیق علل ریشه‌ای بروز خطر",
  "proposedControls": "اقدامات کنترلی پیشنهادی (مهندسی، اداری، تجهیزاتی)",
  "correctiveAction": {
    "title": "عنوان اقدام اصلاحی",
    "description": "شرح گام‌به‌گام اجرای اقدام اصلاحی",
    "responsibleRole": "سمت مسئول اقدام (مثلا: سرپرست فنی، کارشناس بهداشت حرفه‌ای، مهندس برق)",
    "targetDays": number,
    "recommendedVerification": "روش سنجش اثربخشی"
  },
  "severity2": number,
  "occurrence2": number,
  "detection2": number,
  "rpn2": number,
  "judgment2": "L" | "M" | "H",
  "riskReductionPercent": number,
  "urgencyExplanation": "توضیح کوتاه فنی درباره اولویت و ضرورت کنترل این خطر"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      // clean potential backticks if any
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanedText);
    } catch (e) {
      console.error('Failed to parse Gemini JSON:', responseText, e);
      parsedData = generateDeterministicAnalysis(activity, potentialHazard, existingControls, workshopName);
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'خطا در برقراری ارتباط با هوش مصنوعی' },
      { status: 500 }
    );
  }
}

function generateDeterministicAnalysis(activity: string, hazard: string, existingControls?: string, workshop?: string) {
  const isHighSeverity = /برخورد|گیوتین|قطع|فوت|مرگ|سقوط|برق|انفجار|له‌شدگی|پرس/i.test(hazard + ' ' + activity);
  const isMedium = /صدا|سروصدا|نویز|دود|دمه|تنفس|شیمیایی|سوختگی|پاشش/i.test(hazard + ' ' + activity);

  const s1 = isHighSeverity ? 9 : (isMedium ? 7 : 5);
  const o1 = isHighSeverity ? 5 : (isMedium ? 6 : 4);
  const d1 = isHighSeverity ? 4 : (isMedium ? 4 : 4);
  const rpn1 = s1 * o1 * d1;
  const judgment1 = rpn1 >= 200 || s1 >= 9 ? 'H' : (rpn1 >= 100 ? 'M' : 'L');

  const s2 = Math.max(1, s1 - 2);
  const o2 = Math.max(1, Math.round(o1 * 0.5));
  const d2 = Math.max(1, Math.round(d1 * 0.7));
  const rpn2 = s2 * o2 * d2;
  const judgment2 = rpn2 >= 100 ? 'M' : 'L';
  const reduction = Math.round(((rpn1 - rpn2) / rpn1) * 100);

  return {
    severity1: s1,
    occurrence1: o1,
    detection1: d1,
    rpn1: rpn1,
    judgment1: judgment1,
    consequence: isHighSeverity ? 'جراحت شدید، نقص عضو و توقف خط تولید' : (isMedium ? 'بیماری شغلی، افت شنوایی و آسیب ریوی' : 'کوفتگی و اتلاف وقت کاری'),
    rootCauses: `نقص در حفاظ‌گذاری و کمبود سیستم کنترلی در فرآیند ${activity}`,
    proposedControls: `طراحی و نصب حفاظ استاندارد اینترلاک، تدوین دستورالعمل ایمنی SOP، آموزش اپراتورها و پایش دوره‌ای PM`,
    correctiveAction: {
      title: `اجرای پکیج ایمن‌سازی مهندسی و بازرسی فنی برای ${activity}`,
      description: `۱. طراحی حفاظ فیزیکی و تعبیه سنسور حساس ۲. برگزاری دوره ایمنی و بازآموزی اپراتورها ۳. ثبت در چک‌لیست بازرسی روزانه HSE`,
      responsibleRole: 'سرپرست فنی و کارشناس ایمنی (HSE)',
      targetDays: 20,
      recommendedVerification: 'بررسی عدم تکرار شبه‌حادثه در بازه ۳۰ روزه پس از پیاده‌سازی'
    },
    severity2: s2,
    occurrence2: o2,
    detection2: d2,
    rpn2: rpn2,
    judgment2: judgment2,
    riskReductionPercent: reduction,
    urgencyExplanation: isHighSeverity ? 'این خطر به دلیل پیامد شدید و احتمال بالا نیازمند اقدام اصلاحی فوری (کمتر از ۷۲ ساعت) است.' : 'اقدام کنترلی در برنامه میان‌مدت پیگیری شود.'
  };
}
