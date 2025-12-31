import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { FundingChart } from '@/components/charts/FundingChart';
import { AssetTable } from '@/components/dashboard/AssetTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useNBFCFunding, useFundingMilestones } from '@/hooks/useNBFCFunding';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { Wallet, TrendingUp, PieChart, Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { KPIMetric } from '@/types';

export default function NBFCDashboard() {
  const { profile } = useAuth();
  const { data: funding, isLoading: fundingLoading } = useNBFCFunding();
  const { data: allAssets, isLoading: assetsLoading } = useSolarAssets();

  const isLoading = fundingLoading || assetsLoading;

  // Calculate KPIs from real data
  const totalSanctioned = funding?.reduce((sum, f) => sum + Number(f.sanctioned_amount), 0) || 0;
  const totalDisbursed = funding?.reduce((sum, f) => sum + Number(f.disbursed_amount), 0) || 0;
  const activeAssets = funding?.filter(f => f.status !== 'closed').length || 0;
  const portfolioHealth = funding && funding.length > 0 ? 
    (funding.filter(f => f.status !== 'closed').length / funding.length) * 100 : 100;

  const kpis: KPIMetric[] = [
    { label: 'Total Sanctioned', value: `₹${(totalSanctioned / 10000000).toFixed(2)} Cr`, trend: 'up', change: 18.5 },
    { label: 'Total Disbursed', value: `₹${(totalDisbursed / 10000000).toFixed(2)} Cr`, trend: 'up', change: 12.3 },
    { label: 'Active Assets', value: activeAssets.toString(), trend: 'stable' },
    { label: 'Portfolio Health', value: `${portfolioHealth.toFixed(0)}%`, trend: 'up', change: 2.1 },
  ];

  const icons = [Wallet, TrendingUp, PieChart, Shield];

  // Create fund allocation data for pie chart
  const fundAllocationData = funding?.map((f, index) => ({
    name: f.solar_assets?.name || 'Unknown Asset',
    value: Number(f.sanctioned_amount),
    color: `hsl(${index * 60}, 70%, 50%)`,
  })) || [];

  // Get funded asset IDs
  const fundedAssetIds = new Set(funding?.map(f => f.asset_id) || []);
  const fundedAssets = allAssets?.filter(asset => fundedAssetIds.has(asset.id)) || [];

  // Map assets for table
  const mappedAssets = fundedAssets.map(asset => ({
    id: asset.id,
    name: asset.name,
    location: asset.location,
    capacityKW: Number(asset.capacity_kw),
    status: asset.status,
    installationDate: asset.installation_date ? new Date(asset.installation_date) : null,
    expectedLifeYears: asset.expected_life_years,
    annualDegradation: Number(asset.annual_degradation),
    corporateId: asset.corporate_id || '',
    implementerId: asset.implementer_id || '',
    totalInvestment: Number(asset.total_investment),
    fundedAmount: Number(asset.funded_amount),
    expectedIRR: Number(asset.expected_irr),
    riskScore: asset.risk_score,
  }));

  // Risk alerts based on asset status
  const riskAlerts = fundedAssets
    ?.filter(asset => asset.status === 'maintenance')
    .map(asset => ({
      asset: asset.name,
      alert: 'Asset is under maintenance',
      severity: 'low' as const,
    })) || [];

  if (isLoading) {
    return (
      <DashboardLayout role="nbfc">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="nbfc">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">NBFC Dashboard</h1>
          <p className="text-muted-foreground">{profile?.full_name || 'NBFC User'} - Institutional Funding Portal</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((metric, idx) => (
            <KPICard key={metric.label} metric={metric} icon={icons[idx]} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Fund Allocation */}
          {fundAllocationData.length > 0 ? (
            <FundingChart data={fundAllocationData} title="Fund Allocation by Asset" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fund Allocation by Asset</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-72 text-muted-foreground">
                No funding data available yet
              </CardContent>
            </Card>
          )}

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

        {/* Disbursement Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Disbursement Status</CardTitle>
          </CardHeader>
          <CardContent>
            {funding && funding.length > 0 ? (
              <div className="space-y-4">
                {funding.map((f) => (
                  <div key={f.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        f.status === 'fully_disbursed' ? 'bg-green-500' :
                        f.status === 'partially_disbursed' ? 'bg-primary' : 'bg-muted'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{f.solar_assets?.name || 'Unknown Asset'}</p>
                        <p className="text-xs text-muted-foreground">
                          Disbursed: ₹{(Number(f.disbursed_amount) / 10000000).toFixed(2)} Cr / ₹{(Number(f.sanctioned_amount) / 10000000).toFixed(2)} Cr
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      f.status === 'fully_disbursed' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' :
                      f.status === 'partially_disbursed' ? 'bg-primary/10 text-primary' : ''
                    }>
                      {f.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No funding records yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Portfolio */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Funded Assets</h2>
          {mappedAssets.length > 0 ? (
            <AssetTable assets={mappedAssets} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No funded assets yet
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
