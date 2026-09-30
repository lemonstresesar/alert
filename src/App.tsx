import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { Header } from './components/common/Header';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';

// Citizen components
import { CitizenHome } from './components/citizen/CitizenHome';
import { CitizenMap } from './components/citizen/CitizenMap';
import { CitizenAlerts } from './components/citizen/CitizenAlerts';
import { CitizenReport } from './components/citizen/CitizenReport';
import { CitizenForecast } from './components/citizen/CitizenForecast';
import { CitizenProfile } from './components/citizen/CitizenProfile';
import { CitizenShelters } from './components/citizen/CitizenShelters';

// Admin component
import { AdminLayout } from './components/admin/AdminLayout';

function MainApp() {
  const { role, user, admin, switchViewMode } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('accueil');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedZoneIdForReport, setSelectedZoneIdForReport] = useState<string | undefined>();

  // If user is logged in as admin and in admin view
  if (role === 'admin') {
    return (
      <>
        <ToastContainer />
        <AdminLayout
          activeTab={activeTab.startsWith('admin_') ? activeTab : 'admin_dashboard'}
          setActiveTab={setActiveTab}
          onSwitchToCitizen={() => {
            switchViewMode('citoyen');
            setActiveTab('accueil');
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </>
    );
  }

  // Citizen / Public View
  const handleCitizenNavigate = (tab: string, extra?: { zoneId?: string }) => {
    setActiveTab(tab);
    if (extra?.zoneId) {
      setSelectedZoneIdForReport(extra.zoneId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <ToastContainer />

      <div>
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        {/* Citizen Content View */}
        <main className="w-full">
          {activeTab === 'accueil' && (
            <CitizenHome onNavigate={handleCitizenNavigate} />
          )}
          {activeTab === 'carte' && (
            <CitizenMap
              onNavigateToReport={(zId) => {
                setSelectedZoneIdForReport(zId);
                setActiveTab('signaler');
              }}
              onSelectZoneForAlerts={() => setActiveTab('alertes')}
            />
          )}
          {activeTab === 'alertes' && <CitizenAlerts />}
          {activeTab === 'refuges' && <CitizenShelters />}
          {activeTab === 'signaler' && (
            <CitizenReport initialZoneId={selectedZoneIdForReport} />
          )}
          {activeTab === 'previsions' && <CitizenForecast />}
          {activeTab === 'profil' && <CitizenProfile />}
        </main>
      </div>

      {/* Citizen Footer for Desktop */}
      <footer className="hidden md:block bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">AlerteDouala</span>
            <span>·</span>
            <span>Système Municipal de Prévention des Crues & Inondations</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Douala, Région du Littoral, Cameroun</span>
            <span>·</span>
            <span>Urgences 118 / 117</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar */}
      <MobileBottomBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <MainApp />
      </AlertProvider>
    </AuthProvider>
  );
}
