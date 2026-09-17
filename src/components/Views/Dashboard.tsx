/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * Vista: Dashboard General con KPIs consolidados y gráficos analíticos Recharts.
 */

import React, { useState } from 'react';
import {
  Users,
  Building2,
  Bed,
  ShieldCheck,
  Trophy,
  Activity,
  Package,
  Home,
  MapPin,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { StatCard } from '../Shared/StatCard';
import { Campamento, Familia, Integrante, PerfilDeportivo } from '../../types';
import { calcularPorcentaje } from '../../lib/utils';

interface DashboardProps {
  campamentos: Campamento[];
  familias: Familia[];
  integrantes: Integrante[];
  perfiles: PerfilDeportivo[];
  onNavigateToView: (view: any) => void;
}

const COLORS = ['#002045', '#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const Dashboard: React.FC<DashboardProps> = ({
  campamentos,
  familias,
  integrantes,
  perfiles,
  onNavigateToView,
}) => {
  const [chartMode, setChartMode] = useState<'estado' | 'top_campamentos'>('estado');

  // Métricas y totales globales
  const totalCamas = campamentos.reduce((acc, c) => acc + c.capacidad_camas_total, 0);
  const camasOcupadas = campamentos.reduce((acc, c) => acc + c.camas_ocupadas, 0);
  const porcentajeCamas = calcularPorcentaje(camasOcupadas, totalCamas);

  const totalCarpas = campamentos.reduce((acc, c) => acc + c.capacidad_carpas_total, 0);
  const carpasOcupadas = campamentos.reduce((acc, c) => acc + c.carpas_ocupadas, 0);

  const totalNNA = integrantes.filter((i) => i.es_nna).length;
  const porcentajeNNA = calcularPorcentaje(totalNNA, integrantes.length || 1);

  const talentosDestacados = perfiles.filter((p) => p.posee_talento_destacado).length;
  const porcentajeTalentos = calcularPorcentaje(talentosDestacados, perfiles.length || 1);

  const familiasAdjudicadas = familias.filter((f) => f.estatus_vivienda === 'Adjudicada').length;
  const porcentajeAdjudicadas = calcularPorcentaje(familiasAdjudicadas, familias.length || 1);

  // 1. Datos para Ocupación por Entidad Federal
  const estadoMap: Record<string, { total: number; ocupadas: number; count: number; label: string }> = {
    la_guaira: { total: 0, ocupadas: 0, count: 0, label: 'La Guaira' },
    caracas: { total: 0, ocupadas: 0, count: 0, label: 'Caracas' },
    miranda: { total: 0, ocupadas: 0, count: 0, label: 'Miranda' },
    aragua: { total: 0, ocupadas: 0, count: 0, label: 'Aragua' },
  };

  campamentos.forEach((c) => {
    const key = c.estado_id || 'la_guaira';
    if (!estadoMap[key]) {
      estadoMap[key] = { total: 0, ocupadas: 0, count: 0, label: key.toUpperCase() };
    }
    estadoMap[key].total += c.capacidad_camas_total;
    estadoMap[key].ocupadas += c.camas_ocupadas;
    estadoMap[key].count += 1;
  });

  const dataPorEstado = Object.entries(estadoMap).map(([id, val]) => ({
    name: val.label,
    Ocupadas: val.ocupadas,
    Disponibles: Math.max(0, val.total - val.ocupadas),
    sedes: val.count,
  }));

  // 2. Datos para Top Campamentos con mayor ocupación
  const sortedCampamentos = [...campamentos].sort((a, b) => b.camas_ocupadas - a.camas_ocupadas);
  const dataTopCampamentos = sortedCampamentos.slice(0, 8).map((c) => ({
    name: c.nombre.length > 20 ? c.nombre.substring(0, 18) + '…' : c.nombre,
    Ocupadas: c.camas_ocupadas,
    Disponibles: Math.max(0, c.capacidad_camas_total - c.camas_ocupadas),
  }));

  const chartOcupacionData = chartMode === 'estado' ? dataPorEstado : dataTopCampamentos;

  // 3. Datos para Estatus de Vivienda
  const estatusMap: Record<string, number> = {};
  familias.forEach((f) => {
    const key = f.estatus_vivienda.replace(/_/g, ' ');
    estatusMap[key] = (estatusMap[key] || 0) + 1;
  });
  const dataVivienda = Object.entries(estatusMap).map(([name, value]) => ({
    name,
    value,
  }));

  // 4. Datos para Disciplinas Deportivas
  const disciplinasMap: Record<string, number> = {};
  perfiles.forEach((p) => {
    const disc = p.disciplina_principal || 'Acondicionamiento Físico';
    disciplinasMap[disc] = (disciplinasMap[disc] || 0) + 1;
  });
  const dataDisciplinas = Object.entries(disciplinasMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, Atletas]) => ({
      name,
      Atletas,
    }));

  return (
    <div className="space-y-6 pb-12">
      {/* Banner de Bienvenida y Resumen Operativo */}
      <div className="bg-gradient-to-r from-[#002045] via-[#002b5c] to-blue-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>República Bolivariana de Venezuela</span>
            <span>•</span>
            <span>MinDeporte</span>
            <span>•</span>
            <span>106 Sedes Oficiales</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Campamentos Transitorios Deportivos
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Monitoreo en tiempo real de capacidad habitacional, censo familiar, protección integral de NNA y captación de talento deportivo.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateToView('ai_assistant')}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Consultar Asistente IA</span>
          </button>
        </div>
      </div>

      {/* Grid de KPIs Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="kpi-camas"
          title="Ocupación de Camas"
          value={`${camasOcupadas} / ${totalCamas}`}
          subtitle={`${porcentajeCamas}% de ocupación global`}
          icon={Bed}
          badgeText={`${Math.max(0, totalCamas - camasOcupadas)} Libres`}
          badgeVariant={porcentajeCamas > 85 ? 'rose' : 'emerald'}
          onClick={() => onNavigateToView('campamentos')}
        />
        <StatCard
          id="kpi-nna"
          title="Padrón Nominal NNA"
          value={totalNNA}
          subtitle={`${porcentajeNNA}% de los ${integrantes.length} censados`}
          icon={ShieldCheck}
          badgeText="Bajo Protección LOPNNA"
          badgeVariant="blue"
          onClick={() => onNavigateToView('census_nna')}
        />
        <StatCard
          id="kpi-talentos"
          title="Talentos Deportivos"
          value={talentosDestacados}
          subtitle={`${porcentajeTalentos}% de ${perfiles.length} evaluados`}
          icon={Trophy}
          badgeText="Preselección Nacional"
          badgeVariant="amber"
          onClick={() => onNavigateToView('sports')}
        />
        <StatCard
          id="kpi-vivienda"
          title="Familias Adjudicadas"
          value={`${familiasAdjudicadas} / ${familias.length}`}
          subtitle={`${porcentajeAdjudicadas}% en trámite habitacional`}
          icon={Home}
          badgeText="Vivienda Digna"
          badgeVariant="emerald"
          onClick={() => onNavigateToView('familias')}
        />
      </div>

      {/* Fila de Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Aforo y Ocupación */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Capacidad y Ocupación Habitacional
              </h2>
              <p className="text-xs text-slate-500">
                Camas ocupadas vs. disponibles por entidad o sedes principales
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
              <button
                onClick={() => setChartMode('estado')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  chartMode === 'estado'
                    ? 'bg-white text-[#002045] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Entidad (4)
              </button>
              <button
                onClick={() => setChartMode('top_campamentos')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  chartMode === 'top_campamentos'
                    ? 'bg-white text-[#002045] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Top Sedes
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartOcupacionData}
                margin={{ top: 10, right: 10, left: -15, bottom: chartMode === 'top_campamentos' ? 30 : 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={chartMode === 'top_campamentos' ? -20 : 0}
                  textAnchor={chartMode === 'top_campamentos' ? 'end' : 'middle'}
                />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#002045',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Ocupadas" stackId="a" fill="#002045" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Disponibles" stackId="a" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Total Sedes Monitoreadas: <strong className="text-slate-800">{campamentos.length}</strong>
            </span>
            <span>
              Capacidad Global: <strong className="text-slate-800">{totalCamas} camas</strong> y{' '}
              <strong className="text-slate-800">{totalCarpas} carpas</strong>
            </span>
          </div>
        </div>

        {/* Gráfico 2: Censo de Vivienda */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Estatus Censo Habitacional
            </h2>
            <p className="text-xs text-slate-500">Adjudicación y reubicación de familias</p>
          </div>
          <div className="h-64 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataVivienda}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {dataVivienda.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#002045',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Familias Censadas: <strong className="text-slate-800">{familias.length}</strong></span>
            <span>Integrantes: <strong className="text-slate-800">{integrantes.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Fila de Disciplinas y Resumen Operativo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disciplinas Deportivas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Atletas por Disciplina Deportiva
                </h2>
                <p className="text-xs text-slate-500">Distribución de perfiles evaluados por disciplina principal</p>
              </div>
              <button
                onClick={() => onNavigateToView('sports')}
                className="text-xs font-semibold text-[#002045] hover:underline flex items-center gap-1"
              >
                <span>Ver Todos ({perfiles.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataDisciplinas} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#002045',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="Atletas" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Evaluaciones Biométricas: <strong className="text-slate-800">{perfiles.length}</strong></span>
            <span className="text-amber-700 font-medium">Talentos Élite: <strong>{talentosDestacados}</strong></span>
          </div>
        </div>

        {/* Sedes Principales con Censo Activo */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Sedes con Censo Familiar Detallado
                </h2>
                <p className="text-xs text-slate-500">Instalaciones con registro nominal activo</p>
              </div>
              <button
                onClick={() => onNavigateToView('campamentos')}
                className="text-xs font-semibold text-[#002045] hover:underline flex items-center gap-1"
              >
                <span>Ver Catálogo Completo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Campamento 1: Escuela Estadal La Guaira */}
              <div
                onClick={() => onNavigateToView('campcedula')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#002045] transition-colors">
                      Escuela Estadal La Guaira
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                      58 Familias
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    Naiguatá, Sector El Pueblo • Padrino: MPPS e IPASME
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-slate-800">
                    171 Integrantes
                  </span>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    Censo Verificado 100%
                  </p>
                </div>
              </div>

              {/* Campamento 2: Juan Germán Roscio */}
              <div
                onClick={() => onNavigateToView('campcedula')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#002045] transition-colors">
                      E.B.N. Juan Germán Roscio
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                      77 Familias
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    La Guaira, Carlos Soublette • Padrino: MINAGRI / MINVIVIENDA
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-slate-800">
                    229 Integrantes
                  </span>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    Censo Verificado 100%
                  </p>
                </div>
              </div>

              {/* Campamentos Adicionales Destacados */}
              {campamentos.slice(2, 4).map((camp) => {
                const pct = calcularPorcentaje(camp.camas_ocupadas, camp.capacidad_camas_total);
                return (
                  <div
                    key={camp.id}
                    onClick={() => onNavigateToView('campcedula')}
                    className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {camp.nombre}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {camp.ubicacion_detallada}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-slate-800">
                        {camp.camas_ocupadas} / {camp.capacidad_camas_total} camas
                      </span>
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            pct > 85 ? 'bg-rose-500' : 'bg-[#002045]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>4 Estados Activos</span>
            </span>
            <button
              onClick={() => onNavigateToView('campcedula')}
              className="text-[#002045] font-semibold hover:underline text-xs"
            >
              Fichas Técnicas →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
