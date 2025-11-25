#!/usr/bin/env node

/**
 * CERTUS LOTTIE ICON GENERATOR
 *
 * Convierte iconos Lottie JSON existentes a versiones con colores Certus nativos
 * Genera versiones separadas para Light Mode y Dark Mode
 *
 * Uso:
 *   node scripts/generate-certus-icons.js
 *
 * Requisitos:
 *   - Node.js 16+
 *   - Archivos Lottie JSON en /icons/
 *
 * Output:
 *   - /icons/{icon-name}-light.json
 *   - /icons/{icon-name}-dark.json
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURACIÓN DE COLORES CERTUS
// ============================================================

const CERTUS_COLORS = {
  // Light Mode - Primary Blue (OSCURO Y PROFUNDO)
  light: {
    primary: [30/255, 64/255, 175/255],      // #1E40AF (dark blue - MÁS OSCURO)
    secondary: [37/255, 99/255, 235/255],    // #2563EB (medium blue)
    light: [59/255, 130/255, 246/255],       // #3B82F6 (lighter)
    neutral: [100/255, 116/255, 139/255],    // #64748B (for details)
  },
  // Dark Mode - Cyan/Sky Blue
  dark: {
    primary: [56/255, 189/255, 248/255],     // #38BDF8 (cyan - MÁS SATURADO)
    secondary: [96/255, 165/255, 250/255],   // #60A5FA (sky blue)
    light: [125/255, 211/255, 252/255],      // #7DD3FC (lighter)
    neutral: [148/255, 163/255, 184/255],    // #94A3B8 (for details)
  },
  // Special colors (used in both modes)
  special: {
    white: [1, 1, 1],                        // #FFFFFF
    red: [239/255, 68/255, 68/255],          // #EF4444 (notifications)
    yellow: [251/255, 191/255, 36/255],      // #FBBF24 (sun icon)
  }
};

// Mapeo de colores antiguos a nuevos
const COLOR_MAPPING = {
  // Colores blancos/claros → Primary color
  '[1,1,1]': 'primary',
  '[0.95,0.95,0.95]': 'primary',
  '[0.9,0.9,0.9]': 'secondary',

  // Colores azules genéricos → Certus blue
  '[0.325,0.427,0.996]': 'primary',  // Color azul actual en JSONs
  '[0.2,0.4,0.99]': 'primary',
  '[0.231,0.510,0.965]': 'secondary',

  // Grises → Neutral
  '[0.5,0.5,0.5]': 'neutral',
  '[0.7,0.7,0.7]': 'neutral',
};

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

/**
 * Normaliza un array de color RGB para comparación
 */
function normalizeColor(colorArray) {
  if (!Array.isArray(colorArray) || colorArray.length < 3) return null;
  return colorArray.slice(0, 3).map(c => Math.round(c * 1000) / 1000);
}

/**
 * Compara dos colores con tolerancia
 */
function colorsMatch(color1, color2, tolerance = 0.05) {
  if (!color1 || !color2) return false;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(color1[i] - color2[i]) > tolerance) return false;
  }
  return true;
}

/**
 * Detecta el tipo de color (primary, secondary, neutral, etc.)
 */
function detectColorType(colorArray) {
  const normalized = normalizeColor(colorArray);
  if (!normalized) return 'primary';

  const colorStr = JSON.stringify(normalized);

  // Check exact matches primero
  if (COLOR_MAPPING[colorStr]) {
    return COLOR_MAPPING[colorStr];
  }

  // Verificar si es blanco/muy claro
  if (normalized.every(c => c > 0.85)) {
    return 'primary';
  }

  // Verificar si es gris/neutral
  const avg = normalized.reduce((a, b) => a + b) / 3;
  const variance = normalized.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / 3;
  if (variance < 0.01) {  // Baja varianza = gris
    return 'neutral';
  }

  // Verificar si es azulado
  const [r, g, b] = normalized;
  if (b > r && b > g && b > 0.5) {
    return 'primary';
  }

  // Default
  return 'secondary';
}

