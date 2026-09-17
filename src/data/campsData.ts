/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * Catálogo Maestro Oficial de 106 Campamentos Transitorios (camps.ts)
 */

import { Campamento } from '../types';

export interface RawCamp {
  id: string;
  name: string;
  location: string;
  state: 'LA GUAIRA' | 'CARACAS' | 'MIRANDA' | 'ARAGUA';
  padrino: string;
}

export const DEFAULT_CAMPS: RawCamp[] = [
  // --- LA GUAIRA (28 campamentos) ---
  { id: 'la_guaira', name: 'Escuela Estadal La Guaira', location: 'Calle Real de Naiguatá, Sector El Pueblo, Naiguatá, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MINISTERIO SALUD E IPASME' },
  { id: 'camp-lg-2', name: 'Liceo Armando Reveron', location: 'Urimare, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MINISTERIO DE EDUCACIÓN UNIVERSITARIA' },
  { id: 'camp-lg-3', name: 'Liceo Lorenzo Gonzalez', location: 'Carlos Soublette, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MINISTERIO PUEBLOS INDIGENAS' },
  { id: 'camp-lg-4', name: 'Unidad Educativa 10 de Marzo', location: 'Carlos Soublette, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MINISTERIO DE LA JUVENTUD' },
  { id: 'juan_german_roscio', name: 'Juan German Roscio', location: 'Maiquetía, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MINISTERIO DE EDUCACION' },
  { id: 'camp-lg-6', name: 'Complejo Educativo República de Panamá', location: 'La Guaira, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'PROCESO SOCIAL DEL TRABAJO' },
  { id: 'camp-lg-7', name: 'Canes Escuela De Grumetes', location: 'Catia La Mar, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MINISTERIO DE DEPORTE' },
  { id: 'camp-lg-8', name: 'C.E.I Manuel Gual', location: 'Catia La Mar, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MINISTERIO DE CULTURA' },
  { id: 'camp-lg-9', name: 'Refugio Para Niños Y Niñas', location: 'Urimare, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'SEDE DEL MINISTERIO DE LA MUJER' },
  { id: 'camp-lg-10', name: 'Refugio Para Adultos Y Adultas Mayores (Escuela Santa Eduvigis)', location: 'Urimare, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MINISTERIO DE ABUELOS Y FRENTE FRANCISCO DE MIRANDA' },
  { id: 'camp-lg-11', name: 'Universidad Maritima Del Caribe', location: 'Catia La Mar, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MINISTERIO DE INTERIOR Y JUSTICIA' },
  { id: 'camp-lg-12', name: 'Ciudad Vacacional Los Caracas', location: 'Naiguata, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MINISTERIO DE VIVIENDA' },
  { id: 'camp-lg-13', name: 'Narciso Gonel', location: 'Catia La Mar, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MINISTERIO COMUNAS' },
  { id: 'camp-lg-14', name: 'Escuela Guaicamacuto', location: 'Macuto, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'BANCO CENTRAL DE VENEZUELA' },
  { id: 'camp-lg-15', name: 'Escuela Angel Valero Hosto', location: 'Catia La Mar, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MIN. AGUAS' },
  { id: 'camp-lg-16', name: 'Fundación Sol de Vargas', location: 'Caraballeda, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'ALCALDÍA' },
  { id: 'camp-lg-17', name: 'Complejo Educativo Antonio José de Sucre', location: 'Catia La Mar, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'BOLIPUERTOS' },
  { id: 'camp-lg-18', name: 'Polideportivo José María Vargas', location: 'Edo. La Guaira', state: 'LA GUAIRA', padrino: 'ONU/GOBERNACIÓN/EQUIPO AN' },
  { id: 'camp-lg-19', name: 'Campamento Cesar Nieves', location: 'Edo. La Guaira', state: 'LA GUAIRA', padrino: 'ONU/VICEPRESIDENCIA SOCIAL' },
  { id: 'camp-lg-20', name: 'Estadio Miguel Montes', location: 'Edo. La Guaira', state: 'LA GUAIRA', padrino: 'ONU/VICEPRESIDENCIA ECONOMÍA Y FINANZAS' },
  { id: 'camp-lg-21', name: 'Universidad Simón Bolívar', location: 'Edo. La Guaira', state: 'LA GUAIRA', padrino: 'MINISTERIO DE INTERIOR Y JUSTICIA' },
  { id: 'camp-lg-22', name: 'Escuela Juan Aranaga', location: 'Maiquetia, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'TEATRO TERESA CARREÑO' },
  { id: 'camp-lg-23', name: 'Mare Abajo', location: 'Edo. La Guaira', state: 'LA GUAIRA', padrino: 'ONU/VICEPRESIDENCIA OBRAS PÚBLICAS' },
  { id: 'camp-lg-24', name: 'Gustavo Olivares Bosques', location: 'Edo. La Guaira', state: 'LA GUAIRA', padrino: 'FOGADE' },
  { id: 'camp-lg-25', name: 'Liceo Licenciado Aranda', location: 'Maiquetia, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'SUNAGRO' },
  { id: 'camp-lg-26', name: 'Juan de Urpin', location: 'Urimare, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'BANCO DE VENEZUELA' },
  { id: 'camp-lg-27', name: 'Campamento transitorio Marthin Luther King', location: 'Naiguata, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'FEDE' },
  { id: 'camp-lg-28', name: 'Alberto Ravel', location: 'Carlos Soublette, Edo. La Guaira', state: 'LA GUAIRA', padrino: 'C.N.E' },

  // --- CARACAS (40 campamentos) ---
  { id: 'camp-ccs-29', name: 'U.E.N. Pedro Emilio Coll', location: 'Coche, Caracas', state: 'CARACAS', padrino: 'METRO DE CARACAS, C.A.' },
  { id: 'camp-ccs-30', name: 'U.E.N.B. Coronel Carlos Delgado Chalbaud', location: 'Coche, Caracas', state: 'CARACAS', padrino: 'INSTITUTO NACIONAL DE HIPODROMOS' },
  { id: 'camp-ccs-31', name: 'U.E.N. Francisco Pimentel', location: 'Santa Teresa, Caracas', state: 'CARACAS', padrino: 'SENIAT' },
  { id: 'camp-ccs-32', name: 'E.T.I. Rafael Vegas', location: 'Sucre, Caracas', state: 'CARACAS', padrino: 'MINISTERIO DEL PODER POPULAR PARA LA ALIMENTACIÓN' },
  { id: 'camp-ccs-33', name: 'Liceo Juan Landaeta', location: 'Sucre, Caracas', state: 'CARACAS', padrino: 'BANCO DE VENEZUELA' },
  { id: 'camp-ccs-34', name: 'E.D Juan Antonio Perez Bonalde', location: 'Sucre, Caracas', state: 'CARACAS', padrino: 'MINISTERIO DE COMUNICACIÓN E INFORMACIÓN' },
  { id: 'camp-ccs-35', name: 'U.E.N Jose Ignacio Paz Castillo', location: 'La Pastora, Caracas', state: 'CARACAS', padrino: 'MOVILNET' },
  { id: 'camp-ccs-36', name: 'U.E Gran Colombia', location: 'Santa Rosalia, Caracas', state: 'CARACAS', padrino: 'MINISTERIO PUEBLOS INDIGENAS/BDT' },
  { id: 'camp-ccs-37', name: 'E.B.N Dr Guillermo Delgado Palacios', location: 'El Valle, Caracas', state: 'CARACAS', padrino: 'CANTV' },
  { id: 'camp-ccs-38', name: 'Liceo Judith Liendo', location: 'El Valle, Caracas', state: 'CARACAS', padrino: 'MINISTERIO DEL PODER POPULAR PARA LA PESCA Y ACUICULTURA' },
  { id: 'camp-ccs-39', name: 'Liceo Jose Avalos', location: 'El Valle, Caracas', state: 'CARACAS', padrino: 'BANCO CENTRAL DE VENEZUELA' },
  { id: 'camp-ccs-40', name: 'Liceo Leopoldo Aguerrevere', location: 'San Pedro, Caracas', state: 'CARACAS', padrino: 'PROCURADURÍA GENERAL DE VENEZUELA' },
  { id: 'camp-ccs-41', name: 'C.E Andres Bello', location: 'Candelaria, Caracas', state: 'CARACAS', padrino: 'AGRICULTURA TIERRA' },
  { id: 'camp-ccs-42', name: 'Liceo Juan Lovera', location: 'Macarao, Caracas', state: 'CARACAS', padrino: 'MINISTERIO DEL PODER POPULAR PARA LA PLANIFICACIÓN' },
  { id: 'camp-ccs-43', name: 'U.E.N. Armando Zuloaga Blanco', location: 'San José, Caracas', state: 'CARACAS', padrino: 'BOLIPUERTOS' },
  { id: 'camp-ccs-44', name: 'U.E. Gervasio Artigas', location: 'Sucre, Caracas', state: 'CARACAS', padrino: 'BANCO DEL TESORO' },
  { id: 'camp-ccs-45', name: 'U.E.N. Pedro Fontes', location: 'La Vega, Caracas', state: 'CARACAS', padrino: 'CONTRALORIA GENERAL DE LA REPÚBLICA' },
  { id: 'camp-ccs-46', name: 'U.E.N. Vicente Landaeta Gil', location: 'San Bernardino, Caracas', state: 'CARACAS', padrino: 'SAREN' },
  { id: 'camp-ccs-47', name: 'C.E. Claudio Feliciano', location: 'Macarao, Caracas', state: 'CARACAS', padrino: 'MOVILNET' },
  { id: 'camp-ccs-48', name: 'UEN Eduardo Crema', location: 'El Paraiso, Caracas', state: 'CARACAS', padrino: 'MINISTERIO DE CIENCIA Y TECNOLOGÍA' },
  { id: 'camp-ccs-49', name: 'UE Cesar Rengifo', location: 'La Pastora, Caracas', state: 'CARACAS', padrino: 'MINISTERIO DEL PODER POPULAR PARA LA CULTURA' },
  { id: 'camp-ccs-50', name: 'Liceo Agustín Aveledo', location: 'La Pastora, Caracas', state: 'CARACAS', padrino: 'PEQUIVEN' },
  { id: 'camp-ccs-51', name: 'UE Luis Hurtado', location: 'El Junquito, Caracas', state: 'CARACAS', padrino: 'MINISTERIO DEL PODER POPULAR PARA LAS COMUNAS' },
  { id: 'camp-ccs-52', name: 'UEN Dr Luis Padrino', location: 'San Juan, Caracas', state: 'CARACAS', padrino: 'MINISTERIO DEL PODER POPULAR PARA SERVICIOS PENITENCIARIOS' },
  { id: 'camp-ccs-53', name: 'UE Jesus Enrique Lozada', location: 'El Recreo, Caracas', state: 'CARACAS', padrino: 'MINISTERIO DEL PODER POPULAR PARA EL COMERCIO EXTERIOR' },
  { id: 'camp-ccs-54', name: 'UEN Zoe Xiques Silva', location: 'San Juan, Caracas', state: 'CARACAS', padrino: 'FONDEN' },
  { id: 'camp-ccs-55', name: 'Escuela Nuestra América', location: 'San Juan, Caracas', state: 'CARACAS', padrino: 'BANCO DEL TESORO' },
  { id: 'camp-ccs-56', name: 'Centro de Educación Inicial Paula Maria Nieves', location: 'Altagracia, Caracas', state: 'CARACAS', padrino: 'TSJ' },
  { id: 'camp-ccs-57', name: 'Campamento Edificio Misión Cultura', location: 'Altagracia, Caracas', state: 'CARACAS', padrino: 'MINISTERIO DEL PODER POPULAR DE CULTURA' },
  { id: 'camp-ccs-58', name: 'Ciudadela de Catia 2', location: 'Sucre, Caracas', state: 'CARACAS', padrino: 'ALCALDIA LIBERTADOR' },
  { id: 'camp-ccs-59', name: 'Complejo Guayana Esequiba', location: 'San Bernardino, Caracas', state: 'CARACAS', padrino: 'ALCALDIA LIBERTADOR' },
  { id: 'camp-ccs-60', name: 'Estacionamiento Hotel Avila', location: 'San Bernardino, Caracas', state: 'CARACAS', padrino: 'ALCALDIA LIBERTADOR' },
  { id: 'camp-ccs-61', name: 'UNES El Junquito', location: 'El Junquito, Caracas', state: 'CARACAS', padrino: 'ALCALDIA LIBERTADOR' },
  { id: 'camp-ccs-62', name: 'CMAPP El Junquito', location: 'El Junquito, Caracas', state: 'CARACAS', padrino: 'ALCALDIA LIBERTADOR' },
  { id: 'camp-ccs-63', name: 'San Pedro Claver', location: '23 de enero, Caracas', state: 'CARACAS', padrino: 'ALCALDIA LIBERTADOR' },
  { id: 'camp-ccs-64', name: 'GBM Caricuao', location: 'Caricuao, Caracas', state: 'CARACAS', padrino: 'ALCALDIA LIBERTADOR' },
  { id: 'camp-ccs-65', name: 'GBM El Valle', location: 'El Valle, Caracas', state: 'CARACAS', padrino: 'ALCALDIA LIBERTADOR' },
  { id: 'camp-ccs-66', name: 'GMB Pinto Salinas', location: 'El Recreo, Caracas', state: 'CARACAS', padrino: 'ALCALDIA LIBERTADOR' },
  { id: 'camp-ccs-67', name: 'Gran Base de Paz Quinta Crespo', location: 'Santa Teresa, Caracas', state: 'CARACAS', padrino: 'ALCALDIA LIBERTADOR' },
  { id: 'camp-ccs-68', name: 'UE República del Ecuador', location: 'San Juan, Caracas', state: 'CARACAS', padrino: 'ALCALDIA LIBERTADOR' },

  // --- MIRANDA (28 campamentos) ---
  { id: 'camp-mir-69', name: 'U.E.N. Tito Salas', location: 'Baruta, Edo. Miranda', state: 'MIRANDA', padrino: 'CANTV' },
  { id: 'camp-mir-70', name: 'U.E.N. Sorocaima', location: 'Baruta, Edo. Miranda', state: 'MIRANDA', padrino: 'BAER' },
  { id: 'camp-mir-71', name: 'U.E.N. Alejo Fortique', location: 'Baruta, Edo. Miranda', state: 'MIRANDA', padrino: 'MINISTERIO DEL PODER POPULAR PARA SERVICIOS PENITENCIARIOS' },
  { id: 'camp-mir-72', name: 'C.E.I.N. Mamá Rosa', location: 'Baruta, Edo. Miranda', state: 'MIRANDA', padrino: 'CANCILLERÍA' },
  { id: 'camp-mir-73', name: 'C.E.I.N. Lino de Clemente', location: 'Baruta, Edo. Miranda', state: 'MIRANDA', padrino: 'IVSS' },
  { id: 'camp-mir-74', name: 'U.E.E. Adolfo Navas Coronado', location: 'Baruta (Minas de Baruta), Edo. Miranda', state: 'MIRANDA', padrino: 'MINISTERIO DEL PODER POPULAR PARA LAS FINANZAS' },
  { id: 'camp-mir-75', name: 'U.E.N. Josefa Irausquin López', location: 'Cafetal, Edo. Miranda', state: 'MIRANDA', padrino: 'MINISTERIO DE ENERGÍA ELÉCTRICA' },
  { id: 'camp-mir-76', name: 'U.E.N. Jesús María Alfaro Zamora', location: 'Cafetal, Edo. Miranda', state: 'MIRANDA', padrino: 'INEA' },
  { id: 'camp-mir-77', name: 'U.E. Juan Pablo Sojo', location: 'Curiepe, Edo. Miranda', state: 'MIRANDA', padrino: 'GOBERNACIÓN' },
  { id: 'camp-mir-78', name: 'C.E.I. Tacarigua', location: 'Tacarigua, Edo. Miranda', state: 'MIRANDA', padrino: 'GOBERNACIÓN' },
  { id: 'camp-mir-79', name: 'U.E.N. El Libertador', location: 'Chacao, Edo. Miranda', state: 'MIRANDA', padrino: 'MINISTERIO DE VIVIENDA Y HÁBITAT' },
  { id: 'camp-mir-80', name: 'Campamento Ezequiel Zamora', location: 'Charallave, Edo. Miranda', state: 'MIRANDA', padrino: 'GOBERNACIÓN' },
  { id: 'camp-mir-81', name: 'E.U. Conopoima', location: 'Hatillo, Edo. Miranda', state: 'MIRANDA', padrino: 'SUPERINTENDENCIA DE SEGUROS' },
  { id: 'camp-mir-82', name: 'Galpón Las Clavellinas', location: 'Guarenas, Edo. Miranda', state: 'MIRANDA', padrino: 'GOBERNACIÓN' },
  { id: 'camp-mir-83', name: 'Teatro Rosendo Castillo', location: 'Guarenas, Edo. Miranda', state: 'MIRANDA', padrino: 'GOBERNACIÓN' },
  { id: 'camp-mir-84', name: 'Casa de la Juventud "El Pueblo"', location: 'Guarenas, Edo. Miranda', state: 'MIRANDA', padrino: 'GOBERNACIÓN' },
  { id: 'camp-mir-85', name: 'C.E.I.N. Ambrosio Plaza', location: 'Guarenas, Edo. Miranda', state: 'MIRANDA', padrino: 'GOBERNACIÓN' },
  { id: 'camp-mir-86', name: 'C.E.N. Negro Primero', location: 'Caucaguita, Edo. Miranda', state: 'MIRANDA', padrino: 'MINISTERIO DE OBRAS PÚBLICAS' },
  { id: 'camp-mir-87', name: 'C.E.N. Ana María Campos', location: 'Filas de Mariche, Edo. Miranda', state: 'MIRANDA', padrino: 'ALCALDÍA DE SUCRE' },
  { id: 'camp-mir-88', name: 'U.E.N. Generalísimo Francisco de Miranda', location: 'Filas de Mariche, Edo. Miranda', state: 'MIRANDA', padrino: 'SUNDEE' },
  { id: 'camp-mir-89', name: 'Escuela de Liderazgo', location: 'Filas de Mariche, Edo. Miranda', state: 'MIRANDA', padrino: 'MPPE' },
  { id: 'camp-mir-90', name: 'C.E.N. Luis Beltrán Prieto Figueroa', location: 'Leoncio Martínez, Edo. Miranda', state: 'MIRANDA', padrino: 'FVF' },
  { id: 'camp-mir-91', name: 'C.E.N. Mariscal Sucre', location: 'La Dolorita, Edo. Miranda', state: 'MIRANDA', padrino: 'MINISTERIO DE INDUSTRIA Y COMERCIO' },
  { id: 'camp-mir-92', name: 'C.E.N. Francisco Iznardi', location: 'La Dolorita, Edo. Miranda', state: 'MIRANDA', padrino: 'FVF' },
  { id: 'camp-mir-93', name: 'C.E.N. Mariano Picón Salas', location: 'Petare, Edo. Miranda', state: 'MIRANDA', padrino: 'MINISTERIO DEL PODER POPULAR PARA EL DESARROLLO MINERO ECOLÓGICO E INDUSTRIAS BÁSICAS' },
  { id: 'camp-mir-94', name: 'E.T.I. Leonardo Infante', location: 'Petare, Edo. Miranda', state: 'MIRANDA', padrino: 'MINISTERIO DEL PODER POPULAR PARA EL DESARROLLO MINERO ECOLÓGICO E INDUSTRIAS BÁSICAS' },
  { id: 'camp-mir-95', name: 'U.E.N. José de Jesús Arocha', location: 'Petare, Edo. Miranda', state: 'MIRANDA', padrino: 'MINISTERIO DE ENERGÍA ELÉCTRICA' },
  { id: 'camp-mir-96', name: 'U.E.N. Rafael Napoleón Baute', location: 'Petare, Edo. Miranda', state: 'MIRANDA', padrino: 'SUDEBAN' },

  // --- ARAGUA (10 campamentos) ---
  { id: 'camp-ara-97', name: 'Sede Gobernación', location: 'Girardot, Edo. Aragua', state: 'ARAGUA', padrino: 'GOBERNACIÓN DE ARAGUA' },
  { id: 'camp-ara-98', name: 'Sede Alcaldia Girardot', location: 'Girardot, Edo. Aragua', state: 'ARAGUA', padrino: 'ALCALDÍA GIRARDOT' },
  { id: 'camp-ara-99', name: 'Sede Alcaldia Mariño', location: 'Mariño, Edo. Aragua', state: 'ARAGUA', padrino: 'ALCALDÍA MARIÑO' },
  { id: 'camp-ara-100', name: 'E.B. Portachuelo', location: 'Tovar, Edo. Aragua', state: 'ARAGUA', padrino: 'GOBERNACIÓN DE ARAGUA' },
  { id: 'camp-ara-101', name: 'E.B. Las Hernandez', location: 'Tovar, Edo. Aragua', state: 'ARAGUA', padrino: 'GOBERNACIÓN DE ARAGUA' },
  { id: 'camp-ara-102', name: 'E.B. Las Peonias', location: 'Tovar, Edo. Aragua', state: 'ARAGUA', padrino: 'GOBERNACIÓN DE ARAGUA' },
  { id: 'camp-ara-103', name: 'E.B. Santa Ana', location: 'Tovar, Edo. Aragua', state: 'ARAGUA', padrino: 'GOBERNACIÓN DE ARAGUA' },
  { id: 'camp-ara-104', name: 'Liceo Paraulata', location: 'Tovar, Edo. Aragua', state: 'ARAGUA', padrino: 'GOBERNACIÓN DE ARAGUA' },
  { id: 'camp-ara-105', name: 'E.B. El Hondon', location: 'Tovar, Edo. Aragua', state: 'ARAGUA', padrino: 'GOBERNACIÓN DE ARAGUA' },
  { id: 'camp-ara-106', name: 'Sinifin (Casa Bodega)', location: 'Tovar, Edo. Aragua', state: 'ARAGUA', padrino: 'GOBERNACIÓN DE ARAGUA' }
];

function mapStateToId(state: RawCamp['state']): string {
  switch (state) {
    case 'LA GUAIRA':
      return 'la_guaira';
    case 'CARACAS':
      return 'distrito_capital';
    case 'MIRANDA':
      return 'miranda';
    case 'ARAGUA':
      return 'aragua';
  }
}

/**
 * Mapeo completo a la entidad Campamento con indicadores operacionales y de aforo
 */
export const FULL_CAMPAMENTOS_LIST: Campamento[] = DEFAULT_CAMPS.map((camp, index) => {
  const estado_id = mapStateToId(camp.state);

  // Capacidades base específicas para los campamentos con censo real cargado
  if (camp.id === 'la_guaira') {
    return {
      id: 'la_guaira',
      estado_id: 'la_guaira',
      nombre: camp.name,
      ubicacion_detallada: camp.location,
      padrino_institucional: camp.padrino,
      director_responsable: 'C/N Orlando Sánchez',
      telefono_contacto: '0412-1234567',
      capacidad_habitaciones_total: 35,
      capacidad_camas_total: 180,
      capacidad_carpas_total: 25,
      capacidad_modulos_total: 12,
      habitaciones_ocupadas: 30,
      camas_ocupadas: 167,
      carpas_ocupadas: 18,
      modulos_ocupados: 10,
      es_instalacion_deportiva: true,
      tipo_instalacion_deportiva: 'Complejo Educativo Deportivo (Starlink Activo)',
      created_at: '2026-07-01T08:00:00Z',
      updated_at: '2026-08-10T11:23:18Z',
    };
  }

  if (camp.id === 'juan_german_roscio') {
    return {
      id: 'juan_german_roscio',
      estado_id: 'la_guaira',
      nombre: camp.name,
      ubicacion_detallada: camp.location,
      padrino_institucional: camp.padrino,
      director_responsable: 'Coordinador de Guardia (Zona Educativa)',
      telefono_contacto: '+58 414-9177854',
      capacidad_habitaciones_total: 45,
      capacidad_camas_total: 260,
      capacidad_carpas_total: 20,
      capacidad_modulos_total: 15,
      habitaciones_ocupadas: 40,
      camas_ocupadas: 242,
      carpas_ocupadas: 15,
      modulos_ocupados: 12,
      es_instalacion_deportiva: true,
      tipo_instalacion_deportiva: 'Pabellón Polideportivo y Aulas Integrales',
      created_at: '2026-07-01T08:00:00Z',
      updated_at: '2026-08-10T11:23:18Z',
    };
  }

  // Estimaciones realistas para los demás campamentos de contingencia
  const totalCamas = 80 + (index % 12) * 10;
  const camasOcupadas = Math.round(totalCamas * (0.65 + ((index % 5) * 0.05)));

  return {
    id: camp.id,
    estado_id,
    nombre: camp.name,
    ubicacion_detallada: camp.location,
    padrino_institucional: camp.padrino,
    director_responsable: `Comisionado Regional (${camp.padrino.slice(0, 22)})`,
    telefono_contacto: `+58 41${(index % 6) + 2}-555${(1000 + index).toString().slice(1)}`,
    capacidad_habitaciones_total: Math.round(totalCamas / 4),
    capacidad_camas_total: totalCamas,
    capacidad_carpas_total: 15,
    capacidad_modulos_total: 8,
    habitaciones_ocupadas: Math.round(camasOcupadas / 4),
    camas_ocupadas: camasOcupadas,
    carpas_ocupadas: Math.round(15 * 0.7),
    modulos_ocupados: 6,
    es_instalacion_deportiva: camp.name.toLowerCase().includes('deport') ||
      camp.name.toLowerCase().includes('estadio') ||
      camp.name.toLowerCase().includes('base') ||
      camp.name.toLowerCase().includes('gimnasio') ||
      camp.name.toLowerCase().includes('polideportivo'),
    tipo_instalacion_deportiva: camp.name.toLowerCase().includes('polideportivo')
      ? 'Polideportivo Regional'
      : camp.name.toLowerCase().includes('liceo') || camp.name.toLowerCase().includes('escuela')
      ? 'Canchas de Usos Múltiples Escolares'
      : 'Módulo Transitorio Deportivo',
    created_at: '2026-07-01T08:00:00Z',
    updated_at: '2026-08-10T08:00:00Z',
  };
});
