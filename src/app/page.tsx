'use client';

import React, { useState } from 'react';
import InputForm from '@/components/InputForm';
import MindMapVisualization from '@/components/MindMapVisualization';
import { ProcessedContent, InputData } from '@/types/mindmap';
import { Brain, Sparkles, Target, Zap } from 'lucide-react';

export default function HomePage() {
  const [result, setResult] = useState<ProcessedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: InputData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'حدث خطأ في المعالجة');
      }

      setResult(responseData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  MindCraft AI
                </h1>
                <p className="text-sm text-gray-600">إنشاء الخرائط الذهنية بالذكاء الاصطناعي</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                <span>مجاني تماماً</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="h-4 w-4 text-green-500" />
                <span>سريع وذكي</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!result && (
        <section className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                حوّل أفكارك إلى 
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> خرائط ذهنية</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                استخدم قوة الذكاء الاصطناعي لتنظيم المعلومات وإنشاء خرائط ذهنية تفاعلية من أي محتوى
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">ذكاء اصطناعي متطور</h3>
                <p className="text-gray-600 text-sm">
                  يستخدم Google Gemini لتحليل المحتوى وإنشاء خرائط منظمة
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">مصادر متنوعة</h3>
                <p className="text-gray-600 text-sm">
                  يدعم النصوص والمواقع وفيديوهات يوتيوب
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">تفاعلية ومرنة</h3>
                <p className="text-gray-600 text-sm">
                  خرائط قابلة للتخصيص والتصدير بصيغ مختلفة
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        {!result ? (
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
        ) : (
          <div className="space-y-6">
            {/* Result Header */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.title}</h2>
              <p className="text-gray-600">تم إنشاء الخريطة الذهنية بنجاح! يمكنك التفاعل معها والتنقل بين العقد.</p>
            </div>

            {/* Mind Map */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <MindMapVisualization 
                data={result.mindMap} 
                width={1000} 
                height={600} 
              />
            </div>

            {/* Actions */}
            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                إنشاء خريطة ذهنية جديدة
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">❌ {error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 font-medium"
            >
              إعادة المحاولة
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p>© 2024 MindCraft AI. جميع الحقوق محفوظة.</p>
            <p className="text-sm mt-1">مدعوم بتقنية Google Gemini AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}