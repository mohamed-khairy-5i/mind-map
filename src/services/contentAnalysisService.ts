import axios from 'axios';

// Enhanced content analysis service for NeuralMind Pro
export interface ContentAnalysisResult {
  type: 'webpage' | 'youtube' | 'document' | 'unknown';
  title: string;
  description: string;
  content: string;
  metadata: {
    url: string;
    language?: string;
    author?: string;
    publishDate?: string;
    duration?: string;
    thumbnails?: string[];
    tags?: string[];
    wordCount?: number;
    readingTime?: number;
  };
  extractedData: {
    headings: string[];
    keyPoints: string[];
    summary: string;
    topics: string[];
  };
}

// YouTube video analysis
export async function analyzeYouTubeVideo(url: string): Promise<ContentAnalysisResult> {
  try {
    // Extract video ID from URL
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      throw new Error('رابط يوتيوب غير صحيح');
    }

    // Since we can't use YouTube API directly in the frontend,
    // we'll use a proxy service or extract what we can from the page
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Extract title and description from YouTube page HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/);
    const descriptionMatch = html.match(/"shortDescription":"([^"]+)"/);
    
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'فيديو يوتيوب';
    const description = descriptionMatch ? descriptionMatch[1] : '';

    // Extract additional metadata
    const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
    const authorMatch = html.match(/"author":"([^"]+)"/);
    const viewCountMatch = html.match(/"viewCount":"(\d+)"/);

    const duration = durationMatch ? formatDuration(parseInt(durationMatch[1])) : '';
    const author = authorMatch ? authorMatch[1] : '';

    return {
      type: 'youtube',
      title,
      description,
      content: `${title}\n\n${description}`,
      metadata: {
        url,
        author,
        duration,
        thumbnails: [`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`],
        wordCount: description.split(' ').length,
        readingTime: Math.ceil(description.split(' ').length / 200)
      },
      extractedData: {
        headings: [title],
        keyPoints: extractKeyPoints(description),
        summary: generateSummary(description),
        topics: extractTopics(title + ' ' + description)
      }
    };

  } catch (error) {
    console.error('Error analyzing YouTube video:', error);
    throw new Error('فشل في تحليل فيديو يوتيوب: ' + (error as Error).message);
  }
}

// Website/webpage analysis
export async function analyzeWebpage(url: string): Promise<ContentAnalysisResult> {
  try {
    // For security reasons, we need to use a CORS proxy or backend service
    // Here's a simplified approach using a public CORS proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    const html = data.contents;

    // Parse HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract basic information
    const title = doc.querySelector('title')?.textContent || 
                 doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || 
                 'صفحة ويب';

    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 
                      doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || 
                      '';

    // Extract main content
    const contentElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    const content = Array.from(contentElements)
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 20)
      .join('\n');

    // Extract headings
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => h.textContent?.trim())
      .filter(Boolean) as string[];

    // Extract metadata
    const author = doc.querySelector('meta[name="author"]')?.getAttribute('content') || 
                  doc.querySelector('meta[property="article:author"]')?.getAttribute('content') || 
                  undefined;
    
    const publishDate = doc.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || 
                       doc.querySelector('meta[name="date"]')?.getAttribute('content') || 
                       undefined;

    const language = doc.querySelector('html')?.getAttribute('lang') || 
                    doc.querySelector('meta[http-equiv="content-language"]')?.getAttribute('content') || 
                    undefined;

    return {
      type: 'webpage',
      title,
      description,
      content,
      metadata: {
        url,
        language,
        author: author || undefined,
        publishDate: publishDate || undefined,
        wordCount: content.split(' ').length,
        readingTime: Math.ceil(content.split(' ').length / 200)
      },
      extractedData: {
        headings,
        keyPoints: extractKeyPoints(content),
        summary: generateSummary(content),
        topics: extractTopics(content)
      }
    };

  } catch (error) {
    console.error('Error analyzing webpage:', error);
    throw new Error('فشل في تحليل صفحة الويب: ' + (error as Error).message);
  }
}

