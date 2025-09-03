import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  Image, 
  Mic, 
  Video, 
  Send,
  Upload,
  Wand2,
  Brain,
  Zap,
  Heart,
  TrendingUp,
  Settings
} from 'lucide-react';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateMindMap: (prompt: string, type: 'text' | 'image' | 'audio' | 'video') => void;
  isGenerating: boolean;
}

const AIPanel: React.FC<AIPanelProps> = ({ 
  isOpen, 
  onClose, 
  onGenerateMindMap, 
  isGenerating 
}) => {
  const [prompt, setPrompt] = useState('');
  const [inputType, setInputType] = useState<'text' | 'image' | 'audio' | 'video'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || selectedFile) {
      onGenerateMindMap(prompt, inputType);
      setPrompt('');
      setSelectedFile(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const quickPrompts = [
    'خطة تسويقية لمنتج جديد',
    'تطوير مهارات البرمجة',
    'استراتيجية التعلم الذاتي',
    'إدارة المشاريع الناجحة',
    'تحليل المنافسين',
    'خطة عمل متجر إلكتروني',
    'تطوير التطبيقات المحمولة',
    'استراتيجية الاستثمار'
  ];

  const aiFeatures = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: 'توليد ذكي',
      description: 'إنشاء خرائط ذهنية شاملة من النصوص والملفات'
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'توسيع تلقائي',
      description: 'تطوير الأفكار وإضافة تفاصيل ذكية'
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: 'تحليل المشاعر',
      description: 'فهم النبرة العاطفية للأفكار والمحتوى'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'اقتراحات ذكية',
      description: 'توصيات مبنية على السياق والأهداف'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-96 bg-white dark:bg-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-accent-500 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">مساعد الذكاء الاصطناعي</h2>
              <p className="text-sm opacity-90">مدعوم بـ Google Gemini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          
          {/* Input Types */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">نوع المدخل</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'text', icon: FileText, label: 'نص' },
                { type: 'image', icon: Image, label: 'صورة' },
                { type: 'audio', icon: Mic, label: 'صوت' },
                { type: 'video', icon: Video, label: 'فيديو' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setInputType(type as any)}
                  className={`
                    flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200
                    ${inputType === type
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload (for non-text types) */}
          {inputType !== 'text' && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 transition-colors duration-200 flex flex-col items-center space-y-2 text-gray-600 dark:text-gray-400"
              >
                <Upload className="w-8 h-8" />
                <div className="text-center">
                  <p className="font-medium">اختر ملف</p>
                  <p className="text-sm">
                    {inputType === 'image' && 'PNG, JPG, GIF حتى 10MB'}
                    {inputType === 'audio' && 'MP3, WAV, M4A حتى 25MB'}
                    {inputType === 'video' && 'MP4, MOV, AVI حتى 100MB'}
                  </p>
                </div>
              </button>
              
              {selectedFile && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                        <Upload className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">{selectedFile.name}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded text-green-600 dark:text-green-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept={
                  inputType === 'image' ? 'image/*' :
                  inputType === 'audio' ? 'audio/*' :
                  inputType === 'video' ? 'video/*' : ''
                }
                className="hidden"
              />
            </div>
          )}

          {/* Prompt Input */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    inputType === 'text' 
                      ? 'اكتب موضوع الخريطة الذهنية...' 
                      : 'أضف وصف أو تعليمات إضافية (اختياري)...'
                  }
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={4}
                />
                
                <button
                  type="submit"
                  disabled={isGenerating || (!prompt.trim() && !selectedFile)}
                  className="absolute bottom-3 right-3 p-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Prompts */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">اقتراحات سريعة</h3>
            <div className="space-y-2">
              {quickPrompts.map((quickPrompt, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(quickPrompt)}
                  className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm transition-colors duration-200 border border-transparent hover:border-primary-200 dark:hover:border-primary-700"
                >
                  <div className="flex items-center space-x-2">
                    <Wand2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span>{quickPrompt}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Features */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">المميزات الذكية</h3>
            <div className="space-y-4">
              {aiFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span>مدعوم بـ Google Gemini 2.5</span>
            </div>
            <button className="flex items-center space-x-1 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200">
              <Settings className="w-4 h-4" />
              <span>إعدادات</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;