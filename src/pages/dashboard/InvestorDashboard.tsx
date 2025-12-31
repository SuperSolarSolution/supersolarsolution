import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { AssetTable } from '@/components/dashboard/AssetTable';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useInvestments } from '@/hooks/useInvestments';
import { useTransactions } from '@/hooks/useTransactions';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { PieChart, TrendingUp, Wallet, Sun, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { KPIMetric } from '@/types';

export default function InvestorDashboard() {
  const { profile } = useAuth();
  const { data: investments, isLoading: investmentsLoading } = useInvestments();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: allAssets, isLoading: assetsLoading } = useSolarAssets();

  const isLoading = investmentsLoading || transactionsLoading || assetsLoading;

  // Calculate KPIs from real data
  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  const expectedReturns = investments?.reduce((sum, inv) => sum + Number(inv.expected_returns), 0) || 0;
  const actualReturns = investments?.reduce((sum, inv) => sum + Number(inv.actual_returns), 0) || 0;
  const activeAssets = investments?.filter(inv => inv.status === 'deployed').length || 0;

  const kpis: KPIMetric[] = [
    { label: 'Total Invested', value: `₹${(totalInvested / 100000).toFixed(1)}L`, trend: 'up', change: 12.5 },
    { label: 'Expected Returns', value: `₹${(expectedReturns / 100000).toFixed(1)}L`, trend: 'up', change: 8.2 },
    { label: 'Actual Returns', value: `₹${(actualReturns / 100000).toFixed(1)}L`, trend: 'up', change: 5.1 },
    { label: 'Active Assets', value: activeAssets.toString(), trend: 'stable' },
  ];

  const icons = [Wallet, TrendingUp, TrendingUp, Sun];

  // Create investment distribution for pie chart
  const investmentDistribution = investments?.map(inv => ({
    name: inv.solar_assets?.name || 'Unknown Asset',
    value: Number(inv.amount),
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
  })) || [];

  // Get invested asset IDs
  const investedAssetIds = new Set(investments?.map(inv => inv.asset_id) || []);
  const investedAssets = allAssets?.filter(asset => investedAssetIds.has(asset.id)) || [];

  // Map assets for table
  const mappedAssets = investedAssets.map(asset => ({
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

  // Map transactions for list
  const mappedTransactions = transactions?.map(tx => ({
    id: tx.id,
    type: tx.type,
    amount: Number(tx.amount),
    fromEntity: tx.from_entity,
    toEntity: tx.to_entity,
    timestamp: new Date(tx.created_at),
    status: tx.status,
    reference: tx.reference,
  })) || [];

  if (isLoading) {
    return (
      <DashboardLayout role="investor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Investor Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name || 'Investor'}</p>
          </div>
          <Button asChild>
            <Link to="/calculator">
              Explore New Assets <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((metric, idx) => (
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
                {investmentDistribution.length > 0 ? (
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
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`₹${(value/100000).toFixed(1)}L`, 'Amount']} />
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No investments yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <TransactionList 
              transactions={mappedTransactions.slice(0, 10)} 
              title="Recent Transactions"
            />
          </div>
        </div>

        {/* Active Investments */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">My Solar Assets</h2>
          {mappedAssets.length > 0 ? (
            <AssetTable assets={mappedAssets} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No investments yet. Explore available assets to start investing.
              </CardContent>
            </Card>
          )}
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
                <p className="text-xl font-bold">₹{(actualReturns / 100000).toFixed(2)}L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">TDS Deducted (10%)</p>
                <p className="text-xl font-bold">₹{(actualReturns * 0.1 / 100000).toFixed(2)}L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Credit</p>
                <p className="text-xl font-bold text-green-600">₹{(actualReturns * 0.9 / 100000).toFixed(2)}L</p>
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
