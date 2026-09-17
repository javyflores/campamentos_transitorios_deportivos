/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Módulo de persistencia y conexión a PostgreSQL 16+ con sincronización bi-direccional.
 * // [MIGRACIÓN] Reemplazo definitivo de localStorage por endpoints REST conectados a PostgreSQL.
 */

import {
  Campamento,
  EstadoRegional,
  Familia,
  Integrante,
  PerfilDeportivo,
  InventarioDeportivo,
  RutaTransporte,
  PasajeroRuta,
  ChatMessage,
  AlertaOperativa,
} from '../types';
import { FULL_CAMPAMENTOS_LIST } from '../data/campsData';
import {
  LA_GUAIRA_FAMILIAS,
  LA_GUAIRA_INTEGRANTES,
  LA_GUAIRA_PERFILES,
  LA_GUAIRA_INVENTARIO,
} from '../data/laGuairaData';
import {
  ROSCIO_FAMILIAS,
  ROSCIO_INTEGRANTES,
  ROSCIO_PERFILES,
  ROSCIO_INVENTARIO,
} from '../data/roscioData';

// ==============================================================================
// DATOS SEMILLA INSTITUCIONALES EN MEMORIA (FALLBACK DE SEGURIDAD / SEED DATA)
// ==============================================================================

const INITIAL_ESTADOS: EstadoRegional[] = [
  { id: 'la_guaira', nombre: 'La Guaira', codigo_iso: 'VE-X' },
  { id: 'distrito_capital', nombre: 'Distrito Capital (Caracas)', codigo_iso: 'VE-A' },
  { id: 'miranda', nombre: 'Miranda', codigo_iso: 'VE-M' },
  { id: 'aragua', nombre: 'Aragua', codigo_iso: 'VE-D' },
];

const INITIAL_CAMPAMENTOS: Campamento[] = [
  {
    id: 'camp_la_guaira_uee',
    estado_id: 'la_guaira',
    nombre: 'Campamento U.E.E. La Guaira',
    ubicacion_detallada: 'Sector Pariata, Parroquia Maiquetía, La Guaira',
    padrino_institucional: 'Viceministerio de Alto Rendimiento',
    director_responsable: 'Prof. Carlos Mendoza',
    telefono_contacto: '+58 412-5550101',
    capacidad_habitaciones_total: 30,
    capacidad_camas_total: 120,
    capacidad_carpas_total: 20,
    capacidad_modulos_total: 10,
    habitaciones_ocupadas: 24,
    camas_ocupadas: 98,
    carpas_ocupadas: 15,
    modulos_ocupados: 8,
    es_instalacion_deportiva: true,
    tipo_instalacion_deportiva: 'Gimnasio Polideportivo',
  },
  {
    id: 'camp_naiguata',
    estado_id: 'la_guaira',
    nombre: 'Complejo Deportivo Naiguatá',
    ubicacion_detallada: 'Av. Principal de Naiguatá, Litoral Central',
    padrino_institucional: 'Instituto Nacional de Deportes (IND)',
    director_responsable: 'Lic. Mariángel Rivas',
    telefono_contacto: '+58 424-5550102',
    capacidad_habitaciones_total: 20,
    capacidad_camas_total: 80,
    capacidad_carpas_total: 25,
    capacidad_modulos_total: 5,
    habitaciones_ocupadas: 18,
    camas_ocupadas: 65,
    carpas_ocupadas: 20,
    modulos_ocupados: 4,
    es_instalacion_deportiva: true,
    tipo_instalacion_deportiva: 'Centro de Deportes Acuáticos y Playa',
  },
  {
    id: 'camp_albergues_costa',
    estado_id: 'la_guaira',
    nombre: 'Albergues de la Costa',
    ubicacion_detallada: 'Caruao - Chuspa, Parroquia Caruao',
    padrino_institucional: 'Gobernación del Estado La Guaira',
    director_responsable: 'Técnico José Alfonzo',
    telefono_contacto: '+58 416-5550103',
    capacidad_habitaciones_total: 15,
    capacidad_camas_total: 60,
    capacidad_carpas_total: 30,
    capacidad_modulos_total: 8,
    habitaciones_ocupadas: 10,
    camas_ocupadas: 42,
    carpas_ocupadas: 22,
    modulos_ocupados: 6,
    es_instalacion_deportiva: false,
    tipo_instalacion_deportiva: 'Albergue Comunitario',
  },
  {
    id: 'camp_morochito',
    estado_id: 'distrito_capital',
    nombre: 'Residencia de Atletas "Morochito Hernández"',
    ubicacion_detallada: 'Av. Teherán, Complejo Deportivo La Vega / Montalbán, Caracas',
    padrino_institucional: 'Ministerio del Poder Popular para el Deporte',
    director_responsable: 'Entrenador David Sulbarán',
    telefono_contacto: '+58 414-5550201',
    capacidad_habitaciones_total: 50,
    capacidad_camas_total: 200,
    capacidad_carpas_total: 0,
    capacidad_modulos_total: 15,
    habitaciones_ocupadas: 42,
    camas_ocupadas: 175,
    carpas_ocupadas: 0,
    modulos_ocupados: 12,
    es_instalacion_deportiva: true,
    tipo_instalacion_deportiva: 'Villa Olímpica de Alto Rendimiento',
  },
  {
    id: 'camp_paraiso',
    estado_id: 'distrito_capital',
    nombre: 'Villa Deportiva El Paraíso / Montalbán',
    ubicacion_detallada: 'Calle Las Fuentes con Av. Páez, El Paraíso, Caracas',
    padrino_institucional: 'Fondo Nacional del Deporte',
    director_responsable: 'Dra. Elena Quintero',
    telefono_contacto: '+58 412-5550202',
    capacidad_habitaciones_total: 40,
    capacidad_camas_total: 160,
    capacidad_carpas_total: 10,
    capacidad_modulos_total: 12,
    habitaciones_ocupadas: 35,
    camas_ocupadas: 138,
    carpas_ocupadas: 8,
    modulos_ocupados: 10,
    es_instalacion_deportiva: true,
    tipo_instalacion_deportiva: 'Pabellón Gimnástico y Canchas Múltiples',
  },
  {
    id: 'camp_pnu',
    estado_id: 'distrito_capital',
    nombre: 'Parque Naciones Unidas (Módulo Transitorio)',
    ubicacion_detallada: 'Sector El Paraíso, Autopista Francisco Fajardo, Caracas',
    padrino_institucional: 'Federación Polideportiva Nacional',
    director_responsable: 'Prof. Roberto Briceño',
    telefono_contacto: '+58 424-5550203',
    capacidad_habitaciones_total: 35,
    capacidad_camas_total: 140,
    capacidad_carpas_total: 15,
    capacidad_modulos_total: 10,
    habitaciones_ocupadas: 28,
    camas_ocupadas: 110,
    carpas_ocupadas: 10,
    modulos_ocupados: 7,
    es_instalacion_deportiva: true,
    tipo_instalacion_deportiva: 'Estadio de Atletismo y Natación',
  },
  {
    id: 'camp_los_teques',
    estado_id: 'miranda',
    nombre: 'Centro Polideportivo Los Teques',
    ubicacion_detallada: 'Sector El Paso, Los Teques, Estado Miranda',
    padrino_institucional: 'Instituto de Deportes de Miranda',
    director_responsable: 'Lic. Carmen Bastidas',
    telefono_contacto: '+58 416-5550301',
    capacidad_habitaciones_total: 25,
    capacidad_camas_total: 100,
    capacidad_carpas_total: 20,
    capacidad_modulos_total: 8,
    habitaciones_ocupadas: 20,
    camas_ocupadas: 78,
    carpas_ocupadas: 14,
    modulos_ocupados: 6,
    es_instalacion_deportiva: true,
    tipo_instalacion_deportiva: 'Complejo de Artes Marciales',
  },
  {
    id: 'camp_villa_olimpica_maracay',
    estado_id: 'aragua',
    nombre: 'Villa Olímpica de Maracay',
    ubicacion_detallada: 'Av. Las Delicias, Maracay, Estado Aragua',
    padrino_institucional: 'Instituto Regional del Deporte de Aragua (IRDA)',
    director_responsable: 'Entrenador Franklin Gómez',
    telefono_contacto: '+58 414-5550401',
    capacidad_habitaciones_total: 45,
    capacidad_camas_total: 180,
    capacidad_carpas_total: 10,
    capacidad_modulos_total: 12,
    habitaciones_ocupadas: 38,
    camas_ocupadas: 145,
    carpas_ocupadas: 6,
    modulos_ocupados: 9,
    es_instalacion_deportiva: true,
    tipo_instalacion_deportiva: 'Pista de Atletismo y Velódromo',
  },
];

