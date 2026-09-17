/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * Módulo Fase 3: Reportes Ejecutivos Oficiales, Certificaciones Institucionales,
 * Generación de Manifiestos de Transporte, Boletín Situacional y Centro de Alertas Tempranas.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Share2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bus,
  Building2,
  Users,
  Package,
  AlertCircle,
  Copy,
  Check,
  Search,
  Award,
  QrCode,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  Campamento,
  EstadoRegional,
  Familia,
  Integrante,
  PerfilDeportivo,
  InventarioDeportivo,
  RutaTransporte,
  PasajeroRuta,
  UserRole,
  AlertaOperativa,
} from '../../types';
import { InstitutionalLogo } from '../Shared/InstitutionalLogos';
import { FlagIsotype } from '../Shared/FlagIsotype';
import {
  formatearFecha,
  formatearFechaHora,
  formatearCedula,
  exportarCSV,
  generarReporteWhatsApp,
} from '../../lib/utils';
import { db } from '../../lib/db';

interface ReportsCertificatesViewProps {
  campamentos: Campamento[];
  estados: EstadoRegional[];
  familias: Familia[];
  integrantes: Integrante[];
  perfiles: PerfilDeportivo[];
  inventario: InventarioDeportivo[];
  rutas: RutaTransporte[];
  pasajeros: PasajeroRuta[];
  currentRole: UserRole;
  selectedCampamentoId: string;
}

type TabType = 'constancia' | 'manifiesto' | 'boletin' | 'exportar' | 'alertas';

