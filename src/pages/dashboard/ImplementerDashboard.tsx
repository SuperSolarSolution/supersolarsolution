import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { implementerKPIs, mockSolarAssets } from '@/data/mockData';
import { Wrench, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const projects = [
  {
    id: 'proj-001',
    asset: 'Karnataka Rooftop Project',
    stage: 'Foundation Work',
    progress: 45,
    dueDate: '30 Apr 2024',
    status: 'on_track',
  },
  {
    id: 'proj-002',
    asset: 'Maharashtra Industrial Solar',
    stage: 'Site Survey',
    progress: 15,
    dueDate: '15 May 2024',
    status: 'on_track',
  },
];

const maintenanceLogs = [
  { asset: 'Gujarat Solar Park', type: 'Routine Inspection', date: '25 Mar 2024', status: 'completed' },
  { asset: 'Gujarat Solar Park', type: 'Panel Cleaning', date: '28 Mar 2024', status: 'completed' },
  { asset: 'Rajasthan Solar Farm', type: 'Inverter Check', date: '01 Apr 2024', status: 'scheduled' },
  { asset: 'Rajasthan Solar Farm', type: 'Routine Inspection', date: '05 Apr 2024', status: 'scheduled' },
];

const performanceMetrics = [
  { asset: 'Gujarat Solar Park', efficiency: 96.5, uptime: 99.2, output: 4825 },
  { asset: 'Rajasthan Solar Farm', efficiency: 97.8, uptime: 99.5, output: 9876 },
];

export default function ImplementerDashboard() {
  const icons = [Wrench, CheckCircle, CheckCircle, Clock];

  return (
    <DashboardLayout role="implementer">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Implementer Dashboard</h1>
          <p className="text-muted-foreground">SunPower EPC Solutions Pvt. Ltd.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {implementerKPIs.map((metric, idx) => (
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
            {projects.map((project) => (
              <div key={project.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{project.asset}</p>
                    <p className="text-sm text-muted-foreground">Current Stage: {project.stage}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={
                      project.status === 'on_track' ? 'bg-green-50 text-green-700' :
                      project.status === 'delayed' ? 'bg-red-50 text-red-700' : ''
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
                      idx < Math.floor(project.progress / 25) ? 'bg-green-100 text-green-700' :
                      idx === Math.floor(project.progress / 25) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {stage}
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
              {maintenanceLogs.map((log, idx) => (
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
                      log.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {log.status === 'completed' ? 'Completed' : 'Scheduled'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Asset Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Performance Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceMetrics.map((asset) => (
                <div key={asset.asset} className="rounded-lg border border-border p-4">
                  <p className="font-medium mb-3">{asset.asset}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Efficiency</p>
                      <p className="text-lg font-bold text-green-600">{asset.efficiency}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Uptime</p>
                      <p className="text-lg font-bold">{asset.uptime}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Output (kW)</p>
                      <p className="text-lg font-bold">{asset.output.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
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
                <p className="text-3xl font-bold">12</p>
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
