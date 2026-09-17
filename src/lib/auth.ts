/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Módulo de Control de Acceso Basado en Roles (RBAC) y
 * Ofuscación de Datos Sensibles de Niños, Niñas y Adolescentes (NNA - LOPNNA).
 */

import { UserRole, Integrante } from '../types';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  institution: string;
}

export const DEFAULT_SESSION: UserSession = {
  id: 'usr-admin-01',
  name: 'Prof. Carlos Mendoza',
  role: 'Administrador',
  institution: 'Ministerio del Poder Popular para el Deporte',
};

export const AVAILABLE_ROLES: { role: UserRole; label: string; description: string }[] = [
  {
    role: 'Administrador',
    label: 'Administrador General',
    description: 'Acceso total de lectura, edición y auditoría institucional.',
  },
  {
    role: 'Proteccion_NNA',
    label: 'Defensoría / Protección NNA',
    description: 'Acceso sin censura a datos de menores, notas de protección y patologías sensibles.',
  },
  {
    role: 'Entrenador',
    label: 'Cuerpo Técnico y Entrenador',
    description: 'Gestión de evaluaciones biométricas, IMC, talentos y dotación deportiva.',
  },
  {
    role: 'Logistica',
    label: 'Coordinador de Logística',
    description: 'Control de inventario, dotación de uniformes y rutas de transporte Yutong.',
  },
  {
    role: 'Consultor',
    label: 'Consultor Institucional',
    description: 'Solo lectura. Diseñado para generación de reportes y difusión vía WhatsApp.',
  },
  {
    role: 'Analista',
    label: 'Analista de Datos',
    description: 'Carga masiva, validación de censos y auditoría de perfiles.',
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  Administrador: 'Administrador General',
  Proteccion_NNA: 'Defensoría / Protección NNA',
  Entrenador: 'Cuerpo Técnico y Entrenador',
  Logistica: 'Coordinador de Logística',
  Consultor: 'Consultor Institucional',
  Analista: 'Analista de Datos',
};

export const INSTITUTIONAL_USERS: Array<{
  keys: string[];
  role: UserRole;
  name: string;
  institution: string;
}> = [
  {
    keys: ['admin@mindeporte.gob.ve', 'v-14567890', 'admin', 'carlos.mendoza@mindeporte.gob.ve', 'carlos'],
    role: 'Administrador',
    name: 'Prof. Carlos Mendoza',
    institution: 'Director General de Operaciones',
  },
  {
    keys: ['proteccion@mindeporte.gob.ve', 'proteccion.nna@mindeporte.gob.ve', 'v-18234567', 'proteccion', 'defensoria', 'elena.alfonzo@mindeporte.gob.ve'],
    role: 'Proteccion_NNA',
    name: 'Dra. Elena Alfonzo',
    institution: 'Defensoría Especial NNA - MinDeporte',
  },
  {
    keys: ['entrenador@mindeporte.gob.ve', 'v-16987456', 'entrenador', 'reinaldo.gomez@mindeporte.gob.ve'],
    role: 'Entrenador',
    name: 'Prof. Reinaldo Gómez',
    institution: 'Cuerpo Técnico y Alto Rendimiento',
  },
  {
    keys: ['logistica@mindeporte.gob.ve', 'v-15874123', 'logistica', 'transporte', 'marcos.rondon@mindeporte.gob.ve'],
    role: 'Logistica',
    name: 'Ing. Marcos Rondón',
    institution: 'Coordinación de Logística y Rutas Yutong',
  },
  {
    keys: ['consultor@mindeporte.gob.ve', 'v-12345678', 'consultor', 'valentina.paez@mindeporte.gob.ve'],
    role: 'Consultor',
    name: 'Lic. Valentina Páez',
    institution: 'Consultoría y Enlace Institucional',
  },
  {
    keys: ['analista@mindeporte.gob.ve', 'v-19876543', 'analista', 'censo', 'roberto.blanco@mindeporte.gob.ve'],
    role: 'Analista',
    name: 'Lcdo. Roberto Blanco',
    institution: 'Analista de Censo y Estadística',
  },
];

export function resolveUserSession(identifier: string): UserSession {
  const clean = identifier.trim().toLowerCase();
  const found = INSTITUTIONAL_USERS.find((u) =>
    u.keys.some((k) => clean === k.toLowerCase() || clean.includes(k.toLowerCase()))
  );

  if (found) {
    return {
      id: `usr-${found.role.toLowerCase()}-${Date.now()}`,
      name: found.name,
      role: found.role,
      institution: found.institution,
    };
  }

  if (clean.includes('proteccion') || clean.includes('nna') || clean.includes('defens')) {
    return {
      id: `usr-nna-${Date.now()}`,
      name: 'Especialista de Protección NNA',
      role: 'Proteccion_NNA',
      institution: 'Defensoría Delegada MinDeporte',
    };
  }
  if (clean.includes('entrenador') || clean.includes('tecnico') || clean.includes('deporte')) {
    return {
      id: `usr-coach-${Date.now()}`,
      name: 'Entrenador Técnico Nacional',
      role: 'Entrenador',
      institution: 'Cuerpo Técnico MinDeporte',
    };
  }
  if (clean.includes('logistica') || clean.includes('transporte') || clean.includes('yutong')) {
    return {
      id: `usr-log-${Date.now()}`,
      name: 'Coordinador de Logística y Movilización',
      role: 'Logistica',
      institution: 'Dirección de Logística MinDeporte',
    };
  }
  if (clean.includes('consultor') || clean.includes('institucional')) {
    return {
      id: `usr-cons-${Date.now()}`,
      name: 'Consultor Institucional Externo',
      role: 'Consultor',
      institution: 'Enlace Interinstitucional MinDeporte',
    };
  }
  if (clean.includes('analista') || clean.includes('censo') || clean.includes('data')) {
    return {
      id: `usr-ana-${Date.now()}`,
      name: 'Analista de Sistemas de Información',
      role: 'Analista',
      institution: 'Dirección de Estadística MinDeporte',
    };
  }

  const displayName = clean.includes('@') ? clean.split('@')[0] : clean;
  return {
    id: `usr-adm-${Date.now()}`,
    name: displayName.length > 2 ? `Func. ${displayName.toUpperCase()}` : 'Prof. Carlos Mendoza',
    role: 'Administrador',
    institution: 'Ministerio del Poder Popular para el Deporte',
  };
}

/**
 * Determina si el rol tiene autorización legal para ver datos desofuscados de NNA.
 */
export function canViewSensitiveNNA(role: UserRole): boolean {
  return role === 'Administrador' || role === 'Proteccion_NNA';
}

/**
 * Determina si el rol puede editar fichas deportivas y antropometría.
 */
export function canEditSports(role: UserRole): boolean {
  return role === 'Administrador' || role === 'Entrenador';
}

/**
 * Determina si el rol puede gestionar inventario y rutas de transporte.
 */
export function canManageLogistics(role: UserRole): boolean {
  return role === 'Administrador' || role === 'Logistica';
}

/**
 * Determina si el rol puede realizar modificaciones en las fichas familiares.
 */
export function canEditCensus(role: UserRole): boolean {
  return role === 'Administrador' || role === 'Proteccion_NNA' || role === 'Analista';
}

/**
 * Ofusca el nombre completo si es NNA y el rol no cuenta con permiso explícito.
 * Protege la identidad según la Ley Orgánica para la Protección de Niños, Niñas y Adolescentes (LOPNNA).
 */
export function ofuscarNombre(nombre: string, esNNA?: boolean, role: UserRole = 'Administrador'): string {
  if (!esNNA || canViewSensitiveNNA(role)) {
    return nombre;
  }
  const partes = nombre.trim().split(/\s+/);
  return partes
    .map((p) => (p.length > 2 ? `${p[0]}${'*'.repeat(Math.min(4, p.length - 1))}` : `${p[0]}*`))
    .join(' ') + ' (NNA Protegido)';
}

/**
 * Ofusca la cédula de identidad para roles que no son administradores ni protección NNA.
 */
export function ofuscarCedula(cedula?: string, esNNA?: boolean, role: UserRole = 'Administrador'): string {
  if (!cedula) return 'Sin documento';
  if (!esNNA || canViewSensitiveNNA(role)) {
    return cedula;
  }
  if (cedula.length <= 4) return 'V-***';
  const prefix = cedula.slice(0, 3);
  const suffix = cedula.slice(-2);
  return `${prefix}****${suffix}`;
}

/**
 * Ofusca datos de patologías o notas de protección médica/legal.
 */
export function ofuscarDatoSensible(texto?: string, esNNA?: boolean, role: UserRole = 'Administrador'): string {
  if (!texto) return 'Ninguna';
  if (!esNNA || canViewSensitiveNNA(role)) {
    return texto;
  }
  return '🔒 [RESERVADO: Art. 65 LOPNNA - Confidencial]';
}

/**
 * Filtra y ofusca un integrante individual si es NNA y el usuario no tiene permisos LOPNNA.
 */
export function filtrarIntegrantePorRol(integrante: Integrante, role: UserRole = 'Administrador'): Integrante {
  if (!integrante.es_nna || canViewSensitiveNNA(role)) {
    return integrante;
  }

  return {
    ...integrante,
    nombre_completo: ofuscarNombre(integrante.nombre_completo, true, role),
    cedula_identidad: ofuscarCedula(integrante.cedula_identidad, true, role),
    patologia: ofuscarDatoSensible(integrante.patologia, true, role),
    medicamentos_requeridos: ofuscarDatoSensible(integrante.medicamentos_requeridos, true, role),
    notas_proteccion_nna: ofuscarDatoSensible(integrante.notas_proteccion_nna, true, role),
  };
}

/**
 * Extrae el rol del usuario desde la petición HTTP (headers, query o body)
 */
export function extractUserRole(req: any): UserRole {
  const headerRole = req.headers?.['x-user-role'] as string | undefined;
  const queryRole = req.query?.userRole as string | undefined;
  const bodyRole = req.body?.userRole as string | undefined;

  const candidate = (headerRole || queryRole || bodyRole || '') as UserRole;
  const validRoles: UserRole[] = [
    'Administrador',
    'Proteccion_NNA',
    'Entrenador',
    'Logistica',
    'Consultor',
    'Analista',
  ];

  if (validRoles.includes(candidate)) {
    return candidate;
  }
  return 'Administrador'; // Por defecto acceso operativo
}

/**
 * Middleware Express para RBAC: verifica que el rol tenga permiso para la ruta
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: any, res: any, next: any) => {
    const userRole = req.userRole || extractUserRole(req);
    req.userRole = userRole;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Acceso Denegado (RBAC)',
        message: `El rol "${userRole}" no cuenta con los privilegios requeridos para esta operación.`,
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
}

