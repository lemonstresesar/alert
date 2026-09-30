import React, { createContext, useContext, useEffect, useState } from 'react';
import { storageService } from '../services/storageService';
import { Administrateur, Utilisateur } from '../types';

interface AuthContextType {
  user: Utilisateur | null;
  admin: Administrateur | null;
  role: 'citoyen' | 'admin' | null;
  currentNeighborhood: string;
  setCurrentNeighborhood: (neighborhood: string) => void;
  loginCitoyen: (email: string, mdp: string) => boolean;
  loginAdmin: (email: string, mdp: string) => boolean;
  loginDemoCitoyen: () => void;
  loginDemoAdmin: () => void;
  registerCitoyen: (userData: Omit<Utilisateur, 'id_utilisateur' | 'date_inscription'>) => boolean;
  logout: () => void;
  deleteAccount: () => boolean;
  switchViewMode: (target: 'citoyen' | 'admin') => void;
  isSimulatedAdminActingAsUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'alertedouala_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [admin, setAdmin] = useState<Administrateur | null>(null);
  const [role, setRole] = useState<'citoyen' | 'admin' | null>('citoyen');
  const [currentNeighborhood, setCurrentNeighborhood] = useState<string>('Makèpé');
  const [isSimulatedAdminActingAsUser, setIsSimulatedAdminActingAsUser] = useState<boolean>(false);

  // Load session or initialize with citizen demo account so the app is immediately live and exploration-ready
  useEffect(() => {
    storageService.initData();
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin' && parsed.adminId) {
          const found = storageService.getAdmins().find((a) => a.id_admin === parsed.adminId);
          if (found) {
            setAdmin(found);
            setRole(parsed.actingRole || 'admin');
            setIsSimulatedAdminActingAsUser(parsed.actingRole === 'citoyen');
            return;
          }
        } else if (parsed.role === 'citoyen' && parsed.userId) {
          const found = storageService.getUtilisateurs().find((u) => u.id_utilisateur === parsed.userId);
          if (found) {
            setUser(found);
            setRole('citoyen');
            setCurrentNeighborhood(found.adresse || 'Makèpé');
            return;
          }
        }
      }
      // Default initial state: logged in as demo citizen Jean-Paul Mbedi (Makèpé)
      loginDemoCitoyen();
    } catch {
      loginDemoCitoyen();
    }
  }, []);

  const saveSession = (
    currentRole: 'citoyen' | 'admin' | null,
    uId?: string,
    aId?: string,
    actingRole?: 'citoyen' | 'admin'
  ) => {
    if (!currentRole) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        role: currentRole,
        userId: uId,
        adminId: aId,
        actingRole,
      })
    );
  };

  const loginCitoyen = (email: string, mdp: string): boolean => {
    const list = storageService.getUtilisateurs();
    const found = list.find((u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.mot_de_passe === mdp);
    if (found) {
      setUser(found);
      setAdmin(null);
      setRole('citoyen');
      setIsSimulatedAdminActingAsUser(false);
      setCurrentNeighborhood(found.adresse || 'Makèpé');
      saveSession('citoyen', found.id_utilisateur);
      return true;
    }
    return false;
  };

  const loginAdmin = (email: string, mdp: string): boolean => {
    const list = storageService.getAdmins();
    const found = list.find((a) => a.email.toLowerCase() === email.toLowerCase().trim() && a.mot_de_passe === mdp);
    if (found) {
      setAdmin(found);
      setUser(null);
      setRole('admin');
      setIsSimulatedAdminActingAsUser(false);
      saveSession('admin', undefined, found.id_admin, 'admin');
      return true;
    }
    return false;
  };

  const loginDemoCitoyen = () => {
    const list = storageService.getUtilisateurs();
    const demo = list.find((u) => u.email === 'citoyen@alertedouala.cm') || list[0];
    if (demo) {
      setUser(demo);
      setAdmin(null);
      setRole('citoyen');
      setIsSimulatedAdminActingAsUser(false);
      setCurrentNeighborhood(demo.adresse || 'Makèpé');
      saveSession('citoyen', demo.id_utilisateur);
    }
  };

  const loginDemoAdmin = () => {
    const admins = storageService.getAdmins();
    const demo = admins.find((a) => a.email === 'admin@alertedouala.cm') || admins[0];
    if (demo) {
      setAdmin(demo);
      setUser(null);
      setRole('admin');
      setIsSimulatedAdminActingAsUser(false);
      saveSession('admin', undefined, demo.id_admin, 'admin');
    }
  };

  const registerCitoyen = (userData: Omit<Utilisateur, 'id_utilisateur' | 'date_inscription'>): boolean => {
    const existing = storageService.getUtilisateurs().some((u) => u.email.toLowerCase() === userData.email.toLowerCase().trim());
    if (existing) return false;
    const created = storageService.createUtilisateur(userData);
    setUser(created);
    setAdmin(null);
    setRole('citoyen');
    setIsSimulatedAdminActingAsUser(false);
    setCurrentNeighborhood(created.adresse);
    saveSession('citoyen', created.id_utilisateur);
    return true;
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    setRole(null);
    setIsSimulatedAdminActingAsUser(false);
    saveSession(null);
  };

  const deleteAccount = (): boolean => {
    if (!user) return false;
    const success = storageService.deleteUtilisateur(user.id_utilisateur);
    if (success) {
      logout();
      return true;
    }
    return false;
  };

  // Rule: L'administrateur peut faire tout ce que fait un utilisateur
  const switchViewMode = (target: 'citoyen' | 'admin') => {
    if (admin) {
      if (target === 'citoyen') {
        setRole('citoyen');
        setIsSimulatedAdminActingAsUser(true);
        saveSession('admin', undefined, admin.id_admin, 'citoyen');
      } else {
        setRole('admin');
        setIsSimulatedAdminActingAsUser(false);
        saveSession('admin', undefined, admin.id_admin, 'admin');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        role,
        currentNeighborhood,
        setCurrentNeighborhood,
        loginCitoyen,
        loginAdmin,
        loginDemoCitoyen,
        loginDemoAdmin,
        registerCitoyen,
        logout,
        deleteAccount,
        switchViewMode,
        isSimulatedAdminActingAsUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
