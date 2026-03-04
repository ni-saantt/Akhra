import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Akhra Kisan',
  description: 'Smart farming platform for the modern farmer.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
