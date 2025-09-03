import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "جاري تحميل MindForge...", 
  submessage = "أداة إنشاء الخرائط الذهنية بالذكاء الاصطناعي" 
}) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse-glow">
            <Brain className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          {/* Floating particles */}
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-6 h-6 text-blue-400 animate-bounce" style={{ animationDelay: '0s' }} />
          </div>
          <div className="absolute -bottom-2 -left-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute -top-1 -left-3">
            <Sparkles className="w-3 h-3 text-indigo-400 animate-bounce" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold gradient-text-animated">
            {message}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            {submessage}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Neural Network Animation */}
        <div className="mt-12 relative">
          <div className="flex justify-center items-center space-x-4 rtl:space-x-reverse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-neural-pulse"
                style={{ 
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
          
          {/* Connecting lines */}
          <div className="absolute inset-0 flex justify-center items-center">
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent animate-shimmer"></div>
          </div>
        </div>

        {/* Status Text */}
        <div className="mt-8 text-sm text-slate-500 dark:text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>تهيئة الذكاء الاصطناعي...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;