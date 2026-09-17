/**
 * @license
 * SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
 * Ministerio del Poder Popular para el Deporte - República Bolivariana de Venezuela
 * Servidor Backend Full-Stack Express con endpoints REST, RBAC institucional y Asistente Gemini AI.
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './src/lib/db';
import {
  extractUserRole,
  requireRole,
  filtrarIntegrantePorRol,
  AVAILABLE_ROLES,
  DEFAULT_SESSION,
} from './src/lib/auth';
import { generateOperationalChat } from './src/lib/gemini';
import { UserRole } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Middleware para asociar automáticamente el rol del usuario en cada petición
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).userRole = extractUserRole(req);
  next();
});

// ==========================================
// 1. ENDPOINTS DE SALUD Y CONTROL INSTITUCIONAL
// ==========================================

// Endpoint de diagnóstico del servidor
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Campamentos Transitorios Deportivos - MinDeporte',
    version: '4.0.0-FASE4',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Endpoints de autenticación y roles RBAC
app.get('/api/auth/roles', (req: Request, res: Response) => {
  res.json({ roles: AVAILABLE_ROLES });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const currentRole = (req as any).userRole as UserRole;
  res.json({
    ...DEFAULT_SESSION,
    role: currentRole,
  });
});

// ==========================================
// 2. ENDPOINTS REST: CAMPAMENTOS
// ==========================================

app.get('/api/campamentos', async (req: Request, res: Response) => {
  try {
    const estadoId = req.query.estadoId as string | undefined;
    const data = await db.getCampamentos(estadoId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/campamentos/:id', async (req: Request, res: Response) => {
  try {
    const item = await db.getCampamentoById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Campamento no encontrado' });
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/campamentos',
  requireRole(['Administrador']),
  async (req: Request, res: Response) => {
    try {
      const item = await db.saveCampamento(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/campamentos/:id',
  requireRole(['Administrador']),
  async (req: Request, res: Response) => {
    try {
      const item = await db.saveCampamento({ ...req.body, id: req.params.id });
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/campamentos/:id',
  requireRole(['Administrador']),
  async (req: Request, res: Response) => {
    try {
      const deleted = await db.deleteCampamento(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Campamento no encontrado para eliminar' });
      }
      res.json({ success: true, message: 'Campamento eliminado correctamente' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==========================================
// 3. ENDPOINTS REST: FAMILIAS CENSO
// ==========================================

app.get('/api/familias', async (req: Request, res: Response) => {
  try {
    const campamentoId = req.query.campamentoId as string | undefined;
    const data = await db.getFamilias(campamentoId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/familias/:id', async (req: Request, res: Response) => {
  try {
    const item = await db.getFamiliaById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Familia no encontrada' });
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/familias',
  requireRole(['Administrador', 'Proteccion_NNA', 'Analista']),
  async (req: Request, res: Response) => {
    try {
      const item = await db.saveFamilia(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/familias/:id',
  requireRole(['Administrador', 'Proteccion_NNA', 'Analista']),
  async (req: Request, res: Response) => {
    try {
      const item = await db.saveFamilia({ ...req.body, id: req.params.id });
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/familias/:id',
  requireRole(['Administrador']),
  async (req: Request, res: Response) => {
    try {
      const deleted = await db.deleteFamilia(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Familia no encontrada para eliminar' });
      }
      res.json({ success: true, message: 'Familia eliminada correctamente' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==========================================
// 4. ENDPOINTS REST: INTEGRANTES (CON FILTRADO LOPNNA)
// ==========================================

app.get('/api/integrantes', async (req: Request, res: Response) => {
  try {
    const familiaId = req.query.familiaId as string | undefined;
    const esNnaParam = req.query.esNna as string | undefined;
    const userRole = (req as any).userRole as UserRole;

    let data = await db.getIntegrantes(familiaId);

    if (esNnaParam !== undefined) {
      const wantsNna = esNnaParam === 'true';
      data = data.filter((i) => i.es_nna === wantsNna);
    }

    // Filtrar/Ofuscar datos sensibles de menores según el rol LOPNNA
    const sanitizedData = data.map((item) => filtrarIntegrantePorRol(item, userRole));
    res.json(sanitizedData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/integrantes/:id', async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).userRole as UserRole;
    const item = await db.getIntegranteById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Integrante no encontrado' });
    }
    res.json(filtrarIntegrantePorRol(item, userRole));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/integrantes',
  requireRole(['Administrador', 'Proteccion_NNA', 'Analista']),
  async (req: Request, res: Response) => {
    try {
      const item = await db.saveIntegrante(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/integrantes/:id',
  requireRole(['Administrador', 'Proteccion_NNA', 'Analista']),
  async (req: Request, res: Response) => {
    try {
      const item = await db.saveIntegrante({ ...req.body, id: req.params.id });
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/integrantes/:id',
  requireRole(['Administrador']),
  async (req: Request, res: Response) => {
    try {
      const deleted = await db.deleteIntegrante(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Integrante no encontrado para eliminar' });
      }
      res.json({ success: true, message: 'Integrante eliminado correctamente' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==========================================
// 5. ENDPOINTS REST: PERFILES DEPORTIVOS
// ==========================================

app.get(['/api/perfiles', '/api/perfiles-deportivos'], async (req: Request, res: Response) => {
  try {
    const disciplina = req.query.disciplina as string | undefined;
    const soloTalentos = req.query.talentos === 'true';

    let data = await db.getPerfiles();

    if (disciplina) {
      data = data.filter((p) => p.disciplina_principal.toLowerCase() === disciplina.toLowerCase());
    }
    if (soloTalentos) {
      data = data.filter((p) => p.posee_talento_destacado);
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get(['/api/perfiles/:id', '/api/perfiles-deportivos/:id'], async (req: Request, res: Response) => {
  try {
    const item = await db.getPerfilById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Perfil deportivo no encontrado' });
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/perfiles',
  requireRole(['Administrador', 'Entrenador']),
  async (req: Request, res: Response) => {
    try {
      const item = await db.savePerfil(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/perfiles/:id',
  requireRole(['Administrador', 'Entrenador']),
  async (req: Request, res: Response) => {
    try {
      const item = await db.savePerfil({ ...req.body, id: req.params.id });
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/perfiles/:id',
  requireRole(['Administrador']),
  async (req: Request, res: Response) => {
    try {
      const deleted = await db.deletePerfil(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Perfil no encontrado para eliminar' });
      }
      res.json({ success: true, message: 'Perfil deportivo eliminado' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==========================================
// 6. ENDPOINTS REST: INVENTARIO DEPORTIVO
// ==========================================

app.get('/api/inventario', async (req: Request, res: Response) => {
  try {
    const campamentoId = req.query.campamentoId as string | undefined;
    const data = await db.getInventario(campamentoId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/inventario/:id', async (req: Request, res: Response) => {
  try {
    const item = await db.getInventarioById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Insumo de inventario no encontrado' });
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/inventario',
  requireRole(['Administrador', 'Logistica']),
  async (req: Request, res: Response) => {
    try {
      const item = await db.saveInventario(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/inventario/:id',
  requireRole(['Administrador', 'Logistica']),
  async (req: Request, res: Response) => {
    try {
      const item = await db.saveInventario({ ...req.body, id: req.params.id });
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/inventario/:id',
  requireRole(['Administrador']),
  async (req: Request, res: Response) => {
    try {
      const deleted = await db.deleteInventario(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Item de inventario no encontrado' });
      }
      res.json({ success: true, message: 'Insumo eliminado del inventario' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==========================================
// 7. ENDPOINTS REST: RUTAS Y PASAJEROS
// ==========================================

app.get('/api/rutas', async (req: Request, res: Response) => {
  try {
    const data = await db.getRutas();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rutas/:id', async (req: Request, res: Response) => {
  try {
    const item = await db.getRutaById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/rutas',
  requireRole(['Administrador', 'Logistica']),
  async (req: Request, res: Response) => {
    try {
      const item = await db.saveRuta(req.body);
      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/rutas/:id',
  requireRole(['Administrador', 'Logistica']),
  async (req: Request, res: Response) => {
    try {
      const item = await db.saveRuta({ ...req.body, id: req.params.id });
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/rutas/:id',
  requireRole(['Administrador']),
  async (req: Request, res: Response) => {
    try {
      const deleted = await db.deleteRuta(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Ruta no encontrada' });
      }
      res.json({ success: true, message: 'Ruta de transporte eliminada' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Pasajeros
app.get('/api/pasajeros', async (req: Request, res: Response) => {
  try {
    const rutaId = req.query.rutaId as string | undefined;
    const data = await db.getPasajeros(rutaId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/rutas/:rutaId/asistencia',
  requireRole(['Administrador', 'Logistica']),
  async (req: Request, res: Response) => {
    try {
      const { rutaId } = req.params;
      const { integranteId } = req.body;
      const confirmed = await db.toggleAsistenciaPasajero(rutaId, integranteId);
      res.json({ success: true, confirmed });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.post(
  '/api/rutas/:rutaId/pasajeros',
  requireRole(['Administrador', 'Logistica']),
  async (req: Request, res: Response) => {
    try {
      const { rutaId } = req.params;
      const item = await db.addPasajero({
        id: req.body.id || `pas_${Date.now()}`,
        ruta_id: rutaId,
        integrante_id: req.body.integrante_id,
        asistencia_confirmada: req.body.asistencia_confirmada ?? false,
        asiento_numero: req.body.asiento_numero ?? (req.body.asiento_asignado ? Number(req.body.asiento_asignado) : undefined),
      });
      res.status(201).json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/rutas/:rutaId/pasajeros/:integranteId',
  requireRole(['Administrador', 'Logistica']),
  async (req: Request, res: Response) => {
    try {
      const { rutaId, integranteId } = req.params;
      const deleted = await db.deletePasajero(rutaId, integranteId);
      res.json({ success: deleted });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==========================================
// 8. ENDPOINTS REST: ALERTAS OPERATIVAS
// ==========================================

app.get('/api/alerts', async (req: Request, res: Response) => {
  try {
    const alerts = await db.getAlertas();
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. ENDPOINTS REST: REPORTES Y BOLETINES
// ==========================================

app.get('/api/reports/bulletin', async (req: Request, res: Response) => {
  try {
    const summary = db.getGlobalStateSummary();
    res.json({
      summary,
      timestamp: new Date().toISOString(),
      institution: 'Ministerio del Poder Popular para el Deporte',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/reports/stats', async (req: Request, res: Response) => {
  try {
    const campamentos = await db.getCampamentos();
    const familias = await db.getFamilias();
    const integrantes = await db.getIntegrantes();
    const perfiles = await db.getPerfiles();
    const inventario = await db.getInventario();
    const rutas = await db.getRutas();

    const totalCamas = campamentos.reduce((acc, c) => acc + c.capacidad_camas_total, 0);
    const camasOcupadas = campamentos.reduce((acc, c) => acc + c.camas_ocupadas, 0);
    const totalNNA = integrantes.filter((i) => i.es_nna).length;
    const totalTalentos = perfiles.filter((p) => p.posee_talento_destacado).length;

    res.json({
      campamentosCount: campamentos.length,
      familiasCount: familias.length,
      integrantesCount: integrantes.length,
      nnaCount: totalNNA,
      talentosCount: totalTalentos,
      totalCamas,
      camasOcupadas,
      porcentajeOcupacion: totalCamas > 0 ? Math.round((camasOcupadas / totalCamas) * 100) : 0,
      inventarioItems: inventario.length,
      rutasActivas: rutas.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. ENDPOINT DE ASISTENTE VIRTUAL GEMINI AI
// ==========================================

app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { prompt, role, context } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'El campo "prompt" es requerido y debe ser texto.' });
    }

    const userRole = (role as UserRole) || (req as any).userRole || 'Consultor';
    const stateSummary = context || db.getGlobalStateSummary();

    const result = await generateOperationalChat({
      prompt,
      role: userRole,
      context: stateSummary,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error en /api/gemini/chat:', error);
    res.status(500).json({
      error: 'Error al procesar la consulta con el Asistente Gemini.',
      details: error.message,
    });
  }
});

// ==========================================
// 11. VITE MIDDLEWARE / SERVIDOR ESTÁTICO SPA
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MinDeporte] Backend Oficial Fase 4 en ejecución: http://0.0.0.0:${PORT}`);
  });
}

startServer();
