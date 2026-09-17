/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Transporte • MinDeporte • INTT
 * Vista: Rutas de Transporte (Convoyes Yutong), Manifiesto de Pasajeros y Desplazamientos Seguros (RoutesView.tsx).
 */

import React, { useState, useMemo } from 'react';
import {
  Bus,
  MapPin,
  Clock,
  UserCheck,
  Phone,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Share2,
  Printer,
  Edit,
  Shield,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Trash2,
  UserPlus,
  Navigation,
  Radio,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  RutaTransporte,
  PasajeroRuta,
  Integrante,
  Campamento,
  UserRole,
  EstatusRutaEnum,
} from '../../types';
import { formatearFechaHora, generarReporteWhatsApp } from '../../lib/utils';
import { Modal } from '../Shared/Modal';
import { canManageLogistics, ofuscarNombre } from '../../lib/auth';

interface RoutesViewProps {
  rutas: RutaTransporte[];
  pasajeros: PasajeroRuta[];
  integrantes: Integrante[];
  campamentos: Campamento[];
  currentRole: UserRole;
  onToggleAsistencia: (rutaId: string, integranteId: string) => Promise<void>;
  onSaveRuta?: (ruta: RutaTransporte) => Promise<void>;
  onAddPasajero?: (pasajero: PasajeroRuta) => Promise<void>;
  onDeletePasajero?: (rutaId: string, integranteId: string) => Promise<void>;
}