const INITIAL_FAMILIAS: Familia[] = [
  {
    id: 'fam_001',
    campamento_id: 'camp_morochito',
    nombre_familia: 'Familia Gómez Colmenares',
    ubicacion_interna: 'Pabellón A - Habitación 102',
    observaciones_generales: 'Familia damnificada por lluvias en Macuto. 3 integrantes. Madre jefa de hogar con dos menores deportistas.',
    esta_verificada: true,
    verificado_por: 'Lic. Mariángel Rivas (Trabajadora Social)',
    fecha_verificacion: '2026-02-10T14:30:00Z',
    estatus_vivienda: 'Adjudicada',
    detalles_censo_vivienda: 'Adjudicado apartamento en Urbanismo Ciudad Caribia. En proceso de mudanza.',
    esta_egresado: false,
  },
  {
    id: 'fam_002',
    campamento_id: 'camp_morochito',
    nombre_familia: 'Familia Mendoza Pacheco',
    ubicacion_interna: 'Pabellón B - Habitación 204',
    observaciones_generales: 'Núcleo de 4 personas. Hijo mayor con talento destacado en Atletismo (velocidad 100m).',
    esta_verificada: true,
    verificado_por: 'Prof. Carlos Mendoza',
    fecha_verificacion: '2026-02-12T10:00:00Z',
    estatus_vivienda: 'Por_Adjudicar',
    detalles_censo_vivienda: 'Evaluación técnica completada para inclusión en el programa 0800-MIHOGAR.',
    esta_egresado: false,
  },
  {
    id: 'fam_003',
    campamento_id: 'camp_la_guaira_uee',
    nombre_familia: 'Familia Salazar Hernández',
    ubicacion_interna: 'Módulo 2 - Carpa 05',
    observaciones_generales: 'Familia en tránsito preventivo costero. Madre lactante y joven prospecto de béisbol menor.',
    esta_verificada: true,
    verificado_por: 'Dra. Elena Quintero',
    fecha_verificacion: '2026-02-18T16:00:00Z',
    estatus_vivienda: 'Pendiente_Censo',
    detalles_censo_vivienda: 'Inspección de vivienda original en zona de riesgo torrencial pendiente de informe.',
    esta_egresado: false,
  },
  {
    id: 'fam_004',
    campamento_id: 'camp_naiguata',
    nombre_familia: 'Familia Castillo Bermúdez',
    ubicacion_interna: 'Módulo Norte - Camas 12-15',
    observaciones_generales: 'Atletas juveniles de surf y natación en aguas abiertas. 4 miembros.',
    esta_verificada: true,
    verificado_por: 'Técnico José Alfonzo',
    fecha_verificacion: '2026-02-20T09:15:00Z',
    estatus_vivienda: 'Alquiler',
    detalles_censo_vivienda: 'Postulados a subsidio de alquiler temporal solidario en el Municipio Vargas.',
    esta_egresado: false,
  },
  {
    id: 'fam_005',
    campamento_id: 'camp_paraiso',
    nombre_familia: 'Familia Rodríguez Villegas',
    ubicacion_interna: 'Pabellón Central - Habitación 301',
    observaciones_generales: '3 integrantes. Niña de 11 años preseleccionada nacional en Gimnasia Rítmica.',
    esta_verificada: true,
    verificado_por: 'Lic. Mariángel Rivas',
    fecha_verificacion: '2026-02-25T11:30:00Z',
    estatus_vivienda: 'Adjudicada',
    detalles_censo_vivienda: 'Vivienda adjudicada en Fuerte Tiuna, asignación coordinada con MinDeporte.',
    esta_egresado: false,
  },
];

