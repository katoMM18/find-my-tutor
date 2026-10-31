'use client'

import { type VariantProps } from 'class-variance-authority'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import * as React from 'react'

import { toggleVariants } from '@/shared/components/ui/toggle'
import { cn } from '@/shared/lib/utils'

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({ size: 'default', variant: 'default' })

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root data-slot="toggle-group" className={cn('flex w-fit flex-wrap items-center gap-1.5', className)} {...props}>
      <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(toggleVariants({ variant: context.variant || variant, size: context.size || size }), className)}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem }
