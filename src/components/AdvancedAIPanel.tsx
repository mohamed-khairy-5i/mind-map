import React, { useState, useRef, useEffect } from 'react';
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
  Settings,
  Globe,
  Clock,
  Target,
  Lightbulb,
  Users,
  BookOpen,
  Briefcase,
  Palette,
  Code,
  Music,
  Camera,
  Layers,
  RefreshCw,

  Cpu,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Star,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download,
  Share
} from 'lucide-react';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateMindMap: (prompt: string, type: 'text' | 'image' | 'audio' | 'video', config?: any) => void;
  isGenerating: boolean;
}

interface AITemplate {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  prompt: string;
  color: string;
  popularity: number;
}

interface AIConfig {
  model: 'gemini-pro' | 'gemini-ultra' | 'custom';
  creativity: number; // 0-100
  depth: number; // 0-100
  language: 'ar' | 'en' | 'mixed';
  style: 'professional' | 'creative' | 'academic' | 'casual';
  includeEmojis: boolean;
  includeColors: boolean;
  maxNodes: number;
}

const aiTemplates: AITemplate[] = [
  {
    id: 'business-plan',
    title: 'خطة العمل الشاملة',
    description: 'إنشاء خطة عمل متكاملة لمشروعك الجديد',
    icon: Briefcase,
    category: 'business',
    prompt: 'أنشئ خطة عمل شاملة تتضمن الرؤية والرسالة وتحليل السوق والاستراتيجية المالية والتسويقية',
    color: 'from-blue-500 to-purple-500',
    popularity: 95
  },
  {
    id: 'study-guide',
    title: 'دليل الدراسة',
    description: 'تنظيم المواد الدراسية والمراجعة الفعالة',
    icon: BookOpen,
    category: 'education',
    prompt: 'نظم مادة دراسية مع خطة مراجعة فعالة تشمل المفاهيم الأساسية والتطبيقات العملية',
    color: 'from-green-500 to-teal-500',
    popularity: 88
  },
  {
    id: 'creative-project',
    title: 'مشروع إبداعي',
    description: 'تطوير فكرة إبداعية من البداية للنهاية',
    icon: Palette,
    category: 'creative',
    prompt: 'طور فكرة إبداعية شاملة تتضمن العصف الذهني والتخطيط والتنفيذ والتقييم',
    color: 'from-pink-500 to-orange-500',
    popularity: 92
  },
  {
    id: 'team-project',
    title: 'مشروع الفريق',
    description: 'تنسيق وإدارة مشاريع الفريق بكفاءة',
    icon: Users,
    category: 'collaboration',
    prompt: 'خطط لمشروع جماعي مع توزيع المهام والأدوار والجدولة الزمنية',
    color: 'from-indigo-500 to-blue-500',
    popularity: 85
  },
  {
    id: 'research-map',
    title: 'خريطة البحث',
    description: 'تنظيم البحث الأكاديمي والعلمي',
    icon: Target,
    category: 'research',
    prompt: 'نظم بحثاً أكاديمياً يشمل المشكلة والأهداف والمنهجية والنتائج المتوقعة',
    color: 'from-purple-500 to-indigo-500',
    popularity: 78
  },
  {
    id: 'product-launch',
    title: 'إطلاق منتج',
    description: 'استراتيجية شاملة لإطلاق منتج جديد',
    icon: Zap,
    category: 'marketing',
    prompt: 'ضع استراتيجية إطلاق منتج تشمل التحليل التنافسي والتسويق وخطة الإطلاق',
    color: 'from-yellow-500 to-orange-500',
    popularity: 90
  }
];

const categories = [
  { id: 'all', name: 'الكل', icon: Globe },
  { id: 'business', name: 'الأعمال', icon: Briefcase },
  { id: 'education', name: 'التعليم', icon: BookOpen },
  { id: 'creative', name: 'إبداعي', icon: Palette },
  { id: 'collaboration', name: 'تعاون', icon: Users },
  { id: 'research', name: 'بحث', icon: Target },
  { id: 'marketing', name: 'تسويق', icon: TrendingUp }
];

const inputTypes = [
  { id: 'text', name: 'نص', icon: FileText, description: 'اكتب فكرتك مباشرة' },
  { id: 'image', name: 'صورة', icon: Image, description: 'ارفع صورة لتحليلها' },
  { id: 'audio', name: 'صوت', icon: Mic, description: 'تسجيل صوتي أو ملف صوتي' },
  { id: 'video', name: 'فيديو', icon: Video, description: 'ملف فيديو للتحليل' }
];

