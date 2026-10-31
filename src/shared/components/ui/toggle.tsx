'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { Toggle as TogglePrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

// Radix sets aria-pressed on a toggle and aria-checked on a single-choice group item; both read as "on".
const toggleVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors outline-none',
    'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50',
    'aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground',
    'aria-checked:border-primary aria-checked:bg-primary aria-checked:text-primary-foreground'
  ),
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-border bg-card shadow-xs',
      },
      size: {
        default: 'h-9 min-w-9 px-3.5',
        sm: 'h-8 min-w-8 px-3',
        lg: 'h-10 min-w-10 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return <TogglePrimitive.Root data-slot="toggle" className={cn(toggleVariants({ variant, size, className }))} {...props} />
}

export { Toggle, toggleVariants }
