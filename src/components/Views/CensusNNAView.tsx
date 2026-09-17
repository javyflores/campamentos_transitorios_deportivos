/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * Vista: Censo Nominal de Niños, Niñas y Adolescentes (NNA) - Protección LOPNNA y RBAC.
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  HeartPulse,
  User,
  Search,
  Filter,
  Eye,
  Info,
  Baby,
  Share2,
  Printer,
  Building2,
  MapPin,
  Pill,
  Activity,
  CheckCircle2,
  Edit3,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Users,
} from 'lucide-react';
import { Integrante, Familia, Campamento, UserRole, FlagRiesgoEnum } from '../../types';
import {
  canViewSensitiveNNA,
  canEditCensus,
  ofuscarNombre,
  ofuscarCedula,
  ofuscarDatoSensible,
} from '../../lib/auth';
import { ProtectedDataBadge } from '../Shared/ProtectedDataBadge';
import { Modal } from '../Shared/Modal';
import { generarReporteWhatsApp, formatearFecha } from '../../lib/utils';
import { InstitutionalLogo } from '../Shared/InstitutionalLogos';

interface CensusNNAViewProps {
  integrantes: Integrante[];
  familias: Familia[];
  campamentos: Campamento[];
  currentRole: UserRole;
  onSaveIntegrante: (integrante: Integrante) => Promise<void>;
}

