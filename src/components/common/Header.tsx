import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, LogOut, ArrowRightLeft } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
}) => {
  const {
    user,
    admin,
    role,
    logout,
    switchViewMode,
    isSimulatedAdminActingAsUser,
    loginDemoCitoyen,
    loginDemoAdmin,
  } = useAuth();

  const citizenNav = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'carte', label: 'Carte des Risques' },
    { id: 'alertes', label: 'Alertes' },
    { id: 'refuges', label: 'Refuges & Évacuation' },
    { id: 'signaler', label: 'Signaler Incident' },
    { id: 'previsions', label: 'Météo & Crues' },
    { id: 'profil', label: 'Mon Profil' },
  ];

  const adminNav = [
    { id: 'admin_dashboard', label: 'Supervision' },
    { id: 'admin_alertes', label: 'Alertes & Diffusion' },
    { id: 'admin_signalements', label: 'Validation Citoyenne' },
    { id: 'admin_zones', label: 'Zones & Bassins' },
    { id: 'admin_users', label: 'Citoyens' },
  ];

  const currentNav = role === 'admin' ? adminNav : citizenNav;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveTab(role === 'admin' ? 'admin_dashboard' : 'accueil')}
            className="text-xl font-bold tracking-tight text-blue-950 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span>AlerteDouala</span>
            {role === 'admin' ? (
              <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                Gestion Crise
              </span>
            ) : null}
          </button>

          {/* Zone 2: Navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {currentNav.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-blue-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions & User State */}
          <div className="flex items-center gap-2 sm:gap-3">
            {admin && (
              <button
                onClick={() => {
                  if (role === 'admin') {
                    switchViewMode('citoyen');
                    setActiveTab('accueil');
                  } else {
                    switchViewMode('admin');
                    setActiveTab('admin_dashboard');
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
                title="Basculer entre l'interface citoyen et la console admin"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>{role === 'admin' ? 'Vue Citoyen' : 'Console Admin'}</span>
              </button>
            )}

            {user || admin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (role === 'citoyen') setActiveTab('profil');
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    {admin ? <ShieldCheck className="w-4 h-4 text-blue-700" /> : <UserCheck className="w-4 h-4 text-blue-700" />}
                  </div>
                  <div className="hidden lg:block">
                    <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                      {admin ? admin.nom.split(' ')[0] : `${user?.prenom} ${user?.nom}`}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {admin ? 'Protection Civile' : user?.adresse}
                    </div>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuthModal}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                >
                  Connexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
