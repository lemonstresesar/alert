import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { useAlerts } from '../../context/AlertContext';
import { Utilisateur } from '../../types';
import {
  Users,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  Smartphone,
  Radio,
  FileText,
  X,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { signalements, zones } = useAlerts();
  const [users] = useState<Utilisateur[]>(() => storageService.getUtilisateurs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuartier, setSelectedQuartier] = useState<string>('all');
  const [inspectingUser, setInspectingUser] = useState<Utilisateur | null>(null);

  const neighborhoods = Array.from(new Set(users.map((u) => u.adresse))).sort();

  const filteredUsers = users.filter((u) => {
    if (selectedQuartier !== 'all' && u.adresse !== selectedQuartier) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = `${u.prenom} ${u.nom}`.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.telephone.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const getUserReports = (userId: string) => {
    return signalements.filter((s) => s.id_utilisateur === userId);
  };

  return (
    <div className="space-y-6">
      {/* Header & Search/Filter Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Répertoire Citoyen & Abonnés aux Alertes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gestion des comptes citoyens inscrits, suivi des canaux d'alerte et observations transmises.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, tél..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Neighborhood filter */}
          <select
            value={selectedQuartier}
            onChange={(e) => setSelectedQuartier(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-300 font-semibold bg-white cursor-pointer"
          >
            <option value="all">Tous les quartiers ({users.length})</option>
            {neighborhoods.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Citoyen</th>
                <th className="py-3 px-4">Quartier</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Canaux d'Alerte Préférés</th>
                <th className="py-3 px-4">Signalements</th>
                <th className="py-3 px-4">Inscription</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((u) => {
                const userReports = getUserReports(u.id_utilisateur);

                return (
                  <tr key={u.id_utilisateur} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {u.prenom[0]}{u.nom[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.prenom} {u.nom}</div>
                          <div className="text-[11px] text-slate-400 font-mono">ID: {u.id_utilisateur}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        {u.adresse}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono text-slate-700">{u.telephone}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {u.canaux_preferes && u.canaux_preferes.length > 0 ? (
                          u.canaux_preferes.map((ch) => (
                            <span
                              key={ch}
                              className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold"
                            >
                              {ch}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400">Tous canaux</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                          userReports.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {userReports.length} observation(s)
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {new Date(u.date_inscription).toLocaleDateString('fr-FR')}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setInspectingUser(u)}
                        className="py-1 px-3 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg text-slate-700 font-semibold transition-colors text-xs cursor-pointer"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect User Drawer / Modal */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Dossier Citoyen : {inspectingUser.prenom} {inspectingUser.nom}
                </h3>
                <span className="text-xs text-slate-500">
                  Résident du quartier {inspectingUser.adresse}
                </span>
              </div>
              <button
                onClick={() => setInspectingUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Téléphone</span>
                <span className="font-bold text-slate-800 font-mono">{inspectingUser.telephone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">E-mail</span>
                <span className="font-bold text-slate-800">{inspectingUser.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date d'adhésion</span>
                <span className="font-mono text-slate-700">{new Date(inspectingUser.date_inscription).toLocaleDateString('fr-FR')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Canaux autorisés</span>
                <span className="font-semibold text-blue-700">{inspectingUser.canaux_preferes?.join(', ')}</span>
              </div>
            </div>

            {/* List of reports submitted by this user */}
            <div>
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
                Historique des Signalements Reçus ({getUserReports(inspectingUser.id_utilisateur).length})
              </h4>
              <div className="space-y-2">
                {getUserReports(inspectingUser.id_utilisateur).length > 0 ? (
                  getUserReports(inspectingUser.id_utilisateur).map((sig) => (
                    <div key={sig.id_signalement} className="p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sig.statut === 'validé' ? 'bg-emerald-100 text-emerald-800' : sig.statut === 'en attente' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {sig.statut}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {new Date(sig.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-slate-700">{sig.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic py-2 text-center">
                    Aucun signalement émis par ce citoyen.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingUser(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
