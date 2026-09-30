import React, { useState } from 'react';
import { useAlerts } from '../../context/AlertContext';
import { StatutSignalement, TypeIncident, Signalement } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  CloudRain,
  Building2,
  Mountain,
  AlertTriangle,
  Zap,
  Waves,
  Crosshair,
  Trash2,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { signalements, zones, validateReport, rejectReport } = useAlerts();

  const [filterStatut, setFilterStatut] = useState<StatutSignalement | 'all'>('en attente');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [selectedReportForAction, setSelectedReportForAction] = useState<{
    id: string;
    action: 'valider' | 'rejeter';
  } | null>(null);
  const [adminNote, setAdminNote] = useState('');

  const filteredReports = signalements.filter((sig) => {
    if (filterStatut !== 'all' && sig.statut !== filterStatut) return false;
    if (filterType !== 'all' && sig.type_incident !== filterType) return false;
    if (
      searchAuthor &&
      !sig.nom_auteur.toLowerCase().includes(searchAuthor.toLowerCase()) &&
      !sig.description.toLowerCase().includes(searchAuthor.toLowerCase()) &&
      !(sig.zone_personnalisee && sig.zone_personnalisee.toLowerCase().includes(searchAuthor.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleConfirmAction = () => {
    if (!selectedReportForAction) return;

    if (selectedReportForAction.action === 'valider') {
      validateReport(
        selectedReportForAction.id,
        adminNote || 'Signalement validé par la cellule de crise. Équipes sur le terrain.'
      );
    } else {
      rejectReport(
        selectedReportForAction.id,
        adminNote || 'Non vérifié ou incident sans gravité avérée.'
      );
    }

    setSelectedReportForAction(null);
    setAdminNote('');
  };

  const getIncidentIcon = (type?: TypeIncident) => {
    switch (type) {
      case 'Effondrement d’immeuble / bâtiment':
        return <Building2 className="w-4 h-4 text-purple-600" />;
      case 'Éboulement / Glissement de terrain':
        return <Mountain className="w-4 h-4 text-amber-700" />;
      case 'Pont / Chaussée coupée':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'Poteau ou câble électrique à terre':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Collecteur / Caniveau saturé':
        return <Trash2 className="w-4 h-4 text-slate-600" />;
      case 'Inondation / Crue':
      default:
        return <Waves className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Validation & Examen des Signalements Citoyens
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervision de tous les sinistres : inondations, effondrements, éboulements et urgences urbaines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['all', 'en attente', 'validé', 'rejeté'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatut(s)}
                className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                  filterStatut === s
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'all' ? 'Tous' : s}
              </button>
            ))}
          </div>

          {/* Incident Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
          >
            <option value="all">Tous types d'incidents</option>
            <option value="Inondation / Crue">Inondations / Crues</option>
            <option value="Effondrement d’immeuble / bâtiment">Effondrements</option>
            <option value="Éboulement / Glissement de terrain">Éboulements</option>
            <option value="Pont / Chaussée coupée">Voies coupées</option>
            <option value="Poteau ou câble électrique à terre">Dangers électriques</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((sig) => {
            const targetedZones = zones.filter((z) => sig.zones_concernees.includes(z.id_zone));
            const zoneLabel = sig.zone_personnalisee
              ? `Lieu personnalisé : ${sig.zone_personnalisee}`
              : targetedZones.map((z) => z.quartier).join(', ') || 'Douala';

            const isPending = sig.statut === 'en attente';
            const isValidated = sig.statut === 'validé';
            const isRejected = sig.statut === 'rejeté';

            return (
              <div
                key={sig.id_signalement}
                className={`bg-white rounded-2xl border p-5 sm:p-6 transition-all ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-100 shadow-xs'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Author and Incident details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                          isValidated
                            ? 'bg-emerald-600 text-white'
                            : isPending
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-600 text-white'
                        }`}
                      >
                        {isValidated && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isPending && <Clock className="w-3.5 h-3.5" />}
                        {isRejected && <XCircle className="w-3.5 h-3.5" />}
                        <span>{sig.statut}</span>
                      </span>

                      {/* Incident Type with Icon */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
                        {getIncidentIcon(sig.type_incident)}
                        <span>{sig.type_incident || 'Inondation'}</span>
                      </span>

                      {/* Location Badge */}
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {zoneLabel}
                      </span>

                      {sig.coordonnees_gps && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                          <Crosshair className="w-3 h-3" />
                          {sig.coordonnees_gps.lat.toFixed(3)}°N, {sig.coordonnees_gps.lng.toFixed(3)}°E
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      {sig.description}
                    </p>

                    {/* Metadata strip: Author, Phone, Time, Water Level / Gravity */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-800">{sig.nom_auteur}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sig.telephone_auteur}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(sig.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {sig.hauteur_eau && (
                        <div className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold text-[11px]">
                          Eau : {sig.hauteur_eau}
                        </div>
                      )}
                      {sig.gravite && (
                        <div className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-bold text-[11px] capitalize">
                          Gravité : {sig.gravite}
                        </div>
                      )}
                    </div>

                    {/* Zone Weather Context */}
                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs flex items-center justify-between text-blue-900">
                      <div className="flex items-center gap-2">
                        <CloudRain className="w-4 h-4 text-blue-600" />
                        <span>
                          Météo Douala : Mousson active, ruissellement et saturation des sols en cours.
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-blue-700">Open-Meteo direct</span>
                    </div>

                    {/* Admin notes if already processed */}
                    {sig.note_admin && (
                      <div className="text-xs text-slate-600 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200">
                        <strong className="text-slate-800">Note administrative :</strong> {sig.note_admin}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Photo preview & Action buttons */}
                  <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0">
                    {sig.photo ? (
                      <div className="relative group">
                        <img
                          src={sig.photo}
                          alt="Photo du signalement"
                          className="w-32 h-24 object-cover rounded-xl border border-slate-200 shadow-2xs"
                        />
                        <span className="text-[10px] text-slate-500 block text-center mt-1">
                          Photo citoyenne
                        </span>
                      </div>
                    ) : (
                      <div className="w-32 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] text-slate-400 text-center p-2">
                        Aucune photo
                      </div>
                    )}

                    {/* Decision Buttons */}
                    {isPending ? (
                      <div className="flex items-center gap-2 w-full md:w-auto pt-2">
                        <button
                          onClick={() => {
                            setSelectedReportForAction({ id: sig.id_signalement, action: 'valider' });
                            setAdminNote('Équipe d\'intervention mobilisée sur zone.');
                          }}
                          className="flex-1 md:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Valider (Prise en charge)</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReportForAction({ id: sig.id_signalement, action: 'rejeter' });
                            setAdminNote('Incident mineur ou situation déjà stabilisée.');
                          }}
                          className="flex-1 md:flex-initial px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Rejeter</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedReportForAction({
                            id: sig.id_signalement,
                            action: isValidated ? 'rejeter' : 'valider',
                          });
                          setAdminNote('');
                        }}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        Changer la décision
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center text-slate-500 text-xs">
            Aucun signalement ne correspond aux filtres sélectionnés.
          </div>
        )}
      </div>

      {/* Action Validation / Rejection Modal */}
      {selectedReportForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              {selectedReportForAction.action === 'valider'
                ? 'Valider et Confirmer la Prise en Charge'
                : 'Rejeter le Signalement'}
            </h3>
            <p className="text-xs text-slate-500">
              {selectedReportForAction.action === 'valider'
                ? "Le citoyen recevra immédiatement la notification « Signalement pris en charge »."
                : "Le citoyen pourra consulter le motif du rejet dans son profil."}
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Note administrative d'intervention :
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Précisez les mesures engagées..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReportForAction(null)}
                className="py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`py-2 px-3 rounded-xl text-white text-xs font-bold transition-colors shadow-2xs ${
                  selectedReportForAction.action === 'valider'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirmer la décision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