const INITIAL_INTEGRANTES: Integrante[] = [
  {
    id: 'int_001',
    familia_id: 'fam_001',
    nombre_completo: 'Yajaira Colmenares de Gómez',
    cedula_identidad: 'V-15894231',
    parentesco: 'Madre / Jefa de Hogar',
    fecha_nacimiento: '1982-05-14',
    edad: 43,
    sexo: 'F',
    numero_cama: 'CAMA-A102-1',
    grupo_salud: 'Grupo I',
    patologia: 'Hipertensión Leve',
    medicamentos_requeridos: 'Losartán Potásico 50mg',
    tipo_discapacidad: 'Ninguna',
    requiere_silla_ruedas: false,
    es_gestante: false,
    es_lactante: false,
    is_sensitive_data: false,
    talla_franela_ropa: 'M',
    talla_pantalon_mono: 'L',
    talla_calzado: 38.0,
    es_nna: false,
    flag_riesgo: 'normal',
  },
  {
    id: 'int_002',
    familia_id: 'fam_001',
    nombre_completo: 'Brayan David Gómez Colmenares',
    cedula_identidad: 'V-32456789',
    parentesco: 'Hijo',
    fecha_nacimiento: '2009-08-20',
    edad: 16,
    sexo: 'M',
    numero_cama: 'CAMA-A102-2',
    grupo_salud: 'Grupo I',
    patologia: 'Ninguna',
    medicamentos_requeridos: 'Multivitamínico Deportivo',
    tipo_discapacidad: 'Ninguna',
    requiere_silla_ruedas: false,
    es_gestante: false,
    es_lactante: false,
    is_sensitive_data: true,
    talla_franela_ropa: 'M',
    talla_pantalon_mono: 'M',
    talla_calzado: 41.5,
    es_nna: true,
    flag_riesgo: 'normal',
    notas_proteccion_nna: 'Estudiante becado. Cumple régimen de entrenamiento matutino en pista de La Vega.',
  },
  {
    id: 'int_003',
    familia_id: 'fam_001',
    nombre_completo: 'Mariángela Gómez Colmenares',
    cedula_identidad: 'S/C-MENOR-001',
    parentesco: 'Hija',
    fecha_nacimiento: '2014-11-03',
    edad: 11,
    sexo: 'F',
    numero_cama: 'CAMA-A102-3',
    grupo_salud: 'Grupo II',
    patologia: 'Asma bronquial intermitente',
    medicamentos_requeridos: 'Salbutamol inhalador SOS',
    tipo_discapacidad: 'Ninguna',
    requiere_silla_ruedas: false,
    es_gestante: false,
    es_lactante: false,
    is_sensitive_data: true,
    talla_franela_ropa: '12',
    talla_pantalon_mono: '12',
    talla_calzado: 34.0,
    es_nna: true,
    flag_riesgo: 'warning',
    notas_proteccion_nna: 'Protección NNA activa. Requiere chequeo neumonológico antes de competencias acuáticas.',
  },
  {
    id: 'int_004',
    familia_id: 'fam_002',
    nombre_completo: 'Marcos Mendoza Fuentes',
    cedula_identidad: 'V-14220195',
    parentesco: 'Padre / Jefe de Hogar',
    fecha_nacimiento: '1979-03-22',
    edad: 46,
    sexo: 'M',
    numero_cama: 'CAMA-B204-1',
    grupo_salud: 'Grupo I',
    patologia: 'Ninguna',
    medicamentos_requeridos: 'Ninguno',
    tipo_discapacidad: 'Ninguna',
    requiere_silla_ruedas: false,
    es_gestante: false,
    es_lactante: false,
    is_sensitive_data: false,
    talla_franela_ropa: 'L',
    talla_pantalon_mono: 'L',
    talla_calzado: 42.0,
    es_nna: false,
    flag_riesgo: 'normal',
  },
  {
    id: 'int_005',
    familia_id: 'fam_002',
    nombre_completo: 'Rosa Pacheco de Mendoza',
    cedula_identidad: 'V-16781290',
    parentesco: 'Madre',
    fecha_nacimiento: '1984-07-11',
    edad: 41,
    sexo: 'F',
    numero_cama: 'CAMA-B204-2',
    grupo_salud: 'Grupo I',
    patologia: 'Ninguna',
    medicamentos_requeridos: 'Ninguno',
    tipo_discapacidad: 'Ninguna',
    requiere_silla_ruedas: false,
    es_gestante: false,
    es_lactante: false,
    is_sensitive_data: false,
    talla_franela_ropa: 'M',
    talla_pantalon_mono: 'M',
    talla_calzado: 37.5,
    es_nna: false,
    flag_riesgo: 'normal',
  },
  {
    id: 'int_006',
    familia_id: 'fam_002',
    nombre_completo: 'Keiver José Mendoza Pacheco',
    cedula_identidad: 'V-31998412',
    parentesco: 'Hijo',
    fecha_nacimiento: '2008-01-15',
    edad: 18,
    sexo: 'M',
    numero_cama: 'CAMA-B204-3',
    grupo_salud: 'Grupo I',
    patologia: 'Ninguna',
    medicamentos_requeridos: 'Complejo B y Suplemento Proteico',
    tipo_discapacidad: 'Ninguna',
    requiere_silla_ruedas: false,
    es_gestante: false,
    es_lactante: false,
    is_sensitive_data: false,
    talla_franela_ropa: 'L',
    talla_pantalon_mono: 'L',
    talla_calzado: 43.0,
    es_nna: false,
    flag_riesgo: 'normal',
    notas_proteccion_nna: 'Atleta en preselección nacional juvenil de 100m y 200m planos.',
  },
  {
    id: 'int_007',
    familia_id: 'fam_002',
    nombre_completo: 'Deyanira Mendoza Pacheco',
    cedula_identidad: 'S/C-MENOR-002',
    parentesco: 'Hija',
    fecha_nacimiento: '2016-04-30',
    edad: 9,
    sexo: 'F',
    numero_cama: 'CAMA-B204-4',
    grupo_salud: 'Grupo I',
    patologia: 'Ninguna',
    medicamentos_requeridos: 'Ninguno',
    tipo_discapacidad: 'Ninguna',
    requiere_silla_ruedas: false,
    es_gestante: false,
    es_lactante: false,
    is_sensitive_data: true,
    talla_franela_ropa: '10',
    talla_pantalon_mono: '10',
    talla_calzado: 32.0,
    es_nna: true,
    flag_riesgo: 'normal',
    notas_proteccion_nna: 'NNA escolarizada en unidad educativa del complejo deportivo.',
  },
  {
    id: 'int_008',
    familia_id: 'fam_003',
    nombre_completo: 'Carmen Salazar Hernández',
    cedula_identidad: 'V-19455120',
    parentesco: 'Madre Soltera',
    fecha_nacimiento: '1989-09-05',
    edad: 36,
    sexo: 'F',
    numero_cama: 'CARPA-05-1',
    grupo_salud: 'Grupo III',
    patologia: 'Postparto mediato',
    medicamentos_requeridos: 'Hierro + Ácido Fólico',
    tipo_discapacidad: 'Ninguna',
    requiere_silla_ruedas: false,
    es_gestante: false,
    es_lactante: true,
    is_sensitive_data: true,
    talla_franela_ropa: 'S',
    talla_pantalon_mono: 'M',
    talla_calzado: 36.5,
    es_nna: false,
    flag_riesgo: 'warning',
    notas_proteccion_nna: 'Madre lactante en seguimiento nutricional prioritario por el INN.',
  },
  {
    id: 'int_009',
    familia_id: 'fam_003',
    nombre_completo: 'Samuel Salazar Hernández',
    cedula_identidad: 'S/C-BEBE-001',
    parentesco: 'Hijo',
    fecha_nacimiento: '2025-10-12',
    edad: 0,
    sexo: 'M',
    numero_cama: 'CARPA-05-2',
    grupo_salud: 'Grupo III',
    patologia: 'Control de Niño Sano',
    medicamentos_requeridos: 'Lactancia Materna Exclusiva',
    tipo_discapacidad: 'Ninguna',
    requiere_silla_ruedas: false,
    es_gestante: false,
    es_lactante: false,
    is_sensitive_data: true,
    talla_franela_ropa: '0-3M',
    talla_pantalon_mono: '0-3M',
    talla_calzado: 16.0,
    es_nna: true,
    flag_riesgo: 'danger',
    notas_proteccion_nna: 'Lactante menor bajo protección y resguardo pediátrico permanente.',
  },
  {
    id: 'int_010',
    familia_id: 'fam_003',
    nombre_completo: 'Jesús Gabriel Salazar',
    cedula_identidad: 'V-33100542',
    parentesco: 'Hijo',
    fecha_nacimiento: '2011-06-18',
    edad: 14,
    sexo: 'M',
    numero_cama: 'CARPA-05-3',
    grupo_salud: 'Grupo I',
    patologia: 'Ninguna',
    medicamentos_requeridos: 'Ninguno',
    tipo_discapacidad: 'Ninguna',
    requiere_silla_ruedas: false,
    es_gestante: false,
    es_lactante: false,
    is_sensitive_data: true,
    talla_franela_ropa: '14',
    talla_pantalon_mono: '14',
    talla_calzado: 38.5,
    es_nna: true,
    flag_riesgo: 'normal',
    notas_proteccion_nna: 'Prospecto de Béisbol Menor en academia comunitaria de Caruao.',
  },
  {
    id: 'int_011',
    familia_id: 'fam_005',
    nombre_completo: 'Isabel Rodríguez Villegas',
    cedula_identidad: 'S/C-MENOR-003',
    parentesco: 'Hija',
    fecha_nacimiento: '2015-02-14',
    edad: 11,
    sexo: 'F',
    numero_cama: 'CAMA-C301-2',
    grupo_salud: 'Grupo I',
    patologia: 'Ninguna',
    medicamentos_requeridos: 'Complejo Vitamínico D3',
    tipo_discapacidad: 'Ninguna',
    requiere_silla_ruedas: false,
    es_gestante: false,
    es_lactante: false,
    is_sensitive_data: true,
    talla_franela_ropa: '12',
    talla_pantalon_mono: '12',
    talla_calzado: 33.5,
    es_nna: true,
    flag_riesgo: 'normal',
    notas_proteccion_nna: 'Talento Excepcional en Gimnasia Rítmica. Evaluación técnica con puntuación destacada.',
  },
];

