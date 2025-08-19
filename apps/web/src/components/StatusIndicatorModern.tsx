import { motion } from 'framer-motion'

interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'warning' | 'error'
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function StatusIndicator({ status, label, size = 'md' }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-500',
          borderColor: 'border-green-500/30',
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-400',
          shadowColor: 'shadow-glow-green',
          emoji: '✅'
        }
      case 'inactive':
        return {
          color: 'bg-gray-500',
          borderColor: 'border-gray-500/30',
          bgColor: 'bg-gray-500/20',
          textColor: 'text-gray-400',
          shadowColor: 'shadow-lg',
          emoji: '⏸️'
        }
      case 'warning':
        return {
          color: 'bg-yellow-500',
          borderColor: 'border-yellow-500/30',
          bgColor: 'bg-yellow-500/20',
          textColor: 'text-yellow-400',
          shadowColor: 'shadow-lg',
          emoji: '⚠️'
        }
      case 'error':
        return {
          color: 'bg-red-500',
          borderColor: 'border-red-500/30',
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-400',
          shadowColor: 'shadow-lg',
          emoji: '❌'
        }
    }
  }

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          dot: 'w-2 h-2',
          container: 'px-2 py-1',
          text: 'text-xs',
          spacing: 'space-x-1'
        }
      case 'md':
        return {
          dot: 'w-3 h-3',
          container: 'px-3 py-2',
          text: 'text-sm',
          spacing: 'space-x-2'
        }
      case 'lg':
        return {
          dot: 'w-4 h-4',
          container: 'px-4 py-3',
          text: 'text-base',
          spacing: 'space-x-3'
        }
    }
  }

  const statusConfig = getStatusConfig()
  const sizeConfig = getSizeConfig()

  if (!label) {
    // Just the animated dot for small indicators
    return (
      <motion.div 
        className={`${sizeConfig.dot} ${statusConfig.color} rounded-full relative`}
        animate={status === 'active' ? {
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        } : {}}
        transition={{
          duration: 2,
          repeat: status === 'active' ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Pulsing ring effect for active status */}
        {status === 'active' && (
          <motion.div
            className={`absolute inset-0 ${statusConfig.color} rounded-full`}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </motion.div>
    )
  }

  return (
    <motion.div 
      className={`inline-flex items-center ${sizeConfig.spacing} ${sizeConfig.container} ${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-full font-medium ${statusConfig.shadowColor}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300,
        damping: 20
      }}
    >
      {/* Animated Status Dot */}
      <motion.div 
        className={`${sizeConfig.dot} ${statusConfig.color} rounded-full relative flex items-center justify-center`}
        animate={status === 'active' ? {
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        } : {}}
        transition={{
          duration: 2,
          repeat: status === 'active' ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Pulsing ring effect for active status */}
        {status === 'active' && (
          <motion.div
            className={`absolute inset-0 ${statusConfig.color} rounded-full`}
            animate={{
              scale: [1, 2.5, 1],
              opacity: [0.6, 0, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
        
        {/* Inner glow */}
        <div className="absolute inset-0 bg-white/30 rounded-full blur-sm" />
      </motion.div>
      
      {/* Status Label */}
      <span className={`${sizeConfig.text} ${statusConfig.textColor} font-medium`}>
        {label}
      </span>
      
      {/* Status Emoji (for larger sizes) */}
      {size !== 'sm' && (
        <motion.span
          className="text-xs"
          animate={status === 'active' ? {
            rotate: [0, 10, -10, 0]
          } : {}}
          transition={{
            duration: 3,
            repeat: status === 'active' ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {statusConfig.emoji}
        </motion.span>
      )}
    </motion.div>
  )
}
