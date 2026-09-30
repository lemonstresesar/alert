import React, { useEffect, useState } from 'react';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { fetchCurrentWeather } from '../../services/weatherService';
import { CurrentWeather, ZoneDeRisque, Signalement } from '../../types';
import { DoualaMap } from '../map/DoualaMap';
import { RiskBadge, getRiskColor } from '../common/RiskBadge';
import {
  ShieldAlert,
  AlertTriangle,
  Bell,
  Users,
  CloudLightning,
  CloudRain,
  Droplets,
  Wind,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Waves,
  MapPin,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string, extra?: { zoneId?: string }) => void;
  onOpenSimulateModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenSimulateModal,
}) => {
  const { zones, alertes, signalements, validateReport, rejectReport } = useAlerts();
  const { admin } = useAuth();
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneDeRisque | null>(zones[0] || null);

  useEffect(() => {
    fetchCurrentWeather().then(setWeather);
  }, []);

  const totalUsers = storageService.getUtilisateurs().length;
  const criticalZones = zones.filter((z) => z.niveau_de_risque === 'critique' || z.est_inonde);
  const pendingReports = signalements.filter((s) => s.statut === 'en attente');
  const recentReports = signalements.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Trigger Button */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-blue-300">
              Poste de Commandement · Communauté Urbaine de Douala
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-white">
            Tableau de Bord de Crise & Surveillance Hydrologique
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Supervision centralisée des 10 bassins versants de Douala, validation des remontées citoyennes et diffusion des alertes préventives.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSimulateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <CloudLightning className="w-4 h-4 text-slate-950" />
            <span>Simuler une alerte météo</span>
          </button>
        </div>
      </div>

      {/* 4 Core Indicators / KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigate('admin_zones')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-tight">Zones à Risque Critique</span>
            <span className="p-2 rounded-xl bg-red-50 text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-2">
            {criticalZones.length}
            <span className="text-xs font-normal text-slate-500 ml-1">/ 10</span>
          </div>
          <div className="text-[11px] text-red-600 font-medium mt-1">
            {zones.filter((z) => z.est_inonde).length} zone(s) actuellement inondée(s)
          </div>
        </div>

        <div
          onClick={() => onNavigate('admin_signalements')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-tight">Signalements en Attente</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-2">
            {pendingReports.length}
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            À vérifier par un administrateur
          </div>
        </div>

        <div
          onClick={() => onNavigate('admin_alertes')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-tight">Alertes Diffusées</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Bell className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-2">
            {alertes.length}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            SMS, WhatsApp & Notifications
          </div>
        </div>

        <div
          onClick={() => onNavigate('admin_users')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-tight">Citoyens Inscrits</span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-2">
            {totalUsers}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Répartis sur l'ensemble de la métropole
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Live Weather Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Cartographie SIG des Alertes & Bassins de Douala
            </h3>
            <span className="text-xs text-slate-500">
              Cliquez pour inspecter une zone
            </span>
          </div>

          <DoualaMap
            zones={zones}
            selectedZoneId={selectedZone?.id_zone}
            onSelectZone={(z) => setSelectedZone(z)}
            height="460px"
          />
        </div>

        {/* Live Weather Widget & Zone Focus (1 col) */}
        <div className="space-y-4">
          {/* Live Open-Meteo Weather Widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">Météo en Direct (Open-Meteo)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Estuaire Wouri</span>
            </div>

            {weather ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold font-mono text-slate-900">
                      {weather.temperature}°C
                    </div>
                    <div className="text-xs text-slate-500">{weather.description}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-blue-700 font-bold block">
                      {weather.precipitation} mm/h
                    </span>
                    <span className="text-[10px] text-slate-500">Pluie instantanée</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Vent marin</span>
                    <strong className="text-slate-800 font-mono">{weather.windSpeed} km/h</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-500 block">Humidité relative</span>
                    <strong className="text-slate-800 font-mono">{weather.humidity}%</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">Connexion météo...</div>
            )}
          </div>

          {/* Inspected Zone Quick Insight */}
          {selectedZone && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Bassin : {selectedZone.quartier}
                </span>
                <RiskBadge level={selectedZone.niveau_de_risque} size="sm" />
              </div>

              <h4 className="font-bold text-sm text-slate-900">{selectedZone.nom_zone}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedZone.description}</p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500">État d'inondation :</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${selectedZone.est_inonde ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                  {selectedZone.est_inonde ? 'INONDÉ' : 'NORMAL'}
                </span>
              </div>

              <button
                onClick={() => onNavigate('admin_zones', { zoneId: selectedZone.id_zone })}
                className="w-full mt-2 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center"
              >
                Modifier cette zone &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Latest Citizen Reports to Review */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Derniers Signalements Citoyens Réceptionnés
            </h3>
            <p className="text-xs text-slate-500">
              Vérification humaine obligatoire avant validation et prise en charge.
            </p>
          </div>

          <button
            onClick={() => onNavigate('admin_signalements')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Voir tous les signalements ({signalements.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentReports.map((sig) => {
            const isPending = sig.statut === 'en attente';
            const zoneNames = zones
              .filter((z) => sig.zones_concernees.includes(z.id_zone))
              .map((z) => z.quartier)
              .join(', ') || 'Douala';

            return (
              <div
                key={sig.id_signalement}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{sig.nom_auteur}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        sig.statut === 'validé'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sig.statut === 'en attente'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {sig.statut}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Quartier : <strong>{zoneNames}</strong> · {sig.hauteur_eau || 'Niveau inconnu'}
                  </div>
                  <p className="text-xs text-slate-700 mt-2 line-clamp-2">{sig.description}</p>
                </div>

                {isPending ? (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                    <button
                      onClick={() =>
                        validateReport(
                          sig.id_signalement,
                          'Signalement vérifié par la CUD. Équipe d\'intervention dépêchée.'
                        )
                      }
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valider</span>
                    </button>
                    <button
                      onClick={() =>
                        rejectReport(sig.id_signalement, 'Non urgent ou situation régularisée.')
                      }
                      className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rejeter</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    {sig.note_admin || 'Traité par l\'administration.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
