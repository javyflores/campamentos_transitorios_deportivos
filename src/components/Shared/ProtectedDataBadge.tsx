/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Badge indicador de nivel de protección de datos sensibles (NNA / Salud - LOPNNA).
 */

import React from 'react';
import { ShieldCheck, ShieldAlert, Lock } from 'lucide-react';
import { FlagRiesgoEnum } from '../../types';

interface ProtectedDataBadgeProps {
  isSensitive?: boolean;
  isNNA?: boolean;
  flagRiesgo?: FlagRiesgoEnum;
  className?: string;
  showText?: boolean;
}

export const ProtectedDataBadge: React.FC<ProtectedDataBadgeProps> = ({
  isSensitive = false,
  isNNA = false,
  flagRiesgo = 'normal',
  className = '',
  showText = true,
}) => {
  if (!isSensitive && !isNNA && flagRiesgo === 'normal') {
    return null;
  }

  if (flagRiesgo === 'danger') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 ${className}`}
        title="Alerta Crítica: Protección prioritaria NNA y seguimiento de salud estricto"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
        {showText && <span>Alerta Prioritaria</span>}
      </span>
    );
  }

  if (flagRiesgo === 'warning') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 ${className}`}
        title="Seguimiento Especial de Salud o Protección NNA"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
        {showText && <span>Seguimiento NNA</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200 ${className}`}
      title="Dato confidencial protegido por el Art. 65 de la LOPNNA"
    >
      <Lock className="w-3 h-3 text-sky-600" />
      {showText && <span>{isNNA ? 'NNA Protegido' : 'Dato Reservado'}</span>}
    </span>
  );
};