/**
 * Reemplaza colores en un objeto JSON recursivamente
 */
function replaceColors(obj, mode = 'light', depth = 0) {
  if (depth > 100) return; // Prevenir recursión infinita

  if (typeof obj !== 'object' || obj === null) return;

  // Procesar arrays
  if (Array.isArray(obj)) {
    obj.forEach(item => replaceColors(item, mode, depth + 1));
    return;
  }

  // Procesar objetos
  for (let key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    // Detectar color property: "c" con "k" array
    if (key === 'c' && obj[key] && obj[key].k && Array.isArray(obj[key].k)) {
      const currentColor = obj[key].k;

      // Si es un array de keyframes (animado)
      if (currentColor[0] && typeof currentColor[0] === 'object' && currentColor[0].s) {
        // Animación con keyframes - reemplazar cada frame
        currentColor.forEach(keyframe => {
          if (keyframe.s && Array.isArray(keyframe.s)) {
            const colorType = detectColorType(keyframe.s);
            keyframe.s = CERTUS_COLORS[mode][colorType] || CERTUS_COLORS[mode].primary;
          }
          if (keyframe.e && Array.isArray(keyframe.e)) {
            const colorType = detectColorType(keyframe.e);
            keyframe.e = CERTUS_COLORS[mode][colorType] || CERTUS_COLORS[mode].primary;
          }
        });
      }
      // Si es un array simple de RGB
      else if (typeof currentColor[0] === 'number') {
        const colorType = detectColorType(currentColor);
        obj[key].k = CERTUS_COLORS[mode][colorType] || CERTUS_COLORS[mode].primary;
      }
    }

    // Recursión para propiedades anidadas
    if (typeof obj[key] === 'object') {
      replaceColors(obj[key], mode, depth + 1);
    }
  }
}

/**
 * Procesa un archivo JSON y genera versiones light/dark
 */
