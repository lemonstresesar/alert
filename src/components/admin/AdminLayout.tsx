import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminAlerts } from './AdminAlerts';
import { AdminReports } from './AdminReports';
import { AdminZones } from './AdminZones';
import { AdminUsers } from './AdminUsers';
import { SimulateWeatherModal } from './SimulateWeatherModal';
import {
  LayoutDashboard,
  Bell,
  CheckSquare,
  MapPin,
  Users,
  CloudLightning,
  Eye,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Waves,
} from 'lucide-react';

interface AdminLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchToCitizen: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  setActiveTab,
  onSwitchToCitizen,
}) => {
  const { admin, logout } = useAuth();
  const { signalements, alertes, zones } = useAlerts();

  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [selectedZoneIdForAdmin, setSelectedZoneIdForAdmin] = useState<string | undefined>();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const pendingReportsCount = signalements.filter((s) => s.statut === 'en attente').length;

  const navItems = [
    { id: 'admin_dashboard', label: 'Supervision & SIG', icon: LayoutDashboard },
    {
      id: 'admin_alertes',
      label: 'Diffusion Alertes',
      icon: Bell,
      badge: alertes.length > 0 ? alertes.length : undefined,
    },
    {
      id: 'admin_signalements',
      label: 'Validation Citoyenne',
      icon: CheckSquare,
      badge: pendingReportsCount > 0 ? pendingReportsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'admin_zones', label: 'Zones & Bassins', icon: MapPin },
    { id: 'admin_users', label: 'Citoyens Enregistrés', icon: Users },
  ];

  const handleNavigate = (tab: string, extra?: { zoneId?: string }) => {
    setActiveTab(tab);
    if (extra?.zoneId) {
      setSelectedZoneIdForAdmin(extra.zoneId);
    }
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm tracking-tight">AlerteDouala Admin</span>
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-1.5 text-slate-300 hover:text-white"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar (Desktop 260px & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-slate-900 text-white z-40 flex flex-col justify-between p-4 border-r border-slate-800 transition-transform duration-200 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand & Admin ID */}
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
                AD
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-tight text-white leading-tight">
                  AlerteDouala
                </h2>
                <span className="text-[10px] text-blue-400 font-mono tracking-wider uppercase">
                  Console d'Urgence CUD
                </span>
              </div>
            </div>

            <div className="mt-3 bg-slate-800/80 p-2.5 rounded-xl text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-white block text-[11px] truncate">
                  {admin?.nom || 'Admin CUD'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Officier Supérieur</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Automated Simulation Action Trigger */}
          <div className="pt-2">
            <button
              onClick={() => {
                setIsSimulateModalOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <CloudLightning className="w-4 h-4 text-slate-950" />
              <span>Simuler alerte météo</span>
            </button>
          </div>
        </div>

        {/* Bottom Actions: View as citizen / Logout */}
        <div className="border-t border-slate-800 pt-3 space-y-2">
          <button
            onClick={() => {
              onSwitchToCitizen();
              setIsMobileSidebarOpen(false);
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Basculer vue Citoyen</span>
          </button>

          <button
            onClick={logout}
            className="w-full py-2 px-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/50 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'admin_dashboard' && (
          <AdminDashboard
            onNavigate={handleNavigate}
            onOpenSimulateModal={() => setIsSimulateModalOpen(true)}
          />
        )}
        {activeTab === 'admin_alertes' && <AdminAlerts />}
        {activeTab === 'admin_signalements' && <AdminReports />}
        {activeTab === 'admin_zones' && (
          <AdminZones initialSelectedZoneId={selectedZoneIdForAdmin} />
        )}
        {activeTab === 'admin_users' && <AdminUsers />}
      </main>

      {/* Weather Simulation Modal */}
      <SimulateWeatherModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
      />
    </div>
  );
};
