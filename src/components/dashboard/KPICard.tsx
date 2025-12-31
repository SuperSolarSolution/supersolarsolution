import { KPIMetric } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  metric: KPIMetric;
  icon?: React.ComponentType<{ className?: string }>;
}

export function KPICard({ metric, icon: Icon }: KPICardProps) {
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
  
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
            <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
            {metric.change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
              )}>
                <TrendIcon className="h-3 w-3" />
                <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-3">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
