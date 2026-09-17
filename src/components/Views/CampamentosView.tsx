/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * Vista: Sedes Regionales y Directorio Nacional de Instalaciones (CampamentosView.tsx)
 */

import React, { useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  UserCheck,
  Bed,
  Tent,
  Layers,
  Award,
  Filter,
  ExternalLink,
  Search,
  LayoutGrid,
  List,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Campamento, EstadoRegional } from '../../types';
import { calcularPorcentaje } from '../../lib/utils';

interface CampamentosViewProps {
  campamentos: Campamento[];
  estados: EstadoRegional[];
  selectedEstadoId: string;
  onSelectCampamento: (campamentoId: string) => void;
  onNavigateToCedula: (campamentoId: string) => void;
}

export const CampamentosView: React.FC<CampamentosViewProps> = ({
  campamentos,
  estados,
  selectedEstadoId,
  onSelectCampamento,
  onNavigateToCedula,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeEstadoTab, setActiveEstadoTab] = useState<string>(selectedEstadoId || 'todos');
  const [filterTipo, setFilterTipo] = useState<'todos' | 'deportivos' | 'albergues'>('todos');
  const [filterAforo, setFilterAforo] = useState<'todos' | 'disponibles' | 'saturados'>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Sincronizar si cambia desde la barra lateral
  React.useEffect(() => {
    if (selectedEstadoId) {
      setActiveEstadoTab(selectedEstadoId);
      setCurrentPage(1);
    }
  }, [selectedEstadoId]);

  // Contadores por estado
  const countByState = useMemo(() => {
    const counts: Record<string, number> = { todos: campamentos.length };
    campamentos.forEach((c) => {
      counts[c.estado_id] = (counts[c.estado_id] || 0) + 1;
    });
    return counts;
  }, [campamentos]);

  // Filtrado compuesto en tiempo real
  const filteredCampamentos = useMemo(() => {
    return campamentos.filter((c) => {
      // Filtro por Estado
      if (activeEstadoTab !== 'todos' && c.estado_id !== activeEstadoTab) {
        return false;
      }

      // Filtro por Tipo de Instalación
      if (filterTipo === 'deportivos' && !c.es_instalacion_deportiva) {
        return false;
      }
      if (filterTipo === 'albergues' && c.es_instalacion_deportiva) {
        return false;
      }

      // Filtro por Nivel de Aforo
      const pct = calcularPorcentaje(c.camas_ocupadas, c.capacidad_camas_total);
      if (filterAforo === 'disponibles' && pct >= 90) {
        return false;
      }
      if (filterAforo === 'saturados' && pct < 85) {
        return false;
      }

      // Filtro por Búsqueda de Texto
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchNombre = c.nombre.toLowerCase().includes(term);
        const matchUbicacion = c.ubicacion_detallada.toLowerCase().includes(term);
        const matchDirector = (c.director_responsable || '').toLowerCase().includes(term);
        const matchPadrino = (c.padrino_institucional || '').toLowerCase().includes(term);
        return matchNombre || matchUbicacion || matchDirector || matchPadrino;
      }

      return true;
    });
  }, [campamentos, activeEstadoTab, filterTipo, filterAforo, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredCampamentos.length / itemsPerPage) || 1;
  const paginatedCampamentos = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCampamentos.slice(start, start + itemsPerPage);
  }, [filteredCampamentos, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Métricas globales de la selección actual
  const camasTotalesSeleccion = filteredCampamentos.reduce((acc, c) => acc + c.capacidad_camas_total, 0);
  const camasOcupadasSeleccion = filteredCampamentos.reduce((acc, c) => acc + c.camas_ocupadas, 0);
  const porcentajeGlobalSeleccion = calcularPorcentaje(camasOcupadasSeleccion, camasTotalesSeleccion);

  return (
    <div className="space-y-6 pb-12">
      {/* Cabecera Oficial */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#002045] uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Directorio Oficial de Campamentos e Instalaciones</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sedes Regionales ({campamentos.length} Sedes)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
            Control de aforo en tiempo real, infraestructura deportiva y directores responsables en La Guaira, Caracas, Miranda y Aragua.
          </p>
        </div>

        {/* Resumen numérico rápido */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs self-start lg:self-auto">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
              Aforo en Selección
            </span>
            <span className="text-sm font-black text-[#002045]">
              {camasOcupadasSeleccion} / {camasTotalesSeleccion} Camas
            </span>
          </div>
          <div className="h-8 w-[1px] bg-slate-200" />
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
              Ocupación
            </span>
            <span
              className={`text-sm font-black ${
                porcentajeGlobalSeleccion > 85 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {porcentajeGlobalSeleccion}%
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        {/* Pestañas por Entidad Federal */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100 scrollbar-none">
          <button
            onClick={() => {
              setActiveEstadoTab('todos');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeEstadoTab === 'todos'
                ? 'bg-[#002045] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todas las Entidades ({campamentos.length})
          </button>
          {estados.map((est) => {
            const isSelected = activeEstadoTab === est.id;
            const count = countByState[est.id] || 0;
            return (
              <button
                key={est.id}
                onClick={() => {
                  setActiveEstadoTab(est.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#002045] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{est.nombre}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Fila de Controles: Buscador, Filtros de Tipo/Aforo y Selector de Vista */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Buscador en tiempo real */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscar por nombre de sede, municipio, director o padrino institucional..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#002045]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Filtros de Tipo y Aforo */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro Instalación */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => {
                  setFilterTipo('todos');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  filterTipo === 'todos' ? 'bg-white text-[#002045] shadow-2xs' : 'text-slate-600'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => {
                  setFilterTipo('deportivos');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  filterTipo === 'deportivos' ? 'bg-white text-[#002045] shadow-2xs' : 'text-slate-600'
                }`}
              >
                Deportivos
              </button>
              <button
                onClick={() => {
                  setFilterTipo('albergues');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  filterTipo === 'albergues' ? 'bg-white text-[#002045] shadow-2xs' : 'text-slate-600'
                }`}
              >
                Albergues
              </button>
            </div>

            {/* Alternador de Vista (Cuadrícula / Tabla) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-[#002045] shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Vista en tarjetas"
                aria-label="Vista en tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-[#002045] shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Vista en tabla"
                aria-label="Vista en tabla"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteo de Resultados */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Mostrando <strong className="text-slate-800">{filteredCampamentos.length}</strong> de{' '}
          <strong className="text-slate-800">{campamentos.length}</strong> sedes registradas
        </span>
        {totalPages > 1 && (
          <span>
            Página <strong className="text-slate-800">{currentPage}</strong> de{' '}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Mensaje de Cero Resultados */}
      {filteredCampamentos.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron sedes coincidentes</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Verifique los términos de búsqueda o ajuste los filtros de entidad federal e instalación.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveEstadoTab('todos');
              setFilterTipo('todos');
              setFilterAforo('todos');
            }}
            className="px-4 py-2 bg-[#002045] text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Restablecer todos los filtros
          </button>
        </div>
      )}

      {/* MODO VISTA 1: GRID DE TARJETAS */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedCampamentos.map((camp) => {
            const pctCamas = calcularPorcentaje(camp.camas_ocupadas, camp.capacidad_camas_total);
            const estadoNombre = estados.find((e) => e.id === camp.estado_id)?.nombre || camp.estado_id;

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Cabecera de la Tarjeta */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-br from-slate-50/80 to-white">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#002045] border border-blue-200">
                        {estadoNombre}
                      </span>
                      {camp.es_instalacion_deportiva ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span>Deportivo</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Albergue
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#002045] transition-colors line-clamp-1">
                      {camp.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
                      <span className="line-clamp-1">{camp.ubicacion_detallada}</span>
                    </p>
                  </div>

                  {/* Métricas de Aforo y Ocupación */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                          <Bed className="w-3.5 h-3.5 text-[#002045]" />
                          Camas Ocupadas:
                        </span>
                        <span className="font-bold text-slate-900">
                          {camp.camas_ocupadas} / {camp.capacidad_camas_total} ({pctCamas}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            pctCamas > 90
                              ? 'bg-rose-500'
                              : pctCamas > 70
                              ? 'bg-amber-500'
                              : 'bg-[#002045]'
                          }`}
                          style={{ width: `${pctCamas}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                          <Tent className="w-3 h-3 text-amber-600" /> Carpas:
                        </span>
                        <span className="font-bold text-slate-700">
                          {camp.carpas_ocupadas} / {camp.capacidad_carpas_total}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 text-[10px] block flex items-center gap-1">
                          <Layers className="w-3 h-3 text-emerald-600" /> Módulos:
                        </span>
                        <span className="font-bold text-slate-700">
                          {camp.modulos_ocupados} / {camp.capacidad_modulos_total}
                        </span>
                      </div>
                    </div>

                    {/* Padrino Institucional y Director */}
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                      {camp.padrino_institucional && (
                        <div className="flex items-center gap-1.5 truncate text-slate-700">
                          <Shield className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                          <span className="truncate">
                            <strong>Padrino:</strong> {camp.padrino_institucional}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 truncate">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">
                          <strong>Director:</strong> {camp.director_responsable || 'Comisión MinDeporte'}
                        </span>
                      </div>
                      {camp.telefono_contacto && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{camp.telefono_contacto}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pie de Acción: Cédula Técnica */}
                <div className="p-3 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => onNavigateToCedula(camp.id)}
                    className="w-full py-2 px-3 bg-white hover:bg-[#002045] text-[#002045] hover:text-white border border-slate-200 hover:border-[#002045] rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Ver Cédula Técnica</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODO VISTA 2: TABLA DE DATOS */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Sede / Campamento</th>
                  <th className="py-3 px-4">Entidad Federal</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Camas (Ocupadas / Total)</th>
                  <th className="py-3 px-4">Carpas / Módulos</th>
                  <th className="py-3 px-4">Director / Padrino</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCampamentos.map((camp) => {
                  const pctCamas = calcularPorcentaje(camp.camas_ocupadas, camp.capacidad_camas_total);
                  const estadoNombre = estados.find((e) => e.id === camp.estado_id)?.nombre || camp.estado_id;

                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{camp.nombre}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {camp.ubicacion_detallada}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{estadoNombre}</span>
                      </td>
                      <td className="py-3 px-4">
                        {camp.es_instalacion_deportiva ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Deportivo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Albergue
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {camp.camas_ocupadas} / {camp.capacidad_camas_total} ({pctCamas}%)
                        </div>
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              pctCamas > 90 ? 'bg-rose-500' : 'bg-[#002045]'
                            }`}
                            style={{ width: `${pctCamas}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div>Carpas: {camp.carpas_ocupadas}/{camp.capacidad_carpas_total}</div>
                        <div className="text-[11px] text-slate-500">Módulos: {camp.modulos_ocupados}/{camp.capacidad_modulos_total}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs">
                        <div className="truncate font-medium">{camp.director_responsable || 'Comisión MinDeporte'}</div>
                        <div className="text-[11px] text-blue-700 truncate">{camp.padrino_institucional || 'MinDeporte'}</div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => onNavigateToCedula(camp.id)}
                          className="px-3 py-1 bg-white hover:bg-[#002045] text-[#002045] hover:text-white border border-slate-300 hover:border-[#002045] rounded-lg text-xs font-bold transition-all"
                        >
                          Ficha Técnica
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-1 text-xs">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((pageNum, index, arr) => {
                const prev = arr[index - 1];
                const showEllipsis = prev && pageNum - prev > 1;
                return (
                  <React.Fragment key={pageNum}>
                    {showEllipsis && <span className="px-1 text-slate-400">…</span>}
                    <button
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-[#002045] text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
          >
            <span>Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CampamentosView;
