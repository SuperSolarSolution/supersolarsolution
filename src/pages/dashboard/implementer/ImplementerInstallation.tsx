import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

const STAGES = ['Site Survey', 'Foundation', 'Mounting', 'Panel Install', 'Wiring & Inverter', 'Testing', 'Commissioning'];

function stageIndex(status: string) {
  switch (status) {
    case 'planning': return 1;
    case 'under_construction': return 4;
    case 'maintenance': return 6;
    case 'operational': return 7;
    default: return 0;
  }
}

export default function ImplementerInstallation() {
  const { user } = useAuth();
  const { data: allAssets, isLoading } = useSolarAssets();
  const assets = (allAssets || []).filter(a => a.implementer_id === user?.id && a.status !== 'operational');

  if (isLoading) {
    return (
      <DashboardLayout role="implementer">
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="implementer">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Installation & Commissioning</h1>
          <p className="text-muted-foreground">Track every stage of asset installation</p>
        </div>

        {assets.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">All assigned assets are operational.</CardContent></Card>
        ) : assets.map(asset => {
          const idx = stageIndex(asset.status);
          const progress = Math.round((idx / STAGES.length) * 100);
          return (
            <Card key={asset.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{asset.name}</CardTitle>
                  <Badge variant="outline">{progress}% complete</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{asset.location} · {asset.capacity_kw} kW</p>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="h-2 mb-4" />
                <div className="space-y-3">
                  {STAGES.map((stage, i) => {
                    const done = i < idx;
                    const active = i === idx;
                    return (
                      <div key={stage} className="flex items-center gap-3">
                        {done ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <Circle className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />}
                        <span className={`text-sm ${done ? 'text-foreground' : active ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>{stage}</span>
                        {active && <Badge className="ml-auto bg-primary/10 text-primary">In Progress</Badge>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