const INITIAL_PERFILES: PerfilDeportivo[] = [
  {
    id: 'perf-001',
    integrante_id: 'int_002',
    disciplina_principal: 'Fútbol Campo',
    disciplina_secundaria: 'Futsal',
    nivel_competencia: 'Atleta_Alta_Competencia',
    aptitud_deportiva_supervisada: 'Excelente',
    peso_kg: 62.5,
    estatura_cm: 172.0,
    imc: 21.13,
    porcentaje_grasa_estimado: 11.2,
    requerimiento_calorico_diario_kcal: 3100,
    dieta_especial_requerida: 'Alta en carbohidratos complejos y proteína magra',
    frecuencia_cardiaca_reposo: 52,
    presion_arterial_sistolica: 115,
    presion_arterial_diastolica: 75,
    posee_talento_destacado: true,
    entrenador_evaluador: 'Prof. Carlos Mendoza',
    observaciones_entrenador: 'Excelente velocidad en banda derecha, capacidad aeróbica superior al percentil 90.',
  },
  {
    id: 'perf-002',
    integrante_id: 'int_006',
    disciplina_principal: 'Atletismo (Velocidad)',
    disciplina_secundaria: 'Salto Largo',
    nivel_competencia: 'Seleccion_Nacional',
    aptitud_deportiva_supervisada: 'Excelente',
    peso_kg: 74.0,
    estatura_cm: 184.0,
    imc: 21.86,
    porcentaje_grasa_estimado: 9.8,
    requerimiento_calorico_diario_kcal: 3500,
    dieta_especial_requerida: 'Dieta de hipertrofia y potencia anaeróbica',
    frecuencia_cardiaca_reposo: 48,
    presion_arterial_sistolica: 118,
    presion_arterial_diastolica: 72,
    posee_talento_destacado: true,
    entrenador_evaluador: 'Prof. Roberto Briceño',
    observaciones_entrenador: 'Marca de 10.65s en 100m planos categoría juvenil. Postulado a Juegos Panamericanos Jr.',
  },
  {
    id: 'perf-003',
    integrante_id: 'int_010',
    disciplina_principal: 'Béisbol',
    disciplina_secundaria: 'Softbol',
    nivel_competencia: 'Aficionado',
    aptitud_deportiva_supervisada: 'Optima',
    peso_kg: 54.0,
    estatura_cm: 163.0,
    imc: 20.32,
    porcentaje_grasa_estimado: 13.5,
    requerimiento_calorico_diario_kcal: 2600,
    dieta_especial_requerida: 'Balanceada estándar con suplemento de calcio',
    frecuencia_cardiaca_reposo: 60,
    presion_arterial_sistolica: 110,
    presion_arterial_diastolica: 70,
    posee_talento_destacado: true,
    entrenador_evaluador: 'Técnico José Alfonzo',
    observaciones_entrenador: 'Lanzador zurdo con mecánica fluida, velocidad proyectada 75mph a su edad.',
  },
  {
    id: 'perf-004',
    integrante_id: 'int_011',
    disciplina_principal: 'Gimnasia Rítmica',
    disciplina_secundaria: 'Ballet Clásico',
    nivel_competencia: 'Atleta_Alta_Competencia',
    aptitud_deportiva_supervisada: 'Excelente',
    peso_kg: 32.0,
    estatura_cm: 138.0,
    imc: 16.8,
    porcentaje_grasa_estimado: 12.0,
    requerimiento_calorico_diario_kcal: 2100,
    dieta_especial_requerida: 'Supervisión de micronutrientes y flexibilidad',
    frecuencia_cardiaca_reposo: 56,
    presion_arterial_sistolica: 105,
    presion_arterial_diastolica: 65,
    posee_talento_destacado: true,
    entrenador_evaluador: 'Lic. Mariángel Rivas',
    observaciones_entrenador: 'Coordinación motriz de nivel élite con cinta y aro. Potencial medallista nacional.',
  },
];

