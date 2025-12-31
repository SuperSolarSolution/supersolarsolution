import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { FundingChart } from '@/components/charts/FundingChart';
import { AssetTable } from '@/components/dashboard/AssetTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { nbfcKPIs, mockSolarAssets } from '@/data/mockData';
import { Wallet, TrendingUp, PieChart, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const fundAllocationData = [
  { name: 'Gujarat Solar Park', value: 25000000, color: 'hsl(var(--primary))' },
  { name: 'Rajasthan Solar Farm', value: 48000000, color: 'hsl(var(--chart-1))' },
  { name: 'Karnataka Rooftop', value: 12500000, color: 'hsl(var(--chart-3))' },
  { name: 'Maharashtra Industrial', value: 35000000, color: 'hsl(var(--chart-4))' },
];

const milestones = [
  { asset: 'Karnataka Rooftop', milestone: 'Land Acquisition', status: 'completed', date: '15 Jan 2024' },
  { asset: 'Karnataka Rooftop', milestone: 'Permitting', status: 'completed', date: '20 Feb 2024' },
  { asset: 'Karnataka Rooftop', milestone: 'Foundation Work', status: 'in_progress', date: '30 Mar 2024' },
  { asset: 'Karnataka Rooftop', milestone: 'Panel Installation', status: 'pending', date: '30 Apr 2024' },
  { asset: 'Maharashtra Industrial', milestone: 'Land Acquisition', status: 'completed', date: '01 Mar 2024' },
  { asset: 'Maharashtra Industrial', milestone: 'Permitting', status: 'in_progress', date: '15 Apr 2024' },
];

const riskAlerts = [
  { asset: 'Gujarat Solar Park', alert: 'Performance 3% below forecast', severity: 'low' },
  { asset: 'Rajasthan Solar Farm', alert: 'Maintenance scheduled next week', severity: 'info' },
];

export default function NBFCDashboard() {
  const icons = [Wallet, TrendingUp, PieChart, Shield];

  return (
    <DashboardLayout role="nbfc">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">NBFC Dashboard</h1>
          <p className="text-muted-foreground">Green Finance Ltd. - Institutional Funding Portal</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {nbfcKPIs.map((metric, idx) => (
            <KPICard key={metric.label} metric={metric} icon={icons[idx]} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Fund Allocation */}
          <FundingChart data={fundAllocationData} title="Fund Allocation by Asset" />

          {/* Risk Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Risk & Performance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {riskAlerts.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>All assets performing within parameters</span>
                </div>
              ) : (
                riskAlerts.map((alert, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.severity === 'low' ? 'text-yellow-600' : 
                      alert.severity === 'info' ? 'text-blue-600' : 'text-red-600'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{alert.asset}</p>
                      <p className="text-sm text-muted-foreground">{alert.alert}</p>
                    </div>
                  </div>
                ))
              )}

              {/* Portfolio Health Summary */}
              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Portfolio Health</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>On-Time Repayment</span>
                      <span className="font-medium">98.5%</span>
                    </div>
                    <Progress value={98.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Asset Utilization</span>
                      <span className="font-medium">92.3%</span>
                    </div>
                    <Progress value={92.3} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compliance Score</span>
                      <span className="font-medium">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Milestone Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Disbursement Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      m.status === 'completed' ? 'bg-green-500' :
                      m.status === 'in_progress' ? 'bg-primary' : 'bg-muted'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{m.milestone}</p>
                      <p className="text-xs text-muted-foreground">{m.asset}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{m.date}</span>
                    <Badge variant="outline" className={
                      m.status === 'completed' ? 'bg-green-50 text-green-700' :
                      m.status === 'in_progress' ? 'bg-primary/10 text-primary' : ''
                    }>
                      {m.status === 'completed' ? 'Completed' : 
                       m.status === 'in_progress' ? 'In Progress' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Asset Portfolio */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Funded Assets</h2>
          <AssetTable assets={mockSolarAssets} />
        </div>
      </div>
    </DashboardLayout>
  );
}
