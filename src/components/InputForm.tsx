'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, Brain, Link, Video, FileText } from 'lucide-react';
import { InputData } from '@/types/mindmap';

interface InputFormProps {
  onSubmit: (data: InputData) => Promise<void>;
  isLoading?: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading = false }) => {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('text');

  const handleSubmit = async (type: 'text' | 'url' | 'video') => {
    let content = '';
    
    switch (type) {
      case 'text':
        content = text.trim();
        break;
      case 'url':
        content = url.trim();
        break;
      case 'video':
        content = videoUrl.trim();
        break;
    }

    if (!content) {
      alert('يرجى إدخال المحتوى المطلوب');
      return;
    }

    await onSubmit({ type, content });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidVideoUrl = (url: string) => {
    const videoPatterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/
    ];
    
    return videoPatterns.some(pattern => pattern.test(url));
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إنشاء خريطة ذهنية</h2>
          <p className="text-gray-600">قم بإدخال المحتوى لإنشاء خريطة ذهنية تفاعلية</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            نص
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            رابط موقع
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            فيديو يوتيوب
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              النص أو الفكرة
            </label>
            <Textarea
              placeholder="اكتب النص أو الفكرة التي تريد تحويلها إلى خريطة ذهنية..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
          <Button
            onClick={() => handleSubmit('text')}
            disabled={isLoading || !text.trim()}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                إنشاء الخريطة الذهنية
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              رابط الموقع
            </label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-left"
              dir="ltr"
            />
            {url && !isValidUrl(url) && (
              <p className="text-sm text-red-500">يرجى إدخال رابط صحيح</p>
            )}
          </div>
          <Button
            onClick={() => handleSubmit('url')}
            disabled={isLoading || !url.trim() || !isValidUrl(url)}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                تحليل الموقع
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              رابط فيديو يوتيوب
            </label>
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="text-left"
              dir="ltr"
            />
            {videoUrl && !isValidVideoUrl(videoUrl) && (
              <p className="text-sm text-red-500">يرجى إدخال رابط يوتيوب صحيح</p>
            )}
          </div>
          <Button
            onClick={() => handleSubmit('video')}
            disabled={isLoading || !videoUrl.trim() || !isValidVideoUrl(videoUrl)}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <Video className="mr-2 h-4 w-4" />
                تحليل الفيديو
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">كيف يعمل؟</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• قم بإدخال النص أو الرابط أو فيديو يوتيوب</li>
          <li>• سيتم تحليل المحتوى باستخدام الذكاء الاصطناعي</li>
          <li>• ستحصل على خريطة ذهنية تفاعلية ومنظمة</li>
          <li>• يمكنك تصدير الخريطة بصيغة SVG</li>
        </ul>
      </div>
    </div>
  );
};

export default InputForm;