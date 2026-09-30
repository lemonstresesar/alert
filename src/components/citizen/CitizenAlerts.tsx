import React, { useState } from 'react';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge } from '../common/RiskBadge';
import { audioAlertService } from '../../services/audioAlertService';
import { FloodSimulatorModal } from '../common/FloodSimulatorModal';
import { NiveauRisque } from '../../types';
import {
  Bell,
  MessageSquare,
  Smartphone,
  Radio,
  CheckCheck,
  ShieldAlert,
  Calendar,
  MapPin,
  Volume2,
  Waves,
  Play,
  Square,
} from 'lucide-react';

export const CitizenAlerts: React.FC = () => {
  const { alertes, zones } = useAlerts();
  const { currentNeighborhood } = useAuth();
  const [filterScope, setFilterScope] = useState<'my_zone' | 'all'>('my_zone');
  const [selectedRisk, setSelectedRisk] = useState<NiveauRisque | 'all'>('all');
  const [playingAlerteId, setPlayingAlerteId] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);

  // Find user current zone id
  const currentZone = zones.find(
    (z) => z.quartier.toLowerCase() === currentNeighborhood.toLowerCase()
  );

  const filteredAlertes = alertes.filter((alt) => {
    if (filterScope === 'my_zone' && currentZone) {
      if (!alt.zones_destinataires.includes(currentZone.id_zone)) return false;
    }
    if (selectedRisk !== 'all' && alt.niveau_urgence !== selectedRisk) return false;
    return true;
  });

  const handlePlayVoiceAlert = (alt: any) => {
    if (playingAlerteId === alt.id_alerte) {
      audioAlertService.stopSiren();
      window.speechSynthesis?.cancel();
      setPlayingAlerteId(null);
      return;
    }

    setPlayingAlerteId(alt.id_alerte);
    // Play dual-tone siren briefly
    audioAlertService.playEmergencySiren(2000);
    // Voice speech broadcast
    setTimeout(() => {
      audioAlertService.speakAlert(`Avis officiel Communauté Urbaine de Douala. ${alt.type_alerte}. ${alt.message}`);
    }, 1500);

    setTimeout(() => {
      setPlayingAlerteId(null);
    }, 12000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-8">
      {/* Title & Filter bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Centre d'Avertissement Précoce & Sirène
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              Alertes & Bulletins de Crise
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Validées par la Communauté Urbaine de Douala et la Protection Civile.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowSimulator(true)}
              className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 border border-blue-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Waves className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulateur Crue & Marée</span>
            </button>
          </div>
        </div>

        {/* Scope and Urgency filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start">
            <button
              onClick={() => setFilterScope('my_zone')}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filterScope === 'my_zone'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mon Quartier ({currentNeighborhood})
            </button>
            <button
              onClick={() => setFilterScope('all')}
              className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filterScope === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tout Douala ({alertes.length})
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs overflow-x-auto">
            {(['all', 'critique', 'élevé', 'modéré', 'faible'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRisk(r)}
                className={`px-2.5 py-1 rounded-md capitalize whitespace-nowrap transition-colors ${
                  selectedRisk === r
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'all' ? 'Tous' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Feed */}
      <div className="space-y-4">
        {filteredAlertes.length > 0 ? (
          filteredAlertes.map((alt) => {
            const targetedZones = zones.filter((z) => alt.zones_destinataires.includes(z.id_zone));
            const isCritical = alt.niveau_urgence === 'critique';
            const isPlaying = playingAlerteId === alt.id_alerte;

            return (
              <div
                key={alt.id_alerte}
                className={`rounded-2xl p-5 sm:p-6 border transition-all ${
                  isCritical
                    ? 'bg-red-50/70 border-red-200 shadow-xs'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge level={alt.niveau_urgence} size="md" />
                    <span className="font-bold text-base text-slate-900">{alt.type_alerte}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Audio Siren / Voice Trigger */}
                    <button
                      onClick={() => handlePlayVoiceAlert(alt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                        isPlaying
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                      title="Écouter le message vocal et la sirène"
                    >
                      {isPlaying ? <Square className="w-3 h-3 fill-current" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600" />}
                      <span>{isPlaying ? 'Arrêter audio' : 'Écouter Alerte Vocale'}</span>
                    </button>

                    <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(alt.date_alerte).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed my-3 font-medium">
                  {alt.message}
                </p>

                {/* Zones Targeted */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    Zones cibles :
                  </span>
                  {targetedZones.map((z) => (
                    <span
                      key={z.id_zone}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]"
                    >
                      {z.quartier}
                    </span>
                  ))}
                </div>

                {/* Multi-Channel Distribution Badges */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-600">Diffusé par :</span>
                    <div className="flex items-center gap-2">
                      {alt.canaux.map((ch: string) => (
                        <span
                          key={ch}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold"
                        >
                          {ch === 'SMS' && <Smartphone className="w-3 h-3" />}
                          {ch === 'WhatsApp' && <MessageSquare className="w-3 h-3" />}
                          {ch === 'Notification' && <Radio className="w-3 h-3" />}
                          <span>{ch}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <span className="text-slate-500 hidden sm:inline">
                    Émis par : <strong className="font-semibold text-slate-700">{alt.nom_admin}</strong>
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Aucune alerte active pour cette sélection
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Conditions normales observées. Activez les notifications pour être prévenu dès émission d'un bulletin officiel.
            </p>
          </div>
        )}
      </div>

      {/* Safety Rules Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
          <ShieldAlert className="w-4 h-4" />
          <span>Consignes de sécurité : Inondations, Effondrements & Glissements à Douala</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <strong className="text-white block mb-1">Inondations & Radiers</strong>
            Ne traversez jamais à pied ni à moto un axe submergé. 30 cm d'eau vive suffisent à emporter un véhicule vers un collecteur.
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <strong className="text-white block mb-1">Effondrements de Bâtiments</strong>
            Dès l'apparition de fissures nettes ou craquements sous fortes pluies, évacuez immédiatement l'édifice et alertez le 118.
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <strong className="text-white block mb-1">Éboulements & Pentes</strong>
            Éloignez-vous des talus ravinés ou des bas de versants instables lors des orages continus.
          </div>
        </div>
      </div>

      {/* Flood Simulator Modal */}
      <FloodSimulatorModal
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
      />
    </div>
  );
};
