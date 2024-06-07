import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@pigment-css/react/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "투두 리스트 - 오늘 뭐할까?",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: "0", height: "100vh" }}>{children}</body>
    </html>
  );
}
