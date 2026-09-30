import React, { useState } from 'react';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Alerte, CanalDiffusion, NiveauRisque, TypeAlerte } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Send,
  AlertOctagon,
  X,
  CheckCircle2,
  Smartphone,
  MessageSquare,
  Radio,
  AlertCircle,
} from 'lucide-react';

export const AdminAlerts: React.FC = () => {
  const { alertes, zones, broadcastAlert, refreshData } = useAlerts();
  const { admin } = useAuth();

  // Create/Edit Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlerteId, setEditingAlerteId] = useState<string | null>(null);

  // Form Fields
  const [typeAlerte, setTypeAlerte] = useState<TypeAlerte>('Crue subite');
  const [message, setMessage] = useState('');
  const [niveauUrgence, setNiveauUrgence] = useState<NiveauRisque>('critique');
  const [selectedZones, setSelectedZones] = useState<string[]>(['zone_makèpé']);
  const [selectedChannels, setSelectedChannels] = useState<CanalDiffusion[]>(['SMS', 'WhatsApp', 'Notification']);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Explicit Human Authorization Modal before broadcast
  const [showAuthConfirmModal, setShowAuthConfirmModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{
    typeAlerte: TypeAlerte;
    message: string;
    niveauUrgence: NiveauRisque;
    zones: string[];
    canaux: CanalDiffusion[];
  } | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingAlerteId(null);
    setTypeAlerte('Crue subite');
    setMessage('');
    setNiveauUrgence('critique');
    setSelectedZones(['zone_makèpé']);
    setSelectedChannels(['SMS', 'WhatsApp', 'Notification']);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (alerte: Alerte) => {
    // Vérification d'existence préalable
    const exists = storageService.getAlerteById(alerte.id_alerte);
    if (!exists) {
      alert("Erreur : Cette alerte n'existe plus dans la base de données.");
      return;
    }
    setEditingAlerteId(alerte.id_alerte);
    setTypeAlerte(alerte.type_alerte);
    setMessage(alerte.message);
    setNiveauUrgence(alerte.niveau_urgence);
    setSelectedZones(alerte.zones_destinataires);
    setSelectedChannels(alerte.canaux);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const toggleZone = (id: string) => {
    setSelectedZones((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((z) => z !== id) : prev) : [...prev, id]
    );
  };

  const toggleChannel = (ch: CanalDiffusion) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? (prev.length > 1 ? prev.filter((c) => c !== ch) : prev) : [...prev, ch]
    );
  };

  // Submit flow
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Veuillez saisir le contenu du message d\'alerte.');
      return;
    }
    if (selectedZones.length === 0) {
      setErrorMsg('Veuillez sélectionner au moins une zone destinataire.');
      return;
    }

    if (editingAlerteId) {
      // Direct update with existence check
      const updated = storageService.updateAlerte(editingAlerteId, {
        type_alerte: typeAlerte,
        message,
        niveau_urgence: niveauUrgence,
        zones_destinataires: selectedZones,
        canaux: selectedChannels,
      });
      if (!updated) {
        setErrorMsg("L'alerte ciblée n'existe plus.");
        return;
      }
      setIsModalOpen(false);
      refreshData();
    } else {
      // Règle métier : Fenêtre "Autoriser l'envoi ?" affichant le niveau de criticité avant diffusion
      setPendingPayload({
        typeAlerte,
        message,
        niveauUrgence,
        zones: selectedZones,
        canaux: selectedChannels,
      });
      setShowAuthConfirmModal(true);
    }
  };

  // Human Authorization Confirmed
  const handleConfirmAuthorization = () => {
    if (!pendingPayload) return;

    broadcastAlert({
      id_admin: admin?.id_admin || 'admin_1',
      nom_admin: admin?.nom || 'Commandant Njoya (CUD)',
      type_alerte: pendingPayload.typeAlerte,
      message: pendingPayload.message,
      niveau_urgence: pendingPayload.niveauUrgence,
      zones_destinataires: pendingPayload.zones,
      canaux: pendingPayload.canaux,
    });

    setShowAuthConfirmModal(false);
    setPendingPayload(null);
    setIsModalOpen(false);
    refreshData();
  };

  // Delete Action with existence check
  const handleDelete = (id: string) => {
    const success = storageService.deleteAlerte(id);
    if (!success) {
      alert("Erreur : Impossible de supprimer, l'alerte n'existe pas.");
    }
    setDeletingId(null);
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Gestion & Diffusion des Alertes Municipales
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Diffusion multi-canaux (SMS, WhatsApp, Push) soumise à autorisation préalable obligatoire.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une nouvelle alerte</span>
        </button>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Urgence & Type</th>
                <th className="py-3 px-4">Message diffusé</th>
                <th className="py-3 px-4">Zones Cibles</th>
                <th className="py-3 px-4">Canaux</th>
                <th className="py-3 px-4">Date & Émetteur</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {alertes.map((alt) => {
                const targetZoneNames = zones
                  .filter((z) => alt.zones_destinataires.includes(z.id_zone))
                  .map((z) => z.quartier);

                return (
                  <tr key={alt.id_alerte} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <RiskBadge level={alt.niveau_urgence} size="sm" />
                        <div className="font-bold text-slate-900 text-xs">{alt.type_alerte}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="line-clamp-2 text-slate-800 font-medium">{alt.message}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {targetZoneNames.map((name) => (
                          <span
                            key={name}
                            className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {alt.canaux.map((ch) => (
                          <span
                            key={ch}
                            className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      <div>{new Date(alt.date_alerte).toLocaleDateString('fr-FR')} {new Date(alt.date_alerte).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{alt.nom_admin}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(alt)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier l'alerte"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(alt.id_alerte)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer l'alerte"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingAlerteId ? "Modifier l'Alerte Existante" : "Élaborer une Alerte d'Urgence"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Type d'événement
                  </label>
                  <select
                    value={typeAlerte}
                    onChange={(e) => setTypeAlerte(e.target.value as TypeAlerte)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Crue subite">Crue subite</option>
                    <option value="Forte pluie">Forte pluie</option>
                    <option value="Effondrement / Éboulement">Effondrement / Éboulement</option>
                    <option value="Danger électrique & Voirie">Danger électrique & Voirie</option>
                    <option value="Marée haute Wouri">Marée haute Wouri</option>
                    <option value="Évacuation préventive">Évacuation préventive</option>
                    <option value="Vigilance orage">Vigilance orage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Niveau de Criticité
                  </label>
                  <select
                    value={niveauUrgence}
                    onChange={(e) => setNiveauUrgence(e.target.value as NiveauRisque)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white capitalize"
                  >
                    <option value="critique">Critique (Rouge)</option>
                    <option value="élevé">Élevé (Orange)</option>
                    <option value="modéré">Modéré (Jaune)</option>
                    <option value="faible">Faible (Vert)</option>
                  </select>
                </div>
              </div>

              {/* Target Zones Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Zones Cibles Destinataires (Sélection multiple)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
                  {zones.map((z) => {
                    const isChecked = selectedZones.includes(z.id_zone);
                    return (
                      <button
                        key={z.id_zone}
                        type="button"
                        onClick={() => toggleZone(z.id_zone)}
                        className={`p-2 rounded-lg text-xs font-semibold text-left border transition-all ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{z.quartier}</span>
                          <span className="text-[10px]">{isChecked ? '✓' : ''}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message d'alerte et consignes pour les citoyens
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="ALERTE CRUE : Débordement majeur du collecteur... Consignes : éviter de traverser..."
                  required
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Distribution Channels */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Canaux de diffusion simulés
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['SMS', 'WhatsApp', 'Notification'] as CanalDiffusion[]).map((ch) => {
                    const isSelected = selectedChannels.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                          isSelected
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {ch === 'SMS' && <Smartphone className="w-3.5 h-3.5" />}
                        {ch === 'WhatsApp' && <MessageSquare className="w-3.5 h-3.5" />}
                        {ch === 'Notification' && <Radio className="w-3.5 h-3.5" />}
                        <span>{ch}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingAlerteId ? "Mettre à jour l'alerte" : "Étape d'Autorisation &rarr;"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Explicit Human Authorization Confirmation Modal */}
      {showAuthConfirmModal && pendingPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Autoriser la Diffusion Immédiate ?
                </h3>
                <p className="text-xs text-slate-500">
                  Validation humaine requise par la cellule de crise CUD.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Niveau de criticité :</span>
                <RiskBadge level={pendingPayload.niveauUrgence} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Zones alertées :</span>
                <span className="font-semibold text-slate-800">
                  {zones
                    .filter((z) => pendingPayload.zones.includes(z.id_zone))
                    .map((z) => z.quartier)
                    .join(', ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Canaux :</span>
                <span className="font-semibold text-blue-700">
                  {pendingPayload.canaux.join(' + ')}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed italic bg-red-50 p-2.5 rounded-lg border border-red-100">
              « {pendingPayload.message} »
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAuthConfirmModal(false)}
                className="py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Refuser / Modifier
              </button>
              <button
                type="button"
                onClick={handleConfirmAuthorization}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                AUTORISER ET DIFFUSER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Verification Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              Confirmer la suppression de cette alerte ?
            </h3>
            <p className="text-xs text-slate-500">
              Cette alerte ne sera plus visible sur les interfaces citoyennes.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                className="py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
