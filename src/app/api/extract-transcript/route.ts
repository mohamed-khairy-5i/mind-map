import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'معرف الفيديو مطلوب' },
        { status: 400 }
      );
    }

    // For now, we'll use a simple approach to get video transcript
    // In a production environment, you might want to use YouTube's API
    // or a third-party service like youtube-transcript-api
    
    try {
      // Simple method: try to get auto-generated captions
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // This is a simplified implementation
      // In production, you'd want to use proper YouTube API or transcript services
      const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error('فشل في جلب معلومات الفيديو');
      }

      const html = await response.text();
      
      // Extract video title and description from the HTML
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : '';
      
      const descriptionMatch = html.match(/"shortDescription":"([^"]+)"/);
      const description = descriptionMatch ? descriptionMatch[1] : '';

      // For demo purposes, we'll use title and description as transcript
      // In production, you'd implement proper transcript extraction
      const transcript = `${title}\n\n${description}`.trim();

      if (!transcript) {
        return NextResponse.json(
          { error: 'لا يمكن استخراج النص من الفيديو. قد لا تتوفر الترجمة الآلية.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        videoId,
        title,
        transcript,
        videoUrl
      });

    } catch (error) {
      console.error('Error extracting transcript:', error);
      return NextResponse.json(
        { error: 'فشل في استخراج النص من الفيديو' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in transcript API:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}