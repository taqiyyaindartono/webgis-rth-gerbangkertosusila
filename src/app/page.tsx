'use client';

import React, { useState, useCallback } from 'react';
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
  Search,
  Landmark,
} from 'lucide-react';

interface PresetLocation {
  name: string;
  category: 'alun-alun' | 'taman' | 'mangrove' | 'olahraga';
  coords: [number, number];
  kabKota: string;
  badge?: string;
}

// Preset locations: Semua taman dan alun-alun kota terkenal di kawasan Gerbangkertosusila
const PRESET_LOCATIONS: PresetLocation[] = [
  // --- ALUN-ALUN METROPOLITAN ---
  {
    name: 'Alun-Alun Surabaya (Balai Pemuda)',
    category: 'alun-alun',
    coords: [-7.2625, 112.7455],
    kabKota: 'Kota Surabaya',
    badge: 'Galeri Seni Bawah Tanah & Plaza',
  },
  {
    name: 'Alun-Alun Sidoarjo',
    category: 'alun-alun',
    coords: [-7.4461, 112.7180],
    kabKota: 'Kab. Sidoarjo',
    badge: 'Monumen Jayandaru',
  },
  {
    name: 'Alun-Alun Gresik',
    category: 'alun-alun',
    coords: [-7.1572, 112.6561],
    kabKota: 'Kab. Gresik',
    badge: 'Kawasan Religi Malik Ibrahim',
  },
  {
    name: 'Alun-Alun Lamongan',
    category: 'alun-alun',
    coords: [-7.1206, 112.4159],
    kabKota: 'Kab. Lamongan',
    badge: 'Tugu Bandeng Lele & Bianglala',
  },
  {
    name: 'Alun-Alun Bangkalan (Taman Paseban)',
    category: 'alun-alun',
    coords: [-7.0293, 112.7476],
    kabKota: 'Kab. Bangkalan',
    badge: 'Depan Masjid Agung Bangkalan',
  },
  {
    name: 'Alun-Alun Kota Mojokerto',
    category: 'alun-alun',
    coords: [-7.4629, 112.4319],
    kabKota: 'Kota Mojokerto',
    badge: 'Tugu Proklamasi & Alun-Alun Wiraraja',
  },
  {
    name: 'Alun-Alun Sidayu Gresik',
    category: 'alun-alun',
    coords: [-6.9913, 112.5647],
    kabKota: 'Kab. Gresik',
    badge: 'Kawasan Bersejarah Kadipaten Sidayu',
  },

  // --- TAMAN KOTA SURABAYA ---
  {
    name: 'Taman Bungkul',
    category: 'taman',
    coords: [-7.2914, 112.7399],
    kabKota: 'Kota Surabaya',
    badge: 'Taman Kota Terbaik Tingkat Dunia',
  },
  {
    name: 'Taman Surya (Halaman Balai Kota)',
    category: 'taman',
    coords: [-7.2602, 112.7468],
    kabKota: 'Kota Surabaya',
    badge: 'Air Mancur Menari & Balai Kota',
  },
  {
    name: 'Taman Flora (Kebun Bibit Bratang)',
    category: 'taman',
    coords: [-7.2956, 112.7617],
    kabKota: 'Kota Surabaya',
    badge: 'Konservasi Rusa & Kanopi Teduh',
  },
  {
    name: 'Taman Harmoni Keputih',
    category: 'taman',
    coords: [-7.2952, 112.8030],
    kabKota: 'Kota Surabaya',
    badge: 'Hutan Bambu Jepang & Taman Bunga',
  },
  {
    name: 'Taman Prestasi Kalimas',
    category: 'taman',
    coords: [-7.2613, 112.7434],
    kabKota: 'Kota Surabaya',
    badge: 'Dermaga Wisata Perahu Kalimas',
  },
  {
    name: 'Taman Apsari (Depan Gedung Grahadi)',
    category: 'taman',
    coords: [-7.2638, 112.7428],
    kabKota: 'Kota Surabaya',
    badge: 'Monumen Gubernur Suryo',
  },
  {
    name: 'Taman Pelangi (Bundaran Dolog)',
    category: 'taman',
    coords: [-7.3278, 112.7312],
    kabKota: 'Kota Surabaya',
    badge: 'Gerbang Selatan Kota Surabaya',
  },
  {
    name: 'Taman Suroboyo & Bulak Kenjeran',
    category: 'taman',
    coords: [-7.2253, 112.7877],
    kabKota: 'Kota Surabaya',
    badge: 'Patung Raksasa Suro & Boyo Kenjeran',
  },
  {
    name: 'Taman Ekspresi Kalimas',
    category: 'taman',
    coords: [-7.2569, 112.7435],
    kabKota: 'Kota Surabaya',
    badge: 'Galeri Seni Rupa Daur Ulang Terbuka',
  },
  {
    name: 'Taman Jayengrono (Kota Lama)',
    category: 'taman',
    coords: [-7.2360, 112.7378],
    kabKota: 'Kota Surabaya',
    badge: 'Kawasan Bersejarah Jembatan Merah',
  },

  // --- TAMAN KOTA SIDOARJO, GRESIK, MOJOKERTO, LAMONGAN, BANGKALAN ---
  {
    name: 'Taman Abhirama Sidoarjo',
    category: 'taman',
    coords: [-7.4417, 112.7049],
    kabKota: 'Kab. Sidoarjo',
    badge: 'Taman Edukasi & Rekreasi Keluarga',
  },
  {
    name: 'Taman Tanjung Puri Sidoarjo',
    category: 'taman',
    coords: [-7.4526, 112.7408],
    kabKota: 'Kab. Sidoarjo',
    badge: 'RTH Perkotaan Sidoarjo',
  },
  {
    name: 'Taman Tugu Kota Gresik',
    category: 'taman',
    coords: [-7.1934, 112.6457],
    kabKota: 'Kab. Gresik',
    badge: 'Tugu Gerbang Selamat Datang Gresik',
  },
  {
    name: 'Taman Gresik Kota Baru (GKB)',
    category: 'taman',
    coords: [-7.1590, 112.6177],
    kabKota: 'Kab. Gresik',
    badge: 'RTH Kawasan Hunian Mandiri',
  },
  {
    name: 'Taman Benteng Pancasila (Benpas)',
    category: 'taman',
    coords: [-7.4719, 112.4452],
    kabKota: 'Kota Mojokerto',
    badge: 'Pusat Wisata Kuliner & Rekreasi',
  },
  {
    name: 'Taman Monumen Kadet Suwoko',
    category: 'taman',
    coords: [-7.1139, 112.4262],
    kabKota: 'Kab. Lamongan',
    badge: 'Monumen Bersejarah & Ruang Terbuka',
  },
  {
    name: 'Taman Rekreasi Kota (TRK) Bangkalan',
    category: 'taman',
    coords: [-7.0345, 112.7410],
    kabKota: 'Kab. Bangkalan',
    badge: 'Danau & RTH Terbuka Bangkalan',
  },

  // --- MANGROVE & HUTAN KOTA ---
  {
    name: 'Mangrove Information Center Wonorejo',
    category: 'mangrove',
    coords: [-7.3077, 112.8211],
    kabKota: 'Kota Surabaya',
    badge: 'Ekowisata Konservasi Pantai Timur',
  },
  {
    name: 'Kebun Raya Mangrove Gunung Anyar',
    category: 'mangrove',
    coords: [-7.3405, 112.8455],
    kabKota: 'Kota Surabaya',
    badge: 'Kebun Raya Mangrove Pertama RI',
  },
  {
    name: 'Hutan Rewwin Waru',
    category: 'mangrove',
    coords: [-7.3450, 112.7535],
    kabKota: 'Kab. Sidoarjo',
    badge: 'Sabuk Hijau & Jogging Track',
  },
  {
    name: 'Hutan Kota Balas Klumprik Wiyung',
    category: 'mangrove',
    coords: [-7.3306, 112.6910],
    kabKota: 'Kota Surabaya',
    badge: 'Waduk Retensi & Konservasi Hayati',
  },
  {
    name: 'Hutan Kota Pakal Benowo',
    category: 'mangrove',
    coords: [-7.2348, 112.6208],
    kabKota: 'Kota Surabaya',
    badge: 'Hutan Lindung & Bumi Perkemahan',
  },
  {
    name: 'Hutan Kota Mojokerto (Pulorejo)',
    category: 'mangrove',
    coords: [-7.4676, 112.4184],
    kabKota: 'Kota Mojokerto',
    badge: 'RTH Lindung Bantaran Sungai',
  },

  // --- STADION & KOMPLEKS OLAHRAGA ---
  {
    name: 'Stadion Utama Gelora Bung Tomo (GBT)',
    category: 'olahraga',
    coords: [-7.2307, 112.6215],
    kabKota: 'Kota Surabaya',
    badge: 'Stadion Bertaraf Internasional FIFA',
  },
  {
    name: 'Stadion Gelora Delta Sidoarjo',
    category: 'olahraga',
    coords: [-7.4500, 112.7085],
    kabKota: 'Kab. Sidoarjo',
    badge: 'Kompleks Gelora Olahraga Terpadu',
  },
  {
    name: 'Stadion Gelora Joko Samudro (Gejos)',
    category: 'olahraga',
    coords: [-7.1830, 112.6465],
    kabKota: 'Kab. Gresik',
    badge: 'Stadion Utama Kebomas Gresik',
  },
  {
    name: 'Stadion Gelora 10 Nopember (Tambaksari)',
    category: 'olahraga',
    coords: [-7.2535, 112.7551],
    kabKota: 'Kota Surabaya',
    badge: 'Stadion Cagar Budaya Bersejarah',
  },
  {
    name: 'Kompleks Stadion & Lapangan Thor',
    category: 'olahraga',
    coords: [-7.2865, 112.7301],
    kabKota: 'Kota Surabaya',
    badge: 'Lintasan Lari Sintetis World Athletics',
  },
  {
    name: 'Stadion Surajaya Lamongan',
    category: 'olahraga',
    coords: [-7.1215, 112.4372],
    kabKota: 'Kab. Lamongan',
    badge: 'Stadion Sepak Bola Utama Lamongan',
  },
  {
    name: 'Stadion Gelora Bangkalan (SGB)',
    category: 'olahraga',
    coords: [-7.0322, 112.7510],
    kabKota: 'Kab. Bangkalan',
    badge: 'Stadion Utama Pulau Madura',
  },
  {
    name: 'Ciputra Golf & Family Club',
    category: 'olahraga',
    coords: [-7.2945, 112.6391],
    kabKota: 'Kota Surabaya',
    badge: 'Lapangan Golf & RTH Hijau Privat',
  },
];

