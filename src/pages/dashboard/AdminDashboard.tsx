import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { AssetTable } from '@/components/dashboard/AssetTable';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminKPIs, mockSolarAssets, mockTransactions } from '@/data/mockData';
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
  AlertTriangle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const pendingApprovals = [
  { id: 'user-001', name: 'Amit Sharma', role: 'investor', kycStatus: 'pending', date: '28 Mar 2024' },
  { id: 'user-002', name: 'Priya Patel', role: 'investor', kycStatus: 'pending', date: '28 Mar 2024' },
  { id: 'user-003', name: 'Green Energy Corp', role: 'corporate', kycStatus: 'pending', date: '27 Mar 2024' },
];

const systemHealth = [
  { name: 'API Gateway', status: 'healthy', uptime: 99.99 },
  { name: 'Database', status: 'healthy', uptime: 99.95 },
  { name: 'Payment Gateway', status: 'healthy', uptime: 99.98 },
  { name: 'Analytics Engine', status: 'healthy', uptime: 99.92 },
];

const complianceItems = [
  { item: 'RBI Reporting', status: 'compliant', lastUpdated: '25 Mar 2024' },
  { item: 'Investor KYC', status: 'compliant', lastUpdated: '28 Mar 2024' },
  { item: 'Asset Documentation', status: 'review_needed', lastUpdated: '20 Mar 2024' },
  { item: 'Financial Audit', status: 'compliant', lastUpdated: '15 Mar 2024' },
];

export default function AdminDashboard() {
  const icons = [LayoutDashboard, Users, Sun, Shield];

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
          {adminKPIs.map((metric, idx) => (
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
              {pendingApprovals.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role} • {user.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:bg-green-50">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                View All Pending ({pendingApprovals.length + 12})
              </Button>
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
              <div className="mt-4 rounded-lg bg-green-50 p-3">
                <p className="text-sm font-medium text-green-700">All Systems Operational</p>
                <p className="text-xs text-green-600">Last checked: 2 minutes ago</p>
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
                    item.status === 'compliant' ? 'bg-green-50 text-green-700' : 
                    'bg-yellow-50 text-yellow-700'
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
          <TransactionList transactions={mockTransactions} title="Platform Transactions" />
          
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
                    <span className="font-medium">892 (71%)</span>
                  </div>
                  <Progress value={71} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Corporates</span>
                    <span className="font-medium">156 (13%)</span>
                  </div>
                  <Progress value={13} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>NBFCs</span>
                    <span className="font-medium">45 (4%)</span>
                  </div>
                  <Progress value={4} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Implementers</span>
                    <span className="font-medium">154 (12%)</span>
                  </div>
                  <Progress value={12} className="h-2" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">+127</p>
                  <p className="text-xs text-muted-foreground">New This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">1,089</p>
                  <p className="text-xs text-muted-foreground">KYC Verified</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">158</p>
                  <p className="text-xs text-muted-foreground">Pending KYC</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Assets */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Platform Solar Assets</h2>
          <AssetTable assets={mockSolarAssets} />
        </div>
      </div>
    </DashboardLayout>
  );
}
