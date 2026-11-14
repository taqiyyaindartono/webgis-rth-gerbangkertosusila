'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ScaleControl,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import type { GeoJsonObject, Feature } from 'geojson';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Maximize2,
} from 'lucide-react';

// Bounding box strictly limiting the map to Gerbangkertosusila
// (Gresik, Bangkalan, Mojokerto, Surabaya, Sidoarjo, Lamongan + Bawean)
const GERBANGKERTOSUSILA_BOUNDS: L.LatLngBoundsExpression = [
  [-7.85, 112.02], // Barat Daya (Selatan Mojokerto & Barat Lamongan)
  [-5.75, 113.20], // Timur Laut (Utara Bawean Gresik & Timur Bangkalan)
];

const DEFAULT_CENTER: [number, number] = [-7.28, 112.72];
const DEFAULT_ZOOM = 11;
const MIN_ZOOM = 9;
const MAX_ZOOM = 18;

// Thematic Style Constants - matching the previous colors + cemetery
const THEMATIC_STYLES = {
  taman: {
    fillColor: '#2ECC71', // Lime / Hijau Cerah (Taman Kota, Alun-Alun, Meadow)
    color: '#333333',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.65,
    label: 'Taman Kota & Alun-Alun',
  },
  mangrove: {
    fillColor: '#1B5E20', // Forest Green / Hijau Tua (Hutan Lindung & Mangrove)
    color: '#333333',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.65,
    label: 'Hutan Kota & Mangrove',
  },
  olahraga: {
    fillColor: '#FFA502', // Oranye / Kuning Kehijauan (Lapangan Olahraga & Rekreasi)
    color: '#333333',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.65,
    label: 'Lapangan Olahraga & Rekreasi',
  },
  pemakaman: {
    fillColor: '#0D9488', // Teal / Pirus (RTH Pemakaman Publik)
    color: '#333333',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.65,
    label: 'RTH Pemakaman',
  },
  hover: {
    weight: 2.5,
    color: '#ffffff',
    fillOpacity: 0.85,
  },
};

// Helper to determine Regency / City based on coordinates
function detectKabupatenKota(coords: number[][][] | number[][][][]): string {
  try {
    const flat = coords.flat(Infinity) as number[];
    if (flat.length < 2) return 'Gerbangkertosusila';
    let sumLng = 0, sumLat = 0, count = 0;
    for (let i = 0; i < flat.length; i += 2) {
      sumLng += flat[i];
      sumLat += flat[i + 1];
      count++;
    }
    const lng = sumLng / count;
    const lat = sumLat / count;

    if (lat > -6.0) return 'Kabupaten Gresik (Kep. Bawean)';
    if (lng >= 112.68 && lat >= -7.20 && lat <= -6.85) return 'Kabupaten Bangkalan';
    if (lat >= -7.36 && lat <= -7.18 && lng >= 112.60 && lng <= 112.85) return 'Kota Surabaya';
    if (lat < -7.34 && lat >= -7.60 && lng >= 112.53 && lng <= 112.88) return 'Kabupaten Sidoarjo';
    if (lat < -7.35 && lng < 112.63) {
      if (lat >= -7.49 && lat <= -7.45 && lng >= 112.41 && lng <= 112.46) return 'Kota Mojokerto';
      return 'Kabupaten Mojokerto';
    }
    if (lng <= 112.52) return 'Kabupaten Lamongan';
    return 'Kabupaten Gresik';
  } catch {
    return 'Gerbangkertosusila';
  }
}

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

// Regency / City coordinate and zoom viewpoints
export const REGENCY_VIEW_CONFIG: Record<
  string,
  { label: string; center: [number, number]; zoom: number }
