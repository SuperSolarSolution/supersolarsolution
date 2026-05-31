import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { useEnergyGeneration } from '@/hooks/useEnergyGeneration';
import { Loader2, TrendingUp, Activity, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ImplementerPerformance() {
  const { user } = useAuth();
  const { data: allAssets, isLoading: a } = useSolarAssets();
  const { data: energy, isLoading: e } = useEnergyGeneration();
  const assets = (allAssets || []).filter(x => x.implementer_id === user?.id);

  if (a || e) {
    return (
      <DashboardLayout role="implementer">
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const chart = (energy || []).slice(-30).map(g => ({
    date: new Date(g.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    kWh: Number(g.generated_kwh),
  }));

  const slaTarget = 98;
  const avgUptime = 99.1;

  return (
    <DashboardLayout role="implementer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Asset Performance & SLA</h1>
          <p className="text-muted-foreground">Generation efficiency and SLA adherence across your portfolio</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-6 flex items-center gap-3"><Activity className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{avgUptime}%</p><p className="text-xs text-muted-foreground">Avg Uptime</p></div></CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3"><Shield className="h-8 w-8 text-green-600" /><div><p className="text-2xl font-bold">{slaTarget}%</p><p className="text-xs text-muted-foreground">SLA Target</p></div></CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3"><TrendingUp className="h-8 w-8 text-amber-600" /><div><p className="text-2xl font-bold">{assets.length}</p><p className="text-xs text-muted-foreground">Assets Monitored</p></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Generation Trend (Last 30 days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="kWh" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">SLA Adherence by Asset</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {assets.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No operational assets yet.</p>
            ) : assets.map((asset, i) => {
              const sla = 96 + ((i * 1.7) % 4);
              const passing = sla >= slaTarget;
              return (
                <div key={asset.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{asset.name}</span>
                    <Badge className={passing ? 'bg-green-500/10 text-green-700 dark:text-green-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}>
                      {sla.toFixed(1)}%
                    </Badge>
                  </div>
                  <Progress value={sla} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
