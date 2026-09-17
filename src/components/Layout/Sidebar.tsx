/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Barra de navegación lateral con selector multicampamento regional.
 */

import React from 'react';
import {
  LayoutDashboard,
  Building2,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  Activity,
  Package,
  Bus,
  Sparkles,
  MapPin,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { Campamento, EstadoRegional } from '../../types';

export type ViewType =
  | 'dashboard'
  | 'campamentos'
  | 'campcedula'
  | 'familias'
  | 'census_nna'
  | 'sports'
  | 'inventory'
  | 'routes'
  | 'reports'
  | 'ai_assistant'
  | 'login';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  campamentos: Campamento[];
  estados: EstadoRegional[];
  selectedCampamentoId: string;
  onSelectCampamento: (campamentoId: string) => void;
  selectedEstadoId: string;
  onSelectEstado: (estadoId: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  campamentos,
  estados,
  selectedCampamentoId,
  onSelectCampamento,
  selectedEstadoId,
  onSelectEstado,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ViewType,
      label: 'Dashboard General',
      subtitle: 'KPIs y Gráficos Recharts',
      icon: LayoutDashboard,
    },
    {
      id: 'campamentos' as ViewType,
      label: 'Sedes Regionales',
      subtitle: 'Instalaciones Deportivas',
      icon: Building2,
    },
    {
      id: 'campcedula' as ViewType,
      label: 'Cédula de Campamento',
      subtitle: 'Ficha técnica y aforos',
      icon: FileSpreadsheet,
    },
    {
      id: 'familias' as ViewType,
      label: 'Censo Familiar',
      subtitle: 'Adjudicación de Vivienda',
      icon: Users,
    },
    {
      id: 'census_nna' as ViewType,
      label: 'Censo Nominal NNA',
      subtitle: 'Protección LOPNNA',
      icon: ShieldCheck,
      badge: 'Protegido',
    },
    {
      id: 'sports' as ViewType,
      label: 'Perfil Deportivo & IMC',
      subtitle: 'Antropometría y Aptitud',
      icon: Activity,
    },
    {
      id: 'inventory' as ViewType,
      label: 'Inventario Deportivo',
      subtitle: 'Balones, uniformes y kits',
      icon: Package,
    },
    {
      id: 'routes' as ViewType,
      label: 'Rutas de Transporte',
      subtitle: 'Unidades Yutong y Pasajeros',
      icon: Bus,
    },
    {
      id: 'reports' as ViewType,
      label: 'Reportes & Certificados',
      subtitle: 'Constancias, manifiestos y alertas',
      icon: FileText,
      badge: 'Fase 3',
    },
    {
      id: 'ai_assistant' as ViewType,
      label: 'Asistente IA (Gemini)',
      subtitle: 'Consultas operativas',
      icon: Sparkles,
      highlight: true,
    },
  ];

  // Campamentos filtrados por el estado seleccionado
  const filteredCampamentos = selectedEstadoId === 'todos'
    ? campamentos
    : campamentos.filter((c) => c.estado_id === selectedEstadoId);

  return (
    <>
      {/* Backdrop en dispositivos móviles */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:static top-[65px] bottom-0 left-0 w-72 bg-slate-900 text-slate-200 z-40 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Selector Multicampamento Regional */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Filtro Regional / Sede</span>
          </div>

          <div className="space-y-2">
            {/* Filtro por Entidad Federal */}
            <div>
              <label htmlFor="filter-estado" className="text-[11px] text-slate-400 block mb-1">
                Entidad Federal:
              </label>
              <div className="relative">
                <select
                  id="filter-estado"
                  value={selectedEstadoId}
                  onChange={(e) => {
                    onSelectEstado(e.target.value);
                    onSelectCampamento('todos');
                  }}
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2.5 text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                >
                  <option value="todos">Todas las Entidades (4)</option>
                  {estados.map((est) => (
                    <option key={est.id} value={est.id}>
                      {est.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>

            {/* Filtro por Campamento / Instalación */}
            <div>
              <label htmlFor="filter-campamento" className="text-[11px] text-slate-400 block mb-1">
                Campamento / Sede:
              </label>
              <div className="relative">
                <select
                  id="filter-campamento"
                  value={selectedCampamentoId}
                  onChange={(e) => onSelectCampamento(e.target.value)}
                  className="w-full text-xs bg-slate-800 border border-slate-700 rounded-md py-1.5 px-2.5 text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                >
                  <option value="todos">Todos los Campamentos ({filteredCampamentos.length})</option>
                  {filteredCampamentos.map((camp) => (
                    <option key={camp.id} value={camp.id}>
                      {camp.nombre}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Navegación de Vistas */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Módulos del Sistema
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onViewChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                  isActive
                    ? 'bg-[#002045] text-white font-semibold shadow-xs border border-blue-600/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${item.highlight && !isActive ? 'border border-amber-500/30 bg-amber-500/10 text-amber-200' : ''}`}
              >
                <div
                  className={`p-1.5 rounded-md flex-shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : item.highlight
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {item.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Pie de Sidebar: Versión y Enlace Institucional */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1 bg-slate-950/40">
          <div className="flex items-center justify-between font-mono text-[10px]">
            <span>v2.5.0-OFICIAL</span>
            <span className="text-emerald-400">● ACTIVO</span>
          </div>
          <span className="text-slate-500 text-[10px]">
            República Bolivariana de Venezuela
          </span>
        </div>
      </aside>
    </>
  );
};
