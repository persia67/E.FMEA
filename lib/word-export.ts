import { FmeaWorksheet } from '@/types/fmea';

export function exportWorksheetToWord(worksheet: FmeaWorksheet) {
  const hazardsRows = worksheet.hazards
    .map(
      (h, idx) => `
    <tr>
      <td style="border: 1px solid #333333; padding: 6px; text-align: center; font-weight: bold;">${h.rowNumber || idx + 1}</td>
      <td style="border: 1px solid #333333; padding: 6px; text-align: right;">${escapeHtml(h.activity)}</td>
      <td style="border: 1px solid #333333; padding: 6px; text-align: right; font-weight: bold; color: #990000;">${escapeHtml(h.potentialHazard)}</td>
      <td style="border: 1px solid #333333; padding: 6px; text-align: right;">${escapeHtml(h.consequence)}</td>
      <td style="border: 1px solid #333333; padding: 6px; text-align: right;">${escapeHtml(h.rootCauses)}</td>
      
      <!-- ارزیابی ۱ -->
      <td style="border: 1px solid #333333; padding: 6px; text-align: center; font-weight: bold;">${h.severity1}</td>
      <td style="border: 1px solid #333333; padding: 6px; text-align: center;">${h.occurrence1}</td>
      <td style="border: 1px solid #333333; padding: 6px; text-align: center;">${h.detection1}</td>
      <td style="border: 1px solid #333333; padding: 6px; text-align: center; font-weight: bold; background-color: #f2f2f2;">${h.rpn1}</td>
      
      <!-- قضاوت -->
      <td style="border: 1px solid #333333; padding: 6px; text-align: center; font-weight: bold; background-color: ${
        h.judgment1 === 'H' ? '#ffcccc' : h.judgment1 === 'M' ? '#fff3cd' : '#d4edda'
      };">${h.judgment1}</td>
      
      <!-- اقدامات کنترلی پیشنهادی -->
      <td style="border: 1px solid #333333; padding: 6px; text-align: right; font-size: 9pt;">${escapeHtml(h.proposedControls)}</td>
      
      <!-- اقدام اصلاحی -->
      <td style="border: 1px solid #333333; padding: 6px; text-align: right; font-size: 9pt; background-color: #fff9e6;">
        <div style="font-weight: bold; color: #b45309;">${escapeHtml(h.correctiveAction.title)}</div>
        <div style="color: #444444; margin-top: 3px;">${escapeHtml(h.correctiveAction.description)}</div>
        <div style="margin-top: 4px; font-size: 8pt; color: #666666;">
          <strong>مهلت اجرا:</strong> ${escapeHtml(h.correctiveAction.targetDate)} | 
          <strong>وضعیت:</strong> ${getActionStatusFarsi(h.correctiveAction.status)}
        </div>
      </td>
      
      <!-- ارزیابی ۲ -->
      <td style="border: 1px solid #333333; padding: 6px; text-align: center;">${h.severity2}</td>
      <td style="border: 1px solid #333333; padding: 6px; text-align: center;">${h.occurrence2}</td>
      <td style="border: 1px solid #333333; padding: 6px; text-align: center;">${h.detection2}</td>
      <td style="border: 1px solid #333333; padding: 6px; text-align: center; font-weight: bold; background-color: #e6f4ea;">${h.rpn2}</td>
    </tr>
  `
    )
    .join('');

  const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>فرم ارزیابی ریسک FMEA - ${escapeHtml(worksheet.workshopName)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 11.69in 8.27in; /* A4 Landscape */
      mso-page-orientation: landscape;
      margin: 0.5in 0.5in 0.5in 0.5in;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Vazirmatn', 'Tahoma', 'B Nazanin', 'Arial', sans-serif;
      direction: rtl;
      text-align: right;
      font-size: 10pt;
      line-height: 1.4;
      color: #111111;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 10px;
    }
    th {
      background-color: #eeeeee;
      font-weight: bold;
      border: 1px solid #333333;
      padding: 6px;
      text-align: center;
      font-size: 9pt;
    }
    .header-box {
      border-bottom: 2px solid #222222;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .title {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 10.5pt;
      font-weight: bold;
    }
    .signatures-table {
      margin-top: 25px;
      border: none;
      width: 100%;
    }
    .signatures-table td {
      border: 1px dashed #777777;
      padding: 12px;
      vertical-align: top;
      width: 50%;
    }
  </style>
</head>
<body>
  <div class="Section1">
    
    <div class="title">فرم FMEA (ارزیابی ریسک و تعیین اقدامات اصلاحی)</div>
    
    <div class="header-box">
      <table style="border: none; width: 100%; margin: 0;">
        <tr style="border: none;">
          <td style="border: none; font-weight: bold; font-size: 11pt; text-align: right; width: 33%;">
            نام کارگاه : <span style="color: #b45309;">${escapeHtml(worksheet.workshopName)}</span>
          </td>
          <td style="border: none; font-weight: bold; font-size: 10.5pt; text-align: center; width: 33%;">
            ۲- تاریخ اجرا : ${escapeHtml(worksheet.executionDate)}
          </td>
          <td style="border: none; font-weight: bold; font-size: 10pt; text-align: left; width: 34%;">
            ۳ - اعضای تیم : ${escapeHtml(worksheet.teamMembers.join(' - '))}
          </td>
        </tr>
      </table>
    </div>

    <table>
      <thead>
        <tr>
          <th rowspan="2" style="width: 25px;">ردیف</th>
          <th rowspan="2" style="width: 90px;">فعالیت</th>
          <th rowspan="2" style="width: 100px;">خطرات بالقوه</th>
          <th rowspan="2" style="width: 90px;">پیامد خطر</th>
          <th rowspan="2" style="width: 100px;">علت / علل</th>
          
          <th colspan="4" style="background-color: #e2e8f0;">
            ارزیابی ۱ <br/>
            <span style="font-weight: normal; font-size: 8pt;">با درنظر گرفتن اقدامات کنترلی موجود</span>
          </th>
          
          <th rowspan="2" style="width: 40px;">قضاوت</th>
          <th rowspan="2" style="width: 120px;">اقدامات کنترلی پیشنهادی</th>
          <th rowspan="2" style="width: 140px; background-color: #fef3c7;">
            اقدام اصلاحی (CAPA) <br/>
            <span style="font-weight: normal; font-size: 8pt;">شرح / مسئول / مهلت</span>
          </th>
          
          <th colspan="4" style="background-color: #d1fae5;">
            ارزیابی ۲ <br/>
            <span style="font-weight: normal; font-size: 8pt;">با درنظر گرفتن اقدامات پیشنهادی</span>
          </th>
        </tr>
        <tr>
          <!-- ارزیابی ۱ -->
          <th style="width: 30px; background-color: #e2e8f0;">شدت</th>
          <th style="width: 30px; background-color: #e2e8f0;">احتمال</th>
          <th style="width: 30px; background-color: #e2e8f0;">کشف</th>
          <th style="width: 35px; background-color: #cbd5e1; font-weight: bold;">RPN</th>
          
          <!-- ارزیابی ۲ -->
          <th style="width: 30px; background-color: #d1fae5;">شدت</th>
          <th style="width: 30px; background-color: #d1fae5;">احتمال</th>
          <th style="width: 30px; background-color: #d1fae5;">کشف</th>
          <th style="width: 35px; background-color: #a7f3d0; font-weight: bold;">RPN</th>
        </tr>
      </thead>
      <tbody>
        ${hazardsRows}
      </tbody>
    </table>

    <table class="signatures-table">
      <tr>
        <td>
          <div style="font-weight: bold; font-size: 10pt; margin-bottom: 6px;">تایید اعضای تیم ارزیابی:</div>
          <div style="font-size: 9pt; color: #444444; margin-bottom: 4px;">
            ${worksheet.teamMembers.map((m) => `<span>${escapeHtml(m)} (امضا)</span> &nbsp;&nbsp;&nbsp;&nbsp;`).join('')}
          </div>
          <div style="font-size: 8.5pt; color: #047857; font-weight: bold; margin-top: 6px;">
            ${worksheet.teamApproved ? `✓ تایید و امضا شد (${worksheet.teamApprovedDate || '۱۴۰۴/۰۷/۱۶'})` : 'در انتظار امضا'}
          </div>
        </td>
        <td>
          <div style="font-weight: bold; font-size: 10pt; margin-bottom: 6px;">تایید رئیس ایمنی و بهداشت حرفه‌ای (HSE):</div>
          <div style="font-size: 9.5pt; font-weight: bold;">
            ${escapeHtml(worksheet.hseManagerName || 'حمید رفیعیان')} - مسئول واحد ایمنی و بهداشت
          </div>
          <div style="font-size: 8.5pt; color: #047857; font-weight: bold; margin-top: 6px;">
            ${worksheet.hseManagerApproved ? `✓ تایید رسمی و ممهور به مهر واحد ایمنی (${worksheet.hseManagerApprovedDate || '۱۴۰۴/۰۷/۱۸'})` : 'در انتظار تایید'}
          </div>
        </td>
      </tr>
    </table>

    <div style="margin-top: 15px; font-size: 8pt; color: #888888; text-align: center;">
      تولید شده توسط سامانه هوشمند ارزیابی ریسک و FMEA صنعتی (HSE RiskPro) - تاریخ استخراج: ${new Date().toLocaleDateString('fa-IR')}
    </div>

  </div>
</body>
</html>
  `;

  const blob = new Blob(['\ufeff', wordContent], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `FMEA_${worksheet.workshopName}_${worksheet.executionDate.replace(/\//g, '-')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getActionStatusFarsi(status: string): string {
  switch (status) {
    case 'completed':
      return 'تکمیل شده';
    case 'in_progress':
      return 'در حال انجام';
    case 'overdue':
      return 'منقضی شده';
    default:
      return 'در انتظار بررسی';
  }
}
