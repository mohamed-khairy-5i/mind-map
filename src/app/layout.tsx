import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MindCraft AI - إنشاء الخرائط الذهنية بالذكاء الاصطناعي',
  description: 'قم بإنشاء خرائط ذهنية تفاعلية من أي محتوى نصي أو رابط أو فيديو يوتيوب باستخدام الذكاء الاصطناعي',
  keywords: 'خرائط ذهنية, ذكاء اصطناعي, تنظيم الأفكار, تعلم, إنتاجية, mind map, AI, brainstorming',
  authors: [{ name: 'MindCraft AI' }],
  creator: 'MindCraft AI',
  publisher: 'MindCraft AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'MindCraft AI',
    title: 'MindCraft AI - إنشاء الخرائط الذهنية بالذكاء الاصطناعي',
    description: 'قم بإنشاء خرائط ذهنية تفاعلية من أي محتوى نصي أو رابط أو فيديو يوتيوب باستخدام الذكاء الاصطناعي',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MindCraft AI - إنشاء الخرائط الذهنية',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindCraft AI - إنشاء الخرائط الذهنية بالذكاء الاصطناعي',
    description: 'قم بإنشاء خرائط ذهنية تفاعلية من أي محتوى نصي أو رابط أو فيديو يوتيوب',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        {children}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "MindCraft AI",
              "description": "قم بإنشاء خرائط ذهنية تفاعلية من أي محتوى نصي أو رابط أو فيديو يوتيوب باستخدام الذكاء الاصطناعي",
              "url": process.env.NEXT_PUBLIC_APP_URL,
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </body>
    </html>
  )
}