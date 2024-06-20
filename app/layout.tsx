import AuthHeader from "@components/Components/header/AuthHeader";
import MainLayout from "@components/Components/layout/MainLayout";
import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { ThemeProvider } from "./Context/ThemeContext";
import ThemeToggle from "@components/Components/ThemeToggle";

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
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={noto_sans_kr.className}>
        <ThemeProvider>
          <MainLayout>
            <AuthHeader />
            {children}
          </MainLayout>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
