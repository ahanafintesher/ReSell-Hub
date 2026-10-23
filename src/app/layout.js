import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/Theme/ThemeProvider';

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "ReSell Hub — Second-Hand Marketplace",
  description: "Buy and sell pre-owned, vintage, and refurbished products with confidence on ReSell Hub.",
};

const themeScript = `(function() {
  try {
    var stored = localStorage.getItem('resellhub_theme');
    var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches) || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.className} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              className: "dark:bg-slate-800 dark:text-slate-100 dark:border dark:border-slate-700",
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
