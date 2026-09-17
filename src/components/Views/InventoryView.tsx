/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * Vista: Inventario Deportivo, Dotación de Uniformes, Materiales y Almacén Central (InventoryView.tsx).
 */

import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shirt,
  HeartPulse,
  Building,
  Filter,
  Share2,
  Printer,
  Edit,
  Truck,
  Boxes,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Eye,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  InventarioDeportivo,
  Campamento,
  CategoriaInventarioEnum,
  EstadoInsumoEnum,
  UserRole,
} from '../../types';
import { canManageLogistics } from '../../lib/auth';
import { Modal } from '../Shared/Modal';
import { generarReporteWhatsApp } from '../../lib/utils';

interface InventoryViewProps {
  inventario: InventarioDeportivo[];
  campamentos: Campamento[];
  currentRole: UserRole;
  onSaveInventario: (item: InventarioDeportivo) => Promise<void>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventario,
  campamentos,
  currentRole,
  onSaveInventario,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todos');
  const [selectedCampamentoId, setSelectedCampamentoId] = useState<string>('todos');
  const [selectedEstadoFisico, setSelectedEstadoFisico] = useState<string>('todos');
  const [selectedStockLevel, setSelectedStockLevel] = useState<string>('todos');
  
  // Modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [selectedItemForDistribution, setSelectedItemForDistribution] = useState<InventarioDeportivo | null>(null);
  const [distributeQty, setDistributeQty] = useState(1);
  const [activeItemForDetail, setActiveItemForDetail] = useState<InventarioDeportivo | null>(null);

  // Formulario de Insumo
  const [editingItem, setEditingItem] = useState<Partial<InventarioDeportivo> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const canEdit = canManageLogistics(currentRole);

  // Mapa rápido de campamentos
  const campamentoMap = useMemo(() => {
    const map = new Map<string, Campamento>();
    campamentos.forEach((c) => map.set(c.id, c));
    return map;
  }, [campamentos]);

  // Métricas de Almacén y Abastecimiento
  const metrics = useMemo(() => {
    const totalTipos = inventario.length;
    let totalStock = 0;
    let totalDistribuido = 0;
    let uniformesStock = 0;
    let balonesStock = 0;
    let criticosStock = 0;
    let enMantenimiento = 0;

    inventario.forEach((item) => {
      totalStock += item.cantidad_en_stock || 0;
      totalDistribuido += item.cantidad_distribuida || 0;

      if (item.categoria === 'Uniformes') {
        uniformesStock += item.cantidad_en_stock || 0;
      }
      if (item.categoria === 'Balones') {
        balonesStock += item.cantidad_en_stock || 0;
      }
      if (item.cantidad_en_stock <= 5) {
        criticosStock++;
      }
      if (item.estado_fisico === 'En_Mantenimiento' || item.estado_fisico === 'Deteriorado') {
        enMantenimiento++;
      }
    });

    const porcentajeDespliegue =
      totalStock + totalDistribuido > 0
        ? Math.round((totalDistribuido / (totalStock + totalDistribuido)) * 100)
        : 0;

    return {
      totalTipos,
      totalStock,
      totalDistribuido,
      uniformesStock,
      balonesStock,
      criticosStock,
      enMantenimiento,
      porcentajeDespliegue,
    };
  }, [inventario]);

