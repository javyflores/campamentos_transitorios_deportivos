/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Isotipo vectorial de la Bandera Tricolor Nacional de la República Bolivariana de Venezuela con 8 estrellas.
 */

import React from 'react';

interface FlagIsotypeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FlagIsotype: React.FC<FlagIsotypeProps> = ({ className = '', size = 'md' }) => {
  const [imgError, setImgError] = React.useState(false);

  const sizeMap = {
    sm: 'w-6 h-4',
    md: 'w-9 h-6',
    lg: 'w-12 h-8',
    xl: 'w-16 h-11',
  };

  if (!imgError) {
    return (
      <div
        className={`relative inline-block overflow-hidden rounded shadow-xs border border-slate-200 dark:border-slate-700 flex-shrink-0 ${sizeMap[size]} ${className}`}
        title="Bandera de la República Bolivariana de Venezuela"
        role="img"
        aria-label="Bandera de la República Bolivariana de Venezuela"
      >
        <img
          src="/assets/Venezuela.png"
          alt="Bandera de Venezuela"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-block overflow-hidden rounded shadow-sm border border-slate-200 dark:border-slate-700 flex-shrink-0 ${sizeMap[size]} ${className}`}
      title="Bandera de la República Bolivariana de Venezuela"
      role="img"
      aria-label="Bandera de la República Bolivariana de Venezuela"
    >
      <svg viewBox="0 0 900 600" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
        {/* Franja Amarilla */}
        <rect width="900" height="200" fill="#FFCC00" />
        {/* Franja Azul */}
        <rect y="200" width="900" height="200" fill="#00247D" />
        {/* Franja Roja */}
        <rect y="400" width="900" height="200" fill="#CF142B" />

        {/* 8 Estrellas Blancas en Arco sobre el Azul */}
        <g fill="#FFFFFF">
          {/* Radio aprox 120 en arco central */}
          <polygon points="450,225 454,237 467,237 456,245 460,257 450,250 440,257 444,245 433,237 446,237" transform="rotate(-35, 450, 360)" />
          <polygon points="450,225 454,237 467,237 456,245 460,257 450,250 440,257 444,245 433,237 446,237" transform="rotate(-25, 450, 360)" />
          <polygon points="450,225 454,237 467,237 456,245 460,257 450,250 440,257 444,245 433,237 446,237" transform="rotate(-15, 450, 360)" />
          <polygon points="450,225 454,237 467,237 456,245 460,257 450,250 440,257 444,245 433,237 446,237" transform="rotate(-5, 450, 360)" />
          <polygon points="450,225 454,237 467,237 456,245 460,257 450,250 440,257 444,245 433,237 446,237" transform="rotate(5, 450, 360)" />
          <polygon points="450,225 454,237 467,237 456,245 460,257 450,250 440,257 444,245 433,237 446,237" transform="rotate(15, 450, 360)" />
          <polygon points="450,225 454,237 467,237 456,245 460,257 450,250 440,257 444,245 433,237 446,237" transform="rotate(25, 450, 360)" />
          <polygon points="450,225 454,237 467,237 456,245 460,257 450,250 440,257 444,245 433,237 446,237" transform="rotate(35, 450, 360)" />
        </g>
      </svg>
    </div>
  );
};
