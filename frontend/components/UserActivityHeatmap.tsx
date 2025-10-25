'use client';

import { useUserActivity } from '@/hooks/useUserActivity';
import { Card } from '@/components/ui/card';
import { Users, TrendingUp, Activity, Percent } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
} from 'recharts';

export function UserActivityHeatmap() {
  const {
    userMetrics,
    heatmapData,
    protocolComparison,
    totalUniqueUsers,
    totalActiveUsers,
    avgRetentionRate,
    loading,
  } = useUserActivity();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-xl border border-white/10 animate-pulse">
              <div className="h-24 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-gray-400">Total Users (24h)</span>
          </div>
          <div className="text-3xl font-bold text-white">{totalUniqueUsers.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Across all protocols</div>
        </Card>

        <Card className="glass-card p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-gray-400">Active Users</span>
          </div>
          <div className="text-3xl font-bold text-white">{totalActiveUsers.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Currently transacting</div>
        </Card>

        <Card className="glass-card p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Percent className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-gray-400">Avg Retention</span>
          </div>
          <div className="text-3xl font-bold text-white">{avgRetentionRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-500 mt-1">User retention rate</div>
        </Card>

        <Card className="glass-card p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-sm text-gray-400">Most Active</span>
          </div>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <span>{userMetrics[0]?.icon}</span>
            <span>{userMetrics[0]?.protocol.split(' ')[0]}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">{userMetrics[0]?.totalUsers.toLocaleString()} users</div>
        </Card>
      </div>

      {/* Hour-by-Hour Activity Heatmap */}
      <Card className="glass-card p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">24-Hour User Activity Heatmap</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={heatmapData}>
            <defs>
              <linearGradient id="colorUniswapUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff007a" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ff007a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAaveUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLidoUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCurveUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="hour"
              stroke="#6b7280"
              fontSize={12}
              interval={2}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />
            <Area
              type="monotone"
              dataKey="uniswap"
              stackId="1"
              stroke="#ff007a"
              fillOpacity={1}
              fill="url(#colorUniswapUsers)"
              name="Uniswap"
            />
            <Area
              type="monotone"
              dataKey="aave"
              stackId="1"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorAaveUsers)"
              name="Aave"
            />
            <Area
              type="monotone"
              dataKey="lido"
              stackId="1"
              stroke="#f97316"
              fillOpacity={1}
              fill="url(#colorLidoUsers)"
              name="Lido"
            />
            <Area
              type="monotone"
              dataKey="curve"
              stackId="1"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorCurveUsers)"
              name="Curve"
            />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Peak activity hours: 8-10 AM, 12-2 PM, 6-9 PM UTC
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protocol Adoption Metrics */}
        <Card className="glass-card p-6 rounded-xl border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Protocol User Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={protocolComparison}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name.split(' ')[0]}: ${percentage.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="totalUsers"
              >
                {protocolComparison.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `${value.toLocaleString()} users`}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* User Retention Indicators */}
        <Card className="glass-card p-6 rounded-xl border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">User Retention by Protocol</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="protocol"
                stroke="#6b7280"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#6b7280" fontSize={12} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Bar dataKey="retentionRate" name="Retention Rate">
                {userMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Protocol Breakdown */}
      <Card className="glass-card p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4">Protocol-Specific User Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {userMetrics.map((metric) => (
            <div
              key={metric.protocolId}
              className="p-4 rounded-lg border border-white/10"
              style={{
                background: `linear-gradient(135deg, ${metric.color}15 0%, transparent 100%)`,
                borderColor: `${metric.color}30`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{metric.icon}</span>
                <span className="font-semibold text-white">{metric.protocol}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Users (24h)</span>
                  <span className="text-sm font-bold text-white">{metric.totalUsers.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Active Users</span>
                  <span className="text-sm font-bold text-white">{metric.activeUsers24h.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Retention Rate</span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: metric.color }}
                  >
                    {metric.retentionRate.toFixed(1)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">User Type</span>
                  <span className="text-sm font-medium text-white capitalize">{metric.userType}</span>
                </div>

                {metric.suppliers !== undefined && metric.borrowers !== undefined && (
                  <div className="pt-2 mt-2 border-t border-white/10">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Suppliers</span>
                      <span className="text-white">{metric.suppliers}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-gray-500">Borrowers</span>
                      <span className="text-white">{metric.borrowers}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar for market share */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Market Share</span>
                  <span className="text-xs text-gray-400">
                    {((metric.totalUsers / totalUniqueUsers) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${(metric.totalUsers / totalUniqueUsers) * 100}%`,
                      backgroundColor: metric.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
