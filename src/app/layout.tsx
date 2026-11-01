import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WebGIS RTH Gerbangkertosusila | Pemetaan Tematik Ruang Terbuka Hijau',
  description:
    'Sistem Informasi Geografis Web interaktif untuk Pemetaan Tematik Ruang Terbuka Hijau (RTH) Kawasan Metropolitan Gerbangkertosusila (Gresik, Bangkalan, Mojokerto, Surabaya, Sidoarjo, Lamongan).',
  keywords: [
    'WebGIS',
    'RTH',
    'Gerbangkertosusila',
    'Surabaya',
    'Ruang Terbuka Hijau',
    'Taman Kota',
    'Hutan Mangrove',
    'Leaflet',
    'Next.js',
  ],
  authors: [{ name: 'Tim Kolaborasi Perencanaan Wilayah & Kota Gerbangkertosusila' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="h-full w-full overflow-hidden flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
