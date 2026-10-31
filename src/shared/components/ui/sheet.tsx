'use client'

import { XIcon } from 'lucide-react'
import { Dialog as SheetPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '@/shared/lib/utils'

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

const SHEET_SIDES = {
  left: 'inset-y-2 left-2 w-72 max-w-full slide-in-from-left',
  right: 'inset-y-2 right-2 w-72 max-w-full slide-in-from-right',
  top: 'inset-x-2 top-2 slide-in-from-top',
  bottom: 'inset-x-2 bottom-2 slide-in-from-bottom',
} as const

function SheetContent({
  className,
  children,
  side = 'right',
  closeLabel,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: keyof typeof SHEET_SIDES; closeLabel: string }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay data-slot="sheet-overlay" className="fixed inset-0 z-50 bg-foreground/30 animate-in fade-in-0" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'paper fixed z-50 flex flex-col overflow-hidden rounded-xl animate-in duration-300 motion-reduce:animate-none',
          SHEET_SIDES[side],
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          aria-label={closeLabel}
          className={cn(
            'absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground outline-none',
            'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50'
          )}
        >
          <XIcon className="size-5" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sheet-header" className={cn('flex flex-col gap-1 px-5 pb-2 pt-5', className)} {...props} />
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn('text-base font-semibold', className)} {...props} />
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn('text-sm text-muted-foreground', className)} {...props} />
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger }
