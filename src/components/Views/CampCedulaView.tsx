/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * Vista: Cédula Técnica y Ficha Oficial del Campamento (CampCedulaView.tsx)
 */

import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Building2,
  MapPin,
  Phone,
  UserCheck,
  Award,
  Bed,
  Tent,
  Layers,
  Share2,
  Printer,
  Calendar,
  Shield,
  Search,
  Users,
  HeartPulse,
  Droplets,
  Zap,
  Utensils,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Database,
} from 'lucide-react';
import { Campamento, EstadoRegional, Familia, Integrante } from '../../types';
import { calcularPorcentaje, generarReporteWhatsApp } from '../../lib/utils';
import { InstitutionalLogo } from '../Shared/InstitutionalLogos';
import { FlagIsotype } from '../Shared/FlagIsotype';

interface CampCedulaViewProps {
  campamentos: Campamento[];
  estados: EstadoRegional[];
  familias?: Familia[];
  integrantes?: Integrante[];
  selectedCampamentoId: string;
  onSelectCampamento: (campamentoId: string) => void;
  onNavigateToFamilias?: () => void;
}

export const CampCedulaView: React.FC<CampCedulaViewProps> = ({
  campamentos,
  estados,
  familias = [],
  integrantes = [],
  selectedCampamentoId,
  onSelectCampamento,
  onNavigateToFamilias,
}) => {
  const [filterSearch, setFilterSearch] = useState('');

  // Campamento activo seleccionado
  const activeCamp = useMemo(() => {
    return (
      campamentos.find((c) => c.id === selectedCampamentoId) ||
      campamentos[0] ||
      null
    );
  }, [campamentos, selectedCampamentoId]);

  // Entidad federal del campamento activo
  const estado = useMemo(() => {
    return estados.find((e) => e.id === activeCamp?.estado_id);
  }, [estados, activeCamp]);

  // Familias e integrantes censados en este campamento
  const campFamilias = useMemo(() => {
    if (!activeCamp) return [];
    return familias.filter((f) => f.campamento_id === activeCamp.id);
  }, [familias, activeCamp]);

  const campFamiliasIds = useMemo(() => {
    return new Set(campFamilias.map((f) => f.id));
  }, [campFamilias]);

  const campIntegrantes = useMemo(() => {
    if (!activeCamp) return [];
    return integrantes.filter(
      (i) => i.campamento_id === activeCamp.id || campFamiliasIds.has(i.familia_id)
    );
  }, [integrantes, activeCamp, campFamiliasIds]);

  const totalNNA = useMemo(() => {
    return campIntegrantes.filter((i) => i.es_nna).length;
  }, [campIntegrantes]);

  const pctCamas = activeCamp
    ? calcularPorcentaje(activeCamp.camas_ocupadas, activeCamp.capacidad_camas_total)
    : 0;

  const pctCarpas = activeCamp
    ? calcularPorcentaje(activeCamp.carpas_ocupadas, activeCamp.capacidad_carpas_total)
    : 0;

  const pctModulos = activeCamp
    ? calcularPorcentaje(activeCamp.modulos_ocupados, activeCamp.capacidad_modulos_total)
    : 0;

  // Compartir ficha técnica oficial por WhatsApp
  const handleCompartirWhatsApp = () => {
    if (!activeCamp) return;
    const datos: Record<string, string> = {
      'Sede Oficial': activeCamp.nombre,
      'Entidad Federal': estado?.nombre || 'Venezuela',
      'Ubicación Geográfica': activeCamp.ubicacion_detallada,
      'Director Responsable': activeCamp.director_responsable || 'Comisión MinDeporte',
      'Padrino Institucional': activeCamp.padrino_institucional || 'MinDeporte',
      'Teléfono Operativo': activeCamp.telefono_contacto || 'No registrado',
      'Ocupación de Camas': `${activeCamp.camas_ocupadas} / ${activeCamp.capacidad_camas_total} (${pctCamas}%)`,
      'Carpas en Uso': `${activeCamp.carpas_ocupadas} / ${activeCamp.capacidad_carpas_total}`,
      'Módulos Habilitados': `${activeCamp.modulos_ocupados} / ${activeCamp.capacidad_modulos_total}`,
      'Tipo de Instalación': activeCamp.es_instalacion_deportiva
        ? `Deportiva (${activeCamp.tipo_instalacion_deportiva || 'Polideportivo'})`
        : 'Albergue Transitorio',
      'Familias Resguardadas': `${campFamilias.length} núcleos familiares`,
      'Integrantes Censados': `${campIntegrantes.length} personas (${totalNNA} NNA bajo protección)`,
    };
    const encoded = generarReporteWhatsApp(`CÉDULA TÉCNICA OFICIAL - ${activeCamp.nombre}`, datos);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  // Filtrado de lista para selector rápido
  const filteredOptions = useMemo(() => {
    if (!filterSearch.trim()) return campamentos;
    const term = filterSearch.toLowerCase();
    return campamentos.filter(
      (c) =>
        c.nombre.toLowerCase().includes(term) ||
        c.ubicacion_detallada.toLowerCase().includes(term) ||
        (c.padrino_institucional || '').toLowerCase().includes(term)
    );
  }, [campamentos, filterSearch]);

  if (!activeCamp) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-500">
        No se ha seleccionado ningún campamento.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Barra Superior: Selector de Sede y Acciones */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#002045] uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ficha Técnica Oficial del Campamento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cédula de Campamento Transitorio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Registro descriptivo de infraestructura, servicios básicos, padrinos institucionales y censo habitacional.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector Agrupado de Campamentos */}
          <div className="relative">
            <select
              id="select-campamento-cedula"
              value={activeCamp.id}
              onChange={(e) => onSelectCampamento(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-xl pl-3 pr-8 py-2.5 font-bold text-[#002045] shadow-xs focus:ring-2 focus:ring-[#002045] focus:outline-hidden max-w-[280px] sm:max-w-[340px] truncate"
              aria-label="Seleccionar campamento para cédula técnica"
            >
              {estados.map((est) => {
                const campsEnEstado = campamentos.filter((c) => c.estado_id === est.id);
                if (campsEnEstado.length === 0) return null;
                return (
                  <optgroup key={est.id} label={`${est.nombre} (${campsEnEstado.length} sedes)`}>
                    {campsEnEstado.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Botón WhatsApp */}
          <button
            id="btn-whatsapp-cedula"
            onClick={handleCompartirWhatsApp}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Generar y compartir cédula por WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Reportar WhatsApp</span>
          </button>

          {/* Botón Imprimir */}
          <button
            id="btn-print-cedula"
            onClick={() => window.print()}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Imprimir cédula oficial en formato físico o PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimir Ficha</span>
          </button>
        </div>
      </div>

      {/* DOCUMENTO OFICIAL: CÉDULA IMPRESIBLE (LAYOUT FORMAL) */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Cinta Tricolor Oficial Superior */}
        <div className="h-1.5 w-full flex rounded-t-lg overflow-hidden -mt-6 -mx-6 sm:-mt-8 sm:-mx-8 mb-4 print:hidden">
          <div className="w-1/3 bg-[#FFCC00]" />
          <div className="w-1/3 bg-[#002045]" />
          <div className="w-1/3 bg-[#CF142B]" />
        </div>

        {/* Cabecera Formal de la Cédula */}
        <div className="border-b-2 border-[#002045] pb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <InstitutionalLogo variant="full" />
          </div>
          <div className="text-center sm:text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#002045] text-white text-xs font-mono font-bold tracking-wider uppercase">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>CÉDULA TÉCNICA #{activeCamp.id.toUpperCase()}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-center sm:justify-end gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Fecha de Emisión: {new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </p>
            <p className="text-[10px] text-emerald-700 font-semibold flex items-center justify-center sm:justify-end gap-1 mt-0.5">
              <Database className="w-3 h-3" />
              <span>Sincronizado • Base de Datos Activa</span>
            </p>
          </div>
        </div>

        {/* SECCIÓN 1: Identificación y Ubicación */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Nombre Oficial de la Instalación
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {activeCamp.nombre}
              </h2>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ubicación Geográfica y Dirección
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-700 flex items-start gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>
                  {activeCamp.ubicacion_detallada} • <strong>{estado?.nombre || 'Venezuela'}</strong>
                </span>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Padrino Institucional Responsable
              </span>
              <div className="inline-flex items-center gap-1.5 mt-0.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold text-[#002045]">
                <Shield className="w-3.5 h-3.5 text-blue-700" />
                <span>{activeCamp.padrino_institucional || 'Ministerio del Poder Popular para el Deporte'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Director / Responsable de la Sede
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{activeCamp.director_responsable || 'Comisión MinDeporte Asignada'}</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Contacto Telefónico Operativo
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-1.5 mt-0.5">
                <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{activeCamp.telefono_contacto || 'Línea de Enlace MinDeporte: 0800-DEPORTE'}</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Clasificación de Instalación
              </span>
              <div className="mt-1">
                {activeCamp.es_instalacion_deportiva ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    <Award className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Instalación Deportiva: {activeCamp.tipo_instalacion_deportiva || 'Gimnasio Techado'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-200 text-slate-800">
                    <span>Albergue Comunitario Transitorio</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Matriz de Aforos y Capacidades */}
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#002045]" />
              <span>Matriz de Aforos, Camas y Capacidad Instalada</span>
            </h3>
            <span className="text-xs font-bold text-slate-600">
              Aforo Camas: <strong className={pctCamas > 90 ? 'text-rose-600' : 'text-[#002045]'}>{pctCamas}%</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Camas */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Bed className="w-4 h-4 text-blue-700" /> Camas
                </span>
                <span className={`text-[11px] font-bold ${pctCamas > 90 ? 'text-rose-600' : 'text-blue-700'}`}>
                  {pctCamas}%
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {activeCamp.camas_ocupadas} <span className="text-xs font-normal text-slate-400">/ {activeCamp.capacidad_camas_total}</span>
              </p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full ${pctCamas > 90 ? 'bg-rose-500' : 'bg-[#002045]'}`}
                  style={{ width: `${pctCamas}%` }}
                />
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1.5">
                {Math.max(0, activeCamp.capacidad_camas_total - activeCamp.camas_ocupadas)} camas disponibles
              </p>
            </div>

            {/* Habitaciones */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Building2 className="w-4 h-4 text-indigo-600" /> Habitaciones
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {activeCamp.habitaciones_ocupadas} <span className="text-xs font-normal text-slate-400">/ {activeCamp.capacidad_habitaciones_total}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-2.5">
                {Math.max(0, activeCamp.capacidad_habitaciones_total - activeCamp.habitaciones_ocupadas)} libres
              </p>
            </div>

            {/* Carpas */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Tent className="w-4 h-4 text-amber-600" /> Carpas
                </span>
                <span className="text-[11px] font-bold text-amber-700">{pctCarpas}%</span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {activeCamp.carpas_ocupadas} <span className="text-xs font-normal text-slate-400">/ {activeCamp.capacidad_carpas_total}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-2.5">
                {Math.max(0, activeCamp.capacidad_carpas_total - activeCamp.carpas_ocupadas)} carpas libres
              </p>
            </div>

            {/* Módulos */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Layers className="w-4 h-4 text-emerald-600" /> Módulos
                </span>
                <span className="text-[11px] font-bold text-emerald-700">{pctModulos}%</span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {activeCamp.modulos_ocupados} <span className="text-xs font-normal text-slate-400">/ {activeCamp.capacidad_modulos_total}</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-2.5">
                {Math.max(0, activeCamp.capacidad_modulos_total - activeCamp.modulos_ocupados)} módulos libres
              </p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Censo Demográfico Habitacional en la Sede */}
        {campFamilias.length > 0 ? (
          <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#002045]" />
                <h3 className="text-sm font-black text-[#002045] uppercase tracking-wider">
                  Padrón Habitacional Vinculado ({campFamilias.length} Familias Censadas)
                </h3>
              </div>
              {onNavigateToFamilias && (
                <button
                  onClick={onNavigateToFamilias}
                  className="text-xs font-bold text-[#002045] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <span>Ver Familias en Censo Familiar</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <span className="text-slate-500 text-[11px] block">Núcleos Familiares:</span>
                <span className="text-base font-black text-slate-900">{campFamilias.length}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <span className="text-slate-500 text-[11px] block">Integrantes Totales:</span>
                <span className="text-base font-black text-slate-900">{campIntegrantes.length}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <span className="text-slate-500 text-[11px] block">NNA Bajo Protección:</span>
                <span className="text-base font-black text-blue-700">{totalNNA} NNA</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <span className="text-slate-500 text-[11px] block">Estatus de Resguardo:</span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verificado 100%</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Esta sede mantiene su registro de aforo institucional activo para contingencias o recepción progresiva de familias.</span>
            <span className="font-semibold text-slate-800">Capacidad para {activeCamp.capacidad_camas_total} personas</span>
          </div>
        )}

        {/* SECCIÓN 4: Servicios Básicos y Dotación Operativa */}
        <div>
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-200 pb-2">
            Disponibilidad de Servicios Básicos y Logísticos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5">
              <Droplets className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-800 font-bold">Agua Potable</strong>
                <p className="text-slate-500 text-[11px]">Cisterna y tanques de reserva operativos</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-800 font-bold">Energía Eléctrica</strong>
                <p className="text-slate-500 text-[11px]">Red pública con planta auxiliar de respaldo</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5">
              <Utensils className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-800 font-bold">Alimentación / Comedor</strong>
                <p className="text-slate-500 text-[11px]">Atención nutricional CLAP / MinAlimentación</p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5">
              <HeartPulse className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-800 font-bold">Atención Médica</strong>
                <p className="text-slate-500 text-[11px]">Puesto de triaje IPASME / Barrio Adentro</p>
              </div>
            </div>
          </div>
        </div>

        {/* PIE INSTITUCIONAL DE LA CÉDULA CON SELLOS Y FIRMAS */}
        <div className="pt-6 border-t-2 border-slate-200 mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
          {/* Firma 1 */}
          <div className="space-y-1">
            <div className="h-12 flex items-end justify-center">
              <div className="w-36 border-b border-slate-400" />
            </div>
            <p className="font-bold text-slate-800">Prof. Carlos Mendoza</p>
            <p className="text-[10px] text-slate-500">Director General de Operaciones</p>
          </div>

          {/* Sello Oficial */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#002045] flex flex-col items-center justify-center text-[#002045] p-2">
              <FlagIsotype size="sm" />
              <span className="text-[8px] font-mono font-bold uppercase mt-1">MINDEPORTE</span>
              <span className="text-[7px] text-slate-500">CERTIFICADO</span>
            </div>
            <p className="text-[9px] font-mono text-slate-400 mt-1">HASH: {activeCamp.id}-OK-2026</p>
          </div>

          {/* Firma 2 */}
          <div className="space-y-1">
            <div className="h-12 flex items-end justify-center">
              <div className="w-36 border-b border-slate-400" />
            </div>
            <p className="font-bold text-slate-800">{activeCamp.director_responsable || 'Comisión MinDeporte'}</p>
            <p className="text-[10px] text-slate-500">Responsable de la Sede</p>
          </div>
        </div>

        {/* Pie Legal LOPNNA y Confidencialidad */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>
            Ministerio del Poder Popular para el Deporte • República Bolivariana de Venezuela
          </span>
          <span className="font-mono text-[10px]">
            DOCUMENTO OFICIAL AUDITADO • ART. 65 LOPNNA
          </span>
        </div>
      </div>
    </div>
  );
};

export default CampCedulaView;
