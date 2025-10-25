'use client';

import { useProtocolHealth } from '@/hooks/useProtocolHealth';
import { Badge } from '@/components/ui/badge';
import { Heart, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  protocolId: string;
  compact?: boolean;
}

export function HealthIndicator({ protocolId, compact = false }: Props) {
  const { health, loading } = useProtocolHealth();
  
  // Find health data for this protocol
  const protocolHealth = health.find((h) => h.protocol === protocolId);

  if (loading || !protocolHealth) {
    return compact ? (
      <Badge variant="outline" className="text-gray-400 border-gray-600">
        <Heart className="h-3 w-3 mr-1" />
        --
      </Badge>
    ) : (
      <div className="text-gray-400 text-sm">Loading...</div>
    );
  }

  const score = protocolHealth.healthScore;
  
  // Determine color and icon based on health score
  const getHealthStatus = (score: number) => {
    if (score >= 80) {
      return {
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/30',
        label: 'Healthy',
        icon: CheckCircle,
      };
    } else if (score >= 50) {
      return {
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        label: 'Caution',
        icon: AlertTriangle,
      };
    } else {
      return {
        color: 'text-red-400',
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        label: 'Risk',
        icon: AlertTriangle,
      };
    }
  };

  const status = getHealthStatus(score);
  const Icon = status.icon;

  if (compact) {
    return (
      <Badge className={`${status.bgColor} border-0`}>
        <Heart className={`h-3 w-3 mr-1 ${status.color}`} />
        <span className={status.color}>{score}</span>
      </Badge>
    );
  }

  // Full health indicator
  return (
    <div className={`${status.bgColor} rounded-lg p-4 border ${status.borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${status.color}`} />
          <span className="text-sm text-gray-400">Health Score</span>
        </div>
        <Badge variant="outline" className={`${status.color} border-current`}>
          {status.label}
        </Badge>
      </div>
      
      <p className={`text-3xl font-bold ${status.color} mb-2`}>
        {score}<span className="text-lg">/100</span>
      </p>
      
      {/* Health bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${status.bgColor.replace('/20', '')}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Warnings */}
      {protocolHealth.warnings && protocolHealth.warnings.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-400 mb-1">Warnings:</p>
          {protocolHealth.warnings.map((warning, i) => (
            <p key={i} className="text-xs text-gray-300 flex items-start gap-1">
              <span className="text-yellow-400">⚠</span>
              {warning}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}