const INITIAL_INVENTARIO: InventarioDeportivo[] = [
  {
    id: 'inv-001',
    campamento_id: 'camp_morochito',
    nombre_insumo: 'Balones de Fútbol Profesional No. 5',
    categoria: 'Balones',
    cantidad_en_stock: 45,
    cantidad_distribuida: 30,
    unidad_medida: 'Unidades',
    estado_fisico: 'Nuevo',
    donante_o_proveedor: 'Ministerio del Deporte',
    observaciones: 'Balones termosellados para entrenamiento de selecciones',
  },
  {
    id: 'inv-002',
    campamento_id: 'camp_morochito',
    nombre_insumo: 'Kits de Atletismo (Conos, Vallas, Testigos)',
    categoria: 'Kits_Entrenamiento',
    cantidad_en_stock: 20,
    cantidad_distribuida: 15,
    unidad_medida: 'Kits',
    estado_fisico: 'Nuevo',
    donante_o_proveedor: 'Federación Venezolana de Atletismo',
    observaciones: 'Dotación para pista de tartán',
  },
  {
    id: 'inv-003',
    campamento_id: 'camp_morochito',
    nombre_insumo: 'Cronómetros Digitales de Precisión 1/100s',
    categoria: 'Cronometraje',
    cantidad_en_stock: 12,
    cantidad_distribuida: 8,
    unidad_medida: 'Unidades',
    estado_fisico: 'Nuevo',
    donante_o_proveedor: 'Fondo Nacional del Deporte',
    observaciones: 'Uso exclusivo del cuerpo técnico y entrenadores',
  },
  {
    id: 'inv-004',
    campamento_id: 'camp_la_guaira_uee',
    nombre_insumo: 'Uniformes de Baloncesto Tricolor (Franela + Short)',
    categoria: 'Uniformes',
    cantidad_en_stock: 80,
    cantidad_distribuida: 55,
    unidad_medida: 'Juegos',
    estado_fisico: 'Nuevo',
    donante_o_proveedor: 'Ministerio del Deporte',
    observaciones: 'Tallas S, M, L con logo institucional',
  },
  {
    id: 'inv-005',
    campamento_id: 'camp_la_guaira_uee',
    nombre_insumo: 'Balones de Baloncesto Molten GG7X',
    categoria: 'Balones',
    cantidad_en_stock: 35,
    cantidad_distribuida: 25,
    unidad_medida: 'Unidades',
    estado_fisico: 'Usado_Buen_Estado',
    donante_o_proveedor: 'Gobernación de La Guaira',
    observaciones: 'Para tabloncillo cubierto',
  },
  {
    id: 'inv-006',
    campamento_id: 'camp_naiguata',
    nombre_insumo: 'Tablas de Bodyboard y Rescate Marino',
    categoria: 'Kits_Entrenamiento',
    cantidad_en_stock: 18,
    cantidad_distribuida: 12,
    unidad_medida: 'Unidades',
    estado_fisico: 'Nuevo',
    donante_o_proveedor: 'MinDeporte - Deportes de Playa',
    observaciones: 'Para clínicas deportivas costeras y rescate',
  },
  {
    id: 'inv-007',
    campamento_id: 'camp_paraiso',
    nombre_insumo: 'Botiquines de Emergencia y Crioterapia Deportiva',
    categoria: 'Medicamentos',
    cantidad_en_stock: 15,
    cantidad_distribuida: 10,
    unidad_medida: 'Kits',
    estado_fisico: 'Nuevo',
    donante_o_proveedor: 'Misión Barrio Adentro Deportivo',
    observaciones: 'Hielo químico, vendas elásticas y analgésicos',
  },
];

const INITIAL_RUTAS: RutaTransporte[] = [
  {
    id: 'b4a92c81-87de-4f32-841f-13a8519e0001',
    codigo_ruta: 'RUTA-YUTONG-001',
    campamento_origen_id: 'camp_la_guaira_uee',
    campamento_destino_id: 'camp_morochito',
    unidad_vehiculo: 'Autobús Yutong ZK6129H (Placa: 20A-MIND)',
    nombre_conductor: 'Sr. Wilmer Zambrano',
    telefono_conductor: '+58 412-8889901',
    capacidad_pasajeros: 44,
    hora_salida_programada: '2026-09-17T07:00:00Z',
    hora_llegada_estimada: '2026-09-17T08:30:00Z',
    estatus_ruta: 'Programada',
    notas_seguridad: 'Traslado de atletas preseleccionados para chequeo biométrico nacional en Caracas.',
  },
  {
    id: 'b4a92c81-87de-4f32-841f-13a8519e0002',
    codigo_ruta: 'RUTA-YUTONG-002',
    campamento_origen_id: 'camp_naiguata',
    campamento_destino_id: 'camp_paraiso',
    unidad_vehiculo: 'Autobús Yutong ZK6118 (Placa: 18B-IND)',
    nombre_conductor: 'Sr. Franklin Herrera',
    telefono_conductor: '+58 424-7776655',
    capacidad_pasajeros: 38,
    hora_salida_programada: '2026-09-17T09:00:00Z',
    hora_llegada_estimada: '2026-09-17T11:00:00Z',
    estatus_ruta: 'Programada',
    notas_seguridad: 'Caravana deportiva con resguardo de seguridad vial por la Autopista Caracas-La Guaira.',
  },
];

