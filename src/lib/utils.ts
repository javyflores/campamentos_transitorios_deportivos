/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Funciones de utilidad institucional, cálculos biométricos y formateo de datos.
 */

/**
 * Calcula el Índice de Masa Corporal (IMC) con dos decimales.
 * @param pesoKg Peso en kilogramos.
 * @param estaturaCm Estatura en centímetros.
 */
export function calcularIMC(pesoKg: number, estaturaCm: number): number {
  if (!pesoKg || !estaturaCm || estaturaCm <= 0) return 0;
  const estaturaMetros = estaturaCm / 100;
  const imc = pesoKg / (estaturaMetros * estaturaMetros);
  return Math.round(imc * 100) / 100;
}

/**
 * Clasifica el IMC según los estándares biomédicos de la OMS.
 */
export function clasificarIMC(imc: number): {
  categoria: string;
  color: string;
  badge: 'normal' | 'warning' | 'danger';
} {
  if (imc <= 0) return { categoria: 'Sin evaluar', color: 'text-slate-400', badge: 'normal' };
  if (imc < 18.5) return { categoria: 'Bajo peso', color: 'text-amber-600 dark:text-amber-400', badge: 'warning' };
  if (imc < 25.0) return { categoria: 'Peso normal', color: 'text-emerald-600 dark:text-emerald-400', badge: 'normal' };
  if (imc < 30.0) return { categoria: 'Sobrepeso', color: 'text-orange-600 dark:text-orange-400', badge: 'warning' };
  return { categoria: 'Obesidad', color: 'text-rose-600 dark:text-rose-400', badge: 'danger' };
}

/**
 * Formatea una fecha ISO a formato institucional legible en español.
 */
export function formatearFecha(fechaStr?: string | null): string {
  if (!fechaStr) return 'No registrada';
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;
    return d.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return fechaStr;
  }
}

/**
 * Formatea fecha y hora completa.
 */
export function formatearFechaHora(fechaStr?: string | null): string {
  if (!fechaStr) return 'No registrada';
  try {
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;
    return d.toLocaleString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fechaStr;
  }
}

/**
 * Formatea un número de cédula con separador de miles.
 */
export function formatearCedula(cedula?: string): string {
  if (!cedula) return 'Sin Cédula';
  const match = cedula.match(/^([VEJP])-?(\d+)$/i);
  if (match) {
    const tipo = match[1].toUpperCase();
    const num = Number(match[2]).toLocaleString('es-VE');
    return `${tipo}-${num}`;
  }
  return cedula;
}

/**
 * Calcula porcentaje seguro de ocupación evitando divisiones entre cero.
 */
export function calcularPorcentaje(ocupado: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((ocupado / total) * 100));
}

/**
 * Genera un texto formateado del resumen de campamento para compartir vía WhatsApp.
 */
export function generarReporteWhatsApp(titulo: string, datos: Record<string, string | number>): string {
  let mensaje = `*MINISTERIO DEL PODER POPULAR PARA EL DEPORTE*\n`;
  mensaje += `*Reporte Institucional: ${titulo}*\n`;
  mensaje += `_Fecha: ${new Date().toLocaleDateString('es-VE')}_\n`;
  mensaje += `------------------------------------\n`;
  for (const [clave, valor] of Object.entries(datos)) {
    mensaje += `• *${clave}:* ${valor}\n`;
  }
  mensaje += `------------------------------------\n`;
  mensaje += `_Sistema de Campamentos Transitorios Deportivos_`;
  return encodeURIComponent(mensaje);
}

/**
 * Exporta datos a un archivo CSV estructurado con codificación UTF-8 BOM compatible con Microsoft Excel.
 */
export function exportarCSV(
  nombreArchivo: string,
  encabezados: string[],
  filas: (string | number | boolean | null | undefined)[][]
): void {
  const sanitize = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = encabezados.map(sanitize).join(';');
  const dataLines = filas.map((row) => row.map(sanitize).join(';'));
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
