/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Membrete oficial y logos del Ministerio del Poder Popular para el Deporte.
 * Renderizado vectorial fiel a la identidad institucional del Estado venezolano.
 */

import React from 'react';

interface InstitutionalLogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'monochrome';
}

export const InstitutionalLogo: React.FC<InstitutionalLogoProps> = ({
  className = '',
  variant = 'full',
}) => {
  const [imgError, setImgError] = React.useState(false);

  if (variant === 'full' && !imgError) {
    return (
      <div className={`flex items-center py-1 ${className}`}>
        <img
          src="/assets/site_logo.png"
          alt="Ministerio del Poder Popular para el Deporte"
          className="h-11 sm:h-13 w-auto object-contain max-w-[280px] sm:max-w-none"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-7 rounded overflow-hidden shadow-sm border border-slate-200">
          <svg viewBox="0 0 900 600" className="w-full h-full">
            <rect width="900" height="200" fill="#FFCC00" />
            <rect y="200" width="900" height="200" fill="#002045" />
            <rect y="400" width="900" height="200" fill="#CF142B" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            República Bolivariana de Venezuela
          </p>
          <p className="text-sm font-black text-[#002045] tracking-tight">
            MinDeporte
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 sm:gap-5 py-1 ${className}`}>
      {/* Columna Izquierda: Bandera ondulante y Leyenda País */}
      <div className="flex flex-col items-center justify-center flex-shrink-0">
        <div className="relative w-14 h-9 sm:w-16 sm:h-10 rounded shadow-sm overflow-hidden border border-slate-200/80">
          <svg viewBox="0 0 900 600" className="w-full h-full object-cover">
            {/* Olas y franjas */}
            <rect width="900" height="200" fill="#F4B400" />
            <rect y="200" width="900" height="200" fill="#002045" />
            <rect y="400" width="900" height="200" fill="#D93025" />
            {/* 8 Estrellas en semicírculo */}
            <g fill="#FFFFFF">
              <circle cx="340" cy="300" r="16" />
              <circle cx="375" cy="275" r="16" />
              <circle cx="415" cy="260" r="16" />
              <circle cx="450" cy="255" r="16" />
              <circle cx="485" cy="260" r="16" />
              <circle cx="525" cy="275" r="16" />
              <circle cx="560" cy="300" r="16" />
              <circle cx="450" cy="295" r="16" />
            </g>
          </svg>
        </div>
        <span className="text-[7px] sm:text-[8px] font-black tracking-tight text-[#002045] mt-1 text-center uppercase leading-none">
          REPÚBLICA BOLIVARIANA DE<br />VENEZUELA
        </span>
      </div>

      {/* Línea divisora vertical institucional */}
      <div className="h-10 sm:h-12 w-[2px] bg-[#002045] flex-shrink-0" />

      {/* Columna Derecha: Ministerio y Gran Título DEPORTE */}
      <div className="flex flex-col justify-center select-none">
        <span className="text-xs sm:text-sm font-medium text-slate-600 tracking-tight leading-tight">
          Ministerio del Poder Popular para el
        </span>
        <span className="text-2xl sm:text-3xl font-black text-[#002045] tracking-tight leading-none">
          DEPORTE
        </span>
      </div>
    </div>
  );
};
