'use client';

import React, { useState, useCallback, useMemo } from 'react';
import MapWrapper from '@/components/MapWrapper';
import {
  Info,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Search,
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

// Luas wilayah administrasi resmi (Hektar, BPS Jawa Timur) untuk perhitungan rasio UU 26/2007
const REGENCY_ADMIN_AREA_HA: Record<string, number> = {
  all: 630328,
  'Kota Surabaya': 33528,
  'Kabupaten Sidoarjo': 71424,
  'Kabupaten Gresik': 119125,
  'Kota Mojokerto': 2021,
  'Kabupaten Mojokerto': 96936,
  'Kabupaten Lamongan': 181280,
  'Kabupaten Bangkalan': 126014,
};

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'locations' | 'team'>('overview');
  const [selectedCoord, setSelectedCoord] = useState<[number, number] | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'alun-alun' | 'taman' | 'mangrove' | 'olahraga'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegency, setSelectedRegency] = useState<string>('all');
  const [showRegulationInfo, setShowRegulationInfo] = useState(false);
  const [resetViewTrigger, setResetViewTrigger] = useState(0);

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

  const handleFlyTo = useCallback((coords: [number, number]) => {
    setSelectedCoord([...coords]);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleShowAllPoints = useCallback(() => {
    setSelectedRegency('all');
    setActiveCategoryFilter('all');
    setSearchQuery('');
    setSelectedCoord(null);
    setResetViewTrigger((prev) => prev + 1);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const totalCount = regencyStats.totalCount || 1;
  const pTaman = Math.round((regencyStats.tamanCount / totalCount) * 1000) / 10;
  const pMangrove = Math.round((regencyStats.mangroveCount / totalCount) * 1000) / 10;
  const pOlahraga = Math.round((regencyStats.olahragaCount / totalCount) * 1000) / 10;
  const pPemakaman = Math.round((regencyStats.pemakamanCount / totalCount) * 1000) / 10;

  // Evaluasi dinamis Mandat UU No. 26/2007 (Min. 20% RTH Publik terhadap luas wilayah)
  const adminAreaHa = REGENCY_ADMIN_AREA_HA[selectedRegency] ?? REGENCY_ADMIN_AREA_HA.all;
  const rthRatioPct = Math.round((regencyStats.totalAreaHa / adminAreaHa) * 1000) / 10;
  const meetsMandate = rthRatioPct >= 20;
  const diffPct = Math.round((rthRatioPct - 20) * 10) / 10;
  const progressWidthPct = Math.min(100, Math.max(2, Math.round((rthRatioPct / 30) * 1000) / 10));

  const filteredPresets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return PRESET_LOCATIONS.filter((item) => {
      const matchCategory =
        activeCategoryFilter === 'all' ? true : item.category === activeCategoryFilter;

      const matchSearch =
        query === ''
          ? true
          : item.name.toLowerCase().includes(query) ||
            item.kabKota.toLowerCase().includes(query) ||
            (item.badge && item.badge.toLowerCase().includes(query));

      const matchRegency = matchPresetRegency(item.kabKota, selectedRegency);

      return matchCategory && matchSearch && matchRegency;
    });
  }, [activeCategoryFilter, searchQuery, selectedRegency]);

  return (
    <main className="h-screen w-screen overflow-hidden relative bg-[#f5f5f7] dark:bg-black text-[#1d1d1f] dark:text-[#f5f5f7]">
      {/* FLOATING GLASS INSPECTOR SHEET - Bottom sheet on mobile, floating left sheet on desktop */}
      <aside
        className={`fixed inset-x-3 bottom-3 max-h-[56vh] md:inset-auto md:top-4 md:left-4 md:bottom-4 md:w-[356px] md:max-h-none z-[1100] rounded-[18px] bg-white/80 dark:bg-[#1c1c1e]/82 backdrop-blur-2xl backdrop-saturate-150 border border-black/[0.08] dark:border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden transition-all duration-300 ease-out ${
          isSidebarOpen
            ? 'translate-y-0 md:translate-x-0 opacity-100'
            : 'translate-y-[calc(100%+24px)] md:translate-y-0 md:-translate-x-[calc(100%+24px)] opacity-0 pointer-events-none'
        }`}
      >
        {/* Mobile Sheet Grabber */}
        <div className="pt-2 pb-0.5 flex justify-center md:hidden">
          <span className="w-9 h-1 rounded-full bg-black/15 dark:bg-white/20" />
        </div>

        {/* Clean Apple Maps Sheet Header */}
        <header className="px-4 pt-2 md:pt-4 pb-3.5 border-b border-black/[0.06] dark:border-white/[0.08] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#86868b]">
              WebGIS Gerbangkertosusila
            </span>

            {/* Close button inside sheet */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 -mr-1 rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-colors cursor-pointer"
              aria-label="Tutup Panel"
              title="Sembunyikan Panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug">
              Atlas Ruang Terbuka Hijau
            </h1>
            <p className="text-[12px] text-[#6e6e73] dark:text-[#98989d] leading-snug mt-0.5">
              {selectedRegency === 'all' ? '6 Wilayah Metropolitan Jawa Timur' : selectedRegency}
            </p>
          </div>

          {/* Apple-style Display Hero Stat Pair */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[19px] font-semibold tracking-tight tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {regencyStats.totalAreaHa.toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] font-medium text-[#86868b]">ha</span>
              </div>
              <div className="text-[11px] text-[#6e6e73] dark:text-[#98989d]">
                Luas RTH terpetakan
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[19px] font-semibold tracking-tight tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {regencyStats.totalCount.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] font-mono text-[#86868b]">WGS 84</span>
              </div>
              <div className="text-[11px] text-[#6e6e73] dark:text-[#98989d]">
                Poligon spasial
              </div>
            </div>
          </div>
        </header>

        {/* macOS Pop-up Select for Regency & Segmented Control Tabs */}
        <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.08] space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="regency-select" className="text-[11px] font-medium text-[#86868b]">
                Wilayah Observasi
              </label>
              {selectedRegency !== 'all' && (
                <button
                  onClick={() => setSelectedRegency('all')}
                  className="text-[11px] text-[#007aff] dark:text-[#0a84ff] hover:underline cursor-pointer"
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
                className="w-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.07] dark:hover:bg-white/[0.11] text-[#1d1d1f] dark:text-[#f5f5f7] text-[12px] rounded-[9px] px-2.5 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 font-medium cursor-pointer transition-colors appearance-none"
              >
                <option value="all">Semua Wilayah (3.735 poligon)</option>
                <option value="Kota Surabaya">Kota Surabaya (1.360)</option>
                <option value="Kabupaten Mojokerto">Kabupaten Mojokerto (1.644)</option>
                <option value="Kabupaten Lamongan">Kabupaten Lamongan (321)</option>
                <option value="Kabupaten Sidoarjo">Kabupaten Sidoarjo (280)</option>
                <option value="Kabupaten Gresik">Kabupaten Gresik (61)</option>
                <option value="Kabupaten Bangkalan">Kabupaten Bangkalan (54)</option>
                <option value="Kota Mojokerto">Kota Mojokerto (15)</option>
              </select>
              <ChevronRight className="w-3.5 h-3.5 absolute right-2.5 top-2 rotate-90 text-[#86868b] pointer-events-none" />
            </div>
          </div>

          {/* Apple Segmented Control */}
          <div className="grid grid-cols-3 p-[3px] bg-black/[0.05] dark:bg-white/[0.08] rounded-[9px] text-[12px]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-1 px-2 rounded-[6px] transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white font-medium shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                  : 'text-[#6e6e73] dark:text-[#98989d] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              Ringkasan
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`py-1 px-2 rounded-[6px] transition-all cursor-pointer ${
                activeTab === 'locations'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white font-medium shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                  : 'text-[#6e6e73] dark:text-[#98989d] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              Pintasan ({filteredPresets.length})
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`py-1 px-2 rounded-[6px] transition-all cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white font-medium shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                  : 'text-[#6e6e73] dark:text-[#98989d] hover:text-[#1d1d1f] dark:hover:text-white'
              }`}
            >
              Tim
            </button>
          </div>
        </div>

        {/* Sidebar Content (Scrollable, flat surface with hairline dividers) */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3.5 space-y-4">
          {/* TAB 1: OVERVIEW & SPATIAL ANALYTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* 1. Komposisi Kategori RTH */}
              <section className="space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[12px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Komposisi Kategori
                  </h2>
                  <span className="text-[11px] text-[#86868b]">
                    Proporsi poligon
                  </span>
                </div>

                {/* Slim Stacked Horizontal Bar */}
                <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-black/[0.06] dark:bg-white/[0.1]">
                  <div style={{ width: `${pTaman}%`, backgroundColor: '#2ECC71' }} title={`Taman: ${pTaman}%`} />
                  <div style={{ width: `${pMangrove}%`, backgroundColor: '#1B5E20' }} title={`Mangrove & Hutan: ${pMangrove}%`} />
                  <div style={{ width: `${pOlahraga}%`, backgroundColor: '#FFA502' }} title={`Olahraga: ${pOlahraga}%`} />
                  <div style={{ width: `${pPemakaman}%`, backgroundColor: '#0D9488' }} title={`Pemakaman: ${pPemakaman}%`} />
                </div>

                {/* Clean 2-Line Hairline Rows (no cramped 3-column numbers) */}
                <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] text-[12px]">
                  {/* Taman */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#2ECC71' }} />
                      <div className="min-w-0">
                        <div className="text-[#1d1d1f] dark:text-[#f5f5f7] truncate leading-tight">
                          Taman Kota &amp; Alun-Alun
                        </div>
                        <div className="text-[11px] font-mono text-[#86868b] tabular-nums">
                          {regencyStats.tamanCount.toLocaleString('id-ID')} poligon
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <div className="font-mono text-[12px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tabular-nums">
                        {pTaman}%
                      </div>
                      <div className="text-[10px] font-mono text-[#86868b] tabular-nums">
                        {regencyStats.tamanAreaHa.toLocaleString('id-ID')} ha
                      </div>
                    </div>
                  </div>

                  {/* Mangrove */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#1B5E20' }} />
                      <div className="min-w-0">
                        <div className="text-[#1d1d1f] dark:text-[#f5f5f7] truncate leading-tight">
                          Hutan Kota &amp; Mangrove
                        </div>
                        <div className="text-[11px] font-mono text-[#86868b] tabular-nums">
                          {regencyStats.mangroveCount.toLocaleString('id-ID')} poligon
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <div className="font-mono text-[12px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tabular-nums">
                        {pMangrove}%
                      </div>
                      <div className="text-[10px] font-mono text-[#86868b] tabular-nums">
                        {regencyStats.mangroveAreaHa.toLocaleString('id-ID')} ha
                      </div>
                    </div>
                  </div>

                  {/* Olahraga */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#FFA502' }} />
                      <div className="min-w-0">
                        <div className="text-[#1d1d1f] dark:text-[#f5f5f7] truncate leading-tight">
                          Lapangan Olahraga
                        </div>
                        <div className="text-[11px] font-mono text-[#86868b] tabular-nums">
                          {regencyStats.olahragaCount.toLocaleString('id-ID')} poligon
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <div className="font-mono text-[12px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tabular-nums">
                        {pOlahraga}%
                      </div>
                      <div className="text-[10px] font-mono text-[#86868b] tabular-nums">
                        {regencyStats.olahragaAreaHa.toLocaleString('id-ID')} ha
                      </div>
                    </div>
                  </div>

                  {/* Pemakaman */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#0D9488' }} />
                      <div className="min-w-0">
                        <div className="text-[#1d1d1f] dark:text-[#f5f5f7] truncate leading-tight">
                          RTH Pemakaman
                        </div>
                        <div className="text-[11px] font-mono text-[#86868b] tabular-nums">
                          {regencyStats.pemakamanCount.toLocaleString('id-ID')} poligon
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <div className="font-mono text-[12px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tabular-nums">
                        {pPemakaman}%
                      </div>
                      <div className="text-[10px] font-mono text-[#86868b] tabular-nums">
                        {regencyStats.pemakamanAreaHa.toLocaleString('id-ID')} ha
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-black/[0.06] dark:border-white/[0.08]" />

              {/* 2. Mandat UU 26/2007 (Dinamis per Kota/Kabupaten) */}
              <section className="space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      Mandat UU 26/2007
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowRegulationInfo(!showRegulationInfo)}
                      className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white transition-colors cursor-pointer"
                      title={showRegulationInfo ? 'Tutup info regulasi' : 'Buka detail regulasi'}
                      aria-label="Info regulasi"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      meetsMandate
                        ? 'text-[#248a3d] dark:text-[#30d158]'
                        : 'text-[#c93400] dark:text-[#ff9f0a]'
                    }`}
                  >
                    {meetsMandate ? 'Memenuhi (\u2265 20%)' : 'Belum Memenuhi (< 20%)'}
                  </span>
                </div>

                {showRegulationInfo && (
                  <div className="p-2.5 rounded-[10px] bg-black/[0.04] dark:bg-white/[0.06] text-[11px] text-[#6e6e73] dark:text-[#98989d] leading-relaxed">
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                        Dasar Regulasi &amp; Rumus
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowRegulationInfo(false)}
                        className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white text-xs px-1 cursor-pointer"
                        title="Tutup"
                      >
                        ✕
                      </button>
                    </div>
                    <p>
                      Pasal 29 UU 26/2007 &amp; Permen ATR/BPN 14/2022 mewajibkan RTH publik minimal 20% per wilayah kota/kawasan perkotaan. Rasio dihitung dinamis dari luas RTH terpetakan ({regencyStats.totalAreaHa.toLocaleString('id-ID')} ha) dibagi luas administrasi BPS ({adminAreaHa.toLocaleString('id-ID')} ha).
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#6e6e73] dark:text-[#98989d]">
                      Rasio {selectedRegency === 'all' ? 'Agregat' : 'Wilayah'}
                    </span>
                    <span className="font-mono font-medium text-[#1d1d1f] dark:text-[#f5f5f7] tabular-nums">
                      {rthRatioPct.toLocaleString('id-ID')}%{' '}
                      <span className="font-normal text-[#86868b]">
                        ({diffPct >= 0 ? `+${diffPct.toLocaleString('id-ID')}%` : `${diffPct.toLocaleString('id-ID')}%`} dari 20%)
                      </span>
                    </span>
                  </div>
                  <div className="relative w-full h-1.5 bg-black/[0.06] dark:bg-white/[0.1] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        meetsMandate
                          ? 'bg-[#248a3d] dark:bg-[#30d158]'
                          : 'bg-[#1d1d1f] dark:bg-[#f5f5f7]'
                      }`}
                      style={{ width: `${progressWidthPct}%` }}
                    />
                    <div className="absolute top-0 bottom-0 left-[66.6%] w-0.5 bg-[#ff3b30]" title="Ambang Batas Minimum 20%" />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[#86868b]">
                    <span>0%</span>
                    <span className="text-[#6e6e73] dark:text-[#98989d]">Min. 20%</span>
                    <span>30% Target</span>
                  </div>
                </div>
              </section>

              <hr className="border-black/[0.06] dark:border-white/[0.08]" />

              {/* 3. Sebaran Wilayah Metropolitan */}
              <section className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[12px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    Sebaran Wilayah
                  </h2>
                  <span className="text-[11px] text-[#86868b]">
                    Klik untuk fokus
                  </span>
                </div>

                <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] text-[12px]">
                  {METRO_DISTRIBUTION.map((reg) => {
                    const isSelected = selectedRegency === reg.id;
                    return (
                      <button
                        key={reg.id}
                        onClick={() => setSelectedRegency(reg.id)}
                        className={`w-full flex items-center justify-between py-2 px-1.5 -mx-1.5 rounded-[6px] text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-black/[0.05] dark:bg-white/[0.08] font-medium'
                            : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                isSelected ? 'bg-[#007aff] dark:bg-[#0a84ff]' : 'bg-black/20 dark:bg-white/25'
                              }`}
                            />
                            <span className="text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                              {reg.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#86868b] block pl-3.5 truncate">
                            {reg.note}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] text-[#6e6e73] dark:text-[#98989d] flex-shrink-0">
                          <span className="tabular-nums">{reg.count.toLocaleString('id-ID')}</span>
                          <span className="tabular-nums text-[#86868b]">({reg.share})</span>
                          <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#007aff] dark:text-[#0a84ff]' : 'text-[#86868b]'}`} />
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
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-[12px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Direktori Landmark
                </h3>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleShowAllPoints}
                    className="text-[11px] font-medium text-[#007aff] dark:text-[#0a84ff] hover:underline cursor-pointer"
                  >
                    Lihat semua titik
                  </button>
                  <span className="text-[11px] font-mono text-[#86868b] tabular-nums">
                    {filteredPresets.length} / {PRESET_LOCATIONS.length} lokasi
                  </span>
                </div>
              </div>

              {/* Apple Spotlight-style Search Input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#86868b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari taman, stadion, kawasan..."
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] bg-black/[0.05] dark:bg-white/[0.08] rounded-[8px] focus:bg-white dark:focus:bg-[#2c2c2e] focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-2 text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white cursor-pointer"
                    aria-label="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Compact Category Filters */}
              <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
                <button
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-2.5 py-1 rounded-[6px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategoryFilter === 'all'
                      ? 'bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]'
                      : 'bg-black/[0.04] text-[#6e6e73] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-[#98989d]'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('alun-alun')}
                  className={`px-2.5 py-1 rounded-[6px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategoryFilter === 'alun-alun'
                      ? 'bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]'
                      : 'bg-black/[0.04] text-[#6e6e73] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-[#98989d]'
                  }`}
                >
                  Alun-alun
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('taman')}
                  className={`px-2.5 py-1 rounded-[6px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategoryFilter === 'taman'
                      ? 'bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]'
                      : 'bg-black/[0.04] text-[#6e6e73] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-[#98989d]'
                  }`}
                >
                  Taman kota
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('mangrove')}
                  className={`px-2.5 py-1 rounded-[6px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategoryFilter === 'mangrove'
                      ? 'bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]'
                      : 'bg-black/[0.04] text-[#6e6e73] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-[#98989d]'
                  }`}
                >
                  Mangrove
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('olahraga')}
                  className={`px-2.5 py-1 rounded-[6px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeCategoryFilter === 'olahraga'
                      ? 'bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]'
                      : 'bg-black/[0.04] text-[#6e6e73] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-[#98989d]'
                  }`}
                >
                  Stadion
                </button>
              </div>

              {/* Flat Hairline-Separated Locations List */}
              <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] max-h-[calc(100vh-340px)] overflow-y-auto pr-0.5">
                {filteredPresets.length === 0 ? (
                  <div className="py-6 text-center text-[12px] text-[#86868b]">
                    Tidak ada lokasi yang cocok dengan &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  filteredPresets.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleFlyTo(item.coords)}
                      className="w-full text-left py-2.5 px-1.5 -mx-1.5 rounded-[6px] hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
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
                          <h4 className="text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-snug truncate">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#6e6e73] dark:text-[#98989d]">
                            <span>{item.kabKota}</span>
                            <span className="text-[#86868b]">&middot;</span>
                            <span className="font-mono text-[10px] text-[#86868b]">
                              {item.coords[0].toFixed(4)}°, {item.coords[1].toFixed(4)}°
                            </span>
                          </div>
                          {item.badge && (
                            <div className="mt-0.5 text-[10px] text-[#86868b] truncate">
                              {item.badge}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#86868b] opacity-0 group-hover:opacity-100 group-hover:text-[#007aff] dark:group-hover:text-[#0a84ff] transition-all ml-2 flex-shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TIM PELAKSANA */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] text-[#86868b] block">
                  Kolaborator Proyek
                </span>
                <h4 className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Studio GIS &amp; Perencanaan Wilayah Kota
                </h4>
                <p className="text-[12px] text-[#6e6e73] dark:text-[#98989d] leading-relaxed">
                  Penyusunan Pemetaan Tematik RTH Aglomerasi Gerbangkertosusila.
                </p>
              </div>

              <hr className="border-black/[0.06] dark:border-white/[0.08]" />

              <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                {TEAM_MEMBERS.map((member, idx) => (
                  <div
                    key={idx}
                    className="py-2.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] flex items-center justify-center font-medium text-[11px]">
                        {member.name === 'Unknown' ? '?' : member.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">
                          {member.name}
                        </h5>
                        <span className="text-[11px] text-[#86868b] block">{member.role}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#6e6e73] dark:text-[#98989d]">
                      {member.nim}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-black/[0.06] dark:border-white/[0.08]" />

              <div className="text-[11px] text-[#86868b] flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Terhubung dengan GitHub Repository &amp; Vercel</span>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="px-4 py-2.5 border-t border-black/[0.06] dark:border-white/[0.08] text-center text-[10px] text-[#86868b] font-mono">
          <span>WebGIS RTH Gerbangkertosusila &copy; 2026</span>
        </div>
      </aside>

      {/* SIDEBAR TOGGLE BUTTON - Apple Maps HUD style when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-[1000] p-2 rounded-[10px] bg-white/85 dark:bg-[#1c1c1e]/85 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-white dark:hover:bg-[#2c2c2e] transition-colors cursor-pointer"
          aria-label="Buka Sidebar"
          title="Buka Panel Informasi"
        >
          <Menu className="w-4 h-4" />
        </button>
      )}

      {/* FULL-BLEED MAP VIEW CONTAINER */}
      <section className="absolute inset-0 h-full w-full z-0 overflow-hidden bg-[#f5f5f7] dark:bg-[#000000]">
        <MapWrapper
          flyToCoord={selectedCoord}
          selectedRegency={selectedRegency}
          onFilteredStatsChange={handleFilteredStatsChange}
          isSidebarOpen={isSidebarOpen}
          resetViewTrigger={resetViewTrigger}
          onResetAll={handleShowAllPoints}
        />
      </section>
    </main>
  );
}
