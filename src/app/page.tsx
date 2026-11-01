'use client';

import React, { useState } from 'react';
import MapWrapper from '@/components/MapWrapper';
import {
  MapPin,
  Layers,
  Trees,
  Activity,
  Award,
  Users,
  Info,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Compass,
  Building2,
  ExternalLink,
} from 'lucide-react';

// Preset locations strictly within Gerbangkertosusila
const PRESET_LOCATIONS: {
  name: string;
  category: 'taman' | 'mangrove' | 'olahraga';
  coords: [number, number];
  kabKota: string;
}[] = [
  {
    name: 'Taman Bungkul',
    category: 'taman',
    coords: [-7.2918, 112.7392],
    kabKota: 'Kota Surabaya',
  },
  {
    name: 'Taman Surya (Balai Kota)',
    category: 'taman',
    coords: [-7.2604, 112.7461],
    kabKota: 'Kota Surabaya',
  },
  {
    name: 'Taman Flora Bratang',
    category: 'taman',
    coords: [-7.2971, 112.7612],
    kabKota: 'Kota Surabaya',
  },
  {
    name: 'Taman Harmoni Keputih',
    category: 'taman',
    coords: [-7.2943, 112.802],
    kabKota: 'Kota Surabaya',
  },
  {
    name: 'Alun-Alun Sidoarjo',
    category: 'taman',
    coords: [-7.4452, 112.7171],
    kabKota: 'Kab. Sidoarjo',
  },
  {
    name: 'Alun-Alun Gresik',
    category: 'taman',
    coords: [-7.1577, 112.6565],
    kabKota: 'Kab. Gresik',
  },
  {
    name: 'Alun-Alun Lamongan',
    category: 'taman',
    coords: [-7.1207, 112.4158],
    kabKota: 'Kab. Lamongan',
  },
  {
    name: 'Alun-Alun Bangkalan',
    category: 'taman',
    coords: [-7.0278, 112.7471],
    kabKota: 'Kab. Bangkalan',
  },
  {
    name: 'Alun-Alun Mojokerto',
    category: 'taman',
    coords: [-7.4682, 112.4332],
    kabKota: 'Kota Mojokerto',
  },
  {
    name: 'Mangrove Information Center Wonorejo',
    category: 'mangrove',
    coords: [-7.3077, 112.8211],
    kabKota: 'Kota Surabaya',
  },
  {
    name: 'Danau & Hutan Kampus UNESA',
    category: 'mangrove',
    coords: [-7.3137, 112.7258],
    kabKota: 'Kota Surabaya',
  },
  {
    name: 'Hutan Rewwin Waru',
    category: 'mangrove',
    coords: [-7.3448, 112.7532],
    kabKota: 'Kab. Sidoarjo',
  },
  {
    name: 'Lapangan Thor Surabaya',
    category: 'olahraga',
    coords: [-7.2865, 112.7301],
    kabKota: 'Kota Surabaya',
  },
  {
    name: 'Ciputra Golf Club',
    category: 'olahraga',
    coords: [-7.2945, 112.6391],
    kabKota: 'Kota Surabaya',
  },
  {
    name: 'Pakuwon Golf & Family Club',
    category: 'olahraga',
    coords: [-7.2932, 112.6583],
    kabKota: 'Kota Surabaya',
  },
];

