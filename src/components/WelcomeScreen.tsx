import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  Users, 
  Zap, 
  Globe, 
  Palette,
  Target,
  TrendingUp,
  Star,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onCreateFromTemplate: (template: string) => void;
}

const templates = [
  {
    id: 'business',
    title: 'خطة عمل',
    description: 'إنشاء خطة عمل شاملة للمشاريع الجديدة',
    icon: TrendingUp,
    color: 'from-blue-500 to-purple-500',
    preview: ['الرؤية', 'السوق المستهدف', 'النموذج التجاري', 'الخطة المالية']
  },
  {
    id: 'study',
    title: 'خريطة دراسة',
    description: 'تنظيم المواد الدراسية والمراجعة',
    icon: Target,
    color: 'from-green-500 to-teal-500',
    preview: ['المنهج', 'المواضيع الرئيسية', 'الملاحظات', 'خطة المراجعة']
  },
  {
    id: 'creative',
    title: 'مشروع إبداعي',
    description: 'تطوير الأفكار الإبداعية والمشاريع الفنية',
    icon: Palette,
    color: 'from-pink-500 to-orange-500',
    preview: ['الفكرة الأساسية', 'التصميم', 'التنفيذ', 'النتيجة النهائية']
  },
  {
    id: 'team',
    title: 'عمل جماعي',
    description: 'تنسيق المهام والأهداف للفريق',
    icon: Users,
    color: 'from-indigo-500 to-blue-500',
    preview: ['الأهداف', 'المهام', 'الأعضاء', 'الجدولة']
  }
];

const features = [
  {
    icon: Brain,
    title: 'ذكاء اصطناعي متقدم',
    description: 'توليد خرائط ذهنية تلقائياً من النصوص والملفات باستخدام أحدث نماذج الذكاء الاصطناعي'
  },
  {
    icon: Sparkles,
    title: 'تصميم تفاعلي',
    description: 'واجهة عصرية مع رسوم متحركة سلسة وتأثيرات بصرية جذابة'
  },
  {
    icon: Globe,
    title: 'دعم كامل للعربية',
    description: 'تصميم خاص للغة العربية مع دعم الكتابة من اليمين إلى اليسار'
  },
  {
    icon: Zap,
    title: 'أداء فائق السرعة',
    description: 'تحميل سريع وحفظ تلقائي مع تقنيات الويب الحديثة'
  }
];

const stats = [
  { number: '100K+', label: 'مستخدم نشط' },
  { number: '500K+', label: 'خريطة ذهنية' },
  { number: '99%', label: 'رضا المستخدمين' },
  { number: '50+', label: 'دولة' }
];

export default function WelcomeScreen({ onGetStarted, onCreateFromTemplate }: WelcomeScreenProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-6">
          <div className="max-w-6xl mx-auto text-center">
            
            {/* Logo and title */}
            <div className="mb-8 animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl animate-bounce-soft">
                <Brain className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold gradient-text-animated mb-4">
                MindForge
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
                أداة إنشاء الخرائط الذهنية بالذكاء الاصطناعي
                <br />
                <span className="text-lg text-slate-500 dark:text-slate-400">حوّل أفكارك إلى خرائط ذهنية مذهلة في ثوانٍ</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
              <button
                onClick={onGetStarted}
                className="btn-neural group flex items-center justify-center gap-3 text-lg px-8 py-4"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                ابدأ الآن مجاناً
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="glass-button text-slate-700 dark:text-slate-300 text-lg px-8 py-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                شاهد العرض التوضيحي
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
              {stats.map((stat, index) => (
                <div key={index} className="glass-panel p-6 text-center hover:scale-105 transition-transform">
                  <div className="text-2xl md:text-3xl font-bold gradient-text mb-2">{stat.number}</div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
                لماذا MindForge؟
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                اكتشف القوة الحقيقية للخرائط الذهنية مع أدوات متقدمة وذكاء اصطناعي
              </p>
            </div>

            {/* Interactive Feature Showcase */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              
              {/* Feature List */}
              <div className="space-y-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  const isActive = index === currentFeature;
                  
                  return (
                    <div
                      key={index}
                      className={`card-neural cursor-pointer transition-all duration-500 ${
                        isActive ? 'scale-105 shadow-glow' : 'hover:scale-102'
                      }`}
                      onClick={() => setCurrentFeature(index)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Visual Preview */}
              <div className="relative">
                <div className="glass-panel p-8 rounded-2xl min-h-[400px] flex items-center justify-center">
                  <div className="text-center animate-fade-in" key={currentFeature}>
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-glow">
                      {React.createElement(features[currentFeature].icon, { 
                        className: 'w-12 h-12 text-white' 
                      })}
                    </div>
                    <h3 className="text-2xl font-bold gradient-text mb-4">
                      {features[currentFeature].title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-lg">
                      {features[currentFeature].description}
                    </p>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="flex justify-center gap-2 mt-6">
                  {features.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        index === currentFeature 
                          ? 'bg-blue-500 w-8' 
                          : 'bg-slate-300 dark:bg-slate-600 hover:bg-blue-300'
                      }`}
                      onClick={() => setCurrentFeature(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section className="py-16 px-6 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
                ابدأ بقالب جاهز
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                اختر من مجموعة واسعة من القوالب المصممة احترافياً
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {templates.map((template, index) => {
                const Icon = template.icon;
                
                return (
                  <div
                    key={template.id}
                    className="card-neural group cursor-pointer animate-fade-in hover:shadow-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => onCreateFromTemplate(template.id)}
                  >
                    <div className={`w-full h-32 bg-gradient-to-br ${template.color} rounded-lg mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-12 h-12 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      {template.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                      {template.description}
                    </p>
                    
                    <div className="space-y-1">
                      {template.preview.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="text-center">
              <button
                onClick={onGetStarted}
                className="btn-neural group text-lg px-10 py-4"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                إنشاء خريطة ذهنية مخصصة
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}