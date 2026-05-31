import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { Loader2, Building2, MapPin, Calendar } from 'lucide-react';

const statusMeta: Record<string, { label: string; progress: number; variant: string }> = {
  planning: { label: 'Planning', progress: 15, variant: 'bg-blue-500/15 text-blue-700 dark:text-blue-300' },
  under_construction: { label: 'Under Construction', progress: 55, variant: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  operational: { label: 'Operational', progress: 100, variant: 'bg-green-500/15 text-green-700 dark:text-green-300' },
  maintenance: { label: 'Maintenance', progress: 90, variant: 'bg-purple-500/15 text-purple-700 dark:text-purple-300' },
};

export default function ImplementerProjects() {
  const { user } = useAuth();
  const { data: allAssets, isLoading } = useSolarAssets();
  const assets = (allAssets || []).filter(a => a.implementer_id === user?.id);

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
          <h1 className="text-2xl font-bold">Assigned Projects</h1>
          <p className="text-muted-foreground">All solar assets assigned to your team</p>
        </div>

        {assets.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No projects assigned yet.</CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {assets.map(asset => {
              const meta = statusMeta[asset.status] || statusMeta.planning;
              return (
                <Card key={asset.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />{asset.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{asset.location}</p>
                      </div>
                      <Badge className={meta.variant}>{meta.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-muted-foreground">Capacity</p><p className="font-semibold">{asset.capacity_kw} kW</p></div>
                      <div><p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Install Date</p><p className="font-semibold">{asset.installation_date || 'TBD'}</p></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span>Project Progress</span><span className="font-medium">{meta.progress}%</span></div>
                      <Progress value={meta.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
