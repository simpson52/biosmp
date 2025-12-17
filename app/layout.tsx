import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMP 발전소 수익 분석 대시보드",
  description: "발전소 SMP 가격 변화에 따른 공헌이익 분석 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