> = {
  all: {
    label: 'Semua Wilayah Gerbangkertosusila',
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
  },
  'Kota Surabaya': {
    label: 'Kota Surabaya',
    center: [-7.265, 112.74],
    zoom: 12,
  },
  'Kabupaten Sidoarjo': {
    label: 'Kabupaten Sidoarjo',
    center: [-7.45, 112.71],
    zoom: 12,
  },
  'Kabupaten Gresik': {
    label: 'Kabupaten Gresik',
    center: [-7.16, 112.63],
    zoom: 11,
  },
  'Kota Mojokerto': {
    label: 'Kota Mojokerto',
    center: [-7.47, 112.43],
    zoom: 14,
  },
  'Kabupaten Mojokerto': {
    label: 'Kabupaten Mojokerto',
    center: [-7.55, 112.48],
    zoom: 11,
  },
  'Kabupaten Lamongan': {
    label: 'Kabupaten Lamongan',
    center: [-7.12, 112.35],
    zoom: 11,
  },
  'Kabupaten Bangkalan': {
    label: 'Kabupaten Bangkalan',
    center: [-7.04, 112.82],
    zoom: 11,
  },
};

// Map instance capture & programmatic fly-to controller
function MapController({
  onMapReady,
  target,
  regency,
  resetTrigger = 0,
}: {
  onMapReady: (map: L.Map) => void;
  target: [number, number] | null;
  regency: string;
  resetTrigger?: number;
}) {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  useEffect(() => {
    if (target) {
      map.flyTo(target, 15, { duration: 1.2 });
    }
  }, [target, map]);

  useEffect(() => {
    const config = REGENCY_VIEW_CONFIG[regency];
    if (config) {
      map.flyTo(config.center, config.zoom, { duration: 1.1 });
    }
  }, [regency, map]);

  useEffect(() => {
    if (resetTrigger > 0) {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.0 });
    }
  }, [resetTrigger, map]);

  return null;
}

export interface LeafletMapProps {
  onFeatureSelect?: (properties: Record<string, unknown>) => void;
  flyToCoord?: [number, number] | null;
  selectedRegency?: string;
  resetViewTrigger?: number;
  onResetAll?: () => void;
  onDataLoaded?: (data: {
    tamanCount: number;
    mangroveCount: number;
    olahragaCount: number;
    pemakamanCount: number;
    totalAreaHa: number;
  }) => void;
  onFilteredStatsChange?: (stats: {
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
  }) => void;
  isSidebarOpen?: boolean;
}

