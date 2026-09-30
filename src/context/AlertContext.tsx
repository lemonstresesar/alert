import React, { createContext, useContext, useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { Alerte, Signalement, ZoneDeRisque } from '../types';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'alerte' | 'prise_en_charge' | 'info' | 'succes';
  level?: string;
  timestamp: string;
}

interface AlertContextType {
  zones: ZoneDeRisque[];
  alertes: Alerte[];
  signalements: Signalement[];
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  broadcastAlert: (alerte: Omit<Alerte, 'id_alerte' | 'date_alerte'>) => Alerte;
  validateReport: (id: string, noteAdmin?: string) => Signalement | null;
  rejectReport: (id: string, noteAdmin?: string) => Signalement | null;
  updateRiskZone: (updated: ZoneDeRisque) => void;
  createRiskZone: (zone: ZoneDeRisque) => void;
  deleteRiskZone: (id: string) => boolean;
  refreshData: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [zones, setZones] = useState<ZoneDeRisque[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const loadData = () => {
    setZones(storageService.getZones());
    setAlertes(storageService.getAlertes());
    setSignalements(storageService.getSignalements());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = storageService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const addToast = (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const newToast: ToastMessage = {
      ...toast,
      id: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    // Auto dismiss after 8 seconds
    setTimeout(() => {
      dismissToast(newToast.id);
    }, 8000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Rule: L'admin diffuse une alerte -> toast in-app aux citoyens
  const broadcastAlert = (alerteData: Omit<Alerte, 'id_alerte' | 'date_alerte'>): Alerte => {
    const created = storageService.createAlerte(alerteData);
    const targetedZones = zones.filter((z) => alerteData.zones_destinataires.includes(z.id_zone));
    const zoneNames = targetedZones.map((z) => z.quartier).join(', ') || 'Douala';

    addToast({
      title: `ALERTE ${alerteData.niveau_urgence.toUpperCase()} · ${alerteData.type_alerte}`,
      message: `Zone: ${zoneNames}. ${alerteData.message}`,
      type: 'alerte',
      level: alerteData.niveau_urgence,
    });

    return created;
  };

  // Rule: Un signalement validé par l'admin envoie la notification "Signalement pris en charge"
  const validateReport = (id: string, noteAdmin?: string): Signalement | null => {
    const updated = storageService.updateSignalementStatut(id, 'validé', noteAdmin);
    if (updated) {
      addToast({
        title: 'Signalement pris en charge',
        message: `Votre signalement à ${updated.zones_concernees.join(', ')} a été vérifié et validé par les autorités. ${noteAdmin || 'Les équipes sont mobilisées.'}`,
        type: 'prise_en_charge',
      });
    }
    return updated;
  };

  const rejectReport = (id: string, noteAdmin?: string): Signalement | null => {
    return storageService.updateSignalementStatut(id, 'rejeté', noteAdmin);
  };

  const updateRiskZone = (updated: ZoneDeRisque) => {
    storageService.updateZone(updated);
  };

  const createRiskZone = (zone: ZoneDeRisque) => {
    storageService.createZone(zone);
  };

  const deleteRiskZone = (id: string): boolean => {
    return storageService.deleteZone(id);
  };

  return (
    <AlertContext.Provider
      value={{
        zones,
        alertes,
        signalements,
        toasts,
        dismissToast,
        broadcastAlert,
        validateReport,
        rejectReport,
        updateRiskZone,
        createRiskZone,
        deleteRiskZone,
        refreshData: loadData,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used within an AlertProvider');
  return ctx;
};
