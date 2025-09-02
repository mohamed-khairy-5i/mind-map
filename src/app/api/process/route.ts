import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { type, content } = await request.json();

    if (!content || !type) {
      return NextResponse.json(
        { error: 'المحتوى والنوع مطلوبان' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'text':
        result = await geminiService.processText(content);
        break;
      case 'url':
        result = await geminiService.processUrl(content);
        break;
      case 'video':
        result = await geminiService.processVideo(content);
        break;
      default:
        return NextResponse.json(
          { error: 'نوع المحتوى غير مدعوم' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing content:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'حدث خطأ في معالجة المحتوى';
      
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}