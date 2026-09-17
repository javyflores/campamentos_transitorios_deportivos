/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * Módulo de Integración con Google Gemini AI (@google/genai)
 */

import { GoogleGenAI } from '@google/genai';
import { UserRole } from '../types';

let aiClient: GoogleGenAI | null = null;

/**
 * Inicialización perezosa (lazy) del cliente GoogleGenAI
 */
export function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface GeminiChatOptions {
  prompt: string;
  role?: UserRole;
  context?: string;
}

export interface GeminiChatResponse {
  reply: string;
  modelUsed: string;
  isFallback: boolean;
  timestamp: string;
}

/**
 * Genera una respuesta institucional del Asistente Virtual para los Campamentos Deportivos.
 * Utiliza el modelo 'gemini-3.8-flash' con directivas estrictas de confidencialidad LOPNNA.
 */
export async function generateOperationalChat({
  prompt,
  role = 'Administrador',
  context,
}: GeminiChatOptions): Promise<GeminiChatResponse> {
  const ai = getGeminiClient();

  // Si no hay API key configurada, suministramos una respuesta analítica local institucional
  if (!ai) {
    return {
      reply: `[Modo Asistente Institucional Local MinDeporte - Clave GEMINI_API_KEY no detectada]:
He procesado su solicitud: "${prompt}".

**Resumen Operativo de Emergencia:**
- **Sedes y Capacidad:** 8 campamentos deportivos activos en La Guaira, Caracas, Miranda y Aragua, con aforo global supervisado.
- **Protección Social:** Núcleos familiares censados con prioridad de resguardo para Niños, Niñas y Adolescentes (LOPNNA Art. 65).
- **Alto Rendimiento:** Reserva y captación de talentos juveniles en atletismo, fútbol, béisbol y gimnasia.
- **Logística:** Dotación de botiquines e insumos y rutas de transporte terrestre Yutong programadas.

*(Para habilitar el motor conversacional predictivo de Gemini 3.8 Flash, configure la variable GEMINI_API_KEY en las opciones del entorno).*`,
      modelUsed: 'local-institutional-fallback',
      isFallback: true,
      timestamp: new Date().toISOString(),
    };
  }

  const systemInstruction = `
Eres el Asistente Técnico y Estratégico Oficial del Ministerio del Poder Popular para el Deporte de la República Bolivariana de Venezuela.
Tu misión es asistir a directores, comisionados, médicos, entrenadores y coordinadores de logística en la gestión de los "Campamentos Transitorios Deportivos" ante contingencias habitacionales y desarrollo deportivo nacional.

DIRECTIVAS OBLIGATORIAS:
1. Respetar estrictamente la Ley Orgánica para la Protección de Niños, Niñas y Adolescentes (LOPNNA - Art. 65). Jamás expongas datos clínicos reservados ni identidades completas de menores a roles no autorizados.
2. Tu lenguaje debe ser formal, técnico, institucional, objetivo y cortés.
3. Responde siempre con estructura limpia usando formato Markdown (títulos claros, viñetas, tablas cuando sea oportuno y recomendaciones de acción inmediata).
4. Basa tus análisis en el estado en tiempo real del sistema provisto a continuación.

DATOS EN TIEMPO REAL DEL SISTEMA MINDEPORTE:
${context || 'No se suministró contexto adicional.'}

ROL DEL FUNCIONARIO QUE CONSULTA: ${role}
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const reply = response.text || 'No se pudo generar respuesta.';

    return {
      reply,
      modelUsed: 'gemini-3.8-flash',
      isFallback: false,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Gemini API Error]:', error);
    return {
      reply: `[Aviso de Contingencia Técnica]: Ocurrió una interrupción al consultar el modelo de IA: ${error.message}. Por favor intente nuevamente o consulte directamente los módulos de datos del sistema.`,
      modelUsed: 'error-fallback',
      isFallback: true,
      timestamp: new Date().toISOString(),
    };
  }
}
