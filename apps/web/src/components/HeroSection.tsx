import { motion } from 'framer-motion'
import { Brain, Zap, Target, Shield, Network, TrendingUp, Users, Cpu } from 'lucide-react'

export function HeroSection() {
  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Neural Networks",
      description: "Deep Q-Networks & CNN/LSTM models for market prediction",
      color: "purple"
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: "Swarm Intelligence", 
      description: "Democratic consensus with 99.2% agreement rates",
      color: "blue"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Trading",
      description: "Live execution on Binance with microsecond precision",
      color: "green"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "AI Risk Management",
      description: "Intelligent position sizing and portfolio protection",
      color: "orange"
    }
  ]

  const stats = [
    { label: "AI Agents", value: "4", color: "purple" },
    { label: "Neural Networks", value: "5", color: "blue" },
    { label: "Accuracy Rate", value: "92%", color: "green" },
    { label: "Response Time", value: "<2s", color: "orange" }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Julia-themed Background */}
      <div className="absolute inset-0">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/30 to-blue-900/30" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* Neural Network Visualization */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            {[...Array(15)].map((_, i) => (
              <motion.circle
                key={i}
                cx={`${Math.random() * 100}%`}
                cy={`${Math.random() * 100}%`}
                r="2"
                fill="url(#neural-gradient)"
                animate={{
                  r: [2, 6, 2],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
            <defs>
              <linearGradient id="neural-gradient">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Julia Logo Animation */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            duration: 1
          }}
        >
          <div className="relative">
            <motion.div
              className="text-8xl md:text-9xl"
              animate={{ 
                rotateY: [0, 15, 0, -15, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🤖🐝
            </motion.div>
            
            {/* Glowing ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-purple-500/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Julia AI Swarm
            </span>
          </h1>
          <h2 className="text-2xl md:text-3xl text-gray-300 font-light">
            Advanced Market Making with Neural Networks
          </h2>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Experience the future of algorithmic trading with our sophisticated AI swarm system. 
          Four specialized neural networks work together using democratic consensus to execute 
          profitable market-making strategies with 99.2% agreement rates.
        </motion.p>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass-card rounded-2xl p-6 text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
            >
              <div className={`text-3xl md:text-4xl font-bold mb-2 ${
                stat.color === 'purple' ? 'text-purple-400' :
                stat.color === 'blue' ? 'text-blue-400' :
                stat.color === 'green' ? 'text-green-400' :
                'text-orange-400'
              }`}>
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-6xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glass-card rounded-2xl p-6 text-center group"
              whileHover={{ scale: 1.05, y: -10 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 + index * 0.1 }}
            >
              <motion.div
                className={`inline-flex p-4 rounded-xl mb-4 ${
                  feature.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                  feature.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                  feature.color === 'green' ? 'bg-green-500/20 text-green-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <motion.button
            className="btn-primary-modern text-lg px-12 py-4 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ x: 5 }}
            >
              <Zap className="w-6 h-6" />
              <span>Launch AI Trading Dashboard</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Version Badge */}
        <motion.div
          className="absolute bottom-8 right-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2.5 }}
        >
          <div className="glass-card rounded-full px-4 py-2 text-sm text-purple-300">
            v2.0.0 • Julia ❤️ AI
          </div>
        </motion.div>
      </div>
    </div>
  )
}
