import React, { useState } from 'react';
import { useAlerts } from '../../context/AlertContext';
import { NiveauRisque, ZoneDeRisque } from '../../types';
import { DoualaMap } from '../map/DoualaMap';
import { RiskBadge, getRiskColor } from '../common/RiskBadge';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  Radio,
  Layers,
  Users,
} from 'lucide-react';

interface AdminZonesProps {
  initialSelectedZoneId?: string;
}

export const AdminZones: React.FC<AdminZonesProps> = ({ initialSelectedZoneId }) => {
  const { zones, updateRiskZone, createRiskZone, deleteRiskZone } = useAlerts();

  const [selectedZone, setSelectedZone] = useState<ZoneDeRisque | null>(
    zones.find((z) => z.id_zone === initialSelectedZoneId) || zones[0] || null
  );

  // Edit / Add Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

  // Form Fields
  const [nomZone, setNomZone] = useState('');
  const [quartier, setQuartier] = useState('');
  const [niveauRisque, setNiveauRisque] = useState<NiveauRisque>('modéré');
  const [description, setDescription] = useState('');
  const [coursEau, setCoursEau] = useState('');
  const [population, setPopulation] = useState(30000);
  const [lat, setLat] = useState(4.055);
  const [lng, setLng] = useState(9.715);
  const [rayonMetres, setRayonMetres] = useState(1200);
  const [estInonde, setEstInonde] = useState(false);

  const openAddModal = () => {
    setEditingZoneId(null);
    setNomZone('');
    setQuartier('');
    setNiveauRisque('modéré');
    setDescription('');
    setCoursEau('');
    setPopulation(25000);
    setLat(4.05);
    setLng(9.71);
    setRayonMetres(1200);
    setEstInonde(false);
    setIsModalOpen(true);
  };

  const openEditModal = (zone: ZoneDeRisque) => {
    setEditingZoneId(zone.id_zone);
    setNomZone(zone.nom_zone);
    setQuartier(zone.quartier);
    setNiveauRisque(zone.niveau_de_risque);
    setDescription(zone.description);
    setCoursEau(zone.cours_eau_proche || '');
    setPopulation(zone.population_estimee || 30000);
    setLat(zone.lat);
    setLng(zone.lng);
    setRayonMetres(zone.rayon_metres);
    setEstInonde(zone.est_inonde);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomZone || !quartier) return;

    if (editingZoneId) {
      updateRiskZone({
        id_zone: editingZoneId,
        nom_zone: nomZone,
        quartier,
        niveau_de_risque: niveauRisque,
        description,
        cours_eau_proche: coursEau,
        population_estimee: Number(population),
        lat: Number(lat),
        lng: Number(lng),
        rayon_metres: Number(rayonMetres),
        est_inonde: estInonde,
        derniere_mise_a_jour: 'À l\'instant',
      });
    } else {
      createRiskZone({
        id_zone: `zone_${Date.now()}`,
        nom_zone: nomZone,
        quartier,
        niveau_de_risque: niveauRisque,
        description,
        cours_eau_proche: coursEau,
        population_estimee: Number(population),
        lat: Number(lat),
        lng: Number(lng),
        rayon_metres: Number(rayonMetres),
        est_inonde: estInonde,
        derniere_mise_a_jour: 'À l\'instant',
      });
    }

    setIsModalOpen(false);
  };

  // Quick Risk Change from Table
  const handleQuickRiskChange = (zone: ZoneDeRisque, newLevel: NiveauRisque) => {
    updateRiskZone({
      ...zone,
      niveau_de_risque: newLevel,
      derniere_mise_a_jour: 'À l\'instant',
    });
  };

  // Quick Inondé toggle
  const handleToggleInonde = (zone: ZoneDeRisque) => {
    updateRiskZone({
      ...zone,
      est_inonde: !zone.est_inonde,
      derniere_mise_a_jour: 'À l\'instant',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Gestion Cartographique des 10 Bassins & Zones à Risque
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Définition des périmètres de vulnérabilité et actualisation en direct de l'état d'inondation.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une zone</span>
        </button>
      </div>

      {/* Map & Focused Zone Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DoualaMap
            zones={zones}
            selectedZoneId={selectedZone?.id_zone}
            onSelectZone={(z) => setSelectedZone(z)}
            height="460px"
          />
        </div>

        {/* Selected Zone Quick Controls */}
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
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedZone.nom_zone}
                </h3>
              </div>

              {/* Direct Inondé Action */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">État d'inondation actif :</span>
                  <button
                    onClick={() => handleToggleInonde(selectedZone)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedZone.est_inonde
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {selectedZone.est_inonde ? 'EN COURS D\'INONDATION' : 'PAS D\'INONDATION'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Le basculement met à jour immédiatement le badge d'alerte sur la page d'accueil de tous les citoyens de ce quartier.
                </p>
              </div>

              {/* Direct Risk Level Changer */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Modifier le niveau de risque :
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {(['critique', 'élevé', 'modéré', 'faible'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleQuickRiskChange(selectedZone, lvl)}
                      className={`py-1.5 px-2 rounded-lg font-semibold capitalize border transition-all ${
                        selectedZone.niveau_de_risque === lvl
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => openEditModal(selectedZone)}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Éditer toutes les coordonnées SIG</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 text-xs text-slate-400 text-center">
              Sélectionnez une zone sur la carte
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive Zones Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Quartier & Secteur</th>
                <th className="py-3 px-4">Niveau de Risque</th>
                <th className="py-3 px-4">Statut Inondation</th>
                <th className="py-3 px-4">Exutoire / Rivière</th>
                <th className="py-3 px-4">Population</th>
                <th className="py-3 px-4">Coordonnées GPS</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {zones.map((zone) => (
                <tr
                  key={zone.id_zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    selectedZone?.id_zone === zone.id_zone ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{zone.quartier}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">{zone.nom_zone}</div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <RiskBadge level={zone.niveau_de_risque} size="sm" />
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleInonde(zone);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                        zone.est_inonde
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {zone.est_inonde ? 'INONDÉ' : 'NORMAL'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {zone.cours_eau_proche || 'Canal primaire'}
                  </td>

                  <td className="py-3 px-4 font-mono font-medium text-slate-800">
                    {zone.population_estimee?.toLocaleString()} hab.
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {zone.lat.toFixed(3)}°N, {zone.lng.toFixed(3)}°E (r: {zone.rayon_metres}m)
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(zone)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Éditer la zone"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer la zone ${zone.quartier} ?`)) {
                            deleteRiskZone(zone.id_zone);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer la zone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingZoneId ? 'Modifier la Zone de Risque' : 'Créer une Nouvelle Zone'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nom du Quartier</label>
                  <input
                    type="text"
                    value={quartier}
                    onChange={(e) => setQuartier(e.target.value)}
                    placeholder="ex: Bépanda"
                    required
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Niveau de Risque</label>
                  <select
                    value={niveauRisque}
                    onChange={(e) => setNiveauRisque(e.target.value as NiveauRisque)}
                    className="w-full p-2 rounded-lg border border-slate-300 capitalize bg-white"
                  >
                    <option value="critique">Critique</option>
                    <option value="élevé">Élevé</option>
                    <option value="modéré">Modéré</option>
                    <option value="faible">Faible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Désignation complète du secteur</label>
                <input
                  type="text"
                  value={nomZone}
                  onChange={(e) => setNomZone(e.target.value)}
                  placeholder="ex: Bépanda (Omnisports & Bassin TSF)"
                  required
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description hydrologique & vulnérabilité</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Facteurs d'enclavement, pente, nappe..."
                  className="w-full p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cours d'eau / Rivière proche</label>
                  <input
                    type="text"
                    value={coursEau}
                    onChange={(e) => setCoursEau(e.target.value)}
                    placeholder="ex: Rivière Mbanya"
                    className="w-full p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Population exposée</label>
                  <input
                    type="number"
                    value={population}
                    onChange={(e) => setPopulation(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rayon (m)</label>
                  <input
                    type="number"
                    value={rayonMetres}
                    onChange={(e) => setRayonMetres(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-inonde"
                  checked={estInonde}
                  onChange={(e) => setEstInonde(e.target.checked)}
                  className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="chk-inonde" className="font-bold text-slate-800 cursor-pointer">
                  Marquer cette zone comme actuellement inondée
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
