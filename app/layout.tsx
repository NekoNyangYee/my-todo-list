import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";

const noto_sans_kr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
});

export const metadata: Metadata = {
  title: "해야(HEYA) - 오늘 뭐할까?",
  description: "하루의 계획은 여기서",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ background: "#F6F8FC", height: "100vh" }}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={noto_sans_kr.className} style={{ margin: "0", height: "100vh" }}>{children}</body>
    </html>
  );
}
