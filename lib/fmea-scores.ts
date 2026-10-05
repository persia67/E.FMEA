export interface ScoreOption {
  value: number;
  label: string;
  description: string;
  badgeColor?: string;
}

export const SEVERITY_OPTIONS: ScoreOption[] = [
  { value: 10, label: '۱۰ - فاجعه‌بار / فوت', description: 'حادثه مرگبار، فوت اپراتور، تخریب کامل' },
  { value: 9, label: '۹ - بسیار شدید / قطع عضو', description: 'قطع عضو دائم، نقص عضو غیرقابل بازگشت' },
  { value: 8, label: '۸ - شدید / بستری بیمارستانی', description: 'جراحت شدید، شکستگی‌های پیچیده، مسمومیت حاد' },
  { value: 7, label: '۷ - جدی / ازکارافتادگی موقت', description: 'آسیب جدی با غیبت از کار بیش از ۳ روز' },
  { value: 6, label: '۶ - متوسط به بالا / درمان تخصصی', description: 'جراحت نیازمند بخیه یا مداوای پزشکی' },
  { value: 5, label: '۵ - متوسط / کمک‌های اولیه در بهداری', description: 'آسیب نیازمند کمک‌های اولیه، پانسمان' },
  { value: 4, label: '۴ - خفیف / بدون از دست رفتن زمان کاری', description: 'آسیب جزئی و ادامه کار پس از استراحت کوتاه' },
  { value: 3, label: '۳ - بسیار خفیف / کوفتگی جزئی', description: 'خراشیدگی سطحی، کوفتگی بدون نیاز به درمان' },
  { value: 2, label: '۲ - ناچیز / اثرات موضعی گذرا', description: 'اثرات جزئی و بدون اختلال در سلامتی' },
  { value: 1, label: '۱ - بدون اثر / بدون جراحت', description: 'عدم هرگونه آسیب یا صدمه جسمانی' },
];

export const OCCURRENCE_OPTIONS: ScoreOption[] = [
  { value: 10, label: '۱۰ - تقریباً حتمی / روزانه', description: 'احتمال وقوع مداوم در هر شیفت کاری' },
  { value: 9, label: '۹ - بسیار زیاد / چند بار در هفته', description: 'تکرار مکرر در طول هفته' },
  { value: 8, label: '۸ - زیاد / هفتگی', description: 'احتمال وقوع حداقل یکبار در هفته' },
  { value: 7, label: '۷ - نسبتاً زیاد / هر دو هفته', description: 'احتمال رخداد هر دو هفته یکبار' },
  { value: 6, label: '۶ - متوسط به بالا / ماهانه', description: 'احتمال وقوع یکبار در ماه' },
  { value: 5, label: '۵ - متوسط / هر چند ماه یکبار', description: 'احتمال وقوع فصلی یا هر ۳ ماه' },
  { value: 4, label: '۴ - کم / سالی یکبار', description: 'احتمال وقوع در بازه سالانه' },
  { value: 3, label: '۳ - بسیار کم / هر چند سال', description: 'احتمال وقوع بسیار کم' },
  { value: 2, label: '۲ - نادر / بعید', description: 'وقوع فقط در شرایط بسیار استثنایی' },
  { value: 1, label: '۱ - تقریباً غیرممکن', description: 'عدم سابقه وقوع در تاریخچه صنعت' },
];

export const DETECTION_OPTIONS: ScoreOption[] = [
  { value: 10, label: '۱۰ - غیرقابل کشف / فاقد پایش', description: 'عدم وجود هرگونه سنسور یا چک‌لیست نظارتی' },
  { value: 9, label: '۹ - بسیار ضعیف / کشف تصادفی', description: 'احتمال کشف بسیار ناچیز قبل از حادثه' },
  { value: 8, label: '۸ - ضعیف / کشف بعد از رخداد', description: 'کشف پس از بروز نقص یا شبه‌حادثه' },
  { value: 7, label: '۷ - دشوار / پایش غیرمستمر', description: 'نیازمند بررسی دقیق کارشناسی' },
  { value: 6, label: '۶ - متوسط به پایین / بازرسی چشمی', description: 'کشف با بازدید چشمی روزانه اپراتور' },
  { value: 5, label: '۵ - متوسط / چک‌لیست هفتگی HSE', description: 'کشف در ممیزی و بازرسی هفتگی' },
  { value: 4, label: '۴ - خوب / برنامه نگهداری PM', description: 'کشف سیستماتیک در سرویس‌های دوره‌ای' },
  { value: 3, label: '۳ - بسیار خوب / پایش با گیج‌ها', description: 'کشف با عقربه، فشارسنج یا نشانگر' },
  { value: 2, label: '۲ - عالی / آلارم و هشدار نوری-صوتی', description: 'کشف سریع با بوق یا چراغ هشدار' },
  { value: 1, label: '۱ - قطعی و خودکار / قطع‌کن اینترلاک', description: 'کشف ۱۰۰٪ خودکار با توقف اضطراری سنسور' },
];

export function computeRiskMetrics(s: number, o: number, d: number) {
  const rpn = s * o * d;
  let judgment: 'L' | 'M' | 'H' = 'L';
  if (rpn >= 200 || s >= 9) {
    judgment = 'H';
  } else if (rpn >= 100 || s >= 7) {
    judgment = 'M';
  } else {
    judgment = 'L';
  }
  return { rpn, judgment };
}
