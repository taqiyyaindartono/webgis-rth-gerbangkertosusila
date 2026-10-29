'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
  ScaleControl,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoJsonObject, Feature } from 'geojson';

// Fix Leaflet default marker icons issue in Next.js bundler
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

// Coordinate Center: Surabaya / Metropolitan Gerbangkertosusila
const DEFAULT_CENTER: [number, number] = [-7.265, 112.745];
const DEFAULT_ZOOM = 12;

// Thematic Style Constants based on Requirements
const THEMATIC_STYLES = {
  taman: {
    fillColor: '#2ECC71', // Lime / Hijau Cerah
    color: '#333333',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.65,
    label: 'Taman Kota & Alun-Alun',
  },
  mangrove: {
    fillColor: '#1B5E20', // Forest Green / Hijau Tua
    color: '#333333',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.65,
    label: 'Hutan Kota & Mangrove',
  },
  olahraga: {
    fillColor: '#FFA502', // Oranye / Kuning Kehijauan
    color: '#333333',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.65,
    label: 'Lapangan Olahraga',
  },
  hover: {
    weight: 2.5,
    color: '#ffffff',
    fillOpacity: 0.85,
  },
};

// Helper to calculate approximate polygon area in Hectares
function calculateFeatureAreaHa(feat: Feature): number {
  if (typeof feat.properties?.luas_ha === 'number' && feat.properties.luas_ha > 0) {
    return feat.properties.luas_ha;
  }
  if (!feat.geometry) return 0;

  const latFactor = 111000;
  const lngFactor = 110110;

  const getRingArea = (ring: number[][]) => {
    if (!ring || ring.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < ring.length - 1; i++) {
      const x1 = ring[i][0] * lngFactor;
      const y1 = ring[i][1] * latFactor;
      const x2 = ring[i + 1][0] * lngFactor;
      const y2 = ring[i + 1][1] * latFactor;
      area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area) / 2 / 10000; // Ha
  };

  let totalHa = 0;
  if (feat.geometry.type === 'Polygon') {
    totalHa += getRingArea(feat.geometry.coordinates[0]);
  } else if (feat.geometry.type === 'MultiPolygon') {
    feat.geometry.coordinates.forEach((poly) => {
      totalHa += getRingArea(poly[0]);
    });
  }
  return Math.round(totalHa * 100) / 100;
}

// Map resizer to ensure tiles immediately appear without blank/grey areas
function MapAutoResizer() {
  const map = useMap();

  useEffect(() => {
    // Initial size invalidation
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);

    const container = map.getContainer();
    if (typeof ResizeObserver !== 'undefined' && container) {
      const ro = new ResizeObserver(() => {
        map.invalidateSize();
      });
      ro.observe(container);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        ro.disconnect();
      };
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  return null;
}

// Map controller helper to handle programmatic fly-to
function MapFlyToHandler({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(target, 15, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

// Quick Reset Center Control button
function MapResetControl() {
  const map = useMap();
  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: '80px', pointerEvents: 'auto' }}>
      <div className="leaflet-control leaflet-bar shadow-md">
        <button
          onClick={() => map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1 })}
          title="Pusatkan Peta ke Gerbangkertosusila"
          className="w-8 h-8 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export interface LeafletMapProps {
  onFeatureSelect?: (properties: Record<string, unknown>) => void;
  flyToCoord?: [number, number] | null;
  onDataLoaded?: (data: {
    tamanCount: number;
    mangroveCount: number;
    olahragaCount: number;
    totalAreaHa: number;
  }) => void;
}

