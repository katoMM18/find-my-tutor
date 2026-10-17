import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { cn } from '@/shared/lib/utils'

const USER_AVATAR_SIZES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
  xl: 'size-24 text-3xl',
} as const

type UserAvatarProps = {
  name: string
  src?: string | null
  size?: keyof typeof USER_AVATAR_SIZES
  className?: string
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U'

function UserAvatar({ name, src, size = 'md', className }: UserAvatarProps) {
  return (
    <Avatar className={cn(USER_AVATAR_SIZES[size], className)}>
      {src && <AvatarImage src={src} alt={name} className="object-cover" />}
      <AvatarFallback className="bg-primary/10 font-heading font-semibold text-primary">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

export { UserAvatar }
