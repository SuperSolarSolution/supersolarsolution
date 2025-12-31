import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { useEnergyGeneration } from '@/hooks/useEnergyGeneration';
import { Wrench, CheckCircle, Clock, Calendar, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { KPIMetric } from '@/types';

export default function ImplementerDashboard() {
  const { profile, user } = useAuth();
  const { data: allAssets, isLoading: assetsLoading } = useSolarAssets();
  const { data: energyData, isLoading: energyLoading } = useEnergyGeneration();

  const isLoading = assetsLoading || energyLoading;

  // Filter assets assigned to this implementer
  const implementerAssets = allAssets?.filter(asset => asset.implementer_id === user?.id) || [];
  
  // Calculate metrics
  const activeProjects = implementerAssets.filter(a => 
    a.status === 'planning' || a.status === 'under_construction'
  ).length;
  const operationalAssets = implementerAssets.filter(a => a.status === 'operational').length;
  const totalCapacity = implementerAssets.reduce((sum, a) => sum + Number(a.capacity_kw), 0);

  const kpis: KPIMetric[] = [
    { label: 'Active Projects', value: activeProjects.toString(), trend: 'stable' },
    { label: 'Completed Installations', value: operationalAssets.toString(), trend: 'up', change: 2 },
    { label: 'Total Capacity Managed', value: `${(totalCapacity / 1000).toFixed(1)} MW`, trend: 'up', change: 15 },
    { label: 'SLA Adherence', value: '98.2%', trend: 'up', change: 1.5 },
  ];

  const icons = [Wrench, CheckCircle, CheckCircle, Clock];

  // Create project list from assets
  const projects = implementerAssets
    .filter(a => a.status !== 'operational')
    .map(asset => {
      let progress = 0;
      let stage = 'Planning';
      
      switch (asset.status) {
        case 'planning':
          progress = 15;
          stage = 'Site Survey';
          break;
        case 'under_construction':
          progress = 55;
          stage = 'Installation';
          break;
        case 'maintenance':
          progress = 90;
          stage = 'Commissioning';
          break;
      }
      
      return {
        id: asset.id,
        asset: asset.name,
        stage,
        progress,
        dueDate: asset.installation_date || 'TBD',
        status: 'on_track' as const,
      };
    });

  // Performance metrics for operational assets
  const performanceMetrics = implementerAssets
    .filter(a => a.status === 'operational')
    .map(asset => ({
      asset: asset.name,
      efficiency: 96 + Math.random() * 3,
      uptime: 98 + Math.random() * 2,
      output: Number(asset.capacity_kw) * 0.8,
    }));

  // Mock maintenance logs
  const maintenanceLogs = implementerAssets
    .filter(a => a.status === 'operational')
    .flatMap(asset => [
      { asset: asset.name, type: 'Routine Inspection', date: 'Last week', status: 'completed' as const },
      { asset: asset.name, type: 'Panel Cleaning', date: 'Next week', status: 'scheduled' as const },
    ]).slice(0, 4);

  if (isLoading) {
    return (
      <DashboardLayout role="implementer">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="implementer">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Implementer Dashboard</h1>
          <p className="text-muted-foreground">{profile?.full_name || 'EPC Solutions'}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((metric, idx) => (
            <KPICard key={metric.label} metric={metric} icon={icons[idx]} />
          ))}
        </div>

        {/* Active Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{project.asset}</p>
                      <p className="text-sm text-muted-foreground">Current Stage: {project.stage}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={
                        project.status === 'on_track' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' :
                        project.status === 'delayed' ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400' : ''
                      }>
                        {project.status === 'on_track' ? 'On Track' : 'Delayed'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Due: {project.dueDate}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['Planning', 'Foundation', 'Installation', 'Commissioning'].map((stage, idx) => (
                      <div key={stage} className={`rounded-lg p-2 text-center text-xs ${
                        idx < Math.floor(project.progress / 25) ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        idx === Math.floor(project.progress / 25) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {stage}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No active projects. All installations are operational.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Maintenance Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5 text-primary" />
                Maintenance Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {maintenanceLogs.length > 0 ? (
                maintenanceLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      {log.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-primary" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{log.type}</p>
                        <p className="text-xs text-muted-foreground">{log.asset}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{log.date}</p>
                      <Badge variant="outline" className={`text-xs ${
                        log.status === 'completed' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                      }`}>
                        {log.status === 'completed' ? 'Completed' : 'Scheduled'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No maintenance logs yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Asset Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Performance Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceMetrics.length > 0 ? (
                performanceMetrics.map((asset) => (
                  <div key={asset.asset} className="rounded-lg border border-border p-4">
                    <p className="font-medium mb-3">{asset.asset}</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Efficiency</p>
                        <p className="text-lg font-bold text-green-600">{asset.efficiency.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Uptime</p>
                        <p className="text-lg font-bold">{asset.uptime.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Output (kW)</p>
                        <p className="text-lg font-bold">{asset.output.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No operational assets to monitor
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SLA Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SLA Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">98.2%</p>
                <p className="text-sm text-muted-foreground">Overall SLA Adherence</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">4.2 hrs</p>
                <p className="text-sm text-muted-foreground">Avg. Response Time</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{operationalAssets * 3}</p>
                <p className="text-sm text-muted-foreground">Issues Resolved (30d)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">0</p>
                <p className="text-sm text-muted-foreground">Open Critical Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
