import React from 'react';
import { Home, MapPin, Bell, AlertTriangle, CloudRain, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../context/AlertContext';

interface MobileBottomBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const { role } = useAuth();
  const { alertes } = useAlerts();

  if (role === 'admin') {
    return null; // Admins use desktop sidebar
  }

  const navItems = [
    { id: 'accueil', label: 'Accueil', icon: Home },
    { id: 'carte', label: 'Carte', icon: MapPin },
    { id: 'refuges', label: 'Refuges', icon: ShieldCheck },
    { id: 'signaler', label: 'Signaler', icon: AlertTriangle, highlight: true },
    { id: 'alertes', label: 'Alertes', icon: Bell, badgeCount: alertes.length },
    { id: 'previsions', label: 'Météo', icon: CloudRain },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="grid grid-cols-6 items-center h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 transition-colors relative ${
                isActive
                  ? 'text-blue-600 font-semibold'
                  : item.highlight
                  ? 'text-blue-700 font-medium'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badgeCount > 9 ? '9+' : item.badgeCount}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[48px]">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