// Kelompok Pelaksana Profile Data
const TEAM_MEMBERS = [
  { name: 'Unknown', role: 'GIS & Spatial Analyst', nim: 'Unknown' },
  { name: 'Unknown', role: 'WebGIS Developer', nim: 'Unknown' },
  { name: 'Unknown', role: 'Urban Planner & Data', nim: 'Unknown' },
  { name: 'Unknown', role: 'Cartographer & UI/UX', nim: 'Unknown' },
];

// Helper to match preset location with selected regency
function matchPresetRegency(presetKabKota: string, targetRegency: string): boolean {
  if (targetRegency === 'all') return true;
  if (targetRegency === 'Kota Surabaya') return presetKabKota.includes('Surabaya');
  if (targetRegency === 'Kabupaten Sidoarjo') return presetKabKota.includes('Sidoarjo');
  if (targetRegency === 'Kabupaten Gresik') return presetKabKota.includes('Gresik');
  if (targetRegency === 'Kota Mojokerto') return presetKabKota.includes('Kota Mojokerto');
  if (targetRegency === 'Kabupaten Mojokerto') return presetKabKota.includes('Kab. Mojokerto') || presetKabKota.includes('Kabupaten Mojokerto');
  if (targetRegency === 'Kabupaten Lamongan') return presetKabKota.includes('Lamongan');
  if (targetRegency === 'Kabupaten Bangkalan') return presetKabKota.includes('Bangkalan');
  return true;
}

