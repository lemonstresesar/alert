import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldAlert, User, Check, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { loginCitoyen, loginAdmin, loginDemoCitoyen, loginDemoAdmin, registerCitoyen } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [roleType, setRoleType] = useState<'citoyen' | 'admin'>('citoyen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Inscription form fields
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('Makèpé');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (roleType === 'admin') {
      const success = loginAdmin(email, password);
      if (success) {
        onClose();
      } else {
        setError('Identifiants administrateur incorrects (admin@alertedouala.cm / admin123)');
      }
    } else {
      const success = loginCitoyen(email, password);
      if (success) {
        onClose();
      } else {
        setError('Email ou mot de passe incorrect (citoyen@alertedouala.cm / user123)');
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom || !prenom || !telephone || !email || !password) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const success = registerCitoyen({
      nom,
      prenom,
      telephone,
      email,
      adresse,
      mot_de_passe: password,
      canaux_preferes: ['SMS', 'WhatsApp', 'Notification'],
    });

    if (success) {
      onClose();
    } else {
      setError('Un compte existe déjà avec cette adresse email.');
    }
  };

  const DOUALA_QUARTIERS = [
    'Makèpé',
    'Bépanda',
    'Nylon',
    'Deido',
    'Bonabéri',
    'Youpwe',
    'Akwa',
    'Bonamoussadi',
    'Ndogbong',
    'Logbaba',
    'Bonanjo',
    'Ndogpassi',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'login' ? 'Connexion à AlerteDouala' : 'Créer un compte citoyen'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Plateforme d'alerte précoce aux inondations de Douala
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Logins Banner */}
        <div className="bg-blue-50/70 p-4 border-b border-blue-100/60">
          <div className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider mb-2">
            Accès Démo 1-Clic
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                loginDemoCitoyen();
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white border border-blue-200 text-xs font-semibold text-blue-800 hover:bg-blue-50 transition-colors shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Démo Citoyen</span>
            </button>
            <button
              type="button"
              onClick={() => {
                loginDemoAdmin();
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 transition-colors shadow-2xs"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-blue-300" />
              <span>Démo Admin</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Role Toggle */}
              <div className="flex rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setRoleType('citoyen')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    roleType === 'citoyen'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Citoyen
                </button>
                <button
                  type="button"
                  onClick={() => setRoleType('admin')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    roleType === 'admin'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Administrateur CUD
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={roleType === 'admin' ? 'admin@alertedouala.cm' : 'citoyen@alertedouala.cm'}
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Démo Citoyen : <span className="font-mono text-slate-700">user123</span> · Démo Admin : <span className="font-mono text-slate-700">admin123</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Se connecter
              </button>

              <div className="pt-2 text-center text-xs text-slate-600">
                Pas encore de compte citoyen ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Créer un compte
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Jean-Paul"
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Mbedi"
                    required
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Téléphone (pour alertes SMS/WhatsApp)
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+237 699 00 00 00"
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse (Quartier de résidence)
                </label>
                <select
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {DOUALA_QUARTIERS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean.paul@exemple.cm"
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors mt-2"
              >
                Créer mon compte citoyen
              </button>

              <div className="pt-2 text-center text-xs text-slate-600">
                Déjà inscrit ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Se connecter
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
