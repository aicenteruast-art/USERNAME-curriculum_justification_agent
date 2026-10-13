import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';

const vazirmatn = Vazirmatn({ subsets: ['arabic', 'latin'] });

export const metadata: Metadata = {
  title: 'مدیریت پروژه (شبیه میزیتو)',
  description: 'اپلیکیشن مدیریت پروژه و وظایف',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.className} bg-gray-50 text-gray-900`}>
        <nav className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">مدیریت پروژه</h1>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