// Regency quick navigation chips
const REGENCY_CHIPS = [
  { id: 'all', shortName: 'Semua', count: '3.735' },
  { id: 'Kota Surabaya', shortName: 'Surabaya', count: '1.360' },
  { id: 'Kabupaten Sidoarjo', shortName: 'Sidoarjo', count: '280' },
  { id: 'Kabupaten Gresik', shortName: 'Gresik', count: '61' },
  { id: 'Kabupaten Mojokerto', shortName: 'Mojokerto', count: '1.644' },
  { id: 'Kabupaten Lamongan', shortName: 'Lamongan', count: '321' },
  { id: 'Kabupaten Bangkalan', shortName: 'Bangkalan', count: '54' },
];

// 6 Metropolitan Agglomeration Regions Distribution
const METRO_DISTRIBUTION = [
  { id: 'Kota Surabaya', name: 'Kota Surabaya', count: 1360, share: '36,4%', note: 'Pusat metropolitan inti' },
  { id: 'Kabupaten Mojokerto', name: 'Kabupaten Mojokerto', count: 1644, share: '44,0%', note: 'Kawasan konservasi & hutan' },
  { id: 'Kabupaten Lamongan', name: 'Kabupaten Lamongan', count: 321, share: '8,6%', note: 'Koridor pantura & pesisir' },
  { id: 'Kabupaten Sidoarjo', name: 'Kabupaten Sidoarjo', count: 280, share: '7,5%', note: 'Penyangga selatan bandara' },
  { id: 'Kabupaten Gresik', name: 'Kabupaten Gresik', count: 61, share: '1,6%', note: 'Sabuk hijau industri' },
  { id: 'Kabupaten Bangkalan', name: 'Kabupaten Bangkalan', count: 54, share: '1,4%', note: 'Gerbang kepulauan Madura' },
  { id: 'Kota Mojokerto', name: 'Kota Mojokerto', count: 15, share: '0,4%', note: 'RTH perkotaan kompak' },
];

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'team'>('overview');
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'alun-alun' | 'taman' | 'mangrove' | 'olahraga'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegency, setSelectedRegency] = useState<string>('all');
  const [showRegulationInfo, setShowRegulationInfo] = useState(false);

  const [regencyStats, setRegencyStats] = useState({
    tamanCount: 1876,
    mangroveCount: 951,
    olahragaCount: 730,
    pemakamanCount: 178,
    tamanAreaHa: 29377.8,
    mangroveAreaHa: 14923.0,
    olahragaAreaHa: 11411.7,
    pemakamanAreaHa: 2809.1,
    totalAreaHa: 58521.6,
    totalCount: 3735,
    regencyName: 'Semua Wilayah (Metropolitan)',
  });

  const handleFilteredStatsChange = useCallback(
    (newStats: {
      tamanCount: number;
      mangroveCount: number;
      olahragaCount: number;
      pemakamanCount: number;
      tamanAreaHa?: number;
      mangroveAreaHa?: number;
      olahragaAreaHa?: number;
      pemakamanAreaHa?: number;
      totalAreaHa: number;
      totalCount: number;
      regencyName: string;
    }) => {
      setRegencyStats((prev) => ({
        ...prev,
        ...newStats,
        tamanAreaHa: newStats.tamanAreaHa ?? prev.tamanAreaHa,
        mangroveAreaHa: newStats.mangroveAreaHa ?? prev.mangroveAreaHa,
        olahragaAreaHa: newStats.olahragaAreaHa ?? prev.olahragaAreaHa,
        pemakamanAreaHa: newStats.pemakamanAreaHa ?? prev.pemakamanAreaHa,
      }));
    },
    []
  );

  const handleFlyTo = (coords: [number, number]) => {
    setSelectedCoord([...coords]);
  };

  const totalCount = regencyStats.totalCount || 1;
  const pTaman = Math.round((regencyStats.tamanCount / totalCount) * 1000) / 10;
  const pMangrove = Math.round((regencyStats.mangroveCount / totalCount) * 1000) / 10;
  const pOlahraga = Math.round((regencyStats.olahragaCount / totalCount) * 1000) / 10;
  const pPemakaman = Math.round((regencyStats.pemakamanCount / totalCount) * 1000) / 10;

  const filteredPresets = PRESET_LOCATIONS.filter((item) => {
    const matchCategory =
      activeCategoryFilter === 'all'
        ? true
        : activeCategoryFilter === 'alun-alun'
        ? item.category === 'alun-alun'
        : item.category === activeCategoryFilter;

    const matchSearch =
      searchQuery.trim() === ''
        ? true
        : item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.kabKota.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.badge && item.badge.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchRegency = matchPresetRegency(item.kabKota, selectedRegency);

    return matchCategory && matchSearch && matchRegency;
  });

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-row relative bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden"
        />
      )}

      {/* LEFT SIDEBAR - Solid, flat, professional cartographic styling */}
      <aside
        className={`fixed md:relative z-40 h-full w-[85vw] sm:w-[360px] md:w-[360px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:-ml-[360px]'
        }`}
      >
        {/* Solid Cartographic Sidebar Header */}
        <header className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-3 ring-emerald-500/20" />
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                WebGIS Gerbangkertosusila
              </span>
            </div>

            {/* Close button inside sidebar */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Tutup Sidebar"
              title="Sembunyikan Panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Atlas Ruang Terbuka Hijau
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
              Inventarisasi spasial 6 wilayah metropolitan: Surabaya, Sidoarjo, Gresik, Mojokerto, Lamongan, dan Bangkalan.
            </p>
          </div>

          {/* Clean Telemetry Strip (No heavy grid boxes) */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
              {regencyStats.totalCount.toLocaleString('id-ID')} poligon
            </span>
            <span>&bull;</span>
            <span className="tabular-nums font-medium text-slate-700 dark:text-slate-300">
              {regencyStats.totalAreaHa.toLocaleString('id-ID')} ha
            </span>
            <span>&bull;</span>
            <span>WGS 84</span>
          </div>
        </header>

        {/* Regency Spatial Selector with Quick Filter Chips */}
        <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Wilayah Observasi
            </span>
            {selectedRegency !== 'all' && (
              <button
                onClick={() => setSelectedRegency('all')}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Tampilkan semua
              </button>
            )}
          </div>

          {/* Quick Regency Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {REGENCY_CHIPS.map((chip) => {
              const isActive = selectedRegency === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setSelectedRegency(chip.id)}
                  className={`px-2 py-1 rounded text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span>{chip.shortName}</span>
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      isActive
                        ? 'text-slate-300 dark:text-slate-600'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Studio Navigation Tabs - Slim Underline Style */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 text-xs bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2.5 px-3 font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
              activeTab === 'overview'
                ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`py-2.5 px-3 font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
              activeTab === 'locations'
                ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Pintasan ({filteredPresets.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`py-2.5 px-3 font-medium transition-colors cursor-pointer border-b-2 -mb-px ${
              activeTab === 'team'
                ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Metadata &amp; Tim
          </button>
        </div>

        {/* Sidebar Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 pt-3">
          {/* TAB 1: OVERVIEW & SPATIAL ANALYTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 1. Komposisi Kategori RTH */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Komposisi Kategori RTH
                  </h2>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
                    {regencyStats.regencyName}
                  </span>
                </div>

                {/* Stacked Horizontal Bar */}
                <div className="w-full h-2 rounded-xs overflow-hidden flex bg-slate-100 dark:bg-slate-800">
                  <div style={{ width: `${pTaman}%`, backgroundColor: '#2ECC71' }} title={`Taman: ${pTaman}%`} />
                  <div style={{ width: `${pMangrove}%`, backgroundColor: '#1B5E20' }} title={`Mangrove & Hutan: ${pMangrove}%`} />
                  <div style={{ width: `${pOlahraga}%`, backgroundColor: '#FFA502' }} title={`Olahraga: ${pOlahraga}%`} />
                  <div style={{ width: `${pPemakaman}%`, backgroundColor: '#0D9488' }} title={`Pemakaman: ${pPemakaman}%`} />
                </div>

                {/* Tabular Metric List */}
                <div className="border border-slate-200 dark:border-slate-800 rounded divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {/* Taman */}
                  <div className="flex items-center justify-between py-2 px-2.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2 rounded-xs flex-shrink-0" style={{ backgroundColor: '#2ECC71' }} />
                      <span className="text-slate-700 dark:text-slate-300 truncate">Taman Kota &amp; Alun-Alun</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-mono text-[11px] flex-shrink-0 pl-2">
                      <span className="text-slate-400 tabular-nums">{regencyStats.tamanCount.toLocaleString('id-ID')} obj</span>
                      <span className="text-slate-400 tabular-nums">{regencyStats.tamanAreaHa.toLocaleString('id-ID')} Ha</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums w-11 text-right">{pTaman}%</span>
                    </div>
                  </div>

                  {/* Mangrove */}
                  <div className="flex items-center justify-between py-2 px-2.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2 rounded-xs flex-shrink-0" style={{ backgroundColor: '#1B5E20' }} />
                      <span className="text-slate-700 dark:text-slate-300 truncate">Hutan Kota &amp; Mangrove</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-mono text-[11px] flex-shrink-0 pl-2">
                      <span className="text-slate-400 tabular-nums">{regencyStats.mangroveCount.toLocaleString('id-ID')} obj</span>
                      <span className="text-slate-400 tabular-nums">{regencyStats.mangroveAreaHa.toLocaleString('id-ID')} Ha</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums w-11 text-right">{pMangrove}%</span>
                    </div>
                  </div>

                  {/* Olahraga */}
                  <div className="flex items-center justify-between py-2 px-2.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2 rounded-xs flex-shrink-0" style={{ backgroundColor: '#FFA502' }} />
                      <span className="text-slate-700 dark:text-slate-300 truncate">Lapangan Olahraga</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-mono text-[11px] flex-shrink-0 pl-2">
                      <span className="text-slate-400 tabular-nums">{regencyStats.olahragaCount.toLocaleString('id-ID')} obj</span>
                      <span className="text-slate-400 tabular-nums">{regencyStats.olahragaAreaHa.toLocaleString('id-ID')} Ha</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums w-11 text-right">{pOlahraga}%</span>
                    </div>
                  </div>

                  {/* Pemakaman */}
                  <div className="flex items-center justify-between py-2 px-2.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2 rounded-xs flex-shrink-0" style={{ backgroundColor: '#0D9488' }} />
                      <span className="text-slate-700 dark:text-slate-300 truncate">RTH Pemakaman</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-mono text-[11px] flex-shrink-0 pl-2">
                      <span className="text-slate-400 tabular-nums">{regencyStats.pemakamanCount.toLocaleString('id-ID')} obj</span>
                      <span className="text-slate-400 tabular-nums">{regencyStats.pemakamanAreaHa.toLocaleString('id-ID')} Ha</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums w-11 text-right">{pPemakaman}%</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. Tolok Ukur Mandat UU 26/2007 */}
              <section className="p-3 rounded border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/60 dark:bg-slate-900/40">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      Mandat UU 26/2007
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRegulationInfo(!showRegulationInfo)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      title={showRegulationInfo ? 'Tutup info regulasi' : 'Buka detail regulasi'}
                      aria-label="Info regulasi"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Target Min. 20% Publik
                  </span>
                </div>

                {showRegulationInfo && (
                  <div className="p-2.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-100 text-[11px]">
                        Dasar Regulasi:
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowRegulationInfo(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs px-1 cursor-pointer"
                        title="Tutup"
                      >
                        ✕
                      </button>
                    </div>
                    <p>
                      Pasal 29 UU Penataan Ruang &amp; Permen ATR/BPN No. 14/2022 mewajibkan proporsi RTH publik paling sedikit 20% dari luas kawasan perkotaan aglomerasi.
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Capaian Terpetakan</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      24,2% <span className="font-normal text-slate-400">(+4,2% di atas ambang)</span>
                    </span>
                  </div>
                  <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-xs overflow-hidden">
                    <div className="h-full bg-slate-800 dark:bg-slate-200 rounded-xs" style={{ width: '80%' }} />
                    <div className="absolute top-0 bottom-0 left-[66%] w-0.5 bg-red-500" title="Ambang Batas Minimum 20%" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>0%</span>
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Batas Min. 20%</span>
                    <span>30% Target Total</span>
                  </div>
                </div>
              </section>

              {/* 3. Sebaran 6 Wilayah Metropolitan (Replacing redundant cards) */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Sebaran Wilayah Metropolitan
                  </h2>
                  <span className="text-[10px] font-mono text-slate-400">
                    Klik untuk fokus
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {METRO_DISTRIBUTION.map((reg) => {
                    const isSelected = selectedRegency === reg.id;
                    return (
                      <button
                        key={reg.id}
                        onClick={() => setSelectedRegency(reg.id)}
                        className={`w-full flex items-center justify-between p-2 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-800 font-medium'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                isSelected ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                            />
                            <span className="text-slate-800 dark:text-slate-200 truncate font-medium">
                              {reg.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block pl-3 truncate">
                            {reg.note}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 flex-shrink-0">
                          <span className="tabular-nums">{reg.count.toLocaleString('id-ID')} obj</span>
                          <span className="tabular-nums text-slate-400">({reg.share})</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: INTERACTIVE PRESET LOCATIONS */}
          {activeTab === 'locations' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Direktori Landmark Spasial
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {filteredPresets.length} dari {PRESET_LOCATIONS.length} lokasi
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  6 daerah
                </span>
              </div>

              {/* Search Bar Input */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama taman, stadion, kawasan..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Buttons */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('alun-alun')}
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeCategoryFilter === 'alun-alun'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Landmark className="w-3 h-3" />
                  Alun-alun
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('taman')}
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeCategoryFilter === 'taman'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Trees className="w-3 h-3" />
                  Taman kota
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('mangrove')}
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeCategoryFilter === 'mangrove'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  Mangrove
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('olahraga')}
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeCategoryFilter === 'olahraga'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  Stadion
                </button>
              </div>

              {/* Locations List with Coordinates */}
              <div className="space-y-1.5 max-h-[calc(100vh-340px)] overflow-y-auto pr-0.5">
                {filteredPresets.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-md">
                    Tidak ditemukan lokasi yang cocok dengan kata kunci &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredPresets.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleFlyTo(item.coords)}
                      className="w-full text-left p-2.5 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-xs flex-shrink-0 mt-1"
                          style={{
                            backgroundColor:
                              item.category === 'alun-alun'
                                ? '#059669'
                                : item.category === 'taman'
                                ? '#2ECC71'
                                : item.category === 'mangrove'
                                ? '#1B5E20'
                                : '#FFA502',
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-medium text-slate-800 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors leading-snug truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-medium text-slate-600 dark:text-slate-300">{item.kabKota}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                              {item.coords[0].toFixed(4)}°, {item.coords[1].toFixed(4)}°
                            </span>
                          </div>
                          {item.badge && (
                            <div className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 truncate">
                              {item.badge}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-700 dark:text-slate-200 text-xs font-medium ml-2 flex-shrink-0">
                        <span className="text-[10px] font-mono">Buka</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TIM PELAKSANA */}
          {activeTab === 'team' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block mb-0.5">
                  Kolaborator Proyek
                </span>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Studio GIS & Perencanaan Wilayah Kota
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Penyusunan Pemetaan Tematik RTH Aglomerasi Gerbangkertosusila.
                </p>
              </div>

              <div className="space-y-2">
                {TEAM_MEMBERS.map((member, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-medium text-xs">
                        {member.name === 'Unknown' ? '?' : member.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">
                          {member.name}
                        </h5>
                        <span className="text-[11px] text-slate-400 block">{member.role}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {member.nim}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span>Terhubung dengan GitHub Repository & Vercel Deployment</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400 bg-slate-50/70 dark:bg-slate-900/60 font-mono">
          <span>WebGIS RTH Metropolitan Gerbangkertosusila &copy; 2026</span>
        </div>
      </aside>

      {/* SIDEBAR TOGGLE BUTTON - Only when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-30 p-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Buka Sidebar"
          title="Buka Panel Informasi"
        >
          <Menu className="w-4 h-4" />
        </button>
      )}

      {/* RIGHT MAIN MAP VIEW CONTAINER */}
      <section className="flex-1 h-full w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900">
        <MapWrapper
          flyToCoord={selectedCoord}
          selectedRegency={selectedRegency}
          onResetRegency={() => setSelectedRegency('all')}
          onFilteredStatsChange={handleFilteredStatsChange}
          isSidebarOpen={isSidebarOpen}
        />
      </section>
    </main>
  );
}
