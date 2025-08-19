'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { 
  Activity, 
  Brain, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Settings,
  Play,
  Square,
  AlertTriangle,
  RefreshCw,
  Zap,
  Target,
  ChevronRight,
  BarChart3,
  Network,
  Cpu,
  Bot,
  Globe,
  Shield,
  Eye,
  CheckCircle,
  CheckCircle2,
  Settings2,
  AlertTriangle as AlertTriangleIcon,
} from 'lucide-react'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AISwarmDashboard() {
  // New state for agents status and open trades/positions
  const [agentStatus, setAgentStatus] = useState<any>({});
  const [openTrades, setOpenTrades] = useState<any[]>([]);
  const [openPositions, setOpenPositions] = useState<any[]>([]);
  const [realBalance, setRealBalance] = useState<any>({});
  const [realizedPnl, setRealizedPnl] = useState<number>(0);

  const [isTrading, setIsTrading] = useState(true);
  const [startLoading, setStartLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [aiPrediction, setAiPrediction] = useState(0);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [liveData, setLiveData] = useState({
    volume: '',
    volatility: '',
    spread: '',
    aiConfidence: '',
    consensus: ''
  });
  const [chartData, setChartData] = useState([]);
  const [performance, setPerformance] = useState({
    currentBalance: 0,
    totalTrades: 0,
    winAccuracy: 0,
    conversionRate: 0,
    systemUptime: '',
    activeAgents: 0,
    totalReturn: 0,
    pnl: 0
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [neuralNetworks, setNeuralNetworks] = useState<NeuralNetwork[]>([]);
  const [consensus, setConsensus] = useState('');
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);

  // Fetch all dashboard data from backend
  useEffect(() => {
    (async () => {
      // Live open trades
      try {
        const tradesRes = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/trades');
        if (tradesRes.ok) {
          const tradesData = await tradesRes.json();
          setOpenTrades(tradesData.trades || []);
        }
      } catch (err) { /* handle error if needed */ }

      // Live open positions
      try {
        const positionsRes = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/positions');
        if (positionsRes.ok) {
          const positionsData = await positionsRes.json();
          setOpenPositions(positionsData.positions || []);
        }
      } catch (err) { /* handle error if needed */ }

      // Real balance from Binance testnet
      try {
        const balanceRes = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/balance');
        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setRealBalance(balanceData.balance || {});
        }
      } catch (err) { /* handle error if needed */ }

      // Realized PnL (only when trading is stopped)
      if (!isTrading) {
        try {
          const pnlRes = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/pnl');
          if (pnlRes.ok) {
            const pnlData = await pnlRes.json();
            setRealizedPnl(pnlData.realized_pnl ?? 0);
          }
        } catch (err) { /* handle error if needed */ }
      }

      // Chart data and live price
      try {
        const chartRes = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/data/realtime');
        if (chartRes.ok) {
          const data = await chartRes.json();
          const price = data.market_data?.price ?? 0;
          const prediction = data.ai_analysis?.prediction ?? 0;
          setCurrentPrice(price);
          setAiPrediction(prediction);
          // If backend provides time series, use it for chart
          setChartData(data.market_data?.chart ?? []);
          setLiveData(prev => ({
            ...prev,
            volume: data.market_data?.volume ?? '',
            volatility: data.market_data?.volatility ?? '',
            spread: data.market_data?.spread ?? '',
            aiConfidence: data.ai_analysis?.confidence ?? '',
            consensus: data.ai_analysis?.consensus ?? ''
          }));
        }

        // System status
        const statusRes = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/status');
        if (statusRes.ok) {
          const status = await statusRes.json();
          setIsTrading(status.trading_control?.active ?? true);
          if (Array.isArray(status.agents_status)) {
            setAgents(status.agents_status);
          } else if (status.agents_status && typeof status.agents_status === 'object') {
            setAgents(Object.values(status.agents_status));
          } else {
            setAgents([]);
          }
          setConsensus(status.performance_summary?.consensus_rate ? `${status.performance_summary.consensus_rate}%` : '');
        }

        // Performance
        const perfRes = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/performance');
        if (perfRes.ok) {
          const perf = await perfRes.json();
          setPerformance({
            currentBalance: perf.pnl_tracker?.current_balance_usdt ?? 0,
            totalTrades: perf.pnl_tracker?.total_trades ?? 0,
            winAccuracy: perf.pnl_tracker?.ai_decision_accuracy ?? 0,
            conversionRate: perf.performance_report?.conversion_rate ?? 0,
            systemUptime: perf.performance_report?.system_uptime ?? '',
            activeAgents: perf.performance_report?.active_agents ?? 0,
            totalReturn: perf.performance_report?.total_return ?? 0,
            pnl: perf.pnl_tracker?.total_realized_pnl ?? 0
          });
          setNeuralNetworks(perf.performance_report?.neural_networks || []);
          setRecentTrades(perf.performance_report?.recent_trades || []);
        }

        // Agents status
        const agentsRes = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/agents');
        if (agentsRes.ok) {
          const agentsData = await agentsRes.json();
          setAgentStatus(agentsData.agents_by_symbol || {});
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    })();
  }, [isTrading]);

  // Types for backend data
  type Agent = {
    id: number;
    name: string;
    type: string;
    status: string;
    confidence: number;
    level: string;
  };
  type NeuralNetwork = {
    name: string;
    type: string;
    status: string;
    accuracy: string;
  };
  type Trade = {
    time: string;
    pair: string;
    type: string;
    amount: string;
    status: string;
  };
  // Button logic
  const handleStartTrading = async () => {
    setStartLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/start', { method: 'POST' });
      if (res.ok) {
        const statusRes = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/status');
        if (statusRes.ok) {
          const status = await statusRes.json();
          setIsTrading(status.trading_control?.active ?? true);
        } else {
          setIsTrading(true);
        }
        toast.success('AI Swarm Trading Started');
      } else {
        const errorText = await res.text();
        toast.error(`Failed to start trading: ${res.status} ${errorText}`);
        console.error('Start trading error:', res.status, errorText);
      }
    } catch (err) {
      toast.error('Failed to start trading (network error)');
      console.error('Start trading network error:', err);
    } finally {
      setStartLoading(false);
    }
  };

  // Emergency Stop handler
  const handleEmergencyStop = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/emergency-stop', { method: 'POST' });
      if (res.ok) {
        toast.success('Emergency Stop triggered!');
        setIsTrading(false);
      } else {
        const errorText = await res.text();
        toast.error(`Failed to trigger emergency stop: ${res.status} ${errorText}`);
      }
    } catch (err) {
      toast.error('Failed to trigger emergency stop (network error)');
    }
  };

  // Advanced Config handler (example: open modal)
  const handleAdvancedConfig = async () => {
    setShowConfigModal(true);
    // You can add config update logic here if needed
  };
  const handleStopTrading = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/stop', { method: 'POST' });
      if (res.ok) {
        const statusRes = await fetch('http://127.0.0.1:8052/api/v1/ai-swarm/status');
        if (statusRes.ok) {
          const status = await statusRes.json();
          setIsTrading(status.trading_control?.active ?? false);
        } else {
          setIsTrading(false);
        }
        toast.success('AI Swarm Trading Stopped');
      } else {
        const errorText = await res.text();
        toast.error(`Failed to stop trading: ${res.status} ${errorText}`);
        console.error('Stop trading error:', res.status, errorText);
      }
    } catch (err) {
      toast.error('Failed to stop trading (network error)');
      console.error('Stop trading network error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Julia AI Swarm</h1>
                <p className="text-sm text-gray-400">Advanced Market Making with Neural Networks & Swarm Intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-8">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">4 Neural Networks Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">AI Swarm Consensus: 95.2%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
              {Array.isArray(chartData) && chartData.length > 0 ? (
                <span className="text-green-400 text-sm font-medium">Trading Active</span>
              ) : (
                <span className="text-red-400 text-sm font-medium">No Trading Data</span>
              )}
            </div>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="p-6 space-y-6">
        {/* AI Swarm Controls */}
        <div className="glass-card rounded-xl p-6 ai-swarm-glow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">AI Swarm Controls</h2>
                <p className="text-sm text-gray-400">Neural Trading • 4 algorithms connected</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-medium">Active Trading</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-6 sm:grid-cols-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">4</div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">99.2%</div>
              <div className="text-sm text-gray-400">AI Consensus</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">Low</div>
              <div className="text-sm text-gray-400">Risk Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">3</div>
              <div className="text-sm text-gray-400">Markets</div>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap justify-center">
            <button 
              onClick={handleStopTrading}
              className="btn-danger-modern px-4 py-2 flex items-center gap-2 text-sm"
              style={{ minWidth: 100 }}
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
            <button 
              onClick={handleStartTrading}
              className="btn-success-modern px-4 py-2 flex items-center gap-2 text-sm"
              style={{ minWidth: 100 }}
              disabled={startLoading}
            >
              <Play className="w-4 h-4" />
              {startLoading ? 'Starting...' : 'Start'}
            </button>
              <button 
                onClick={handleEmergencyStop}
                className="btn-danger-modern px-6 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Emergency Stop
              </button>
              <button 
                onClick={handleAdvancedConfig} 
                className="btn-primary-modern px-6 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced Config
              </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 md:grid-cols-12 sm:grid-cols-1">
          {/* Left Column - AI Agents */}
          <div className="col-span-3 space-y-6">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">AI Agents</h3>
                <span className="text-sm px-2 py-1 bg-green-500/20 text-green-400 rounded-full">4 Active</span>
              </div>
              
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        agent.status === 'active' ? 'bg-green-500' :
                        agent.status === 'risk' ? 'bg-orange-500' :
                        agent.status === 'optimize' ? 'bg-purple-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm">{agent.name}</div>
                        <div className="text-xs text-gray-400">{agent.type}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Confidence Level</span>
                      <span className={`font-medium ${
                        agent.confidence > 90 ? 'text-green-400' :
                        agent.confidence > 70 ? 'text-orange-400' :
                        'text-red-400'
                      }`}>{agent.confidence}%</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-slate-700 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${
                            agent.confidence > 90 ? 'bg-green-500' :
                            agent.confidence > 70 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${agent.confidence}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">{agent.level}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Performance</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Current Balance</div>
                  <div className="text-2xl font-bold text-white">${performance.currentBalance.toLocaleString()}</div>
                  <div className="text-sm text-green-400">{performance.totalReturn.toFixed(2)}% Total return</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Total Trades</div>
                    <div className="text-white font-medium">{performance.totalTrades}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Win Accuracy</div>
                    <div className="text-green-400 font-medium">{performance.winAccuracy.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Conversion Rate</div>
                    <div className="text-white font-medium">{performance.conversionRate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400">System Uptime</div>
                    <div className="text-green-400 font-medium">{performance.systemUptime}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Active Agents</div>
                    <div className="text-white font-medium">{performance.activeAgents}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Realized PnL</div>
                    <div className="text-white font-medium">${realizedPnl.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-700 text-xs text-gray-400">
                  ⚠ Real-time performance tracking active
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Live Market Data & Chart */}
          <div className="col-span-6 space-y-6">
            {/* Live Market Data */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Live Market Data</h3>
                  <span className="text-sm px-2 py-1 bg-green-500/20 text-green-400 rounded-full">ETH/USDT</span>
                </div>
                <div className="text-xs text-gray-400">17:23:46</div>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-white mb-1">${currentPrice.toLocaleString()}</div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-400">+$1,788.00 +4% $1,025.78</span>
                  <span className="text-blue-400">AI Prediction: ${aiPrediction.toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
                <div>
                  <div className="text-gray-400">Volume</div>
                  <div className="text-white font-medium">{liveData.volume}</div>
                </div>
                <div>
                  <div className="text-gray-400">Volatility</div>
                  <div className="text-orange-400 font-medium">{liveData.volatility}</div>
                </div>
                <div>
                  <div className="text-gray-400">Spread</div>
                  <div className="text-white font-medium">{liveData.spread}</div>
                </div>
                <div>
                  <div className="text-gray-400">AI Confidence</div>
                  <div className="text-green-400 font-medium">{liveData.aiConfidence}</div>
                </div>
              </div>

              {/* Price Chart */}
              <div className="h-64 bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-white">Price Chart ${currentPrice.toLocaleString()}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      Market Price
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      AI Prediction
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="prediction" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-xs text-gray-400 mt-2">Live updated: 4:23:15 PM</div>
              </div>
            {/* End Chart Container */}
            </div>
          </div>

          {/* Right Column - Swarm Consensus & Neural Networks */}
          <div className="col-span-3 space-y-6">
            {/* Swarm Consensus */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Network className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Swarm Consensus</h3>
              </div>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-400">{consensus}</div>
                <div className="text-sm text-gray-400">Overall Agreement</div>
              </div>
              <div className="space-y-1 text-xs">
                {recentTrades.map((trade, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-400">{trade.time.split(':')[0]}:{trade.time.split(':')[1]}</span>
                    <span className={
                      trade.status === 'BUY' ? 'text-green-400' :
                      trade.status === 'HOLD' ? 'text-orange-400' :
                      'text-red-400'
                    }>{trade.type} {trade.status === 'BUY' ? trade.amount : ''} {trade.status}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Neural Networks */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Neural Networks</h3>
              </div>
              
              <div className="space-y-3">
                {neuralNetworks.map((network, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-white">{network.name}</span>
                    </div>
                    <span className="text-green-400">{network.accuracy}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Trading */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Live Trading</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Active Orders</span>
                  <span className="text-white font-medium">{openTrades.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Trading Pair</span>
                  <span className="text-white font-medium">ETH/USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Last Update</span>
                  <span className="text-gray-400">2v ago</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">API Status</span>
                  <span className="text-green-400 font-medium">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
