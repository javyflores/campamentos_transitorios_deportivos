# SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
## Ministerio del Poder Popular para el Deporte • Instituto Nacional de Deportes (IND)

[![Tecnología](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20TailwindCSS-002045?style=flat-square)](https://react.dev/)
[![Motor IA](https://img.shields.io/badge/Inteligencia%20Artificial-Google%20Gemini%203.8%20Flash-F59E0B?style=flat-square)](https://ai.google.dev/)
[![Normativa Legal](https://img.shields.io/badge/Protección-LOPNNA%20Art.%2065-10B981?style=flat-square)](https://venezuela.justia.com/federales/leyes-organicas/ley-organica-para-la-proteccion-de-ninos-ninas-y-adolescentes/)
[![Despliegue](https://img.shields.io/badge/Plataforma-Google%20AI%20Studio%20%7C%20Cloud%20Run-2563EB?style=flat-square)](https://cloud.google.com/run)

Plataforma gubernamental integral para el censo unificado, control de aforo en tiempo real, perfilamiento biomecánico de talentos, dotación logística, transporte en convoyes Yutong y resguardo de Niños, Niñas y Adolescentes (NNA) en albergues transitorios ante contingencias nacionales.

---

## 📋 TABLA DE CONTENIDOS
1. [Arquitectura Tecnológica](#-arquitectura-tecnológica)
2. [Requisitos Previos de Instalación](#-requisitos-previos-de-instalación)
3. [Instalación y Puesta en Marcha Local](#-instalación-y-puesta-en-marcha-local)
4. [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
5. [Guía de Sincronización con Google Sheets](#-guía-de-sincronización-con-google-sheets)
6. [Guía de Sincronización con Firebase Firestore](#-guía-de-sincronización-con-firebase-firestore)
7. [Despliegue en Google AI Studio y GitHub](#-despliegue-en-google-ai-studio-y-github)
8. [Matriz de Seguridad RBAC y Cumplimiento LOPNNA (Art. 65)](#-matriz-de-seguridad-rbac-y-cumplimiento-lopnna-art-65)
9. [Estructura del Proyecto](#-estructura-del-proyecto)

---

## 🏛️ ARQUITECTURA TECNOLÓGICA

El sistema opera bajo una arquitectura desacoplada full-stack moderna y segura:

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React, Lucide Icons, React Markdown.
- **Backend Proxy & Middleware:** Node.js + Express con integración de middleware Vite para desarrollo y empaquetado optimizado en CJS con `esbuild` para producción.
- **Seguridad de API Keys:** Aislamiento estricto de credenciales en el servidor (`server.ts`). Ninguna clave de API es expuesta al navegador.
- **Motor de Inteligencia Artificial:** `@google/genai` utilizando el modelo de última generación **Gemini 3.8 Flash**, con inyección contextual en tiempo real del estado de los 8 campamentos.
- **Persistencia de Datos Híbrida:** Almacenamiento local reactivo (Offline-First / IndexedDB / LocalStorage) con adaptadores de exportación/importación para PostgreSQL 16+ y Firestore.
- **Acreditación QR Criptográfica:** Generación de Códigos QR con firma de verificación SHA-256 para validación instantánea en canchas y puntos de control sin conexión a internet.

---

## 💻 REQUISITOS PREVIOS DE INSTALACIÓN

- **Node.js:** Versión 18.x, 20.x o superior LTS.
- **NPM:** Versión 9.x o superior (incluido con Node.js).
- **Git:** Versión 2.30+ para clonación y versionamiento.
- **Navegador Web Moderno:** Google Chrome, Chromium, Firefox, Edge o Safari con soporte ES2022.
- **Clave API de Google Gemini (Opcional para Asistente IA):** Obtenida gratuitamente en [Google AI Studio](https://aistudio.google.com/).

---

## 🚀 INSTALACIÓN Y PUESTA EN MARCHA LOCAL

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario-o-organizacion/campamentos-deportivos-mindeporte.git
cd campamentos-deportivos-mindeporte
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Configurar el Entorno
Copie el archivo de ejemplo y configure su clave de Gemini:
```bash
cp .env.example .env
```
Edite `.env` y agregue su `GEMINI_API_KEY`:
```env
GEMINI_API_KEY="AIzaSy..."
PORT=3000
```

### Paso 4: Iniciar en Modo Desarrollo
```bash
npm run dev
```
La aplicación estará disponible inmediatamente en `http://localhost:3000`.

### Paso 5: Compilación y Ejecución para Producción
```bash
# Compilar cliente Vite y empaquetar backend Express
npm run build

# Iniciar servidor de producción compilado
npm start
```

---

## 🔑 CONFIGURACIÓN DE VARIABLES DE ENTORNO

El sistema utiliza las siguientes variables definidas en `.env.example`:

| Variable | Tipo | Requerido | Descripción |
|---|---|---|---|
| `GEMINI_API_KEY` | String | Sí (para Asistente IA) | Clave API de Google Gemini obtenida en Google AI Studio. Permanece 100% aislada en `server.ts`. |
| `PORT` | Número | No (Defecto: 3000) | Puerto de enlace del servidor Express (3000 en contenedores Cloud Run). |
| `APP_URL` | String | No | URL pública base de la aplicación para enlaces de retorno y metadatos OpenGraph. |
| `DATABASE_URL` | String | Opcional | Cadena de conexión para PostgreSQL institucional en caso de utilizar base de datos relacional central. |

---

## 📊 GUÍA DE SINCRONIZACIÓN CON GOOGLE SHEETS

Para coordinar con comisiones ministeriales que utilicen hojas de cálculo compartidas en Google Drive:

### Opción A: Exportación Directa desde la Plataforma
1. En el módulo **Reportes y Certificaciones** (`ReportsCertificatesView`), presione el botón **Exportar Base de Datos (CSV/Sheets)**.
2. El sistema descarga un archivo UTF-8 con codificación compatible para Excel y Google Sheets conteniendo los campos estructurados de censo, camas, atletas y alertas LOPNNA.
3. En Google Drive, seleccione **Nuevo > Hojas de cálculo de Google > Archivo > Importar > Subir archivo**.

### Opción B: Sincronización Automática vía Google Apps Script (Webhook)
Cree un script en su Hoja de Cálculo (`Extensiones > Apps Script`):
```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Censo_Campamentos");
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.campamento_nombre,
    data.familia_codigo,
    data.jefe_familia,
    data.total_integrantes,
    data.total_nna,
    data.estatus_vivienda
  ]);
  return ContentService.createTextOutput(JSON.stringify({ "status": "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 🔥 GUÍA DE SINCRONIZACIÓN CON FIREBASE FIRESTORE

Para habilitar persistencia multi-sede en tiempo real con Google Cloud Firestore:

### 1. Esquema de Colecciones Sugerido
- `campamentos/{campamentoId}`: Metadatos, capacidad de camas, aforo y coordenadas.
- `familias/{familiaId}`: Núcleos familiares, procedencia, albergue asignado.
- `integrantes/{integranteId}`: Personas censadas, marcas atléticas, diagnósticos y banderas de protección.
- `perfiles_deportivos/{perfilId}`: Biomecánica, marcas cronometradas y asignación calórica.
- `inventario/{itemId}`: Insumos, dotación de balones, uniformes y alertas de reposición.
- `rutas_transporte/{rutaId}`: Convoyes Yutong, horas de salida y estatus en carretera.
- `pasajeros_ruta/{pasajeroId}`: Manifiestos de embarque y confirmación de abordaje.

### 2. Reglas de Seguridad (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lectura pública de métricas agregadas de aforo
    match /campamentos/{campamentoId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'Administrador';
    }
    
    // Protección estricta de datos de NNA (Art. 65 LOPNNA)
    match /integrantes/{integranteId} {
      allow read: if request.auth != null && 
        (request.auth.token.role in ['Administrador', 'Proteccion_NNA'] || 
         resource.data.es_nna == false);
      allow write: if request.auth != null && 
        request.auth.token.role in ['Administrador', 'Proteccion_NNA'];
    }
    
    // Gestión logística e inventario
    match /inventario/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role in ['Administrador', 'Logistica'];
    }
  }
}
```

---

## ☁️ DESPLIEGUE EN GOOGLE AI STUDIO Y GITHUB

### Exportar y Subir a GitHub
1. En Google AI Studio Build, haga clic en el menú superior derecho (**Settings / Export**).
2. Seleccione **Export to GitHub** o **Download as ZIP**.
3. Si utiliza Git directamente desde la consola:
   ```bash
   git init
   git add .
   git commit -m "feat: Sistema de Campamentos Transitorios Deportivos MinDeporte v1.0.0"
   git branch -M main
   git remote add origin https://github.com/tu-organizacion/campamentos-deportivos-mindeporte.git
   git push -u origin main
   ```

### Despliegue en Google Cloud Run
El proyecto incluye configuración nativa para Cloud Run:
```bash
# Construir imagen de contenedor
gcloud builds submit --tag gcr.io/[PROJECT_ID]/campamentos-deportivos

# Desplegar en Cloud Run con puerto 3000
gcloud run deploy campamentos-deportivos \
  --image gcr.io/[PROJECT_ID]/campamentos-deportivos \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="[TU_GEMINI_KEY]"
```

---

## 🛡️ MATRIZ DE SEGURIDAD RBAC Y CUMPLIMIENTO LOPNNA (ART. 65)

El sistema incorpora un mecanismo criptográfico y lógico de **Control de Acceso Basado en Roles (RBAC)** que aplica **ofuscación automática** de identidad sobre Niños, Niñas y Adolescentes:

| Rol Institucional | Ver Nombres NNA | Editar Censo | Perfil Deportivo | Almacén y Rutas | Consultas IA |
|---|---|---|---|---|---|
| **Administrador General** | Sí (Pleno) | Sí | Sí | Sí | Sí |
| **Defensoría / Protección NNA** | Sí (Pleno) | Sí | Lectura | Lectura | Sí (Especializado) |
| **Cuerpo Técnico / Entrenador** | No (Ofuscado) | No | Sí | Lectura | Sí (Deportivo) |
| **Coordinador de Logística** | No (Ofuscado) | No | No | Sí | Sí (Suministros) |
| **Consultor Institucional** | No (Ofuscado) | No | No | No | Sí (Analítico) |
| **Analista de Datos** | No (Ofuscado) | No | No | No | Sí (Estadístico) |

*En roles no autorizados, el nombre "Juan Pérez Rodríguez (14 años)" se transforma automáticamente en `"J*** P*** R*** (Menor Bajo Protección LOPNNA)"` tanto en pantalla como en exportaciones e impresiones.*

---

## 📁 ESTRUCTURA DEL PROYECTO

```
├── .env.example              # Declaración de variables de entorno requeridas
├── metadata.json             # Metadatos del sistema para Google AI Studio
├── package.json              # Dependencias y scripts de construcción y ejecución
├── server.ts                 # Servidor Express proxy seguro y middleware Vite
├── src/
│   ├── main.tsx              # Punto de entrada de la aplicación React
│   ├── App.tsx               # Orquestador principal de vistas y barra de navegación
│   ├── types.ts              # Declaración unificada de interfaces y tipos TypeScript
│   ├── index.css             # Estilos globales con Tailwind CSS
│   ├── lib/
│   │   ├── auth.ts           # Control RBAC, usuarios del sistema y ofuscación LOPNNA
│   │   ├── db.ts             # Base de datos local reactiva con datos precargados
│   │   ├── gemini.ts         # Conector seguro al SDK @google/genai con Gemini 3.8 Flash
│   │   └── utils.ts          # Generadores de QR, cálculo de IMC y reportes WhatsApp
│   └── components/
│       ├── Layout/           # Encabezado tricolor, cintillo institucional y sidebar
│       ├── Shared/           # Modales reutilizables, badges y tarjetas de métricas
│       └── Views/            # Vistas operativas de la plataforma:
│           ├── DashboardView.tsx          # Aforo y ocupación en tiempo real
│           ├── CensusNNAView.tsx          # Censo unificado familiar y resguardo LOPNNA
│           ├── SportsProfileView.tsx      # Ficha deportiva, biomecánica y nutrición
│           ├── CampCedulaView.tsx         # Carnet digital con QR SHA-256
│           ├── MedicalTriajeView.tsx      # Farmacia y triaje médico
│           ├── InventoryView.tsx          # Almacén central, balones y uniformes
│           ├── RoutesView.tsx             # Convoyes Yutong y manifiesto vial
│           ├── ReportsCertificatesView.tsx# Actas oficiales y certificados QR
│           └── AIAssistantView.tsx        # Asistente virtual Gemini 3.8 Flash
```

---

## 🏛️ CONTACTO Y SOPORTE INSTITUCIONAL
- **Organismo:** Ministerio del Poder Popular para el Deporte / Instituto Nacional de Deportes (IND).
- **Dirección:** Dirección General de Planificación y Tecnologías de la Información.
- **Caracas, República Bolivariana de Venezuela.**