  // Filtrado compuesto
  const filteredInventario = useMemo(() => {
    return inventario.filter((item) => {
      const camp = campamentoMap.get(item.campamento_id);
      const campNombre = camp ? camp.nombre.toLowerCase() : '';
      const nombre = item.nombre_insumo.toLowerCase();
      const donante = (item.donante_o_proveedor || '').toLowerCase();
      const obs = (item.observaciones || '').toLowerCase();

      // Búsqueda textual
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        if (!nombre.includes(term) && !donante.includes(term) && !campNombre.includes(term) && !obs.includes(term)) {
          return false;
        }
      }

      // Filtro por Sede / Campamento
      if (selectedCampamentoId !== 'todos' && item.campamento_id !== selectedCampamentoId) {
        return false;
      }

      // Filtro por Categoría
      if (selectedCategoria !== 'todos' && item.categoria !== selectedCategoria) {
        return false;
      }

      // Filtro por Estado Físico
      if (selectedEstadoFisico !== 'todos' && item.estado_fisico !== selectedEstadoFisico) {
        return false;
      }

      // Filtro por Nivel de Stock
      if (selectedStockLevel === 'bajo' && item.cantidad_en_stock > 5) return false;
      if (selectedStockLevel === 'agotado' && item.cantidad_en_stock > 0) return false;
      if (selectedStockLevel === 'disponible' && item.cantidad_en_stock === 0) return false;

      return true;
    });
  }, [inventario, searchTerm, selectedCampamentoId, selectedCategoria, selectedEstadoFisico, selectedStockLevel, campamentoMap]);

  // Paginación
  const totalPages = Math.ceil(filteredInventario.length / itemsPerPage) || 1;
  const paginatedInventario = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInventario.slice(start, start + itemsPerPage);
  }, [filteredInventario, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Abrir Modal de Registro o Edición
  const handleOpenEdit = (item?: InventarioDeportivo) => {
    if (item) {
      setEditingItem({ ...item });
    } else {
      setEditingItem({
        id: `inv-${Date.now()}`,
        campamento_id: campamentos[0]?.id || '',
        nombre_insumo: '',
        categoria: 'Balones' as CategoriaInventarioEnum,
        cantidad_en_stock: 20,
        cantidad_distribuida: 0,
        unidad_medida: 'Unidades',
        estado_fisico: 'Nuevo' as EstadoInsumoEnum,
        donante_o_proveedor: 'Ministerio del Poder Popular para el Deporte',
        observaciones: 'Dotación oficial de implementación deportiva.',
      });
    }
    setIsEditModalOpen(true);
  };

  // Guardar Insumo
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.nombre_insumo?.trim()) return;

    setIsSaving(true);
    try {
      const completeItem: InventarioDeportivo = {
        id: editingItem.id || `inv-${Date.now()}`,
        campamento_id: editingItem.campamento_id || campamentos[0]?.id || '',
        nombre_insumo: editingItem.nombre_insumo.trim(),
        categoria: (editingItem.categoria as CategoriaInventarioEnum) || 'Otros',
        cantidad_en_stock: Number(editingItem.cantidad_en_stock) || 0,
        cantidad_distribuida: Number(editingItem.cantidad_distribuida) || 0,
        unidad_medida: editingItem.unidad_medida || 'Unidades',
        estado_fisico: (editingItem.estado_fisico as EstadoInsumoEnum) || 'Nuevo',
        donante_o_proveedor: editingItem.donante_o_proveedor || 'MinDeporte',
        observaciones: editingItem.observaciones || '',
        updated_at: new Date().toISOString(),
      };

      await onSaveInventario(completeItem);
      setIsEditModalOpen(false);
      setEditingItem(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Ajuste rápido de Stock (+5, -1)
  const handleQuickStockAdjustment = async (item: InventarioDeportivo, delta: number) => {
    if (!canEdit) return;
    const newStock = Math.max(0, item.cantidad_en_stock + delta);
    const updated: InventarioDeportivo = {
      ...item,
      cantidad_en_stock: newStock,
      updated_at: new Date().toISOString(),
    };
    await onSaveInventario(updated);
  };

  // Abrir Modal de Distribución Rápida
  const handleOpenDistribute = (item: InventarioDeportivo) => {
    setSelectedItemForDistribution(item);
    setDistributeQty(Math.min(5, Math.max(1, item.cantidad_en_stock)));
    setIsDistributeModalOpen(true);
  };

  // Ejecutar Distribución a Canchas
  const handleConfirmDistribution = async () => {
    if (!selectedItemForDistribution || distributeQty <= 0) return;
    if (distributeQty > selectedItemForDistribution.cantidad_en_stock) return;

    setIsSaving(true);
    try {
      const updated: InventarioDeportivo = {
        ...selectedItemForDistribution,
        cantidad_en_stock: selectedItemForDistribution.cantidad_en_stock - distributeQty,
        cantidad_distribuida: selectedItemForDistribution.cantidad_distribuida + distributeQty,
        updated_at: new Date().toISOString(),
      };
      await onSaveInventario(updated);
      setIsDistributeModalOpen(false);
      setSelectedItemForDistribution(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Reporte de Abastecimiento por WhatsApp
  const handleReporteWhatsApp = () => {
    const datos: Record<string, string | number> = {
      'Total Tipos de Implementos': `${metrics.totalTipos} líneas de material`,
      'Existencia en Almacén': `${metrics.totalStock} unidades disponibles`,
      'Material Desplegado en Cancha': `${metrics.totalDistribuido} unidades activas (${metrics.porcentajeDespliegue}% en uso)`,
      'Stock de Balones': `${metrics.balonesStock} unidades`,
      'Stock de Uniformes Tricolor': `${metrics.uniformesStock} piezas listas`,
      'Alertas de Reabastecimiento Crítico': `${metrics.criticosStock} insumos con 5 o menos uds`,
      'En Reparación / Mantenimiento': `${metrics.enMantenimiento} equipos`,
      'Responsable de Logística': `${currentRole} - MinDeporte / IND`,
    };
    const encoded = generarReporteWhatsApp('BALANCE DE DOTACIÓN E INVENTARIO DEPORTIVO', datos);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const getCategoriaBadge = (cat: CategoriaInventarioEnum) => {
    switch (cat) {
      case 'Balones':
        return 'bg-blue-100 text-[#002045] border-blue-200';
      case 'Uniformes':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Kits_Entrenamiento':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Medicamentos':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Cronometraje':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Alimentos':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabecera Oficial */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#002045] uppercase tracking-wider mb-1">
            <Package className="w-4 h-4 text-blue-600" />
            <span>Dirección General de Logística y Equipamiento Deportivo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Inventario, Dotación Deportiva y Almacén
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kardex central de balones, uniformes oficiales, cronómetros y kits de entrenamiento para los campamentos transitorios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canEdit && (
            <button
              id="btn-add-inventory"
              onClick={() => handleOpenEdit()}
              className="px-4 py-2 bg-[#002045] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Insumo / Dotación</span>
            </button>
          )}

          <button
            onClick={handleReporteWhatsApp}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Generar balance de insumos para WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Reportar WhatsApp</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Imprimir kardex e informe de existencias"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimir Kardex</span>
          </button>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS Y LOGÍSTICA DE ALMACÉN */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Insumos */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">Tipos de Insumo</span>
            <Boxes className="w-3.5 h-3.5 text-[#002045]" />
          </div>
          <p className="text-xl font-black text-slate-900">{metrics.totalTipos}</p>
          <span className="text-[10px] text-slate-400">Líneas en catálogo</span>
        </div>

        {/* Stock en Almacén */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">En Almacén</span>
            <Package className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-700">{metrics.totalStock.toLocaleString()}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Unidades disponibles</span>
        </div>

        {/* Desplegado en Cancha */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-600">En Cancha / Uso</span>
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700">{metrics.totalDistribuido.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{metrics.porcentajeDespliegue}% desplegado</span>
        </div>

        {/* Uniformes Tricolor */}
        <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/40 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
            <span className="font-bold">Uniformes</span>
            <Shirt className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-800">{metrics.uniformesStock}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Prendas disponibles</span>
        </div>

        {/* Balones e Implementos */}
        <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-indigo-800 mb-1">
            <span className="font-bold">Balones</span>
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-indigo-800">{metrics.balonesStock}</p>
          <span className="text-[10px] text-indigo-700 font-semibold">Implementos esféricos</span>
        </div>

        {/* Alerta de Stock Crítico */}
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-rose-700 mb-1">
            <span className="font-bold">Stock Crítico</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          </div>
          <p className="text-xl font-black text-rose-700">{metrics.criticosStock}</p>
          <span className="text-[10px] text-rose-600 font-semibold">≤ 5 unidades restantes</span>
        </div>
      </div>

      {/* CONTROLES DE BÚSQUEDA Y FILTRADO */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Barra de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por insumo, donante/proveedor, sede o detalle..."
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

          {/* Filtro por Sede / Campamento */}
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

        {/* Fila de Filtros Secundarios */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* Categoría */}
          <select
            value={selectedCategoria}
            onChange={(e) => {
              setSelectedCategoria(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="todos">Todas las Categorías</option>
            <option value="Balones">Balones</option>
            <option value="Uniformes">Uniformes</option>
            <option value="Kits_Entrenamiento">Kits de Entrenamiento</option>
            <option value="Cronometraje">Cronometraje</option>
            <option value="Medicamentos">Medicamentos y Primeros Auxilios</option>
            <option value="Alimentos">Alimentos y Suplementación</option>
            <option value="Otros">Otros Insumos</option>
          </select>

          {/* Estado Físico */}
          <select
            value={selectedEstadoFisico}
            onChange={(e) => {
              setSelectedEstadoFisico(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="todos">Cualquier Estado Físico</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Usado_Buen_Estado">Usado en Buen Estado</option>
            <option value="Deteriorado">Deteriorado</option>
            <option value="En_Mantenimiento">En Mantenimiento</option>
          </select>

          {/* Nivel de Stock */}
          <select
            value={selectedStockLevel}
            onChange={(e) => {
              setSelectedStockLevel(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-100 hover:bg-slate-200 border-none rounded-lg px-2.5 py-1 text-slate-700 font-medium"
          >
            <option value="todos">Cualquier Nivel de Stock</option>
            <option value="disponible">Con Stock Disponible</option>
            <option value="bajo">Stock Crítico (≤ 5)</option>
            <option value="agotado">Agotado (0 unidades)</option>
          </select>

          {(searchTerm || selectedCampamentoId !== 'todos' || selectedCategoria !== 'todos' || selectedEstadoFisico !== 'todos' || selectedStockLevel !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCampamentoId('todos');
                setSelectedCategoria('todos');
                setSelectedEstadoFisico('todos');
                setSelectedStockLevel('todos');
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
          Mostrando <strong className="text-slate-800">{filteredInventario.length}</strong> de{' '}
          <strong className="text-slate-800">{inventario.length}</strong> artículos registrados
        </span>
        {totalPages > 1 && (
          <span>
            Página <strong className="text-slate-800">{currentPage}</strong> de{' '}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Cero Resultados */}
      {filteredInventario.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No se encontraron artículos con los criterios seleccionados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Verifique la ortografía del término de búsqueda o modifique los filtros de categoría y sede.
          </p>
        </div>
      )}

      {/* GRID DE ARTÍCULOS E INSUMOS */}
      {filteredInventario.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedInventario.map((item) => {
            const camp = campamentoMap.get(item.campamento_id);
            const total = (item.cantidad_en_stock || 0) + (item.cantidad_distribuida || 0);
            const porcentajeStock = total > 0 ? Math.round((item.cantidad_en_stock / total) * 100) : 0;
            const esCritico = item.cantidad_en_stock <= 5;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between ${
                  esCritico ? 'border-rose-300 bg-rose-50/15' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Categoría y Estado Físico */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoriaBadge(item.categoria)}`}>
                      {item.categoria.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      item.estado_fisico === 'Nuevo'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : item.estado_fisico === 'Usado_Buen_Estado'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : item.estado_fisico === 'En_Mantenimiento'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {item.estado_fisico.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 line-clamp-1">
                    {item.nombre_insumo}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{camp?.nombre.replace('Campamento ', '') || 'Sede Transitoria'}</span>
                  </p>

                  {/* Cifras de Stock y Distribución */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">EN ALMACÉN</span>
                      <span className={`text-base font-black ${esCritico ? 'text-rose-700' : 'text-slate-900'}`}>
                        {item.cantidad_en_stock} {item.unidad_medida}
                      </span>
                      {esCritico && (
                        <span className="text-[9px] text-rose-600 font-bold block">¡Stock Crítico!</span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">DISTRIBUIDO</span>
                      <span className="text-base font-bold text-emerald-700">
                        {item.cantidad_distribuida} {item.unidad_medida}
                      </span>
                      <span className="text-[9px] text-slate-400 block">En Cancha / Uso</span>
                    </div>
                  </div>

                  {/* Barra de Progreso de Disponibilidad */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                      <span>Disponibilidad en Almacén</span>
                      <span>{porcentajeStock}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          porcentajeStock > 50
                            ? 'bg-blue-600'
                            : porcentajeStock > 20
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${porcentajeStock}%` }}
                      />
                    </div>
                  </div>

                  {item.observaciones && (
                    <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2 italic">
                      "{item.observaciones}"
                    </p>
                  )}
                </div>

                {/* Acciones y Operaciones Logísticas */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[150px]">
                      Origen: {item.donante_o_proveedor || 'MinDeporte'}
                    </span>
                    <span className="font-semibold text-slate-700">Total: {total} {item.unidad_medida}</span>
                  </div>

                  {/* Botones de Control Rápido */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <>
                          <button
                            onClick={() => handleQuickStockAdjustment(item, 5)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            title="Ingreso rápido de +5 unidades al stock"
                          >
                            +5 Stock
                          </button>
                          <button
                            onClick={() => handleQuickStockAdjustment(item, -1)}
                            disabled={item.cantidad_en_stock <= 0}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-40 cursor-pointer"
                            title="Descargar 1 unidad de stock"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleOpenDistribute(item)}
                            disabled={item.cantidad_en_stock <= 0}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                            title="Despachar a cancha"
                          >
                            <Truck className="w-3 h-3 text-emerald-600" />
                            <span>Despachar</span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveItemForDetail(item)}
                        className="p-1.5 text-slate-500 hover:text-[#002045] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Ver detalle del insumo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-[#002045] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Editar insumo o proveedor"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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

      {/* MODAL DE DETALLE COMPLETO DEL INSUMO */}
      {activeItemForDetail && (
        <Modal
          isOpen={!!activeItemForDetail}
          onClose={() => setActiveItemForDetail(null)}
          title="Ficha Oficial de Dotación e Insumo Deportivo"
          subtitle="Ministerio del Poder Popular para el Deporte • Dirección General de Logística"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Insumo</span>
                <h3 className="text-base font-black text-slate-900">{activeItemForDetail.nombre_insumo}</h3>
                <span className="text-[11px] text-slate-500">
                  Categoría: <strong>{activeItemForDetail.categoria.replace(/_/g, ' ')}</strong> • Estado:{' '}
                  <strong>{activeItemForDetail.estado_fisico.replace(/_/g, ' ')}</strong>
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full font-bold border ${getCategoriaBadge(activeItemForDetail.categoria)}`}>
                {activeItemForDetail.categoria}
              </span>
            </div>

            {/* Sede y Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Campamento Asignado</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {campamentoMap.get(activeItemForDetail.campamento_id)?.nombre || 'Sede Transitoria'}
                </p>
                <span className="text-[10px] text-slate-500">
                  {campamentoMap.get(activeItemForDetail.campamento_id)?.ubicacion_detallada || 'Ubicación regional'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Proveedor o Donante</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {activeItemForDetail.donante_o_proveedor || 'MinDeporte'}
                </p>
                <span className="text-[10px] text-slate-500">Dotación institucional</span>
              </div>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-3 gap-2 text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">ALMACÉN</span>
                <span className="text-sm font-black text-blue-700">{activeItemForDetail.cantidad_en_stock}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">DESPLEGADO</span>
                <span className="text-sm font-black text-emerald-700">{activeItemForDetail.cantidad_distribuida}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">TOTAL FÍSICO</span>
                <span className="text-sm font-black text-slate-900">
                  {activeItemForDetail.cantidad_en_stock + activeItemForDetail.cantidad_distribuida}
                </span>
              </div>
            </div>

            {activeItemForDetail.observaciones && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Observaciones Técnicas
                </span>
                <p className="text-slate-700 italic">"{activeItemForDetail.observaciones}"</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setActiveItemForDetail(null)}
                className="px-4 py-2 bg-[#002045] hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL DE DESPACHO RÁPIDO A CANCHA */}
      {isDistributeModalOpen && selectedItemForDistribution && (
        <Modal
          isOpen={isDistributeModalOpen}
          onClose={() => setIsDistributeModalOpen(false)}
          title="Despachar Insumos a Canchas y Atletas"
          subtitle={`Movimiento de Almacén: ${selectedItemForDistribution.nombre_insumo}`}
          maxWidth="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
              <p className="font-bold">
                Disponible actualmente en Almacén: {selectedItemForDistribution.cantidad_en_stock}{' '}
                {selectedItemForDistribution.unidad_medida}
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Al confirmar, las unidades seleccionadas pasarán a la columna de material en uso activo en canchas.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Cantidad a Despachar:
              </label>
              <input
                type="number"
                min="1"
                max={selectedItemForDistribution.cantidad_en_stock}
                value={distributeQty}
                onChange={(e) => setDistributeQty(Math.min(selectedItemForDistribution.cantidad_en_stock, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-center text-base font-black text-slate-900 focus:ring-2 focus:ring-[#002045]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsDistributeModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDistribution}
                disabled={isSaving || distributeQty <= 0 || distributeQty > selectedItemForDistribution.cantidad_en_stock}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Registrando...' : `Confirmar Despacho (${distributeQty})`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL DE REGISTRO / EDICIÓN DE INSUMO */}
      {isEditModalOpen && editingItem && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={editingItem.id && inventario.some((i) => i.id === editingItem.id) ? 'Editar Insumo Deportivo' : 'Registrar Nuevo Insumo Deportivo'}
          subtitle="Dirección de Logística y Equipamiento Deportivo • MinDeporte"
          maxWidth="md"
        >
          <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Campamento / Sede Asignada:
              </label>
              <select
                value={editingItem.campamento_id}
                onChange={(e) => setEditingItem({ ...editingItem, campamento_id: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
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
                Nombre del Insumo o Material:
              </label>
              <input
                type="text"
                required
                value={editingItem.nombre_insumo || ''}
                onChange={(e) => setEditingItem({ ...editingItem, nombre_insumo: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
                placeholder="Ej. Balones de Voleibol Tricolor..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Categoría:
                </label>
                <select
                  value={editingItem.categoria || 'Balones'}
                  onChange={(e) => setEditingItem({ ...editingItem, categoria: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                >
                  <option value="Balones">Balones</option>
                  <option value="Uniformes">Uniformes</option>
                  <option value="Kits_Entrenamiento">Kits de Entrenamiento</option>
                  <option value="Cronometraje">Cronometraje</option>
                  <option value="Medicamentos">Medicamentos</option>
                  <option value="Alimentos">Alimentos</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estado Físico:
                </label>
                <select
                  value={editingItem.estado_fisico || 'Nuevo'}
                  onChange={(e) => setEditingItem({ ...editingItem, estado_fisico: e.target.value as any })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="Usado_Buen_Estado">Usado en Buen Estado</option>
                  <option value="Deteriorado">Deteriorado</option>
                  <option value="En_Mantenimiento">En Mantenimiento</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  En Almacén:
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingItem.cantidad_en_stock ?? ''}
                  onChange={(e) => setEditingItem({ ...editingItem, cantidad_en_stock: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  En Cancha:
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingItem.cantidad_distribuida ?? 0}
                  onChange={(e) => setEditingItem({ ...editingItem, cantidad_distribuida: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Unidad:
                </label>
                <input
                  type="text"
                  value={editingItem.unidad_medida || 'Unidades'}
                  onChange={(e) => setEditingItem({ ...editingItem, unidad_medida: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg text-center font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Donante o Proveedor:
              </label>
              <input
                type="text"
                value={editingItem.donante_o_proveedor || ''}
                onChange={(e) => setEditingItem({ ...editingItem, donante_o_proveedor: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
                placeholder="Ej. MinDeporte, Fondo Nacional del Deporte, IRDA..."
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Observaciones y Especificaciones:
              </label>
              <textarea
                rows={2}
                value={editingItem.observaciones || ''}
                onChange={(e) => setEditingItem({ ...editingItem, observaciones: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
                placeholder="Marcas, números de serie, tallas especiales o condiciones de custodia..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#002045] hover:bg-blue-900 text-white rounded-xl font-bold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Guardando...' : 'Guardar Insumo'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default InventoryView;
