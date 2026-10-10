import Image from 'next/image'

interface LogoProps {
  variant?: 'full' | 'icon'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  priority?: boolean
  showBadge?: boolean
  badgeText?: string
}

export function Logo({
  variant = 'full',
  size = 'md',
  className = '',
  priority = false,
  showBadge = false,
  badgeText,
}: LogoProps) {
  // Dimension presets
  const iconSizes = {
    xs: { px: 22, class: 'size-[22px]', textClass: 'text-sm font-bold' },
    sm: { px: 28, class: 'size-7', textClass: 'text-base font-bold' },
    md: { px: 36, class: 'size-9', textClass: 'text-xl font-bold' },
    lg: { px: 44, class: 'size-11', textClass: 'text-2xl font-bold' },
    xl: { px: 56, class: 'size-14', textClass: 'text-3xl font-bold' },
  }

  const s = iconSizes[size]

  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${s.class} ${className}`}>
        <Image
          src="/swastik-icon.png"
          alt="Swastik Logo"
          width={s.px}
          height={s.px}
          priority={priority}
          className="size-full object-contain rounded-full shadow-sm"
        />
        {showBadge && badgeText && (
          <span className="absolute -bottom-1 -right-1 flex h-3.5 items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {badgeText}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative inline-flex items-center justify-center shrink-0 ${s.class}`}>
        <Image
          src="/swastik-icon.png"
          alt="Swastik Logo"
          width={s.px}
          height={s.px}
          priority={priority}
          className="size-full object-contain rounded-full shadow-sm"
        />
      </div>
      <span className={`font-serif tracking-tight text-foreground select-none ${s.textClass}`}>
        Swastik
      </span>
      {showBadge && badgeText && (
        <span className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
          {badgeText}
        </span>
      )}
    </div>
  )
}
