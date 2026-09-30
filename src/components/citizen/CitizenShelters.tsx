import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import {
  ShieldCheck,
  MapPin,
  Navigation,
  Compass,
  CheckCircle,
  AlertTriangle,
  Phone,
  Clock,
  Building,
  HeartPulse,
  ExternalLink,
} from 'lucide-react';

interface Shelter {
  id: string;
  name: string;
  quartier: string;
  type: 'Stade / Grand Refuge' | 'Centre Médical' | 'Établissement Scolaire' | 'Édifice Public';
  capacite: number;
  altitudeMetres: number;
  distanceKm: number;
  tempsMarcheMinutes: number;
  statutRoute: 'Praticable' | 'Risque d\'inondation sur le trajet';
  contact: string;
  coordonnees: { lat: number; lng: number };
}

export const CitizenShelters: React.FC = () => {
  const { currentNeighborhood } = useAuth();
  const { zones } = useAlerts();

  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    papiers: true,
    eau: false,
    torche: false,
    medicaments: false,
    disjoncteur: false,
  });

  const SHELTERS_DOUALA: Shelter[] = [
    {
      id: 'shelter_1',
      name: 'Stade Omnisports de Bépanda',
      quartier: 'Bépanda',
      type: 'Stade / Grand Refuge',
      capacite: 15000,
      altitudeMetres: 28,
      distanceKm: 2.1,
      tempsMarcheMinutes: 25,
      statutRoute: 'Praticable',
      contact: '+237 233 40 10 00',
      coordonnees: { lat: 4.058, lng: 9.735 },
    },
    {
      id: 'shelter_2',
      name: 'Maison du Parti de Bonanjo',
      quartier: 'Bonanjo',
      type: 'Édifice Public',
      capacite: 4000,
      altitudeMetres: 34,
      distanceKm: 4.8,
      tempsMarcheMinutes: 55,
      statutRoute: 'Praticable',
      contact: '+237 233 42 12 34',
      coordonnees: { lat: 4.043, lng: 9.689 },
    },
    {
      id: 'shelter_3',
      name: 'Hôpital Général de Douala',
      quartier: 'Logbaba / Ndogbong',
      type: 'Centre Médical',
      capacite: 2500,
      altitudeMetres: 42,
      distanceKm: 3.5,
      tempsMarcheMinutes: 40,
      statutRoute: 'Praticable',
      contact: '119 / +237 233 37 01 40',
      coordonnees: { lat: 4.045, lng: 9.755 },
    },
    {
      id: 'shelter_4',
      name: 'Lycée Polyvalent de Bonabéri',
      quartier: 'Bonabéri',
      type: 'Établissement Scolaire',
      capacite: 3500,
      altitudeMetres: 22,
      distanceKm: 6.2,
      tempsMarcheMinutes: 70,
      statutRoute: 'Risque d\'inondation sur le trajet',
      contact: '+237 677 00 11 22',
      coordonnees: { lat: 4.081, lng: 9.668 },
    },
    {
      id: 'shelter_5',
      name: 'École Publique de Deido Grand Moulin',
      quartier: 'Deido',
      type: 'Établissement Scolaire',
      capacite: 2000,
      altitudeMetres: 26,
      distanceKm: 1.8,
      tempsMarcheMinutes: 20,
      statutRoute: 'Praticable',
      contact: '+237 233 41 55 66',
      coordonnees: { lat: 4.065, lng: 9.712 },
    },
    {
      id: 'shelter_6',
      name: 'Paroisse Saint-Paul de Nylon',
      quartier: 'Nylon',
      type: 'Édifice Public',
      capacite: 1800,
      altitudeMetres: 24,
      distanceKm: 3.2,
      tempsMarcheMinutes: 38,
      statutRoute: 'Risque d\'inondation sur le trajet',
      contact: '+237 699 44 55 66',
      coordonnees: { lat: 4.029, lng: 9.729 },
    },
  ];

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checklistCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Plan Communal de Sauvegarde (PCS Douala)
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Refuges Sûrs & Itinéraires d'Évacuation
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Points hauts non inondables et centres de rassemblement d'urgence proches de <strong className="text-slate-900">{currentNeighborhood}</strong>.
          </p>
        </div>

        <div className="bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zone d'accueil sécurisée CUD</span>
        </div>
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHELTERS_DOUALA.map((shelter) => {
          const isSelected = selectedShelter?.id === shelter.id;
          const isSafeRoute = shelter.statutRoute === 'Praticable';

          return (
            <div
              key={shelter.id}
              onClick={() => setSelectedShelter(shelter)}
              className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase">
                    {shelter.type}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Alt. +{shelter.altitudeMetres}m
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-2 leading-snug">
                  {shelter.name}
                </h3>
                <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {shelter.quartier}
                </span>
              </div>

              {/* Metrics strip */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Distance</span>
                  <strong className="text-slate-800 font-mono">{shelter.distanceKm} km</strong>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">Temps à pied</span>
                  <strong className="text-slate-800 font-mono">~{shelter.tempsMarcheMinutes} min</strong>
                </div>
              </div>

              {/* Status and Action */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px]">
                  {isSafeRoute ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Route praticable
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Risque d'eau sur le trajet
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedShelter(shelter);
                  }}
                  className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Itinéraire d'évacuation</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Shelter Modal / Focus Banner */}
      {selectedShelter && (
        <div className="bg-blue-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-1">
            <span className="text-xs uppercase font-mono text-blue-300 font-bold tracking-wider">
              Destination d'évacuation sélectionnée
            </span>
            <h3 className="text-lg font-bold text-white">{selectedShelter.name}</h3>
            <p className="text-xs text-blue-100 max-w-xl">
              Coordonnées GPS : {selectedShelter.coordonnees.lat}°N, {selectedShelter.coordonnees.lng}°E · Capacité d'accueil : {selectedShelter.capacite.toLocaleString()} sinistrés.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedShelter.coordonnees.lat},${selectedShelter.coordonnees.lng}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-white text-blue-950 hover:bg-blue-50 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ouvrir GPS / Navigation</span>
            </a>
            <button
              onClick={() => setSelectedShelter(null)}
              className="text-xs text-blue-200 hover:text-white underline"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Interactive Emergency Survival Kit Checklist */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kit Réflexe d'Évacuation Rapide (Douala)
            </h3>
            <p className="text-xs text-slate-500">
              Préparez ces 5 éléments essentiels avant que l'eau n'atteigne le seuil de votre concession.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
            {checklistCount} / 5 prêts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            {
              id: 'papiers',
              label: 'Papiers d\'identité & Actes protégés',
              desc: 'Sous pochette plastique étanche hermétique.',
            },
            {
              id: 'eau',
              label: 'Eau potable en bouteille fermée',
              desc: 'Minimum 2 litres par personne.',
            },
            {
              id: 'torche',
              label: 'Lampe torche ou téléphone chargé',
              desc: 'En cas de délestage ou coupure Eneo préventive.',
            },
            {
              id: 'medicaments',
              label: 'Médicaments d\'urgence',
              desc: 'Antipaludiques, antiseptique et pansements.',
            },
            {
              id: 'disjoncteur',
              label: 'Disjoncteur général Eneo coupé',
              desc: 'Avant de quitter impérativement le domicile.',
            },
          ].map((item) => {
            const isChecked = checklist[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleCheck(item.id)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <strong className="block leading-tight">{item.label}</strong>
                  <span className="text-[11px] opacity-80 mt-0.5 block">{item.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
