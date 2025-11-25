/**
 * Premium Button Fintech Showcase Component
 *
 * Demo page to visualize the premium fintech button
 * with all states and variations
 *
 * @module PremiumButtonFintechShowcase
 */

import { useState } from 'react'
import { PremiumButtonFintech } from '@/components/ui'
import { Download, Send, CheckCircle, ArrowRight, Zap, Lock } from 'lucide-react'

export function PremiumButtonFintechShowcase() {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#070B14] p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Premium Button Fintech
          </h1>
          <p className="text-white/60 text-xl">
            Triple gradient · Glassmorphic glow · VisionOS inspired
          </p>
          <p className="text-white/40 text-sm mt-2">
            Professional banking & SaaS 2025 aesthetic
          </p>
        </div>

        {/* States Section */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white mb-6">Button States</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Normal State */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-4">Normal State</h3>
              <p className="text-white/60 text-sm mb-6">
                Default appearance with triple gradient and soft glow
              </p>
              <div className="flex flex-col gap-4">
                <PremiumButtonFintech label="Download Report" icon={Download} />
                <PremiumButtonFintech label="Send Payment" icon={Send} size="md" />
              </div>
            </div>

            {/* Hover State */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-4">Hover State</h3>
              <p className="text-white/60 text-sm mb-6">
                Enhanced glow, slight elevation, brightness increase
              </p>
              <div className="flex flex-col gap-4">
                <PremiumButtonFintech label="Hover over me" icon={Zap} />
                <p className="text-white/40 text-xs">
                  ↑ Hover to see enhanced glow and elevation
                </p>
              </div>
            </div>

            {/* Loading State */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-4">Loading State</h3>
              <p className="text-white/60 text-sm mb-6">
                Spinner with subtle pulse animation
              </p>
              <div className="flex flex-col gap-4">
                <PremiumButtonFintech
                  label="Processing..."
                  icon={Download}
                  loading={isLoading}
                  onClick={handleClick}
                />
                <button
                  onClick={handleClick}
                  className="text-white/60 text-sm hover:text-white transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Click to trigger loading'}
                </button>
              </div>
            </div>

            {/* Disabled State */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-4">Disabled State</h3>
              <p className="text-white/60 text-sm mb-6">
                Gray-blue translucent with muted glow
              </p>
              <div className="flex flex-col gap-4">
                <PremiumButtonFintech label="Action Unavailable" icon={Lock} disabled />
                <p className="text-white/40 text-xs">
                  ↑ Cannot interact with disabled button
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
                <PremiumButtonFintech label="Large Button" icon={CheckCircle} size="lg" />
              </div>

              {/* Medium */}
              <div className="w-full">
                <p className="text-white/60 text-sm mb-3">Medium (44px height, 20px radius)</p>
                <PremiumButtonFintech label="Medium Button" icon={CheckCircle} size="md" />
              </div>

              {/* Full Width */}
              <div className="w-full">
                <p className="text-white/60 text-sm mb-3">Full Width</p>
                <PremiumButtonFintech
                  label="Full Width Button"
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
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <PremiumButtonFintech label="Download" icon={Download} fullWidth />
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <PremiumButtonFintech label="Send" icon={Send} fullWidth />
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <PremiumButtonFintech label="Continue" icon={ArrowRight} fullWidth />
            </div>
          </div>
        </section>

        {/* Real-world Examples */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white mb-6">Real-world Examples</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Flow */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-4">Payment Flow</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-white/80 text-sm mb-1">Total Amount</p>
                  <p className="text-white text-2xl font-bold">$12,450.00</p>
                </div>
                <PremiumButtonFintech
                  label="Process Payment"
                  icon={CheckCircle}
                  size="lg"
                  fullWidth
                />
              </div>
            </div>

            {/* Document Download */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-4">Document Export</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <p className="text-white/80 text-sm mb-1">Report Ready</p>
                  <p className="text-white text-lg">Annual_Report_2024.pdf</p>
                </div>
                <PremiumButtonFintech
                  label="Download Report"
                  icon={Download}
                  size="lg"
                  fullWidth
                />
              </div>
            </div>
          </div>
        </section>

        {/* Design Specifications */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-white mb-6">Design Specifications</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-semibold mb-3">Gradient</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Blue: #3B82F6</p>
                <p>Purple: #8B5CF6</p>
                <p>Pink: #EC4899</p>
                <p>Angle: 135deg</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-semibold mb-3">Dimensions</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Height Large: 52px</p>
                <p>Height Medium: 44px</p>
                <p>Border Radius: 20-26px</p>
                <p>Padding: 32-48px</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-semibold mb-3">Typography</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Font: SF Pro / Inter</p>
                <p>Size: 14-15px</p>
                <p>Weight: Semibold (600)</p>
                <p>Color: White (#FFFFFF)</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-semibold mb-3">Effects</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Outer glow: 24-32px blur</p>
                <p>Inner glow: Radial gradient</p>
                <p>Border: rgba(255,255,255,0.22)</p>
                <p>Elevation: 2px on hover</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-semibold mb-3">States</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Normal: Base glow</p>
                <p>Hover: Enhanced glow +8%</p>
                <p>Press: Reduced brightness -8%</p>
                <p>Disabled: Gray-blue muted</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
              <h4 className="text-white font-semibold mb-3">Transitions</h4>
              <div className="space-y-2 text-white/60 text-sm">
                <p>Duration: 300ms</p>
                <p>Easing: ease-out</p>
                <p>Transform: cubic-bezier</p>
                <p>Filter: brightness</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
