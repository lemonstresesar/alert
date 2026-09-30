import React, { useState } from 'react';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { DoualaMap } from '../map/DoualaMap';
import { NiveauRisque, ZoneDeRisque } from '../../types';
import { RiskBadge, getRiskColor } from '../common/RiskBadge';
import { Filter, Layers, Users, MapPin, ArrowRight, BellRing, Info, Waves, ShieldCheck } from 'lucide-react';

interface CitizenMapProps {
  onSelectZoneForAlerts?: (zoneId: string) => void;
  onNavigateToReport?: (zoneId: string) => void;
}

export const CitizenMap: React.FC<CitizenMapProps> = ({
  onSelectZoneForAlerts,
  onNavigateToReport,
}) => {
  const { zones, alertes } = useAlerts();
  const { setCurrentNeighborhood } = useAuth();
  const [filterRisk, setFilterRisk] = useState<NiveauRisque | 'all'>('all');
  const [selectedZone, setSelectedZone] = useState<ZoneDeRisque | null>(zones[0] || null);

  // Sorting zones by risk priority: critique > élevé > modéré > faible
  const riskPriority: Record<NiveauRisque, number> = {
    critique: 4,
    élevé: 3,
    modéré: 2,
    faible: 1,
  };

  const rankedZones = [...zones].sort((a, b) => {
    const diff = riskPriority[b.niveau_de_risque] - riskPriority[a.niveau_de_risque];
    if (diff !== 0) return diff;
    return (b.est_inonde ? 1 : 0) - (a.est_inonde ? 1 : 0);
  });

  const alertsForSelectedZone = selectedZone
    ? alertes.filter((a) => a.zones_destinataires.includes(selectedZone.id_zone))
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-8">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Cartographie des Risques d'Inondation à Douala
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Surveillance géoréférencée des 10 bassins et quartiers critiques de l'estuaire du Wouri.
          </p>
        </div>

        {/* Risk Level Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['all', 'critique', 'élevé', 'modéré', 'faible'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRisk(r)}
                className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                  filterRisk === r
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'all' ? 'Toutes les zones' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2 space-y-3">
          <DoualaMap
            zones={zones}
            selectedZoneId={selectedZone?.id_zone}
            onSelectZone={(z) => setSelectedZone(z)}
            filterRisk={filterRisk}
            height="520px"
          />
          <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">
            <span>Cliquez sur un marqueur ou cercle pour afficher les détails du bassin versant.</span>
            <span>Système SIG CUD 2026</span>
          </div>
        </div>

        {/* Zone Detail Card */}
        <div className="space-y-4">
          {selectedZone ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    {selectedZone.quartier}
                  </span>
                  <RiskBadge level={selectedZone.niveau_de_risque} size="sm" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1 leading-snug">
                  {selectedZone.nom_zone}
                </h3>
              </div>

              {/* Status Indicator */}
              <div
                className={`p-3 rounded-xl border flex items-center gap-3 ${
                  selectedZone.est_inonde
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="p-2 rounded-xl bg-white shadow-2xs">
                  {selectedZone.est_inonde ? (
                    <Waves className="w-6 h-6 text-red-600" />
                  ) : (
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide">
                    {selectedZone.est_inonde ? 'État : Inondation Confirmée' : 'État : Circulation Normale'}
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    {selectedZone.est_inonde
                      ? 'Axes partiellement coupés, forte vigilance recommandée.'
                      : 'Aucun débordement majeur constaté à cette heure.'}
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="text-xs space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 block text-[11px]">Vulnérabilité hydrologique</span>
                  <p className="text-slate-800 font-medium mt-0.5">{selectedZone.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Cours d'eau / Exutoire</span>
                    <span className="font-semibold text-slate-800">
                      {selectedZone.cours_eau_proche || 'Canal primaire'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Population estimée</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {selectedZone.population_estimee?.toLocaleString()} habitants
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => setCurrentNeighborhood(selectedZone.quartier)}
                  className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Définir comme mon quartier</span>
                </button>

                {onNavigateToReport && (
                  <button
                    onClick={() => onNavigateToReport(selectedZone.id_zone)}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Signaler une montée d'eau ici
                  </button>
                )}
              </div>

              {/* Alerts associated with this zone */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                  <BellRing className="w-3.5 h-3.5 text-orange-500" />
                  <span>Alertes en cours pour cette zone ({alertsForSelectedZone.length})</span>
                </div>
                {alertsForSelectedZone.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {alertsForSelectedZone.map((alt) => (
                      <div
                        key={alt.id_alerte}
                        className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{alt.type_alerte}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(alt.date_alerte).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{alt.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg text-center">
                    Aucune alerte active émise pour cette zone.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-slate-500 text-xs">
              Sélectionnez une zone sur la carte.
            </div>
          )}
        </div>
      </div>

      {/* Vulnerability Ranking / Classement des zones */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Classement de Vulnérabilité des 10 Zones de Douala
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Évaluation basée sur la topographie, le reflux de marée et la capacité de drainage.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Du risque le plus critique au plus faible
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rankedZones.map((zone, idx) => {
            const riskConf = getRiskColor(zone.niveau_de_risque);
            const isSelected = selectedZone?.id_zone === zone.id_zone;

            return (
              <div
                key={zone.id_zone}
                onClick={() => setSelectedZone(zone)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 font-mono text-xs font-bold text-slate-600 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{zone.quartier}</span>
                      {zone.est_inonde && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                          Inondé
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 line-clamp-1">{zone.nom_zone}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <RiskBadge level={zone.niveau_de_risque} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
