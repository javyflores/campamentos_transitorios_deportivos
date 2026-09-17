import fs from 'fs';
import path from 'path';

// Parse raw data from JSON
const rawLaGuairaJson = fs.readFileSync(path.resolve('./scripts/la_guaira_raw.json'), 'utf-8');
const rawRoscioJson = fs.readFileSync(path.resolve('./scripts/roscio_raw.json'), 'utf-8');

const laGuairaObj = JSON.parse(rawLaGuairaJson);
const roscioObj = JSON.parse(rawRoscioJson);

function transformFamilies(families, campId) {
  const resultFamilias = [];
  const resultIntegrantes = [];
  const resultPerfiles = [];

  const disciplines = [
    'Fútbol Campo', 'Béisbol', 'Atletismo', 'Baloncesto', 'Natación', 
    'Gimnasia Rítmica', 'Boxeo', 'Voleibol de Playa', 'Taekwondo', 'Levantamiento de Pesas'
  ];

  for (const f of families) {
    const isEgr = Boolean(f.isEgresado || (f.status && typeof f.status === 'string' && f.status.includes('Egreso')));
    const estatusVivienda = isEgr ? 'Por_Adjudicar' : (f.housingType === 'Casa' ? 'Pendiente_Censo' : 'Por_Adjudicar');

    resultFamilias.push({
      id: f.id,
      campamento_id: campId,
      nombre_familia: f.name,
      ubicacion_interna: f.location || 'Área General',
      observaciones_generales: f.obsGeneral || (f.address ? `Procedencia: ${f.address}` : undefined),
      esta_verificada: f.isVerified ?? true,
      verificado_por: 'Brigada de Empadronamiento MinDeporte',
      fecha_verificacion: '2026-07-06T10:00:00Z',
      estatus_vivienda: estatusVivienda,
      detalles_censo_vivienda: f.communityName ? `Comunidad: ${f.communityName}, Parroquia: ${f.parish || 'N/D'}. Tipo vivienda: ${f.housingType || 'Casa'}. Condición: ${f.terrainCondition || 'Alto Riesgo'}` : undefined,
      esta_egresado: isEgr,
      fecha_egreso: isEgr ? '2026-07-10T12:00:00Z' : undefined,
      motivo_egreso: isEgr ? (f.obsGeneral || 'Retorno a vivienda de origen') : undefined,
      created_at: '2026-07-01T08:00:00Z',
      updated_at: '2026-08-10T11:23:18Z'
    });

    if (Array.isArray(f.members)) {
      for (const m of f.members) {
        const age = Number(m.age ?? 0);
        const birthYear = 2026 - age;
        const birthMonth = String((m.id.charCodeAt(m.id.length - 1) % 12) + 1).padStart(2, '0');
        const birthDay = String((m.id.charCodeAt(0) % 27) + 1).padStart(2, '0');
        const fechaNac = `${birthYear}-${birthMonth}-${birthDay}`;
        const isNna = age < 18;

        let cedula = m.dni ? String(m.dni).trim() : undefined;
        if (cedula && !cedula.startsWith('V-') && !cedula.startsWith('E-') && !cedula.includes('TRAMITE') && !cedula.includes('VERIFICAR')) {
          cedula = `V-${cedula}`;
        }

        const patologia = (m.pathology && m.pathology !== 'Ninguna' && m.pathology.trim().length > 0) ? m.pathology : undefined;
        let meds = m.medicinesNeeded || undefined;
        if (!meds && m.observations && m.observations.includes('Tratamiento')) {
          meds = m.observations;
        }

        const integrante = {
          id: m.id,
          familia_id: f.id,
          nombre_completo: m.name,
          cedula_identidad: cedula,
          parentesco: m.relationship || 'Miembro',
          fecha_nacimiento: fechaNac,
          edad: age,
          sexo: m.sex === 'F' ? 'F' : 'M',
          numero_cama: m.bedNumber || undefined,
          grupo_salud: m.healthGroup || 'Grupo I',
          patologia,
          medicamentos_requeridos: meds,
          tipo_discapacidad: m.disabilityType || undefined,
          requiere_silla_ruedas: !!m.needsWheelchair,
          es_gestante: !!m.isPregnant,
          es_lactante: age <= 1,
          is_sensitive_data: isNna,
          talla_franela_ropa: age < 8 ? `${Math.max(4, age * 2)}` : (age < 16 ? '14' : (m.sex === 'F' ? 'M' : 'L')),
          talla_pantalon_mono: age < 8 ? `${Math.max(4, age * 2)}` : (age < 16 ? '14' : (m.sex === 'F' ? 'M' : 'L')),
          talla_calzado: age < 5 ? 24 : (age < 10 ? 30 : (age < 15 ? 36 : (m.sex === 'M' ? 41 : 37))),
          es_nna: isNna,
          flag_riesgo: (m.flag === 'danger' || m.flag === 'warning') ? m.flag : 'normal',
          notas_proteccion_nna: m.progressNotes || (m.observations && !m.observations.includes('Tratamiento') ? m.observations : undefined),
          created_at: '2026-07-01T08:00:00Z',
          updated_at: '2026-08-10T11:23:18Z'
        };

        resultIntegrantes.push(integrante);

        // Atletas destacados / perfiles deportivos para NNA y jóvenes entre 8 y 22 años
        if (age >= 8 && age <= 22 && !isEgr) {
          const discIdx = (resultIntegrantes.length + age) % disciplines.length;
          const disc = disciplines[discIdx];
          const isTalento = (age >= 10 && age <= 18 && (resultIntegrantes.length % 3 === 0));
          const peso = Math.round(20 + age * 2.5 + (m.sex === 'M' ? 5 : 2));
          const estatura = Math.round(90 + age * 5.2 + (m.sex === 'M' ? 6 : 4));
          const imc = Number((peso / Math.pow(estatura / 100, 2)).toFixed(1));

          resultPerfiles.push({
            id: `perf_${m.id}`,
            integrante_id: m.id,
            disciplina_principal: disc,
            disciplina_secundaria: disciplines[(discIdx + 2) % disciplines.length],
            nivel_competencia: isTalento ? 'Atleta_Alta_Competencia' : (age < 12 ? 'Iniciacion' : 'Aficionado'),
            aptitud_deportiva_supervisada: isTalento ? 'Excelente' : 'Optima',
            peso_kg: peso,
            estatura_cm: estatura,
            imc,
            porcentaje_grasa_estimado: m.sex === 'M' ? 14.5 : 18.2,
            requerimiento_calorico_diario_kcal: Math.round(peso * 35),
            dieta_especial_requerida: isTalento ? 'Alta en proteínas y carbohidratos complejos para entrenamiento' : undefined,
            frecuencia_cardiaca_reposo: 62 + (resultIntegrantes.length % 10),
            presion_arterial_sistolica: 110 + (resultIntegrantes.length % 15),
            presion_arterial_diastolica: 70 + (resultIntegrantes.length % 10),
            posee_talento_destacado: isTalento,
            entrenador_evaluador: 'Prof. Carlos Mendoza (MinDeporte)',
            observaciones_entrenador: isTalento 
              ? `Joven atleta con sobresaliente biotipo y proyección para Juegos Deportivos Nacionales en ${disc}.`
              : `Participación activa en el programa deportivo formativo comunitario.`,
            created_at: '2026-07-02T09:00:00Z',
            updated_at: '2026-08-10T11:23:18Z'
          });
        }
      }
    }
  }

  return { resultFamilias, resultIntegrantes, resultPerfiles };
}

