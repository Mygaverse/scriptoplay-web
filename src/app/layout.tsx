import SmoothScrollProvider from '@/components/shared/SmoothScroll';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { AppContextProvider } from '@/context/AppContext';
import { interTight } from '@/utils/font';
import { generateMetadata } from '@/utils/generateMetaData';
import { Metadata } from 'next';
import { ReactNode, Suspense } from 'react';
// 1. Import the Outfit font
import { Outfit } from "next/font/google";
import './globals.css';

// 2. Configure the font
const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit", // Optional: allows use in Tailwind config if needed later
});

export const metadata: Metadata = {
  ...generateMetadata(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} antialiased bg-gray-50 text-gray-900 m-0 p-0 overflow-x-hidden`}>
        <AppContextProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <Suspense>
              <SmoothScrollProvider>{children}</SmoothScrollProvider>
            </Suspense>
          </ThemeProvider>
        </AppContextProvider>
      </body>
    </html>
  );
}
