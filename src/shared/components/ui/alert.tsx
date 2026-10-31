import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const alertVariants = cva('paper relative flex w-full flex-col gap-1 rounded-lg px-4 py-3 text-sm', {
  variants: {
    variant: {
      default: 'text-card-foreground',
      destructive: 'border-destructive/40 text-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-title" className={cn('font-semibold', className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-description" className={cn('text-muted-foreground', className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }
