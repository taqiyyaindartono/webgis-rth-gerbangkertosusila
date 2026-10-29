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

// Preset locations matched with genuine Gerbangkertosusila GeoJSON dataset
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
    name: 'Mangrove Information Center',
    category: 'mangrove',
    coords: [-7.3077, 112.8211],
    kabKota: 'Kota Surabaya Timur',
  },
  {
    name: 'Danau & Konservasi UNESA',
    category: 'mangrove',
    coords: [-7.3137, 112.7258],
    kabKota: 'Kota Surabaya Selatan',
  },
  {
    name: 'Hutan Rewwin Sidoarjo',
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
    kabKota: 'Kota Surabaya Barat',
  },
  {
    name: 'Pakuwon Golf & Family Club',
    category: 'olahraga',
    coords: [-7.2932, 112.6583],
    kabKota: 'Kota Surabaya Barat',
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
    tamanCount: 1993,
    mangroveCount: 993,
    olahragaCount: 805,
    totalAreaHa: 216007.5,
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside
        className={`fixed md:relative z-40 h-full w-[85vw] sm:w-[380px] md:w-[410px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl md:shadow-none transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:-ml-[410px]'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <Compass className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-200 block">
                  Kawasan Metropolitan
                </span>
                <h1 className="text-base sm:text-lg font-bold tracking-tight leading-tight">
                  WebGIS RTH Gerbangkertosusila
                </h1>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Tutup Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="mt-2.5 text-xs text-emerald-50/90 leading-relaxed font-light">
            Sistem Informasi Geografis Tematik Ruang Terbuka Hijau (RTH) Wilayah Aglomerasi Gerbangkertosusila (Gresik, Bangkalan, Mojokerto, Surabaya, Sidoarjo, Lamongan).
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-emerald-100">
            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs">
              3.791 Poligon
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs">
              Leaflet Canvas
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs">
              OpenStreetMap
            </span>
          </div>
        </div>

        {/* Sidebar Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'locations'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Pintasan ({PRESET_LOCATIONS.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'team'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
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
              {/* Target 20% Mandat UU Indicator Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/50 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Target RTH Publik 20%
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                    UU 26/2007
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  Sesuai amanat UU Penataan Ruang & Permen ATR/BPN No. 14/2022, kawasan metropolitan wajib menyediakan minimal 20% RTH Publik dari total luas perkotaan.
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-slate-600 dark:text-slate-400">Total Poligon Terpetakan:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {stats.tamanCount + stats.mangroveCount + stats.olahragaCount} Poligon
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: '85%' }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                    <span>Cakupan 6 Wilayah Aglomerasi</span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">Data Lengkap ✓</span>
                  </div>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center gap-2 mb-1 text-emerald-600 dark:text-emerald-400">
                    <Trees className="w-4 h-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Taman Kota
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.tamanCount} <span className="text-xs font-normal text-slate-600 dark:text-slate-300">Poligon</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Warna: Lime (#2ECC71)</span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center gap-2 mb-1 text-emerald-800 dark:text-emerald-300">
                    <Layers className="w-4 h-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Mangrove & Hutan
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.mangroveCount} <span className="text-xs font-normal text-slate-600 dark:text-slate-300">Poligon</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">Warna: Forest (#1B5E20)</span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center gap-2 mb-1 text-amber-500">
                    <Activity className="w-4 h-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Lapangan Olahraga
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.olahragaCount} <span className="text-xs font-normal text-slate-600 dark:text-slate-300">Poligon</span>
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Warna: Oranye (#FFA502)</span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex items-center gap-2 mb-1 text-teal-600 dark:text-teal-400">
                    <Building2 className="w-4 h-4" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Total Poligon RTH
                    </span>
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.tamanCount + stats.mangroveCount + stats.olahragaCount}{' '}
                    <span className="text-xs font-normal text-slate-600 dark:text-slate-300">Area</span>
                  </div>
                  <span className="text-[10px] text-teal-700 dark:text-teal-300 font-medium">Gerbangkertosusila</span>
                </div>
              </div>

              {/* Collaborative Context Info */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs space-y-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Tentang Tata Ruang Aglomerasi
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                  Kawasan Gerbangkertosusila merupakan pusat aglomerasi ekonomi dan industri Jawa Timur. Pemetaan tematik RTH membantu pemantauan koridor ekologis pesisir, pengendalian intrusi air laut, serta pemenuhan ruang publik terbuka bagi masyarakat.
                </p>
                <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                  Sumber data spasial: QGIS Spatial Layer & OpenStreetMap (OSM) Contributors.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE PRESET LOCATIONS */}
          {activeTab === 'locations' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pintasan Lokasi Ikonik
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">Klik untuk terbang ke titik</span>
              </div>

              {/* Filter pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <button
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                    activeCategoryFilter === 'all'
                      ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('taman')}
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                    activeCategoryFilter === 'taman'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}
                >
                  Taman
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('mangrove')}
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                    activeCategoryFilter === 'mangrove'
                      ? 'bg-[#1B5E20] text-white'
                      : 'bg-emerald-900/10 text-emerald-950 dark:bg-emerald-900/30 dark:text-emerald-300'
                  }`}
                >
                  Mangrove
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('olahraga')}
                  className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                    activeCategoryFilter === 'olahraga'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
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
                    className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50/70 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
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
                        <span className="text-[10px] text-slate-600 dark:text-slate-300">{item.kabKota}</span>
                      </div>
                    </div>
                    <MapPin className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TIM PELAKSANA */}
          {activeTab === 'team' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  Kolaborator Proyek
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Tim Studio GIS & Perencanaan Wilayah Kota
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                  Proyek Pemetaan Tematik Kawasan Metropolitan Gerbangkertosusila Berbasis WebGIS Terbuka.
                </p>
              </div>

              <div className="space-y-2">
                {TEAM_MEMBERS.map((member, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                          {member.name}
                        </h5>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 block">{member.role}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                      {member.nim}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                <span>Terhubung dengan GitHub Repository & Vercel Deployment</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center text-[10.5px] text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-900/80">
          <span>WebGIS RTH Metropolitan Gerbangkertosusila &copy; 2026</span>
        </div>
      </aside>

      {/* SIDEBAR TOGGLE BUTTON (DESKTOP & MOBILE) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute top-4 z-30 p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-lg text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all ${
          isSidebarOpen ? 'left-[390px] md:left-[422px]' : 'left-4'
        }`}
        aria-label="Toggle Sidebar"
        title={isSidebarOpen ? 'Sembunyikan Panel' : 'Buka Panel Informasi'}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-5 h-5 hidden md:block" />
        ) : (
          <ChevronRight className="w-5 h-5 hidden md:block" />
        )}
        <Menu className="w-5 h-5 md:hidden" />
      </button>

      {/* RIGHT MAIN MAP VIEW CONTAINER */}
      <section className="flex-1 h-full w-full relative overflow-hidden bg-slate-200 dark:bg-slate-900">
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
