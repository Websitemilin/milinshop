import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Milin Shop - Admin Dashboard',
  description: 'Luxury women\'s fashion rental marketplace admin panel',
  keywords: ['luxury', 'fashion', 'rental', 'women', 'designer'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-body">{children}</body>
    </html>
  );
}