const INITIAL_PASAJEROS: PasajeroRuta[] = [
  {
    id: 'pas-001',
    ruta_id: 'b4a92c81-87de-4f32-841f-13a8519e0001',
    integrante_id: 'int_002',
    asiento_numero: 12,
    asistencia_confirmada: true,
  },
  {
    id: 'pas-002',
    ruta_id: 'b4a92c81-87de-4f32-841f-13a8519e0001',
    integrante_id: 'int_006',
    asiento_numero: 13,
    asistencia_confirmada: true,
  },
  {
    id: 'pas-003',
    ruta_id: 'b4a92c81-87de-4f32-841f-13a8519e0001',
    integrante_id: 'int_010',
    asiento_numero: 14,
    asistencia_confirmada: true,
  },
  {
    id: 'pas-004',
    ruta_id: 'b4a92c81-87de-4f32-841f-13a8519e0002',
    integrante_id: 'int_011',
    asiento_numero: 5,
    asistencia_confirmada: true,
  },
];

// ==============================================================================
// GESTOR DE DATOS REACTIVO CON SOPORTE DE API REST Y FALLBACK IN-MEMORY
// ==============================================================================

class DataStore {
  private estados: EstadoRegional[] = [...INITIAL_ESTADOS];
  private campamentos: Campamento[] = [...FULL_CAMPAMENTOS_LIST];
  private familias: Familia[] = [...INITIAL_FAMILIAS, ...LA_GUAIRA_FAMILIAS, ...ROSCIO_FAMILIAS];
  private integrantes: Integrante[] = [...INITIAL_INTEGRANTES, ...LA_GUAIRA_INTEGRANTES, ...ROSCIO_INTEGRANTES];
  private perfiles: PerfilDeportivo[] = [...INITIAL_PERFILES, ...LA_GUAIRA_PERFILES, ...ROSCIO_PERFILES];
  private inventario: InventarioDeportivo[] = [...INITIAL_INVENTARIO, ...LA_GUAIRA_INVENTARIO, ...ROSCIO_INVENTARIO];
  private rutas: RutaTransporte[] = [...INITIAL_RUTAS];
  private pasajeros: PasajeroRuta[] = [...INITIAL_PASAJEROS];

  // Métodos de lectura
  public async getEstados(): Promise<EstadoRegional[]> {
    return [...this.estados];
  }

  public async getCampamentos(estadoId?: string): Promise<Campamento[]> {
    if (estadoId && estadoId !== 'todos') {
      return this.campamentos.filter((c) => c.estado_id === estadoId);
    }
    return [...this.campamentos];
  }

  public async getCampamentoById(id: string): Promise<Campamento | undefined> {
    return this.campamentos.find((c) => c.id === id);
  }

  public async getFamilias(campamentoId?: string): Promise<Familia[]> {
    if (campamentoId) {
      return this.familias.filter((f) => f.campamento_id === campamentoId);
    }
    return [...this.familias];
  }

  public async getIntegrantes(familiaId?: string): Promise<Integrante[]> {
    if (familiaId) {
      return this.integrantes.filter((i) => i.familia_id === familiaId);
    }
    return [...this.integrantes];
  }

  public async getPerfiles(): Promise<PerfilDeportivo[]> {
    return [...this.perfiles];
  }

  public async getPerfilByIntegranteId(integranteId: string): Promise<PerfilDeportivo | undefined> {
    return this.perfiles.find((p) => p.integrante_id === integranteId);
  }

  public async getInventario(campamentoId?: string): Promise<InventarioDeportivo[]> {
    if (campamentoId) {
      return this.inventario.filter((item) => item.campamento_id === campamentoId);
    }
    return [...this.inventario];
  }

  public async getRutas(): Promise<RutaTransporte[]> {
    return [...this.rutas];
  }

  public async getPasajeros(rutaId?: string): Promise<PasajeroRuta[]> {
    if (rutaId) {
      return this.pasajeros.filter((p) => p.ruta_id === rutaId);
    }
    return [...this.pasajeros];
  }

