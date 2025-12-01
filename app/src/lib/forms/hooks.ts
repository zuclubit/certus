/**
 * Form Hooks - Enterprise 2025
 *
 * Custom hooks for form handling with React Hook Form + Zod
 * Provides type-safe, reusable form utilities
 */

import { useCallback, useState } from 'react'
import {
  useForm as useReactHookForm,
  type UseFormProps,
  type FieldValues,
  type UseFormReturn,
  type SubmitHandler,
  type SubmitErrorHandler,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodSchema, z } from 'zod'

// ============================================
// TYPES
// ============================================

export interface UseFormWithZodOptions<TSchema extends ZodSchema>
  extends Omit<UseFormProps<z.infer<TSchema>>, 'resolver'> {
  schema: TSchema
  onSubmit?: SubmitHandler<z.infer<TSchema>>
  onError?: SubmitErrorHandler<z.infer<TSchema>>
}

export interface UseFormWithZodReturn<TSchema extends ZodSchema>
  extends UseFormReturn<z.infer<TSchema>> {
  handleFormSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  isSubmitting: boolean
  submitError: string | null
  clearSubmitError: () => void
}

// ============================================
// HOOKS
// ============================================

/**
 * Enhanced useForm hook with Zod integration
 *
 * @example
 * ```tsx
 * const { register, handleFormSubmit, formState } = useFormWithZod({
 *   schema: loginSchema,
 *   defaultValues: { email: '', password: '' },
 *   onSubmit: async (data) => {
 *     await login(data)
 *   }
 * })
 * ```
 */
export function useFormWithZod<TSchema extends ZodSchema>({
  schema,
  onSubmit,
  onError,
  ...formOptions
}: UseFormWithZodOptions<TSchema>): UseFormWithZodReturn<TSchema> {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useReactHookForm<z.infer<TSchema>>({
    ...formOptions,
    resolver: zodResolver(schema),
  })

  const handleFormSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      setSubmitError(null)

      await form.handleSubmit(
        async (data) => {
          try {
            if (onSubmit) {
              await onSubmit(data)
            }
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Error al procesar el formulario'
            setSubmitError(message)
            throw error
          }
        },
        (errors) => {
          if (onError) {
            onError(errors)
          }
        }
      )(e)
    },
    [form, onSubmit, onError]
  )

  const clearSubmitError = useCallback(() => {
    setSubmitError(null)
  }, [])

  return {
    ...form,
    handleFormSubmit,
    isSubmitting: form.formState.isSubmitting,
    submitError,
    clearSubmitError,
  }
}

/**
 * Hook for managing form state with API mutations
 *
 * @example
 * ```tsx
 * const { form, mutation, submitForm } = useFormMutation({
 *   schema: createUserSchema,
 *   mutationFn: createUser,
 *   onSuccess: () => closeModal()
 * })
 * ```
 */
export function useFormMutation<TSchema extends ZodSchema, TResponse = unknown>({
  schema,
  mutationFn,
  onSuccess,
  onError,
  defaultValues,
}: {
  schema: TSchema
  mutationFn: (data: z.infer<TSchema>) => Promise<TResponse>
  onSuccess?: (response: TResponse) => void
  onError?: (error: Error) => void
  defaultValues?: Partial<z.infer<TSchema>>
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useReactHookForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as z.infer<TSchema>,
  })

  const submitForm = useCallback(
    async (data: z.infer<TSchema>) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await mutationFn(data)
        onSuccess?.(response)
        return response
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
        setError(errorMessage)
        onError?.(err instanceof Error ? err : new Error(errorMessage))
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn, onSuccess, onError]
  )

  const handleSubmit = form.handleSubmit(submitForm)

  return {
    form,
    isLoading,
    error,
    clearError: () => setError(null),
    submitForm,
    handleSubmit,
  }
}

/**
 * Hook for multi-step forms
 *
 * @example
 * ```tsx
 * const { currentStep, nextStep, prevStep, isFirstStep, isLastStep } = useMultiStepForm({
 *   totalSteps: 3
 * })
 * ```
 */
export function useMultiStepForm({
  totalSteps,
  initialStep = 0,
  onStepChange,
}: {
  totalSteps: number
  initialStep?: number
  onStepChange?: (step: number) => void
}) {
  const [currentStep, setCurrentStep] = useState(initialStep)

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
      onStepChange?.(newStep)
    }
  }, [currentStep, totalSteps, onStepChange])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      setCurrentStep(newStep)
      onStepChange?.(newStep)
    }
  }, [currentStep, onStepChange])

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step)
        onStepChange?.(step)
      }
    },
    [totalSteps, onStepChange]
  )

  const reset = useCallback(() => {
    setCurrentStep(initialStep)
    onStepChange?.(initialStep)
  }, [initialStep, onStepChange])

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    reset,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    totalSteps,
    progress: ((currentStep + 1) / totalSteps) * 100,
  }
}

/**
 * Hook for form field array operations
 * Provides simplified array field management
 */
export function useFieldArrayHelpers<T extends FieldValues>(
  form: UseFormReturn<T>,
  name: string
) {
  const values = form.watch(name as any) as unknown[] | undefined

  const append = useCallback(
    (value: unknown) => {
      const currentValues = (form.getValues(name as any) as unknown[]) || []
      form.setValue(name as any, [...currentValues, value] as any)
    },
    [form, name]
  )

  const remove = useCallback(
    (index: number) => {
      const currentValues = (form.getValues(name as any) as unknown[]) || []
      form.setValue(
        name as any,
        currentValues.filter((_, i) => i !== index) as any
      )
    },
    [form, name]
  )

  const update = useCallback(
    (index: number, value: unknown) => {
      const currentValues = [...((form.getValues(name as any) as unknown[]) || [])]
      currentValues[index] = value
      form.setValue(name as any, currentValues as any)
    },
    [form, name]
  )

  const move = useCallback(
    (from: number, to: number) => {
      const currentValues = [...((form.getValues(name as any) as unknown[]) || [])]
      const [removed] = currentValues.splice(from, 1)
      currentValues.splice(to, 0, removed)
      form.setValue(name as any, currentValues as any)
    },
    [form, name]
  )

  return {
    fields: values || [],
    append,
    remove,
    update,
    move,
    isEmpty: !values || values.length === 0,
    count: values?.length || 0,
  }
}

/**
 * Hook for form dirty state tracking
 */
export function useFormDirtyState<T extends FieldValues>(form: UseFormReturn<T>) {
  const { isDirty, dirtyFields } = form.formState

  const getDirtyFieldNames = useCallback(() => {
    return Object.keys(dirtyFields).filter(
      (key) => dirtyFields[key as keyof typeof dirtyFields]
    )
  }, [dirtyFields])

  const hasUnsavedChanges = isDirty

  const confirmLeave = useCallback(
    (message = '¿Estás seguro de que deseas salir? Los cambios no guardados se perderán.') => {
      if (hasUnsavedChanges) {
        return window.confirm(message)
      }
      return true
    },
    [hasUnsavedChanges]
  )

  return {
    isDirty,
    dirtyFields,
    getDirtyFieldNames,
    hasUnsavedChanges,
    confirmLeave,
  }
}
