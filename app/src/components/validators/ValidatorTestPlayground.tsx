/**
 * Validator Test Playground - VisionOS Enterprise 2026
 *
 * Interactive testing environment for validators
 * Features: Test case management, execution, results visualization
 */

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { PremiumButtonV2 } from '@/components/ui/premium-button-v2'
import { JsonErrorModal } from './ValidatorModals'
import {
  Play,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  FileJson,
} from 'lucide-react'
import type { ValidatorTestCase, ValidatorTestResult, TestResultStatus } from '@/types'

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ValidatorTestPlaygroundProps {
  validatorId: string
  testCases: ValidatorTestCase[]
  testResults: ValidatorTestResult[]
  onRunTest: (testCaseId: string) => Promise<void>
  onRunAllTests: () => Promise<void>
  onAddTestCase: (testCase: Omit<ValidatorTestCase, 'id'>) => void
  onDeleteTestCase: (testCaseId: string) => void
  isDark?: boolean
  className?: string
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get result status configuration
 */
function getResultConfig(status: TestResultStatus): {
  icon: React.ElementType
  color: string
  bgColor: string
  label: string
} {
  switch (status) {
    case 'passed':
      return {
        icon: CheckCircle2,
        color: 'text-green-400',
        bgColor: 'rgba(34, 197, 94, 0.15)',
        label: 'Passed',
      }
    case 'failed':
      return {
        icon: XCircle,
        color: 'text-red-400',
        bgColor: 'rgba(239, 68, 68, 0.15)',
        label: 'Failed',
      }
    case 'error':
      return {
        icon: XCircle,
        color: 'text-orange-400',
        bgColor: 'rgba(249, 115, 22, 0.15)',
        label: 'Error',
      }
    case 'skipped':
      return {
        icon: Clock,
        color: 'text-neutral-500',
        bgColor: 'rgba(163, 163, 163, 0.15)',
        label: 'Skipped',
      }
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export const ValidatorTestPlayground = React.forwardRef<HTMLDivElement, ValidatorTestPlaygroundProps>(
  (
    {
      validatorId,
      testCases,
      testResults,
      onRunTest,
      onRunAllTests,
      onAddTestCase,
      onDeleteTestCase,
      isDark = true,
      className,
    },
    ref
  ) => {
    const [isRunning, setIsRunning] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const [showJsonError, setShowJsonError] = useState(false)
    const [newTestCase, setNewTestCase] = useState({
      name: '',
      description: '',
      input: '{}',
      expectedResult: 'passed' as TestResultStatus,
      expectedMessage: '',
    })

    const handleRunAllTests = async () => {
      setIsRunning(true)
      try {
        await onRunAllTests()
      } finally {
        setIsRunning(false)
      }
    }

    const handleRunTest = async (testCaseId: string) => {
      setIsRunning(true)
      try {
        await onRunTest(testCaseId)
      } finally {
        setIsRunning(false)
      }
    }

    const handleAddTestCase = () => {
      try {
        const input = JSON.parse(newTestCase.input)
        onAddTestCase({
          validatorId,
          name: newTestCase.name,
          description: newTestCase.description,
          input,
          expectedResult: newTestCase.expectedResult,
          expectedMessage: newTestCase.expectedMessage || undefined,
          createdAt: new Date().toISOString(),
          createdBy: 'current-user',
        })
        setNewTestCase({
          name: '',
          description: '',
          input: '{}',
          expectedResult: 'passed',
          expectedMessage: '',
        })
        setShowAddForm(false)
      } catch (error) {
        setShowJsonError(true)
      }
    }

    // Calculate stats
    const totalTests = testResults.length
    const passedTests = testResults.filter((r) => r.status === 'passed').length
    const failedTests = testResults.filter((r) => r.status === 'failed').length
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0

    return (
      <div
        ref={ref}
        className={cn(
          'glass-ultra-premium depth-layer-3 rounded-[20px] overflow-hidden',
          className
        )}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(15,15,20,0.95) 0%, rgba(20,20,25,0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,255,0.98) 100%)',
          backdropFilter: 'blur(24px) saturate(120%)',
          border: isDark
            ? '1.5px solid rgba(255,255,255,0.08)'
            : '1.5px solid rgba(255,255,255,0.4)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b"
          style={{
            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div>
              <h3
                className={cn(
                  'ios-text-body ios-font-semibold mb-1',
                  isDark ? 'text-neutral-200' : 'text-neutral-800'
                )}
              >
                Test Playground
              </h3>
              <p
                className={cn(
                  'ios-text-footnote ios-font-regular',
                  isDark ? 'text-neutral-500' : 'text-neutral-600'
                )}
              >
                {testCases.length} test cases
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <PremiumButtonV2
                onClick={() => setShowAddForm(!showAddForm)}
                variant="secondary"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Test
              </PremiumButtonV2>

              <PremiumButtonV2
                onClick={handleRunAllTests}
                disabled={isRunning || testCases.length === 0}
                variant="primary"
                size="sm"
              >
                <Play className={cn('h-4 w-4 mr-2', isRunning && 'animate-spin')} />
                Ejecutar Todos
              </PremiumButtonV2>
            </div>
          </div>

          {/* Stats */}
          {totalTests > 0 && (
            <div className="grid grid-cols-1 xxs:grid-cols-2 sm:grid-cols-3 gap-3">
              <div
                className="px-3 py-2 rounded-[8px]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                }}
              >
                <p
                  className={cn(
                    'ios-text-caption2 ios-font-regular mb-0.5',
                    isDark ? 'text-neutral-500' : 'text-neutral-600'
                  )}
                >
                  Pass Rate
                </p>
                <p
                  className={cn(
                    'ios-text-body ios-font-bold',
                    passRate >= 90 ? 'text-green-400' : passRate >= 70 ? 'text-yellow-400' : 'text-red-400'
                  )}
                >
                  {passRate.toFixed(0)}%
                </p>
              </div>

              <div
                className="px-3 py-2 rounded-[8px]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                }}
              >
                <p
                  className={cn(
                    'ios-text-caption2 ios-font-regular mb-0.5',
                    isDark ? 'text-neutral-500' : 'text-neutral-600'
                  )}
                >
                  Passed
                </p>
                <p className={cn('ios-text-body ios-font-bold text-green-400')}>
                  {passedTests}/{totalTests}
                </p>
              </div>

              <div
                className="px-3 py-2 rounded-[8px]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                }}
              >
                <p
                  className={cn(
                    'ios-text-caption2 ios-font-regular mb-0.5',
                    isDark ? 'text-neutral-500' : 'text-neutral-600'
                  )}
                >
                  Failed
                </p>
                <p className={cn('ios-text-body ios-font-bold text-red-400')}>
                  {failedTests}/{totalTests}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Add Test Form */}
        {showAddForm && (
          <div
            className="px-6 py-4 border-b space-y-3"
            style={{
              borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              background: isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)',
            }}
          >
            <div>
              <label
                className={cn(
                  'block ios-text-caption2 ios-font-semibold mb-1',
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                )}
              >
                Nombre del Test
              </label>
              <input
                type="text"
                value={newTestCase.name}
                onChange={(e) => setNewTestCase({ ...newTestCase, name: e.target.value })}
                placeholder="Test de validación..."
                className={cn(
                  'w-full px-3 py-2 rounded-[8px]',
                  'ios-text-callout ios-font-regular',
                  'focus:outline-none focus:ring-2',
                  isDark
                    ? 'bg-white/5 text-neutral-200 placeholder-neutral-600 border border-white/10 focus:ring-blue-500/50'
                    : 'bg-black/5 text-neutral-800 placeholder-neutral-500 border border-black/10 focus:ring-blue-500/50'
                )}
              />
            </div>

            <div>
              <label
                className={cn(
                  'block ios-text-caption2 ios-font-semibold mb-1',
                  isDark ? 'text-neutral-400' : 'text-neutral-600'
                )}
              >
                Input (JSON)
              </label>
              <textarea
                value={newTestCase.input}
                onChange={(e) => setNewTestCase({ ...newTestCase, input: e.target.value })}
                placeholder='{"field": "value"}'
                rows={3}
                className={cn(
                  'w-full px-3 py-2 rounded-[8px] font-mono text-sm',
                  'focus:outline-none focus:ring-2',
                  isDark
                    ? 'bg-white/5 text-neutral-200 placeholder-neutral-600 border border-white/10 focus:ring-blue-500/50'
                    : 'bg-black/5 text-neutral-800 placeholder-neutral-500 border border-black/10 focus:ring-blue-500/50'
                )}
              />
            </div>

            <div className="flex items-center gap-2">
              <PremiumButtonV2
                onClick={handleAddTestCase}
                disabled={!newTestCase.name || !newTestCase.input}
                variant="primary"
                size="sm"
              >
                Agregar Test
              </PremiumButtonV2>

              <PremiumButtonV2
                onClick={() => setShowAddForm(false)}
                variant="ghost"
                size="sm"
              >
                Cancelar
              </PremiumButtonV2>
            </div>
          </div>
        )}

        {/* Test Cases List */}
        <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
          {testCases.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileJson
                className={cn('h-12 w-12 mx-auto mb-4', isDark ? 'text-neutral-600' : 'text-neutral-400')}
              />
              <p
                className={cn(
                  'ios-text-body ios-font-semibold mb-2',
                  isDark ? 'text-neutral-500' : 'text-neutral-600'
                )}
              >
                No hay test cases
              </p>
              <p
                className={cn(
                  'ios-text-footnote ios-font-regular',
                  isDark ? 'text-neutral-600' : 'text-neutral-500'
                )}
              >
                Agrega test cases para validar el comportamiento del validador
              </p>
            </div>
          ) : (
            testCases.map((testCase) => {
              const result = testResults.find((r) => r.testCaseId === testCase.id)
              const resultConfig = result ? getResultConfig(result.status) : null
              const ResultIcon = resultConfig?.icon

              return (
                <div
                  key={testCase.id}
                  className={cn(
                    'px-6 py-4 transition-colors',
                    isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                  )}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <h4
                          className={cn(
                            'ios-text-callout ios-font-semibold',
                            isDark ? 'text-neutral-200' : 'text-neutral-800'
                          )}
                        >
                          {testCase.name}
                        </h4>

                        {result && ResultIcon && (
                          <div
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px]',
                              'ios-text-caption2 ios-font-semibold'
                            )}
                            style={{
                              background: resultConfig.bgColor,
                              color: resultConfig.color,
                            }}
                          >
                            <ResultIcon className="h-3 w-3" />
                            {resultConfig.label}
                          </div>
                        )}
                      </div>

                      {/* Input Preview */}
                      <div
                        className="px-3 py-2 rounded-[8px] mb-2"
                        style={{
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Code className={cn('h-3 w-3', isDark ? 'text-neutral-500' : 'text-neutral-600')} />
                          <span
                            className={cn(
                              'ios-text-caption2 ios-font-semibold',
                              isDark ? 'text-neutral-500' : 'text-neutral-600'
                            )}
                          >
                            Input:
                          </span>
                        </div>
                        <pre
                          className={cn(
                            'text-xs font-mono overflow-x-auto scrollbar-hide',
                            isDark ? 'text-neutral-400' : 'text-neutral-700'
                          )}
                        >
                          {JSON.stringify(testCase.input, null, 2)}
                        </pre>
                      </div>

                      {/* Result Message */}
                      {result && (
                        <p
                          className={cn(
                            'ios-text-footnote ios-font-regular',
                            result.matched ? 'text-green-400' : 'text-red-400'
                          )}
                        >
                          {result.matched ? '✓ Resultado esperado' : `✗ ${result.actualMessage}`}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <PremiumButtonV2
                        onClick={() => handleRunTest(testCase.id)}
                        disabled={isRunning}
                        variant="secondary"
                        size="sm"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </PremiumButtonV2>

                      <button
                        onClick={() => onDeleteTestCase(testCase.id)}
                        className={cn(
                          'p-2 rounded-[8px] transition-colors',
                          'hover:bg-red-500/10 text-red-400'
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* JSON Error Modal */}
        <JsonErrorModal
          open={showJsonError}
          onOpenChange={setShowJsonError}
        />
      </div>
    )
  }
)

ValidatorTestPlayground.displayName = 'ValidatorTestPlayground'
