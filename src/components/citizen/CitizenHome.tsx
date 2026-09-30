import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { RiskBadge, getRiskColor } from '../common/RiskBadge';
import { fetchCurrentWeather } from '../../services/weatherService';
import { CurrentWeather, ZoneDeRisque } from '../../types';
import { FloodSimulatorModal } from '../common/FloodSimulatorModal';
import heroImg from '../../assets/images/hero_douala_estuary_1790721577418.jpg';
import {
  AlertTriangle,
  MapPin,
  CloudRain,
  PhoneCall,
  Compass,
  ArrowRight,
  Waves,
  Building2,
  Check,
  Edit3,
  ShieldCheck,
  Navigation,
  Activity,
  Flame,
  ThumbsUp,
  Volume2,
} from 'lucide-react';

interface CitizenHomeProps {
  onNavigate: (tab: string, extra?: { zoneId?: string }) => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({ onNavigate }) => {
  const { user, currentNeighborhood, setCurrentNeighborhood } = useAuth();
  const { zones, alertes, signalements } = useAlerts();
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [tempCustomName, setTempCustomName] = useState('');
  const [showSimulator, setShowSimulator] = useState(false);
  const [confirmedReports, setConfirmedReports] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchCurrentWeather().then(setWeather);
  }, []);

  const isKnownPredefined = zones.some(
    (z) => z.quartier.toLowerCase() === currentNeighborhood.toLowerCase()
  );

  const currentZone = zones.find(
    (z) => z.quartier.toLowerCase() === currentNeighborhood.toLowerCase()
  );

  const neighborhoodAlert = currentZone
    ? alertes.find((a) => a.zones_destinataires.includes(currentZone.id_zone)) || alertes[0]
    : alertes[0];

  const handleGeolocate = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          let closest = zones[0];
          let minDist = 999999;
          zones.forEach((z) => {
            const dist = Math.hypot(z.lat - userLat, z.lng - userLng);
            if (dist < minDist) {
              minDist = dist;
              closest = z;
            }
          });
          if (closest) {
            setCurrentNeighborhood(closest.quartier);
            setIsCustomEditing(false);
          }
        },
        () => {
          setIsLocating(false);
          setCurrentNeighborhood('Makèpé');
        },
        { timeout: 3000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleSaveCustomNeighborhood = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempCustomName.trim()) {
      setCurrentNeighborhood(tempCustomName.trim());
      setIsCustomEditing(false);
    }
  };

  const handleConfirmIncident = (id: string) => {
    setConfirmedReports((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-8">
      {/* Cinematic Hero Card with Visual Impact */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 text-white min-h-[260px] sm:min-h-[290px] flex flex-col justify-between p-6 sm:p-8">
        {/* Background Image with Scrim Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Estuaire du Wouri Douala"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40"></div>
        </div>

        {/* Top Floating Row: Brand and Live Status */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-mono tracking-wider uppercase text-blue-300 font-semibold">
              Surveillance Estuaire du Wouri · Douala 2026
            </span>
          </div>

          {/* Neighborhood Selector with Custom Zone Input */}
          <div className="bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2 text-xs">
            <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            {isCustomEditing ? (
              <form onSubmit={handleSaveCustomNeighborhood} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempCustomName}
                  onChange={(e) => setTempCustomName(e.target.value)}
                  placeholder="PK 14, Ndogpassi 3..."
                  autoFocus
                  className="px-2 py-0.5 text-xs rounded border border-slate-600 bg-slate-800 text-white font-semibold w-32 focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold"
                >
                  <Check className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <select
                  value={isKnownPredefined ? currentNeighborhood : 'custom'}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setTempCustomName(isKnownPredefined ? '' : currentNeighborhood);
                      setIsCustomEditing(true);
                    } else {
                      setCurrentNeighborhood(e.target.value);
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer pr-1"
                >
                  {zones.map((z) => (
                    <option key={z.id_zone} value={z.quartier} className="text-slate-900">
                      {z.quartier} ({z.niveau_de_risque})
                    </option>
                  ))}
                  <option value="custom" className="text-slate-900">Autre lieu-dit libre...</option>
                </select>

                {!isKnownPredefined && (
                  <button
                    onClick={() => {
                      setTempCustomName(currentNeighborhood);
                      setIsCustomEditing(true);
                    }}
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>{currentNeighborhood}</span>
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}

                <button
                  onClick={handleGeolocate}
                  disabled={isLocating}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Me géolocaliser"
                >
                  <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-blue-400' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero Middle: Punchy Status & Call to action */}
        <div className="relative z-10 my-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-lg uppercase tracking-wider ${
                currentZone?.est_inonde
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {currentZone?.est_inonde ? (
                <span className="inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>INONDATION ACTIVE SUR CE SECTEUR</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>VIGILANCE NOMINALE</span>
                </span>
              )}
            </span>
            {currentZone && <RiskBadge level={currentZone.niveau_de_risque} size="sm" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Quartier {currentNeighborhood}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            {currentZone
              ? currentZone.description
              : 'Zone sous surveillance générale. Déclarez toute observation anormale.'}
          </p>
        </div>

        {/* Hero Bottom Bar: Interactive Quick Action Triggers */}
        <div className="relative z-10 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('signaler')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Signaler un sinistre</span>
            </button>

            <button
              onClick={() => setShowSimulator(true)}
              className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-cyan-300 font-bold rounded-xl border border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Waves className="w-4 h-4 text-cyan-400" />
              <span>Simulateur Crue Wouri</span>
            </button>
          </div>

          <button
            onClick={() => onNavigate('refuges')}
            className="text-xs text-blue-300 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Centres de refuge & Évacuation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Feature Interactive Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          onClick={() => onNavigate('signaler')}
          className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs text-left transition-all hover:border-blue-400 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 leading-tight">Signaler un Sinistre</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Inondation, effondrement de bâtiment, glissement ou route coupée.
          </p>
        </button>

        <button
          onClick={() => onNavigate('refuges')}
          className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs text-left transition-all hover:border-blue-400 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
            <Navigation className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 leading-tight">Refuges & Évacuation</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Stade de Bépanda, Maison du Parti et points hauts praticables.
          </p>
        </button>

        <button
          onClick={() => onNavigate('carte')}
          className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs text-left transition-all hover:border-blue-400 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
            <MapPin className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 leading-tight">Carte SIG Interactive</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Visualiser les 10 bassins versants et les cercles de criticité.
          </p>
        </button>

        <button
          onClick={() => onNavigate('previsions')}
          className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs text-left transition-all hover:border-blue-400 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2.5">
            <CloudRain className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 leading-tight">Météo & Marées Wouri</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            Graphique des précipitations cumulées Open-Meteo à 14 jours.
          </p>
        </button>
      </div>

      {/* Community Confirmation & Live Reports Ticker */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Veille Citoyenne & Confirmations de Terrain
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Solidarité de quartier</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {signalements.slice(0, 2).map((sig) => {
            const confirms = (confirmedReports[sig.id_signalement] || 2);
            return (
              <div
                key={sig.id_signalement}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between space-y-2 text-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{sig.type_incident || 'Inondation'}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(sig.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">{sig.description}</p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                  <span className="text-slate-500">
                    Confirmé par <strong>{confirms}</strong> riverains
                  </span>
                  <button
                    onClick={() => handleConfirmIncident(sig.id_signalement)}
                    className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 font-bold rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>Confirmer (+1)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Weather & Quick Emergency Call Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Weather Strip */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <CloudRain className="w-4 h-4 text-blue-600" />
              <span>Météo Douala Direct (Open-Meteo)</span>
            </div>
            <span className="font-mono text-slate-400 text-[10px]">4.05°N, 9.70°E</span>
          </div>

          {weather ? (
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xl font-bold font-mono text-slate-900">{weather.temperature}°C</span>
                <span className="text-xs text-slate-500 block">{weather.description}</span>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold text-blue-700 font-mono block">{weather.precipitation} mm/h</span>
                <span className="text-[10px] text-slate-400">Humidité: {weather.humidity}%</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-2">Chargement météo...</div>
          )}
        </div>

        {/* Emergency Hotlines */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
              <PhoneCall className="w-4 h-4" />
              <span>Lignes d'Urgence Secours Douala</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Appel gratuit</span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <a href="tel:118" className="flex-1 py-1.5 text-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
              Pompiers 118
            </a>
            <a href="tel:117" className="flex-1 py-1.5 text-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors">
              Police 117
            </a>
            <a href="tel:119" className="flex-1 py-1.5 text-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors">
              SAMU 119
            </a>
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      <FloodSimulatorModal
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
      />
    </div>
  );
};
