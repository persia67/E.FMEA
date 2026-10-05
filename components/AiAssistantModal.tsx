'use client';

import React, { useState } from 'react';
import { FmeaHazardItem, FmeaWorksheet } from '@/types/fmea';
import { 
  Sparkles, 
  X, 
  Loader2, 
  CheckCircle2, 
  Plus, 
  Bot, 
  Layers, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  workshopName: string;
  onAddHazards: (newHazards: FmeaHazardItem[]) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  workshopName,
  onAddHazards,
}) => {
  const [topic, setTopic] = useState('خط برشکاری و نورد ورق');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedItems, setGeneratedItems] = useState<FmeaHazardItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const presets = [
    { title: 'نورد سرد و تعیین ضخامت ورق', topic: 'فرآیند بازکردن رول، نورد سرد، تنظیم ضخامت سنج و برش گیوتین' },
    { title: 'پرس‌کاری و قالب‌سازی سنگین', topic: 'کار با پرس ۲۰۰ تن هیدرولیک و ضربه‌ای و تعویض قالب با جرثقیل' },
    { title: 'تراشکاری و ماشین‌کاری CNC', topic: 'پلیسه پرتابی، گیرکردن لباس در اسپیندل، خنک‌کاری با آب صابون' },
    { title: 'انبار مواد شیمیایی و اسیدشویی', topic: 'حمل گالن‌های اسید سولفوریک، بخارات خورنده، نشتی و سوختگی شیمیایی' },
    { title: 'تعمیرات و نگهداری در ارتفاع', topic: 'کار روی سقف سوله و بالابرهای هیدرولیک، سقوط از ارتفاع و برق‌گرفتگی' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setGeneratedItems([]);
    setSelectedIndices([]);

    try {
      // Generate multiple hazards
      const promptHazards = [
        { activity: topic, hazard: `خطر مکانیکی و گیر افتادگی در ${topic}` },
        { activity: topic, hazard: `خطر ارگونومیک، سروصدا و عوامل فیزیکی در ${topic}` },
        { activity: topic, hazard: `خطر مواد شیمیایی، لغزش کف یا آتش‌سوزی در ${topic}` },
      ];

      const results: FmeaHazardItem[] = [];

      for (let i = 0; i < promptHazards.length; i++) {
        const item = promptHazards[i];
        const res = await fetch('/api/fmea/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity: item.activity,
            potentialHazard: item.hazard,
            workshopName,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          results.push({
            id: `ai-h-${Date.now()}-${i}`,
            rowNumber: i + 1,
            activity: topic,
            potentialHazard: data.consequence ? `${item.hazard}` : item.hazard,
            consequence: data.consequence || 'صدمات و اتلاف کاری',
            rootCauses: data.rootCauses || 'نقص سیستم کنترلی و عدم وجود حفاظ ایمنی استاندارد',
            severity1: data.severity1 || 8,
            occurrence1: data.occurrence1 || 5,
            detection1: data.detection1 || 4,
            rpn1: data.rpn1 || (data.severity1 * data.occurrence1 * data.detection1),
            judgment1: data.judgment1 || 'M',
            proposedControls: data.proposedControls || 'نصب حفاظ استاندارد و تدوین SOP',
            correctiveAction: {
              id: `ai-ca-${Date.now()}-${i}`,
              title: data.correctiveAction?.title || `اقدام اصلاحی تخصصی برای ${item.hazard}`,
              description: data.correctiveAction?.description || 'پیاده‌سازی اقدامات اصلاحی مهندسی و بازرسی دوره‌ای',
              responsiblePerson: '',
              department: 'فنی و ایمنی',
              targetDate: '1405/03/30',
              status: 'pending',
              estimatedCost: '۲۰,۰۰۰,۰۰۰ تومان',
              effectivenessReview: data.correctiveAction?.recommendedVerification || 'سنجش مجدد RPN پس از ۶۰ روز',
              isApprovedByHSE: false,
            },
            severity2: data.severity2 || 5,
            occurrence2: data.occurrence2 || 3,
            detection2: data.detection2 || 3,
            rpn2: data.rpn2 || (data.severity2 * data.occurrence2 * data.detection2),
            judgment2: data.judgment2 || 'L',
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            aiSuggested: true,
          });
        }
      }

      setGeneratedItems(results);
      setSelectedIndices(results.map((_, idx) => idx));
    } catch (err: any) {
      alert('خطا در تحلیل هوشمند: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== idx));
    } else {
      setSelectedIndices([...selectedIndices, idx]);
    }
  };

  const handleApply = () => {
    const itemsToAdd = generatedItems.filter((_, idx) => selectedIndices.includes(idx));
    if (itemsToAdd.length === 0) {
      alert('لطفاً حداقل یک مورد را انتخاب کنید.');
      return;
    }
    onAddHazards(itemsToAdd);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>تولید خودکار ارزیابی ریسک با هوش مصنوعی</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  AI Auto-FMEA
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                شناسایی هوشمند خطرات فرآیند، محاسبه RPN، ارائه کنترل‌های مهندسی و تولید اقدامات اصلاحی (CAPA)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              الگوهای آماده صنایع و کارگاه‌ها (انتخاب سریع):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTopic(preset.topic);
                    setSelectedPreset(preset.title);
                  }}
                  className={`text-right p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                    selectedPreset === preset.title
                      ? 'bg-purple-950/40 border-purple-500/60 text-purple-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold text-slate-200 mb-0.5">{preset.title}</div>
                  <div className="text-[11px] text-slate-400 truncate">{preset.topic}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              عنوان فرآیند یا فعالیت مورد نظر برای تحلیل:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="مثلاً: خط بسته‌بندی تسمه فلزی و جابجایی با لیفتراک"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading || !topic.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>تحلیل هوشمند...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>شروع ارزیابی AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Display */}
          {generatedItems.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span>خطرات شناسایی‌شده و پیشنهادات AI ({generatedItems.length} مورد):</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedIndices.length === generatedItems.length) setSelectedIndices([]);
                    else setSelectedIndices(generatedItems.map((_, i) => i));
                  }}
                  className="text-[11px] text-purple-400 hover:underline cursor-pointer"
                >
                  {selectedIndices.length === generatedItems.length ? 'عدم انتخاب همه' : 'انتخاب همه'}
                </button>
              </div>

              <div className="space-y-3">
                {generatedItems.map((item, idx) => {
                  const isSelected = selectedIndices.includes(idx);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleSelect(idx)}
                      className={`p-4 rounded-xl border transition cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/20 border-purple-500/50'
                          : 'bg-slate-950/40 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-700 bg-slate-900'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-100 text-xs">{item.potentialHazard}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                                RPN اولیه: {item.rpn1}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                RPN ثانویه: {item.rpn2}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{item.consequence}</p>
                            <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800/80 mt-1">
                              <strong className="text-cyan-400">اقدام اصلاحی پیشنهادی: </strong>
                              {item.correctiveAction.title} - {item.correctiveAction.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            بستن
          </button>

          {generatedItems.length > 0 && (
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>افزودن {selectedIndices.length} مورد به کاربرگ</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
