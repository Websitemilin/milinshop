import type { Metadata } from 'next';
import '../globals.css';
import { StorefrontHeader } from '@/components/storefront-header';
import { StorefrontFooter } from '@/components/storefront-footer';

export const metadata: Metadata = {
  title: 'Milin Shop - Luxury Women\'s Fashion Rental',
  description: 'Rent luxury designer clothing and accessories for every occasion. From evening gowns to designer blazers.',
};

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-body">
        <StorefrontHeader />
        {children}
        <StorefrontFooter />
      </body>
    </html>
  );
}
