-- ==============================================================================
-- SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
-- MINISTERIO DEL PODER POPULAR PARA EL DEPORTE
-- REPÚBLICA BOLIVARIANA DE VENEZUELA
-- ==============================================================================
-- Archivo: db/schema.sql
-- Descripción: Definición formal del esquema DDL en PostgreSQL 16+.
--              Incluye tipos enumerados, tablas con integridad referencial,
--              columnas generadas (es_nna, imc) e índices de rendimiento.
-- ==============================================================================

-- Creación de la base de datos (opcional si ya existe la instancia)
-- CREATE DATABASE campamentos_deportivos_db WITH OWNER = postgres ENCODING = 'UTF8' CONNECTION LIMIT = -1;
-- \c campamentos_deportivos_db;

-- Habilitar extensión para generación de identificadores UUID versión 4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TIPOS ENUMERADOS (ENUMS)
-- ==============================================================================

-- Estatus de censo y adjudicación del beneficio de vivienda digna
DO $$ BEGIN
    CREATE TYPE estado_vivienda_enum AS ENUM (
        'Por_Adjudicar',
        'Adjudicada',
        'Alquiler',
        'Compra_Credito',
        'Compra_Propia',
        'Pendiente_Censo'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Nivel de desarrollo atlético y competitivo
DO $$ BEGIN
    CREATE TYPE nivel_deportivo_enum AS ENUM (
        'Iniciacion',
        'Aficionado',
        'Atleta_Alta_Competencia',
        'Seleccion_Nacional'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Diagnóstico de aptitud física supervisada por el equipo de entrenadores
DO $$ BEGIN
    CREATE TYPE aptitud_deportiva_enum AS ENUM (
        'Excelente',
        'Optima',
        'En_Evaluacion',
        'Rechazada'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Clasificación de material e insumos de logística y entrenamiento
DO $$ BEGIN
    CREATE TYPE categoria_inventario_enum AS ENUM (
        'Balones',
        'Uniformes',
        'Kits_Entrenamiento',
        'Cronometraje',
        'Medicamentos',
        'Alimentos',
        'Otros'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Condición física del activo o material suministrado
DO $$ BEGIN
    CREATE TYPE estado_insumo_enum AS ENUM (
        'Nuevo',
        'Usado_Buen_Estado',
        'Deteriorado',
        'En_Mantenimiento'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estado operativo de los traslados y caravanas de transporte
DO $$ BEGIN
    CREATE TYPE estatus_ruta_enum AS ENUM (
        'Programada',
        'En_Transito',
        'Completada',
        'Cancelada'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Clasificación de alerta de vulnerabilidad para protección integral de NNA
DO $$ BEGIN
    CREATE TYPE flag_riesgo_enum AS ENUM (
        'normal',
        'warning',
        'danger'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 2. TABLAS DEL SISTEMA
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Tabla: estados_regionales
-- Catálogo geográfico de las entidades federales donde operan los campamentos.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estados_regionales (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo_iso VARCHAR(10) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Inserción inicial de estados base requeridos por el sistema
INSERT INTO estados_regionales (id, nombre, codigo_iso) VALUES
('la_guaira','La Guaira','VE-X'),
('distrito_capital','Distrito Capital (Caracas)','VE-A'),
('miranda','Miranda','VE-M'),
('aragua','Aragua','VE-D')
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- Tabla: campamentos
-- Sedes físicas, albergues transitorios y complejos deportivos habilitados.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campamentos (
    id VARCHAR(50) PRIMARY KEY,
    estado_id VARCHAR(50) NOT NULL REFERENCES estados_regionales(id) ON DELETE RESTRICT,
    nombre VARCHAR(200) NOT NULL,
    ubicacion_detallada TEXT NOT NULL,
    padrino_institucional VARCHAR(200),
    director_responsable VARCHAR(150),
    telefono_contacto VARCHAR(50),
    capacidad_habitaciones_total INT NOT NULL DEFAULT 0,
    capacidad_camas_total INT NOT NULL DEFAULT 0,
    capacidad_carpas_total INT NOT NULL DEFAULT 0,
    capacidad_modulos_total INT NOT NULL DEFAULT 0,
    habitaciones_ocupadas INT NOT NULL DEFAULT 0,
    camas_ocupadas INT NOT NULL DEFAULT 0,
    carpas_ocupadas INT NOT NULL DEFAULT 0,
    modulos_ocupados INT NOT NULL DEFAULT 0,
    es_instalacion_deportiva BOOLEAN NOT NULL DEFAULT FALSE,
    tipo_instalacion_deportiva VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- Tabla: familias
-- Núcleos familiares albergados temporalmente y censo para solución habitacional.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS familias (
    id VARCHAR(50) PRIMARY KEY,
    campamento_id VARCHAR(50) NOT NULL REFERENCES campamentos(id) ON DELETE CASCADE,
    nombre_familia VARCHAR(150) NOT NULL,
    ubicacion_interna VARCHAR(100) NOT NULL,
    observaciones_generales TEXT,
    esta_verificada BOOLEAN NOT NULL DEFAULT FALSE,
    verificado_por VARCHAR(150),
    fecha_verificacion TIMESTAMPTZ,
    estatus_vivienda estado_vivienda_enum NOT NULL DEFAULT 'Por_Adjudicar',
    detalles_censo_vivienda TEXT,
    esta_egresado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_egreso TIMESTAMPTZ,
    motivo_egreso VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- Tabla: integrantes
-- Miembros de cada núcleo familiar con datos biométricos, salud y protección NNA.
-- Regla de Negocio: es_nna se calcula automáticamente vía edad < 18.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integrantes (
    id VARCHAR(50) PRIMARY KEY,
    familia_id VARCHAR(50) NOT NULL REFERENCES familias(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(200) NOT NULL,
    cedula_identidad VARCHAR(30),
    parentesco VARCHAR(50) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    edad INT NOT NULL,
    sexo CHAR(1) CHECK (sexo IN ('M','F')),
    numero_cama VARCHAR(30),
    grupo_salud VARCHAR(50) DEFAULT 'Grupo I',
    patologia VARCHAR(200) DEFAULT 'Ninguna',
    medicamentos_requeridos TEXT,
    tipo_discapacidad VARCHAR(100) DEFAULT 'Ninguna',
    requiere_silla_ruedas BOOLEAN DEFAULT FALSE,
    es_gestante BOOLEAN DEFAULT FALSE,
    es_lactante BOOLEAN DEFAULT FALSE,
    is_sensitive_data BOOLEAN DEFAULT FALSE,
    talla_franela_ropa VARCHAR(10),
    talla_pantalon_mono VARCHAR(10),
    talla_calzado NUMERIC(3,1),
    es_nna BOOLEAN GENERATED ALWAYS AS (edad < 18) STORED,
    flag_riesgo flag_riesgo_enum DEFAULT 'normal',
    notas_proteccion_nna TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- Tabla: perfiles_deportivos
-- Evaluación física, requerimientos nutricionales y detección de talentos.
-- Regla de Negocio: imc se calcula automáticamente en la BD: peso / (altura/100)^2.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perfiles_deportivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integrante_id VARCHAR(50) NOT NULL UNIQUE REFERENCES integrantes(id) ON DELETE CASCADE,
    disciplina_principal VARCHAR(100) NOT NULL,
    disciplina_secundaria VARCHAR(100),
    nivel_competencia nivel_deportivo_enum NOT NULL DEFAULT 'Iniciacion',
    aptitud_deportiva_supervisada aptitud_deportiva_enum NOT NULL DEFAULT 'En_Evaluacion',
    peso_kg NUMERIC(5,2) NOT NULL,
    estatura_cm NUMERIC(5,2) NOT NULL,
    imc NUMERIC(4,2) GENERATED ALWAYS AS (peso_kg / ((estatura_cm/100.0)*(estatura_cm/100.0))) STORED,
    porcentaje_grasa_estimado NUMERIC(4,2),
    requerimiento_calorico_diario_kcal INT NOT NULL,
    dieta_especial_requerida TEXT,
    frecuencia_cardiaca_reposo INT,
    presion_arterial_sistolica INT,
    presion_arterial_diastolica INT,
    posee_talento_destacado BOOLEAN NOT NULL DEFAULT FALSE,
    entrenador_evaluador VARCHAR(150),
    observaciones_entrenador TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- Tabla: inventario_deportivo
-- Existencia, asignación y estado físico de materiales deportivos por sede.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventario_deportivo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campamento_id VARCHAR(50) NOT NULL REFERENCES campamentos(id) ON DELETE CASCADE,
    nombre_insumo VARCHAR(150) NOT NULL,
    categoria categoria_inventario_enum NOT NULL,
    cantidad_en_stock INT NOT NULL DEFAULT 0,
    cantidad_distribuida INT NOT NULL DEFAULT 0,
    unidad_medida VARCHAR(30) NOT NULL DEFAULT 'Unidades',
    estado_fisico estado_insumo_enum NOT NULL DEFAULT 'Nuevo',
    donante_o_proveedor VARCHAR(150) DEFAULT 'Ministerio del Deporte',
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- Tabla: rutas_transporte
-- Logística de traslado asistido en unidades Yutong entre sedes y eventos.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rutas_transporte (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_ruta VARCHAR(50) UNIQUE NOT NULL,
    campamento_origen_id VARCHAR(50) NOT NULL REFERENCES campamentos(id) ON DELETE RESTRICT,
    campamento_destino_id VARCHAR(50) NOT NULL REFERENCES campamentos(id) ON DELETE RESTRICT,
    unidad_vehiculo VARCHAR(100) NOT NULL,
    nombre_conductor VARCHAR(150) NOT NULL,
    telefono_conductor VARCHAR(50),
    capacidad_pasajeros INT NOT NULL,
    hora_salida_programada TIMESTAMPTZ NOT NULL,
    hora_llegada_estimada TIMESTAMPTZ NOT NULL,
    estatus_ruta estatus_ruta_enum NOT NULL DEFAULT 'Programada',
    notas_seguridad TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- Tabla: pasajeros_ruta
-- Manifiesto nominal de integrantes asignados a cada ruta de transporte.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pasajeros_ruta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ruta_id UUID NOT NULL REFERENCES rutas_transporte(id) ON DELETE CASCADE,
    integrante_id VARCHAR(50) NOT NULL REFERENCES integrantes(id) ON DELETE CASCADE,
    asiento_numero INT,
    asistencia_confirmada BOOLEAN DEFAULT FALSE,
    UNIQUE(ruta_id, integrante_id)
);

-- ==============================================================================
-- 3. ÍNDICES DE RENDIMIENTO Y OPTIMIZACIÓN
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_campamentos_estado ON campamentos(estado_id);
CREATE INDEX IF NOT EXISTS idx_familias_campamento ON familias(campamento_id);
CREATE INDEX IF NOT EXISTS idx_integrantes_familia ON integrantes(familia_id);
CREATE INDEX IF NOT EXISTS idx_integrantes_nna ON integrantes(es_nna);
CREATE INDEX IF NOT EXISTS idx_perfiles_disciplina ON perfiles_deportivos(disciplina_principal);
CREATE INDEX IF NOT EXISTS idx_inventario_campamento ON inventario_deportivo(campamento_id);
CREATE INDEX IF NOT EXISTS idx_rutas_estatus ON rutas_transporte(estatus_ruta);