  // Métodos de mutación // [MIGRACIÓN]
  public async saveCampamento(campamento: Campamento): Promise<Campamento> {
    const idx = this.campamentos.findIndex((c) => c.id === campamento.id);
    if (idx >= 0) {
      this.campamentos[idx] = { ...campamento, updated_at: new Date().toISOString() };
    } else {
      this.campamentos.push({
        ...campamento,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    return campamento;
  }

  public async saveFamilia(familia: Familia): Promise<Familia> {
    const idx = this.familias.findIndex((f) => f.id === familia.id);
    if (idx >= 0) {
      this.familias[idx] = { ...familia, updated_at: new Date().toISOString() };
    } else {
      this.familias.push({
        ...familia,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    return familia;
  }

  public async saveIntegrante(integrante: Integrante): Promise<Integrante> {
    // Calculamos es_nna automáticamente
    const esNNA = integrante.edad < 18;
    const item: Integrante = {
      ...integrante,
      es_nna: esNNA,
      is_sensitive_data: esNNA ? true : integrante.is_sensitive_data,
      updated_at: new Date().toISOString(),
    };
    const idx = this.integrantes.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      this.integrantes[idx] = item;
    } else {
      item.created_at = new Date().toISOString();
      this.integrantes.push(item);
    }
    return item;
  }

  public async savePerfil(perfil: PerfilDeportivo): Promise<PerfilDeportivo> {
    // Cálculo automático de IMC como columna generada
    const imc =
      perfil.estatura_cm > 0
        ? Math.round((perfil.peso_kg / Math.pow(perfil.estatura_cm / 100, 2)) * 100) / 100
        : 0;

    const item: PerfilDeportivo = {
      ...perfil,
      imc,
      updated_at: new Date().toISOString(),
    };
    const idx = this.perfiles.findIndex((p) => p.id === item.id || p.integrante_id === item.integrante_id);
    if (idx >= 0) {
      this.perfiles[idx] = item;
    } else {
      item.created_at = new Date().toISOString();
      this.perfiles.push(item);
    }
    return item;
  }

  public async saveInventario(item: InventarioDeportivo): Promise<InventarioDeportivo> {
    const idx = this.inventario.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      this.inventario[idx] = { ...item, updated_at: new Date().toISOString() };
    } else {
      this.inventario.push({
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    return item;
  }

  public async saveRuta(ruta: RutaTransporte): Promise<RutaTransporte> {
    const idx = this.rutas.findIndex((r) => r.id === ruta.id);
    if (idx >= 0) {
      this.rutas[idx] = ruta;
    } else {
      this.rutas.push(ruta);
    }
    return ruta;
  }

  public async deleteCampamento(id: string): Promise<boolean> {
    const prev = this.campamentos.length;
    this.campamentos = this.campamentos.filter((c) => c.id !== id);
    return this.campamentos.length < prev;
  }

  public async getFamiliaById(id: string): Promise<Familia | undefined> {
    return this.familias.find((f) => f.id === id);
  }

  public async deleteFamilia(id: string): Promise<boolean> {
    const prev = this.familias.length;
    this.familias = this.familias.filter((f) => f.id !== id);
    return this.familias.length < prev;
  }

  public async getIntegranteById(id: string): Promise<Integrante | undefined> {
    return this.integrantes.find((i) => i.id === id);
  }

  public async deleteIntegrante(id: string): Promise<boolean> {
    const prev = this.integrantes.length;
    this.integrantes = this.integrantes.filter((i) => i.id !== id);
    return this.integrantes.length < prev;
  }

  public async getPerfilById(id: string): Promise<PerfilDeportivo | undefined> {
    return this.perfiles.find((p) => p.id === id || p.integrante_id === id);
  }

  public async deletePerfil(id: string): Promise<boolean> {
    const prev = this.perfiles.length;
    this.perfiles = this.perfiles.filter((p) => p.id !== id);
    return this.perfiles.length < prev;
  }

  public async getInventarioById(id: string): Promise<InventarioDeportivo | undefined> {
    return this.inventario.find((item) => item.id === id);
  }

  public async deleteInventario(id: string): Promise<boolean> {
    const prev = this.inventario.length;
    this.inventario = this.inventario.filter((item) => item.id !== id);
    return this.inventario.length < prev;
  }

  public async getRutaById(id: string): Promise<RutaTransporte | undefined> {
    return this.rutas.find((r) => r.id === id);
  }

  public async deleteRuta(id: string): Promise<boolean> {
    const prev = this.rutas.length;
    this.rutas = this.rutas.filter((r) => r.id !== id);
    return this.rutas.length < prev;
  }

  public async addPasajero(pasajero: PasajeroRuta): Promise<PasajeroRuta> {
    this.pasajeros.push(pasajero);
    return pasajero;
  }

  public async deletePasajero(rutaId: string, integranteId: string): Promise<boolean> {
    const prev = this.pasajeros.length;
    this.pasajeros = this.pasajeros.filter((p) => !(p.ruta_id === rutaId && p.integrante_id === integranteId));
    return this.pasajeros.length < prev;
  }

  public async toggleAsistenciaPasajero(rutaId: string, integranteId: string): Promise<boolean> {
    const p = this.pasajeros.find((item) => item.ruta_id === rutaId && item.integrante_id === integranteId);
    if (p) {
      p.asistencia_confirmada = !p.asistencia_confirmada;
      return p.asistencia_confirmada;
    }
    return false;
  }

  // Genera el estado global resumido para inyección contextual en Gemini 3.5 Flash
  public getGlobalStateSummary(): string {
    const totalCampamentos = this.campamentos.length;
    const totalFamilias = this.familias.length;
    const totalIntegrantes = this.integrantes.length;
    const totalNNA = this.integrantes.filter((i) => i.es_nna).length;
    const totalTalentos = this.perfiles.filter((p) => p.posee_talento_destacado).length;
    const camasTotales = this.campamentos.reduce((acc, c) => acc + c.capacidad_camas_total, 0);
    const camasOcupadas = this.campamentos.reduce((acc, c) => acc + c.camas_ocupadas, 0);

    const disciplinas = Array.from(new Set(this.perfiles.map((p) => p.disciplina_principal))).join(', ');

    return `
RESUMEN DEL ESTADO ACTUAL - SISTEMA DE CAMPAMENTOS TRANSITORIOS DEPORTIVOS:
- Campamentos Registrados: ${totalCampamentos} sedes (La Guaira, Caracas, Miranda, Aragua).
- Capacidad de Camas: ${camasOcupadas} ocupadas de ${camasTotales} totales (${Math.round((camasOcupadas / camasTotales) * 100)}% de ocupación).
- Familias Albergadas: ${totalFamilias} núcleos familiares censados.
- Total Integrantes: ${totalIntegrantes} personas (de las cuales ${totalNNA} son Niños, Niñas o Adolescentes NNA bajo protección).
- Atletas con Perfil Biométrico: ${this.perfiles.length} evaluados (${totalTalentos} identificados con Talento Deportivo Destacado o Selección Nacional).
- Disciplinas evaluadas: ${disciplinas}.
- Unidades de Transporte Yutong: ${this.rutas.length} rutas activas La Guaira - Caracas.
- Insumos en Inventario: ${this.inventario.length} renglones de dotación deportiva y primeros auxilios.
    `.trim();
  }

  // ==========================================
  // FASE 3: SISTEMA DE ALERTAS TEMPRANAS OPERATIVAS
  // ==========================================
  public async getAlertas(): Promise<AlertaOperativa[]> {
    const alertas: AlertaOperativa[] = [];

    // 1. Alertas de Saturación de Aforo en Campamentos (>80% de camas)
    for (const camp of this.campamentos) {
      if (camp.capacidad_camas_total > 0) {
        const pct = Math.round((camp.camas_ocupadas / camp.capacidad_camas_total) * 100);
        if (pct >= 85) {
          alertas.push({
            id: `alt-sat-${camp.id}`,
            titulo: `Ocupación Crítica: ${camp.nombre}`,
            tipo: 'saturacion_aforo',
            severidad: 'critica',
            campamento_id: camp.id,
            campamento_nombre: camp.nombre,
            descripcion: `El campamento presenta ${camp.camas_ocupadas} camas ocupadas de ${camp.capacidad_camas_total} disponibles (${pct}% de aforo).`,
            fecha: new Date().toISOString(),
            accion_sugerida: 'Habilitar módulos transitorios de contingencia o coordinar traslados en unidades Yutong hacia subsedes.',
          });
        } else if (pct >= 80) {
          alertas.push({
            id: `alt-sat-${camp.id}`,
            titulo: `Alerta de Aforo Preventivo: ${camp.nombre}`,
            tipo: 'saturacion_aforo',
            severidad: 'advertencia',
            campamento_id: camp.id,
            campamento_nombre: camp.nombre,
            descripcion: `La ocupación de camas alcanzó el ${pct}% (${camp.camas_ocupadas}/${camp.capacidad_camas_total}). Quedan solo ${camp.capacidad_camas_total - camp.camas_ocupadas} camas libres.`,
            fecha: new Date().toISOString(),
            accion_sugerida: 'Monitorear nuevos ingresos y reservar camas para casos de emergencia médica.',
          });
        }
      }
    }

    // 2. Alertas de Salud y Protección de NNA (Art. 65 LOPNNA)
    for (const int of this.integrantes) {
      if (int.es_nna) {
        if (int.flag_riesgo === 'danger' || int.es_lactante) {
          const fam = this.familias.find((f) => f.id === int.familia_id);
          const camp = this.campamentos.find((c) => c.id === fam?.campamento_id);
          alertas.push({
            id: `alt-nna-${int.id}`,
            titulo: `Atención Médica Prioritaria NNA: ${int.es_lactante ? 'Lactante Menor' : 'Caso Clínico'}`,
            tipo: 'salud_nna',
            severidad: 'critica',
            campamento_id: camp?.id,
            campamento_nombre: camp?.nombre || 'Sede Transitoria',
            descripcion: `${int.es_lactante ? 'Lactante con esquema de inmunización pendiente' : int.patologia || 'Requiere seguimiento pediátrico especializado'}. Ubicación: ${fam?.ubicacion_interna || 'Módulo transitorio'}.`,
            fecha: new Date().toISOString(),
            accion_sugerida: 'Coordinar visita médica con el equipo de salud y suministrar fórmula / medicamentos.',
          });
        } else if (int.flag_riesgo === 'warning' || (int.patologia && int.patologia !== 'Ninguna')) {
          const fam = this.familias.find((f) => f.id === int.familia_id);
          const camp = this.campamentos.find((c) => c.id === fam?.campamento_id);
          alertas.push({
            id: `alt-nna-${int.id}`,
            titulo: `Seguimiento de Salud NNA: ${int.patologia}`,
            tipo: 'salud_nna',
            severidad: 'advertencia',
            campamento_id: camp?.id,
            campamento_nombre: camp?.nombre || 'Sede Transitoria',
            descripcion: `Paciente menor de edad diagnosticado con ${int.patologia}. Tratamiento indicado: ${int.medicamentos_requeridos || 'En observación'}.`,
            fecha: new Date().toISOString(),
            accion_sugerida: 'Verificar existencia de medicamentos en el botiquín del campamento.',
          });
        }
      }
    }

    // 3. Alertas de Stock Bajo o Insumos Deteriorados
    for (const item of this.inventario) {
      if (item.cantidad_en_stock <= 5) {
        const camp = this.campamentos.find((c) => c.id === item.campamento_id);
        alertas.push({
          id: `alt-inv-${item.id}`,
          titulo: `Stock Crítico: ${item.nombre_insumo}`,
          tipo: 'stock_bajo',
          severidad: item.cantidad_en_stock === 0 ? 'critica' : 'advertencia',
          campamento_id: camp?.id,
          campamento_nombre: camp?.nombre || 'Almacén Central',
          descripcion: `Solo quedan ${item.cantidad_en_stock} ${item.unidad_medida} disponibles en almacén. (${item.cantidad_distribuida} ya distribuidos).`,
          fecha: new Date().toISOString(),
          accion_sugerida: 'Solicitar reabastecimiento formal a la Dirección General de Logística del MinDeporte.',
        });
      } else if (item.estado_fisico === 'Deteriorado') {
        const camp = this.campamentos.find((c) => c.id === item.campamento_id);
        alertas.push({
          id: `alt-inv-det-${item.id}`,
          titulo: `Material Deteriorado: ${item.nombre_insumo}`,
          tipo: 'stock_bajo',
          severidad: 'advertencia',
          campamento_id: camp?.id,
          campamento_nombre: camp?.nombre || 'Almacén Central',
          descripcion: `El lote presenta condición de deterioro y requiere sustitución técnica para entrenamientos seguros.`,
          fecha: new Date().toISOString(),
          accion_sugerida: 'Dar de baja y tramitar reposición de kits de entrenamiento.',
        });
      }
    }

    // 4. Alertas de Transporte Pendiente
    for (const ruta of this.rutas) {
      if (ruta.estatus_ruta === 'Programada') {
        const pasajerosRuta = this.pasajeros.filter((p) => p.ruta_id === ruta.id);
        const confirmados = pasajerosRuta.filter((p) => p.asistencia_confirmada).length;
        if (pasajerosRuta.length > 0 && confirmados < pasajerosRuta.length / 2) {
          alertas.push({
            id: `alt-rut-${ruta.id}`,
            titulo: `Confirmación de Pasajeros Pendiente: Ruta ${ruta.codigo_ruta}`,
            tipo: 'transporte_pendiente',
            severidad: 'informativa',
            descripcion: `Solo ${confirmados} de ${pasajerosRuta.length} pasajeros han confirmado asistencia para la unidad ${ruta.unidad_vehiculo}.`,
            fecha: new Date().toISOString(),
            accion_sugerida: 'Realizar verificación de lista con los coordinadores de piso antes de la salida.',
          });
        }
      }
    }

    return alertas;
  }
}

// Instancia singleton para el frontend
export const db = new DataStore();
