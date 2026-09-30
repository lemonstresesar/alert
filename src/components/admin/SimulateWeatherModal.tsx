import React, { useState } from 'react';
import { useAlerts } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge, getRiskColor } from '../common/RiskBadge';
import {
  CloudLightning,
  AlertOctagon,
  ShieldCheck,
  CheckCircle,
  X,
  Droplets,
  Radio,
  Send,
} from 'lucide-react';

interface SimulateWeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulateWeatherModal: React.FC<SimulateWeatherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { zones, broadcastAlert } = useAlerts();
  const { admin } = useAuth();

  // Step 1: Detect heavy rain scenario
  // Step 2: Check matching critical zone in DB
  // Step 3: Admin explicit human authorization confirmation
  // Step 4: Broadcast to affected citizens
  const [step, setStep] = useState<'detected' | 'authorize' | 'completed'>('detected');
  const [selectedTargetZoneId, setSelectedTargetZoneId] = useState<string>('zone_makèpé');
  const [simulatedPrecipitation] = useState(68.5); // mm of sudden tropical downpour

  if (!isOpen) return null;

  const targetZone = zones.find((z) => z.id_zone === selectedTargetZoneId) || zones[0];
  const riskVisual = targetZone ? getRiskColor(targetZone.niveau_de_risque) : getRiskColor('critique');

  const handleAuthorizeAndBroadcast = () => {
    broadcastAlert({
      id_admin: admin?.id_admin || 'admin_cud',
      nom_admin: admin?.nom || 'Commandant Njoya (CUD)',
      type_alerte: 'Crue subite',
      niveau_urgence: 'critique',
      zones_destinataires: [targetZone.id_zone],
      canaux: ['SMS', 'WhatsApp', 'Notification'],
      message: `ALERTE PRÉCOCE AUTOMATISÉE : Fortes précipitations détectées (${simulatedPrecipitation} mm). Risque de crue critique sur ${targetZone.nom_zone} (${targetZone.quartier}). Évacuation préventive recommandée pour les riverains du cours d'eau ${targetZone.cours_eau_proche || 'primaire'}.`,
    });

    setStep('completed');
  };

  const handleReset = () => {
    setStep('detected');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudLightning className="w-5 h-5 text-amber-400 animate-bounce" />
            <h3 className="font-bold text-sm sm:text-base">
              Flux Automatique : Alerte Météo Supervisée
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'detected' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
                  <Droplets className="w-4 h-4 text-amber-600" />
                  <span>Seuil de Précipitation Extrême Détecté</span>
                </div>
                <p className="leading-relaxed">
                  L'API Open-Meteo pour l'estuaire du Wouri signale un cumul brutal de{' '}
                  <strong className="font-bold">{simulatedPrecipitation} mm/h</strong> avec orage convectif.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Zone analysée dans la base de données :
                </label>
                <select
                  value={selectedTargetZoneId}
                  onChange={(e) => setSelectedTargetZoneId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 font-semibold bg-white"
                >
                  {zones.map((z) => (
                    <option key={z.id_zone} value={z.id_zone}>
                      {z.quartier} - {z.nom_zone} (Risque actuel: {z.niveau_de_risque})
                    </option>
                  ))}
                </select>
              </div>

              {/* Zone Risk Evaluation */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Statut vulnérabilité base :</span>
                  <RiskBadge level={targetZone.niveau_de_risque} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bassin versant :</span>
                  <strong className="text-slate-800">{targetZone.cours_eau_proche}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Population cible :</span>
                  <span className="font-mono text-slate-800 font-bold">
                    {targetZone.population_estimee?.toLocaleString()} habitants
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 italic bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                Règle métier stricte : Aucune alerte n'est diffusée sans l'autorisation explicite d'un administrateur.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => setStep('authorize')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Passer à l'autorisation administrative &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Explicit human authorization modal */}
          {step === 'authorize' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-red-800 uppercase tracking-wide">
                  <AlertOctagon className="w-5 h-5 text-red-600 animate-pulse" />
                  <span>Demande d'Autorisation Préalable d'Envoi</span>
                </div>
                <p className="leading-relaxed">
                  Vous êtes sur le point de diffuser une alerte d'urgence sur le quartier{' '}
                  <strong className="font-bold underline">{targetZone.quartier}</strong> ({targetZone.nom_zone}).
                </p>
                <div className="flex items-center gap-2 pt-1 font-semibold text-red-800">
                  <span>Niveau de criticité évalué :</span>
                  <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[11px] uppercase font-bold">
                    Critique / Danger Immédiat
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="text-slate-500 font-medium">Message qui sera diffusé :</div>
                <p className="font-medium text-slate-800 text-[11px] leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  ALERTE PRÉCOCE AUTOMATISÉE : Fortes précipitations détectées ({simulatedPrecipitation} mm). Risque de crue critique sur {targetZone.nom_zone} ({targetZone.quartier}). Évacuation préventive recommandée pour les riverains du cours d'eau {targetZone.cours_eau_proche || 'primaire'}.
                </p>
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-blue-700">
                    <Radio className="w-3.5 h-3.5" /> Canaux : SMS + WhatsApp + Push
                  </span>
                  <span>Opérateur : {admin?.nom || 'Admin CUD'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('detected')}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Retour
                </button>
                <button
                  type="button"
                  onClick={handleAuthorizeAndBroadcast}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>AUTORISER ET DIFFUSER L'ALERTE</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Broadcast completed */}
          {step === 'completed' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Alerte diffusée avec succès !
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Le message d'évacuation préventive a été diffusé instantanément sur les canaux mobiles des citoyens de {targetZone.quartier}.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 max-w-xs mx-auto border border-slate-200">
                Visible dès maintenant sur la page citoyen et dans le journal des alertes.
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                >
                  Terminer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