export const ReportsCertificatesView: React.FC<ReportsCertificatesViewProps> = ({
  campamentos,
  estados,
  familias,
  integrantes,
  perfiles,
  inventario,
  rutas,
  pasajeros,
  currentRole,
  selectedCampamentoId,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('constancia');
  const [selectedFamiliaId, setSelectedFamiliaId] = useState<string>(
    familias[0]?.id || ''
  );
  const [selectedRutaId, setSelectedRutaId] = useState<string>(
    rutas[0]?.id || ''
  );
  const [alertas, setAlertas] = useState<AlertaOperativa[]>([]);
  const [loadingAlertas, setLoadingAlertas] = useState<boolean>(true);
  const [filtroSeveridad, setFiltroSeveridad] = useState<string>('todas');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState<boolean>(false);

  // Cargar alertas automáticas en tiempo real
  useEffect(() => {
    async function loadAlerts() {
      setLoadingAlertas(true);
      try {
        const res = await db.getAlertas();
        setAlertas(res);
      } catch (err) {
        console.error('Error cargando alertas:', err);
      } finally {
        setLoadingAlertas(false);
      }
    }
    loadAlerts();
  }, [campamentos, integrantes, inventario, rutas]);

  // Familia seleccionada para la constancia
  const selectedFamilia = useMemo(() => {
    return familias.find((f) => f.id === selectedFamiliaId) || familias[0];
  }, [familias, selectedFamiliaId]);

  // Campamento de la familia seleccionada
  const campamentoDeFamilia = useMemo(() => {
    if (!selectedFamilia) return campamentos[0];
    return (
      campamentos.find((c) => c.id === selectedFamilia.campamento_id) ||
      campamentos[0]
    );
  }, [campamentos, selectedFamilia]);

  // Integrantes de la familia seleccionada
  const integrantesFamilia = useMemo(() => {
    if (!selectedFamilia) return [];
    return integrantes.filter((i) => i.familia_id === selectedFamilia.id);
  }, [integrantes, selectedFamilia]);

  // Jefe de familia
  const jefeFamilia = useMemo(() => {
    return (
      integrantesFamilia.find(
        (i) =>
          i.parentesco.toLowerCase().includes('jefe') ||
          i.parentesco.toLowerCase().includes('titular') ||
          i.parentesco.toLowerCase().includes('madre') ||
          i.parentesco.toLowerCase().includes('padre')
      ) || integrantesFamilia[0]
    );
  }, [integrantesFamilia]);

  // Ruta seleccionada para el manifiesto de transporte
  const selectedRuta = useMemo(() => {
    return rutas.find((r) => r.id === selectedRutaId) || rutas[0];
  }, [rutas, selectedRutaId]);

  const origenRuta = useMemo(() => {
    if (!selectedRuta) return 'Sede Origen';
    return (
      campamentos.find((c) => c.id === selectedRuta.campamento_origen_id)?.nombre ||
      selectedRuta.campamento_origen_id
    );
  }, [campamentos, selectedRuta]);

  const destinoRuta = useMemo(() => {
    if (!selectedRuta) return 'Sede Destino';
    return (
      campamentos.find((c) => c.id === selectedRuta.campamento_destino_id)?.nombre ||
      selectedRuta.campamento_destino_id
    );
  }, [campamentos, selectedRuta]);

  const pasajerosDeRuta = useMemo(() => {
    if (!selectedRuta) return [];
    const rels = pasajeros.filter((p) => p.ruta_id === selectedRuta.id);
    return rels.map((rel) => {
      const integrante = integrantes.find((i) => i.id === rel.integrante_id);
      return {
        ...rel,
        integrante,
      };
    });
  }, [selectedRuta, pasajeros, integrantes]);

  // Filtrado de alertas
  const alertasFiltradas = useMemo(() => {
    if (filtroSeveridad === 'todas') return alertas;
    return alertas.filter((a) => a.severidad === filtroSeveridad);
  }, [alertas, filtroSeveridad]);

  // Manejador de impresión nativa (para constancia o manifiesto)
  const handlePrint = () => {
    window.print();
  };

  // Manejador para compartir reporte por WhatsApp
  const handleCopyWhatsApp = () => {
    const summary = db.getGlobalStateSummary();
    navigator.clipboard.writeText(summary);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  // Manejadores de exportación CSV
  const handleExportCensoFamilias = () => {
    const headers = [
      'ID Familia',
      'Nombre de Familia',
      'Campamento',
      'Ubicación Interna / Módulo',
      'Estatus de Vivienda',
      'Total Integrantes',
      'NNA en Núcleo',
      'Verificada',
      'Fecha Verificación',
    ];
    const rows = familias.map((f) => {
      const camp = campamentos.find((c) => c.id === f.campamento_id)?.nombre || '';
      const ints = integrantes.filter((i) => i.familia_id === f.id);
      const nnas = ints.filter((i) => i.es_nna).length;
      return [
        f.id,
        f.nombre_familia,
        camp,
        f.ubicacion_interna,
        f.estatus_vivienda,
        ints.length,
        nnas,
        f.esta_verificada ? 'SÍ' : 'NO',
        f.fecha_verificacion || 'Pendiente',
      ];
    });
    exportarCSV('padron_censo_familiar_mindeporte', headers, rows);
  };

  const handleExportNNA = () => {
    const headers = [
      'Código Menor',
      'Edad',
      'Sexo',
      'Familia',
      'Campamento',
      'Nivel de Riesgo',
      'Grupo de Salud',
      'Patología',
      'Requiere Medicamento',
      'Talla Franela',
      'Calzado',
    ];
    const nnas = integrantes.filter((i) => i.es_nna);
    const rows = nnas.map((n) => {
      const fam = familias.find((f) => f.id === n.familia_id);
      const camp = campamentos.find((c) => c.id === fam?.campamento_id)?.nombre || '';
      return [
        n.id,
        n.edad,
        n.sexo,
        fam?.nombre_familia || '',
        camp,
        n.flag_riesgo || 'normal',
        n.grupo_salud || 'Grupo I',
        n.patologia || 'Ninguna',
        n.medicamentos_requeridos || 'No',
        n.talla_franela_ropa || 'N/A',
        n.talla_calzado || 'N/A',
      ];
    });
    exportarCSV('censo_nominal_nna_protegido_lopnna', headers, rows);
  };

  const handleExportCampamentos = () => {
    const headers = [
      'ID',
      'Nombre Campamento',
      'Entidad Federal',
      'Ubicación',
      'Director Responsable',
      'Padrino Institucional',
      'Camas Totales',
      'Camas Ocupadas',
      'Habitaciones Totales',
      'Habitaciones Ocupadas',
      'Carpas Ocupadas',
      'Es Instalación Deportiva',
    ];
    const rows = campamentos.map((c) => {
      const est = estados.find((e) => e.id === c.estado_id)?.nombre || c.estado_id;
      return [
        c.id,
        c.nombre,
        est,
        c.ubicacion_detallada,
        c.director_responsable || '',
        c.padrino_institucional || '',
        c.capacidad_camas_total,
        c.camas_ocupadas,
        c.capacidad_habitaciones_total,
        c.habitaciones_ocupadas,
        c.carpas_ocupadas,
        c.es_instalacion_deportiva ? 'SÍ' : 'NO',
      ];
    });
    exportarCSV('directorio_sedes_campamentos', headers, rows);
  };

  const handleExportInventario = () => {
    const headers = [
      'ID Insumo',
      'Nombre Material',
      'Categoría',
      'Campamento Sede',
      'Cantidad en Stock',
      'Cantidad Distribuida',
      'Unidad de Medida',
      'Estado Físico',
      'Proveedor / Donante',
    ];
    const rows = inventario.map((inv) => {
      const camp = campamentos.find((c) => c.id === inv.campamento_id)?.nombre || '';
      return [
        inv.id,
        inv.nombre_insumo,
        inv.categoria,
        camp,
        inv.cantidad_en_stock,
        inv.cantidad_distribuida,
        inv.unidad_medida,
        inv.estado_fisico,
        inv.donante_o_proveedor || '',
      ];
    });
    exportarCSV('inventario_dotacion_deportiva', headers, rows);
  };

  const handleExportManifiesto = () => {
    if (!selectedRuta) return;
    const headers = [
      'Ruta',
      'Vehículo',
      'Conductor',
      'Asiento',
      'Nombre Pasajero / Atleta',
      'Cédula',
      'Asistencia Confirmada',
    ];
    const rows = pasajerosDeRuta.map((p) => [
      selectedRuta.codigo_ruta,
      selectedRuta.unidad_vehiculo,
      selectedRuta.nombre_conductor,
      p.asiento_numero || 'Sin asignar',
      p.integrante?.nombre_completo || 'No especificado',
      p.integrante?.cedula_identidad || 'Sin Cédula',
      p.asistencia_confirmada ? 'CONFIRMADO' : 'PENDIENTE',
    ]);
    exportarCSV(`manifiesto_ruta_${selectedRuta.codigo_ruta}`, headers, rows);
  };

  return (
    <div id="view-reports-certificates" className="space-y-6">
      {/* Encabezado Principal del Módulo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#002045] uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Fase 3 • Módulo Oficial del Ministerio del Deporte</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Reportes, Certificaciones y Alertas Operativas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Emisión de constancias de censo con validez oficial, manifiestos de
            transporte, boletines de situación y auditoría en tiempo real.
          </p>
        </div>

        {/* Botones de acción rápida */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-print-active-doc"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#002045] hover:bg-[#002b5c] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Documento Oficial</span>
          </button>
          <button
            id="btn-copy-bulletin-wp"
            onClick={handleCopyWhatsApp}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            {copiedWhatsApp ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Copiado al Portapapeles!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copiar para WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Barra de Navegación por Pestañas */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 pt-2 rounded-t-xl overflow-x-auto print:hidden">
        <button
          id="tab-constancia"
          onClick={() => setActiveTab('constancia')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'constancia'
              ? 'border-[#002045] text-[#002045] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Constancia Oficial de Censo</span>
        </button>

        <button
          id="tab-manifiesto"
          onClick={() => setActiveTab('manifiesto')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'manifiesto'
              ? 'border-[#002045] text-[#002045] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bus className="w-4 h-4 text-blue-600" />
          <span>Manifiesto de Transporte Yutong</span>
        </button>

        <button
          id="tab-boletin"
          onClick={() => setActiveTab('boletin')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'boletin'
              ? 'border-[#002045] text-[#002045] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>Boletín Situacional Diario</span>
        </button>

        <button
          id="tab-exportar"
          onClick={() => setActiveTab('exportar')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'exportar'
              ? 'border-[#002045] text-[#002045] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Exportación de Padrón (Excel / CSV)</span>
        </button>

        <button
          id="tab-alertas"
          onClick={() => setActiveTab('alertas')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'alertas'
              ? 'border-[#002045] text-[#002045] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Alertas Tempranas</span>
          {alertas.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full">
              {alertas.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: CONSTANCIA OFICIAL DE CENSO Y ADJUDICACIÓN DE VIVIENDA         */}
      {/* ========================================================================= */}
      {activeTab === 'constancia' && (
        <div className="space-y-4">
          {/* Selector de Familia a certificar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#002045]" />
              <label
                htmlFor="select-cert-familia"
                className="text-xs font-bold text-slate-700"
              >
                Seleccionar Núcleo Familiar Censado:
              </label>
            </div>
            <select
              id="select-cert-familia"
              value={selectedFamiliaId}
              onChange={(e) => setSelectedFamiliaId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-[#002045] cursor-pointer max-w-md"
            >
              {familias.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre_familia} — {f.ubicacion_interna} (
                  {f.esta_verificada ? 'Verificada' : 'Pendiente'})
                </option>
              ))}
            </select>
          </div>

          {/* FICHA OFICIAL IMPRIMIBLE (DOCUMENTO CON FORMATO DE CONSTANCIA) */}
          <div
            id="hoja-constancia-oficial"
            className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-slate-300 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* Cinta Tricolor Superior */}
            <div className="h-1.5 w-full flex mb-6 rounded-full overflow-hidden">
              <div className="w-1/3 bg-[#FFCC00]" />
              <div className="w-1/3 bg-[#002045]" />
              <div className="w-1/3 bg-[#CF142B]" />
            </div>

            {/* Membrete Oficial Institucional */}
            <div className="text-center space-y-1 mb-8">
              <p className="text-[11px] uppercase font-bold tracking-widest text-slate-600">
                República Bolivariana de Venezuela
              </p>
              <p className="text-xs uppercase font-extrabold text-[#002045] tracking-wider">
                Ministerio del Poder Popular para el Deporte
              </p>
              <p className="text-[10px] uppercase font-semibold text-slate-500">
                Viceministerio de Alto Rendimiento • Dirección de Campamentos Transitorios Deportivos
              </p>
              <div className="pt-3">
                <span className="inline-block px-4 py-1 text-xs font-black tracking-wider text-white bg-[#002045] rounded-md shadow-xs">
                  CONSTANCIA OFICIAL DE CENSO Y ALOJAMIENTO TRANSITORIO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                N° Documento:{' '}
                <span className="font-mono font-bold text-slate-700">
                  MINDEP-CTD-{selectedFamilia?.id.toUpperCase()}-2026
                </span>
              </p>
            </div>

            {/* Cuerpo de la Constancia */}
            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-4">
              <p className="text-justify">
                Por medio de la presente, la Dirección General de Coordinación y
                Atención Integral a Campamentos Transitorios Deportivos del{' '}
                <strong>Ministerio del Poder Popular para el Deporte</strong> hace
                constar que el núcleo familiar identificado a continuación se
                encuentra formalmente registrado, censado y albergado bajo el
                amparo de las políticas de protección social y bienestar del Estado
                venezolano:
              </p>

              {/* Cuadro de Datos del Núcleo Familiar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Núcleo Familiar:
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {selectedFamilia?.nombre_familia}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Jefe(a) o Representante del Grupo:
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {jefeFamilia?.nombre_completo || 'Titular Asignado'} (C.I.{' '}
                      {formatearCedula(jefeFamilia?.cedula_identidad)})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Campamento Sede:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {campamentoDeFamilia?.nombre}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Ubicación Interna / Módulo:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {selectedFamilia?.ubicacion_interna}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Estatus Vivienda (GMVV / Hábitat):
                    </span>
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {selectedFamilia?.estatus_vivienda.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Condición de Verificación:
                    </span>
                    <span className="font-semibold text-emerald-700">
                      {selectedFamilia?.esta_verificada
                        ? `Verificado por ${selectedFamilia.verificado_por || 'Comité Técnico'}`
                        : 'En proceso de verificación'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista Nominal de Integrantes Albergados */}
              <div className="pt-2">
                <p className="font-bold text-slate-900 mb-2">
                  Integrantes Amparados en el Campamento ({integrantesFamilia.length} personas):
                </p>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="py-1.5 px-3 text-left">Nombre Completo</th>
                        <th className="py-1.5 px-3 text-left">Cédula / Identificador</th>
                        <th className="py-1.5 px-3 text-center">Edad</th>
                        <th className="py-1.5 px-3 text-center">Parentesco</th>
                        <th className="py-1.5 px-3 text-center">N° Cama</th>
                        <th className="py-1.5 px-3 text-center">Condición</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {integrantesFamilia.map((int) => (
                        <tr key={int.id}>
                          <td className="py-1.5 px-3 font-semibold text-slate-900">
                            {int.nombre_completo}
                          </td>
                          <td className="py-1.5 px-3 font-mono text-slate-700">
                            {formatearCedula(int.cedula_identidad)}
                          </td>
                          <td className="py-1.5 px-3 text-center">{int.edad} años</td>
                          <td className="py-1.5 px-3 text-center">{int.parentesco}</td>
                          <td className="py-1.5 px-3 text-center font-bold text-slate-700">
                            {int.numero_cama || 'Módulo'}
                          </td>
                          <td className="py-1.5 px-3 text-center">
                            {int.es_nna ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800">
                                LOPNNA
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600">
                                Adulto
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Nota de Resguardo LOPNNA */}
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200/80 text-[11px] text-blue-900">
                <strong>Cláusula de Confidencialidad y Protección (Art. 65 LOPNNA):</strong>{' '}
                Los datos aquí consignados corresponden a medidas de resguardo y
                protección integral. Queda terminantemente prohibida su reproducción
                o divulgación no autorizada.
              </div>

              {/* Bloque de Firmas y Validación Institucional */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[11px]">
                <div>
                  <div className="border-b border-slate-400 w-48 mx-auto mb-1 h-12 flex items-end justify-center">
                    <span className="font-serif italic text-slate-400 text-xs">
                      [Firma Digitalizada]
                    </span>
                  </div>
                  <p className="font-bold text-slate-900">Prof. Carlos Mendoza</p>
                  <p className="text-[10px] text-slate-500">
                    Director de Operaciones Transitorias
                  </p>
                  <p className="text-[9px] text-slate-400">MinDeporte - Sede Central</p>
                </div>

                <div>
                  <div className="border-b border-slate-400 w-48 mx-auto mb-1 h-12 flex items-end justify-center">
                    <div className="w-10 h-10 border border-slate-300 rounded-md flex items-center justify-center bg-slate-50">
                      <QrCode className="w-8 h-8 text-slate-700" />
                    </div>
                  </div>
                  <p className="font-bold text-slate-900">Sello de Validación Oficial</p>
                  <p className="text-[10px] text-slate-500">
                    Fecha de Emisión: {formatearFecha(new Date().toISOString())}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    VERIF-ID: {Math.random().toString(36).substring(2, 9).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: MANIFIESTO OFICIAL DE TRANSPORTE YUTONG                         */}
      {/* ========================================================================= */}
      {activeTab === 'manifiesto' && (
        <div className="space-y-4">
          {/* Selector de Ruta de Transporte */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              <Bus className="w-4 h-4 text-blue-600" />
              <label
                htmlFor="select-ruta-manifiesto"
                className="text-xs font-bold text-slate-700"
              >
                Seleccionar Ruta de Movilización Activa:
              </label>
            </div>
            <select
              id="select-ruta-manifiesto"
              value={selectedRutaId}
              onChange={(e) => setSelectedRutaId(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-[#002045] cursor-pointer max-w-md"
            >
              {rutas.map((r) => (
                <option key={r.id} value={r.id}>
                  Ruta {r.codigo_ruta}: {r.unidad_vehiculo} ({r.nombre_conductor}) —{' '}
                  {r.estatus_ruta}
                </option>
              ))}
            </select>
          </div>

          {/* DOCUMENTO MANIFIESTO DE TRANSPORTE */}
          <div
            id="hoja-manifiesto-transporte"
            className="bg-white p-8 sm:p-12 rounded-2xl border-2 border-slate-300 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* Cinta Tricolor Superior */}
            <div className="h-1.5 w-full flex mb-6 rounded-full overflow-hidden">
              <div className="w-1/3 bg-[#FFCC00]" />
              <div className="w-1/3 bg-[#002045]" />
              <div className="w-1/3 bg-[#CF142B]" />
            </div>

            {/* Encabezado Manifiesto */}
            <div className="text-center space-y-1 mb-6">
              <p className="text-[11px] uppercase font-bold tracking-widest text-slate-600">
                República Bolivariana de Venezuela
              </p>
              <p className="text-xs uppercase font-extrabold text-[#002045] tracking-wider">
                Ministerio del Poder Popular para el Deporte • Dirección de Transporte
              </p>
              <div className="pt-2">
                <span className="inline-block px-4 py-1 text-xs font-black tracking-wider text-white bg-blue-900 rounded-md shadow-xs">
                  MANIFIESTO OFICIAL DE TRASLADO Y MOVILIZACIÓN TERRESTRE
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Válido ante Órganos de Seguridad Ciudadana (PNB, GNB, INTT) • Hoja de Ruta
                N°{' '}
                <span className="font-mono font-bold text-slate-800">
                  {selectedRuta?.codigo_ruta || 'RUTA-01'}
                </span>
              </p>
            </div>

            {/* Ficha Técnica de la Unidad y Conductor */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Unidad / Autobús:
                  </span>
                  <span className="font-bold text-slate-900">
                    {selectedRuta?.unidad_vehiculo}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Conductor Designado:
                  </span>
                  <span className="font-bold text-slate-900">
                    {selectedRuta?.nombre_conductor}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Teléfono Chofer:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedRuta?.telefono_conductor || 'No registrado'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Estatus de Operación:
                  </span>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                    {selectedRuta?.estatus_ruta}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Campamento Origen:
                  </span>
                  <span className="font-semibold text-slate-800">{origenRuta}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Campamento Destino:
                  </span>
                  <span className="font-semibold text-slate-800">{destinoRuta}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Salida Programada:
                  </span>
                  <span className="font-mono text-slate-800">
                    {formatearFechaHora(selectedRuta?.hora_salida_programada)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    Llegada Estimada:
                  </span>
                  <span className="font-mono text-slate-800">
                    {formatearFechaHora(selectedRuta?.hora_llegada_estimada)}
                  </span>
                </div>
              </div>
            </div>

            {/* Listado Nominal de Pasajeros y Atletas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>
                  Nómina de Pasajeros ({pasajerosDeRuta.length} de{' '}
                  {selectedRuta?.capacidad_pasajeros} Asientos):
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  Confirmados:{' '}
                  {pasajerosDeRuta.filter((p) => p.asistencia_confirmada).length}
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="py-1.5 px-3 text-center w-14">Asiento</th>
                      <th className="py-1.5 px-3 text-left">Nombre y Apellido</th>
                      <th className="py-1.5 px-3 text-left">Cédula Identidad</th>
                      <th className="py-1.5 px-3 text-center">Edad</th>
                      <th className="py-1.5 px-3 text-center">Condición</th>
                      <th className="py-1.5 px-3 text-center">Asistencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pasajerosDeRuta.map((p, idx) => (
                      <tr key={p.id}>
                        <td className="py-1.5 px-3 text-center font-bold font-mono text-slate-700">
                          #{p.asiento_numero || idx + 1}
                        </td>
                        <td className="py-1.5 px-3 font-semibold text-slate-900">
                          {p.integrante?.nombre_completo || 'Atleta / Pasajero'}
                        </td>
                        <td className="py-1.5 px-3 font-mono text-slate-700">
                          {formatearCedula(p.integrante?.cedula_identidad)}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          {p.integrante?.edad ? `${p.integrante.edad} años` : '-'}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          {p.integrante?.es_nna ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800">
                              NNA LOPNNA
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-600">
                              Adulto
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          {p.asistencia_confirmada ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Abordó
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-amber-600">
                              Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Firmas de Autorización de Tránsito */}
            <div className="pt-8 grid grid-cols-3 gap-4 text-center text-[10px]">
              <div>
                <div className="border-b border-slate-400 w-32 mx-auto mb-1 h-10 flex items-end justify-center"></div>
                <p className="font-bold text-slate-800">
                  {selectedRuta?.nombre_conductor}
                </p>
                <p className="text-slate-500">Conductor Yutong</p>
              </div>
              <div>
                <div className="border-b border-slate-400 w-32 mx-auto mb-1 h-10 flex items-end justify-center"></div>
                <p className="font-bold text-slate-800">Coordinador de Sede</p>
                <p className="text-slate-500">Despacho de Origen</p>
              </div>
              <div>
                <div className="border-b border-slate-400 w-32 mx-auto mb-1 h-10 flex items-end justify-center"></div>
                <p className="font-bold text-slate-800">Oficial de Tránsito</p>
                <p className="text-slate-500">Punto de Control</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: BOLETÍN EJECUTIVO DIARIO Y RESUMEN PARA EL DESPACHO             */}
      {/* ========================================================================= */}
      {activeTab === 'boletin' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Boletín Situacional Diario • Despacho Ministerial</span>
              </div>
              <button
                id="btn-copy-boletin-text"
                onClick={handleCopyWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedWhatsApp ? 'Copiado' : 'Copiar Texto'}</span>
              </button>
            </div>

            {/* Vista Previa del Texto Estructurado */}
            <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-5 rounded-xl border border-slate-800 leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {db.getGlobalStateSummary()}
            </div>

            {/* Métricas Visuales Resumidas del Boletín */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">
                  Total Sedes Activas
                </span>
                <span className="text-lg font-black text-slate-900">
                  {campamentos.length} Campamentos
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">
                  Camas Ocupadas
                </span>
                <span className="text-lg font-black text-[#002045]">
                  {campamentos.reduce((acc, c) => acc + c.camas_ocupadas, 0)} /{' '}
                  {campamentos.reduce((acc, c) => acc + c.capacidad_camas_total, 0)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">
                  NNA Bajo Protección
                </span>
                <span className="text-lg font-black text-purple-700">
                  {integrantes.filter((i) => i.es_nna).length} Menores
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 font-medium block">
                  Talentos Deportivos
                </span>
                <span className="text-lg font-black text-amber-600">
                  {perfiles.filter((p) => p.posee_talento_destacado).length} Atletas
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 4: CENTRO DE EXPORTACIÓN OFICIAL (EXCEL / CSV)                     */}
      {/* ========================================================================= */}
      {activeTab === 'exportar' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Descarga de Conjuntos de Datos Institucionales (CSV / Excel)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Archivos estructurados con encabezados oficiales y codificación UTF-8
                BOM para visualización inmediata en Microsoft Excel sin pérdida de tildes ni caracteres.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Card 1: Censo Familiar */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#002045] mb-1">
                    <Users className="w-4 h-4" />
                    <span>Padrón de Censo Familiar & Hábitat</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Incluye todas las familias albergadas, ubicación en campamentos,
                    estatus de adjudicación de vivienda GMVV y estatus de verificación.
                  </p>
                </div>
                <button
                  id="btn-export-familias"
                  onClick={handleExportCensoFamilias}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Censo de Familias (.csv)</span>
                </button>
              </div>

              {/* Card 2: Censo Nominal NNA */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-700 mb-1">
                    <Shield className="w-4 h-4" />
                    <span>Censo Nominal NNA (Protegido LOPNNA)</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Identificadores protegidos de niños, niñas y adolescentes con grupos
                    de salud, patologías, requerimientos médicos y dotación de ropa.
                  </p>
                </div>
                <button
                  id="btn-export-nna"
                  onClick={handleExportNNA}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Nómina NNA (.csv)</span>
                </button>
              </div>

              {/* Card 3: Directorio de Campamentos */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700 mb-1">
                    <Building2 className="w-4 h-4" />
                    <span>Directorio y Capacidad de Campamentos</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Aforo de camas, habitaciones, carpas, directores responsables, padrinos
                    institucionales y clasificación deportiva por sede.
                  </p>
                </div>
                <button
                  id="btn-export-campamentos"
                  onClick={handleExportCampamentos}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Sedes y Aforos (.csv)</span>
                </button>
              </div>

              {/* Card 4: Inventario Deportivo */}
              <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-1">
                    <Package className="w-4 h-4" />
                    <span>Inventario y Dotación de Materiales</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Existencias de balones, uniformes, cronómetros, kits de primeros
                    auxilios, estado físico de los insumos y asignaciones.
                  </p>
                </div>
                <button
                  id="btn-export-inventario"
                  onClick={handleExportInventario}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Inventario (.csv)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 5: CENTRO DE ALERTAS TEMPRANAS OPERATIVAS Y SANITARIAS             */}
      {/* ========================================================================= */}
      {activeTab === 'alertas' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Monitor de Alertas Tempranas del Sistema</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detección automática de sobreocupación de camas, vulnerabilidad en
                  NNA, desabastecimiento de insumos y logística de transporte.
                </p>
              </div>

              {/* Filtro por Severidad */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setFiltroSeveridad('todas')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    filtroSeveridad === 'todas'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todas ({alertas.length})
                </button>
                <button
                  onClick={() => setFiltroSeveridad('critica')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    filtroSeveridad === 'critica'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  Críticas (
                  {alertas.filter((a) => a.severidad === 'critica').length})
                </button>
                <button
                  onClick={() => setFiltroSeveridad('advertencia')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    filtroSeveridad === 'advertencia'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  Advertencias (
                  {alertas.filter((a) => a.severidad === 'advertencia').length})
                </button>
              </div>
            </div>

            {/* Listado de Alertas */}
            {loadingAlertas ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Analizando variables del sistema en tiempo real...
              </div>
            ) : alertasFiltradas.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800">
                  No hay alertas activas en esta categoría
                </p>
                <p className="text-slate-400 mt-0.5">
                  Las métricas de operación y aforos se encuentran en rangos normales.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alertasFiltradas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all ${
                      alerta.severidad === 'critica'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : alerta.severidad === 'advertencia'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-blue-50/70 border-blue-200 text-blue-950'
                    }`}
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            alerta.severidad === 'critica'
                              ? 'bg-rose-600 text-white'
                              : alerta.severidad === 'advertencia'
                              ? 'bg-amber-500 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {alerta.severidad}
                        </span>
                        {alerta.campamento_nombre && (
                          <span className="text-[11px] font-bold text-slate-700">
                            • {alerta.campamento_nombre}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">
                          • {formatearFecha(alerta.fecha)}
                        </span>
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        {alerta.titulo}
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {alerta.descripcion}
                      </p>

                      {alerta.accion_sugerida && (
                        <div className="pt-1.5 flex items-start gap-1.5 text-[11px] font-medium text-slate-800">
                          <span className="font-bold text-[#002045]">
                            Acción recomendada:
                          </span>
                          <span>{alerta.accion_sugerida}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400">
                        {alerta.id}
                      </span>
                      <button
                        onClick={() => {
                          alert(`Alerta ${alerta.id} registrada para seguimiento ministerial.`);
                        }}
                        className="px-3 py-1.5 bg-white text-slate-800 hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        Atender
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
