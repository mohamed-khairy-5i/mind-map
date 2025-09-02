import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
  level: number;
  color?: string;
}

export interface ProcessedContent {
  title: string;
  mindMap: MindMapNode;
}

export class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async processText(text: string): Promise<ProcessedContent> {
    const prompt = `
    قم بتحليل النص التالي وإنشاء خريطة ذهنية منظمة بصيغة JSON. يجب أن تحتوي على:
    1. عنوان رئيسي للموضوع
    2. خريطة ذهنية مع المفاهيم الرئيسية والفرعية
    
    النص: "${text}"
    
    أعد النتيجة بالتنسيق التالي:
    {
      "title": "العنوان الرئيسي",
      "mindMap": {
        "id": "root",
        "label": "العنوان الرئيسي", 
        "level": 0,
        "children": [
          {
            "id": "1",
            "label": "المفهوم الأول",
            "level": 1,
            "children": [
              {
                "id": "1.1",
                "label": "التفصيل الأول",
                "level": 2
              }
            ]
          }
        ]
      }
    }
    
    تأكد من إرجاع JSON صحيح فقط بدون نص إضافي.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean the response and parse JSON
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanedText);
      
      return parsed;
    } catch (error) {
      console.error('Error processing text with Gemini:', error);
      throw new Error('فشل في معالجة النص');
    }
  }

  async processUrl(url: string): Promise<ProcessedContent> {
    try {
      // First, fetch the URL content
      const response = await fetch(`/api/extract-content?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!data.content) {
        throw new Error('لا يمكن استخراج المحتوى من الرابط');
      }
      
      return this.processText(data.content);
    } catch (error) {
      console.error('Error processing URL:', error);
      throw new Error('فشل في معالجة الرابط');
    }
  }

  async processVideo(videoUrl: string): Promise<ProcessedContent> {
    try {
      // Extract video ID from URL
      const videoId = this.extractVideoId(videoUrl);
      if (!videoId) {
        throw new Error('رابط الفيديو غير صحيح');
      }

      // Get transcript via API
      const response = await fetch(`/api/extract-transcript?videoId=${videoId}`);
      const data = await response.json();
      
      if (!data.transcript) {
        throw new Error('لا يمكن استخراج النص من الفيديو');
      }
      
      return this.processText(data.transcript);
    } catch (error) {
      console.error('Error processing video:', error);
      throw new Error('فشل في معالجة الفيديو');
    }
  }

  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }
}

export const geminiService = new GeminiService();