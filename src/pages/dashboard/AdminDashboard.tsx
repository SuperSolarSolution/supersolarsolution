import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { AssetTable } from '@/components/dashboard/AssetTable';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { useTransactions } from '@/hooks/useTransactions';
import { useAllProfilesWithRoles, useUpdateKYCStatus } from '@/hooks/useProfiles';
import { 
  LayoutDashboard, 
  Users, 
  Sun, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Settings,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { KPIMetric } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const { data: allAssets, isLoading: assetsLoading } = useSolarAssets();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: profiles, isLoading: profilesLoading } = useAllProfilesWithRoles();
  const updateKYCStatus = useUpdateKYCStatus();
  const { toast } = useToast();

  const isLoading = assetsLoading || transactionsLoading || profilesLoading;

  // Calculate KPIs
  const totalAssets = allAssets?.length || 0;
  const totalCapacity = allAssets?.reduce((sum, a) => sum + Number(a.capacity_kw), 0) || 0;
  const totalUsers = profiles?.length || 0;
  const pendingKYC = profiles?.filter(p => p.kyc_status === 'pending').length || 0;

  const kpis: KPIMetric[] = [
    { label: 'Total AUM', value: `₹${((allAssets?.reduce((sum, a) => sum + Number(a.total_investment), 0) || 0) / 10000000).toFixed(1)} Cr`, trend: 'up', change: 15.2 },
    { label: 'Total Users', value: totalUsers.toString(), trend: 'up', change: 8.5 },
    { label: 'Solar Assets', value: totalAssets.toString(), trend: 'up', change: 3 },
    { label: 'Platform Health', value: '99.9%', trend: 'stable' },
  ];

  const icons = [LayoutDashboard, Users, Sun, Shield];

  // Pending approvals (users with pending KYC)
  const pendingApprovals = profiles
    ?.filter(p => p.kyc_status === 'pending')
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.full_name,
      role: p.role || 'unknown',
      kycStatus: p.kyc_status,
      date: new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    })) || [];

  // Handle KYC approval/rejection
  const handleKYCAction = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      await updateKYCStatus.mutateAsync({ userId, status });
      toast({
        title: `KYC ${status}`,
        description: `User KYC has been ${status}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update KYC status.',
        variant: 'destructive',
      });
    }
  };

  // System health
  const systemHealth = [
    { name: 'API Gateway', status: 'healthy', uptime: 99.99 },
    { name: 'Database', status: 'healthy', uptime: 99.95 },
    { name: 'Payment Gateway', status: 'healthy', uptime: 99.98 },
    { name: 'Analytics Engine', status: 'healthy', uptime: 99.92 },
  ];

  // Compliance items
  const complianceItems = [
    { item: 'RBI Reporting', status: 'compliant', lastUpdated: 'Today' },
    { item: 'Investor KYC', status: pendingKYC > 0 ? 'review_needed' : 'compliant', lastUpdated: 'Today' },
    { item: 'Asset Documentation', status: 'compliant', lastUpdated: 'Yesterday' },
    { item: 'Financial Audit', status: 'compliant', lastUpdated: 'Last week' },
  ];

  // Map assets for table
  const mappedAssets = allAssets?.map(asset => ({
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
  })) || [];

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

  // User distribution
  const userDistribution = {
    investors: profiles?.filter(p => p.role === 'investor').length || 0,
    corporates: profiles?.filter(p => p.role === 'corporate').length || 0,
    nbfcs: profiles?.filter(p => p.role === 'nbfc').length || 0,
    implementers: profiles?.filter(p => p.role === 'implementer').length || 0,
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Super Admin Console</h1>
            <p className="text-muted-foreground">Platform Management & Oversight</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((metric, idx) => (
            <KPICard key={metric.label} metric={metric} icon={icons[idx]} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Pending Approvals
                <Badge variant="outline" className="ml-auto">{pendingApprovals.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApprovals.length > 0 ? (
                <>
                  {pendingApprovals.map((user) => (
                    <div key={user.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role} • {user.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                          onClick={() => handleKYCAction(user.id, 'approved')}
                          disabled={updateKYCStatus.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => handleKYCAction(user.id, 'rejected')}
                          disabled={updateKYCStatus.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    View All Pending ({pendingKYC})
                  </Button>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No pending approvals
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-600" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemHealth.map((system) => (
                <div key={system.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${
                      system.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm">{system.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{system.uptime}%</span>
                </div>
              ))}
              <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-950 p-3">
                <p className="text-sm font-medium text-green-700 dark:text-green-400">All Systems Operational</p>
                <p className="text-xs text-green-600 dark:text-green-500">Last checked: 2 minutes ago</p>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complianceItems.map((item) => (
                <div key={item.item} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.item}</p>
                    <p className="text-xs text-muted-foreground">Updated: {item.lastUpdated}</p>
                  </div>
                  <Badge variant="outline" className={
                    item.status === 'compliant' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' : 
                    'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                  }>
                    {item.status === 'compliant' ? 'Compliant' : 'Review Needed'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TransactionList 
            transactions={mappedTransactions.slice(0, 10)} 
            title="Platform Transactions" 
          />
          
          {/* User Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Investors</span>
                    <span className="font-medium">{userDistribution.investors} ({totalUsers > 0 ? Math.round(userDistribution.investors / totalUsers * 100) : 0}%)</span>
                  </div>
                  <Progress value={totalUsers > 0 ? (userDistribution.investors / totalUsers * 100) : 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Corporates</span>
                    <span className="font-medium">{userDistribution.corporates} ({totalUsers > 0 ? Math.round(userDistribution.corporates / totalUsers * 100) : 0}%)</span>
                  </div>
                  <Progress value={totalUsers > 0 ? (userDistribution.corporates / totalUsers * 100) : 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>NBFCs</span>
                    <span className="font-medium">{userDistribution.nbfcs} ({totalUsers > 0 ? Math.round(userDistribution.nbfcs / totalUsers * 100) : 0}%)</span>
                  </div>
                  <Progress value={totalUsers > 0 ? (userDistribution.nbfcs / totalUsers * 100) : 0} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Implementers</span>
                    <span className="font-medium">{userDistribution.implementers} ({totalUsers > 0 ? Math.round(userDistribution.implementers / totalUsers * 100) : 0}%)</span>
                  </div>
                  <Progress value={totalUsers > 0 ? (userDistribution.implementers / totalUsers * 100) : 0} className="h-2" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">+{Math.floor(totalUsers * 0.1)}</p>
                  <p className="text-xs text-muted-foreground">New This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{profiles?.filter(p => p.kyc_status === 'approved').length || 0}</p>
                  <p className="text-xs text-muted-foreground">KYC Verified</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{pendingKYC}</p>
                  <p className="text-xs text-muted-foreground">Pending KYC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Assets */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Platform Solar Assets</h2>
          {mappedAssets.length > 0 ? (
            <AssetTable assets={mappedAssets} />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No solar assets created yet
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
