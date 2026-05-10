import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'info'
  className?: string
}

export function AnimatedBadge({ 
  children, 
  variant = 'default',
  className
}: AnimatedBadgeProps) {
  const variants = {
    default: 'bg-[#00F0FF] text-black border-2 border-[#00F0FF]',
    success: 'bg-[#00FF88] text-black border-2 border-[#00FF88]',
    warning: 'bg-[#FF006E] text-white border-2 border-[#FF006E]',
    info: 'bg-black text-white/70 border-2 border-white/30',
  }

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-none',
        variants[variant],
        className
      )}
    >
      {children}
    </motion.span>
  )
}
