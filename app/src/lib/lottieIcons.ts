/**
 * Lottie Icons Mapping - CERTUS ICONS v3.0 - SOLUCIÓN OPTIMIZADA
 *
 * CAMBIO ESTRATÉGICO:
 * Usar iconos ORIGINALES (sin procesar) y aplicar colores vía CSS filters
 * en LottieIcon.tsx según el tema (light/dark).
 *
 * RAZÓN:
 * El script generate-certus-icons.js destruía la estructura de los iconos
 * al reemplazar colores estructurales (blanco/negro para trazos/rellenos).
 *
 * SOLUCIÓN:
 * - Iconos originales mantienen detalles y estructura
 * - CSS filters aplican colores Certus según tema
 * - Mejor control y calidad visual
 *
 * Actualizado: 23 de noviembre de 2025
 */

// ============================================================
// ICONOS ORIGINALES - Un solo set, colores vía CSS
// ============================================================

import homeAnimation from '../../../icons/home.json'
import submitedAnimation from '../../../icons/Submited.json'
import reportsAnimation from '../../../icons/reports.json'
import catalogsAnimation from '../../../icons/catalogs.json'
import registerAnimation from '../../../icons/Register.json'
import settingAnimation from '../../../icons/setting.json'
import userProfileAnimation from '../../../icons/user-profile.json'
import notificationAnimation from '../../../icons/notification.json'
import lightModeAnimation from '../../../icons/light-mode.json'
import loadFileAnimation from '../../../icons/loadfile.json'
import analyticsAnimation from '../../../icons/analytics.json'
import approvalsAnimation from '../../../icons/approvals.json'
import validatorsAnimation from '../../../icons/validators.json'

// ============================================================
// EXPORTS UNIFICADOS
// ============================================================

export const lottieIcons = {
  home: homeAnimation,
  validations: submitedAnimation,
  reports: reportsAnimation,
  catalogs: catalogsAnimation,
  users: registerAnimation,
  settings: settingAnimation,
  userProfile: userProfileAnimation,
  notification: notificationAnimation,
  lightMode: lightModeAnimation,
  loadFile: loadFileAnimation,
  analytics: analyticsAnimation,
  approvals: approvalsAnimation,
  validators: validatorsAnimation,
}

// ============================================================
// COMPATIBILIDAD (para no romper código existente)
// ============================================================

// Ambos themes apuntan al mismo set de iconos
// Los colores se aplican vía CSS en LottieIcon.tsx
export const lottieIconsLight = lottieIcons
export const lottieIconsDark = lottieIcons

// ============================================================
// TYPES
// ============================================================

export type LottieIconKey = keyof typeof lottieIconsLight

// ============================================================
// HELPER FUNCTION
// ============================================================

/**
 * Obtiene el icono Lottie correcto según el tema (light/dark)
 *
 * @param key - Nombre del icono ('home', 'settings', etc.)
 * @param isDark - Si es dark mode
 * @returns Animation data con colores nativos Certus
 *
 * @example
 * const animationData = getLottieIcon('home', isDarkMode)
 */
export const getLottieIcon = (key: LottieIconKey, isDark: boolean) => {
  return isDark ? lottieIconsDark[key] : lottieIconsLight[key]
}

// ============================================================
// NOTA: lottieIcons ya está exportado en línea 40
// No se necesita export adicional
// ============================================================
