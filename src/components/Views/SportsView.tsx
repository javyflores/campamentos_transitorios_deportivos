/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * Vista: Perfilamiento Deportivo, Biometría, IMC y Detección de Talentos (SportsView.tsx).
 */

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Trophy,
  Heart,
  Scale,
  Ruler,
  Flame,
  UserCheck,
  Search,
  Plus,
  Award,
  Sparkles,
  Edit,
  Share2,
  Printer,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Zap,
  Dumbbell,
  Shield,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import {
  PerfilDeportivo,
  Integrante,
  UserRole,
  NivelDeportivoEnum,
  AptitudDeportivaEnum,
} from '../../types';
import { calcularIMC, clasificarIMC, generarReporteWhatsApp } from '../../lib/utils';
import { canEditSports, ofuscarNombre } from '../../lib/auth';
import { Modal } from '../Shared/Modal';
import { InstitutionalLogo } from '../Shared/InstitutionalLogos';
import { FlagIsotype } from '../Shared/FlagIsotype';

interface SportsViewProps {
  perfiles: PerfilDeportivo[];
  integrantes: Integrante[];
  currentRole: UserRole;
  onSavePerfil: (perfil: PerfilDeportivo) => Promise<void>;
}

export const SportsView: React.FC<SportsViewProps> = ({
  perfiles,
  integrantes,
  currentRole,
  onSavePerfil,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTalento, setFilterTalento] = useState<'todos' | 'talentos' | 'seleccion'>('todos');
  const [filterDisciplina, setFilterDisciplina] = useState<string>('todas');
  const [filterNivel, setFilterNivel] = useState<string>('todos');
  const [filterIMC, setFilterIMC] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState<Partial<PerfilDeportivo> | null>(null);
  const [activePerfilForDetail, setActivePerfilForDetail] = useState<PerfilDeportivo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const canEdit = canEditSports(currentRole);

  // Mapa rápido de integrantes por ID
  const integranteMap = useMemo(() => {
    const map = new Map<string, Integrante>();
    integrantes.forEach((i) => map.set(i.id, i));
    return map;
  }, [integrantes]);

  // Lista de disciplinas únicas presentes
  const disciplinasDisponibles = useMemo(() => {
    const set = new Set<string>();
    perfiles.forEach((p) => {
      if (p.disciplina_principal) set.add(p.disciplina_principal);
    });
    return Array.from(set).sort();
  }, [perfiles]);

  // Métricas agregadas
  const metrics = useMemo(() => {
    const total = perfiles.length;
    const talentos = perfiles.filter((p) => p.posee_talento_destacado).length;
    const seleccionNacional = perfiles.filter((p) => p.nivel_competencia === 'Seleccion_Nacional').length;
    
    // Promedio de IMC
    const validIMCs = perfiles.map((p) => p.imc || calcularIMC(p.peso_kg, p.estatura_cm)).filter((v) => v > 0);
    const avgIMC = validIMCs.length > 0 ? (validIMCs.reduce((a, b) => a + b, 0) / validIMCs.length).toFixed(1) : '22.0';

    // Promedio de Kcal
    const validKcals = perfiles.map((p) => p.requerimiento_calorico_diario_kcal).filter((v) => v > 0);
    const avgKcal = validKcals.length > 0 ? Math.round(validKcals.reduce((a, b) => a + b, 0) / validKcals.length) : 2600;

    // Conteo por estado nutricional OMS
    let bajoPeso = 0;
    let normal = 0;
    let sobrepeso = 0;
    let obesidad = 0;

    perfiles.forEach((p) => {
      const imc = p.imc || calcularIMC(p.peso_kg, p.estatura_cm);
      if (imc < 18.5) bajoPeso++;
      else if (imc < 25.0) normal++;
      else if (imc < 30.0) sobrepeso++;
      else obesidad++;
    });

    return {
      total,
      talentos,
      seleccionNacional,
      avgIMC,
      avgKcal,
      distribucionIMC: { bajoPeso, normal, sobrepeso, obesidad },
    };
  }, [perfiles]);

  // Filtrado compuesto
  const filteredPerfiles = useMemo(() => {
    return perfiles.filter((p) => {
      const integrante = integranteMap.get(p.integrante_id);
      const nombre = integrante ? integrante.nombre_completo.toLowerCase() : '';
      const disciplina = p.disciplina_principal.toLowerCase();
      const entrenador = (p.entrenador_evaluador || '').toLowerCase();

      // Búsqueda libre
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (!nombre.includes(term) && !disciplina.includes(term) && !entrenador.includes(term)) {
          return false;
        }
      }

      // Filtro de Talento
      if (filterTalento === 'talentos' && !p.posee_talento_destacado) return false;
      if (filterTalento === 'seleccion' && p.nivel_competencia !== 'Seleccion_Nacional') return false;

      // Filtro de Disciplina
      if (filterDisciplina !== 'todas' && p.disciplina_principal !== filterDisciplina) return false;

      // Filtro de Nivel
      if (filterNivel !== 'todos' && p.nivel_competencia !== filterNivel) return false;

      // Filtro de IMC
      if (filterIMC !== 'todos') {
        const imc = p.imc || calcularIMC(p.peso_kg, p.estatura_cm);
        if (filterIMC === 'bajo' && imc >= 18.5) return false;
        if (filterIMC === 'normal' && (imc < 18.5 || imc >= 25.0)) return false;
        if (filterIMC === 'sobrepeso' && (imc < 25.0 || imc >= 30.0)) return false;
        if (filterIMC === 'obesidad' && imc < 30.0) return false;
      }

      return true;
    });
  }, [perfiles, searchTerm, filterTalento, filterDisciplina, filterNivel, filterIMC, integranteMap]);

  // Paginación
  const totalPages = Math.ceil(filteredPerfiles.length / itemsPerPage) || 1;
  const paginatedPerfiles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPerfiles.slice(start, start + itemsPerPage);
  }, [filteredPerfiles, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenEdit = (perfil?: PerfilDeportivo) => {
    if (perfil) {
      setEditingPerfil({ ...perfil });
    } else {
      setEditingPerfil({
        id: `perf-${Date.now()}`,
        integrante_id: integrantes[0]?.id || '',
        disciplina_principal: 'Fútbol Campo',
        disciplina_secundaria: 'Futsal',
        nivel_competencia: 'Aficionado',
        aptitud_deportiva_supervisada: 'Optima',
        peso_kg: 62.0,
        estatura_cm: 172.0,
        porcentaje_grasa_estimado: 14.5,
        requerimiento_calorico_diario_kcal: 2800,
        dieta_especial_requerida: 'Dieta hiperproteica y balance electrolítico',
        frecuencia_cardiaca_reposo: 68,
        presion_arterial_sistolica: 118,
        presion_arterial_diastolica: 76,
        posee_talento_destacado: false,
        entrenador_evaluador: 'Prof. Carlos Mendoza',
        observaciones_entrenador: 'Buena técnica de carrera y resistencia aeróbica.',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerfil || !editingPerfil.integrante_id) return;

    setIsSaving(true);
    try {
      const peso = Number(editingPerfil.peso_kg) || 60;
      const estatura = Number(editingPerfil.estatura_cm) || 170;
      const imcCalculado = calcularIMC(peso, estatura);

      const completePerfil: PerfilDeportivo = {
        id: editingPerfil.id || `perf-${Date.now()}`,
        integrante_id: editingPerfil.integrante_id,
        disciplina_principal: editingPerfil.disciplina_principal || 'Atletismo',
        disciplina_secundaria: editingPerfil.disciplina_secundaria || '',
        nivel_competencia: (editingPerfil.nivel_competencia as NivelDeportivoEnum) || 'Iniciacion',
        aptitud_deportiva_supervisada: (editingPerfil.aptitud_deportiva_supervisada as AptitudDeportivaEnum) || 'Optima',
        peso_kg: peso,
        estatura_cm: estatura,
        imc: imcCalculado,
        porcentaje_grasa_estimado: Number(editingPerfil.porcentaje_grasa_estimado) || 15.0,
        requerimiento_calorico_diario_kcal: Number(editingPerfil.requerimiento_calorico_diario_kcal) || 2500,
        dieta_especial_requerida: editingPerfil.dieta_especial_requerida || '',
        frecuencia_cardiaca_reposo: Number(editingPerfil.frecuencia_cardiaca_reposo) || undefined,
        presion_arterial_sistolica: Number(editingPerfil.presion_arterial_sistolica) || undefined,
        presion_arterial_diastolica: Number(editingPerfil.presion_arterial_diastolica) || undefined,
        posee_talento_destacado: Boolean(editingPerfil.posee_talento_destacado),
        entrenador_evaluador: editingPerfil.entrenador_evaluador || 'Cuerpo Técnico MinDeporte',
        observaciones_entrenador: editingPerfil.observaciones_entrenador || '',
        updated_at: new Date().toISOString(),
      };

      await onSavePerfil(completePerfil);
      setIsModalOpen(false);
      setEditingPerfil(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Reporte por WhatsApp
  const handleReporteWhatsApp = () => {
    const datos: Record<string, string | number> = {
      'Atletas y Población Evaluada': `${metrics.total} perfiles biométricos`,
      'Talentos Deportivos Élite': `${metrics.talentos} captados`,
      'Selección Nacional / Alto Rendimiento': `${metrics.seleccionNacional} atletas`,
      'Promedio IMC General': `${metrics.avgIMC} (Población en rango saludable)`,
      'Requerimiento Calórico Promedio': `${metrics.avgKcal} kcal/día por atleta`,
      'Estado Nutricional OMS': `Normal: ${metrics.distribucionIMC.normal} | Sobrepeso: ${metrics.distribucionIMC.sobrepeso} | Bajo Peso: ${metrics.distribucionIMC.bajoPeso}`,
      'Evaluador Responsable': 'Dirección General de Rendimiento Deportivo - IND',
    };
    const encoded = generarReporteWhatsApp('BALANCE TÉCNICO DE CAPTACIÓN DEPORTIVA E IMC', datos);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabecera Institucional */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#002045] uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Instituto Nacional de Deportes (IND) • MinDeporte</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Perfiles Deportivos, IMC y Captación de Talentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluación biométrica, balance nutricional OMS y plan de captación de atletas en campamentos transitorios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canEdit && (
            <button
              id="btn-add-sports-profile"
              onClick={() => handleOpenEdit()}
              className="px-4 py-2 bg-[#002045] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Evaluación Biométrica</span>
            </button>
          )}

          <button
            onClick={handleReporteWhatsApp}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Generar y compartir reporte de talentos por WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Reportar WhatsApp</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Imprimir evaluaciones y fichas técnicas"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimir Fichas</span>
          </button>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS Y SEMÁFORO NUTRICIONAL OMS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Atletas Evaluados */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">Evaluados</span>
            <Dumbbell className="w-3.5 h-3.5 text-[#002045]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{metrics.total}</p>
          <span className="text-[10px] text-slate-400">Atletas con ficha activa</span>
        </div>

        {/* Talentos Élite */}
        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/50 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
            <span className="font-bold">Talentos Élite</span>
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-800">{metrics.talentos}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Captación Alto Rendimiento</span>
        </div>

        {/* Selección Nacional */}
        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#002045] mb-1">
            <span className="font-bold">Selección Nac.</span>
            <Award className="w-3.5 h-3.5 text-blue-700" />
          </div>
          <p className="text-2xl font-black text-[#002045]">{metrics.seleccionNacional}</p>
          <span className="text-[10px] text-blue-700 font-semibold">Deportistas federados</span>
        </div>

        {/* Promedio IMC */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">Promedio IMC</span>
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{metrics.avgIMC}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Rango normal saludable</span>
        </div>

        {/* Requerimiento Calórico */}
        <div className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/50 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-orange-800 mb-1">
            <span className="font-bold">Gasto Energético</span>
            <Flame className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <p className="text-2xl font-black text-orange-800">{metrics.avgKcal}</p>
          <span className="text-[10px] text-orange-700 font-semibold">kcal/día promedio atleta</span>
        </div>

        {/* Semáforo OMS */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Semáforo OMS
          </span>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-bold">
            <span className="text-emerald-700">Norm: {metrics.distribucionIMC.normal}</span>
            <span className="text-amber-700">Sobre: {metrics.distribucionIMC.sobrepeso}</span>
            <span className="text-blue-700">Bajo: {metrics.distribucionIMC.bajoPeso}</span>
            <span className="text-rose-700">Obes: {metrics.distribucionIMC.obesidad}</span>
          </div>
          <span className="text-[9px] text-slate-400 block mt-1">Supervisión MinDeporte</span>
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
              placeholder="Buscar por atleta, disciplina deportiva o entrenador evaluador..."
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

          {/* Botones de Segmento Rápido */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto border border-slate-200">
            <button
              onClick={() => {
                setFilterTalento('todos');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTalento === 'todos' ? 'bg-white text-[#002045] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({perfiles.length})
            </button>
            <button
              onClick={() => {
                setFilterTalento('talentos');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterTalento === 'talentos' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3 h-3 text-amber-600" />
              <span>Talentos ({metrics.talentos})</span>
            </button>
            <button
              onClick={() => {
                setFilterTalento('seleccion');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterTalento === 'seleccion' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Selección ({metrics.seleccionNacional})
            </button>
          </div>
        </div>

        {/* Filtros Dropdown Secundarios */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* Disciplina */}
          <select
            value={filterDisciplina}
            onChange={(e) => {
              setFilterDisciplina(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="todas">Todas las Disciplinas</option>
            {disciplinasDisponibles.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Nivel */}
          <select
            value={filterNivel}
            onChange={(e) => {
              setFilterNivel(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="todos">Todos los Niveles</option>
            <option value="Iniciacion">Iniciación Deportiva</option>
            <option value="Aficionado">Aficionado</option>
            <option value="Atleta_Alta_Competencia">Alta Competencia</option>
            <option value="Seleccion_Nacional">Selección Nacional</option>
          </select>

          {/* Estado Nutricional / IMC */}
          <select
            value={filterIMC}
            onChange={(e) => {
              setFilterIMC(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="todos">Cualquier IMC</option>
            <option value="bajo">Bajo Peso (&lt; 18.5)</option>
            <option value="normal">Peso Normal (18.5 - 24.9)</option>
            <option value="sobrepeso">Sobrepeso (25.0 - 29.9)</option>
            <option value="obesidad">Obesidad (≥ 30.0)</option>
          </select>

          {(searchTerm || filterTalento !== 'todos' || filterDisciplina !== 'todas' || filterNivel !== 'todos' || filterIMC !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterTalento('todos');
                setFilterDisciplina('todas');
                setFilterNivel('todos');
                setFilterIMC('todos');
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
          Mostrando <strong className="text-slate-800">{filteredPerfiles.length}</strong> de{' '}
          <strong className="text-slate-800">{perfiles.length}</strong> evaluaciones registradas
        </span>
        {totalPages > 1 && (
          <span>
            Página <strong className="text-slate-800">{currentPage}</strong> de{' '}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Mensaje de Cero Resultados */}
      {filteredPerfiles.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <Activity className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron fichas biométricas</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ajuste los filtros de búsqueda, nivel de competencia o disciplina deportiva para visualizar atletas evaluados.
          </p>
        </div>
      )}

      {/* GRID DE FICHAS DEPORTIVAS Y BIOMÉTRICAS */}
      {filteredPerfiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedPerfiles.map((p) => {
            const integrante = integranteMap.get(p.integrante_id);
            const imc = p.imc || calcularIMC(p.peso_kg, p.estatura_cm);
            const imcInfo = clasificarIMC(imc);
            const nombreAtleta = integrante
              ? ofuscarNombre(integrante.nombre_completo, integrante.es_nna, currentRole)
              : 'Atleta Asignado';

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between ${
                  p.posee_talento_destacado
                    ? 'border-amber-400 bg-linear-to-b from-amber-50/25 to-white'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Encabezado de la Tarjeta */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-[#002045] border border-blue-200">
                      {p.disciplina_principal}
                    </span>
                    {p.posee_talento_destacado && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                        <Trophy className="w-3 h-3 text-amber-600" />
                        <span>Talento Élite</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-slate-900 line-clamp-1">
                    {nombreAtleta}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {integrante?.edad || 16} años • {p.nivel_competencia.replace(/_/g, ' ')}
                    {p.disciplina_secundaria && ` • Sec: ${p.disciplina_secundaria}`}
                  </p>

                  {/* Panel Biométrico: Peso, Estatura, IMC */}
                  <div className="grid grid-cols-3 gap-2 mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">PESO</span>
                      <span className="text-sm font-bold text-slate-800">{p.peso_kg} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">ESTATURA</span>
                      <span className="text-sm font-bold text-slate-800">{p.estatura_cm} cm</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">IMC</span>
                      <span className="text-sm font-black text-blue-700">{imc}</span>
                    </div>
                  </div>

                  {/* Clasificación OMS y Calorías */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className={`font-bold ${imcInfo.color}`}>
                      ● {imcInfo.categoria}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <strong>{p.requerimiento_calorico_diario_kcal}</strong> kcal/día
                    </span>
                  </div>

                  {/* Aptitud Física */}
                  <div className="mt-2 text-xs flex items-center justify-between text-slate-600 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-[11px]">Aptitud:</span>
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{p.aptitud_deportiva_supervisada.replace(/_/g, ' ')}</span>
                    </span>
                  </div>

                  {p.observaciones_entrenador && (
                    <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2 italic">
                      "{p.observaciones_entrenador}"
                    </p>
                  )}
                </div>

                {/* Pie de Tarjeta con Evaluador y Acciones */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate max-w-[150px]">
                    Eval: {p.entrenador_evaluador || 'Cuerpo Técnico'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setActivePerfilForDetail(p)}
                      className="p-1.5 text-slate-600 hover:text-[#002045] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Ver expediente técnico completo"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-[#002045] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar evaluación biométrica"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
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

      {/* MODAL DE DETALLE EXPEDIENTE BIOMÉTRICO */}
      {activePerfilForDetail && (
        <Modal
          isOpen={!!activePerfilForDetail}
          onClose={() => setActivePerfilForDetail(null)}
          title="Ficha Técnica Biometríca y Perfil del Atleta"
          subtitle="Ministerio del Poder Popular para el Deporte • Instituto Nacional de Deportes"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Cabecera del Atleta */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Atleta Evaluado</span>
                <h3 className="text-base font-black text-slate-900">
                  {integranteMap.get(activePerfilForDetail.integrante_id)
                    ? ofuscarNombre(
                        integranteMap.get(activePerfilForDetail.integrante_id)!.nombre_completo,
                        integranteMap.get(activePerfilForDetail.integrante_id)!.es_nna,
                        currentRole
                      )
                    : 'Atleta Asignado'}
                </h3>
                <span className="text-[11px] text-slate-500">
                  {integranteMap.get(activePerfilForDetail.integrante_id)?.edad} años • Disciplina:{' '}
                  <strong>{activePerfilForDetail.disciplina_principal}</strong>
                </span>
              </div>
              {activePerfilForDetail.posee_talento_destacado && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-600" />
                  <span>Talento Élite</span>
                </span>
              )}
            </div>

            {/* Antropometría Detallada */}
            <div className="grid grid-cols-4 gap-2 text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">PESO</span>
                <span className="text-sm font-black text-slate-800">{activePerfilForDetail.peso_kg} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">ESTATURA</span>
                <span className="text-sm font-black text-slate-800">{activePerfilForDetail.estatura_cm} cm</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">IMC OMS</span>
                <span className="text-sm font-black text-blue-700">
                  {activePerfilForDetail.imc || calcularIMC(activePerfilForDetail.peso_kg, activePerfilForDetail.estatura_cm)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">% GRASA</span>
                <span className="text-sm font-black text-slate-800">
                  {activePerfilForDetail.porcentaje_grasa_estimado || 14.5}%
                </span>
              </div>
            </div>

            {/* Signos Vitales y Nutrición */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                  <Heart className="w-3.5 h-3.5 text-rose-600" />
                  <span>Signos Vitales y Reposo</span>
                </span>
                <p className="text-slate-600">
                  FC Reposo:{' '}
                  <strong>{activePerfilForDetail.frecuencia_cardiaca_reposo || 68} lpm</strong>
                </p>
                <p className="text-slate-600">
                  Presión Arterial:{' '}
                  <strong>
                    {activePerfilForDetail.presion_arterial_sistolica || 120}/
                    {activePerfilForDetail.presion_arterial_diastolica || 80} mmHg
                  </strong>
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 flex items-center gap-1 text-[11px]">
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span>Gasto y Dieta Especial</span>
                </span>
                <p className="text-slate-600">
                  Calorías: <strong>{activePerfilForDetail.requerimiento_calorico_diario_kcal} kcal/día</strong>
                </p>
                <p className="text-slate-600 line-clamp-1">
                  Dieta: {activePerfilForDetail.dieta_especial_requerida || 'Balanceada estándar'}
                </p>
              </div>
            </div>

            {/* Observaciones del Entrenador */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Observaciones Técnicas del Evaluador ({activePerfilForDetail.entrenador_evaluador || 'Cuerpo Técnico'})
              </span>
              <p className="text-slate-700 italic">
                "{activePerfilForDetail.observaciones_entrenador || 'Sin observaciones adicionales registradas.'}"
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setActivePerfilForDetail(null)}
                className="px-4 py-2 bg-[#002045] hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL DE REGISTRO / EDICIÓN DE EVALUACIÓN BIOMÉTRICA */}
      {isModalOpen && editingPerfil && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Ficha de Evaluación Biométrica y Deportiva"
          subtitle="Cálculo automático de IMC y perfil del Instituto Nacional de Deportes"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Atleta / Integrante Evaluado:
              </label>
              <select
                value={editingPerfil.integrante_id}
                onChange={(e) => setEditingPerfil({ ...editingPerfil, integrante_id: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
                required
              >
                {integrantes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre_completo} ({i.edad} años - {i.es_nna ? 'NNA' : 'Adulto'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Disciplina Principal:
                </label>
                <input
                  type="text"
                  required
                  value={editingPerfil.disciplina_principal || ''}
                  onChange={(e) => setEditingPerfil({ ...editingPerfil, disciplina_principal: e.target.value })}
                  placeholder="Ej. Atletismo, Fútbol, Boxeo..."
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nivel de Competencia:
                </label>
                <select
                  value={editingPerfil.nivel_competencia || 'Iniciacion'}
                  onChange={(e) => setEditingPerfil({ ...editingPerfil, nivel_competencia: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
                >
                  <option value="Iniciacion">Iniciación</option>
                  <option value="Aficionado">Aficionado</option>
                  <option value="Atleta_Alta_Competencia">Alta Competencia</option>
                  <option value="Seleccion_Nacional">Selección Nacional</option>
                </select>
              </div>
            </div>

            {/* Antropometría con Cálculo Reactivo del IMC */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Peso (kg):
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={editingPerfil.peso_kg || ''}
                  onChange={(e) => setEditingPerfil({ ...editingPerfil, peso_kg: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estatura (cm):
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  value={editingPerfil.estatura_cm || ''}
                  onChange={(e) => setEditingPerfil({ ...editingPerfil, estatura_cm: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  IMC Reactivo:
                </label>
                <div className="p-2 bg-white rounded-lg text-center font-black text-blue-800 border border-blue-200">
                  {calcularIMC(Number(editingPerfil.peso_kg) || 0, Number(editingPerfil.estatura_cm) || 0)}
                </div>
              </div>
            </div>

            {/* Calorías y Signos Vitales */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Gasto Calórico Diario (kcal):
                </label>
                <input
                  type="number"
                  value={editingPerfil.requerimiento_calorico_diario_kcal || 2500}
                  onChange={(e) =>
                    setEditingPerfil({
                      ...editingPerfil,
                      requerimiento_calorico_diario_kcal: parseInt(e.target.value) || 2000,
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Aptitud Deportiva:
                </label>
                <select
                  value={editingPerfil.aptitud_deportiva_supervisada || 'Optima'}
                  onChange={(e) =>
                    setEditingPerfil({
                      ...editingPerfil,
                      aptitud_deportiva_supervisada: e.target.value as any,
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                >
                  <option value="Excelente">Excelente</option>
                  <option value="Optima">Óptima</option>
                  <option value="En_Evaluacion">En Evaluación</option>
                  <option value="Rechazada">Rechazada</option>
                </select>
              </div>
            </div>

            {/* Talento Destacado Élite */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Captación de Talento Élite</span>
                <span className="text-[11px] text-slate-500">
                  Marcar si califica para selección estadal o nacional
                </span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(editingPerfil.posee_talento_destacado)}
                onChange={(e) => setEditingPerfil({ ...editingPerfil, posee_talento_destacado: e.target.checked })}
                className="w-5 h-5 text-[#002045] rounded border-slate-300 focus:ring-[#002045] cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Dieta Especial Requerida:
              </label>
              <input
                type="text"
                value={editingPerfil.dieta_especial_requerida || ''}
                onChange={(e) => setEditingPerfil({ ...editingPerfil, dieta_especial_requerida: e.target.value })}
                placeholder="Ej. Hiperproteica, suplementación con hierro..."
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Observaciones Técnicas del Entrenador:
              </label>
              <textarea
                rows={3}
                value={editingPerfil.observaciones_entrenador || ''}
                onChange={(e) => setEditingPerfil({ ...editingPerfil, observaciones_entrenador: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
                placeholder="Aptitudes tácticas, velocidad, flexibilidad, disciplina..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#002045] hover:bg-blue-900 text-white rounded-xl font-bold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Guardando...' : 'Guardar Evaluación'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SportsView;
