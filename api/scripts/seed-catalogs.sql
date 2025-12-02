-- =============================================================================
-- CERTUS - Script de Seed para Catálogos CONSAR
-- Basado en Circular 19-8 y normativa vigente
-- Fecha: 2025-11-27
-- =============================================================================

-- Eliminar datos existentes (solo en desarrollo)
-- DELETE FROM catalog_entries WHERE catalog_id IN (SELECT id FROM catalogs WHERE source = 'SEED');
-- DELETE FROM catalogs WHERE source = 'SEED';

-- =============================================================================
-- 1. CATÁLOGO DE AFOREs
-- Fuente: CONSAR - Administradoras de Fondos para el Retiro autorizadas
-- =============================================================================
INSERT INTO catalogs (id, code, name, description, version, is_active, effective_from, source, created_at, updated_at)
VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'AFORES',
    'Catálogo de AFOREs',
    'Administradoras de Fondos para el Retiro autorizadas por CONSAR',
    '2025.1',
    true,
    NOW(),
    'SEED',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

-- Entradas de AFOREs (datos oficiales CONSAR Nov 2025)
INSERT INTO catalog_entries (id, catalog_id, key, value, display_name, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '530', 'AFORE XXI BANORTE', 'Afore XXI Banorte', 'RFC: AXB010727LE9', 1, true, '{"rfc":"AXB010727LE9","status":"activa"}', NOW(), NOW()),
    (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '544', 'AZTECA', 'Afore Azteca', 'RFC: AAZ010423NI3', 2, true, '{"rfc":"AAZ010423NI3","status":"activa"}', NOW(), NOW()),
    (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '538', 'CITIBANAMEX', 'Afore Citibanamex', 'RFC: ABA970925BY4', 3, true, '{"rfc":"ABA970925BY4","status":"activa"}', NOW(), NOW()),
    (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '568', 'COPPEL', 'Afore Coppel', 'RFC: ACO100614Q70', 4, true, '{"rfc":"ACO100614Q70","status":"activa"}', NOW(), NOW()),
    (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '578', 'INBURSA', 'Afore Inbursa', 'RFC: AIN970922DC5', 5, true, '{"rfc":"AIN970922DC5","status":"activa"}', NOW(), NOW()),
    (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '562', 'INVERCAP', 'Afore Invercap', 'RFC: INV010309QU9', 6, true, '{"rfc":"INV010309QU9","status":"activa"}', NOW(), NOW()),
    (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '519', 'PENSIONISSSTE', 'PensionISSSTE', 'RFC: PEN080619UC2', 7, true, '{"rfc":"PEN080619UC2","status":"activa"}', NOW(), NOW()),
    (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '553', 'PRINCIPAL', 'Afore Principal', 'RFC: PPR010403RL6', 8, true, '{"rfc":"PPR010403RL6","status":"activa"}', NOW(), NOW()),
    (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '527', 'PROFUTURO', 'Afore Profuturo', 'RFC: PRO970701LH1', 9, true, '{"rfc":"PRO970701LH1","status":"activa"}', NOW(), NOW()),
    (gen_random_uuid(), 'a1000000-0000-0000-0000-000000000001', '570', 'SURA', 'Afore SURA', 'RFC: ASU010305QJ0', 10, true, '{"rfc":"ASU010305QJ0","status":"activa"}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 2. CATÁLOGO DE SUBCUENTAS SAR
-- Fuente: Circular CONSAR 19-8 - Tipos de subcuenta del SAR
-- =============================================================================
INSERT INTO catalogs (id, code, name, description, version, is_active, effective_from, source, created_at, updated_at)
VALUES (
    'a2000000-0000-0000-0000-000000000001',
    'SUBCUENTAS_SAR',
    'Catálogo de Subcuentas SAR',
    'Tipos de subcuenta del Sistema de Ahorro para el Retiro',
    '2025.1',
    true,
    NOW(),
    'SEED',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

INSERT INTO catalog_entries (id, catalog_id, key, value, display_name, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES
    -- Subcuentas principales
    (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'RCV', 'Retiro, Cesantía y Vejez', 'RCV', 'Aportaciones obligatorias del patrón', 1, true, '{"tipo":"obligatoria","origen":"patronal"}', NOW(), NOW()),
    (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'VIV', 'Vivienda', 'Vivienda', 'Aportaciones para vivienda INFONAVIT/FOVISSSTE', 2, true, '{"tipo":"obligatoria","origen":"patronal"}', NOW(), NOW()),
    (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'AVO', 'Aportaciones Voluntarias', 'Aportaciones Voluntarias', 'Ahorro voluntario del trabajador', 3, true, '{"tipo":"voluntaria","origen":"trabajador"}', NOW(), NOW()),
    (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'AVC', 'Aportaciones Voluntarias Complementarias', 'AVC', 'Ahorro voluntario complementario', 4, true, '{"tipo":"voluntaria","origen":"trabajador"}', NOW(), NOW()),
    (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'SOL', 'Ahorro Solidario', 'Ahorro Solidario', 'Programa de ahorro solidario ISSSTE', 5, true, '{"tipo":"solidario","origen":"trabajador"}', NOW(), NOW()),
    -- Subcuentas especiales
    (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'SAR92', 'SAR 92', 'SAR 1992', 'Recursos del SAR anterior a 1997', 6, true, '{"tipo":"historico","origen":"transicion"}', NOW(), NOW()),
    (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'VIVG', 'Vivienda 92', 'Vivienda 1992', 'Recursos de vivienda anteriores', 7, true, '{"tipo":"historico","origen":"transicion"}', NOW(), NOW()),
    (gen_random_uuid(), 'a2000000-0000-0000-0000-000000000001', 'BONO', 'Bono de Pensión ISSSTE', 'Bono Pensión', 'Bono de pensión para trabajadores ISSSTE', 8, true, '{"tipo":"bono","origen":"issste"}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 3. CATÁLOGO DE TIPOS DE MOVIMIENTO
-- Fuente: Circular CONSAR 19-8 - Movimientos permitidos por tipo de archivo
-- =============================================================================
INSERT INTO catalogs (id, code, name, description, version, is_active, effective_from, source, created_at, updated_at)
VALUES (
    'a3000000-0000-0000-0000-000000000001',
    'TIPOS_MOVIMIENTO',
    'Catálogo de Tipos de Movimiento',
    'Tipos de movimiento para archivos CONSAR',
    '2025.1',
    true,
    NOW(),
    'SEED',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

INSERT INTO catalog_entries (id, catalog_id, key, value, display_name, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES
    -- Movimientos de nómina
    (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', 'A', 'Alta', 'Alta', 'Nuevo registro de aportación', 1, true, '{"archivos":["NOMINA"],"requiere_monto":true}', NOW(), NOW()),
    (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', 'B', 'Baja', 'Baja', 'Cancelación de registro', 2, true, '{"archivos":["NOMINA"],"requiere_monto":false}', NOW(), NOW()),
    (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', 'M', 'Modificación', 'Modificación', 'Corrección de registro existente', 3, true, '{"archivos":["NOMINA","REGULARIZACION"],"requiere_monto":true}', NOW(), NOW()),
    -- Movimientos contables
    (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', 'D', 'Débito', 'Débito', 'Cargo a cuenta', 4, true, '{"archivos":["CONTABLE"],"requiere_monto":true}', NOW(), NOW()),
    (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', 'C', 'Crédito', 'Crédito', 'Abono a cuenta', 5, true, '{"archivos":["CONTABLE"],"requiere_monto":true}', NOW(), NOW()),
    -- Movimientos de traspaso
    (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', 'T', 'Traspaso', 'Traspaso', 'Transferencia entre AFOREs', 6, true, '{"archivos":["TRASPASOS"],"requiere_monto":true}', NOW(), NOW()),
    (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', 'U', 'Unificación', 'Unificación', 'Unificación de cuentas', 7, true, '{"archivos":["TRASPASOS"],"requiere_monto":true}', NOW(), NOW()),
    -- Movimientos de retiro
    (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', 'RP', 'Retiro Parcial', 'Retiro Parcial', 'Retiro parcial por desempleo', 8, true, '{"archivos":["RETIROS"],"requiere_monto":true}', NOW(), NOW()),
    (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', 'RT', 'Retiro Total', 'Retiro Total', 'Retiro total por pensión', 9, true, '{"archivos":["RETIROS"],"requiere_monto":true}', NOW(), NOW()),
    (gen_random_uuid(), 'a3000000-0000-0000-0000-000000000001', 'RM', 'Retiro Matrimonio', 'Retiro por Matrimonio', 'Retiro por matrimonio', 10, true, '{"archivos":["RETIROS"],"requiere_monto":true}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 4. CATÁLOGO DE TIPOS DE ARCHIVO CONSAR
-- Fuente: Circular CONSAR 19-8 - Especificaciones técnicas
-- =============================================================================
INSERT INTO catalogs (id, code, name, description, version, is_active, effective_from, source, created_at, updated_at)
VALUES (
    'a4000000-0000-0000-0000-000000000001',
    'TIPOS_ARCHIVO',
    'Catálogo de Tipos de Archivo',
    'Tipos de archivo CONSAR con especificaciones técnicas',
    '2025.1',
    true,
    NOW(),
    'SEED',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

INSERT INTO catalog_entries (id, catalog_id, key, value, display_name, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', 'NOMINA', 'Archivo de Nómina', 'Nómina', 'Aportaciones patronales - Circular 19-8', 1, true, '{"longitud_linea":100,"extension":".txt","codificacion":"ASCII"}', NOW(), NOW()),
    (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', 'CONTABLE', 'Archivo Contable', 'Contable', 'Movimientos contables SIEFORES', 2, true, '{"longitud_linea":115,"extension":".txt","codificacion":"ASCII"}', NOW(), NOW()),
    (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', 'REGULARIZACION', 'Archivo de Regularización', 'Regularización', 'Correcciones y ajustes', 3, true, '{"longitud_linea":77,"extension":".txt","codificacion":"ASCII"}', NOW(), NOW()),
    (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', 'TRASPASOS', 'Archivo de Traspasos', 'Traspasos', 'Solicitudes de traspaso entre AFOREs', 4, true, '{"longitud_linea":77,"extension":".txt","codificacion":"ASCII"}', NOW(), NOW()),
    (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', 'RETIROS', 'Archivo de Retiros', 'Retiros', 'Solicitudes de retiro parcial/total', 5, true, '{"longitud_linea":77,"extension":".txt","codificacion":"ASCII"}', NOW(), NOW()),
    (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', 'APORTACIONES', 'Archivo de Aportaciones Voluntarias', 'Aportaciones', 'Aportaciones voluntarias', 6, true, '{"longitud_linea":77,"extension":".txt","codificacion":"ASCII"}', NOW(), NOW()),
    (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', 'CARTERA_SIEFORE', 'Cartera de Inversión', 'Cartera SIEFORE', 'Portafolio de inversiones', 7, true, '{"longitud_linea":150,"extension":".txt","codificacion":"ASCII"}', NOW(), NOW()),
    (gen_random_uuid(), 'a4000000-0000-0000-0000-000000000001', 'DERIVADOS', 'Posiciones en Derivados', 'Derivados', 'Posiciones en derivados financieros', 8, true, '{"longitud_linea":150,"extension":".txt","codificacion":"ASCII"}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 5. CATÁLOGO DE CÓDIGOS DE RECHAZO LOTE
-- Fuente: PROCESAR - Códigos de rechazo de lote
-- =============================================================================
INSERT INTO catalogs (id, code, name, description, version, is_active, effective_from, source, created_at, updated_at)
VALUES (
    'a5000000-0000-0000-0000-000000000001',
    'RECHAZOS_LOTE',
    'Catálogo de Rechazos de Lote',
    'Códigos de rechazo a nivel de archivo/lote PROCESAR',
    '2025.1',
    true,
    NOW(),
    'SEED',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

INSERT INTO catalog_entries (id, catalog_id, key, value, display_name, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_001', 'Falta registro encabezado', 'Sin encabezado', 'El archivo no contiene registro tipo 01', 1, true, '{"severidad":"critico","circular":"19-8 Art 5.1"}', NOW(), NOW()),
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_002', 'Falta registro sumaria', 'Sin sumaria', 'El archivo no contiene registro tipo 03', 2, true, '{"severidad":"critico","circular":"19-8 Art 5.1"}', NOW(), NOW()),
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_003', 'Formato de nombre inválido', 'Nombre inválido', 'El nombre del archivo no cumple con el formato', 3, true, '{"severidad":"error","circular":"19-8 Art 4.1"}', NOW(), NOW()),
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_004', 'Tipo de archivo no coincide', 'Tipo no coincide', 'El tipo en nombre no coincide con contenido', 4, true, '{"severidad":"error","circular":"19-8 Art 4.2"}', NOW(), NOW()),
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_005', 'Conteo de registros incorrecto', 'Conteo incorrecto', 'La sumaria no coincide con registros detalle', 5, true, '{"severidad":"error","circular":"19-8 Art 5.3"}', NOW(), NOW()),
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_006', 'Suma de importes incorrecta', 'Suma incorrecta', 'Total de importes no coincide con sumaria', 6, true, '{"severidad":"error","circular":"19-8 Art 5.3.2"}', NOW(), NOW()),
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_007', 'RFC emisor inválido', 'RFC inválido', 'El RFC en nombre de archivo no es válido', 7, true, '{"severidad":"error","circular":"19-8 Art 4.1.2"}', NOW(), NOW()),
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_008', 'Fecha de archivo inválida', 'Fecha inválida', 'La fecha en nombre de archivo no es válida', 8, true, '{"severidad":"error","circular":"19-8 Art 4.1.3"}', NOW(), NOW()),
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_009', 'Código AFORE no autorizado', 'AFORE no válida', 'El código de AFORE no está registrado', 9, true, '{"severidad":"critico","circular":"19-8 Art 3.1"}', NOW(), NOW()),
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_010', 'Archivo duplicado', 'Duplicado', 'Ya existe un archivo con mismo nombre y fecha', 10, true, '{"severidad":"advertencia","circular":"19-8 Art 4.4"}', NOW(), NOW()),
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_012', 'Archivo vacío', 'Vacío', 'El archivo no contiene registros', 11, true, '{"severidad":"critico","circular":"19-8 Art 5.0"}', NOW(), NOW()),
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_013', 'Formato nombre archivo', 'Formato incorrecto', 'El formato de nombre no cumple TIPO_RFC_FECHA_SEC', 12, true, '{"severidad":"error","circular":"19-8 Art 4.1"}', NOW(), NOW()),
    (gen_random_uuid(), 'a5000000-0000-0000-0000-000000000001', 'LOTE_014', 'Caracteres no ASCII', 'Caracteres inválidos', 'El archivo contiene caracteres no permitidos', 13, true, '{"severidad":"error","circular":"19-8 Art 4.3"}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 6. CATÁLOGO DE CÓDIGOS DE RECHAZO REGISTRO
-- Fuente: PROCESAR - Códigos de rechazo a nivel de registro
-- =============================================================================
INSERT INTO catalogs (id, code, name, description, version, is_active, effective_from, source, created_at, updated_at)
VALUES (
    'a6000000-0000-0000-0000-000000000001',
    'RECHAZOS_REGISTRO',
    'Catálogo de Rechazos de Registro',
    'Códigos de rechazo a nivel de registro individual',
    '2025.1',
    true,
    NOW(),
    'SEED',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

INSERT INTO catalog_entries (id, catalog_id, key, value, display_name, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES
    -- Errores CURP (REG_001-REG_009)
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_001', 'CURP inválida', 'CURP inválida', 'La CURP no cumple con el formato o dígito verificador', 1, true, '{"campo":"curp","severidad":"error"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_004', 'CURP con advertencia', 'CURP advertencia', 'CURP válida pero con observaciones', 4, true, '{"campo":"curp","severidad":"advertencia"}', NOW(), NOW()),
    -- Errores NSS (REG_010-REG_019)
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_010', 'NSS inválido', 'NSS inválido', 'El NSS no cumple con formato o dígito Luhn', 10, true, '{"campo":"nss","severidad":"error"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_013', 'NSS vs CURP inconsistente', 'NSS-CURP', 'El año del NSS no corresponde con CURP', 13, true, '{"campo":"nss,curp","severidad":"advertencia"}', NOW(), NOW()),
    -- Errores RFC (REG_020-REG_029)
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_020', 'RFC inválido', 'RFC inválido', 'El RFC no cumple con formato SAT', 20, true, '{"campo":"rfc","severidad":"error"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_021', 'RFC advertencia', 'RFC advertencia', 'RFC válido con observaciones', 21, true, '{"campo":"rfc","severidad":"advertencia"}', NOW(), NOW()),
    -- Errores Cuenta (REG_030-REG_039)
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_030', 'Número de cuenta inválido', 'Cuenta inválida', 'La cuenta no cumple con 11 dígitos', 30, true, '{"campo":"cuenta","severidad":"error"}', NOW(), NOW()),
    -- Errores Importe (REG_040-REG_049)
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_040', 'Importe no numérico', 'Importe inválido', 'El importe no es un valor numérico válido', 40, true, '{"campo":"importe","severidad":"error"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_041', 'Importe negativo o cero', 'Importe <= 0', 'El importe debe ser mayor a cero', 41, true, '{"campo":"importe","severidad":"error"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_042', 'Importe inusualmente alto', 'Importe alto', 'El importe supera límites normales', 42, true, '{"campo":"importe","severidad":"advertencia"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_043', 'Importe excede máximo', 'Importe máximo', 'El importe excede el máximo permitido', 43, true, '{"campo":"importe","severidad":"error"}', NOW(), NOW()),
    -- Errores Fecha (REG_050-REG_059)
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_050', 'Fecha inválida', 'Fecha inválida', 'La fecha no cumple formato YYYYMMDD', 50, true, '{"campo":"fecha","severidad":"error"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_051', 'Fecha futura', 'Fecha futura', 'La fecha es posterior a hoy', 51, true, '{"campo":"fecha","severidad":"error"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_052', 'Fecha muy antigua', 'Fecha antigua', 'La fecha es anterior a 1997 (inicio SAR)', 52, true, '{"campo":"fecha","severidad":"advertencia"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_053', 'Mes inválido', 'Mes inválido', 'El mes no está entre 01-12', 53, true, '{"campo":"fecha","severidad":"error"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_054', 'Día inválido', 'Día inválido', 'El día no es válido para el mes', 54, true, '{"campo":"fecha","severidad":"error"}', NOW(), NOW()),
    -- Errores Tipo Movimiento (REG_060-REG_069)
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_060', 'Tipo movimiento inválido', 'Movimiento inválido', 'El tipo de movimiento no es válido para este archivo', 60, true, '{"campo":"tipo_movimiento","severidad":"error"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_061', 'NSS duplicado', 'NSS duplicado', 'El NSS aparece más de una vez en el archivo', 61, true, '{"campo":"nss","severidad":"advertencia"}', NOW(), NOW()),
    -- Errores Nombre (REG_070-REG_079)
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_070', 'Nombre vacío', 'Nombre vacío', 'El nombre del trabajador está vacío', 70, true, '{"campo":"nombre","severidad":"error"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_071', 'Nombre muy corto', 'Nombre corto', 'El nombre tiene menos de 5 caracteres', 71, true, '{"campo":"nombre","severidad":"advertencia"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_072', 'Nombre caracteres inválidos', 'Caracteres nombre', 'El nombre contiene caracteres no permitidos', 72, true, '{"campo":"nombre","severidad":"advertencia"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_073', 'Nombre vs CURP inconsistente', 'Nombre-CURP', 'Las iniciales del CURP no coinciden con nombre', 73, true, '{"campo":"nombre,curp","severidad":"advertencia"}', NOW(), NOW()),
    -- Errores Estructura (REG_080-REG_089)
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_081', 'Múltiples encabezados', 'Encabezados múltiples', 'Hay más de un registro tipo 01', 81, true, '{"campo":"estructura","severidad":"error"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_082', 'Múltiples sumarias', 'Sumarias múltiples', 'Hay más de un registro tipo 03', 82, true, '{"campo":"estructura","severidad":"error"}', NOW(), NOW()),
    (gen_random_uuid(), 'a6000000-0000-0000-0000-000000000001', 'REG_083', 'Sumaria mal ubicada', 'Sumaria posición', 'El registro sumaria no está al final', 83, true, '{"campo":"estructura","severidad":"error"}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 7. CATÁLOGO DE ESTADOS DE VALIDACIÓN
-- =============================================================================
INSERT INTO catalogs (id, code, name, description, version, is_active, effective_from, source, created_at, updated_at)
VALUES (
    'a7000000-0000-0000-0000-000000000001',
    'ESTADOS_VALIDACION',
    'Catálogo de Estados de Validación',
    'Estados posibles para validaciones de archivos',
    '2025.1',
    true,
    NOW(),
    'SEED',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

INSERT INTO catalog_entries (id, catalog_id, key, value, display_name, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000001', 'PENDING', 'Pendiente', 'Pendiente', 'Validación en espera de procesamiento', 1, true, '{"color":"#94a3b8","icono":"clock"}', NOW(), NOW()),
    (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000001', 'PROCESSING', 'Procesando', 'Procesando', 'Validación en proceso', 2, true, '{"color":"#3b82f6","icono":"loader"}', NOW(), NOW()),
    (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000001', 'SUCCESS', 'Exitosa', 'Exitosa', 'Validación completada sin errores', 3, true, '{"color":"#22c55e","icono":"check"}', NOW(), NOW()),
    (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000001', 'WARNING', 'Con advertencias', 'Con advertencias', 'Validación completada con advertencias', 4, true, '{"color":"#f59e0b","icono":"alert-triangle"}', NOW(), NOW()),
    (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000001', 'ERROR', 'Con errores', 'Con errores', 'Validación completada con errores', 5, true, '{"color":"#ef4444","icono":"x-circle"}', NOW(), NOW()),
    (gen_random_uuid(), 'a7000000-0000-0000-0000-000000000001', 'CRITICAL', 'Crítico', 'Crítico', 'Validación fallida por errores críticos', 6, true, '{"color":"#dc2626","icono":"alert-octagon"}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 8. CATÁLOGO DE SUBCUENTAS PROCESAR (Códigos numéricos)
-- Fuente: Archivos .1101 de PROCESAR (extraídos de ZIPs CONSAR Nov 2025)
-- =============================================================================
INSERT INTO catalogs (id, code, name, description, version, is_active, effective_from, source, created_at, updated_at)
VALUES (
    'a8000000-0000-0000-0000-000000000001',
    'SUBCUENTAS_PROCESAR',
    'Catálogo de Subcuentas PROCESAR',
    'Códigos numéricos de subcuentas usados en archivos .1101',
    '2025.1',
    true,
    NOW(),
    'SEED',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

INSERT INTO catalog_entries (id, catalog_id, key, value, display_name, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '11010', 'Control/Header', 'Header', 'Registro de control del archivo', 1, true, '{"tipo":"control"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '11020', 'RCV', 'RCV - Retiro, Cesantía y Vejez', 'Aportaciones obligatorias tripartitas', 2, true, '{"tipo":"obligatoria","circular":"19-8"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '11030', 'SAR 92', 'SAR 1992', 'Recursos del SAR anterior a 1997', 3, true, '{"tipo":"historico"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '11040', 'SAR IMSS', 'SAR IMSS', 'Recursos SAR administrados por IMSS', 4, true, '{"tipo":"historico"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '11050', 'SAR ISSSTE', 'SAR ISSSTE', 'Recursos SAR administrados por ISSSTE', 5, true, '{"tipo":"historico"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '12010', 'Aportaciones Voluntarias', 'AVO', 'Ahorro voluntario del trabajador', 6, true, '{"tipo":"voluntaria"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '12020', 'Aportaciones Complementarias', 'AVC', 'Ahorro voluntario complementario', 7, true, '{"tipo":"voluntaria"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '12030', 'Ahorro Largo Plazo', 'ALP', 'Ahorro voluntario largo plazo (5 años)', 8, true, '{"tipo":"voluntaria"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '12060', 'Ahorro Solidario', 'Solidario', 'Programa ahorro solidario ISSSTE', 9, true, '{"tipo":"solidario"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '12070', 'Cuota Social', 'Cuota Social', 'Aportación del Gobierno Federal', 10, true, '{"tipo":"gobierno"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '12090', 'Subcuenta Adicional', 'Adicional', 'Subcuenta adicional especial', 11, true, '{"tipo":"especial"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '12100', 'Bono Pensión ISSSTE', 'Bono ISSSTE', 'Bono de pensión trabajadores ISSSTE', 12, true, '{"tipo":"bono"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '12110', 'Vivienda', 'Vivienda', 'INFONAVIT/FOVISSSTE', 13, true, '{"tipo":"vivienda"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '12130', 'SAR 97', 'SAR 1997', 'Aportaciones SAR desde 1997', 14, true, '{"tipo":"obligatoria"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '12180', 'Reserva Régimen Anterior', 'Régimen Anterior', 'Reserva del régimen anterior', 15, true, '{"tipo":"historico"}', NOW(), NOW()),
    (gen_random_uuid(), 'a8000000-0000-0000-0000-000000000001', '12240', 'Otros Conceptos', 'Otros', 'Conceptos adicionales', 16, true, '{"tipo":"otros"}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 9. CATÁLOGO DE TIPOS DE ARCHIVO PROCESAR
-- Fuente: Nombres de archivo en ZIPs CONSAR (SB_530, PS_430, AV_630)
-- =============================================================================
INSERT INTO catalogs (id, code, name, description, version, is_active, effective_from, source, created_at, updated_at)
VALUES (
    'a9000000-0000-0000-0000-000000000001',
    'TIPOS_ARCHIVO_PROCESAR',
    'Catálogo de Tipos de Archivo PROCESAR',
    'Prefijos de archivo usados en intercambio PROCESAR',
    '2025.1',
    true,
    NOW(),
    'SEED',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

INSERT INTO catalog_entries (id, catalog_id, key, value, display_name, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'a9000000-0000-0000-0000-000000000001', 'SB_530', 'SIEFORE Básica', 'SB - SIEFORE Básica', 'Posiciones de inversión básica', 1, true, '{"afore":"530","tipo_inversion":"basica"}', NOW(), NOW()),
    (gen_random_uuid(), 'a9000000-0000-0000-0000-000000000001', 'PS_430', 'Posiciones SIEFORE', 'PS - Posiciones', 'Portafolio de inversiones SIEFORE', 2, true, '{"tipo":"portafolio"}', NOW(), NOW()),
    (gen_random_uuid(), 'a9000000-0000-0000-0000-000000000001', 'AV_630', 'Aportaciones Voluntarias', 'AV - Voluntarias', 'Archivo de aportaciones voluntarias', 3, true, '{"tipo":"voluntarias"}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 10. CATÁLOGO DE EXTENSIONES DE ARCHIVO PROCESAR
-- Fuente: Archivos extraídos de ZIPs CONSAR
-- =============================================================================
INSERT INTO catalogs (id, code, name, description, version, is_active, effective_from, source, created_at, updated_at)
VALUES (
    'aa000000-0000-0000-0000-000000000001',
    'EXTENSIONES_PROCESAR',
    'Catálogo de Extensiones PROCESAR',
    'Extensiones de archivo en intercambio PROCESAR',
    '2025.1',
    true,
    NOW(),
    'SEED',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

INSERT INTO catalog_entries (id, catalog_id, key, value, display_name, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'aa000000-0000-0000-0000-000000000001', '0300', 'Datos principales', '.0300', 'Datos principales de posiciones', 1, true, '{"contenido":"posiciones"}', NOW(), NOW()),
    (gen_random_uuid(), 'aa000000-0000-0000-0000-000000000001', '0314', 'Detalle instrumentos', '.0314', 'Detalle de posiciones por instrumento', 2, true, '{"contenido":"detalle"}', NOW(), NOW()),
    (gen_random_uuid(), 'aa000000-0000-0000-0000-000000000001', '0316', 'Header/Resumen', '.0316', 'Registro de encabezado del archivo', 3, true, '{"contenido":"header"}', NOW(), NOW()),
    (gen_random_uuid(), 'aa000000-0000-0000-0000-000000000001', '0317', 'Control/Totales', '.0317', 'Registro de control y totales', 4, true, '{"contenido":"control"}', NOW(), NOW()),
    (gen_random_uuid(), 'aa000000-0000-0000-0000-000000000001', '0321', 'Cierre', '.0321', 'Registro de cierre del archivo', 5, true, '{"contenido":"cierre"}', NOW(), NOW()),
    (gen_random_uuid(), 'aa000000-0000-0000-0000-000000000001', '1101', 'Catálogo Subcuentas', '.1101', 'Catálogo de subcuentas SAR', 6, true, '{"contenido":"catalogo"}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 11. CATÁLOGO DE SIEFORES GENERACIONALES
-- Fuente: Carpetas en ZIPs CONSAR (XXI6064, XXI6569, etc.)
-- =============================================================================
INSERT INTO catalogs (id, code, name, description, version, is_active, effective_from, source, created_at, updated_at)
VALUES (
    'ab000000-0000-0000-0000-000000000001',
    'SIEFORES_GENERACIONALES',
    'Catálogo de SIEFOREs Generacionales',
    'Fondos de inversión por generación de nacimiento',
    '2025.1',
    true,
    NOW(),
    'SEED',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

INSERT INTO catalog_entries (id, catalog_id, key, value, display_name, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'ab000000-0000-0000-0000-000000000001', '001000', 'Inicial', 'SB Inicial', 'SIEFORE Básica Inicial', 1, true, '{"generacion":"inicial","perfil":"conservador"}', NOW(), NOW()),
    (gen_random_uuid(), 'ab000000-0000-0000-0000-000000000001', '000090', 'Integrado', 'SB Integrado', 'SIEFORE Básica Integrada (transición)', 2, true, '{"generacion":"transicion","perfil":"mixto"}', NOW(), NOW()),
    (gen_random_uuid(), 'ab000000-0000-0000-0000-000000000001', '001960', 'SB 60-64', 'SB Generación 60-64', 'Nacidos entre 1960-1964', 3, true, '{"generacion":"60-64","anio_inicio":1960,"anio_fin":1964}', NOW(), NOW()),
    (gen_random_uuid(), 'ab000000-0000-0000-0000-000000000001', '001965', 'SB 65-69', 'SB Generación 65-69', 'Nacidos entre 1965-1969', 4, true, '{"generacion":"65-69","anio_inicio":1965,"anio_fin":1969}', NOW(), NOW()),
    (gen_random_uuid(), 'ab000000-0000-0000-0000-000000000001', '001970', 'SB 70-74', 'SB Generación 70-74', 'Nacidos entre 1970-1974', 5, true, '{"generacion":"70-74","anio_inicio":1970,"anio_fin":1974}', NOW(), NOW()),
    (gen_random_uuid(), 'ab000000-0000-0000-0000-000000000001', '001975', 'SB 75-79', 'SB Generación 75-79', 'Nacidos entre 1975-1979', 6, true, '{"generacion":"75-79","anio_inicio":1975,"anio_fin":1979}', NOW(), NOW()),
    (gen_random_uuid(), 'ab000000-0000-0000-0000-000000000001', '001980', 'SB 80-84', 'SB Generación 80-84', 'Nacidos entre 1980-1984', 7, true, '{"generacion":"80-84","anio_inicio":1980,"anio_fin":1984}', NOW(), NOW()),
    (gen_random_uuid(), 'ab000000-0000-0000-0000-000000000001', '001985', 'SB 85-89', 'SB Generación 85-89', 'Nacidos entre 1985-1989', 8, true, '{"generacion":"85-89","anio_inicio":1985,"anio_fin":1989}', NOW(), NOW()),
    (gen_random_uuid(), 'ab000000-0000-0000-0000-000000000001', '001990', 'SB 90-94', 'SB Generación 90-94', 'Nacidos entre 1990-1994', 9, true, '{"generacion":"90-94","anio_inicio":1990,"anio_fin":1994}', NOW(), NOW()),
    (gen_random_uuid(), 'ab000000-0000-0000-0000-000000000001', '001995', 'SB 95-99', 'SB Generación 95-99', 'Nacidos entre 1995-1999', 10, true, '{"generacion":"95-99","anio_inicio":1995,"anio_fin":1999}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 12. CATÁLOGO DE FONDOS ESPECIALES
-- Fuente: Carpetas especiales en ZIPs CONSAR
-- =============================================================================
INSERT INTO catalogs (id, code, name, description, version, is_active, effective_from, source, created_at, updated_at)
VALUES (
    'ac000000-0000-0000-0000-000000000001',
    'FONDOS_ESPECIALES',
    'Catálogo de Fondos Especiales',
    'Fondos de pensión de estados y entidades especiales',
    '2025.1',
    true,
    NOW(),
    'SEED',
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET updated_at = NOW();

INSERT INTO catalog_entries (id, catalog_id, key, value, display_name, description, sort_order, is_active, metadata, created_at, updated_at)
VALUES
    (gen_random_uuid(), 'ac000000-0000-0000-0000-000000000001', '1SSEMYM', 'ISSEMYM', 'ISSEMYM', 'Instituto de Seguridad Social del Estado de México y Municipios', 1, true, '{"estado":"Estado de México","tipo":"estatal"}', NOW(), NOW()),
    (gen_random_uuid(), 'ac000000-0000-0000-0000-000000000001', 'BMRPREV', 'Banorte Previsión', 'Banorte Previsión', 'Fondo de previsión Banorte', 2, true, '{"entidad":"Banorte","tipo":"prevision"}', NOW(), NOW()),
    (gen_random_uuid(), 'ac000000-0000-0000-0000-000000000001', 'CJUBILA', 'Caja Jubilados', 'Caja de Jubilados', 'Caja de jubilaciones especial', 3, true, '{"tipo":"jubilacion"}', NOW(), NOW()),
    (gen_random_uuid(), 'ac000000-0000-0000-0000-000000000001', 'ISSEMYM', 'ISSEMYM Alt', 'ISSEMYM Alternativo', 'ISSEMYM cuenta alternativa', 4, true, '{"estado":"Estado de México","tipo":"estatal_alt"}', NOW(), NOW()),
    (gen_random_uuid(), 'ac000000-0000-0000-0000-000000000001', 'ISSSTNL', 'ISSSTE NL', 'ISSSTE Nuevo León', 'ISSSTE Nuevo León', 5, true, '{"estado":"Nuevo León","tipo":"estatal"}', NOW(), NOW()),
    (gen_random_uuid(), 'ac000000-0000-0000-0000-000000000001', 'PMXSAR', 'Pensión México SAR', 'Pensión México', 'Fondo Pensión México SAR', 6, true, '{"tipo":"pension_mexico"}', NOW(), NOW()),
    (gen_random_uuid(), 'ac000000-0000-0000-0000-000000000001', 'SBRAICP', 'SIEFORE RAICP', 'SB RAICP', 'SIEFORE Básica RAICP (Aportaciones Voluntarias)', 7, true, '{"tipo":"voluntarias"}', NOW(), NOW()),
    (gen_random_uuid(), 'ac000000-0000-0000-0000-000000000001', 'SBRPSCP', 'SIEFORE PSCP', 'SB PSCP', 'SIEFORE Básica PSCP', 8, true, '{"tipo":"especial"}', NOW(), NOW()),
    (gen_random_uuid(), 'ac000000-0000-0000-0000-000000000001', 'XXINTEA', 'XXI Integrado A', 'XXI Banorte Integrado A', 'Fondo XXI Banorte Integrado A', 9, true, '{"afore":"530","tipo":"integrado"}', NOW(), NOW()),
    (gen_random_uuid(), 'ac000000-0000-0000-0000-000000000001', 'XXINTEB', 'XXI Integrado B', 'XXI Banorte Integrado B', 'Fondo XXI Banorte Integrado B', 10, true, '{"afore":"530","tipo":"integrado"}', NOW(), NOW()),
    (gen_random_uuid(), 'ac000000-0000-0000-0000-000000000001', 'XXINTEC', 'XXI Integrado C', 'XXI Banorte Integrado C', 'Fondo XXI Banorte Integrado C', 11, true, '{"afore":"530","tipo":"integrado"}', NOW(), NOW()),
    (gen_random_uuid(), 'ac000000-0000-0000-0000-000000000001', 'XXINTE0', 'XXI Integrado 0', 'XXI Banorte Integrado 0', 'Fondo XXI Banorte Integrado transición', 12, true, '{"afore":"530","tipo":"transicion"}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- =============================================================================
-- VERIFICACIÓN
-- =============================================================================
SELECT
    c.code as catalogo,
    c.name as nombre,
    COUNT(ce.id) as entradas
FROM catalogs c
LEFT JOIN catalog_entries ce ON ce.catalog_id = c.id
WHERE c.source = 'SEED'
GROUP BY c.code, c.name
ORDER BY c.code;