// Generic URL analysis - determines type and routes to appropriate analyzer
export async function analyzeURL(url: string): Promise<ContentAnalysisResult> {
  try {
    // Validate and normalize URL
    const normalizedUrl = normalizeURL(url);
    
    // Determine content type
    if (isYouTubeURL(normalizedUrl)) {
      return await analyzeYouTubeVideo(normalizedUrl);
    } else if (isWebpageURL(normalizedUrl)) {
      return await analyzeWebpage(normalizedUrl);
    } else {
      throw new Error('نوع الرابط غير مدعوم');
    }
  } catch (error) {
    console.error('Error analyzing URL:', error);
    throw new Error('فشل في تحليل الرابط: ' + (error as Error).message);
  }
}

// Helper functions
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

function isYouTubeURL(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

function isWebpageURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function normalizeURL(url: string): string {
  if (!/^https?:\/\//.test(url)) {
    return `https://${url}`;
  }
  return url;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function extractKeyPoints(text: string): string[] {
  if (!text) return [];
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keyPoints: string[] = [];
  
  // Simple heuristic: sentences with important keywords
  const importantKeywords = [
    'مهم', 'أساسي', 'رئيسي', 'أولوية', 'ضروري', 'هدف', 'نتيجة', 'خلاصة',
    'important', 'key', 'main', 'essential', 'critical', 'goal', 'result', 'conclusion'
  ];
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    const hasKeyword = importantKeywords.some(keyword => 
      lowerSentence.includes(keyword.toLowerCase())
    );
    
    if (hasKeyword || sentence.length > 50) {
      keyPoints.push(sentence.trim());
    }
  });
  
  return keyPoints.slice(0, 5); // Return top 5 key points
}

function generateSummary(text: string): string {
  if (!text) return '';
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const summaryLength = Math.min(3, Math.ceil(sentences.length * 0.3));
  
  // Simple extractive summary - take first few sentences
  return sentences.slice(0, summaryLength).join('. ') + '.';
}

function extractTopics(text: string): string[] {
  if (!text) return [];
  
  const words = text.toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ') // Keep Arabic and Latin characters
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Count word frequency
  const wordCounts: { [key: string]: number } = {};
  words.forEach(word => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  
  // Get most frequent words as topics
  const topics = Object.entries(wordCounts)
    .filter(([word, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word);
  
  return topics;
}

// Advanced content analysis with AI enhancement
export async function enhanceContentAnalysis(
  basicAnalysis: ContentAnalysisResult,
  aiConfig?: {
    extractEntities?: boolean;
    generateInsights?: boolean;
    createStructure?: boolean;
  }
): Promise<ContentAnalysisResult> {
  // This function can be enhanced to use AI for deeper analysis
  // For now, it returns the basic analysis with some enhancements
  
  const enhanced = { ...basicAnalysis };
  
  if (aiConfig?.extractEntities) {
    // Extract entities (people, places, organizations)
    enhanced.extractedData.topics = [
      ...enhanced.extractedData.topics,
      ...extractEntities(basicAnalysis.content)
    ];
  }
  
  if (aiConfig?.generateInsights) {
    // Generate insights from the content
    enhanced.extractedData.keyPoints = [
      ...enhanced.extractedData.keyPoints,
      ...generateInsights(basicAnalysis.content)
    ];
  }
  
  return enhanced;
}

function extractEntities(text: string): string[] {
  // Simple entity extraction - can be enhanced with NLP libraries
  const entities: string[] = [];
  
  // Extract capitalized words (potential proper nouns)
  const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  entities.push(...capitalizedWords.slice(0, 5));
  
  return entities;
}

function generateInsights(text: string): string[] {
  // Simple insight generation based on content analysis
  const insights: string[] = [];
  const wordCount = text.split(' ').length;
  
  if (wordCount > 1000) {
    insights.push('محتوى طويل يتطلب تقسيم إلى أجزاء');
  }
  
  if (text.includes('استراتيجية') || text.includes('strategy')) {
    insights.push('يحتوي على عناصر استراتيجية');
  }
  
  if (text.includes('خطة') || text.includes('plan')) {
    insights.push('يتضمن عناصر تخطيط');
  }
  
  return insights;
}