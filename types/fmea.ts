export type RiskLevel = 'L' | 'M' | 'H';

export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'reviewed';

export type UserRole = 'hse_manager' | 'hse_officer' | 'supervisor' | 'team_member';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  email: string;
  phone: string;
}

export interface CorrectiveAction {
  id: string;
  title: string;
  description: string;
  responsiblePerson: string;
  department: string;
  targetDate: string;
  completedDate?: string;
  status: ActionStatus;
  estimatedCost?: string;
  effectivenessReview?: string;
  isApprovedByHSE?: boolean;
}

export interface FmeaHazardItem {
  id: string;
  rowNumber: number;
  activity: string; // فعالیت
  potentialHazard: string; // خطرات بالقوه
  consequence: string; // پیامد خطر
  rootCauses: string; // علت / علل
  
  // ارزیابی ۱ (اقدامات کنترلی موجود)
  severity1: number; // شدت ۱ تا ۱۰
  occurrence1: number; // احتمال ۱ تا ۱۰
  detection1: number; // کشف ۱ تا ۱۰
  rpn1: number; // نمره اولویت ریسک ۱ (S1 * O1 * D1)
  judgment1: RiskLevel; // L, M, H
  existingControls?: string; // اقدامات کنترلی فعلی
  
  // اقدامات کنترلی پیشنهادی
  proposedControls: string; // اقدامات کنترلی پیشنهادی (مهندسی/مدیریتی/حفاظتی)
  
  // ستون جدید درخواستی: اقدام اصلاحی
  correctiveAction: CorrectiveAction;
  
  // ارزیابی ۲ (پس از اقدامات کنترلی پیشنهادی و اصلاحی)
  severity2: number; // شدت ثانویه ۱ تا ۱۰
  occurrence2: number; // احتمال ثانویه ۱ تا ۱۰
  detection2: number; // کشف ثانویه ۱ تا ۱۰
  rpn2: number; // نمره اولویت ریسک ثانویه (S2 * O2 * D2)
  judgment2: RiskLevel; // L, M, H ثانویه
  
  // متادیتا
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  aiSuggested?: boolean;
}

export interface FmeaWorksheet {
  id: string;
  workshopName: string; // نام کارگاه
  executionDate: string; // تاریخ اجرا
  reviewPeriod: 'ماهانه' | 'سه ماهه' | 'شش ماهه' | 'سالانه' | 'موردی';
  teamMembers: string[]; // اعضای تیم
  teamApproved: boolean;
  teamApprovedDate?: string;
  hseManagerApproved: boolean;
  hseManagerApprovedDate?: string;
  hseManagerName: string;
  status: 'draft' | 'under_review' | 'approved' | 'archived';
  archivedAt?: string;
  archivedBy?: string;
  hazards: FmeaHazardItem[];
  notes?: string;
}

export interface PeriodicReport {
  id: string;
  title: string;
  period: string; // e.g., پاییز ۱۴۰۴, مهر ۱۴۰۴
  workshopName: string;
  createdAt: string;
  reporterName: string;
  totalHazards: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageRpnInitial: number;
  averageRpnResidual: number;
  riskReductionPercentage: number;
  completedActionsCount: number;
  pendingActionsCount: number;
  complianceScore: number; // درصد انطباق ایمنی (0 - 100)
  summaryText: string;
  keyRecommendations: string[];
}

export interface HighRiskAlert {
  id: string;
  hazardId: string;
  workshopName: string;
  activity: string;
  hazardTitle: string;
  rpn: number;
  severity: number;
  judgment: RiskLevel;
  triggeredAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
  severityLevel: 'critical' | 'high' | 'warning';
  recipientsNotified: string[];
  dispatchChannels: ('sms' | 'email' | 'in_app' | 'automation')[];
  actionRequired: string;
}

export interface AiAnalysisRequest {
  activity: string;
  potentialHazard: string;
  existingControls?: string;
  workshopName?: string;
}

export interface AiAnalysisResponse {
  severity1: number;
  occurrence1: number;
  detection1: number;
  rpn1: number;
  judgment1: RiskLevel;
  consequence: string;
  rootCauses: string;
  proposedControls: string;
  correctiveAction: {
    title: string;
    description: string;
    responsibleRole: string;
    targetDays: number;
    recommendedVerification: string;
  };
  severity2: number;
  occurrence2: number;
  detection2: number;
  rpn2: number;
  judgment2: RiskLevel;
  riskReductionPercent: number;
  urgencyExplanation: string;
}
