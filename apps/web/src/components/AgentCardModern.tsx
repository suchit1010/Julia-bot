import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { StatusIndicator } from './StatusIndicatorModern'

interface AgentCardProps {
  name: string
  type: 'analyzer' | 'risk' | 'optimizer' | 'execution'
  confidence: number
  status: 'active' | 'inactive' | 'error'
  description: string
  icon: ReactNode
  weight?: number
}

export function AgentCard({ 
  name, 
  type, 
  confidence, 
  status, 
  description, 
  icon, 
  weight 
}: AgentCardProps) {
  const getTypeColor = () => {
    switch (type) {
      case 'analyzer':
        return {
          border: 'border-blue-500/30',
          bg: 'bg-blue-500/5',
          glow: 'shadow-glow-blue',
          gradient: 'from-blue-500/20 to-blue-600/20'
        }
      case 'risk':
        return {
          border: 'border-orange-500/30',
          bg: 'bg-orange-500/5',
          glow: 'shadow-lg',
          gradient: 'from-orange-500/20 to-red-600/20'
        }
      case 'optimizer':
        return {
          border: 'border-purple-500/30',
          bg: 'bg-purple-500/5',
          glow: 'shadow-glow-purple',
          gradient: 'from-purple-500/20 to-purple-600/20'
        }
      case 'execution':
        return {
          border: 'border-green-500/30',
          bg: 'bg-green-500/5',
          glow: 'shadow-glow-green',
          gradient: 'from-green-500/20 to-emerald-600/20'
        }
      default:
        return {
          border: 'border-gray-500/30',
          bg: 'bg-gray-500/5',
          glow: 'shadow-lg',
          gradient: 'from-gray-500/20 to-gray-600/20'
        }
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'analyzer':
        return 'text-blue-400'
      case 'risk':
        return 'text-orange-400'
      case 'optimizer':
        return 'text-purple-400'
      case 'execution':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  const typeColors = getTypeColor()
  const iconColor = getIconColor()

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <motion.div 
      className={`relative p-4 rounded-xl border ${typeColors.border} ${typeColors.bg} ${typeColors.glow} backdrop-blur-sm transition-all duration-300`}
      whileHover={{ 
        scale: 1.02, 
        y: -2,
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
    >
      {/* Animated Background Gradient */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${typeColors.gradient} rounded-xl opacity-0`}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <motion.div 
              className={`p-2 rounded-lg bg-gradient-to-r ${typeColors.gradient} backdrop-blur-sm`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className={iconColor}>
                {icon}
              </div>
            </motion.div>
            <div>
              <h3 className="font-semibold text-white text-sm">{name}</h3>
              {weight && (
                <span className="text-xs text-gray-400">Vote Weight: {weight}%</span>
              )}
            </div>
          </div>
          <StatusIndicator status={status} size="sm" />
        </div>

        {/* Description */}
        <p className="text-xs text-gray-400 mb-3 leading-relaxed">{description}</p>

        {/* Confidence Meter */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Confidence Level</span>
            <span className={`text-sm font-bold ${getConfidenceColor(confidence)}`}>
              {confidence}%
            </span>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <motion.div 
                className={`h-2 rounded-full bg-gradient-to-r ${
                  confidence >= 80 
                    ? 'from-green-400 to-emerald-500' 
                    : confidence >= 60 
                    ? 'from-yellow-400 to-orange-500'
                    : 'from-red-400 to-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ 
                  duration: 1, 
                  delay: 0.2, 
                  ease: "easeOut" 
                }}
              />
            </div>
            
            {/* Animated confidence indicator */}
            <motion.div 
              className="absolute top-0 h-2 w-1 bg-white rounded-full shadow-lg"
              initial={{ left: 0 }}
              animate={{ left: `${confidence}%` }}
              transition={{ 
                duration: 1, 
                delay: 0.2, 
                ease: "easeOut" 
              }}
              style={{ transform: 'translateX(-50%)' }}
            />
          </div>
        </div>

        {/* Neural Network Activity Indicator */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <motion.div 
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
            <span className="text-xs text-gray-400">Neural Net Active</span>
          </div>
          
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-4 bg-gradient-to-t from-gray-600 to-blue-400 rounded-full"
                animate={{ 
                  scaleY: [0.3, 1, 0.3],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        {/* Agent Type Badge */}
        <motion.div 
          className={`absolute -top-2 -right-2 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm border ${typeColors.border} ${typeColors.bg}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </motion.div>
      </div>
    </motion.div>
  )
}