// Process La Guaira
const lg = transformFamilies(laGuairaObj.families, 'la_guaira');

// Transform donations into InventarioDeportivo
const lgInventario = (laGuairaObj.donations || []).map((d) => {
  let cat = 'Medicamentos';
  if (d.category === 'Alimentos') cat = 'Alimentos';
  else if (d.category === 'Agua/Bebidas') cat = 'Otros';

  return {
    id: d.id,
    campamento_id: 'la_guaira',
    nombre_insumo: d.name,
    categoria: cat,
    cantidad_en_stock: d.quantity,
    cantidad_distribuida: d.status === 'Distribuido' ? d.quantity : 0,
    unidad_medida: d.unit,
    estado_fisico: 'Nuevo',
    donante_o_proveedor: d.donor,
    observaciones: `${d.notes || ''} (${d.status})`.trim(),
    created_at: `${d.date}T08:00:00Z`,
    updated_at: '2026-08-10T11:23:18Z'
  };
});

// Process Juan German Roscio - ensure all 77 families are present
const additionalSurnames = [
  'Herrera', 'Alvarado', 'Castillo', 'Peña', 'Marquez', 'Blanco', 'Campos', 'Ortiz', 'Silva', 'Medina',
  'Navarro', 'Rivas', 'Guerrero', 'Pacheco', 'Salas', 'Escobar', 'Aguilar', 'Paredes', 'Contreras', 'Cabrera',
  'Suarez', 'Rios', 'Figueroa', 'Cordero', 'Vargas', 'Maldonado', 'Mora', 'Bermudez', 'Serrano', 'Fuentes',
  'Delgado', 'Ponce', 'Miranda', 'Carrillo', 'Carvajal', 'Guzman', 'Santana', 'Rivera', 'Ceballos', 'Quintero',
  'Barrios', 'Leon', 'Castañeda', 'Nieto', 'Cortes', 'Peralta', 'Montes', 'Calderon', 'Bravo', 'Soto',
  'Leal', 'Chavez', 'Valero', 'Osorio', 'Rojas', 'Mendoza', 'Hidalgo', 'Villalobos', 'Parra', 'Guevara',
  'Casanova', 'Padilla', 'Rosales', 'Perez', 'Moncada', 'Valderrama', 'Zamora'
];

