-- ==============================================================================
-- SISTEMA OFICIAL «CAMPAMENTOS TRANSITORIOS DEPORTIVOS»
-- MINISTERIO DEL PODER POPULAR PARA EL DEPORTE
-- REPÚBLICA BOLIVARIANA DE VENEZUELA
-- ==============================================================================
-- Archivo: db/seed.sql
-- Descripción: Datos iniciales de prueba e institucionalidad para poblar la BD.
--              Incluye sedes regionales, albergues deportivos, núcleos familiares,
--              integrantes (NNA y adultos), perfiles biométricos, inventario y rutas.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEDES REGIONALES Y CAMPAMENTOS DEPORTIVOS
-- ------------------------------------------------------------------------------
INSERT INTO campamentos (
    id, estado_id, nombre, ubicacion_detallada, padrino_institucional, director_responsable,
    telefono_contacto, capacidad_habitaciones_total, capacidad_camas_total,
    capacidad_carpas_total, capacidad_modulos_total, habitaciones_ocupadas,
    camas_ocupadas, carpas_ocupadas, modulos_ocupados, es_instalacion_deportiva,
    tipo_instalacion_deportiva
) VALUES
(
    'camp_la_guaira_uee', 'la_guaira', 'Campamento U.E.E. La Guaira',
    'Sector Pariata, Parroquia Maiquetía, La Guaira',
    'Viceministerio de Alto Rendimiento', 'Prof. Carlos Mendoza',
    '+58 412-5550101', 30, 120, 20, 10, 24, 98, 15, 8, TRUE, 'Gimnasio Polideportivo'
),
(
    'camp_naiguata', 'la_guaira', 'Complejo Deportivo Naiguatá',
    'Av. Principal de Naiguatá, Litoral Central',
    'Instituto Nacional de Deportes (IND)', 'Lic. Mariángel Rivas',
    '+58 424-5550102', 20, 80, 25, 5, 18, 65, 20, 4, TRUE, 'Centro de Deportes Acuáticos y Playa'
),
(
    'camp_albergues_costa', 'la_guaira', 'Albergues de la Costa',
    'Caruao - Chuspa, Parroquia Caruao',
    'Gobernación del Estado La Guaira', 'Técnico José Alfonzo',
    '+58 416-5550103', 15, 60, 30, 8, 10, 42, 22, 6, FALSE, 'Albergue Comunitario'
),
(
    'camp_morochito', 'distrito_capital', 'Residencia de Atletas "Morochito Hernández"',
    'Av. Teherán, Complejo Deportivo La Vega / Montalbán, Caracas',
    'Ministerio del Poder Popular para el Deporte', 'Entrenador David Sulbarán',
    '+58 414-5550201', 50, 200, 0, 15, 42, 175, 0, 12, TRUE, 'Villa Olímpica de Alto Rendimiento'
),
(
    'camp_paraiso', 'distrito_capital', 'Villa Deportiva El Paraíso / Montalbán',
    'Calle Las Fuentes con Av. Páez, El Paraíso, Caracas',
    'Fondo Nacional del Deporte', 'Dra. Elena Quintero',
    '+58 412-5550202', 40, 160, 10, 12, 35, 138, 8, 10, TRUE, 'Pabellón Gimnástico y Canchas Múltiples'
),
(
    'camp_pnu', 'distrito_capital', 'Parque Naciones Unidas (Módulo Transitorio)',
    'Sector El Paraíso, Autopista Francisco Fajardo, Caracas',
    'Federación Polideportiva Nacional', 'Prof. Roberto Briceño',
    '+58 424-5550203', 35, 140, 15, 10, 28, 110, 10, 7, TRUE, 'Estadio de Atletismo y Natación'
),
(
    'camp_los_teques', 'miranda', 'Centro Polideportivo Los Teques',
    'Sector El Paso, Los Teques, Estado Miranda',
    'Instituto de Deportes de Miranda', 'Lic. Carmen Bastidas',
    '+58 416-5550301', 25, 100, 20, 8, 20, 78, 14, 6, TRUE, 'Complejo de Artes Marciales'
),
(
    'camp_villa_olimpica_maracay', 'aragua', 'Villa Olímpica de Maracay',
    'Av. Las Delicias, Maracay, Estado Aragua',
    'Instituto Regional del Deporte de Aragua (IRDA)', 'Entrenador Franklin Gómez',
    '+58 414-5550401', 45, 180, 10, 12, 38, 145, 6, 9, TRUE, 'Pista de Atletismo y Velódromo'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. CENSO FAMILIAR (FAMILIAS)
-- ------------------------------------------------------------------------------
INSERT INTO familias (
    id, campamento_id, nombre_familia, ubicacion_interna, observaciones_generales,
    esta_verificada, verificado_por, fecha_verificacion, estatus_vivienda,
    detalles_censo_vivienda, esta_egresado, fecha_egreso, motivo_egreso
) VALUES
(
    'fam_001', 'camp_morochito', 'Familia Gómez Colmenares', 'Pabellón A - Habitación 102',
    'Familia damnificada por lluvias en Macuto. 3 integrantes. Madre jefa de hogar con dos menores deportistas.',
    TRUE, 'Lic. Mariángel Rivas (Trabajadora Social)', '2026-02-10 14:30:00+00',
    'Adjudicada', 'Adjudicado apartamento en Urbanismo Ciudad Caribia. En proceso de mudanza.',
    FALSE, NULL, NULL
),
(
    'fam_002', 'camp_morochito', 'Familia Mendoza Pacheco', 'Pabellón B - Habitación 204',
    'Núcleo de 4 personas. Hijo mayor con talento destacado en Atletismo (velocidad 100m).',
    TRUE, 'Prof. Carlos Mendoza', '2026-02-12 10:00:00+00',
    'Por_Adjudicar', 'Evaluación técnica completada para inclusión en el programa 0800-MIHOGAR.',
    FALSE, NULL, NULL
),
(
    'fam_003', 'camp_la_guaira_uee', 'Familia Salazar Hernández', 'Módulo 2 - Carpa 05',
    'Familia en tránsito preventivo costero. Madre lactante y joven prospecto de béisbol menor.',
    TRUE, 'Dra. Elena Quintero', '2026-02-18 16:00:00+00',
    'Pendiente_Censo', 'Inspección de vivienda original en zona de riesgo torrencial pendiente de informe.',
    FALSE, NULL, NULL
),
(
    'fam_004', 'camp_naiguata', 'Familia Castillo Bermúdez', 'Módulo Norte - Camas 12-15',
    'Atletas juveniles de surf y natación en aguas abiertas. 4 miembros.',
    TRUE, 'Técnico José Alfonzo', '2026-02-20 09:15:00+00',
    'Alquiler', 'Postulados a subsidio de alquiler temporal solidario en el Municipio Vargas.',
    FALSE, NULL, NULL
),
(
    'fam_005', 'camp_paraiso', 'Familia Rodríguez Villegas', 'Pabellón Central - Habitación 301',
    '3 integrantes. Niña de 11 años preseleccionada nacional en Gimnasia Rítmica.',
    TRUE, 'Lic. Mariángel Rivas', '2026-02-25 11:30:00+00',
    'Adjudicada', 'Vivienda adjudicada en Fuerte Tiuna, asignación coordinada con MinDeporte.',
    FALSE, NULL, NULL
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. INTEGRANTES DEL GRUPO FAMILIAR (CON DATOS NNA Y DOTACIÓN)
-- ------------------------------------------------------------------------------
INSERT INTO integrantes (
    id, familia_id, nombre_completo, cedula_identidad, parentesco, fecha_nacimiento,
    edad, sexo, numero_cama, grupo_salud, patologia, medicamentos_requeridos,
    tipo_discapacidad, requiere_silla_ruedas, es_gestante, es_lactante,
    is_sensitive_data, talla_franela_ropa, talla_pantalon_mono, talla_calzado,
    flag_riesgo, notas_proteccion_nna
) VALUES
-- Familia Gómez Colmenares (fam_001)
(
    'int_001', 'fam_001', 'Yajaira Colmenares de Gómez', 'V-15894231', 'Madre / Jefa de Hogar',
    '1982-05-14', 43, 'F', 'CAMA-A102-1', 'Grupo I', 'Hipertensión Leve', 'Losartán Potásico 50mg',
    'Ninguna', FALSE, FALSE, FALSE, FALSE, 'M', 'L', 38.0, 'normal', NULL
),
(
    'int_002', 'fam_001', 'Brayan David Gómez Colmenares', 'V-32456789', 'Hijo',
    '2009-08-20', 16, 'M', 'CAMA-A102-2', 'Grupo I', 'Ninguna', 'Multivitamínico Deportivo',
    'Ninguna', FALSE, FALSE, FALSE, TRUE, 'M', 'M', 41.5, 'normal',
    'Estudiante becado. Cumple régimen de entrenamiento matutino en pista de La Vega.'
),
(
    'int_003', 'fam_001', 'Mariángela Gómez Colmenares', 'S/C-MENOR-001', 'Hija',
    '2014-11-03', 11, 'F', 'CAMA-A102-3', 'Grupo II', 'Asma bronquial intermitente', 'Salbutamol inhalador SOS',
    'Ninguna', FALSE, FALSE, FALSE, TRUE, '12', '12', 34.0, 'warning',
    'Protección NNA activa. Requiere chequeo neumonológico antes de competencias acuáticas.'
),

-- Familia Mendoza Pacheco (fam_002)
(
    'int_004', 'fam_002', 'Marcos Mendoza Fuentes', 'V-14220195', 'Padre / Jefe de Hogar',
    '1979-03-22', 46, 'M', 'CAMA-B204-1', 'Grupo I', 'Ninguna', 'Ninguno',
    'Ninguna', FALSE, FALSE, FALSE, FALSE, 'L', 'L', 42.0, 'normal', NULL
),
(
    'int_005', 'fam_002', 'Rosa Pacheco de Mendoza', 'V-16781290', 'Madre',
    '1984-07-11', 41, 'F', 'CAMA-B204-2', 'Grupo I', 'Ninguna', 'Ninguno',
    'Ninguna', FALSE, FALSE, FALSE, FALSE, 'M', 'M', 37.5, 'normal', NULL
),
(
    'int_006', 'fam_002', 'Keiver José Mendoza Pacheco', 'V-31998412', 'Hijo',
    '2008-01-15', 18, 'M', 'CAMA-B204-3', 'Grupo I', 'Ninguna', 'Complejo B y Suplemento Proteico',
    'Ninguna', FALSE, FALSE, FALSE, FALSE, 'L', 'L', 43.0, 'normal',
    'Atleta en preselección nacional juvenil de 100m y 200m planos.'
),
(
    'int_007', 'fam_002', 'Deyanira Mendoza Pacheco', 'S/C-MENOR-002', 'Hija',
    '2016-04-30', 9, 'F', 'CAMA-B204-4', 'Grupo I', 'Ninguna', 'Ninguno',
    'Ninguna', FALSE, FALSE, FALSE, TRUE, '10', '10', 32.0, 'normal',
    'NNA escolarizada en unidad educativa del complejo deportivo.'
),

-- Familia Salazar Hernández (fam_003)
(
    'int_008', 'fam_003', 'Carmen Salazar Hernández', 'V-19455120', 'Madre Soltera',
    '1989-09-05', 36, 'F', 'CARPA-05-1', 'Grupo III', 'Postparto mediato', 'Hierro + Ácido Fólico',
    'Ninguna', FALSE, FALSE, TRUE, TRUE, 'S', 'M', 36.5, 'warning',
    'Madre lactante en seguimiento nutricional prioritario por el INN.'
),
(
    'int_009', 'fam_003', 'Samuel Salazar Hernández', 'S/C-BEBE-001', 'Hijo',
    '2025-10-12', 0, 'M', 'CARPA-05-2', 'Grupo III', 'Control de Niño Sano', 'Lactancia Materna Exclusiva',
    'Ninguna', FALSE, FALSE, FALSE, TRUE, '0-3M', '0-3M', 16.0, 'danger',
    'Lactante menor bajo protección y resguardo pediátrico permanente.'
),
(
    'int_010', 'fam_003', 'Jesús Gabriel Salazar', 'V-33100542', 'Hijo',
    '2011-06-18', 14, 'M', 'CARPA-05-3', 'Grupo I', 'Ninguna', 'Ninguno',
    'Ninguna', FALSE, FALSE, FALSE, TRUE, '14', '14', 38.5, 'normal',
    'Prospecto de Béisbol Menor en academia comunitaria de Caruao.'
),

-- Familia Rodríguez Villegas (fam_005)
(
    'int_011', 'fam_005', 'Isabel Rodríguez Villegas', 'S/C-MENOR-003', 'Hija',
    '2015-02-14', 11, 'F', 'CAMA-C301-2', 'Grupo I', 'Ninguna', 'Complejo Vitamínico D3',
    'Ninguna', FALSE, FALSE, FALSE, TRUE, '12', '12', 33.5, 'normal',
    'Talento Excepcional en Gimnasia Rítmica. Evaluación técnica con puntuación destacada.'
)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. PERFILES DEPORTIVOS Y BIOMÉTRICOS
-- ------------------------------------------------------------------------------
INSERT INTO perfiles_deportivos (
    integrante_id, disciplina_principal, disciplina_secundaria, nivel_competencia,
    aptitud_deportiva_supervisada, peso_kg, estatura_cm, porcentaje_grasa_estimado,
    requerimiento_calorico_diario_kcal, dieta_especial_requerida,
    frecuencia_cardiaca_reposo, presion_arterial_sistolica, presion_arterial_diastolica,
    posee_talento_destacado, entrenador_evaluador, observaciones_entrenador
) VALUES
(
    'int_002', 'Fútbol Campo', 'Futsal', 'Atleta_Alta_Competencia',
    'Excelente', 62.50, 172.00, 11.20, 3100, 'Alta en carbohidratos complejos y proteína magra',
    52, 115, 75, TRUE, 'Prof. Carlos Mendoza',
    'Excelente velocidad en banda derecha, capacidad aeróbica superior al percentil 90.'
),
(
    'int_006', 'Atletismo (Velocidad)', 'Salto Largo', 'Seleccion_Nacional',
    'Excelente', 74.00, 184.00, 9.80, 3500, 'Dieta de hipertrofia y potencia anaeróbica',
    48, 118, 72, TRUE, 'Prof. Roberto Briceño',
    'Marca de 10.65s en 100m planos categoría juvenil. Postulado a Juegos Panamericanos Jr.'
),
(
    'int_010', 'Béisbol', 'Softbol', 'Aficionado',
    'Optima', 54.00, 163.00, 13.50, 2600, 'Balanceada estándar con suplemento de calcio',
    60, 110, 70, TRUE, 'Técnico José Alfonzo',
    'Lanzador zurdo con mecánica fluida, velocidad proyectada 75mph a su edad.'
),
(
    'int_011', 'Gimnasia Rítmica', 'Ballet Clásico', 'Atleta_Alta_Competencia',
    'Excelente', 32.00, 138.00, 12.00, 2100, 'Supervisión de micronutrientes y flexibilidad',
    56, 105, 65, TRUE, 'Lic. Mariángel Rivas',
    'Coordinación motriz de nivel élite con cinta y aro. Potencial medallista nacional.'
)
ON CONFLICT (integrante_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. INVENTARIO DEPORTIVO INSTITUCIONAL
-- ------------------------------------------------------------------------------
INSERT INTO inventario_deportivo (
    campamento_id, nombre_insumo, categoria, cantidad_en_stock, cantidad_distribuida,
    unidad_medida, estado_fisico, donante_o_proveedor, observaciones
) VALUES
(
    'camp_morochito', 'Balones de Fútbol Profesional No. 5', 'Balones',
    45, 30, 'Unidades', 'Nuevo', 'Ministerio del Deporte', 'Balones termosellados para entrenamiento'
),
(
    'camp_morochito', 'Kits de Atletismo (Conos, Vallas, Testigos)', 'Kits_Entrenamiento',
    20, 15, 'Kits', 'Nuevo', 'Federación Venezolana de Atletismo', 'Dotación para pista de tartán'
),
(
    'camp_morochito', 'Cronómetros Digitales de Precisión 1/100s', 'Cronometraje',
    12, 8, 'Unidades', 'Nuevo', 'Fondo Nacional del Deporte', 'Uso exclusivo del cuerpo técnico'
),
(
    'camp_la_guaira_uee', 'Uniformes de Baloncesto Tricolor (Franela + Short)', 'Uniformes',
    80, 55, 'Juegos', 'Nuevo', 'Ministerio del Deporte', 'Tallas S, M, L con logo institucional'
),
(
    'camp_la_guaira_uee', 'Balones de Baloncesto Molten GG7X', 'Balones',
    35, 25, 'Unidades', 'Usado_Buen_Estado', 'Gobernación de La Guaira', 'Para tabloncillo cubierto'
),
(
    'camp_naiguata', 'Tablas de Bodyboard y Rescate Marino', 'Kits_Entrenamiento',
    18, 12, 'Unidades', 'Nuevo', 'MinDeporte - Deportes de Playa', 'Para clínicas deportivas costeras'
),
(
    'camp_paraiso', 'Botiquines de Emergencia y Crioterapia Deportiva', 'Medicamentos',
    15, 10, 'Kits', 'Nuevo', 'Misión Barrio Adentro Deportivo', 'Hielo químico, vendas elásticas y analgésicos'
);

-- ------------------------------------------------------------------------------
-- 6. LOGÍSTICA Y RUTAS DE TRANSPORTE INTERURBANO (YUTONG)
-- ------------------------------------------------------------------------------
INSERT INTO rutas_transporte (
    id, codigo_ruta, campamento_origen_id, campamento_destino_id, unidad_vehiculo,
    nombre_conductor, telefono_conductor, capacidad_pasajeros,
    hora_salida_programada, hora_llegada_estimada, estatus_ruta, notas_seguridad
) VALUES
(
    'b4a92c81-87de-4f32-841f-13a8519e0001', 'RUTA-YUTONG-001',
    'camp_la_guaira_uee', 'camp_morochito',
    'Autobús Yutong ZK6129H (Placa: 20A-MIND)', 'Sr. Wilmer Zambrano', '+58 412-8889901', 44,
    '2026-09-17 07:00:00+00', '2026-09-17 08:30:00+00', 'Programada',
    'Traslado de atletas preseleccionados para chequeo biométrico nacional en Caracas.'
),
(
    'b4a92c81-87de-4f32-841f-13a8519e0002', 'RUTA-YUTONG-002',
    'camp_naiguata', 'camp_paraiso',
    'Autobús Yutong ZK6118 (Placa: 18B-IND)', 'Sr. Franklin Herrera', '+58 424-7776655', 38,
    '2026-09-17 09:00:00+00', '2026-09-17 11:00:00+00', 'Programada',
    'Caravana deportiva con resguardo de seguridad vial por la Autopista Caracas-La Guaira.'
)
ON CONFLICT (codigo_ruta) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. MANIFIESTO DE PASAJEROS EN RUTA
-- ------------------------------------------------------------------------------
INSERT INTO pasajeros_ruta (
    ruta_id, integrante_id, asiento_numero, asistencia_confirmada
) VALUES
(
    'b4a92c81-87de-4f32-841f-13a8519e0001', 'int_002', 12, TRUE
),
(
    'b4a92c81-87de-4f32-841f-13a8519e0001', 'int_006', 13, TRUE
),
(
    'b4a92c81-87de-4f32-841f-13a8519e0001', 'int_010', 14, TRUE
),
(
    'b4a92c81-87de-4f32-841f-13a8519e0002', 'int_011', 5, TRUE
)
ON CONFLICT (ruta_id, integrante_id) DO NOTHING;