export default function AdvancedAIPanel({ isOpen, onClose, onGenerateMindMap, isGenerating }: AIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [inputType, setInputType] = useState<'text' | 'image' | 'audio' | 'video'>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<AITemplate | null>(null);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    model: 'gemini-pro',
    creativity: 70,
    depth: 60,
    language: 'ar',
    style: 'professional',
    includeEmojis: true,
    includeColors: true,
    maxNodes: 20
  });
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prompt.length > 10) {
      // Generate smart suggestions based on input
      const smartSuggestions = [
        'أضف تحليل SWOT للموضوع',
        'اربط الموضوع بالاتجاهات الحالية',
        'أدرج أمثلة عملية ودراسات حالة',
        'اقترح خطوات التنفيذ العملية'
      ];
      setSuggestions(smartSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || selectedFile) {
      onGenerateMindMap(prompt, inputType, aiConfig);
      
      // Add to recent prompts
      if (prompt.trim()) {
        setRecentPrompts(prev => [prompt, ...prev.slice(0, 4)]);
      }
      
      setPrompt('');
      setSelectedFile(null);
      setSelectedTemplate(null);
    }
  };

  const handleTemplateSelect = (template: AITemplate) => {
    setSelectedTemplate(template);
    setPrompt(template.prompt);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? aiTemplates 
    : aiTemplates.filter(t => t.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center animate-pulse-glow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold gradient-text">مساعد الذكاء الاصطناعي</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">حوّل أفكارك إلى خرائط ذهنية مذهلة</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="إعدادات متقدمة"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto max-h-[80vh]">
          
          {/* Quick Templates */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">قوالب ذكية</h3>
              <div className="flex items-center gap-1">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
              {filteredTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-4 rounded-lg border-2 transition-all text-left hover:scale-105 ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">
                            {template.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-yellow-600">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{template.popularity}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Type Selection */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">نوع المدخل</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {inputTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setInputType(type.id as any)}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      inputType === type.id
                        ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-1 text-slate-600 dark:text-slate-400" />
                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {type.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {type.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvancedSettings && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">إعدادات متقدمة</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    نموذج الذكاء الاصطناعي
                  </label>
                  <select
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value as any }))}
                    className="input-neural w-full"
                  >
                    <option value="gemini-pro">Gemini Pro (سريع)</option>
                    <option value="gemini-ultra">Gemini Ultra (متقدم)</option>
                    <option value="custom">مخصص</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    اللغة
                  </label>
                  <select
                    value={aiConfig.language}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, language: e.target.value as any }))}
                    className="input-neural w-full"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">الإنجليزية</option>
                    <option value="mixed">مختلط</option>
                  </select>
                </div>

                {/* Creativity Slider */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    مستوى الإبداع: {aiConfig.creativity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={aiConfig.creativity}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, creativity: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>محافظ</span>
                    <span>مبدع</span>
                  </div>
                </div>

                {/* Depth Slider */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    عمق التحليل: {aiConfig.depth}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={aiConfig.depth}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, depth: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>سطحي</span>
                    <span>عميق</span>
                  </div>
                </div>

                {/* Max Nodes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    عدد العقد الأقصى
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={aiConfig.maxNodes}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, maxNodes: parseInt(e.target.value) }))}
                    className="input-neural w-full"
                  />
                </div>

                {/* Style */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    أسلوب المحتوى
                  </label>
                  <select
                    value={aiConfig.style}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, style: e.target.value as any }))}
                    className="input-neural w-full"
                  >
                    <option value="professional">مهني</option>
                    <option value="creative">إبداعي</option>
                    <option value="academic">أكاديمي</option>
                    <option value="casual">غير رسمي</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 mt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiConfig.includeEmojis}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, includeEmojis: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">تضمين الرموز التعبيرية</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiConfig.includeColors}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, includeColors: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">ألوان تلقائية</span>
                </label>
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-6">
            
            {/* File Upload Area */}
            {inputType !== 'text' && (
              <div className="mb-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <Upload className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {selectedFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-slate-600 dark:text-slate-400">
                        اضغط لاختيار ملف {inputTypes.find(t => t.id === inputType)?.name}
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={inputType === 'image' ? 'image/*' : inputType === 'audio' ? 'audio/*' : 'video/*'}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}

            {/* Text Input */}
            <div className="relative mb-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  selectedTemplate 
                    ? "يمكنك تعديل القالب أو إضافة تفاصيل أخرى..."
                    : "اكتب فكرتك هنا، مثال: خطة تسويقية لمنتج جديد، دراسة حالة لمشروع تقني، أو أي موضوع تريد تحويله لخريطة ذهنية..."
                }
                rows={4}
                className="input-neural w-full resize-none pr-12"
                dir="rtl"
              />
              
              {/* Character Counter */}
              <div className="absolute bottom-3 left-3 text-xs text-slate-500">
                {prompt.length}/500
              </div>
            </div>

            {/* Smart Suggestions */}
            {suggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  اقتراحات ذكية
                </h4>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPrompt(prev => prev + ' ' + suggestion)}
                      className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Prompts */}
            {recentPrompts.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  الطلبات الأخيرة
                </h4>
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {recentPrompts.map((recentPrompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPrompt(recentPrompt)}
                      className="w-full text-left text-xs p-2 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 truncate"
                    >
                      {recentPrompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                type="submit"
                disabled={(!prompt.trim() && !selectedFile) || isGenerating}
                className="btn-neural flex items-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                {isGenerating ? (
                  <>
                    <div className="spinner-neural" />
                    <span>جاري الإنشاء...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>إنشاء خريطة ذهنية</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPrompt('');
                  setSelectedFile(null);
                  setSelectedTemplate(null);
                }}
                className="glass-button p-3"
                title="مسح"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Tips */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">نصائح للحصول على أفضل النتائج:</p>
                  <ul className="text-xs space-y-1 text-blue-600 dark:text-blue-400">
                    <li>• كن محدداً في وصف الموضوع</li>
                    <li>• اذكر السياق والهدف من الخريطة</li>
                    <li>• استخدم القوالب الجاهزة كنقطة بداية</li>
                    <li>• جرب إعدادات الإبداع المختلفة</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}