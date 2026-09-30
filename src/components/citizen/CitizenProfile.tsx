import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { storageService } from '../../services/storageService';
import { CanalDiffusion } from '../../types';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Bell,
  Trash2,
  Check,
  AlertTriangle,
  MessageSquare,
  Smartphone,
  Radio,
  Shield,
} from 'lucide-react';

export const CitizenProfile: React.FC = () => {
  const { user, deleteAccount, currentNeighborhood, setCurrentNeighborhood } = useAuth();
  const { signalements } = useAlerts();

  const [channels, setChannels] = useState<CanalDiffusion[]>(
    user?.canaux_preferes || ['SMS', 'WhatsApp', 'Notification']
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleChannel = (ch: CanalDiffusion) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const users = storageService.getUtilisateurs();
      const updated = users.map((u) =>
        u.id_utilisateur === user.id_utilisateur
          ? { ...u, canaux_preferes: channels, adresse: currentNeighborhood }
          : u
      );
      localStorage.setItem('alertedouala_utilisateurs_v1', JSON.stringify(updated));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const myReports = signalements.filter(
    (s) => s.id_utilisateur === (user?.id_utilisateur || 'user_demo_1')
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-xs">
            {user?.prenom?.[0] || 'C'}{user?.nom?.[0] || 'D'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {user ? `${user.prenom} ${user.nom}` : 'Profil Citoyen'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Habitant de Douala · Quartier : <strong className="text-slate-700">{currentNeighborhood}</strong>
            </p>
          </div>
        </div>

        <div className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 self-start sm:self-auto text-xs font-semibold text-blue-800">
          {myReports.length} signalement(s) transmis
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Préférences de réception mises à jour avec succès.</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Informations Personnelles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block">Adresse e-mail</span>
              <span className="font-semibold text-slate-800">{user?.email || 'citoyen@alertedouala.cm'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <span className="text-slate-400 text-[11px] block">Téléphone d'urgence</span>
              <span className="font-semibold text-slate-800 font-mono">{user?.telephone || '+237 699 12 34 56'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3 sm:col-span-2">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
            <div className="flex-1">
              <span className="text-slate-400 text-[11px] block">Quartier de résidence principal</span>
              <span className="font-semibold text-slate-800">{currentNeighborhood}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <form onSubmit={handleSavePreferences} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Canaux d'Alerte Préférés
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choisissez par quels moyens vous souhaitez recevoir les alertes d'évacuation ou d'inondation de votre quartier.
          </p>
        </div>

        <div className="space-y-2.5">
          {[
            {
              id: 'SMS' as CanalDiffusion,
              title: 'Alerte SMS Direct',
              desc: 'Diffusion prioritaire même en cas de coupure de réseau internet mobile ou 4G.',
              icon: Smartphone,
            },
            {
              id: 'WhatsApp' as CanalDiffusion,
              title: 'Canal Officiel WhatsApp CUD',
              desc: 'Réception des bulletins météo illustrés et cartes des zones praticables.',
              icon: MessageSquare,
            },
            {
              id: 'Notification' as CanalDiffusion,
              title: 'Notifications In-App & Web Push',
              desc: 'Toasts sonores et visuels instantanés dès validation d\'une alerte municipale.',
              icon: Radio,
            },
          ].map((item) => {
            const isChecked = channels.includes(item.id);
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => toggleChannel(item.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isChecked
                    ? 'border-blue-500 bg-blue-50/40 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isChecked ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleChannel(item.id)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Enregistrer mes canaux de diffusion
          </button>
        </div>
      </form>

      {/* Account Deletion (Explicit requirement: "Un utilisateur peut supprimer son compte à tout moment (Profil)") */}
      <div className="bg-red-50/60 rounded-2xl p-5 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider">
            Zone Dangereuse : Suppression de compte
          </h4>
          <p className="text-xs text-red-700/90 mt-0.5 max-w-md">
            Conformément à la protection des données, vous pouvez supprimer définitivement votre compte et l'historique de vos signalements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center justify-center gap-1.5 py-2 px-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Supprimer mon compte</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                Supprimer définitivement votre compte ?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Cette action est irréversible. Vous ne recevrez plus les alertes ciblées par SMS ou notification push.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAccount();
                  setShowDeleteModal(false);
                }}
                className="py-2 px-3 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shadow-2xs"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
