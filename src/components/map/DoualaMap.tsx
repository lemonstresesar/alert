import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { NiveauRisque, ZoneDeRisque } from '../../types';
import { getRiskColor } from '../common/RiskBadge';

interface DoualaMapProps {
  zones: ZoneDeRisque[];
  selectedZoneId?: string;
  onSelectZone?: (zone: ZoneDeRisque) => void;
  height?: string;
  filterRisk?: NiveauRisque | 'all';
  showLegend?: boolean;
  allowPointSelection?: boolean;
  selectedCoordinates?: { lat: number; lng: number } | null;
  onSelectCoordinates?: (coords: { lat: number; lng: number }) => void;
}

export const DoualaMap: React.FC<DoualaMapProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
  height = '480px',
  filterRisk = 'all',
  showLegend = true,
  allowPointSelection = false,
  selectedCoordinates,
  onSelectCoordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const customPointMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [4.055, 9.715],
      zoom: 12.5,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Communauté Urbaine de Douala',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    // Handle point selection click
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (allowPointSelection && onSelectCoordinates) {
        onSelectCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    // Invalidate size to ensure proper tile rendering inside dynamic containers
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [allowPointSelection, onSelectCoordinates]);

  // Update Custom Point Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (customPointMarkerRef.current) {
      customPointMarkerRef.current.remove();
      customPointMarkerRef.current = null;
    }

    if (selectedCoordinates) {
      const pinIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: `<div class="relative flex items-center justify-center">
                 <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-blue-400 opacity-75"></span>
                 <span class="relative inline-flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg w-7 h-7 border-2 border-white">
                   <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                 </span>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const pinMarker = L.marker([selectedCoordinates.lat, selectedCoordinates.lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(
          `<div class="p-1 text-xs">
            <strong class="font-bold text-slate-900 block">Point personnalisé sélectionné</strong>
            <span class="text-slate-500 font-mono text-[11px]">${selectedCoordinates.lat.toFixed(4)}°N, ${selectedCoordinates.lng.toFixed(4)}°E</span>
          </div>`
        );

      customPointMarkerRef.current = pinMarker;
    }
  }, [selectedCoordinates]);

  // Update Zones Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const filteredZones = filterRisk === 'all' 
      ? zones 
      : zones.filter((z) => z.niveau_de_risque === filterRisk);

    filteredZones.forEach((zone) => {
      const riskConf = getRiskColor(zone.niveau_de_risque);
      const isSelected = selectedZoneId === zone.id_zone;

      // Circle representing flood risk perimeter
      const circle = L.circle([zone.lat, zone.lng], {
        radius: zone.rayon_metres,
        color: riskConf.hex,
        fillColor: riskConf.hex,
        fillOpacity: isSelected ? 0.45 : zone.est_inonde ? 0.35 : 0.2,
        weight: isSelected ? 3 : zone.est_inonde ? 2.5 : 1.5,
        dashArray: zone.est_inonde ? undefined : '4, 6',
      });

      // Marker element with custom HTML icon (clean SVG instead of emoji)
      const floodPulseHtml = zone.est_inonde
        ? `<div class="relative flex items-center justify-center">
             <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full opacity-75" style="background-color: ${riskConf.hex}"></span>
             <span class="relative inline-flex items-center justify-center rounded-full text-white text-[10px] font-bold shadow-md w-7 h-7" style="background-color: ${riskConf.hex}">
               <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"></path></svg>
             </span>
           </div>`
        : `<div class="flex items-center justify-center rounded-full text-white text-[10px] font-bold shadow-sm w-5 h-5 border border-white" style="background-color: ${riskConf.hex}">
             •
           </div>`;

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: floodPulseHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([zone.lat, zone.lng], { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div class="p-1 space-y-2 text-slate-800 font-sans max-w-xs">
          <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-1.5">
            <div>
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">${zone.quartier}</span>
              <h4 class="font-bold text-sm text-slate-900 leading-tight">${zone.nom_zone}</h4>
            </div>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded ${zone.est_inonde ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}">
              ${zone.est_inonde ? 'INONDÉ' : 'NORMAL'}
            </span>
          </div>

          <p class="text-xs text-slate-600 leading-relaxed">${zone.description}</p>

          <div class="text-[11px] space-y-1 bg-slate-50 p-2 rounded border border-slate-100">
            <div class="flex justify-between">
              <span class="text-slate-500">Niveau de risque:</span>
              <span class="font-semibold capitalize" style="color: ${riskConf.hex}">${zone.niveau_de_risque}</span>
            </div>
            ${zone.cours_eau_proche ? `
            <div class="flex justify-between">
              <span class="text-slate-500">Exutoire:</span>
              <span class="font-medium text-slate-700">${zone.cours_eau_proche}</span>
            </div>` : ''}
            ${zone.population_estimee ? `
            <div class="flex justify-between">
              <span class="text-slate-500">Population exposée:</span>
              <span class="font-medium text-slate-700">${zone.population_estimee.toLocaleString()} hab.</span>
            </div>` : ''}
          </div>

          <button id="btn-select-${zone.id_zone}" class="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded text-xs transition-colors mt-2 cursor-pointer shadow-sm">
            Consulter ce quartier
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      circle.bindPopup(popupHtml);

      // On popup open, attach click handler to button
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${zone.id_zone}`);
        if (btn && onSelectZone) {
          btn.onclick = () => {
            onSelectZone(zone);
            map.closePopup();
          };
        }
      });

      circle.on('click', () => {
        if (onSelectZone) onSelectZone(zone);
      });

      marker.on('click', () => {
        if (onSelectZone) onSelectZone(zone);
      });

      layerGroup.addLayer(circle);
      layerGroup.addLayer(marker);
    });
  }, [zones, filterRisk, selectedZoneId, onSelectZone]);

  // Fly to selected zone if requested
  useEffect(() => {
    if (!selectedZoneId || !mapInstanceRef.current) return;
    const target = zones.find((z) => z.id_zone === selectedZoneId);
    if (target) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 14, {
        duration: 1.2,
      });
    }
  }, [selectedZoneId, zones]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />

      {allowPointSelection && (
        <div className="absolute top-3 left-3 z-20 bg-blue-900/90 text-white px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-xs shadow-md pointer-events-none flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>Cliquez sur la carte pour désigner un lieu précis</span>
        </div>
      )}

      {/* Map Legend Overlay */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl border border-slate-200/80 shadow-md text-xs text-slate-700 space-y-1.5 pointer-events-auto">
          <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">
            Niveaux de Risque
          </div>
          <div className="flex flex-col gap-1 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block shadow-xs"></span>
              <span>Critique (Inondation imminente / active)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block shadow-xs"></span>
              <span>Élevé (Reflux du Wouri / Ruissellement)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-xs"></span>
              <span>Modéré (Engorgement canalisations)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shadow-xs"></span>
              <span>Faible (Terrain surélevé filtrant)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
