import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-neutral-900 group-[.toaster]:border-neutral-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg',
          description: 'group-[.toast]:text-neutral-500',
          actionButton:
            'group-[.toast]:bg-primary-500 group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-neutral-100 group-[.toast]:text-neutral-600',
          success:
            'group-[.toaster]:border-l-4 group-[.toaster]:border-l-success-500',
          error:
            'group-[.toaster]:border-l-4 group-[.toaster]:border-l-danger-500',
          warning:
            'group-[.toaster]:border-l-4 group-[.toaster]:border-l-warning-500',
          info: 'group-[.toaster]:border-l-4 group-[.toaster]:border-l-primary-500',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
