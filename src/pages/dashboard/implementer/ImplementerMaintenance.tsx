import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { Loader2, Wrench, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function ImplementerMaintenance() {
  const { user } = useAuth();
  const { data: allAssets, isLoading } = useSolarAssets();
  const assets = (allAssets || []).filter(a => a.implementer_id === user?.id);

  // Synthesize maintenance log entries from assets (no schema for logs yet)
  const logs = assets.flatMap(a => [
    { id: `${a.id}-1`, asset: a.name, type: 'Quarterly Inspection', date: '2026-04-10', status: 'completed' as const, note: 'All panels healthy, output nominal.' },
    { id: `${a.id}-2`, asset: a.name, type: 'Panel Cleaning', date: '2026-06-15', status: 'scheduled' as const, note: 'Soiling losses observed; cleaning scheduled.' },
    { id: `${a.id}-3`, asset: a.name, type: 'Inverter Fault', date: '2026-05-22', status: 'open' as const, note: 'String 3 inverter intermittent error code F042.' },
  ]).slice(0, 9);

  const open = logs.filter(l => l.status === 'open').length;
  const scheduled = logs.filter(l => l.status === 'scheduled').length;
  const done = logs.filter(l => l.status === 'completed').length;

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
          <h1 className="text-2xl font-bold">Maintenance & Issue Logs</h1>
          <p className="text-muted-foreground">Open issues, scheduled visits and resolved work orders</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="pt-6 flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-destructive" /><div><p className="text-2xl font-bold">{open}</p><p className="text-xs text-muted-foreground">Open Issues</p></div></CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3"><Clock className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{scheduled}</p><p className="text-xs text-muted-foreground">Scheduled Visits</p></div></CardContent></Card>
          <Card><CardContent className="pt-6 flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-green-600" /><div><p className="text-2xl font-bold">{done}</p><p className="text-xs text-muted-foreground">Completed (30d)</p></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Wrench className="h-5 w-5 text-primary" />Work Orders</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No maintenance records yet.</p>
            ) : logs.map(l => (
              <div key={l.id} className="flex items-start justify-between gap-3 border-b last:border-0 pb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{l.type}</p>
                    <Badge variant="outline" className={
                      l.status === 'open' ? 'bg-red-500/10 text-red-700 dark:text-red-300' :
                      l.status === 'scheduled' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300' :
                      'bg-green-500/10 text-green-700 dark:text-green-300'
                    }>{l.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{l.asset} · {l.date}</p>
                  <p className="text-sm text-muted-foreground mt-1">{l.note}</p>
                </div>
                {l.status !== 'completed' && <Button size="sm" variant="outline">Update</Button>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
