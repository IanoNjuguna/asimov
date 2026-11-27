import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans_Condensed } from "next/font/google";
import "./globals.css";
import { TabBar } from "@/components/TabBar";
import { WalletProvider } from "@/lib/wallet";

// Three faces, three jobs, as in the reference: one heavy grotesque for the wordmark and headlines,
// one condensed grotesque for institutional labels, one mono for anything that is a number.
const display = Archivo({ variable: "--font-display", subsets: ["latin"] });
const label = IBM_Plex_Sans_Condensed({
  variable: "--font-label-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});
const mono = IBM_Plex_Mono({
  variable: "--font-mono-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
});

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
  themeColor: "#0b0b0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${label.variable} ${mono.variable} antialiased`}
    >
      <body className="bg-canvas font-sans text-ink">
        <WalletProvider>
          <div className="mx-auto flex min-h-dvh w-full max-w-[520px] flex-col">
            <main className="flex-1 pb-[calc(68px+env(safe-area-inset-bottom))]">{children}</main>
            <TabBar />
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
