/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Vista: Censo Familiar y Estatus de Adjudicación de Vivienda.
 */

import React, { useState } from 'react';
import {
  Users,
  Home,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Building,
  UserPlus,
  Eye,
  Check,
} from 'lucide-react';
import { Familia, Integrante, Campamento, EstadoViviendaEnum, UserRole } from '../../types';
import { Modal } from '../Shared/Modal';
import { formatearFecha } from '../../lib/utils';
import { canEditCensus } from '../../lib/auth';

interface FamiliesViewProps {
  familias: Familia[];
  integrantes: Integrante[];
  campamentos: Campamento[];
  currentRole: UserRole;
  onSaveFamilia: (familia: Familia) => Promise<void>;
  onSaveIntegrante: (integrante: Integrante) => Promise<void>;
}

export const FamiliesView: React.FC<FamiliesViewProps> = ({
  familias,
  integrantes,
  campamentos,
  currentRole,
  onSaveFamilia,
  onSaveIntegrante,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [activeFamiliaForDetails, setActiveFamiliaForDetails] = useState<Familia | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Formulario nueva familia
  const [formData, setFormData] = useState({
    campamento_id: campamentos[0]?.id || '',
    nombre_familia: '',
    ubicacion_interna: '',
    observaciones_generales: '',
    estatus_vivienda: 'Pendiente_Censo' as EstadoViviendaEnum,
    detalles_censo_vivienda: '',
  });

  const canEdit = canEditCensus(currentRole);

  const filteredFamilias = familias.filter((f) => {
    const matchesSearch =
      f.nombre_familia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.ubicacion_interna.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'todos' || f.estatus_vivienda === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: EstadoViviendaEnum) => {
    switch (status) {
      case 'Adjudicada':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Adjudicada
          </span>
        );
      case 'Por_Adjudicar':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#002045] border border-blue-300">
            Por Adjudicar
          </span>
        );
      case 'Alquiler':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            Alquiler Solidario
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Pendiente Censo
          </span>
        );
    }
  };

  const handleCreateFamilia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_familia.trim()) return;

    const newFam: Familia = {
      id: `fam_${Date.now()}`,
      campamento_id: formData.campamento_id,
      nombre_familia: formData.nombre_familia,
      ubicacion_interna: formData.ubicacion_interna,
      observaciones_generales: formData.observaciones_generales,
      esta_verificada: true,
      verificado_por: 'Prof. Carlos Mendoza',
      fecha_verificacion: new Date().toISOString(),
      estatus_vivienda: formData.estatus_vivienda,
      detalles_censo_vivienda: formData.detalles_censo_vivienda,
      esta_egresado: false,
    };

    await onSaveFamilia(newFam);
    setIsAddModalOpen(false);
    setFormData({
      campamento_id: campamentos[0]?.id || '',
      nombre_familia: '',
      ubicacion_interna: '',
      observaciones_generales: '',
      estatus_vivienda: 'Pendiente_Censo',
      detalles_censo_vivienda: '',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#002045] uppercase tracking-wider">
            <Home className="w-4 h-4" />
            <span>Censo Habitacional Institucional</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Familias y Estatus de Vivienda
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de núcleos familiares, ubicación interna y trámites de reubicación habitacional.
          </p>
        </div>

        {canEdit && (
          <button
            id="btn-add-familia"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#002045] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Familia</span>
          </button>
        )}
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por apellido de familia o pabellón..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#002045] focus:outline-hidden"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:ring-2 focus:ring-[#002045] w-full sm:w-auto"
        >
          <option value="todos">Todos los Estatus ({familias.length})</option>
          <option value="Adjudicada">Adjudicada</option>
          <option value="Por_Adjudicar">Por Adjudicar</option>
          <option value="Alquiler">Alquiler</option>
          <option value="Pendiente_Censo">Pendiente Censo</option>
        </select>
      </div>

      {/* Listado de Familias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFamilias.map((fam) => {
          const miembros = integrantes.filter((i) => i.familia_id === fam.id);
          const nnaCount = miembros.filter((i) => i.es_nna).length;
          const camp = campamentos.find((c) => c.id === fam.campamento_id);

          return (
            <div
              key={fam.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {camp?.nombre.replace('Campamento ', '') || 'Sede Transitoria'}
                  </span>
                  {getStatusBadge(fam.estatus_vivienda)}
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {fam.nombre_familia}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                  <Building className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>{fam.ubicacion_interna}</span>
                </p>

                {fam.observaciones_generales && (
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
                    {fam.observaciones_generales}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <strong>{miembros.length}</strong> integrantes
                  </span>
                  <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">
                    {nnaCount} NNA
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setActiveFamiliaForDetails(fam)}
                  className="w-full py-2 bg-slate-100 hover:bg-[#002045] text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Ficha e Integrantes</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detalle de Familia e Integrantes */}
      {activeFamiliaForDetails && (
        <Modal
          isOpen={!!activeFamiliaForDetails}
          onClose={() => setActiveFamiliaForDetails(null)}
          title={`Ficha Familiar: ${activeFamiliaForDetails.nombre_familia}`}
          subtitle={`Ubicación: ${activeFamiliaForDetails.ubicacion_interna}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
              <div>
                <p className="text-slate-500 font-semibold">Estatus de Vivienda:</p>
                <p className="text-sm font-bold text-slate-900">
                  {activeFamiliaForDetails.estatus_vivienda.replace('_', ' ')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 font-semibold">Detalles del Censo:</p>
                <p className="text-slate-700">
                  {activeFamiliaForDetails.detalles_censo_vivienda || 'Sin observaciones'}
                </p>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Miembros Registrados en el Núcleo Familiar
            </h4>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {integrantes
                .filter((i) => i.familia_id === activeFamiliaForDetails.id)
                .map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {m.nombre_completo} {m.es_nna && <span className="text-[10px] text-blue-600 font-normal">(NNA - {m.edad} años)</span>}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        {m.parentesco} • Cédula: {m.cedula_identidad || 'S/C'} • Cama: {m.numero_cama || 'S/A'}
                      </p>
                    </div>
                    <div className="text-right font-mono text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                      <span>Ropa: {m.talla_franela_ropa || 'M'}</span> | <span>Calzado: {m.talla_calzado || '38'}</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveFamiliaForDetails(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Registrar Nueva Familia */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Registrar Nuevo Núcleo Familiar"
          subtitle="Formulario institucional del censo de campamentos deportivos"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateFamilia} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campamento Asignado:
              </label>
              <select
                value={formData.campamento_id}
                onChange={(e) => setFormData({ ...formData, campamento_id: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
                required
              >
                {campamentos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nombre de la Familia (Ej. Familia Pérez Colmenares):
              </label>
              <input
                type="text"
                required
                value={formData.nombre_familia}
                onChange={(e) => setFormData({ ...formData, nombre_familia: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
                placeholder="Nombre representativo..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ubicación Interna (Pabellón, Habitación o Carpa):
              </label>
              <input
                type="text"
                required
                value={formData.ubicacion_interna}
                onChange={(e) => setFormData({ ...formData, ubicacion_interna: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
                placeholder="Ej. Pabellón B - Habitación 104"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estatus Habitacional:
              </label>
              <select
                value={formData.estatus_vivienda}
                onChange={(e) => setFormData({ ...formData, estatus_vivienda: e.target.value as EstadoViviendaEnum })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
              >
                <option value="Pendiente_Censo">Pendiente Censo</option>
                <option value="Por_Adjudicar">Por Adjudicar</option>
                <option value="Adjudicada">Adjudicada</option>
                <option value="Alquiler">Alquiler Solidario</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observaciones Generales de la Familia:
              </label>
              <textarea
                rows={3}
                value={formData.observaciones_generales}
                onChange={(e) => setFormData({ ...formData, observaciones_generales: e.target.value })}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#002045]"
                placeholder="Motivo de tránsito, necesidades especiales..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#002045] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Guardar Familia
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
