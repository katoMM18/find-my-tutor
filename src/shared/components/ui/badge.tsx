import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        soft: 'bg-primary/10 text-primary',
        muted: 'bg-muted text-foreground',
        outline: 'border border-rule bg-card text-muted-foreground',
        mark: 'border border-mark/50 text-mark',
        stamp: '-rotate-2 border-2 border-mark bg-transparent font-extrabold uppercase tracking-wide text-mark',
      },
    },
    defaultVariants: { variant: 'muted' },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