export default function LeafletMap({
  onFeatureSelect,
  flyToCoord = null,
  onDataLoaded,
}: LeafletMapProps) {
  const [tamanData, setTamanData] = useState<GeoJsonObject | null>(null);
  const [mangroveData, setMangroveData] = useState<GeoJsonObject | null>(null);
  const [olahragaData, setOlahragaData] = useState<GeoJsonObject | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch GeoJSON datasets asynchronously
  useEffect(() => {
    let isMounted = true;

    async function loadAllGeoJson() {
      try {
        const [resTaman, resMangrove, resOlahraga] = await Promise.all([
          fetch('/data/taman_kota.geojson'),
          fetch('/data/hutan_mangrove.geojson'),
          fetch('/data/lapangan_olahraga.geojson'),
        ]);

        if (!resTaman.ok || !resMangrove.ok || !resOlahraga.ok) {
          throw new Error('Gagal mengambil satu atau beberapa data spasial GeoJSON');
        }

        const dataTaman = await resTaman.json();
        const dataMangrove = await resMangrove.json();
        const dataOlahraga = await resOlahraga.json();

        if (isMounted) {
          setTamanData(dataTaman);
          setMangroveData(dataMangrove);
          setOlahragaData(dataOlahraga);

          // Calculate statistics for sidebar indicators
          if (onDataLoaded) {
            const getFeatures = (geo: { features?: Feature[] }) => geo?.features || [];
            const tamanFeats = getFeatures(dataTaman);
            const mangroveFeats = getFeatures(dataMangrove);
            const olahragaFeats = getFeatures(dataOlahraga);

            const calculateTotalArea = (feats: Feature[]) =>
              feats.reduce((acc, f) => acc + calculateFeatureAreaHa(f), 0);

            const totalHa =
              calculateTotalArea(tamanFeats) +
              calculateTotalArea(mangroveFeats) +
              calculateTotalArea(olahragaFeats);

            onDataLoaded({
              tamanCount: tamanFeats.length,
              mangroveCount: mangroveFeats.length,
              olahragaCount: olahragaFeats.length,
              totalAreaHa: Math.round(totalHa * 10) / 10,
            });
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Error fetching GeoJSON:', err);
          setFetchError(err instanceof Error ? err.message : 'Gagal memuat data GeoJSON');
        }
      }
    }

    loadAllGeoJson();

    return () => {
      isMounted = false;
    };
  }, [onDataLoaded]);

  // Create popup HTML with modern responsive card structure and intelligent property fallback
  const createPopupContent = useCallback(
    (
      props: Record<string, unknown>,
      theme: { fillColor: string; label: string },
      areaHa: number
    ) => {
      const rawName =
        (props.name as string) ||
        (props.short_name as string) ||
        (props.alt_name as string) ||
        (props['name:id'] as string) ||
        (props['name:en'] as string);

      // Intelligent fallback name if OSM name is null
      let name = rawName;
      if (!name) {
        if (props.leisure) {
          const l = String(props.leisure).replace(/_/g, ' ');
          name = `Area ${l.charAt(0).toUpperCase() + l.slice(1)}`;
        } else if (props.natural) {
          const n = String(props.natural).replace(/_/g, ' ');
          name = `Kawasan ${n.charAt(0).toUpperCase() + n.slice(1)}`;
        } else if (props.landuse) {
          const lu = String(props.landuse).replace(/_/g, ' ');
          name = `Zona ${lu.charAt(0).toUpperCase() + lu.slice(1)}`;
        } else {
          name = `${theme.label}`;
        }
      }

      const kategori = (props.kategori as string) || theme.label;

      // Extract and compile present OSM tags
      const osmTags: string[] = [];
      if (props.leisure) osmTags.push(`leisure=${props.leisure}`);
      if (props.landuse) osmTags.push(`landuse=${props.landuse}`);
      if (props.natural) osmTags.push(`natural=${props.natural}`);
      if (props.sport) osmTags.push(`sport=${props.sport}`);
      if (props.wetland) osmTags.push(`wetland=${props.wetland}`);
      if (props.wood) osmTags.push(`wood=${props.wood}`);
      const osmTag =
        osmTags.length > 0
          ? osmTags.join(', ')
          : (props.osm_tag as string) || `osm_id=${props.osm_id || props.full_id || '-'}`;

      const kabKota =
        (props.kab_kota as string) ||
        (props['addr:city'] as string) ||
        (props['addr:district'] as string) ||
        'Gerbangkertosusila';

      const kecamatan =
        (props.kecamatan as string) ||
        (props['addr:subdistrict'] as string) ||
        (props['addr:street'] as string) ||
        '-';

      const displayLuas = areaHa > 0 ? `${areaHa} Ha` : '-';
      const status = (props.status as string) || (props.access ? `Akses: ${props.access}` : 'Publik / Terbuka');
      const pengelola =
        (props.pengelola as string) ||
        (props.operator as string) ||
        (props['operator:type'] as string) ||
        'Pemerintah Daerah / Pengelola';

      let fasilitas = (props.fasilitas as string) || '';
      if (!fasilitas) {
        const details: string[] = [];
        if (props.sport) details.push(`Fasilitas: ${props.sport}`);
        if (props.surface) details.push(`Permukaan: ${props.surface}`);
        if (props.description) details.push(String(props.description));
        fasilitas = details.length > 0 ? details.join(', ') : 'Ruang Terbuka Hijau Publik';
      }

      return `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 250px; max-width: 330px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${theme.fillColor}; display: inline-block; box-shadow: 0 0 4px ${theme.fillColor};"></span>
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #4b5563;">${kategori}</span>
            </div>
            <span style="font-size: 9px; padding: 2px 6px; border-radius: 9999px; background: #f3f4f6; color: #374151; font-weight: 600;">${kabKota}</span>
          </div>

          <h3 style="font-size: 15px; font-weight: 700; color: #111827; margin: 0 0 8px 0; line-height: 1.3;">${name}</h3>

          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #4b5563; border-top: 1px solid #e5e7eb; padding-top: 8px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Kecamatan / Lokasi:</span>
              <span style="font-weight: 600; color: #1f2937; text-align: right; max-width: 170px;">${kecamatan}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Estimasi Luas:</span>
              <span style="font-weight: 700; color: #047857;">${displayLuas}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Status / Akses:</span>
              <span style="font-weight: 500; color: #1f2937;">${status}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Pengelola:</span>
              <span style="font-weight: 500; color: #1f2937; text-align: right; max-width: 170px;">${pengelola}</span>
            </div>
            <div style="margin-top: 4px; padding-top: 6px; border-top: 1px dashed #e5e7eb;">
              <span style="color: #6b7280; display: block; margin-bottom: 2px;">Keterangan / Fasilitas:</span>
              <span style="font-size: 10.5px; color: #374151; line-height: 1.3;">${fasilitas}</span>
            </div>
            <div style="margin-top: 4px; padding-top: 4px;">
              <span style="color: #9ca3af; font-size: 9.5px; display: block;">OSM Tag:</span>
              <code style="display: inline-block; background-color: #f3f4f6; padding: 2px 5px; border-radius: 4px; font-size: 9px; color: #1f2937; margin-top: 2px; word-break: break-all;">${osmTag}</code>
            </div>
          </div>
        </div>
      `;
    },
    []
  );

  // Common feature interaction setup
  const bindFeatureEvents = useCallback(
    (
      feature: Feature,
      layer: L.Layer,
      defaultStyle: {
        fillColor: string;
        color: string;
        weight: number;
        opacity: number;
        fillOpacity: number;
        label: string;
      }
    ) => {
      const props = (feature.properties || {}) as Record<string, unknown>;
      const areaHa = calculateFeatureAreaHa(feature);

      // Popup binding
      const popupHtml = createPopupContent(props, defaultStyle, areaHa);
      layer.bindPopup(popupHtml, {
        maxWidth: 340,
        className: 'custom-leaflet-popup',
      });

      // Interactive hover effects
      layer.on({
        mouseover: (e: L.LeafletMouseEvent) => {
          const targetLayer = e.target as L.Path;
          targetLayer.setStyle({
            weight: THEMATIC_STYLES.hover.weight,
            color: THEMATIC_STYLES.hover.color,
            fillOpacity: THEMATIC_STYLES.hover.fillOpacity,
          });
          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            targetLayer.bringToFront();
          }
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          const targetLayer = e.target as L.Path;
          targetLayer.setStyle({
            fillColor: defaultStyle.fillColor,
            color: defaultStyle.color,
            weight: defaultStyle.weight,
            opacity: defaultStyle.opacity,
            fillOpacity: defaultStyle.fillOpacity,
          });
        },
        click: () => {
          if (onFeatureSelect) {
            onFeatureSelect(props);
          }
        },
      });
    },
    [createPopupContent, onFeatureSelect]
  );

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Map notification / error indicator */}
      {fetchError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-600/90 text-white text-xs px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm">
          Perhatian: {fetchError}
        </div>
      )}

      {/* Leaflet MapContainer with preferCanvas for rendering 3,800+ MultiPolygons smoothly */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        preferCanvas={true}
        scrollWheelZoom={true}
        className="w-full h-full z-0 outline-none"
        style={{ width: '100%', height: '100%' }}
      >
        <MapAutoResizer />
        <MapFlyToHandler target={flyToCoord} />
        <MapResetControl />
        <ScaleControl position="bottomleft" imperial={false} />

        {/* 3 Basemaps & Overlays Layer Control */}
        <LayersControl position="topright" collapsed={false}>
          {/* Basemap 1: OpenStreetMap Standard (Default - Langsung Muncul Bersih & Cepat Tanpa API Key) */}
          <LayersControl.BaseLayer checked name="OpenStreetMap Standard (Default)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* Basemap 2: Esri World Imagery (Satellite) */}
          <LayersControl.BaseLayer name="Esri World Imagery (Satelit)">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          {/* Basemap 3: CartoDB Positron */}
          <LayersControl.BaseLayer name="CartoDB Positron (Terang)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          {/* Overlay 1: Taman Kota & Alun-Alun */}
          <LayersControl.Overlay checked name="Taman Kota & Alun-Alun">
            {tamanData ? (
              <GeoJSON
                key="layer-taman"
                data={tamanData}
                style={() => ({
                  fillColor: THEMATIC_STYLES.taman.fillColor,
                  color: THEMATIC_STYLES.taman.color,
                  weight: THEMATIC_STYLES.taman.weight,
                  opacity: THEMATIC_STYLES.taman.opacity,
                  fillOpacity: THEMATIC_STYLES.taman.fillOpacity,
                })}
                onEachFeature={(feat, layer) =>
                  bindFeatureEvents(feat, layer, THEMATIC_STYLES.taman)
                }
              />
            ) : null}
          </LayersControl.Overlay>

          {/* Overlay 2: Hutan Kota & Mangrove */}
          <LayersControl.Overlay checked name="Hutan Kota & Mangrove">
            {mangroveData ? (
              <GeoJSON
                key="layer-mangrove"
                data={mangroveData}
                style={() => ({
                  fillColor: THEMATIC_STYLES.mangrove.fillColor,
                  color: THEMATIC_STYLES.mangrove.color,
                  weight: THEMATIC_STYLES.mangrove.weight,
                  opacity: THEMATIC_STYLES.mangrove.opacity,
                  fillOpacity: THEMATIC_STYLES.mangrove.fillOpacity,
                })}
                onEachFeature={(feat, layer) =>
                  bindFeatureEvents(feat, layer, THEMATIC_STYLES.mangrove)
                }
              />
            ) : null}
          </LayersControl.Overlay>

          {/* Overlay 3: Lapangan Olahraga */}
          <LayersControl.Overlay checked name="Lapangan Olahraga">
            {olahragaData ? (
              <GeoJSON
                key="layer-olahraga"
                data={olahragaData}
                style={() => ({
                  fillColor: THEMATIC_STYLES.olahraga.fillColor,
                  color: THEMATIC_STYLES.olahraga.color,
                  weight: THEMATIC_STYLES.olahraga.weight,
                  opacity: THEMATIC_STYLES.olahraga.opacity,
                  fillOpacity: THEMATIC_STYLES.olahraga.fillOpacity,
                })}
                onEachFeature={(feat, layer) =>
                  bindFeatureEvents(feat, layer, THEMATIC_STYLES.olahraga)
                }
              />
            ) : null}
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>

      {/* Map Legend Overlay Component */}
      <div className="absolute bottom-6 right-6 z-[900] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-gray-200/80 dark:border-gray-800 pointer-events-auto transition-all max-w-[260px]">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200/60 dark:border-gray-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Legenda Tematik RTH
          </span>
          <span className="text-[10px] text-gray-500 font-mono">Permen ATR 14/2022</span>
        </div>

        <div className="space-y-2 text-xs">
          {/* Taman Kota */}
          <div className="flex items-center gap-2.5 group cursor-default">
            <div
              className="w-5 h-4 rounded border border-gray-700 shadow-xs flex-shrink-0 transition-transform group-hover:scale-110"
              style={{ backgroundColor: THEMATIC_STYLES.taman.fillColor, opacity: 0.85 }}
            />
            <div className="flex flex-col">
              <span className="text-gray-800 dark:text-gray-200 font-medium leading-none">
                {THEMATIC_STYLES.taman.label}
              </span>
              <span className="text-[10px] text-gray-600 dark:text-gray-300">Taman aktif & alun-alun publik</span>
            </div>
          </div>

          {/* Hutan Mangrove */}
          <div className="flex items-center gap-2.5 group cursor-default">
            <div
              className="w-5 h-4 rounded border border-gray-700 shadow-xs flex-shrink-0 transition-transform group-hover:scale-110"
              style={{ backgroundColor: THEMATIC_STYLES.mangrove.fillColor, opacity: 0.85 }}
            />
            <div className="flex flex-col">
              <span className="text-gray-800 dark:text-gray-200 font-medium leading-none">
                {THEMATIC_STYLES.mangrove.label}
              </span>
              <span className="text-[10px] text-gray-600 dark:text-gray-300">Sabuk hijau & konservasi pesisir</span>
            </div>
          </div>

          {/* Lapangan Olahraga */}
          <div className="flex items-center gap-2.5 group cursor-default">
            <div
              className="w-5 h-4 rounded border border-gray-700 shadow-xs flex-shrink-0 transition-transform group-hover:scale-110"
              style={{ backgroundColor: THEMATIC_STYLES.olahraga.fillColor, opacity: 0.85 }}
            />
            <div className="flex flex-col">
              <span className="text-gray-800 dark:text-gray-200 font-medium leading-none">
                {THEMATIC_STYLES.olahraga.label}
              </span>
              <span className="text-[10px] text-gray-600 dark:text-gray-300">Stadion, sirkuit & lapangan publik</span>
            </div>
          </div>
        </div>

        {/* Interaction hint */}
        <div className="mt-2.5 pt-2 border-t border-gray-200/60 dark:border-gray-800 text-[10px] text-gray-600 dark:text-gray-300 flex items-center justify-between">
          <span>* Sorot (hover) poligon untuk detail</span>
          <span>Klik: Info</span>
        </div>
      </div>
    </div>
  );
}
