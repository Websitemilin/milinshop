import type { Metadata } from 'next';
import '../globals.css';
import { StorefrontHeader } from '@/components/storefront-header';
import { StorefrontFooter } from '@/components/storefront-footer';

export const metadata: Metadata = {
  title: 'Mirin Shop - เช่าแฟชั่นหรูสำหรับผู้หญิง',
  description: 'เช่าเสื้อผ้าและเครื่องประดับดีไซเนอร์สำหรับทุกโอกาส ตั้งแต่ชุดราตรีถึงเสื้อสูทดีไซเนอร์',
};

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="bg-white text-gray-900 font-body">
        <StorefrontHeader />
        {children}
        <StorefrontFooter />
      </body>
    </html>
  );
}
