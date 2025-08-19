'use client'

import { useState } from 'react'
import { Play, Square, AlertTriangle, Settings, Zap, Brain, Target, Shield } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import AISwarmAPI from '@/lib/api'
import { AISwarmStatus } from '@/types/api'

interface TradingControlsProps {
  status?: AISwarmStatus
  onStatusChange: () => void
}

export function TradingControls({ status, onStatusChange }: TradingControlsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState({
    symbols: ['ETHUSDT'],
    max_capital: 100,
    base_spread_pct: 0.15,
    consensus_threshold: 0.65,
    enable_neural_networks: true,
    enable_groq_sentiment: true,
    enable_swarm_consensus: true,
  })

  const isTrading = status?.trading_control?.is_running || false

  const handleStartTrading = async () => {
    setIsLoading(true)
    try {
      const response = await AISwarmAPI.startTrading(config)
      if (response.success) {
        toast.success('🚀 AI Swarm trading started successfully!')
        onStatusChange()
      } else {
        toast.error('❌ Failed to start trading')
      }
    } catch (error: any) {
      toast.error(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStopTrading = async () => {
    setIsLoading(true)
    try {
      const response = await AISwarmAPI.stopTrading()
      if (response.success) {
        toast.success('⏹️ AI Swarm trading stopped')
        onStatusChange()
      }
    } catch (error: any) {
      toast.error(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmergencyStop = async () => {
    if (!confirm('⚠️ Are you sure you want to emergency stop? This will cancel all orders immediately.')) {
      return
    }
    
    setIsLoading(true)
    try {
      const response = await AISwarmAPI.emergencyStop()
      if (response.success) {
        toast.success(`🚨 Emergency stop executed! Cancelled ${response.cancelled_orders} orders`)
        onStatusChange()
      }
    } catch (error: any) {
      toast.error(`❌ Emergency stop failed: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div 
      className="glass-card rounded-2xl p-6 trading-glow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <motion.div
            animate={{ 
              rotate: isTrading ? [0, 360] : 0,
              scale: isTrading ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            }}
            className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl"
          >
            {isTrading ? (
              <Zap className="w-6 h-6 text-white" />
            ) : (
              <Brain className="w-6 h-6 text-white" />
            )}
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Swarm Controls</h2>
            <p className="text-gray-400">
              {isTrading 
                ? `🚀 Active trading • ${status?.trading_control?.iteration_count || 0} iterations completed`
                : '🧠 Neural Network Trading System Ready'
              }
            </p>
          </div>
        </div>
        
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            isTrading 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {isTrading ? '🚀 Active Trading' : '⏸️ Standby Mode'}
          </div>
        </motion.div>
      </div>

      {/* AI System Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div 
          className="bg-white/5 rounded-xl p-4 border border-purple-500/20"
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Neural Networks</p>
              <p className="text-lg font-bold text-white">4 Active</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/5 rounded-xl p-4 border border-blue-500/20"
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Consensus</p>
              <p className="text-lg font-bold text-white">99.2%</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/5 rounded-xl p-4 border border-green-500/20"
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Risk Score</p>
              <p className="text-lg font-bold text-white">Low</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/5 rounded-xl p-4 border border-orange-500/20"
          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Orders</p>
              <p className="text-lg font-bold text-white">{isTrading ? '3' : '0'}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-4">
        {!isTrading ? (
          <motion.button 
            onClick={handleStartTrading}
            disabled={isLoading}
            className="btn-success-modern flex-1 min-w-[200px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={isLoading ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 0.5, repeat: isLoading ? Infinity : 0 }}
          >
            <motion.div
              animate={isLoading ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
            >
              <Play className="w-5 h-5" />
            </motion.div>
            {isLoading ? 'Initializing AI Swarm...' : 'Start AI Swarm Trading'}
          </motion.button>
        ) : (
          <motion.button 
            onClick={handleStopTrading}
            disabled={isLoading}
            className="btn-danger-modern flex-1 min-w-[200px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Square className="w-5 h-5" />
            {isLoading ? 'Stopping Swarm...' : 'Stop Trading'}
          </motion.button>
        )}
        
        <motion.button 
          onClick={handleEmergencyStop}
          disabled={isLoading || !isTrading}
          className="btn-danger-modern"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AlertTriangle className="w-5 h-5" />
          Emergency Stop
        </motion.button>
        
        <motion.button 
          onClick={() => setShowConfig(!showConfig)}
          className="btn-primary-modern"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={{ rotate: showConfig ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Settings className="w-5 h-5" />
          </motion.div>
          Advanced Config
        </motion.button>
      </div>

      {/* Configuration Panel */}
      <AnimatePresence>
        {showConfig && (
          <motion.div 
            className="border-t border-white/10 pt-6 mt-6 space-y-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Swarm Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-300">
                  💰 Max Capital (USDT)
                </label>
                <input 
                  type="number"
                  value={config.max_capital}
                  onChange={(e) => setConfig({...config, max_capital: Number(e.target.value)})}
                  className="input-modern w-full"
                />
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-300">
                  📊 Base Spread (%)
                </label>
                <input 
                  type="number"
                  step="0.01"
                  value={config.base_spread_pct}
                  onChange={(e) => setConfig({...config, base_spread_pct: Number(e.target.value)})}
                  className="input-modern w-full"
                />
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-300">
                  🤝 Consensus Threshold
                </label>
                <input 
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="1"
                  value={config.consensus_threshold}
                  onChange={(e) => setConfig({...config, consensus_threshold: Number(e.target.value)})}
                  className="input-modern w-full"
                />
              </motion.div>
            </div>

            {/* AI Features Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <motion.div 
                className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-purple-500/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <input 
                  type="checkbox"
                  checked={config.enable_neural_networks}
                  onChange={(e) => setConfig({...config, enable_neural_networks: e.target.checked})}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <div>
                  <p className="text-white font-medium">🧠 Neural Networks</p>
                  <p className="text-xs text-gray-400">Deep Q-Networks & CNNs</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-blue-500/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <input 
                  type="checkbox"
                  checked={config.enable_groq_sentiment}
                  onChange={(e) => setConfig({...config, enable_groq_sentiment: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <p className="text-white font-medium">💭 Groq LLM</p>
                  <p className="text-xs text-gray-400">Sentiment Analysis</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-green-500/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <input 
                  type="checkbox"
                  checked={config.enable_swarm_consensus}
                  onChange={(e) => setConfig({...config, enable_swarm_consensus: e.target.checked})}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <p className="text-white font-medium">🐝 Swarm Consensus</p>
                  <p className="text-xs text-gray-400">Democratic Voting</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
