import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[100px] w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-base transition-colors',
          'placeholder:text-neutral-400',
          'focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none',
          'hover:border-neutral-400',
          'disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:opacity-50',
          'resize-y',
          error &&
            'border-danger-500 focus:border-danger-600 focus:ring-danger-200',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
