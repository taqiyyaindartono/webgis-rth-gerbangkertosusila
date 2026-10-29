# WebGIS RTH Gerbangkertosusila 🌿🗺️

Sistem Informasi Geografis berbasis Web interaktif untuk **Pemetaan Tematik Ruang Terbuka Hijau (RTH)** di kawasan metropolitan **Gerbangkertosusila** (Gresik, Bangkalan, Mojokerto, Surabaya, Sidoarjo, Lamongan).

Dibangun menggunakan stack modern: **Next.js (App Router)**, **Tailwind CSS**, **Leaflet.js**, dan **React Leaflet**.

---

## 🌟 Fitur Utama

1. **Peta Interaktif Full-Height Tanpa SSR Error:**
   - Diintegrasikan menggunakan `next/dynamic` dengan opsi `{ ssr: false }` di [MapWrapper.tsx](file:///d:/gituhubripo/webgis-rth-gerbangkertosusila/src/components/MapWrapper.tsx).
   - Dilengkapi fallback skeleton loader animasi saat modul client diinisialisasi.
   - Menggunakan konfigurasi *Leaflet marker icon fix* untuk mencegah issue missing marker icon.

2. **3 Pilihan Basemap (Layer Control):**
   - **CartoDB Positron** (Default - terang & kontras tinggi)
   - **OpenStreetMap Standard**
   - **Esri World Imagery** (Citra Satelit Beresolusi Tinggi)

3. **Data Spasial Tematik GeoJSON Terbuka:**
   - `public/data/taman_kota.geojson`: Taman aktif publik & Alun-Alun (Surabaya, Gresik, Sidoarjo).
   - `public/data/hutan_mangrove.geojson`: Kawasan sabuk hijau pesisir & Kebun Raya Mangrove (Wonorejo, Gunung Anyar, Sedati).
   - `public/data/lapangan_olahraga.geojson`: Stadion & kompleks olahraga publik (GBT, Gelora 10 Nopember, Gelora Delta, dkk.).

4. **Klasifikasi Pewarnaan Tematik & Interaktivitas:**
   - **Taman Kota & Alun-Alun:** Fill `#2ECC71` (Lime/Hijau Cerah), stroke `#333333` 1px, opacity 0.65.
   - **Hutan Kota & Mangrove:** Fill `#1B5E20` (Forest Green/Hijau Tua), stroke `#333333` 1px, opacity 0.65.
   - **Lapangan Olahraga:** Fill `#FFA502` (Oranye/Kuning Kehijauan), stroke `#333333` 1px, opacity 0.65.
   - **Hover Effect:** Outline berubah putih tebal `#ffffff` 2.5px dengan fillOpacity meningkat menjadi 0.85.
   - **Popup Informatif:** Menampilkan nama objek, kategori RTH, kabupaten/kota, kecamatan, estimasi luas hektar, pengelola, fasilitas, dan tag OpenStreetMap (`osm_tag`).

5. **Sidebar Responsif & Indikator UU 26/2007:**
   - Ringkasan statistik waktu-nyata (jumlah area, total luas dalam Hektar).
   - Indikator target 20% RTH Publik sesuai amanat UU Penataan Ruang.
   - Pintasan navigasi cepat (*interactive fly-to*) ke titik-titik ikonik metropolitan.
   - Profil kelompok pelaksana studio GIS & perencanaan wilayah.

---

## 📁 Struktur Direktori Proyek

```
webgis-rth-gerbangkertosusila/
├── public/
│   └── data/
│       ├── taman_kota.geojson         # Data poligon GeoJSON Taman Kota & Alun-alun
│       ├── hutan_mangrove.geojson     # Data poligon GeoJSON Hutan Kota & Mangrove
│       └── lapangan_olahraga.geojson  # Data poligon GeoJSON Lapangan & Stadion
├── src/
│   ├── app/
│   │   ├── globals.css                # Styling global, Tailwind, & Leaflet theme
│   │   ├── layout.tsx                 # Root layout & Metadata SEO
│   │   └── page.tsx                   # Layout utama responsif & sidebar navigasi
│   └── components/
│       ├── LeafletMap.tsx             # Komponen Leaflet client ('use client')
│       └── MapWrapper.tsx             # Loader dynamic import (ssr: false)
├── package.json
└── README.md
```

---

## 🚀 Menjalankan Secara Lokal

1. **Clone repository & install dependencies:**
   ```bash
   git clone https://github.com/taqiyyaindartono/webgis-rth-gerbangkertosusila.git
   cd webgis-rth-gerbangkertosusila
   npm install
   ```

2. **Jalankan server pengembangan:**
   ```bash
   npm run dev
   ```
   Buka browser di [http://localhost:3000](http://localhost:3000).

3. **Uji build produksi (Vercel Ready):**
   ```bash
   npm run build
   ```

---

## 🌐 Deployment ke Vercel

Repository ini telah dikonfigurasi agar siap langsung di-*deploy* ke Vercel:
1. Hubungkan repository GitHub ini di dashboard [Vercel](https://vercel.com).
2. Framework Preset akan otomatis terdeteksi sebagai **Next.js**.
3. Klik **Deploy** tanpa perlu mengubah pengaturan build command (`npm run build`).