export const CensusNNAView: React.FC<CensusNNAViewProps> = ({
  integrantes,
  familias,
  campamentos,
  currentRole,
  onSaveIntegrante,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampamentoId, setSelectedCampamentoId] = useState<string>('todos');
  const [filterRiesgo, setFilterRiesgo] = useState<string>('todos');
  const [filterGrupoEtario, setFilterGrupoEtario] = useState<string>('todos');
  const [filterMedicos, setFilterMedicos] = useState<'todos' | 'con_medicacion' | 'con_patologia'>('todos');
  const [activeNNA, setActiveNNA] = useState<Integrante | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editFlagRiesgo, setEditFlagRiesgo] = useState<FlagRiesgoEnum>('normal');
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar exclusivamente NNA (menores de 18 años según PostgreSQL generated column)
  const nnaList = useMemo(() => {
    return integrantes.filter((i) => i.es_nna);
  }, [integrantes]);

  const isAuthorized = canViewSensitiveNNA(currentRole);
  const canEdit = canEditCensus(currentRole);

  // Mapa rápido de familias y campamentos por id
  const familiaMap = useMemo(() => {
    const map = new Map<string, Familia>();
    familias.forEach((f) => map.set(f.id, f));
    return map;
  }, [familias]);

  const campamentoMap = useMemo(() => {
    const map = new Map<string, Campamento>();
    campamentos.forEach((c) => map.set(c.id, c));
    return map;
  }, [campamentos]);

  // Métricas agregadas de protección
  const metrics = useMemo(() => {
    const total = nnaList.length;
    const lactantes = nnaList.filter((i) => i.edad <= 2).length;
    const ninos = nnaList.filter((i) => i.edad >= 3 && i.edad <= 11).length;
    const adolescentes = nnaList.filter((i) => i.edad >= 12 && i.edad <= 17).length;
    const riesgoCritico = nnaList.filter((i) => i.flag_riesgo === 'danger').length;
    const riesgoSeguimiento = nnaList.filter((i) => i.flag_riesgo === 'warning').length;
    const conMedicamentos = nnaList.filter((i) => i.medicamentos_requeridos && i.medicamentos_requeridos !== 'Ninguno').length;
    const conPatologias = nnaList.filter((i) => i.patologia && i.patologia !== 'Ninguna' && i.patologia !== 'Sano').length;

    return {
      total,
      lactantes,
      ninos,
      adolescentes,
      riesgoCritico,
      riesgoSeguimiento,
      conMedicamentos,
      conPatologias,
    };
  }, [nnaList]);

  // Filtrado compuesto
  const filteredNNA = useMemo(() => {
    return nnaList.filter((item) => {
      // Filtro por sede
      if (selectedCampamentoId !== 'todos') {
        const fam = familiaMap.get(item.familia_id);
        const campId = item.campamento_id || fam?.campamento_id;
        if (campId !== selectedCampamentoId) return false;
      }

      // Filtro por riesgo
      if (filterRiesgo !== 'todos' && item.flag_riesgo !== filterRiesgo) {
        return false;
      }

      // Filtro por grupo etario
      if (filterGrupoEtario === 'lactantes' && item.edad > 2) return false;
      if (filterGrupoEtario === 'infancia' && (item.edad < 3 || item.edad > 11)) return false;
      if (filterGrupoEtario === 'adolescencia' && (item.edad < 12 || item.edad > 17)) return false;

      // Filtro por condición médica
      if (filterMedicos === 'con_medicacion' && (!item.medicamentos_requeridos || item.medicamentos_requeridos === 'Ninguno')) {
        return false;
      }
      if (filterMedicos === 'con_patologia' && (!item.patologia || item.patologia === 'Ninguna' || item.patologia === 'Sano')) {
        return false;
      }

      // Búsqueda de texto
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesNombre = item.nombre_completo.toLowerCase().includes(term);
        const matchesCedula = (item.cedula_identidad || '').toLowerCase().includes(term);
        const fam = familiaMap.get(item.familia_id);
        const matchesFam = fam ? fam.nombre_familia.toLowerCase().includes(term) : false;
        const matchesPat = (item.patologia || '').toLowerCase().includes(term);
        if (!matchesNombre && !matchesCedula && !matchesFam && !matchesPat) {
          return false;
        }
      }

      return true;
    });
  }, [nnaList, selectedCampamentoId, filterRiesgo, filterGrupoEtario, filterMedicos, searchTerm, familiaMap]);

  // Paginación
  const totalPages = Math.ceil(filteredNNA.length / itemsPerPage) || 1;
  const paginatedNNA = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNNA.slice(start, start + itemsPerPage);
  }, [filteredNNA, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Abrir modal de expediente
  const handleOpenExpediente = (nna: Integrante) => {
    setActiveNNA(nna);
    setEditNotes(nna.notas_proteccion_nna || '');
    setEditFlagRiesgo(nna.flag_riesgo || 'normal');
    setIsEditingNotes(false);
  };

  // Guardar notas actualizadas
  const handleSaveExpedienteNotes = async () => {
    if (!activeNNA) return;
    setIsSaving(true);
    try {
      const updated: Integrante = {
        ...activeNNA,
        notas_proteccion_nna: editNotes,
        flag_riesgo: editFlagRiesgo,
        updated_at: new Date().toISOString(),
      };
      await onSaveIntegrante(updated);
      setActiveNNA(updated);
      setIsEditingNotes(false);
    } finally {
      setIsSaving(false);
    }
  };

  // Reporte de alerta WhatsApp para Defensoría / Salas Situacionales
  const handleReporteWhatsApp = () => {
    const datos: Record<string, string | number> = {
      'Total NNA Bajo Resguardo': `${metrics.total} menores censados`,
      'Lactantes (0 a 2 años)': `${metrics.lactantes} casos prioritarios`,
      'Primera Infancia (3 a 11 años)': `${metrics.ninos} en edad escolar`,
      'Adolescentes (12 a 17 años)': `${metrics.adolescentes} en formación deportiva`,
      'Alertas Críticas Sanitarias': `${metrics.riesgoCritico} en seguimiento de salud`,
      'Seguimiento Especial': `${metrics.riesgoSeguimiento} casos con atención médica`,
      'Tratamientos Médicos Activos': `${metrics.conMedicamentos} con dotación farmacológica`,
      'Marco Legal': 'Art. 65 LOPNNA - Confidencialidad Garantizada',
      'Responsable de Reporte': `${currentRole} - Sistema Oficial MinDeporte`,
    };
    const encoded = generarReporteWhatsApp('SITUACIÓN INTEGRAL DE PROTECCIÓN NNA', datos);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado y Aviso Legal LOPNNA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#002045] uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Protección Integral y Censo Nominal Especializado</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Padrón de Niños, Niñas y Adolescentes (NNA)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manejo reservado, seguimiento pediátrico y dotación deportiva según el Art. 65 de la LOPNNA.
          </p>
        </div>

        {/* Acciones y Estado de Desofuscación según Rol RBAC */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border shadow-2xs ${
              isAuthorized
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {isAuthorized ? (
              <>
                <Unlock className="w-4 h-4 text-emerald-600" />
                <span>Acceso Desofuscado ({currentRole})</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Datos Sensibles Ofuscados ({currentRole})</span>
              </>
            )}
          </div>

          <button
            onClick={handleReporteWhatsApp}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Generar y compartir reporte situacional por WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Reportar WhatsApp</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Imprimir padrón oficial NNA en formato físico o PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimir Censo</span>
          </button>
        </div>
      </div>

      {/* Banner Legal Informativo LOPNNA */}
      <div className="p-4 rounded-xl bg-sky-50/90 border border-sky-200 text-xs text-sky-950 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Aviso de Protección de Datos Sensibles (Art. 65 LOPNNA):</strong> Todos los registros de menores
          de 18 años en albergues deportivos transitorios gozan de reserva de confidencialidad. Solo los roles con acreditación
          legal e institucional (<strong>Administrador General</strong> y <strong>Defensoría de Protección NNA</strong>) tienen autorización
          para consultar identidades completas, cédulas desofuscadas y diagnósticos clínicos privados. Cambie el rol en la barra superior para
          verificar el enmascaramiento dinámico en tiempo real.
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS Y DESGLOSE DEMOGRÁFICO DE VULNERABILIDAD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total NNA */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">Total NNA</span>
            <Users className="w-3.5 h-3.5 text-[#002045]" />
          </div>
          <p className="text-xl font-black text-slate-900">{metrics.total}</p>
          <span className="text-[10px] text-slate-400">100% de la población infantil</span>
        </div>

        {/* Lactantes 0-2 */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">Lactantes (0-2)</span>
            <Baby className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-700">{metrics.lactantes}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Prioridad nutricional</span>
        </div>

        {/* Niños 3-11 */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">Niñez (3-11)</span>
            <User className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-indigo-700">{metrics.ninos}</p>
          <span className="text-[10px] text-slate-400">Iniciación deportiva</span>
        </div>

        {/* Adolescentes 12-17 */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">Jóvenes (12-17)</span>
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700">{metrics.adolescentes}</p>
          <span className="text-[10px] text-slate-400">Captación de talentos</span>
        </div>

        {/* Alerta Prioritaria */}
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-rose-700 mb-1">
            <span className="font-bold">Alerta Crítica</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          </div>
          <p className="text-xl font-black text-rose-700">{metrics.riesgoCritico}</p>
          <span className="text-[10px] text-rose-600 font-semibold">Monitoreo médico</span>
        </div>

        {/* Medicación Requerida */}
        <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
            <span className="font-bold">Tratamientos</span>
            <Pill className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-800">{metrics.conMedicamentos}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Dotación farmacológica</span>
        </div>
      </div>

      {/* CONTROLES DE BÚSQUEDA Y FILTRADO AVANZADO */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, código de registro, familia o patología..."
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

          {/* Filtro por Campamento / Sede */}
          <div className="w-full md:w-64">
            <select
              value={selectedCampamentoId}
              onChange={(e) => {
                setSelectedCampamentoId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[#002045] font-semibold focus:bg-white focus:ring-2 focus:ring-[#002045]"
            >
              <option value="todos">Todas las Sedes ({campamentos.length})</option>
              {campamentos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Fila de Micro-filtros (Grupo etario, riesgo, condiciones de salud) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar:</span>
          </div>

          {/* Grupo etario */}
          <select
            value={filterGrupoEtario}
            onChange={(e) => {
              setFilterGrupoEtario(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="todos">Todos los Grupos Etarios</option>
            <option value="lactantes">Lactantes (0 a 2 años)</option>
            <option value="infancia">Niñez (3 a 11 años)</option>
            <option value="adolescencia">Adolescencia (12 a 17 años)</option>
          </select>

          {/* Nivel de riesgo */}
          <select
            value={filterRiesgo}
            onChange={(e) => {
              setFilterRiesgo(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="todos">Todos los Niveles de Riesgo</option>
            <option value="normal">Normal / Sano</option>
            <option value="warning">Seguimiento Pediátrico (Warning)</option>
            <option value="danger">Alerta Prioritaria (Danger)</option>
          </select>

          {/* Condición de salud */}
          <select
            value={filterMedicos}
            onChange={(e) => {
              setFilterMedicos(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="todos">Toda Condición Médica</option>
            <option value="con_medicacion">Con Medicación Requerida</option>
            <option value="con_patologia">Con Patología Registrada</option>
          </select>

          {(searchTerm || selectedCampamentoId !== 'todos' || filterRiesgo !== 'todos' || filterGrupoEtario !== 'todos' || filterMedicos !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCampamentoId('todos');
                setFilterRiesgo('todos');
                setFilterGrupoEtario('todos');
                setFilterMedicos('todos');
                setCurrentPage(1);
              }}
              className="text-[11px] text-blue-700 font-bold hover:underline ml-auto"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* Conteo de Resultados */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Mostrando <strong className="text-slate-800">{filteredNNA.length}</strong> de{' '}
          <strong className="text-slate-800">{nnaList.length}</strong> NNA registrados
        </span>
        {totalPages > 1 && (
          <span>
            Página <strong className="text-slate-800">{currentPage}</strong> de{' '}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Mensaje de Cero Resultados */}
      {filteredNNA.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron NNA con los criterios seleccionados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Verifique el término de búsqueda o ajuste los filtros de sede, grupo etario y riesgo de protección.
          </p>
        </div>
      )}

      {/* TABLA OFICIAL DE NNA CON OFUSCACIÓN DINÁMICA */}
      {filteredNNA.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Identidad del Menor</th>
                  <th className="py-3 px-4">Cédula / Documento</th>
                  <th className="py-3 px-4">Edad / Etapa</th>
                  <th className="py-3 px-4">Sede y Ubicación</th>
                  <th className="py-3 px-4">Núcleo Familiar</th>
                  <th className="py-3 px-4">Condición de Salud</th>
                  <th className="py-3 px-4">Estatus LOPNNA</th>
                  <th className="py-3 px-4 text-center">Expediente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedNNA.map((nna) => {
                  const familia = familiaMap.get(nna.familia_id);
                  const campId = nna.campamento_id || familia?.campamento_id || '';
                  const camp = campamentoMap.get(campId);

                  const nombreVisible = ofuscarNombre(nna.nombre_completo, true, currentRole);
                  const cedulaVisible = ofuscarCedula(nna.cedula_identidad, true, currentRole);
                  const patologiaVisible = ofuscarDatoSensible(nna.patologia, true, currentRole);
                  const medicamentosVisible = ofuscarDatoSensible(nna.medicamentos_requeridos, true, currentRole);

                  return (
                    <tr key={nna.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Identidad */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] ${
                            nna.sexo === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-[#002045]'
                          }`}>
                            {nna.edad <= 2 ? <Baby className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {nombreVisible}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {nna.sexo === 'F' ? 'Femenino' : 'Masculino'} • Cama: {nna.numero_cama || 'S/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cédula */}
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {cedulaVisible}
                      </td>

                      {/* Edad / Etapa */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{nna.edad} años</span>
                        <span className={`text-[10px] font-semibold ${
                          nna.edad <= 2 ? 'text-blue-600' : nna.edad <= 11 ? 'text-indigo-600' : 'text-emerald-600'
                        }`}>
                          {nna.edad <= 2 ? 'Lactante' : nna.edad <= 11 ? 'Escolar' : 'Adolescente'}
                        </span>
                      </td>

                      {/* Sede y Ubicación */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">
                          {camp?.nombre || 'Sede Transitoria'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {camp?.ubicacion_detallada || 'Ubicación regional'}
                        </div>
                      </td>

                      {/* Familia */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 block">
                          {familia?.nombre_familia || 'Núcleo Familiar'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {familia?.ubicacion_interna || 'Módulo habitacional'}
                        </span>
                      </td>

                      {/* Condición de Salud */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="truncate text-slate-800 font-medium">
                          {patologiaVisible}
                        </div>
                        {nna.medicamentos_requeridos && nna.medicamentos_requeridos !== 'Ninguno' && (
                          <div className="text-[10px] text-amber-800 truncate flex items-center gap-1 mt-0.5">
                            <Pill className="w-3 h-3 text-amber-600 flex-shrink-0" />
                            <span>{medicamentosVisible}</span>
                          </div>
                        )}
                      </td>

                      {/* Estatus Riesgo */}
                      <td className="py-3 px-4">
                        <ProtectedDataBadge
                          isNNA={true}
                          flagRiesgo={nna.flag_riesgo}
                        />
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenExpediente(nna)}
                          className="px-2.5 py-1 bg-white hover:bg-[#002045] text-[#002045] hover:text-white border border-slate-300 hover:border-[#002045] rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1 mx-auto cursor-pointer"
                          title="Consultar expediente confidencial de protección LOPNNA"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Expediente</span>
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

      {/* MODAL DE EXPEDIENTE CONFIDENCIAL DE PROTECCIÓN NNA */}
      {activeNNA && (
        <Modal
          isOpen={!!activeNNA}
          onClose={() => setActiveNNA(null)}
          title={`Expediente Oficial NNA - ${ofuscarNombre(activeNNA.nombre_completo, true, currentRole)}`}
          subtitle="Cumplimiento con la Ley Orgánica para la Protección de Niños, Niñas y Adolescentes (Art. 65)"
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Membrete Oficial del Expediente */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-700" />
                <div>
                  <span className="font-bold text-slate-900 block">
                    CÓDIGO DE EXPEDIENTE: NNA-{activeNNA.id.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Registrado en Base de Datos de Protección • Sistema MinDeporte
                  </span>
                </div>
              </div>
              <ProtectedDataBadge isNNA={true} flagRiesgo={activeNNA.flag_riesgo} />
            </div>

            {/* Datos Personales y Filiación */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-white rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Documento:</span>
                <span className="font-mono font-bold text-slate-900">
                  {ofuscarCedula(activeNNA.cedula_identidad, true, currentRole)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Edad y Sexo:</span>
                <span className="font-bold text-slate-900">
                  {activeNNA.edad} años ({activeNNA.sexo === 'F' ? 'Femenino' : 'Masculino'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Cama Asignada:</span>
                <span className="font-bold text-slate-900">{activeNNA.numero_cama || 'Sin Asignar'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Parentesco:</span>
                <span className="font-bold text-slate-900">{activeNNA.parentesco || 'Hijo(a)'}</span>
              </div>
            </div>

            {/* Sede y Núcleo Familiar */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Núcleo Familiar y Ubicación Institucional
              </span>
              <p className="font-semibold text-slate-800">
                Familia: {familiaMap.get(activeNNA.familia_id)?.nombre_familia || 'Núcleo Asignado'} • Ubicación: {familiaMap.get(activeNNA.familia_id)?.ubicacion_interna || 'Sector Interno'}
              </p>
              <p className="text-[11px] text-slate-500">
                Sede: {campamentoMap.get(activeNNA.campamento_id || familiaMap.get(activeNNA.familia_id)?.campamento_id || '')?.nombre || 'Campamento Transitorio'}
              </p>
            </div>

            {/* Diagnóstico y Tratamiento Médico */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>Perfil Clínico y Farmacológico</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-bold block mb-1">Patología o Condición:</span>
                  <p className="text-slate-800">
                    {ofuscarDatoSensible(activeNNA.patologia, true, currentRole)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 font-bold block mb-1">Medicamentos Requeridos:</span>
                  <p className="text-slate-800">
                    {ofuscarDatoSensible(activeNNA.medicamentos_requeridos, true, currentRole)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tallas y Dotación Deportiva */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Medidas y Dotación de Uniforme Deportivo
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Franela / Ropa</span>
                  <span className="font-bold text-slate-800">{activeNNA.talla_franela_ropa || 'T-8 / S'}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Mono / Pantalón</span>
                  <span className="font-bold text-slate-800">{activeNNA.talla_pantalon_mono || 'T-8 / S'}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Calzado</span>
                  <span className="font-bold text-slate-800">{activeNNA.talla_calzado || '32'}</span>
                </div>
              </div>
            </div>

            {/* Actas y Notas de Protección LOPNNA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Seguimiento de Protección LOPNNA</span>
                </h4>
                {canEdit && !isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-blue-700 hover:text-[#002045] font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Actualizar Acta / Nivel de Riesgo</span>
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">
                      Nivel de Riesgo Asignado:
                    </label>
                    <select
                      value={editFlagRiesgo}
                      onChange={(e) => setEditFlagRiesgo(e.target.value as FlagRiesgoEnum)}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#002045]"
                    >
                      <option value="normal">Normal / Sano</option>
                      <option value="warning">Seguimiento Pediátrico / Asma (Warning)</option>
                      <option value="danger">Alerta Prioritaria / Lactante (Danger)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-1">
                      Notas del Defensor / Trabajador Social:
                    </label>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Ingrese los antecedentes de protección, medidas cautelares o seguimiento médico..."
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-[#002045] focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsEditingNotes(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveExpedienteNotes}
                      disabled={isSaving}
                      className="px-3.5 py-1.5 rounded-lg bg-[#002045] text-white font-bold hover:bg-blue-900 disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/50 rounded-xl text-slate-800 border border-amber-200">
                  <p className="leading-relaxed">
                    {ofuscarDatoSensible(activeNNA.notas_proteccion_nna, true, currentRole)}
                  </p>
                </div>
              )}
            </div>

            {/* Pie del Modal */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">
                REGISTRO CONFORME CON ART. 65 LOPNNA
              </span>
              <button
                onClick={() => setActiveNNA(null)}
                className="px-4 py-2 bg-[#002045] hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CensusNNAView;
