import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { storageService } from '../../services/storageService';
import { TypeIncident } from '../../types';
import { DoualaMap } from '../map/DoualaMap';
import {
  Camera,
  MapPin,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Mountain,
  Zap,
  Waves,
  Trash2,
  Crosshair,
  X,
} from 'lucide-react';

interface CitizenReportProps {
  initialZoneId?: string;
}

export const CitizenReport: React.FC<CitizenReportProps> = ({ initialZoneId }) => {
  const { user, currentNeighborhood } = useAuth();
  const { zones, signalements, refreshData } = useAlerts();

  // Disaster Type Selection
  const [typeIncident, setTypeIncident] = useState<TypeIncident>('Inondation / Crue');

  // Zone Mode: 'predefined' or 'custom'
  const [zoneMode, setZoneMode] = useState<'predefined' | 'custom'>('predefined');
  const [selectedZones, setSelectedZones] = useState<string[]>(
    initialZoneId
      ? [initialZoneId]
      : [zones.find((z) => z.quartier === currentNeighborhood)?.id_zone || zones[0]?.id_zone || 'zone_makèpé']
  );
  const [customZoneText, setCustomZoneText] = useState('');
  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Form details
  const [description, setDescription] = useState('');
  const [waterLevel, setWaterLevel] = useState('Genou (30-50 cm)');
  const [gravite, setGravite] = useState<'modéré' | 'grave' | 'critique / urgence vitale'>('grave');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const INCIDENT_CATEGORIES: {
    type: TypeIncident;
    label: string;
    icon: any;
    desc: string;
  }[] = [
    {
      type: 'Inondation / Crue',
      label: 'Inondation / Montée des eaux',
      icon: Waves,
      desc: 'Débordement de cours d\'eau, drain bouché, voies submergées',
    },
    {
      type: 'Effondrement d’immeuble / bâtiment',
      label: 'Effondrement d’immeuble ou mur',
      icon: Building2,
      desc: 'Fissures critiques, affaissement de dalle, bâtiment menaçant ruine',
    },
    {
      type: 'Éboulement / Glissement de terrain',
      label: 'Éboulement / Glissement de talus',
      icon: Mountain,
      desc: 'Ravinement de pente, glissement de terre vers des habitations',
    },
    {
      type: 'Pont / Chaussée coupée',
      label: 'Pont ou route coupée / affaissée',
      icon: AlertTriangle,
      desc: 'Radier emporté, trou béant sur la chaussée, circulation interrompue',
    },
    {
      type: 'Poteau ou câble électrique à terre',
      label: 'Câble / Poteau électrique tombé',
      icon: Zap,
      desc: 'Danger d\'électrocution immédiat au sol ou dans l\'eau',
    },
    {
      type: 'Collecteur / Caniveau saturé',
      label: 'Caniveau bouché par ordures',
      icon: Trash2,
      desc: 'Obstruction massive provoquant un refoulement chez les riverains',
    },
  ];

  const toggleZone = (zoneId: string) => {
    setSelectedZones((prev) =>
      prev.includes(zoneId)
        ? prev.length > 1
          ? prev.filter((id) => id !== zoneId)
          : prev
        : [...prev, zoneId]
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    if (zoneMode === 'custom' && !customZoneText.trim()) {
      alert('Veuillez préciser le nom du quartier ou lieu-dit.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      storageService.createSignalement({
        id_utilisateur: user?.id_utilisateur || 'anonyme_citoyen',
        nom_auteur: user ? `${user.prenom} ${user.nom}` : 'Citoyen de Douala',
        telephone_auteur: user?.telephone || '+237 699 00 00 00',
        type_incident: typeIncident,
        description,
        photo: photoBase64 || undefined,
        zones_concernees: zoneMode === 'predefined' ? selectedZones : [],
        zone_personnalisee: zoneMode === 'custom' ? customZoneText.trim() : undefined,
        coordonnees_gps: customCoords || undefined,
        hauteur_eau: typeIncident === 'Inondation / Crue' ? waterLevel : undefined,
        gravite,
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setDescription('');
      setPhotoBase64(null);
      setCustomZoneText('');
      setCustomCoords(null);
      refreshData();

      setTimeout(() => setSubmitSuccess(false), 6000);
    }, 400);
  };

  const myReports = signalements.filter(
    (s) => s.id_utilisateur === (user?.id_utilisateur || 'user_demo_1')
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-8">
      {/* Title & Concise Intro */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Signaler un Sinistre ou Danger à Douala
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Alertez les secours municipaux : inondations, effondrements de bâtiments, glissements de terrain ou voies coupées.
        </p>
      </div>

      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-sm font-bold block text-emerald-950">
              Signalement transmis à la cellule d'urgence !
            </strong>
            Votre observation est en cours de traitement. Dès validation par un administrateur, vous recevrez la notification « Prise en charge ».
          </div>
        </div>
      )}

      {/* Main Clean Form */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Type of Disaster */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              1. Type d'incident à signaler
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {INCIDENT_CATEGORIES.map((cat) => {
                const isSelected = typeIncident === cat.type;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.type}
                    type="button"
                    onClick={() => setTypeIncident(cat.type)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[75px] ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-900 leading-tight">
                        {cat.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Location (Predefined or Custom Non-predefined Zone) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Localisation du danger
              </label>

              {/* Toggle mode: Predefined list vs Custom Zone */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setZoneMode('predefined')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    zoneMode === 'predefined'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Quartiers répertoriés
                </button>
                <button
                  type="button"
                  onClick={() => setZoneMode('custom')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    zoneMode === 'custom'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Autre quartier / Lieu-dit libre
                </button>
              </div>
            </div>

            {zoneMode === 'predefined' ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {zones.map((zone) => {
                  const isChecked = selectedZones.includes(zone.id_zone);
                  return (
                    <button
                      key={zone.id_zone}
                      type="button"
                      onClick={() => toggleZone(zone.id_zone)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        isChecked
                          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{zone.quartier}</span>
                        <span className="text-[10px] text-blue-600 font-bold">{isChecked ? '✓' : ''}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Précisez le nom du quartier, lieu-dit ou repère :
                  </label>
                  <input
                    type="text"
                    value={customZoneText}
                    onChange={(e) => setCustomZoneText(e.target.value)}
                    placeholder="Ex: PK 14, Ndogpassi 3, Cité Cicam, Bessenguè, Village, Dakar..."
                    required={zoneMode === 'custom'}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-blue-700 shadow-2xs cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>
                      {customCoords
                        ? `GPS pointé (${customCoords.lat.toFixed(3)}°N, ${customCoords.lng.toFixed(3)}°E)`
                        : 'Pointer l\'emplacement exact sur la carte'}
                    </span>
                  </button>

                  {customCoords && (
                    <button
                      type="button"
                      onClick={() => setCustomCoords(null)}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Effacer repère GPS
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Contextual Condition: Water height only for Inundation */}
          {typeIncident === 'Inondation / Crue' && (
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Niveau d'eau approximatif
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Cheville (10-20 cm)', desc: 'Rigoles pleines, passage délicat' },
                  { label: 'Genou (30-50 cm)', desc: 'Véhicules et motos immobilisés' },
                  { label: 'Taille (>80 cm)', desc: 'Boutiques et concessions submergées' },
                ].map((lvl) => (
                  <button
                    key={lvl.label}
                    type="button"
                    onClick={() => setWaterLevel(lvl.label)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      waterLevel === lvl.label
                        ? 'border-blue-600 bg-blue-50/70 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="text-xs text-slate-900 font-bold">{lvl.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Contextual Warning for Building Collapse or Power line */}
          {typeIncident === 'Effondrement d’immeuble / bâtiment' && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>
                <strong>Alerte Sécurité :</strong> Éloignez immédiatement les passants du périmètre de chute. Ne tentez pas de rentrer dans un édifice fissuré. Les Sapeurs-Pompiers (118) sont notifiés prioritairement.
              </span>
            </div>
          )}

          {typeIncident === 'Poteau ou câble électrique à terre' && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Danger d'électrocution :</strong> Ne vous approchez pas à moins de 20 mètres. L'eau conduit le courant électrique.
              </span>
            </div>
          )}

          {/* Severity Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Degré de gravité constaté
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'modéré', label: 'Modéré', desc: 'Pas de danger vital direct' },
                  { id: 'grave', label: 'Grave', desc: 'Dégâts matériels majeurs / blocage' },
                  { id: 'critique / urgence vitale', label: 'Critique / Urgence', desc: 'Vies en danger / évacuation' },
                ] as const
              ).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGravite(g.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    gravite === g.id
                      ? 'border-red-600 bg-red-50/60 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{g.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Description claire du sinistre
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisez le carrefour, les repères visuels, l'évolution de la situation..."
              required
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Joindre une photo du sinistre (Optionnel)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {photoBase64 && (
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200 w-full sm:w-auto">
                  <img
                    src={photoBase64}
                    alt="Aperçu"
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 block">Photo prête</span>
                    <button
                      type="button"
                      onClick={() => setPhotoBase64(null)}
                      className="text-[11px] text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Envoi en cours...' : 'Transmettre l\'alerte citoyenne'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Map Picker Modal for Custom Non-Predefined Coordinates */}
      {showMapPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Cliquez sur la carte pour pointer l'incident
              </h3>
              <button
                onClick={() => setShowMapPicker(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <DoualaMap
              zones={zones}
              height="350px"
              allowPointSelection={true}
              selectedCoordinates={customCoords}
              onSelectCoordinates={(coords) => setCustomCoords(coords)}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">
                {customCoords
                  ? `Position choisie : ${customCoords.lat.toFixed(4)}°N, ${customCoords.lng.toFixed(4)}°E`
                  : 'Cliquez n\'importe où sur Douala pour placer le repère.'}
              </span>
              <button
                type="button"
                onClick={() => setShowMapPicker(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs"
              >
                Valider cet emplacement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Reports Tracking / Suivi simplifié */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900">
            Mes signalements récents ({myReports.length})
          </h3>
          <span className="text-[11px] text-slate-500">Suivi en temps réel</span>
        </div>

        {myReports.length > 0 ? (
          <div className="space-y-3">
            {myReports.map((sig) => {
              const zoneLabel = sig.zone_personnalisee
                ? sig.zone_personnalisee
                : zones
                    .filter((z) => sig.zones_concernees.includes(z.id_zone))
                    .map((z) => z.quartier)
                    .join(', ') || 'Douala';

              const isValidated = sig.statut === 'validé';
              const isPending = sig.statut === 'en attente';

              return (
                <div
                  key={sig.id_signalement}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                    isValidated
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : isPending
                      ? 'bg-amber-50/30 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          isValidated
                            ? 'bg-emerald-600 text-white'
                            : isPending
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-600 text-white'
                        }`}
                      >
                        {sig.statut}
                      </span>
                      <strong className="text-slate-900">{sig.type_incident || 'Inondation'}</strong>
                      <span className="text-slate-500">· {zoneLabel}</span>
                    </div>
                    <span className="text-slate-400 text-[10px] font-mono">
                      {new Date(sig.date).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-slate-700 leading-relaxed">{sig.description}</p>

                  {/* Required "Prise en charge" notice */}
                  {isValidated && (
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-950 font-medium text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>
                        <strong>Prise en charge :</strong> {sig.note_admin || 'Équipes d\'intervention mobilisées.'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-2">
            Aucun signalement envoyé pour l'instant.
          </p>
        )}
      </div>
    </div>
  );
};
