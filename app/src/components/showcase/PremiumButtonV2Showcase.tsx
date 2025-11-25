/**
 * Premium Button V2 Showcase
 *
 * Demo page for the ultra-premium VisionOS-Fintech 2026 button
 * Displays all states, sizes, and variations
 */

import { useState } from 'react'
import { PremiumButtonV2 } from '@/components/ui/premium-button-v2'
import { Upload, Download, Send, CheckCircle, ArrowRight, Zap, Lock, Save } from 'lucide-react'

export function PremiumButtonV2Showcase() {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2500)
  }

  return (
    <div className="min-h-screen bg-[#070B14] p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Premium Button V2
          </h1>
          <p className="text-white/60 text-xl">
            VisionOS · Fintech 2026 · Ultra-Premium Aesthetics
          </p>
          <p className="text-white/40 text-sm mt-2">
            Atmospheric lighting · 3D depth · Professional gradients
          </p>
        </div>

        {/* Main Demo - Featured */}
        <section className="space-y-8">
          <div className="flex items-center justify-center p-16 rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.08]">
            <PremiumButtonV2
              label="Subir Archivo"
              icon={Upload}
              size="lg"
            />
          </div>
        </section>

        {/* States Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white mb-6">Button States</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Normal State */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-4">Normal State</h3>
              <p className="text-white/60 text-sm mb-6">
                Atmospheric glow with multi-layer depth and dual border system
              </p>
              <div className="flex flex-col gap-4 items-start">
                <PremiumButtonV2 label="Subir Archivo" icon={Upload} size="lg" />
                <PremiumButtonV2 label="Descargar Reporte" icon={Download} size="lg" />
              </div>
            </div>

            {/* Hover State */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-4">Hover State</h3>
              <p className="text-white/60 text-sm mb-6">
                Enhanced bloom, +10% brightness, subtle elevation
              </p>
              <div className="flex flex-col gap-4 items-start">
                <PremiumButtonV2 label="Hover sobre mí" icon={Zap} size="lg" />
                <p className="text-white/40 text-xs">
                  ↑ Pasa el mouse para ver el efecto de elevación y brillo
                </p>
              </div>
            </div>

            {/* Loading State */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-4">Loading State</h3>
              <p className="text-white/60 text-sm mb-6">
                Atmospheric pulse animation with spinner
              </p>
              <div className="flex flex-col gap-4 items-start">
                <PremiumButtonV2
                  label="Procesando..."
                  icon={Upload}
                  size="lg"
                  loading={isLoading}
                  onClick={handleClick}
                />
                <button
                  onClick={handleClick}
                  className="text-white/60 text-sm hover:text-white transition-colors"
                >
                  {isLoading ? 'Cargando...' : 'Click para activar loading'}
                </button>
              </div>
            </div>

            {/* Disabled State */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-4">Disabled State</h3>
              <p className="text-white/60 text-sm mb-6">
                Muted glow with grayscale effect
              </p>
              <div className="flex flex-col gap-4 items-start">
                <PremiumButtonV2 label="Acción Bloqueada" icon={Lock} size="lg" disabled />
                <p className="text-white/40 text-xs">
                  ↑ No se puede interactuar con el botón deshabilitado
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sizes Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white mb-6">Size Variants</h2>

          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="flex flex-col gap-6 items-start">
              {/* Large */}
              <div className="w-full">
                <p className="text-white/60 text-sm mb-3">Large (52px height, 26px radius)</p>
                <PremiumButtonV2 label="Subir Archivo" icon={Upload} size="lg" />
              </div>

              {/* Medium */}
              <div className="w-full">
                <p className="text-white/60 text-sm mb-3">Medium (46px height, 23px radius)</p>
                <PremiumButtonV2 label="Enviar Datos" icon={Send} size="md" />
              </div>

              {/* Small */}
              <div className="w-full">
                <p className="text-white/60 text-sm mb-3">Small (40px height, 20px radius)</p>
                <PremiumButtonV2 label="Guardar" icon={Save} size="sm" />
              </div>

              {/* Full Width */}
              <div className="w-full">
                <p className="text-white/60 text-sm mb-3">Full Width</p>
                <PremiumButtonV2
                  label="Continuar al Siguiente Paso"
                  icon={ArrowRight}
                  size="lg"
                  fullWidth
                />
              </div>
            </div>
          </div>
        </section>

        {/* Icon Variations */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white mb-6">Icon Variations</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center">
              <PremiumButtonV2 label="Subir" icon={Upload} size="md" />
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center">
              <PremiumButtonV2 label="Descargar" icon={Download} size="md" />
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center">
              <PremiumButtonV2 label="Enviar" icon={Send} size="md" />
            </div>
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white mb-6">Real-world Use Cases</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* File Upload Flow */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-4">Carga de Archivos CONSAR</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-white/80 text-sm mb-1">Archivos seleccionados</p>
                  <p className="text-white text-lg font-bold">3 archivos válidos</p>
                  <p className="text-white/60 text-xs mt-1">NOMINA_20240315.txt, CONTABLE_20240315.csv</p>
                </div>
                <PremiumButtonV2
                  label="Subir 3 Archivos"
                  icon={Upload}
                  size="lg"
                  fullWidth
                />
              </div>
            </div>

            {/* Payment Confirmation */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-4">Confirmación de Operación</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-white/80 text-sm mb-1">Registros procesados</p>
                  <p className="text-white text-2xl font-bold">12,450</p>
                </div>
                <PremiumButtonV2
                  label="Confirmar y Procesar"
                  icon={CheckCircle}
                  size="lg"
                  fullWidth
                />
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white mb-6">Technical Specifications</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-semibold mb-3">Gradient System</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Blue: #3B82F6</p>
                <p>Violet: #7C4DFF</p>
                <p>Magenta: #EC4899</p>
                <p>Angle: 135deg</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-semibold mb-3">Lighting Effects</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Outer glow: 16-22px blur</p>
                <p>Inner glow: Radial top</p>
                <p>Light bloom: 45% height</p>
                <p>Icon micro-glow: 4-6px</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-semibold mb-3">Dual Border</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Outer: rgba(255,255,255,0.15)</p>
                <p>Inner: rgba(96,165,250,0.35)</p>
                <p>Top highlight: 0.5-1.5px</p>
                <p>Institutional blue glow</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-semibold mb-3">Typography</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Font: SF Pro / Inter</p>
                <p>Weight: Semibold (600)</p>
                <p>Size: 14-16px</p>
                <p>Shadow: 1px soft</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-semibold mb-3">Microinteractions</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Hover: +1.5px elevation</p>
                <p>Hover: +10% brightness</p>
                <p>Press: -1px compression</p>
                <p>Focus: Accessibility ring</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-semibold mb-3">3D Depth</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Multi-layer shadows</p>
                <p>Atmospheric volume</p>
                <p>Icon emboss effect</p>
                <p>Tactile feedback</p>
              </div>
            </div>
          </div>
        </section>

        {/* Design Philosophy */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">Design Philosophy</h2>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.08]">
            <div className="prose prose-invert max-w-none">
              <p className="text-white/80 text-lg mb-4">
                Este botón representa la culminación de diseño premium para aplicaciones
                financieras institucionales en 2026, fusionando:
              </p>
              <ul className="text-white/70 space-y-2">
                <li><strong className="text-white">VisionOS Depth:</strong> Iluminación atmosférica y profundidad 3D tangible</li>
                <li><strong className="text-white">Linear 2025:</strong> Gradientes profesionales con propósito institucional</li>
                <li><strong className="text-white">Arc Browser:</strong> Microinteracciones fluidas y responsivas</li>
                <li><strong className="text-white">Raycast Pro:</strong> Feedback táctil inmediato y preciso</li>
                <li><strong className="text-white">CERTUS Premium:</strong> Confianza, profesionalismo y calidad bancaria</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
