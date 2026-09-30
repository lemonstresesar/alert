import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { NiveauRisque } from '../../types';

interface RiskBadgeProps {
  level: NiveauRisque;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const getRiskColor = (level: NiveauRisque) => {
  switch (level) {
    case 'critique':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badge: 'bg-red-600 text-white',
        hex: '#dc2626',
        label: 'Critique',
      };
    case 'élevé':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        badge: 'bg-orange-500 text-white',
        hex: '#f97316',
        label: 'Élevé',
      };
    case 'modéré':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        badge: 'bg-amber-500 text-white',
        hex: '#eab308',
        label: 'Modéré',
      };
    case 'faible':
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        badge: 'bg-emerald-600 text-white',
        hex: '#16a34a',
        label: 'Faible',
      };
  }
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const conf = getRiskColor(level);

  const getIcon = () => {
    switch (level) {
      case 'critique':
        return <ShieldAlert className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
      case 'élevé':
        return <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
      case 'modéré':
        return <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
      case 'faible':
      default:
        return <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium border ${conf.bg} ${conf.text} ${conf.border} ${sizeClasses} ${className}`}
    >
      {showIcon && getIcon()}
      <span className="capitalize">{conf.label}</span>
    </span>
  );
};
