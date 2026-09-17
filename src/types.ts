/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * Definición centralizada de tipos e interfaces alineadas con el esquema PostgreSQL 16+.
 */

// ==========================================
// TIPOS ENUMERADOS
// ==========================================

export type EstadoViviendaEnum =
  | 'Por_Adjudicar'
  | 'Adjudicada'
  | 'Alquiler'
  | 'Compra_Credito'
  | 'Compra_Propia'
  | 'Pendiente_Censo';

export type NivelDeportivoEnum =
  | 'Iniciacion'
  | 'Aficionado'
  | 'Atleta_Alta_Competencia'
  | 'Seleccion_Nacional';

export type AptitudDeportivaEnum =
  | 'Excelente'
  | 'Optima'
  | 'En_Evaluacion'
  | 'Rechazada';

export type CategoriaInventarioEnum =
  | 'Balones'
  | 'Uniformes'
  | 'Kits_Entrenamiento'
  | 'Cronometraje'
  | 'Medicamentos'
  | 'Alimentos'
  | 'Otros';

export type EstadoInsumoEnum =
  | 'Nuevo'
  | 'Usado_Buen_Estado'
  | 'Deteriorado'
  | 'En_Mantenimiento';

export type EstatusRutaEnum =
  | 'Programada'
  | 'En_Transito'
  | 'Completada'
  | 'Cancelada';

export type FlagRiesgoEnum = 'normal' | 'warning' | 'danger';

// Roles del sistema según RBAC institucional
export type UserRole =
  | 'Administrador'
  | 'Proteccion_NNA'
  | 'Entrenador'
  | 'Logistica'
  | 'Consultor'
  | 'Analista';

// ==========================================
// ENTIDADES DEL DDL
// ==========================================

export interface EstadoRegional {
  id: string;
  nombre: string;
  codigo_iso?: string;
  created_at?: string;
}

export interface Campamento {
  id: string;
  estado_id: string;
  nombre: string;
  ubicacion_detallada: string;
  padrino_institucional?: string;
  director_responsable?: string;
  telefono_contacto?: string;
  capacidad_habitaciones_total: number;
  capacidad_camas_total: number;
  capacidad_carpas_total: number;
  capacidad_modulos_total: number;
  habitaciones_ocupadas: number;
  camas_ocupadas: number;
  carpas_ocupadas: number;
  modulos_ocupados: number;
  es_instalacion_deportiva: boolean;
  tipo_instalacion_deportiva?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Familia {
  id: string;
  campamento_id: string;
  nombre_familia: string;
  ubicacion_interna: string;
  observaciones_generales?: string;
  esta_verificada: boolean;
  verificado_por?: string;
  fecha_verificacion?: string;
  estatus_vivienda: EstadoViviendaEnum;
  detalles_censo_vivienda?: string;
  esta_egresado: boolean;
  fecha_egreso?: string;
  motivo_egreso?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Integrante {
  id: string;
  familia_id: string;
  campamento_id?: string;
  nombre_completo: string;
  cedula_identidad?: string;
  parentesco: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: 'M' | 'F';
  numero_cama?: string;
  grupo_salud?: string;
  patologia?: string;
  medicamentos_requeridos?: string;
  tipo_discapacidad?: string;
  requiere_silla_ruedas?: boolean;
  es_gestante?: boolean;
  es_lactante?: boolean;
  is_sensitive_data?: boolean;
  talla_franela_ropa?: string;
  talla_pantalon_mono?: string;
  talla_calzado?: number;
  es_nna?: boolean; // Columna generada siempre en PostgreSQL: edad < 18
  flag_riesgo?: FlagRiesgoEnum;
  notas_proteccion_nna?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PerfilDeportivo {
  id: string;
  integrante_id: string;
  disciplina_principal: string;
  disciplina_secundaria?: string;
  nivel_competencia: NivelDeportivoEnum;
  aptitud_deportiva_supervisada: AptitudDeportivaEnum;
  peso_kg: number;
  estatura_cm: number;
  imc?: number; // Columna generada en PostgreSQL: peso / (estatura/100)^2
  porcentaje_grasa_estimado?: number;
  requerimiento_calorico_diario_kcal: number;
  dieta_especial_requerida?: string;
  frecuencia_cardiaca_reposo?: number;
  presion_arterial_sistolica?: number;
  presion_arterial_diastolica?: number;
  posee_talento_destacado: boolean;
  entrenador_evaluador?: string;
  observaciones_entrenador?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InventarioDeportivo {
  id: string;
  campamento_id: string;
  nombre_insumo: string;
  categoria: CategoriaInventarioEnum;
  cantidad_en_stock: number;
  cantidad_distribuida: number;
  unidad_medida: string;
  estado_fisico: EstadoInsumoEnum;
  donante_o_proveedor?: string;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RutaTransporte {
  id: string;
  codigo_ruta: string;
  campamento_origen_id: string;
  campamento_destino_id: string;
  unidad_vehiculo: string;
  nombre_conductor: string;
  telefono_conductor?: string;
  capacidad_pasajeros: number;
  hora_salida_programada: string;
  hora_llegada_estimada: string;
  estatus_ruta: EstatusRutaEnum;
  notas_seguridad?: string;
  created_at?: string;
}

export interface PasajeroRuta {
  id: string;
  ruta_id: string;
  integrante_id: string;
  asiento_numero?: number;
  asistencia_confirmada?: boolean;
}

// Interfaz para vista agregada / DTOs
export interface IntegranteCompleto extends Integrante {
  familia_nombre?: string;
  campamento_id?: string;
  campamento_nombre?: string;
  perfil_deportivo?: PerfilDeportivo;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// ==========================================
// FASE 3: ALERTAS Y REPORTES OFICIALES
// ==========================================
export type TipoAlertaEnum =
  | 'saturacion_aforo'
  | 'salud_nna'
  | 'stock_bajo'
  | 'transporte_pendiente';

export type SeveridadAlertaEnum = 'critica' | 'advertencia' | 'informativa';

export interface AlertaOperativa {
  id: string;
  titulo: string;
  tipo: TipoAlertaEnum;
  severidad: SeveridadAlertaEnum;
  campamento_id?: string;
  campamento_nombre?: string;
  descripcion: string;
  fecha: string;
  accion_sugerida?: string;
}

export interface CertificadoCensoData {
  codigo_certificado: string;
  familia: Familia;
  jefe_familia?: Integrante;
  campamento: Campamento;
  integrantes: Integrante[];
  fecha_emision: string;
  funcionario_responsable: string;
}
