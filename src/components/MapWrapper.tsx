'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { LeafletMapProps } from './LeafletMap';

// Loading fallback component with pulse animation, skeleton and informative status
function MapLoadingFallback() {
  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Background animated grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px]"></div>

      <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
        {/* Animated radar/pulsing map pin icon */}
        <div className="relative mb-4 flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full bg-emerald-500/20 animate-ping"></div>
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <svg
              className="w-7 h-7 text-white animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
        </div>

        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Memuat WebGIS Gerbangkertosusila
        </h4>
        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
          Menginisialisasi modul Leaflet.js dan memuat dataset spasial tematik RTH...
        </p>

        {/* Progress indicator */}
        <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-indeterminate"></div>
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
