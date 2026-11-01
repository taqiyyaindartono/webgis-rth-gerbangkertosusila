'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { LeafletMapProps } from './LeafletMap';

// Clean, solid loading fallback without gradients or pulsing glow effects
function MapLoadingFallback() {
  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-6 select-none">
      <div className="flex flex-col items-center max-w-sm text-center">
        {/* Simple, clean rotating spinner */}
        <div className="w-10 h-10 border-3 border-slate-300 dark:border-slate-700 border-t-emerald-700 dark:border-t-emerald-500 rounded-full animate-spin mb-4" />

        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
          Memuat WebGIS Gerbangkertosusila
        </h4>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Menginisialisasi modul Leaflet dan layer spasial RTH...
        </p>

        {/* Flat minimal progress bar */}
        <div className="w-40 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-emerald-700 dark:bg-emerald-500 rounded-full animate-indeterminate" />
        </div>
      </div>
    </div>
  );
}

// Next.js dynamic import with ssr: false to prevent SSR hydration errors with Leaflet
const DynamicLeafletMap = dynamic<LeafletMapProps>(
  () => import('./LeafletMap'),
  {
    ssr: false,
    loading: () => <MapLoadingFallback />,
  }
);

export default function MapWrapper(props: LeafletMapProps) {
  return (
    <div className="relative w-full h-full min-h-[400px]">
      <DynamicLeafletMap {...props} />
    </div>
  );
}
