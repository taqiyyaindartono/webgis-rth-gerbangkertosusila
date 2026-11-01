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

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'team'>('overview');
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'alun-alun' | 'taman' | 'mangrove' | 'olahraga'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegency, setSelectedRegency] = useState<string>('all');

  const [regencyStats, setRegencyStats] = useState({
    tamanCount: 1876,
    mangroveCount: 951,
    olahragaCount: 730,
    pemakamanCount: 178,
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
      totalAreaHa: number;
      totalCount: number;
      regencyName: string;
    }) => {
      setRegencyStats((prev) => {
        if (
          prev.totalCount === newStats.totalCount &&
          prev.totalAreaHa === newStats.totalAreaHa &&
          prev.tamanCount === newStats.tamanCount &&
          prev.mangroveCount === newStats.mangroveCount &&
          prev.olahragaCount === newStats.olahragaCount &&
          prev.pemakamanCount === newStats.pemakamanCount &&
          prev.regencyName === newStats.regencyName
        ) {
          return prev;
        }
        return newStats;
      });
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
        className={`fixed md:relative z-40 h-full w-[85vw] sm:w-[380px] md:w-[420px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-lg md:shadow-none transition-transform duration-250 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:-ml-[420px]'
        }`}
      >
        {/* Studio Cartographic Header */}
        <header className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950/20 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shadow-2xs">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono tracking-wider font-semibold text-emerald-700 dark:text-emerald-400">
                    GERBANGKERTOSUSILA RTH
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  Atlas Ruang Terbuka Hijau
                </h1>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Tutup Sidebar"
              title="Sembunyikan Panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Sistem Informasi Geografis spasial tematik RTH terpadu 6 wilayah metropolitan: Gresik, Bangkalan, Mojokerto, Surabaya, Sidoarjo, dan Lamongan.
          </p>

          {/* Telemetry Datum Strip */}
          <div className="flex items-center justify-between text-[11px] font-mono py-1.5 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>WGS 84</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="tabular-nums font-medium text-slate-800 dark:text-slate-200">
              {regencyStats.totalCount.toLocaleString('id-ID')} Poligon
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
              {regencyStats.totalAreaHa.toLocaleString('id-ID')} Ha
            </div>
          </div>
        </header>

        {/* Regency Spatial Selector */}
        <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="regency-select" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Wilayah observasi
            </label>
            {selectedRegency !== 'all' && (
              <button
                onClick={() => setSelectedRegency('all')}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-mono cursor-pointer"
              >
                Tampilkan semua
              </button>
            )}
          </div>
          <div className="relative">
            <select
              id="regency-select"
              value={selectedRegency}
              onChange={(e) => setSelectedRegency(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer transition-colors shadow-2xs appearance-none"
            >
              <option value="all">Semua Wilayah (Metropolitan - 3.735 Poligon)</option>
              <option value="Kota Surabaya">Kota Surabaya (1.360 Poligon)</option>
              <option value="Kabupaten Sidoarjo">Kabupaten Sidoarjo (280 Poligon)</option>
              <option value="Kabupaten Gresik">Kabupaten Gresik (61 Poligon)</option>
              <option value="Kota Mojokerto">Kota Mojokerto (15 Poligon)</option>
              <option value="Kabupaten Mojokerto">Kabupaten Mojokerto (1.644 Poligon)</option>
              <option value="Kabupaten Lamongan">Kabupaten Lamongan (321 Poligon)</option>
              <option value="Kabupaten Bangkalan">Kabupaten Bangkalan (54 Poligon)</option>
            </select>
            <ChevronRight className="w-3.5 h-3.5 absolute right-2.5 top-3 rotate-90 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex p-1.5 mx-4 my-3 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'locations'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Pintasan ({filteredPresets.length})
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'team'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Tim
          </button>
        </div>

        {/* Sidebar Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {/* TAB 1: OVERVIEW & STATISTIK */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Moment 1: Master Segmented Spatial Distribution Bar */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Distribusi Proporsi Spasial
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                    {regencyStats.regencyName}
                  </span>
                </div>

                {/* Segmented Horizontal Bar */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 shadow-inner">
                  <div style={{ width: `${pTaman}%`, backgroundColor: '#2ECC71' }} title={`Taman: ${pTaman}%`} />
                  <div style={{ width: `${pMangrove}%`, backgroundColor: '#1B5E20' }} title={`Mangrove: ${pMangrove}%`} />
                  <div style={{ width: `${pOlahraga}%`, backgroundColor: '#FFA502' }} title={`Olahraga: ${pOlahraga}%`} />
                  <div style={{ width: `${pPemakaman}%`, backgroundColor: '#0D9488' }} title={`Pemakaman: ${pPemakaman}%`} />
                </div>

                {/* Proportional Grid Legend */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#2ECC71' }} />
                      <span className="text-slate-600 dark:text-slate-300 font-sans truncate">Taman Kota</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums ml-1">{pTaman}%</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#1B5E20' }} />
                      <span className="text-slate-600 dark:text-slate-300 font-sans truncate">Hutan/Mangrove</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums ml-1">{pMangrove}%</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#FFA502' }} />
                      <span className="text-slate-600 dark:text-slate-300 font-sans truncate">Olahraga</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums ml-1">{pOlahraga}%</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#0D9488' }} />
                      <span className="text-slate-600 dark:text-slate-300 font-sans truncate">Pemakaman</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums ml-1">{pPemakaman}%</span>
                  </div>
                </div>
              </div>

              {/* Moment 2: Regulatory 20% Mandate Benchmark Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Tolok Ukur Mandat UU 26/2007
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Min. 20% Publik
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Pasal 29 UU Penataan Ruang & Permen ATR/BPN No. 14/2022 mewajibkan proporsi RTH publik paling sedikit 20% dari luas wilayah perkotaan aglomerasi.
                </p>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">Status spasial terpetakan:</span>
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      {regencyStats.totalCount.toLocaleString('id-ID')} Poligon ({regencyStats.totalAreaHa.toLocaleString('id-ID')} Ha)
                    </span>
                  </div>
                  <div className="relative w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-300" style={{ width: '85%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>0%</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ambang 20% Terpenuhi</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Statistics Grid - 4 Category Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Taman Kota */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-1.5 mb-1.5 text-slate-700 dark:text-slate-300">
                    <Trees className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Taman kota
                    </span>
                  </div>
                  <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                    {regencyStats.tamanCount.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">poligon</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2ECC71' }} />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">#2ECC71</span>
                  </div>
                </div>

                {/* Mangrove & Hutan */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-1.5 mb-1.5 text-slate-700 dark:text-slate-300">
                    <Layers className="w-4 h-4 text-emerald-800 dark:text-emerald-300" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Mangrove & hutan
                    </span>
                  </div>
                  <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                    {regencyStats.mangroveCount.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">poligon</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#1B5E20' }} />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">#1B5E20</span>
                  </div>
                </div>

                {/* Fasilitas Olahraga */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-1.5 mb-1.5 text-slate-700 dark:text-slate-300">
                    <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Fasilitas olahraga
                    </span>
                  </div>
                  <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                    {regencyStats.olahragaCount.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">poligon</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FFA502' }} />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">#FFA502</span>
                  </div>
                </div>

                {/* RTH Pemakaman */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="flex items-center gap-1.5 mb-1.5 text-slate-700 dark:text-slate-300">
                    <Landmark className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      RTH pemakaman
                    </span>
                  </div>
                  <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                    {regencyStats.pemakamanCount.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">poligon</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#0D9488' }} />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">#0D9488</span>
                  </div>
                </div>

                {/* Total Luas RTH - Full Width (col-span-2) */}
                <div className="col-span-2 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5 text-slate-700 dark:text-slate-300">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Total Luas RTH Terpetakan
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {selectedRegency === 'all' ? 'Cakupan 6 Wilayah Aglomerasi' : `Wilayah ${selectedRegency}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold font-mono tabular-nums text-slate-900 dark:text-white">
                      {regencyStats.totalAreaHa.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-sans">Ha</span>
                    </div>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium font-mono">
                      {regencyStats.totalAreaHa.toLocaleString('id-ID')} hektare
                    </span>
                  </div>
                </div>
              </div>

              {/* Spatial Specification Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Spesifikasi Geospasial Aglomerasi</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Batas spasial ketat mencakup 6 kabupaten/kota inti Jawa Timur: Gresik, Bangkalan, Mojokerto (Kota & Kab), Surabaya, Sidoarjo, dan Lamongan sesuai tata ruang RTRW Provinsi Jawa Timur.
                </p>
              </div>
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
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
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
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-colors shadow-2xs"
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

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategoryFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('alun-alun')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeCategoryFilter === 'alun-alun'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Landmark className="w-3 h-3" />
                  Alun-alun
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('taman')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeCategoryFilter === 'taman'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Trees className="w-3 h-3" />
                  Taman kota
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('mangrove')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeCategoryFilter === 'mangrove'
                      ? 'bg-[#1B5E20] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  Mangrove
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('olahraga')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeCategoryFilter === 'olahraga'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Activity className="w-3 h-3" />
                  Stadion
                </button>
              </div>

              {/* Locations List with Coordinates */}
              <div className="space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-0.5">
                {filteredPresets.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    Tidak ditemukan lokasi yang cocok dengan kata kunci &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredPresets.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleFlyTo(item.coords)}
                      className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 transition-colors flex items-center justify-between group cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
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
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug truncate">
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
                            <div className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                              {item.badge}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 dark:text-emerald-400 text-xs font-medium ml-2 flex-shrink-0">
                        <span className="text-[11px] font-mono">Buka</span>
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
            <div className="space-y-3.5">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 block mb-0.5">
                  Kolaborator Proyek
                </span>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Studio GIS & Perencanaan Wilayah Kota
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Penyusunan Pemetaan Tematik RTH Aglomerasi Gerbangkertosusila.
                </p>
              </div>

              <div className="space-y-2">
                {TEAM_MEMBERS.map((member, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-medium text-xs">
                        {member.name === 'Unknown' ? '?' : member.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-tight">
                          {member.name}
                        </h5>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{member.role}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      {member.nim}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <ExternalLink className="w-4 h-4 flex-shrink-0 text-slate-500" />
                <span>Terhubung dengan GitHub Repository & Vercel Deployment</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/60 font-mono">
          <span>WebGIS RTH Metropolitan Gerbangkertosusila &copy; 2026</span>
        </div>
      </aside>

      {/* SIDEBAR TOGGLE BUTTON - Clean solid styling with precise spacing */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute top-4 z-30 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all cursor-pointer ${
          isSidebarOpen ? 'left-[400px] md:left-[434px]' : 'left-3.5'
        }`}
        aria-label="Toggle Sidebar"
        title={isSidebarOpen ? 'Sembunyikan Panel Informasi' : 'Buka Panel Informasi'}
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
          selectedRegency={selectedRegency}
          onResetRegency={() => setSelectedRegency('all')}
          onFilteredStatsChange={handleFilteredStatsChange}
        />

        {/* Floating Bottom Telemetry Bar */}
        <div className="absolute bottom-3 left-24 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border border-slate-300 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 shadow-sm pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-sans font-medium text-slate-800 dark:text-slate-200">
            {selectedRegency === 'all' ? 'Kawasan Metropolitan' : selectedRegency}
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
            {regencyStats.totalCount.toLocaleString('id-ID')} Poligon
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500 dark:text-slate-400">
            {regencyStats.totalAreaHa.toLocaleString('id-ID')} Ha
          </span>
        </div>
      </section>
    </main>
  );
}
