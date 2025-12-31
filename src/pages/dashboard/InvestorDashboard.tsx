import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { AssetTable } from '@/components/dashboard/AssetTable';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { investorKPIs, mockSolarAssets, mockInvestments, mockTransactions } from '@/data/mockData';
import { PieChart, TrendingUp, Wallet, Sun, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const investmentDistribution = [
  { name: 'Gujarat Solar Park', value: 500000, color: 'hsl(var(--primary))' },
  { name: 'Rajasthan Solar Farm', value: 1000000, color: 'hsl(var(--chart-1))' },
  { name: 'Karnataka Rooftop', value: 250000, color: 'hsl(var(--chart-3))' },
];

export default function InvestorDashboard() {
  const icons = [Wallet, TrendingUp, TrendingUp, Sun];

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Investor Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Rajesh Kumar</p>
          </div>
          <Button asChild>
            <Link to="/calculator">
              Explore New Assets <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {investorKPIs.map((metric, idx) => (
            <KPICard key={metric.label} metric={metric} icon={icons[idx]} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Investment Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <PieChart className="h-5 w-5 text-primary" />
                Portfolio Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={investmentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {investmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`₹${(value/100000).toFixed(1)}L`, 'Amount']} />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <TransactionList transactions={mockTransactions} />
          </div>
        </div>

        {/* Active Investments */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">My Solar Assets</h2>
          <AssetTable 
            assets={mockSolarAssets.filter(a => 
              mockInvestments.some(inv => inv.assetId === a.id)
            )} 
          />
        </div>

        {/* Tax Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tax & Income Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Returns (FY 2024-25)</p>
                <p className="text-xl font-bold">₹2,16,500</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">TDS Deducted</p>
                <p className="text-xl font-bold">₹21,650</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Credit</p>
                <p className="text-xl font-bold text-green-600">₹1,94,850</p>
              </div>
              <div className="flex items-center">
                <Button variant="outline" size="sm">
                  Download Tax Statement
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
