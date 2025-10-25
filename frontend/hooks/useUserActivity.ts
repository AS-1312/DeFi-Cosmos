'use client';

import { useMemo } from 'react';
import { useProtocolStats } from './useProtocolStats';

interface UserMetrics {
  protocol: string;
  protocolId: string;
  color: string;
  icon: string;
  totalUsers: number;
  activeUsers24h: number;
  retentionRate: number; // percentage of active users
  growthRate: number; // 24h users as % of total
  userType?: 'suppliers' | 'borrowers' | 'stakers' | 'traders';
  suppliers?: number;
  borrowers?: number;
}

interface HeatmapDataPoint {
  hour: string;
  uniswap: number;
  aave: number;
  lido: number;
  curve: number;
}

interface ProtocolComparison {
  name: string;
  color: string;
  totalUsers: number;
  activeUsers: number;
  percentage: number;
}

export function useUserActivity() {
  const { protocols, loading } = useProtocolStats();

  // Calculate user metrics for each protocol
  const userMetrics = useMemo<UserMetrics[]>(() => {
    const metrics: UserMetrics[] = [];

    // Uniswap
    const uniswap = protocols.find(p => p.id === 'uniswap-v4');
    if (uniswap) {
      const totalUsers = Number(uniswap.transactionCount24h) || 0; // Using transactions as proxy
      const activeUsers = Math.floor(totalUsers * 0.15); // Estimate active users
      metrics.push({
        protocol: 'Uniswap V4',
        protocolId: 'uniswap-v4',
        color: uniswap.color,
        icon: uniswap.icon,
        totalUsers,
        activeUsers24h: activeUsers,
        retentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        growthRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        userType: 'traders',
      });
    }

    // Aave
    const aave = protocols.find(p => p.id === 'aave-v3');
    if (aave) {
      const totalUsers = Number(aave.transactionCount24h) || 0;
      const activeUsers = Math.floor(totalUsers * 0.12);
      metrics.push({
        protocol: 'Aave V3',
        protocolId: 'aave-v3',
        color: aave.color,
        icon: aave.icon,
        totalUsers,
        activeUsers24h: activeUsers,
        retentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        growthRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        userType: 'suppliers',
        suppliers: Math.floor(activeUsers * 0.6),
        borrowers: Math.floor(activeUsers * 0.4),
      });
    }

    // Lido
    const lido = protocols.find(p => p.id === 'lido');
    if (lido) {
      const totalUsers = Number(lido.transactionCount24h) || 0;
      const activeUsers = Math.floor(totalUsers * 0.18);
      metrics.push({
        protocol: 'Lido',
        protocolId: 'lido',
        color: lido.color,
        icon: lido.icon,
        totalUsers,
        activeUsers24h: activeUsers,
        retentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        growthRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        userType: 'stakers',
      });
    }

    // Curve
    const curve = protocols.find(p => p.id === 'curve');
    if (curve) {
      const totalUsers = Number(curve.transactionCount24h) || 0;
      const activeUsers = Math.floor(totalUsers * 0.14);
      metrics.push({
        protocol: 'Curve Finance',
        protocolId: 'curve',
        color: curve.color,
        icon: curve.icon,
        totalUsers,
        activeUsers24h: activeUsers,
        retentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        growthRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        userType: 'traders',
      });
    }

    return metrics.sort((a, b) => b.totalUsers - a.totalUsers);
  }, [protocols]);

  // Generate hour-by-hour heatmap data (last 24 hours)
  const heatmapData = useMemo<HeatmapDataPoint[]>(() => {
    const now = new Date();
    const dataPoints: HeatmapDataPoint[] = [];

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 3600000);
      const hourStr = hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false });

      // Calculate activity based on time of day (simulate realistic patterns)
      const timeMultiplier = getTimeMultiplier(hour.getHours());

      const uniswapMetric = userMetrics.find(m => m.protocolId === 'uniswap-v4');
      const aaveMetric = userMetrics.find(m => m.protocolId === 'aave-v3');
      const lidoMetric = userMetrics.find(m => m.protocolId === 'lido');
      const curveMetric = userMetrics.find(m => m.protocolId === 'curve');

      dataPoints.push({
        hour: hourStr,
        uniswap: Math.round((uniswapMetric?.activeUsers24h || 0) * timeMultiplier / 24),
        aave: Math.round((aaveMetric?.activeUsers24h || 0) * timeMultiplier / 24),
        lido: Math.round((lidoMetric?.activeUsers24h || 0) * timeMultiplier / 24),
        curve: Math.round((curveMetric?.activeUsers24h || 0) * timeMultiplier / 24),
      });
    }

    return dataPoints;
  }, [userMetrics]);

  // Protocol comparison data
  const protocolComparison = useMemo<ProtocolComparison[]>(() => {
    const totalAllUsers = userMetrics.reduce((sum, m) => sum + m.totalUsers, 0);

    return userMetrics.map(metric => ({
      name: metric.protocol,
      color: metric.color,
      totalUsers: metric.totalUsers,
      activeUsers: metric.activeUsers24h,
      percentage: totalAllUsers > 0 ? (metric.totalUsers / totalAllUsers) * 100 : 0,
    }));
  }, [userMetrics]);

  // Aggregate metrics
  const totalUniqueUsers = userMetrics.reduce((sum, m) => sum + m.totalUsers, 0);
  const totalActiveUsers = userMetrics.reduce((sum, m) => sum + m.activeUsers24h, 0);
  const avgRetentionRate = userMetrics.length > 0
    ? userMetrics.reduce((sum, m) => sum + m.retentionRate, 0) / userMetrics.length
    : 0;

  return {
    userMetrics,
    heatmapData,
    protocolComparison,
    totalUniqueUsers,
    totalActiveUsers,
    avgRetentionRate,
    loading,
  };
}

// Helper function to simulate realistic activity patterns by hour
function getTimeMultiplier(hour: number): number {
  // Peak hours: 8-10 AM, 12-2 PM, 6-9 PM UTC
  if ((hour >= 8 && hour <= 10) || (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 21)) {
    return 1.5;
  }
  // Low activity: 12-6 AM
  if (hour >= 0 && hour <= 6) {
    return 0.4;
  }
  // Normal activity
  return 1.0;
}
