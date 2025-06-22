import type {Metadata} from 'next';
import { Poppins, PT_Sans } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { cn } from '@/lib/utils';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pt-sans',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'AgriTrack',
  description: 'Modern Farm Equipment Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(poppins.variable, ptSans.variable)}>
      <head />
      <body className={cn('font-body antialiased')} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
