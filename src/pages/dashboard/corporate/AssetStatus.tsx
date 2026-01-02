import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AssetStatus() {
  const { data: assets, isLoading } = useQuery({
    queryKey: ['corporate-assets-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'Live'); // Only live projects have asset status

      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout role="corporate">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Asset Status</h1>
          <p className="text-muted-foreground">Operational status and maintenance schedules</p>
        </div>

        {isLoading ? (
          <div>Loading asset status...</div>
        ) : assets?.length === 0 ? (
          <div className="text-muted-foreground">No live assets found.</div>
        ) : (
          <div className="space-y-4">
            {assets?.map((asset) => (
              <Card key={asset.project_id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{asset.project_name}</CardTitle>
                    <Badge className={
                      asset.health_status === 'Good' ? 'bg-green-500 hover:bg-green-600' :
                        asset.health_status === 'Fair' ? 'bg-yellow-500 hover:bg-yellow-600' :
                          'bg-red-500 hover:bg-red-600'
                    }>
                      {asset.health_status || 'Unknown'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Last Maintenance</p>
                      <p className="font-medium">{asset.last_maintenance_date || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Scheduled</p>
                      <p className="font-medium">{asset.next_maintenance_date || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">System Health</p>
                      <p className="font-medium text-green-600">{asset.health_status || 'Good'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