function processLottieFile(inputPath) {
  console.log(`\n📄 Procesando: ${path.basename(inputPath)}`);

  try {
    // Leer archivo
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const lottieData = JSON.parse(rawData);

    // Clonar para cada modo
    const lightData = JSON.parse(JSON.stringify(lottieData));
    const darkData = JSON.parse(JSON.stringify(lottieData));

    // Reemplazar colores
    console.log('  🎨 Aplicando colores Light Mode...');
    replaceColors(lightData, 'light');

    console.log('  🌙 Aplicando colores Dark Mode...');
    replaceColors(darkData, 'dark');

    // Actualizar nombres
    lightData.nm = lottieData.nm + '-light';
    darkData.nm = lottieData.nm + '-dark';

    // Generar paths de salida
    const dir = path.dirname(inputPath);
    const baseName = path.basename(inputPath, '.json');
    const lightPath = path.join(dir, `${baseName}-light.json`);
    const darkPath = path.join(dir, `${baseName}-dark.json`);

    // Guardar archivos
    fs.writeFileSync(lightPath, JSON.stringify(lightData, null, 2));
    fs.writeFileSync(darkPath, JSON.stringify(darkData, null, 2));

    // Stats
    const originalSize = Buffer.byteLength(rawData, 'utf8');
    const lightSize = fs.statSync(lightPath).size;
    const darkSize = fs.statSync(darkPath).size;

    console.log(`  ✅ Light Mode: ${lightPath}`);
    console.log(`     Tamaño: ${(lightSize / 1024).toFixed(2)} KB`);
    console.log(`  ✅ Dark Mode: ${darkPath}`);
    console.log(`     Tamaño: ${(darkSize / 1024).toFixed(2)} KB`);
    console.log(`  📊 Original: ${(originalSize / 1024).toFixed(2)} KB → Total: ${((lightSize + darkSize) / 1024).toFixed(2)} KB`);

    return { success: true, lightPath, darkPath, lightSize, darkSize };

  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Genera script de importación para lottieIcons.ts
 */
function generateImportScript(results) {
  const lightImports = [];
  const darkImports = [];
  const lightExports = {};
  const darkExports = {};

  results.forEach(result => {
    if (!result.success) return;

    const baseName = path.basename(result.lightPath, '-light.json');
    const camelCase = baseName
      .split(/[-_]/)
      .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const varNameLight = `${camelCase}LightAnimation`;
    const varNameDark = `${camelCase}DarkAnimation`;

    lightImports.push(`import ${varNameLight} from '../../../icons/${baseName}-light.json'`);
    darkImports.push(`import ${varNameDark} from '../../../icons/${baseName}-dark.json'`);

    lightExports[camelCase] = varNameLight;
    darkExports[camelCase] = varNameDark;
  });

  let script = `/**
 * Lottie Icons Mapping - CERTUS CUSTOM ICONS
 * Auto-generado por generate-certus-icons.js
 * Fecha: ${new Date().toISOString().split('T')[0]}
 */

// ============================================================
// LIGHT MODE ICONS
// ============================================================

${lightImports.join('\n')}

// ============================================================
// DARK MODE ICONS
// ============================================================

${darkImports.join('\n')}

// ============================================================
// EXPORTS
// ============================================================

export const lottieIconsLight = {
${Object.entries(lightExports).map(([key, val]) => `  ${key}: ${val},`).join('\n')}
}

export const lottieIconsDark = {
${Object.entries(darkExports).map(([key, val]) => `  ${key}: ${val},`).join('\n')}
}

export type LottieIconKey = keyof typeof lottieIconsLight

/**
 * Helper function para obtener icono según modo
 */
export const getLottieIcon = (key: LottieIconKey, isDark: boolean) => {
  return isDark ? lottieIconsDark[key] : lottieIconsLight[key]
}
`;

  return script;
}

// ============================================================
// MAIN EXECUTION
// ============================================================

function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   CERTUS LOTTIE ICON GENERATOR                         ║');
  console.log('║   Generando iconos personalizados con colores Certus  ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const iconsDir = path.join(__dirname, '..', 'icons');

  // Verificar que existe el directorio
  if (!fs.existsSync(iconsDir)) {
    console.error(`❌ Error: Directorio ${iconsDir} no encontrado`);
    process.exit(1);
  }

  // Leer archivos JSON (excluir ya procesados *-light.json, *-dark.json)
  const files = fs.readdirSync(iconsDir)
    .filter(file => file.endsWith('.json'))
    .filter(file => !file.endsWith('-light.json') && !file.endsWith('-dark.json'))
    .map(file => path.join(iconsDir, file));

  if (files.length === 0) {
    console.log('⚠️  No se encontraron archivos JSON para procesar');
    process.exit(0);
  }

  console.log(`\n📦 Encontrados ${files.length} archivos para procesar:\n`);
  files.forEach(file => console.log(`   - ${path.basename(file)}`));

  // Procesar cada archivo
  const results = files.map(processLottieFile);

  // Estadísticas finales
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalSize = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.lightSize + r.darkSize, 0);

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   RESUMEN                                              ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`✅ Exitosos: ${successful * 2} archivos (${successful} pares)`);
  console.log(`❌ Fallidos: ${failed} archivos`);
  console.log(`📊 Tamaño total: ${(totalSize / 1024).toFixed(2)} KB`);

  // Generar script de importación
  if (successful > 0) {
    const importScript = generateImportScript(results.filter(r => r.success));
    const importScriptPath = path.join(__dirname, '..', 'app', 'src', 'lib', 'lottieIcons-generated.ts');

    fs.writeFileSync(importScriptPath, importScript);
    console.log(`\n📝 Script de importación generado:`);
    console.log(`   ${importScriptPath}`);
    console.log(`\n💡 Próximos pasos:`);
    console.log(`   1. Revisar archivos generados en /icons/`);
    console.log(`   2. Validar colores visualmente`);
    console.log(`   3. Reemplazar lottieIcons.ts con lottieIcons-generated.ts`);
    console.log(`   4. Actualizar LottieIcon.tsx para usar getLottieIcon()`);
  }

  console.log('\n🎉 Proceso completado!\n');
}

// Ejecutar
main();
