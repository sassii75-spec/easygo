import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: '이지고(EasyGo) - AI 기반 이사 원스톱 플랫폼',
  description: 'AI 짐량 계산 엔진으로 투명하고 스마트한 이사를 경험하세요.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="font-pretendard antialiased text-gray-900 bg-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
