import { KPIMetric } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  metric: KPIMetric;
  icon?: React.ComponentType<{ className?: string }>;
  index?: number;
}

export function KPICard({ metric, icon: Icon, index = 0 }: KPICardProps) {
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
  
  return (
    <Card className={cn(
      "relative overflow-hidden opacity-0 animate-fade-in-up",
      `animate-stagger-${index + 1}`
    )}>
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
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
            <div className="rounded-xl bg-primary/10 p-3 shadow-sm shadow-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
