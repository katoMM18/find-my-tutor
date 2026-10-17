import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <span className="relative block">
      <select
        data-slot="native-select"
        className={cn(
          `h-9 w-full appearance-none rounded-md border border-input bg-background py-1 pl-3 pr-9 text-sm
          shadow-xs transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30`,
          'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50',
          className
        )}
        {...props}
      />
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </span>
  )
}

export { NativeSelect }