export default function LeafletMap({
  onFeatureSelect,
  flyToCoord = null,
  selectedRegency = 'all',
  resetViewTrigger = 0,
  onResetAll,
  onDataLoaded,
  onFilteredStatsChange,
  isSidebarOpen = true,
}: LeafletMapProps) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [rawTaman, setRawTaman] = useState<Feature[]>([]);
  const [rawMangrove, setRawMangrove] = useState<Feature[]>([]);
  const [rawOlahraga, setRawOlahraga] = useState<Feature[]>([]);
  const [rawPemakaman, setRawPemakaman] = useState<Feature[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Basemap & Layer control state (Positron default for clean Apple Maps-style cartography)
  const [activeBasemap, setActiveBasemap] = useState<'osm' | 'satellite' | 'positron'>('positron');
  const [visibleLayers, setVisibleLayers] = useState({
    taman: true,
    mangrove: true,
    olahraga: true,
    pemakaman: true,
  });
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Collapse Layers & Legenda panel automatically on small/mobile screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsPanelCollapsed(true);
    }
  }, []);

  // Zoom Actions
  const handleZoomIn = useCallback(() => {
    if (mapInstance) {
      mapInstance.zoomIn();
    }
  }, [mapInstance]);

  const handleZoomOut = useCallback(() => {
    if (mapInstance) {
      mapInstance.zoomOut();
    }
  }, [mapInstance]);

  const handleResetView = useCallback(() => {
    if (mapInstance) {
      mapInstance.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.0 });
    }
    if (onResetAll) {
      onResetAll();
    }
  }, [mapInstance, onResetAll]);

  // Fetch the comprehensive merged dataset asynchronously
  useEffect(() => {
    let isMounted = true;

    async function loadMergedGeoJson() {
      try {
        const res = await fetch('/data/rth_gerbangkertosusila_lengkap.geojson');
        if (!res.ok) {
          throw new Error('Gagal mengambil file data spasial rth_gerbangkertosusila_lengkap.geojson');
        }

        const fullData = await res.json();
        const allFeatures: Feature[] = fullData.features || [];

        // Partition into 4 thematic collections
        const tamanFeats: Feature[] = [];
        const mangroveFeats: Feature[] = [];
        const olahragaFeats: Feature[] = [];
        const pemakamanFeats: Feature[] = [];

        allFeatures.forEach((feat) => {
          const kat = feat.properties?.kategori;
          if (kat === 'mangrove') {
            mangroveFeats.push(feat);
          } else if (kat === 'olahraga') {
            olahragaFeats.push(feat);
          } else if (kat === 'pemakaman') {
            pemakamanFeats.push(feat);
          } else {
            tamanFeats.push(feat);
          }
        });

        if (isMounted) {
          setRawTaman(tamanFeats);
          setRawMangrove(mangroveFeats);
          setRawOlahraga(olahragaFeats);
          setRawPemakaman(pemakamanFeats);

          if (onDataLoaded) {
            const calculateTotalArea = (feats: Feature[]) =>
              feats.reduce((acc, f) => {
                const ha = typeof f.properties?.luas_ha === 'number' ? f.properties.luas_ha : calculateFeatureAreaHa(f);
                return acc + ha;
              }, 0);

            const totalHa =
              calculateTotalArea(tamanFeats) +
              calculateTotalArea(mangroveFeats) +
              calculateTotalArea(olahragaFeats) +
              calculateTotalArea(pemakamanFeats);

            onDataLoaded({
              tamanCount: tamanFeats.length,
              mangroveCount: mangroveFeats.length,
              olahragaCount: olahragaFeats.length,
              pemakamanCount: pemakamanFeats.length,
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

    loadMergedGeoJson();

    return () => {
      isMounted = false;
    };
  }, [onDataLoaded]);

  // Helper to check if a feature belongs to the currently selected regency
  const isMatchRegency = useCallback(
    (f: Feature) => {
      if (!selectedRegency || selectedRegency === 'all') return true;
      const kk = (f.properties?.kab_kota as string) || '';
      if (selectedRegency === 'Kabupaten Gresik') {
        return kk.includes('Gresik');
      }
      return kk === selectedRegency;
    },
    [selectedRegency]
  );

  // Dynamic filtered layers based on selected regency
  const tamanFeatures = useMemo(() => rawTaman.filter(isMatchRegency), [rawTaman, isMatchRegency]);
  const mangroveFeatures = useMemo(() => rawMangrove.filter(isMatchRegency), [rawMangrove, isMatchRegency]);
  const olahragaFeatures = useMemo(() => rawOlahraga.filter(isMatchRegency), [rawOlahraga, isMatchRegency]);
  const pemakamanFeatures = useMemo(() => rawPemakaman.filter(isMatchRegency), [rawPemakaman, isMatchRegency]);

  const tamanData = useMemo(() => {
    return tamanFeatures.length > 0 ? ({ type: 'FeatureCollection', features: tamanFeatures } as GeoJsonObject) : null;
  }, [tamanFeatures]);

  const mangroveData = useMemo(() => {
    return mangroveFeatures.length > 0 ? ({ type: 'FeatureCollection', features: mangroveFeatures } as GeoJsonObject) : null;
  }, [mangroveFeatures]);

  const olahragaData = useMemo(() => {
    return olahragaFeatures.length > 0 ? ({ type: 'FeatureCollection', features: olahragaFeatures } as GeoJsonObject) : null;
  }, [olahragaFeatures]);

  const pemakamanData = useMemo(() => {
    return pemakamanFeatures.length > 0 ? ({ type: 'FeatureCollection', features: pemakamanFeatures } as GeoJsonObject) : null;
  }, [pemakamanFeatures]);

  // Keep latest onFilteredStatsChange in a ref to avoid infinite re-render cycles
  const onFilteredStatsChangeRef = useRef(onFilteredStatsChange);
  useEffect(() => {
    onFilteredStatsChangeRef.current = onFilteredStatsChange;
  }, [onFilteredStatsChange]);

  // Notify parent of updated statistics whenever regency filter changes
  useEffect(() => {
    if (!onFilteredStatsChangeRef.current || rawTaman.length === 0) return;

    const tFeats = tamanFeatures;
    const mFeats = mangroveFeatures;
    const oFeats = olahragaFeatures;
    const pFeats = pemakamanFeatures;

    const calcArea = (feats: Feature[]) =>
      feats.reduce((acc, f) => {
        const ha = typeof f.properties?.luas_ha === 'number' ? f.properties.luas_ha : calculateFeatureAreaHa(f);
        return acc + ha;
      }, 0);

    const tArea = Math.round(calcArea(tFeats) * 10) / 10;
    const mArea = Math.round(calcArea(mFeats) * 10) / 10;
    const oArea = Math.round(calcArea(oFeats) * 10) / 10;
    const pArea = Math.round(calcArea(pFeats) * 10) / 10;
    const totalHa = Math.round((tArea + mArea + oArea + pArea) * 10) / 10;

    onFilteredStatsChangeRef.current({
      tamanCount: tFeats.length,
      mangroveCount: mFeats.length,
      olahragaCount: oFeats.length,
      pemakamanCount: pFeats.length,
      tamanAreaHa: tArea,
      mangroveAreaHa: mArea,
      olahragaAreaHa: oArea,
      pemakamanAreaHa: pArea,
      totalAreaHa: totalHa,
      totalCount: tFeats.length + mFeats.length + oFeats.length + pFeats.length,
      regencyName: REGENCY_VIEW_CONFIG[selectedRegency]?.label || 'Semua Wilayah',
    });
  }, [selectedRegency, rawTaman, rawMangrove, rawOlahraga, rawPemakaman, isMatchRegency]);

  // Clean, professional popup card structure
  const createPopupContent = useCallback(
    (
      props: Record<string, unknown>,
      theme: { fillColor: string; label: string },
      areaHa: number,
      kabKota: string
    ) => {
      const rawName = (props.name as string)?.trim();
      const fclass = (props.fclass as string) || '';
      const code = props.code || '';
      const osmId = props.osm_id || props.fid || '-';

      let name = rawName;
      if (!name) {
        if (fclass === 'forest') name = 'Kawasan Hutan / Mangrove RTH';
        else if (fclass === 'park') name = 'Taman Kota / Ruang Terbuka Hijau';
        else if (fclass === 'cemetery') name = 'RTH Pemakaman Publik';
        else if (fclass === 'grass') name = 'Lapangan Terbuka Hijau';
        else if (fclass === 'recreation_ground') name = 'Fasilitas Olahraga & Rekreasi Publik';
        else if (fclass === 'meadow') name = 'Padang Terbuka Alami';
        else if (fclass === 'allotments') name = 'Kebun Komunitas RTH';
        else name = theme.label;
      }

      const kategori = theme.label;
      const displayLuas = areaHa > 0 ? `${areaHa} Ha` : '-';
      const osmTag = `fclass=${fclass || 'park'}${code ? `, code=${code}` : ''}`;

      return `
        <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; min-width: 240px; max-width: 300px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${theme.fillColor}; display: inline-block;"></span>
              <span style="font-size: 11px; font-weight: 600; color: #334155;">${kategori}</span>
            </div>
            <span style="font-size: 10px; padding: 1px 6px; border-radius: 4px; background: #f8fafc; color: #475569; font-weight: 500; border: 1px solid #e2e8f0;">${kabKota}</span>
          </div>

          <h3 style="font-size: 13px; font-weight: 600; color: #0f172a; margin: 0 0 6px 0; line-height: 1.35;">${name}</h3>

          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #475569;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Wilayah:</span>
              <span style="font-weight: 500; color: #1e293b; text-align: right; max-width: 170px;">${kabKota}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Estimasi luas:</span>
              <span style="font-weight: 600; font-family: monospace; color: #15803d;">${displayLuas}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Klasifikasi:</span>
              <span style="font-weight: 500; color: #1e293b;">${fclass || 'RTH Publik'}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748b;">Status:</span>
              <span style="font-weight: 500; color: #1e293b;">Aktif terpetakan</span>
            </div>
            <div style="margin-top: 4px; padding-top: 5px; border-top: 1px solid #f1f5f9;">
              <span style="color: #94a3b8; font-size: 10px; display: block;">Identitas spasial:</span>
              <code style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 1px 4px; border-radius: 3px; font-size: 9.5px; color: #334155; margin-top: 2px; word-break: break-all;">${osmTag} (id:${osmId})</code>
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
      const areaHa = (typeof props.luas_ha === 'number' && props.luas_ha > 0)
        ? props.luas_ha
        : calculateFeatureAreaHa(feature);
      const kabKota = (props.kab_kota as string)
        || detectKabupatenKota(
            feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon'
              ? (feature.geometry.coordinates as unknown as number[][][])
              : []
          );

      const popupHtml = createPopupContent(props, defaultStyle, areaHa, kabKota);
      layer.bindPopup(popupHtml, {
        maxWidth: 330,
        className: 'custom-leaflet-popup',
      });

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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-700 text-white text-xs px-3.5 py-1.5 rounded border border-red-800 shadow-md">
          Perhatian: {fetchError}
        </div>
      )}

      {/* Leaflet MapContainer bounded strictly to Gerbangkertosusila */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxBounds={GERBANGKERTOSUSILA_BOUNDS}
        maxBoundsViscosity={1.0}
        preferCanvas={true}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0 outline-none"
        style={{ width: '100%', height: '100%' }}
      >
        <MapAutoResizer />
        <MapController
          onMapReady={setMapInstance}
          target={flyToCoord}
          regency={selectedRegency}
          resetTrigger={resetViewTrigger}
        />
        <ScaleControl position="bottomright" imperial={false} />

        {/* Dynamic Basemap Tile Layer */}
        {activeBasemap === 'osm' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}
        {activeBasemap === 'satellite' && (
          <TileLayer
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        )}
        {activeBasemap === 'positron' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />
        )}

        {/* Overlay 1: Taman Kota & Alun-Alun (#2ECC71) */}
        {visibleLayers.taman && tamanData ? (
          <GeoJSON
            key={`layer-taman-${selectedRegency}`}
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

        {/* Overlay 2: Hutan Kota & Mangrove (#1B5E20) */}
        {visibleLayers.mangrove && mangroveData ? (
          <GeoJSON
            key={`layer-mangrove-${selectedRegency}`}
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

        {/* Overlay 3: Lapangan Olahraga & Rekreasi (#FFA502) */}
        {visibleLayers.olahraga && olahragaData ? (
          <GeoJSON
            key={`layer-olahraga-${selectedRegency}`}
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

        {/* Overlay 4: RTH Pemakaman (#0D9488) */}
        {visibleLayers.pemakaman && pemakamanData ? (
          <GeoJSON
            key={`layer-pemakaman-${selectedRegency}`}
            data={pemakamanData}
            style={() => ({
              fillColor: THEMATIC_STYLES.pemakaman.fillColor,
              color: THEMATIC_STYLES.pemakaman.color,
              weight: THEMATIC_STYLES.pemakaman.weight,
              opacity: THEMATIC_STYLES.pemakaman.opacity,
              fillOpacity: THEMATIC_STYLES.pemakaman.fillOpacity,
            })}
            onEachFeature={(feat, layer) =>
              bindFeatureEvents(feat, layer, THEMATIC_STYLES.pemakaman)
            }
          />
        ) : null}
      </MapContainer>

      {/* Top-Left Apple Maps HUD Zoom Controls (shifts beside floating glass sheet when open) */}
      <div
        className={`absolute z-[900] pointer-events-auto transition-all duration-300 ease-out ${
          isSidebarOpen ? 'top-4 left-4 md:left-[388px]' : 'top-16 left-4'
        }`}
      >
        <div className="flex flex-col bg-white/85 dark:bg-[#1c1c1e]/85 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] rounded-[10px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] border-b border-black/[0.06] dark:border-white/[0.08] transition-colors cursor-pointer select-none"
            title="Perbesar Peta (Zoom In)"
            aria-label="Zoom in"
          >
            <span className="text-base font-normal leading-none">+</span>
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] border-b border-black/[0.06] dark:border-white/[0.08] transition-colors cursor-pointer select-none"
            title="Perkecil Peta (Zoom Out)"
            aria-label="Zoom out"
          >
            <span className="text-base font-normal leading-none">&minus;</span>
          </button>
          <button
            type="button"
            onClick={handleResetView}
            className="w-8 h-8 flex items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer select-none"
            title="Lihat Semua Titik (Reset Tampilan)"
            aria-label="Lihat semua titik"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top-Right Unified Collapsible "Layers & Legenda" HUD */}
      <div className="absolute top-4 right-4 z-[900] pointer-events-auto">
        {isPanelCollapsed ? (
          <button
            onClick={() => setIsPanelCollapsed(false)}
            className="flex items-center gap-2 px-3 py-2 bg-white/85 dark:bg-[#1c1c1e]/85 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] rounded-[10px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-white/95 dark:hover:bg-[#2c2c2e]/90 transition-colors cursor-pointer"
            title="Buka Panel Layers & Legenda"
          >
            <Layers className="w-3.5 h-3.5 text-[#6e6e73] dark:text-[#98989d]" />
            <span>Layers &amp; Legenda</span>
            <span className="text-[11px] font-mono text-[#86868b] tabular-nums">
              {Object.values(visibleLayers).filter(Boolean).length}/4
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#86868b]" />
          </button>
        ) : (
          <div className="w-[calc(100vw-32px)] sm:w-72 bg-white/85 dark:bg-[#1c1c1e]/85 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] rounded-[12px] shadow-[0_8px_28px_rgba(0,0,0,0.12)] overflow-hidden text-xs">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#6e6e73] dark:text-[#98989d]" />
                <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-[-0.01em]">
                  Layers &amp; Legenda
                </span>
                <span className="text-[11px] font-mono text-[#86868b] tabular-nums">
                  {Object.values(visibleLayers).filter(Boolean).length}/4
                </span>
              </div>
              <button
                onClick={() => setIsPanelCollapsed(true)}
                className="p-1 rounded-[6px] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
                title="Ciutkan Panel"
                aria-label="Ciutkan panel"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 space-y-3.5 max-h-[calc(100vh-140px)] overflow-y-auto">
              {/* Section 1: Peta Dasar (Apple Segmented Control) */}
              <div>
                <div className="text-[11px] font-medium text-[#86868b] mb-1.5">
                  Peta Dasar
                </div>
                <div className="grid grid-cols-3 p-[2px] bg-black/[0.05] dark:bg-white/[0.08] rounded-[8px]">
                  <button
                    onClick={() => setActiveBasemap('osm')}
                    className={`py-1.5 px-2 text-[11px] rounded-[6px] transition-all text-center cursor-pointer ${
                      activeBasemap === 'osm'
                        ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] font-medium'
                        : 'text-[#6e6e73] dark:text-[#98989d] hover:text-[#1d1d1f] dark:hover:text-white'
                    }`}
                  >
                    Standar
                  </button>
                  <button
                    onClick={() => setActiveBasemap('satellite')}
                    className={`py-1.5 px-2 text-[11px] rounded-[6px] transition-all text-center cursor-pointer ${
                      activeBasemap === 'satellite'
                        ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] font-medium'
                        : 'text-[#6e6e73] dark:text-[#98989d] hover:text-[#1d1d1f] dark:hover:text-white'
                    }`}
                  >
                    Satelit
                  </button>
                  <button
                    onClick={() => setActiveBasemap('positron')}
                    className={`py-1.5 px-2 text-[11px] rounded-[6px] transition-all text-center cursor-pointer ${
                      activeBasemap === 'positron'
                        ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.08)] font-medium'
                        : 'text-[#6e6e73] dark:text-[#98989d] hover:text-[#1d1d1f] dark:hover:text-white'
                    }`}
                  >
                    Positron
                  </button>
                </div>
              </div>

              {/* Section 2: Lapisan Tematik RTH & Legenda Terpadu (Hairline List) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-[#86868b]">
                    Lapisan Tematik
                  </span>
                  <button
                    onClick={() => {
                      const allActive = Object.values(visibleLayers).every(Boolean);
                      setVisibleLayers({
                        taman: !allActive,
                        mangrove: !allActive,
                        olahraga: !allActive,
                        pemakaman: !allActive,
                      });
                    }}
                    className="text-[11px] text-[#007aff] dark:text-[#0a84ff] hover:underline transition-colors cursor-pointer"
                  >
                    {Object.values(visibleLayers).every(Boolean) ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>

                <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                  {/* Taman */}
                  <label className="flex items-center justify-between py-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] rounded-[6px] px-1 -mx-1 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={visibleLayers.taman}
                        onChange={(e) =>
                          setVisibleLayers((prev) => ({ ...prev, taman: e.target.checked }))
                        }
                        className="rounded border-black/20 accent-[#1d1d1f] dark:accent-[#f5f5f7] cursor-pointer"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: THEMATIC_STYLES.taman.fillColor }}
                      />
                      <div>
                        <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">
                          {THEMATIC_STYLES.taman.label}
                        </div>
                        <div className="text-[10px] text-[#86868b]">Taman kota &amp; alun-alun</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#86868b] tabular-nums">
                      {tamanFeatures.length.toLocaleString('id-ID')}
                    </span>
                  </label>

                  {/* Mangrove */}
                  <label className="flex items-center justify-between py-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] rounded-[6px] px-1 -mx-1 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={visibleLayers.mangrove}
                        onChange={(e) =>
                          setVisibleLayers((prev) => ({ ...prev, mangrove: e.target.checked }))
                        }
                        className="rounded border-black/20 accent-[#1d1d1f] dark:accent-[#f5f5f7] cursor-pointer"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: THEMATIC_STYLES.mangrove.fillColor }}
                      />
                      <div>
                        <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">
                          {THEMATIC_STYLES.mangrove.label}
                        </div>
                        <div className="text-[10px] text-[#86868b]">Hutan lindung &amp; mangrove</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#86868b] tabular-nums">
                      {mangroveFeatures.length.toLocaleString('id-ID')}
                    </span>
                  </label>

                  {/* Olahraga */}
                  <label className="flex items-center justify-between py-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] rounded-[6px] px-1 -mx-1 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={visibleLayers.olahraga}
                        onChange={(e) =>
                          setVisibleLayers((prev) => ({ ...prev, olahraga: e.target.checked }))
                        }
                        className="rounded border-black/20 accent-[#1d1d1f] dark:accent-[#f5f5f7] cursor-pointer"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: THEMATIC_STYLES.olahraga.fillColor }}
                      />
                      <div>
                        <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">
                          {THEMATIC_STYLES.olahraga.label}
                        </div>
                        <div className="text-[10px] text-[#86868b]">Lapangan &amp; stadion</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#86868b] tabular-nums">
                      {olahragaFeatures.length.toLocaleString('id-ID')}
                    </span>
                  </label>

                  {/* Pemakaman */}
                  <label className="flex items-center justify-between py-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] rounded-[6px] px-1 -mx-1 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={visibleLayers.pemakaman}
                        onChange={(e) =>
                          setVisibleLayers((prev) => ({ ...prev, pemakaman: e.target.checked }))
                        }
                        className="rounded border-black/20 accent-[#1d1d1f] dark:accent-[#f5f5f7] cursor-pointer"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: THEMATIC_STYLES.pemakaman.fillColor }}
                      />
                      <div>
                        <div className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight">
                          {THEMATIC_STYLES.pemakaman.label}
                        </div>
                        <div className="text-[10px] text-[#86868b]">Pemakaman umum</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-[#86868b] tabular-nums">
                      {pemakamanFeatures.length.toLocaleString('id-ID')}
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer Acuan */}
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-[10px] text-[#86868b] font-mono">
                <span>Permen ATR 14/2022</span>
                <span>Klik poligon: Detail</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
