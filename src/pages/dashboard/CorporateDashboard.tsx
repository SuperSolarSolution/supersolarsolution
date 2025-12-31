import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { EnergyChart } from '@/components/charts/EnergyChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { useEnergyGeneration } from '@/hooks/useEnergyGeneration';
import { Wallet, Zap, Leaf, TrendingDown, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { KPIMetric } from '@/types';

export default function CorporateDashboard() {
  const { profile, user } = useAuth();
  const { data: allAssets, isLoading: assetsLoading } = useSolarAssets();
  const { data: energyData, isLoading: energyLoading } = useEnergyGeneration();

  const isLoading = assetsLoading || energyLoading;

  // Filter assets assigned to this corporate
  const corporateAssets = allAssets?.filter(asset => asset.corporate_id === user?.id) || [];

  // Calculate metrics
  const totalCapacity = corporateAssets.reduce((sum, asset) => sum + Number(asset.capacity_kw), 0);
  const totalGenerated = energyData?.reduce((sum, e) => sum + Number(e.generated_kwh), 0) || 0;
  const totalConsumed = energyData?.reduce((sum, e) => sum + Number(e.consumed_kwh), 0) || 0;
  const totalExported = energyData?.reduce((sum, e) => sum + Number(e.exported_kwh), 0) || 0;

  // Cost calculations (assuming ₹8/kWh grid rate and ₹4.5/kWh solar rate)
  const gridRate = 8;
  const solarRate = 4.5;
  const monthlySavings = totalConsumed * (gridRate - solarRate);
  const carbonOffset = totalGenerated * 0.0008; // ~0.8 kg CO2 per kWh

  const kpis: KPIMetric[] = [
    { label: 'Monthly Savings', value: `₹${(monthlySavings / 100000).toFixed(1)}L`, trend: 'up', change: 15.2 },
    { label: 'Energy Generated', value: `${(totalGenerated / 1000).toFixed(0)} MWh`, trend: 'up', change: 8.5 },
    { label: 'Carbon Offset', value: `${carbonOffset.toFixed(1)} tCO₂`, trend: 'up', change: 12.0 },
    { label: 'Grid Cost Reduction', value: '42%', trend: 'up', change: 5.3 },
  ];

  const icons = [Wallet, Zap, Leaf, TrendingDown];

  // Create cost comparison data (mock monthly data)
  const costComparisonData = [
    { month: 'Jan', Grid: 485000, Solar: 285000 },
    { month: 'Feb', Grid: 520000, Solar: 298000 },
    { month: 'Mar', Grid: 545000, Solar: 312000 },
    { month: 'Apr', Grid: 580000, Solar: 325000 },
    { month: 'May', Grid: 610000, Solar: 342000 },
    { month: 'Jun', Grid: 590000, Solar: 328000 },
  ];

  // Map energy data for chart
  const mappedEnergyData = energyData?.map(e => ({
    id: e.id,
    assetId: e.asset_id,
    date: new Date(e.date),
    generatedKWh: Number(e.generated_kwh),
    consumedKWh: Number(e.consumed_kwh),
    exportedKWh: Number(e.exported_kwh),
  })) || [];

  const contractDetails = [
    { label: 'Contract Type', value: 'Power Purchase Agreement' },
    { label: 'Tenure', value: '15 Years' },
    { label: 'Tariff Rate', value: `₹${solarRate}/kWh` },
    { label: 'Annual Escalation', value: '2%' },
    { label: 'Start Date', value: corporateAssets[0]?.installation_date || 'N/A' },
    { label: 'Asset Capacity', value: `${totalCapacity.toLocaleString()} kW` },
  ];

  if (isLoading) {
    return (
      <DashboardLayout role="corporate">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="corporate">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Corporate Dashboard</h1>
          <p className="text-muted-foreground">{profile?.full_name || 'Corporate User'}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((metric, idx) => (
            <KPICard key={metric.label} metric={metric} icon={icons[idx]} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Energy Generation */}
          {mappedEnergyData.length > 0 ? (
            <EnergyChart data={mappedEnergyData} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Energy Generation vs Consumption</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-72 text-muted-foreground">
                No energy data available yet
              </CardContent>
            </Card>
          )}

          {/* Cost Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grid vs Solar Cost Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} className="text-xs" />
                    <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="Grid" fill="hsl(var(--muted-foreground))" name="Grid Cost" />
                    <Bar dataKey="Solar" fill="hsl(var(--primary))" name="Solar Cost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Contract</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contractDetails.map((item) => (
                  <div key={item.label} className="flex justify-between border-b border-border pb-2 last:border-0">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sustainability Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Leaf className="h-5 w-5 text-green-600" />
                Sustainability Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                <p className="text-sm text-muted-foreground">Carbon Offset (This Year)</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{carbonOffset.toFixed(1)} tCO₂</p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">Equivalent to {Math.floor(carbonOffset * 46)} trees planted</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Clean Energy %</p>
                  <p className="text-xl font-bold">{totalCapacity > 0 ? '78%' : '0%'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ESG Score</p>
                  <p className="text-xl font-bold">{totalCapacity > 0 ? 'A+' : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Month Bill</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400">Due in 15 days</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold">₹{(totalConsumed * solarRate).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">For current period</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Energy Consumed</span>
                  <span>{totalConsumed.toLocaleString()} kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span>₹{solarRate}/kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You Saved vs Grid</span>
                  <span className="text-green-600 font-medium">₹{monthlySavings.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
