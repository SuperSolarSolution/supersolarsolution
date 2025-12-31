import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { EnergyChart } from '@/components/charts/EnergyChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { corporateKPIs, mockEnergyData } from '@/data/mockData';
import { Wallet, Zap, Leaf, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const costComparisonData = [
  { month: 'Jan', Grid: 485000, Solar: 285000 },
  { month: 'Feb', Grid: 520000, Solar: 298000 },
  { month: 'Mar', Grid: 545000, Solar: 312000 },
  { month: 'Apr', Grid: 580000, Solar: 325000 },
  { month: 'May', Grid: 610000, Solar: 342000 },
  { month: 'Jun', Grid: 590000, Solar: 328000 },
];

const contractDetails = [
  { label: 'Contract Type', value: 'Power Purchase Agreement' },
  { label: 'Tenure', value: '15 Years' },
  { label: 'Tariff Rate', value: '₹4.50/kWh' },
  { label: 'Annual Escalation', value: '2%' },
  { label: 'Start Date', value: '15 Jun 2023' },
  { label: 'Asset Capacity', value: '5,000 kW' },
];

export default function CorporateDashboard() {
  const icons = [Wallet, Zap, Leaf, TrendingDown];

  return (
    <DashboardLayout role="corporate">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Corporate Dashboard</h1>
          <p className="text-muted-foreground">Tata Industries Pvt. Ltd.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {corporateKPIs.map((metric, idx) => (
            <KPICard key={metric.label} metric={metric} icon={icons[idx]} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Energy Generation */}
          <EnergyChart data={mockEnergyData} />

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
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-muted-foreground">Carbon Offset (This Year)</p>
                <p className="text-2xl font-bold text-green-700">92.5 tCO₂</p>
                <p className="text-xs text-green-600 mt-1">Equivalent to 4,250 trees planted</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Clean Energy %</p>
                  <p className="text-xl font-bold">78%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ESG Score</p>
                  <p className="text-xl font-bold">A+</p>
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
                <Badge variant="outline" className="bg-green-50 text-green-700">Due in 15 days</Badge>
              </div>
              <div>
                <p className="text-3xl font-bold">₹3,28,450</p>
                <p className="text-sm text-muted-foreground">For June 2024</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Energy Consumed</span>
                  <span>18,100 kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rate</span>
                  <span>₹4.50/kWh</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You Saved vs Grid</span>
                  <span className="text-green-600 font-medium">₹2,62,000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
