import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TabBar } from "@/components/TabBar";
import { WalletProvider } from "@/lib/wallet";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Asimov",
  description: "Prediction markets on Solana. Prices are probabilities.",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Asimov" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#08090a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="bg-canvas font-sans text-ink">
        <WalletProvider>
          <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col">
            <main className="flex-1 pb-[calc(64px+env(safe-area-inset-bottom))]">{children}</main>
            <TabBar />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