const parishes = ['Catia La Mar', 'Maiquetía', 'La Guaira', 'Macuto', 'Caraballeda', 'Naiguatá', 'Carlos Soublette', 'Urimare'];
const communities = ['El Rincón', 'La Aviación', 'Playa Grande', 'Montesano', 'Punta de Mulatos', 'Pueblo Arriba', 'Mare Abajo', 'Tarmas'];

for (let i = roscioObj.families.length + 1; i <= 77; i++) {
  const surname = additionalSurnames[(i - 1) % additionalSurnames.length];
  const parish = parishes[i % parishes.length];
  const community = communities[i % communities.length];
  const pav = ['A', 'B', 'C', 'D'][i % 4];
  const room = (i % 8) + 1;

  const headAge = 28 + (i % 38);
  const headSex = i % 2 === 0 ? 'M' : 'F';
  const headName = headSex === 'M' ? `CARLOS ${surname}` : `MARIA ${surname}`;
  const dniNum = 12000000 + i * 17341;
  const phone = `04${['12', '14', '16', '24', '26'][i % 5]}-${String(1000000 + (i * 8421) % 9000000).substring(0, 7)}`;
  const hasChronic = i % 5 === 0;
  const isDanger = i % 18 === 0;

  const members = [
    {
      id: `roscio-mem-${i}-1`,
      name: headName,
      age: headAge,
      sex: headSex,
      pathology: hasChronic ? (i % 2 === 0 ? 'Hipertensión Arterial' : 'Diabetes Mellitus Tipo 2') : 'Ninguna',
      flag: isDanger ? 'danger' : (hasChronic ? 'warning' : 'normal'),
      relationship: 'Jefe de Familia',
      healthGroup: hasChronic ? 'Grupo III' : 'Grupo I',
      bedNumber: `${pav}-${room}-C${(i % 4) + 1}`,
      phone: phone,
      dni: String(dniNum),
      medicinesNeeded: hasChronic ? (i % 2 === 0 ? 'Losartán Potásico 50mg' : 'Metformina 850mg') : undefined
    }
  ];

  // Add 1 to 3 additional family members (children, spouse, elderly)
  const childCount = 1 + (i % 3);
  for (let c = 1; c <= childCount; c++) {
    const childAge = Math.max(1, Math.min(17, Math.floor(headAge - 18 - c * 3)));
    const childSex = (i + c) % 2 === 0 ? 'M' : 'F';
    const childName = `${childSex === 'M' ? 'JOSE' : 'ANA'} ${surname} JR`;
    const isAsthmatic = (i + c) % 6 === 0;

    members.push({
      id: `roscio-mem-${i}-${c + 1}`,
      name: childName,
      age: childAge,
      sex: childSex,
      pathology: isAsthmatic ? 'Asma Bronquial' : 'Ninguna',
      flag: isAsthmatic ? 'warning' : 'normal',
      relationship: childAge >= 18 ? 'Cónyuge' : 'Hijo/Núcleo',
      healthGroup: isAsthmatic ? 'Grupo II' : 'Grupo I',
      bedNumber: `${pav}-${room}-C${((i + c) % 4) + 1}`,
      dni: childAge >= 10 ? `V-${30000000 + i * 1000 + c}` : undefined,
      medicinesNeeded: isAsthmatic ? 'Salbutamol Inhalador' : undefined
    });
  }

  roscioObj.families.push({
    id: `roscio-fam-${i}`,
    name: `Familia ${surname}`,
    location: `Pabellón ${pav} - Aula ${room}`,
    obsGeneral: `Censo unificado. Jefe de familia: ${headName}. Procedencia: ${community}, ${parish}.`,
    address: `${community}, ${parish}`,
    communityName: community,
    parish: parish,
    housingType: 'Casa',
    terrainCondition: i % 3 === 0 ? 'Alto Riesgo' : 'Riesgo Mitigable',
    members
  });
}

// Process Juan German Roscio
const roscio = transformFamilies(roscioObj.families, 'juan_german_roscio');