// Kelompok Pelaksana Profile Data
const TEAM_MEMBERS = [
  { name: 'Rian Pratama', role: 'GIS & Spatial Analyst', nim: '5016211045' },
  { name: 'Nabila Azzahra', role: 'WebGIS Developer', nim: '5016211072' },
  { name: 'Dimas Wicaksono', role: 'Urban Planner & Data', nim: '5016211088' },
  { name: 'Tiara Putri', role: 'Cartographer & UI/UX', nim: '5016211103' },
];

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'team'>('overview');
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'taman' | 'mangrove' | 'olahraga'>('all');

  const [stats, setStats] = useState({
    tamanCount: 1796,
    mangroveCount: 701,
    olahragaCount: 735,
    totalAreaHa: 59065.2,
  });

  const handleFlyTo = (coords: [number, number]) => {
    setSelectedCoord([...coords]);
  };

  const filteredPresets = PRESET_LOCATIONS.filter((item) => {
    if (activeCategoryFilter === 'all') return true;
    return item.category === activeCategoryFilter;
  });

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-row relative bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
        />
      )}

      {/* LEFT SIDEBAR - Solid, flat, professional cartographic styling */}
      <aside
        className={`fixed md:relative z-40 h-full w-[85vw] sm:w-[380px] md:w-[410px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-lg md:shadow-none transition-transform duration-250 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:-ml-[410px]'
        }`}
      >
        {/* Sidebar Header - Solid Slate 900, clean typography, NO gradients */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-400 block">
                  Kawasan Metropolitan
                </span>
                <h1 className="text-base font-bold tracking-tight leading-snug">
                  WebGIS RTH Gerbangkertosusila
                </h1>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white transition-colors"
              aria-label="Tutup Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-2.5 text-xs text-slate-300 leading-relaxed font-normal">
            Sistem Informasi Geografis Tematik Ruang Terbuka Hijau (RTH) kawasan Gerbangkertosusila (Gresik, Bangkalan, Mojokerto, Surabaya, Sidoarjo, Lamongan).
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-slate-300">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              3.232 Poligon
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              Batas: Metropolitan
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              Canvas Render
            </span>
          </div>
        </div>

        {/* Sidebar Tabs - Clean solid flat styling */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-700 text-emerald-800 dark:border-emerald-500 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'locations'
                ? 'border-emerald-700 text-emerald-800 dark:border-emerald-500 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Pintasan ({PRESET_LOCATIONS.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'team'
                ? 'border-emerald-700 text-emerald-800 dark:border-emerald-500 dark:text-emerald-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Tim
          </button>
        </div>

        {/* Sidebar Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: OVERVIEW & STATISTIK */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Target 20% Mandat UU Indicator Card - Solid background, NO gradient */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Target RTH Publik 20%
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                    UU 26/2007
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  Amanat UU Penataan Ruang & Permen ATR/BPN No. 14/2022 mewajibkan minimal 20% RTH Publik dari total luas kawasan perkotaan.
                </p>

                {/* Solid Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-slate-600 dark:text-slate-400">Total Terpetakan:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {stats.tamanCount + stats.mangroveCount + stats.olahragaCount} Poligon
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-700 dark:bg-emerald-500 h-full rounded-full"
                      style={{ width: '85%' }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>Cakupan 6 Daerah Aglomerasi</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Khusus Gerbangkertosusila ✓</span>
                  </div>
                </div>
              </div>

              {/* Statistics Grid - Solid white/dark boxes, NO gradients */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Taman Kota */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1 text-emerald-700 dark:text-emerald-400">
                    <Trees className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Taman Kota
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.tamanCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Poligon</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#2ECC71' }} />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Hijau Cerah (#2ECC71)</span>
                  </div>
                </div>

                {/* Mangrove & Hutan */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1 text-emerald-900 dark:text-emerald-300">
                    <Layers className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Mangrove & Hutan
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.mangroveCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Poligon</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#1B5E20' }} />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Hijau Tua (#1B5E20)</span>
                  </div>
                </div>

                {/* Lapangan Olahraga */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1 text-amber-600 dark:text-amber-400">
                    <Activity className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Lapangan Olahraga
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.olahragaCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Poligon</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: '#FFA502' }} />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Oranye (#FFA502)</span>
                  </div>
                </div>

                {/* Total Luas RTH */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-1 text-slate-700 dark:text-slate-300">
                    <Building2 className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Total Luas RTH
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.totalAreaHa} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Ha</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
                    Wilayah Inti & Pesisir
                  </span>
                </div>
              </div>

              {/* Batasan Wilayah Note Card */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-600 dark:bg-slate-400"></span>
                  Batasan Spasial Gerbangkertosusila
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                  Peta spasial ini telah difilter secara ketat agar hanya me-render poligon di dalam 6 wilayah metropolitan (Gresik, Bangkalan, Mojokerto, Surabaya, Sidoarjo, Lamongan) untuk memastikan kecepatan render dan akurasi batas wilayah.
                </p>
                <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  Sesuai RTRW Aglomerasi Jawa Timur & OpenStreetMap Contributors.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE PRESET LOCATIONS */}
          {activeTab === 'locations' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Pintasan Titik Ikonik
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Pilih untuk zoom</span>
              </div>

              {/* Filter Buttons - Flat, solid styling */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <button
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Semua ({PRESET_LOCATIONS.length})
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('taman')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeCategoryFilter === 'taman'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Taman
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('mangrove')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeCategoryFilter === 'mangrove'
                      ? 'bg-[#1B5E20] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Mangrove
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('olahraga')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeCategoryFilter === 'olahraga'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Olahraga
                </button>
              </div>

              {/* Locations List */}
              <div className="space-y-1.5">
                {filteredPresets.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleFlyTo(item.coords)}
                    className="w-full text-left p-2.5 rounded-lg bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-xs flex-shrink-0"
                        style={{
                          backgroundColor:
                            item.category === 'taman'
                              ? '#2ECC71'
                              : item.category === 'mangrove'
                              ? '#1B5E20'
                              : '#FFA502',
                        }}
                      />
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 leading-tight">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.kabKota}</span>
                      </div>
                    </div>
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TIM PELAKSANA */}
          {activeTab === 'team' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                  Kolaborator Proyek
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Studio GIS & Perencanaan Wilayah Kota
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  Penyusunan Pemetaan Tematik RTH Aglomerasi Gerbangkertosusila.
                </p>
              </div>

              <div className="space-y-2">
                {TEAM_MEMBERS.map((member, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          {member.name}
                        </h5>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{member.role}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                      {member.nim}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 flex-shrink-0 text-slate-500" />
                <span>Terhubung dengan GitHub Repository & Vercel Deployment</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer - Clean solid bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center text-[10.5px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900">
          <span>WebGIS RTH Metropolitan Gerbangkertosusila &copy; 2026</span>
        </div>
      </aside>

      {/* SIDEBAR TOGGLE BUTTON - Clean solid styling */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute top-4 z-30 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all ${
          isSidebarOpen ? 'left-[390px] md:left-[422px]' : 'left-4'
        }`}
        aria-label="Toggle Sidebar"
        title={isSidebarOpen ? 'Sembunyikan Panel' : 'Buka Panel Informasi'}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-4 h-4 hidden md:block" />
        ) : (
          <ChevronRight className="w-4 h-4 hidden md:block" />
        )}
        <Menu className="w-4 h-4 md:hidden" />
      </button>

      {/* RIGHT MAIN MAP VIEW CONTAINER */}
      <section className="flex-1 h-full w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900">
        <MapWrapper
          flyToCoord={selectedCoord}
          onDataLoaded={(data) => {
            setStats(data);
          }}
        />
      </section>
    </main>
  );
}