export const RoutesView: React.FC<RoutesViewProps> = ({
  rutas,
  pasajeros,
  integrantes,
  campamentos,
  currentRole,
  onToggleAsistencia,
  onSaveRuta,
  onAddPasajero,
  onDeletePasajero,
}) => {
  // Estados de Búsqueda y Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | EstatusRutaEnum>('todos');
  const [origenFilter, setOrigenFilter] = useState<string>('todos');
  const [destinoFilter, setDestinoFilter] = useState<string>('todos');

  // Modales
  const [activeRutaForManifest, setActiveRutaForManifest] = useState<RutaTransporte | null>(null);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Partial<RutaTransporte> | null>(null);

  // Modal de Agregar Pasajero
  const [isAddPassengerOpen, setIsAddPassengerOpen] = useState(false);
  const [selectedIntegranteId, setSelectedIntegranteId] = useState('');
  const [assignedSeatNumber, setAssignedSeatNumber] = useState<number>(1);
  const [passengerSearchTerm, setPassengerSearchTerm] = useState('');

  // Guardado en proceso
  const [isSaving, setIsSaving] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const canEdit = canManageLogistics(currentRole);

  // Mapas rápidos
  const campamentoMap = useMemo(() => {
    const map = new Map<string, Campamento>();
    campamentos.forEach((c) => map.set(c.id, c));
    return map;
  }, [campamentos]);

  const integranteMap = useMemo(() => {
    const map = new Map<string, Integrante>();
    integrantes.forEach((i) => map.set(i.id, i));
    return map;
  }, [integrantes]);

  // Métricas Consolidadas de Transporte
  const metrics = useMemo(() => {
    const totalRutas = rutas.length;
    const enTransito = rutas.filter((r) => r.estatus_ruta === 'En_Transito').length;
    const programadas = rutas.filter((r) => r.estatus_ruta === 'Programada').length;
    const completadas = rutas.filter((r) => r.estatus_ruta === 'Completada').length;

    const totalCapacidadAsientos = rutas.reduce((acc, r) => acc + (r.capacidad_pasajeros || 0), 0);
    const totalPasajerosRegistrados = pasajeros.length;
    const confirmadosAbordados = pasajeros.filter((p) => p.asistencia_confirmada).length;

    const porcentajeAbordaje =
      totalPasajerosRegistrados > 0
        ? Math.round((confirmadosAbordados / totalPasajerosRegistrados) * 100)
        : 0;

    // Conteo de NNA en tránsito
    let nnaEnRutas = 0;
    pasajeros.forEach((p) => {
      const integrante = integranteMap.get(p.integrante_id);
      if (integrante?.es_nna) nnaEnRutas++;
    });

    return {
      totalRutas,
      enTransito,
      programadas,
      completadas,
      totalCapacidadAsientos,
      totalPasajerosRegistrados,
      confirmadosAbordados,
      porcentajeAbordaje,
      nnaEnRutas,
    };
  }, [rutas, pasajeros, integranteMap]);

  // Filtrado Compuesto de Rutas
  const filteredRutas = useMemo(() => {
    return rutas.filter((ruta) => {
      const origen = campamentoMap.get(ruta.campamento_origen_id);
      const destino = campamentoMap.get(ruta.campamento_destino_id);
      const origenNombre = origen ? origen.nombre.toLowerCase() : '';
      const destinoNombre = destino ? destino.nombre.toLowerCase() : '';
      const codigo = ruta.codigo_ruta.toLowerCase();
      const unidad = ruta.unidad_vehiculo.toLowerCase();
      const conductor = ruta.nombre_conductor.toLowerCase();
      const notas = (ruta.notas_seguridad || '').toLowerCase();

      // Búsqueda textual
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (
          !codigo.includes(term) &&
          !unidad.includes(term) &&
          !conductor.includes(term) &&
          !origenNombre.includes(term) &&
          !destinoNombre.includes(term) &&
          !notas.includes(term)
        ) {
          return false;
        }
      }

      // Filtro por Estatus
      if (statusFilter !== 'todos' && ruta.estatus_ruta !== statusFilter) {
        return false;
      }

      // Filtro por Origen
      if (origenFilter !== 'todos' && ruta.campamento_origen_id !== origenFilter) {
        return false;
      }

      // Filtro por Destino
      if (destinoFilter !== 'todos' && ruta.campamento_destino_id !== destinoFilter) {
        return false;
      }

      return true;
    });
  }, [rutas, searchTerm, statusFilter, origenFilter, destinoFilter, campamentoMap]);

  // Paginación
  const totalPages = Math.ceil(filteredRutas.length / itemsPerPage) || 1;
  const paginatedRutas = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRutas.slice(start, start + itemsPerPage);
  }, [filteredRutas, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Abrir Modal de Creación o Edición de Ruta
  const handleOpenEditRoute = (ruta?: RutaTransporte) => {
    if (ruta) {
      setEditingRoute({ ...ruta });
    } else {
      const nextCodeNum = rutas.length + 1;
      const formattedCode = `RUT-YUT-${nextCodeNum < 10 ? '0' + nextCodeNum : nextCodeNum}`;
      setEditingRoute({
        id: `rut-${Date.now()}`,
        codigo_ruta: formattedCode,
        campamento_origen_id: campamentos[0]?.id || '',
        campamento_destino_id: campamentos[1]?.id || campamentos[0]?.id || '',
        unidad_vehiculo: 'Autobús Yutong ZK6122 (Convoy Misión Transporte)',
        nombre_conductor: 'Operador SITSSA / MppTrans',
        telefono_conductor: '+58 412-5550999',
        capacidad_pasajeros: 44,
        hora_salida_programada: new Date(Date.now() + 3600000).toISOString(),
        hora_llegada_estimada: new Date(Date.now() + 7200000).toISOString(),
        estatus_ruta: 'Programada',
        notas_seguridad: 'Custodia Vial PNB Tránsito y paramédicos de Protección Civil en corredor La Guaira-Caracas.',
      });
    }
    setIsRouteModalOpen(true);
  };

  // Guardar Ruta
  const handleSaveRouteForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoute || !editingRoute.codigo_ruta || !onSaveRuta) return;

    setIsSaving(true);
    try {
      const completeRoute: RutaTransporte = {
        id: editingRoute.id || `rut-${Date.now()}`,
        codigo_ruta: editingRoute.codigo_ruta,
        campamento_origen_id: editingRoute.campamento_origen_id || campamentos[0]?.id || '',
        campamento_destino_id: editingRoute.campamento_destino_id || campamentos[1]?.id || '',
        unidad_vehiculo: editingRoute.unidad_vehiculo || 'Autobús Yutong ZK6122',
        nombre_conductor: editingRoute.nombre_conductor || 'Operador Asignado',
        telefono_conductor: editingRoute.telefono_conductor || '',
        capacidad_pasajeros: Number(editingRoute.capacidad_pasajeros) || 44,
        hora_salida_programada: editingRoute.hora_salida_programada || new Date().toISOString(),
        hora_llegada_estimada: editingRoute.hora_llegada_estimada || new Date().toISOString(),
        estatus_ruta: (editingRoute.estatus_ruta as EstatusRutaEnum) || 'Programada',
        notas_seguridad: editingRoute.notas_seguridad || '',
        created_at: editingRoute.created_at || new Date().toISOString(),
      };

      await onSaveRuta(completeRoute);
      setIsRouteModalOpen(false);
      setEditingRoute(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Transición Rápida de Estatus (Programada -> En_Transito -> Completada)
  const handleQuickStatusChange = async (ruta: RutaTransporte, nuevoEstatus: EstatusRutaEnum) => {
    if (!canEdit || !onSaveRuta) return;
    const updated: RutaTransporte = {
      ...ruta,
      estatus_ruta: nuevoEstatus,
    };
    await onSaveRuta(updated);
    if (activeRutaForManifest && activeRutaForManifest.id === ruta.id) {
      setActiveRutaForManifest(updated);
    }
  };

  // Abrir sub-modal para incorporar un nuevo pasajero a la ruta activa
  const handleOpenAddPassenger = () => {
    if (!activeRutaForManifest) return;
    const pasajerosActuales = pasajeros.filter((p) => p.ruta_id === activeRutaForManifest.id);
    const siguienteAsiento = pasajerosActuales.length + 1;
    setAssignedSeatNumber(siguienteAsiento);

    // Integrantes que aún no están asignados en esta ruta
    const yaAsignadosIds = new Set(pasajerosActuales.map((p) => p.integrante_id));
    const disponibles = integrantes.filter((i) => !yaAsignadosIds.has(i.id));

    if (disponibles.length > 0) {
      setSelectedIntegranteId(disponibles[0].id);
    } else {
      setSelectedIntegranteId('');
    }

    setIsAddPassengerOpen(true);
  };

  // Confirmar incorporación de pasajero
  const handleConfirmAddPassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRutaForManifest || !selectedIntegranteId || !onAddPasajero) return;

    setIsSaving(true);
    try {
      const nuevoPasajero: PasajeroRuta = {
        id: `pas-${Date.now()}`,
        ruta_id: activeRutaForManifest.id,
        integrante_id: selectedIntegranteId,
        asiento_numero: assignedSeatNumber,
        asistencia_confirmada: true, // Se marca abordado por defecto al agregar en vivo
      };
      await onAddPasajero(nuevoPasajero);
      setIsAddPassengerOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Eliminar pasajero de la ruta
  const handleDeletePassenger = async (rutaId: string, integranteId: string) => {
    if (!canEdit || !onDeletePasajero) return;
    await onDeletePasajero(rutaId, integranteId);
  };

  // Reporte SITREP General por WhatsApp
  const handleReporteSitrepWhatsApp = () => {
    const datos: Record<string, string | number> = {
      'Convoyes y Rutas Activas': `${metrics.totalRutas} convoyes monitoreados`,
      'Convoyes en Tránsito Vial': `${metrics.enTransito} unidades en carretera`,
      'Rutas Programadas': `${metrics.programadas} por zarpar`,
      'Rutas Arribadas / Completadas': `${metrics.completadas} concluidas con éxito`,
      'Capacidad Total de Flota': `${metrics.totalCapacidadAsientos} asientos Yutong`,
      'Pasajeros Asignados': `${metrics.totalPasajerosRegistrados} personas en manifiesto`,
      'Check-in / Abordaje Confirmado': `${metrics.confirmadosAbordados} presentes (${metrics.porcentajeAbordaje}%)`,
      'Menores NNA en Custodia': `${metrics.nnaEnRutas} NNA bajo protocolo LOPNNA`,
      'Órgano de Control': 'MppTransporte • MinDeporte • PNB Tránsito',
    };
    const encoded = generarReporteWhatsApp('SITREP DE MOVILIDAD Y CONVOYES YUTONG', datos);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Reporte de Manifiesto Específico por WhatsApp
  const handleReporteManifiestoWhatsApp = (ruta: RutaTransporte) => {
    const origen = campamentoMap.get(ruta.campamento_origen_id)?.nombre || 'La Guaira';
    const destino = campamentoMap.get(ruta.campamento_destino_id)?.nombre || 'Caracas';
    const pasajerosRuta = pasajeros.filter((p) => p.ruta_id === ruta.id);
    const confirmados = pasajerosRuta.filter((p) => p.asistencia_confirmada).length;

    const datos: Record<string, string | number> = {
      'Código de Convoy': ruta.codigo_ruta,
      'Unidad de Transporte': ruta.unidad_vehiculo,
      'Operador / Conductor': `${ruta.nombre_conductor} (${ruta.telefono_conductor || 'Sin tlf'})`,
      'Ruta': `${origen} ➔ ${destino}`,
      'Hora Salida': formatearFechaHora(ruta.hora_salida_programada),
      'Hora Llegada Estimada': formatearFechaHora(ruta.hora_llegada_estimada),
      'Estatus': ruta.estatus_ruta,
      'Aforo Abordado': `${confirmados} / ${pasajerosRuta.length} pasajeros (Capacidad: ${ruta.capacidad_pasajeros})`,
      'Escolta de Seguridad': ruta.notas_seguridad || 'Custodia vial asignada',
    };

    const encoded = generarReporteWhatsApp(`MANIFIESTO VIAL • ${ruta.codigo_ruta}`, datos);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Función auxiliar de estilo para el estatus de la ruta
  const getEstatusBadge = (estatus: EstatusRutaEnum) => {
    switch (estatus) {
      case 'En_Transito':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 animate-pulse';
      case 'Programada':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Completada':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'Cancelada':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabecera Institucional */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#002045] uppercase tracking-wider mb-1">
            <Bus className="w-4 h-4 text-blue-600" />
            <span>MppTransporte • MinDeporte • INTT • Misión Transporte</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Convoyes Yutong, Rutas de Desplazamiento y Manifiesto
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoreo en tiempo real de traslados seguros de atletas, familias y NNA entre campamentos transitorios e instalaciones deportivas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canEdit && onSaveRuta && (
            <button
              id="btn-add-route"
              onClick={() => handleOpenEditRoute()}
              className="px-4 py-2 bg-[#002045] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Programar Nuevo Convoy</span>
            </button>
          )}

          <button
            onClick={handleReporteSitrepWhatsApp}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Generar SITREP de convoyes para WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>SITREP Vial WhatsApp</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Imprimir manifiestos y órdenes de despacho vial"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimir Manifiestos</span>
          </button>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS Y LOGÍSTICA VIAL */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Rutas */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">Rutas / Convoyes</span>
            <Navigation className="w-3.5 h-3.5 text-[#002045]" />
          </div>
          <p className="text-xl font-black text-slate-900">{metrics.totalRutas}</p>
          <span className="text-[10px] text-slate-400">Flota monitoreada</span>
        </div>

        {/* En Tránsito Activo */}
        <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/50 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-emerald-900 mb-1">
            <span className="font-bold">En Carretera</span>
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          </div>
          <p className="text-xl font-black text-emerald-800">{metrics.enTransito}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Unidades en tránsito</span>
        </div>

        {/* Programadas */}
        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/40 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-900 mb-1">
            <span className="font-bold">Por Zarpar</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-800">{metrics.programadas}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Convoyes programados</span>
        </div>

        {/* Pasajeros Asignados */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">En Manifiesto</span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-700">{metrics.totalPasajerosRegistrados}</p>
          <span className="text-[10px] text-blue-600 font-semibold">
            de {metrics.totalCapacidadAsientos} puestos
          </span>
        </div>

        {/* Abordaje Confirmado */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">Check-in / Abordó</span>
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700">{metrics.confirmadosAbordados}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">
            {metrics.porcentajeAbordaje}% verificado
          </span>
        </div>

        {/* NNA en Custodia */}
        <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-indigo-900 mb-1">
            <span className="font-bold">NNA Protegidos</span>
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-indigo-800">{metrics.nnaEnRutas}</p>
          <span className="text-[10px] text-indigo-700 font-semibold">Custodia Art. 65 LOPNNA</span>
        </div>
      </div>

      {/* CONTROLES DE BÚSQUEDA Y FILTRADO */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Barra de Búsqueda */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por código de convoy, conductor, unidad Yutong o notas viales..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#002045] focus:outline-hidden"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Segmentos Rápidos de Estatus */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200">
            <button
              onClick={() => {
                setStatusFilter('todos');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'todos' ? 'bg-white text-[#002045] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({rutas.length})
            </button>
            <button
              onClick={() => {
                setStatusFilter('En_Transito');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                statusFilter === 'En_Transito'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>En Tránsito ({metrics.enTransito})</span>
            </button>
            <button
              onClick={() => {
                setStatusFilter('Programada');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'Programada'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Programadas ({metrics.programadas})
            </button>
            <button
              onClick={() => {
                setStatusFilter('Completada');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'Completada'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completadas ({metrics.completadas})
            </button>
          </div>
        </div>

        {/* Filtros Dropdown de Origen y Destino */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros de Trayecto:</span>
          </div>

          {/* Sede Origen */}
          <select
            value={origenFilter}
            onChange={(e) => {
              setOrigenFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="todos">Cualquier Origen</option>
            {campamentos.map((c) => (
              <option key={c.id} value={c.id}>
                Origen: {c.nombre}
              </option>
            ))}
          </select>

          {/* Sede Destino */}
          <select
            value={destinoFilter}
            onChange={(e) => {
              setDestinoFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="todos">Cualquier Destino</option>
            {campamentos.map((c) => (
              <option key={c.id} value={c.id}>
                Destino: {c.nombre}
              </option>
            ))}
          </select>

          {(searchTerm || statusFilter !== 'todos' || origenFilter !== 'todos' || destinoFilter !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
                setOrigenFilter('todos');
                setDestinoFilter('todos');
                setCurrentPage(1);
              }}
              className="text-[11px] text-blue-700 font-bold hover:underline ml-auto cursor-pointer"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* Conteo de Resultados */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Mostrando <strong className="text-slate-800">{filteredRutas.length}</strong> de{' '}
          <strong className="text-slate-800">{rutas.length}</strong> convoyes registrados
        </span>
        {totalPages > 1 && (
          <span>
            Página <strong className="text-slate-800">{currentPage}</strong> de{' '}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Cero Resultados */}
      {filteredRutas.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <Bus className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron convoyes con los criterios indicados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Verifique el código de ruta, estatus o cambie las sedes de origen y destino seleccionadas.
          </p>
        </div>
      )}

      {/* GRID DE RUTAS Y CONVOYES */}
      {filteredRutas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedRutas.map((ruta) => {
            const origen = campamentoMap.get(ruta.campamento_origen_id);
            const destino = campamentoMap.get(ruta.campamento_destino_id);
            const pasajerosDeRuta = pasajeros.filter((p) => p.ruta_id === ruta.id);
            const confirmados = pasajerosDeRuta.filter((p) => p.asistencia_confirmada).length;
            const porcentajeOcupacion =
              ruta.capacidad_pasajeros > 0
                ? Math.round((pasajerosDeRuta.length / ruta.capacidad_pasajeros) * 100)
                : 0;

            const estaEnTransito = ruta.estatus_ruta === 'En_Transito';

            return (
              <div
                key={ruta.id}
                className={`bg-white rounded-2xl border shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between ${
                  estaEnTransito
                    ? 'border-emerald-400 bg-linear-to-b from-emerald-50/20 to-white ring-1 ring-emerald-300'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Encabezado: Código y Estatus */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg font-mono text-xs font-black bg-blue-100 text-[#002045] border border-blue-200 flex items-center gap-1">
                        <Bus className="w-3.5 h-3.5 text-blue-700" />
                        <span>{ruta.codigo_ruta}</span>
                      </span>
                      {estaEnTransito && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                          <span>EN VIVO</span>
                        </span>
                      )}
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getEstatusBadge(ruta.estatus_ruta)}`}>
                      {ruta.estatus_ruta.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 line-clamp-1">
                    {ruta.unidad_vehiculo}
                  </h3>

                  {/* Trayecto Origen ➔ Destino */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 my-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
                      <span className="text-slate-400 font-semibold w-12">Origen:</span>
                      <strong className="text-slate-900 truncate">
                        {origen?.nombre || 'Sede Transitoria'}
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0" />
                      <span className="text-slate-400 font-semibold w-12">Destino:</span>
                      <strong className="text-slate-900 truncate">
                        {destino?.nombre || 'Complejo Deportivo Central'}
                      </strong>
                    </div>
                  </div>

                  {/* Horarios y Operador */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        Salida: <strong>{formatearFechaHora(ruta.hora_salida_programada)}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate" title={ruta.nombre_conductor}>
                        {ruta.nombre_conductor}
                      </span>
                    </div>
                  </div>

                  {/* Teléfono de Contacto del Conductor */}
                  {ruta.telefono_conductor && (
                    <div className="mt-2 text-xs flex items-center gap-1.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Contacto: <strong className="text-slate-800">{ruta.telefono_conductor}</strong></span>
                    </div>
                  )}

                  {/* Custodia y Protocolo de Seguridad */}
                  {ruta.notas_seguridad && (
                    <div className="mt-3 text-[11px] text-slate-600 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 flex items-start gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-700 flex-shrink-0 mt-0.5" />
                      <p className="line-clamp-2">
                        <strong>Seguridad Vial:</strong> {ruta.notas_seguridad}
                      </p>
                    </div>
                  )}

                  {/* Barra de Ocupación */}
                  <div className="mt-3.5">
                    <div className="flex justify-between text-[11px] text-slate-500 font-semibold mb-1">
                      <span>
                        Asientos Ocupados: <strong className="text-slate-800">{pasajerosDeRuta.length}</strong> / {ruta.capacidad_pasajeros}
                      </span>
                      <span className="text-emerald-700 font-bold">
                        {confirmados} Confirmados ({porcentajeOcupacion}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          porcentajeOcupacion > 90
                            ? 'bg-rose-500'
                            : porcentajeOcupacion > 60
                            ? 'bg-blue-600'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, porcentajeOcupacion)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Acciones y Botones de Control */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Botones rápidos de cambio de estado */}
                  <div className="flex items-center gap-1">
                    {canEdit && onSaveRuta && (
                      <>
                        {ruta.estatus_ruta === 'Programada' && (
                          <button
                            onClick={() => handleQuickStatusChange(ruta, 'En_Transito')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Iniciar recorrido vial en carretera"
                          >
                            <Radio className="w-3 h-3" />
                            <span>Zarpar / Salir</span>
                          </button>
                        )}
                        {ruta.estatus_ruta === 'En_Transito' && (
                          <button
                            onClick={() => handleQuickStatusChange(ruta, 'Completada')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Marcar convoy arribado a destino"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Arribó / Llegó</span>
                          </button>
                        )}
                        {ruta.estatus_ruta === 'Completada' && (
                          <button
                            onClick={() => handleQuickStatusChange(ruta, 'Programada')}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            title="Volver a poner en programación"
                          >
                            Reprogramar
                          </button>
                        )}
                      </>
                    )}

                    <button
                      onClick={() => handleReporteManifiestoWhatsApp(ruta)}
                      className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      title="Enviar manifiesto por WhatsApp"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canEdit && onSaveRuta && (
                      <button
                        onClick={() => handleOpenEditRoute(ruta)}
                        className="p-1.5 text-slate-600 hover:text-[#002045] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar datos del convoy y conductor"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => setActiveRutaForManifest(ruta)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#002045] text-slate-700 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manifiesto ({pasajerosDeRuta.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginador */}
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

      {/* MODAL: MANIFIESTO COMPLETO DE PASAJEROS Y CHECK-IN */}
      {activeRutaForManifest && (
        <Modal
          isOpen={!!activeRutaForManifest}
          onClose={() => setActiveRutaForManifest(null)}
          title={`Manifiesto Oficial de Pasajeros • ${activeRutaForManifest.codigo_ruta}`}
          subtitle={`${activeRutaForManifest.unidad_vehiculo} • Operador: ${activeRutaForManifest.nombre_conductor}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Cabecera del Manifiesto */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Trayecto Autorizado</span>
                <p className="font-black text-slate-900 text-sm">
                  {campamentoMap.get(activeRutaForManifest.campamento_origen_id)?.nombre || 'La Guaira'} ➔{' '}
                  {campamentoMap.get(activeRutaForManifest.campamento_destino_id)?.nombre || 'Caracas'}
                </p>
                <span className="text-[11px] text-slate-500">
                  Salida: {formatearFechaHora(activeRutaForManifest.hora_salida_programada)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full font-bold text-xs border ${getEstatusBadge(activeRutaForManifest.estatus_ruta)}`}>
                  {activeRutaForManifest.estatus_ruta.replace(/_/g, ' ')}
                </span>
                {canEdit && onAddPasajero && (
                  <button
                    onClick={handleOpenAddPassenger}
                    className="px-3 py-1.5 bg-[#002045] hover:bg-blue-900 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Incorporar Pasajero</span>
                  </button>
                )}
              </div>
            </div>

            {/* Búsqueda dentro del manifiesto */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar pasajero en este manifiesto por nombre o número de asiento..."
                value={passengerSearchTerm}
                onChange={(e) => setPassengerSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#002045]"
              />
            </div>

            {/* Listado de Pasajeros */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {pasajeros
                .filter((p) => p.ruta_id === activeRutaForManifest.id)
                .filter((p) => {
                  if (!passengerSearchTerm.trim()) return true;
                  const term = passengerSearchTerm.toLowerCase();
                  const integrante = integranteMap.get(p.integrante_id);
                  const nombre = integrante ? integrante.nombre_completo.toLowerCase() : '';
                  const asiento = (p.asiento_numero || '').toString();
                  return nombre.includes(term) || asiento.includes(term);
                })
                .map((pas) => {
                  const integrante = integranteMap.get(pas.integrante_id);
                  const nombre = integrante
                    ? ofuscarNombre(integrante.nombre_completo, integrante.es_nna, currentRole)
                    : 'Pasajero Registrado';

                  return (
                    <div
                      key={pas.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#002045] font-black flex items-center justify-center border border-blue-200 text-xs">
                          #{pas.asiento_numero || '—'}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{nombre}</p>
                            {integrante?.es_nna && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                                NNA
                              </span>
                            )}
                            {integrante?.flag_riesgo === 'danger' && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                Alerta Médica
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {integrante?.es_nna ? 'Menor Bajo Custodia' : 'Adulto / Responsable'} • {integrante?.edad} años
                            {integrante?.patologia && ` • Condición: ${integrante.patologia}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {canEdit ? (
                          <button
                            onClick={() => onToggleAsistencia(activeRutaForManifest.id, pas.integrante_id)}
                            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              pas.asistencia_confirmada
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                            }`}
                          >
                            {pas.asistencia_confirmada ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Abordó</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-slate-400" />
                                <span>Sin Abordar</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span
                            className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${
                              pas.asistencia_confirmada
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {pas.asistencia_confirmada ? 'Presente' : 'Pendiente'}
                          </span>
                        )}

                        {canEdit && onDeletePasajero && (
                          <button
                            onClick={() => handleDeletePassenger(activeRutaForManifest.id, pas.integrante_id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remover de este manifiesto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Protocolo de Custodia en carretera */}
            {activeRutaForManifest.notas_seguridad && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
                <span className="font-bold text-slate-700 block mb-0.5 text-[11px]">
                  Protocolo de Acompañamiento y Escolta Vial:
                </span>
                <p className="text-[11px] italic">"{activeRutaForManifest.notas_seguridad}"</p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => handleReporteManifiestoWhatsApp(activeRutaForManifest)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Enviar a Operador</span>
              </button>

              <button
                onClick={() => setActiveRutaForManifest(null)}
                className="px-4 py-2 bg-[#002045] hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
              >
                Cerrar Manifiesto
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: AGREGAR PASAJERO A LA RUTA ACTIVA */}
      {isAddPassengerOpen && activeRutaForManifest && (
        <Modal
          isOpen={isAddPassengerOpen}
          onClose={() => setIsAddPassengerOpen(false)}
          title="Incorporar Pasajero al Manifiesto"
          subtitle={`Convoy ${activeRutaForManifest.codigo_ruta} • ${activeRutaForManifest.unidad_vehiculo}`}
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmAddPassenger} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Seleccione Integrante a Trasladar:
              </label>
              <select
                value={selectedIntegranteId}
                onChange={(e) => setSelectedIntegranteId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
                required
              >
                {integrantes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre_completo} ({i.edad} años - {i.es_nna ? 'NNA Protegido' : 'Adulto'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Número de Asiento Asignado:
              </label>
              <input
                type="number"
                min="1"
                max={activeRutaForManifest.capacidad_pasajeros}
                value={assignedSeatNumber}
                onChange={(e) => setAssignedSeatNumber(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-center font-bold text-sm"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddPassengerOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving || !selectedIntegranteId}
                className="px-5 py-2 bg-[#002045] hover:bg-blue-900 text-white rounded-xl font-bold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Agregando...' : 'Confirmar Pasajero'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: CREAR O EDITAR RUTA / CONVOY */}
      {isRouteModalOpen && editingRoute && (
        <Modal
          isOpen={isRouteModalOpen}
          onClose={() => setIsRouteModalOpen(false)}
          title={
            editingRoute.id && rutas.some((r) => r.id === editingRoute.id)
              ? 'Editar Convoy de Transporte'
              : 'Programar Nuevo Convoy de Transporte'
          }
          subtitle="Ministerio del Poder Popular para el Transporte • MinDeporte"
          maxWidth="md"
        >
          <form onSubmit={handleSaveRouteForm} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Código Oficial de Ruta:
                </label>
                <input
                  type="text"
                  required
                  value={editingRoute.codigo_ruta || ''}
                  onChange={(e) => setEditingRoute({ ...editingRoute, codigo_ruta: e.target.value })}
                  placeholder="Ej. RUT-YUT-05"
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estatus de la Ruta:
                </label>
                <select
                  value={editingRoute.estatus_ruta || 'Programada'}
                  onChange={(e) => setEditingRoute({ ...editingRoute, estatus_ruta: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                >
                  <option value="Programada">Programada</option>
                  <option value="En_Transito">En Tránsito</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
            </div>

            {/* Trayecto Origen y Destino */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Campamento de Origen:
                </label>
                <select
                  value={editingRoute.campamento_origen_id}
                  onChange={(e) => setEditingRoute({ ...editingRoute, campamento_origen_id: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                >
                  {campamentos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Campamento / Complejo Destino:
                </label>
                <select
                  value={editingRoute.campamento_destino_id}
                  onChange={(e) => setEditingRoute({ ...editingRoute, campamento_destino_id: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                >
                  {campamentos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Unidad y Capacidad */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Unidad / Autobús Yutong:
                </label>
                <input
                  type="text"
                  required
                  value={editingRoute.unidad_vehiculo || ''}
                  onChange={(e) => setEditingRoute({ ...editingRoute, unidad_vehiculo: e.target.value })}
                  placeholder="Ej. Yutong ZK6122 (Placa 01A89CD)"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Capacidad:
                </label>
                <input
                  type="number"
                  min="10"
                  max="80"
                  required
                  value={editingRoute.capacidad_pasajeros || 44}
                  onChange={(e) => setEditingRoute({ ...editingRoute, capacidad_pasajeros: parseInt(e.target.value) || 44 })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-center font-bold"
                />
              </div>
            </div>

            {/* Conductor y Teléfono */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre del Operador / Conductor:
                </label>
                <input
                  type="text"
                  required
                  value={editingRoute.nombre_conductor || ''}
                  onChange={(e) => setEditingRoute({ ...editingRoute, nombre_conductor: e.target.value })}
                  placeholder="Nombre y Apellido"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Teléfono de Contacto:
                </label>
                <input
                  type="text"
                  value={editingRoute.telefono_conductor || ''}
                  onChange={(e) => setEditingRoute({ ...editingRoute, telefono_conductor: e.target.value })}
                  placeholder="+58 412-1234567"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Horarios */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hora de Salida Programada:
                </label>
                <input
                  type="datetime-local"
                  value={editingRoute.hora_salida_programada ? editingRoute.hora_salida_programada.slice(0, 16) : ''}
                  onChange={(e) => setEditingRoute({ ...editingRoute, hora_salida_programada: new Date(e.target.value).toISOString() })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Hora de Llegada Estimada:
                </label>
                <input
                  type="datetime-local"
                  value={editingRoute.hora_llegada_estimada ? editingRoute.hora_llegada_estimada.slice(0, 16) : ''}
                  onChange={(e) => setEditingRoute({ ...editingRoute, hora_llegada_estimada: new Date(e.target.value).toISOString() })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Protocolo de Seguridad y Escolta Vial:
              </label>
              <textarea
                rows={2}
                value={editingRoute.notas_seguridad || ''}
                onChange={(e) => setEditingRoute({ ...editingRoute, notas_seguridad: e.target.value })}
                placeholder="Patrullaje PNB, ambulancia de Protección Civil, ruta autopista Caracas-La Guaira..."
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsRouteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#002045] hover:bg-blue-900 text-white rounded-xl font-bold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Guardando...' : 'Guardar Convoy'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default RoutesView;