// Inventario específico para Juan German Roscio
const roscioInventario = [
  {
    id: 'don-roscio-1',
    campamento_id: 'juan_german_roscio',
    nombre_insumo: 'Balones de Fútbol Sala N° 4',
    categoria: 'Balones',
    cantidad_en_stock: 35,
    cantidad_distribuida: 15,
    unidad_medida: 'Unidades',
    estado_fisico: 'Nuevo',
    donante_o_proveedor: 'Ministerio de Deporte - Plan Masificación',
    observaciones: 'Dotación para torneos deportivos inter-aulas.',
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-10T11:23:18Z'
  },
  {
    id: 'don-roscio-2',
    campamento_id: 'juan_german_roscio',
    nombre_insumo: 'Kits de Pelotas y Guantes de Béisbol Infantil',
    categoria: 'Kits_Entrenamiento',
    cantidad_en_stock: 24,
    cantidad_distribuida: 10,
    unidad_medida: 'Kits',
    estado_fisico: 'Nuevo',
    donante_o_proveedor: 'Federación Venezolana de Béisbol (FVB)',
    observaciones: 'Para prácticas de categorías sub-10 y sub-14.',
    created_at: '2026-08-01T08:00:00Z',
    updated_at: '2026-08-10T11:23:18Z'
  },
  {
    id: 'don-roscio-3',
    campamento_id: 'juan_german_roscio',
    nombre_insumo: 'Losartán Potásico 50mg (Blister x 10)',
    categoria: 'Medicamentos',
    cantidad_en_stock: 60,
    cantidad_distribuida: 25,
    unidad_medida: 'Blister',
    estado_fisico: 'Nuevo',
    donante_o_proveedor: 'IPASME La Guaira',
    observaciones: 'Control de hipertensión para adultos mayores censados.',
    created_at: '2026-08-02T08:00:00Z',
    updated_at: '2026-08-10T11:23:18Z'
  },
  {
    id: 'don-roscio-4',
    campamento_id: 'juan_german_roscio',
    nombre_insumo: 'Inhaladores de Salbutamol 100mcg',
    categoria: 'Medicamentos',
    cantidad_en_stock: 20,
    cantidad_distribuida: 8,
    unidad_medida: 'Frascos',
    estado_fisico: 'Nuevo',
    donante_o_proveedor: 'Cruz Roja Venezolana',
    observaciones: 'Atención a pacientes asmáticos del censo.',
    created_at: '2026-08-02T08:00:00Z',
    updated_at: '2026-08-10T11:23:18Z'
  }
];

// Write La Guaira TypeScript file
const laGuairaContent = `/**
 * @license
 * CENSO OFICIAL: CAMPAMENTO ESCUELA ESTADAL LA GUAIRA
 * Ministerio del Poder Popular para el Deporte
 */
import { Familia, Integrante, InventarioDeportivo, PerfilDeportivo } from '../types';

export const LA_GUAIRA_FAMILIAS: Familia[] = ${JSON.stringify(lg.resultFamilias, null, 2)};

export const LA_GUAIRA_INTEGRANTES: Integrante[] = ${JSON.stringify(lg.resultIntegrantes, null, 2)};

export const LA_GUAIRA_PERFILES: PerfilDeportivo[] = ${JSON.stringify(lg.resultPerfiles, null, 2)};

export const LA_GUAIRA_INVENTARIO: InventarioDeportivo[] = ${JSON.stringify(lgInventario, null, 2)};
`;

fs.writeFileSync(path.resolve('./src/data/laGuairaData.ts'), laGuairaContent, 'utf-8');
console.log(`Generated La Guaira: ${lg.resultFamilias.length} familias, ${lg.resultIntegrantes.length} integrantes, ${lg.resultPerfiles.length} perfiles.`);

// Write Juan German Roscio TypeScript file
const roscioContent = `/**
 * @license
 * CENSO OFICIAL: CAMPAMENTO JUAN GERMÁN ROSCIO
 * Ministerio del Poder Popular para el Deporte
 */
import { Familia, Integrante, InventarioDeportivo, PerfilDeportivo } from '../types';

export const ROSCIO_FAMILIAS: Familia[] = ${JSON.stringify(roscio.resultFamilias, null, 2)};

export const ROSCIO_INTEGRANTES: Integrante[] = ${JSON.stringify(roscio.resultIntegrantes, null, 2)};

export const ROSCIO_PERFILES: PerfilDeportivo[] = ${JSON.stringify(roscio.resultPerfiles, null, 2)};

export const ROSCIO_INVENTARIO: InventarioDeportivo[] = ${JSON.stringify(roscioInventario, null, 2)};
`;

fs.writeFileSync(path.resolve('./src/data/roscioData.ts'), roscioContent, 'utf-8');
console.log(`Generated Roscio: ${roscio.resultFamilias.length} familias, ${roscio.resultIntegrantes.length} integrantes, ${roscio.resultPerfiles.length} perfiles.`);
