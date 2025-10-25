"use client"

import { LiveActivityFeed } from "@/components/LiveActivityFeed"
import { useFeedAnalytics } from "@/hooks/useFeedAnalytics"
import { AreaChart, Area, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function FeedPage() {
  const { tpsData, volumeDistribution, transactionTypes, totalVolume, totalTransactions, whaleCount } = useFeedAnalytics();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Live Activity Feed</h1>
        <p className="text-lg text-gray-400">Real-time DeFi transactions across all protocols</p>
      </div>

      {/* Main Section - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* LEFT - Transaction Feed (35%) */}
        <div className="lg:col-span-3">
          <LiveActivityFeed />
        </div>

        {/* CENTER - Activity Statistics (35%) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-xl border border-white/10 h-[300px]">
            <h2 className="text-lg font-semibold text-white mb-4">TPS by Protocol</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={tpsData}>
                <defs>
                  <linearGradient id="colorUniswap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff007a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ff007a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLido" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCurve" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="timestamp" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Area type="monotone" dataKey="uniswap" stroke="#ff007a" fillOpacity={1} fill="url(#colorUniswap)" name="Uniswap" />
                <Area type="monotone" dataKey="aave" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAave)" name="Aave" />
                <Area type="monotone" dataKey="lido" stroke="#f97316" fillOpacity={1} fill="url(#colorLido)" name="Lido" />
                <Area type="monotone" dataKey="curve" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCurve)" name="Curve" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10 h-[300px]">
            <h2 className="text-lg font-semibold text-white mb-4">Volume Distribution (TVL)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={volumeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {volumeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value: number) => `${value.toFixed(2)} ETH`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10 h-[300px]">
            <h2 className="text-lg font-semibold text-white mb-4">Transaction Types</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={transactionTypes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="type" stroke="#6b7280" fontSize={12} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" name="Count">
                  {transactionTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT - Analytics Summary (30%) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Analytics Summary</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20">
                <div className="text-sm text-gray-400 mb-1">Total Volume (TVL)</div>
                <div className="text-2xl font-bold text-white">{totalVolume.toFixed(2)} ETH</div>
                <div className="text-xs text-gray-500 mt-1">Across all protocols</div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20">
                <div className="text-sm text-gray-400 mb-1">Recent Transactions</div>
                <div className="text-2xl font-bold text-white">{totalTransactions}</div>
                <div className="text-xs text-gray-500 mt-1">Last 100 transactions monitored</div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20">
                <div className="text-sm text-gray-400 mb-1">Whale Transactions</div>
                <div className="text-2xl font-bold text-white">{whaleCount}</div>
                <div className="text-xs text-gray-500 mt-1">&gt;100 ETH detected</div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20">
                <div className="text-sm text-gray-400 mb-1">Whale Percentage</div>
                <div className="text-2xl font-bold text-white">
                  {totalTransactions > 0 ? ((whaleCount / totalTransactions) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Of total activity</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Protocol Activity</h2>
            <div className="space-y-3">
              {volumeDistribution.map((protocol, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-white/10"
                  style={{ 
                    background: `linear-gradient(90deg, ${protocol.color}15 0%, transparent 100%)`,
                    borderColor: `${protocol.color}30`
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{protocol.name}</span>
                    <span 
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${protocol.color}20`,
                        color: protocol.color
                      }}
                    >
                      Active
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white">{protocol.value.toFixed(2)} ETH</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {totalVolume > 0 ? ((protocol.value / totalVolume) * 100).toFixed(1) : 0}% of total
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
