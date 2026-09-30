import React, { useState } from 'react';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge } from './RiskBadge';
import { audioAlertService } from '../../services/audioAlertService';
import radarImg from '../../assets/images/satellite_radar_storm_1790721599329.jpg';
import {
  Waves,
  CloudRain,
  ShieldAlert,
  AlertTriangle,
  X,
  Volume2,
  Users,
  Compass,
  ArrowRight,
  Send,
  Droplets,
  Activity,
} from 'lucide-react';

interface FloodSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastFromSimulator?: (message: string, zones: string[]) => void;
}

export const FloodSimulatorModal: React.FC<FloodSimulatorModalProps> = ({
  isOpen,
  onClose,
  onBroadcastFromSimulator,
}) => {
  const { zones } = useAlerts();
  const { role } = useAuth();

  const [rainfallMm, setRainfallMm] = useState(65);
  const [tideLevel, setTideLevel] = useState<'basse' | 'moyenne' | 'haute_vive_eau'>('haute_vive_eau');
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);

  if (!isOpen) return null;

  // Calculation engine based on Wouri estuary hydrodynamics
  const tideMultiplier = tideLevel === 'haute_vive_eau' ? 1.6 : tideLevel === 'moyenne' ? 1.2 : 0.8;
  const floodIndex = Math.min(100, Math.round((rainfallMm / 100) * tideMultiplier * 100));

  // Determine affected zones
  const affectedZones = zones.filter((z) => {
    if (floodIndex > 75) return true; // All vulnerable zones
    if (floodIndex > 50) return ['zone_makèpé', 'zone_bepanda', 'zone_nylon', 'zone_youpwe', 'zone_deido'].includes(z.id_zone);
    if (floodIndex > 30) return ['zone_makèpé', 'zone_bepanda', 'zone_nylon'].includes(z.id_zone);
    return false;
  });

  const totalExposedPopulation = affectedZones.reduce(
    (acc, z) => acc + (z.population_estimee || 35000),
    0
  );

  // Blocked Douala road axes
  const blockedRoads: { name: string; criticalAt: number }[] = [
    { name: 'Radier de Makèpé Missokè (Rivière Mbanya)', criticalAt: 25 },
    { name: 'Carrefour Bépanda TSF & Omnisports', criticalAt: 40 },
    { name: 'Axe Lourd Bonabéri (Quatre-Étages)', criticalAt: 55 },
    { name: 'Carrefour Nylon Tergal & Marché Madagascar', criticalAt: 45 },
    { name: 'Rond-Point Deido & Descente Besseké', criticalAt: 70 },
    { name: 'Boulevard de la Liberté (Akwa)', criticalAt: 85 },
  ];

  const currentlyBlocked = blockedRoads.filter((r) => floodIndex >= r.criticalAt);

  const handleTestSiren = () => {
    setIsPlayingSiren(true);
    audioAlertService.playEmergencySiren(3000);
    audioAlertService.speakAlert(
      `Alerte crue simulateur. Risque calculé à ${floodIndex} pour cent. Débordement sur ${affectedZones.length} quartiers de Douala.`
    );
    setTimeout(() => setIsPlayingSiren(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <Waves className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                Simulateur Dynamique de Crue du Wouri
                <span className="text-[10px] font-mono uppercase bg-blue-900 text-blue-300 px-2 py-0.5 rounded font-semibold">
                  Modèle SIG
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Couplage précipitations tropicales + marée d'estuaire à Douala
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Sliders Control Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            {/* Slider 1: Rain */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-blue-400" />
                  Précipitations tombées :
                </span>
                <span className="font-mono font-bold text-sm text-blue-300">
                  {rainfallMm} mm / 3h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="5"
                value={rainfallMm}
                onChange={(e) => setRainfallMm(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0mm (Sec)</span>
                <span>45mm (Forte pluie)</span>
                <span>120mm (Mousson extrême)</span>
              </div>
            </div>

            {/* Slider 2: Tide Level */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-cyan-400" />
                Marée sur l'estuaire du Wouri :
              </span>
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {[
                  { id: 'basse', label: 'Basse mer', coeff: '+0.5m' },
                  { id: 'moyenne', label: 'Mi-marée', coeff: '+1.5m' },
                  { id: 'haute_vive_eau', label: 'Pleine mer', coeff: '+2.8m' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTideLevel(t.id as any)}
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                      tideLevel === t.id
                        ? 'border-cyan-400 bg-cyan-950/60 text-white font-bold ring-1 ring-cyan-400'
                        : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-[11px] leading-tight">{t.label}</div>
                    <div className="text-[10px] text-cyan-300 font-mono mt-0.5">{t.coeff}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Indicator Gauge */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Indice de Submersion
              </span>
              <div
                className={`text-2xl font-bold font-mono mt-1 ${
                  floodIndex > 70
                    ? 'text-red-400 animate-pulse'
                    : floodIndex > 40
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {floodIndex} / 100
              </div>
              <span className="text-[10px] text-slate-400">
                {floodIndex > 70 ? 'Saturation Totale' : floodIndex > 40 ? 'Reflux Majeur' : 'Écoulement Fluide'}
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Quartiers Inondés
              </span>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {affectedZones.length}
                <span className="text-xs font-normal text-slate-400 ml-1">/ {zones.length}</span>
              </div>
              <span className="text-[10px] text-slate-400">Secteurs coupés</span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Population Menacée
              </span>
              <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">
                {(totalExposedPopulation / 1000).toFixed(0)}k
              </div>
              <span className="text-[10px] text-slate-400">Habitants exposés</span>
            </div>
          </div>

          {/* Blocked Roads Real-time Feed */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Axes routiers et ponts impraticables ({currentlyBlocked.length})
              </span>
              <span className="text-[10px] text-slate-400">Diagnostic circulation CUD</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {blockedRoads.map((road) => {
                const isBlocked = floodIndex >= road.criticalAt;
                return (
                  <div
                    key={road.name}
                    className={`p-2 rounded-xl border flex items-center justify-between ${
                      isBlocked
                        ? 'border-red-900 bg-red-950/40 text-red-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <span className="truncate pr-2">{road.name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                        isBlocked ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isBlocked ? 'SUBMERGÉ' : 'DÉGAGÉ'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Siren Broadcast Test & Satellite View */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-blue-950/80 to-slate-800/80 p-4 rounded-2xl border border-blue-900/50">
            <div className="flex items-center gap-3">
              <img
                src={radarImg}
                alt="Radar satellite météo"
                className="w-14 h-14 rounded-xl object-cover border border-blue-800/80 shrink-0"
              />
              <div>
                <strong className="text-white block font-bold text-xs">
                  Sirène Municipale & Synthèse Vocale d'Évacuation
                </strong>
                <p className="text-[11px] text-slate-300">
                  Déclenchez la sirène d'alerte bitonale pour tester la réactivité.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestSiren}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer whitespace-nowrap ${
                isPlayingSiren
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingSiren ? 'Sirène en cours...' : 'Tester la Sirène & Voix'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Paramètres : {rainfallMm}mm · Marée {tideLevel}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Fermer le simulateur
            </button>
            {role === 'admin' && onBroadcastFromSimulator && (
              <button
                onClick={() => {
                  onBroadcastFromSimulator(
                    `SIMULATION HYDROLOGIQUE CUD : Débordement simulé de ${rainfallMm}mm couplé à la marée du Wouri. Risque critique sur ${affectedZones.map((z) => z.quartier).join(', ')}. Évacuation recommandée.`,
                    affectedZones.map((z) => z.id_zone)
                  );
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Diffuser cette crue en alerte réelle</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
