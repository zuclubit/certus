/**
 * Lottie Icons Mapping - CERTUS CUSTOM ICONS
 * Auto-generado por generate-certus-icons.js
 * Fecha: 2025-11-23
 */

// ============================================================
// LIGHT MODE ICONS
// ============================================================

import RegisterLightAnimation from '../../../icons/Register-light.json'
import SubmitedLightAnimation from '../../../icons/Submited-light.json'
import analyticsLightAnimation from '../../../icons/analytics-light.json'
import catalogsLightAnimation from '../../../icons/catalogs-light.json'
import homeLightAnimation from '../../../icons/home-light.json'
import lightModeLightAnimation from '../../../icons/light-mode-light.json'
import loadfileLightAnimation from '../../../icons/loadfile-light.json'
import notificationLightAnimation from '../../../icons/notification-light.json'
import reportsLightAnimation from '../../../icons/reports-light.json'
import settingLightAnimation from '../../../icons/setting-light.json'
import userProfileLightAnimation from '../../../icons/user-profile-light.json'

// ============================================================
// DARK MODE ICONS
// ============================================================

import RegisterDarkAnimation from '../../../icons/Register-dark.json'
import SubmitedDarkAnimation from '../../../icons/Submited-dark.json'
import analyticsDarkAnimation from '../../../icons/analytics-dark.json'
import catalogsDarkAnimation from '../../../icons/catalogs-dark.json'
import homeDarkAnimation from '../../../icons/home-dark.json'
import lightModeDarkAnimation from '../../../icons/light-mode-dark.json'
import loadfileDarkAnimation from '../../../icons/loadfile-dark.json'
import notificationDarkAnimation from '../../../icons/notification-dark.json'
import reportsDarkAnimation from '../../../icons/reports-dark.json'
import settingDarkAnimation from '../../../icons/setting-dark.json'
import userProfileDarkAnimation from '../../../icons/user-profile-dark.json'

// ============================================================
// EXPORTS
// ============================================================

export const lottieIconsLight = {
  Register: RegisterLightAnimation,
  Submited: SubmitedLightAnimation,
  analytics: analyticsLightAnimation,
  catalogs: catalogsLightAnimation,
  home: homeLightAnimation,
  lightMode: lightModeLightAnimation,
  loadfile: loadfileLightAnimation,
  notification: notificationLightAnimation,
  reports: reportsLightAnimation,
  setting: settingLightAnimation,
  userProfile: userProfileLightAnimation,
}

export const lottieIconsDark = {
  Register: RegisterDarkAnimation,
  Submited: SubmitedDarkAnimation,
  analytics: analyticsDarkAnimation,
  catalogs: catalogsDarkAnimation,
  home: homeDarkAnimation,
  lightMode: lightModeDarkAnimation,
  loadfile: loadfileDarkAnimation,
  notification: notificationDarkAnimation,
  reports: reportsDarkAnimation,
  setting: settingDarkAnimation,
  userProfile: userProfileDarkAnimation,
}

export type LottieIconKey = keyof typeof lottieIconsLight

/**
 * Helper function para obtener icono según modo
 */
export const getLottieIcon = (key: LottieIconKey, isDark: boolean) => {
  return isDark ? lottieIconsDark[key] : lottieIconsLight[key]
}
