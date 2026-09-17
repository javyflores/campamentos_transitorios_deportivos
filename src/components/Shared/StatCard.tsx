/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Tarjeta analítica institucional para visualización de KPIs y métricas.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeVariant?: 'blue' | 'emerald' | 'amber' | 'rose';
  trend?: string;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = 'blue',
  trend,
  className = '',
  onClick,
}) => {
  const badgeStyles = {
    blue: 'bg-blue-50 text-[#002045] border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg text-[#002045] border border-slate-100 flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || badgeText || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate">{subtitle || trend}</span>
          {badgeText && (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyles[badgeVariant]}`}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
