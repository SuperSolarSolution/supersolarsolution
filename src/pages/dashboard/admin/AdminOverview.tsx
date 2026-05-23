import { useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { useAllProfilesWithRoles } from '@/hooks/useProfiles';
import {
    LayoutDashboard,
    Users,
    Sun,
    Shield,
    Clock,
    FileText,
    Settings,
    ArrowRight
} from 'lucide-react';
import { KPIMetric } from '@/types';
import { useNavigate } from 'react-router-dom';

export default function AdminOverview() {
    const navigate = useNavigate();
    const { data: allAssets } = useSolarAssets();
    const { data: profiles } = useAllProfilesWithRoles();

    // Calculate KPIs and derived data efficiently
    const { totalAssets, totalUsers, pendingKYC, totalAumSum, pendingApprovals } = useMemo(() => {
        let totalAssets = 0;
        let totalAumSum = 0;
        if (allAssets) {
            totalAssets = allAssets.length;
            for (let i = 0; i < totalAssets; i++) {
                totalAumSum += Number(allAssets[i].total_investment);
            }
        }

        let totalUsers = 0;
        let pendingKYC = 0;
        const pendingApprovals = [];
        if (profiles) {
            totalUsers = profiles.length;
            for (let i = 0; i < totalUsers; i++) {
                const p = profiles[i];
                if (p.kyc_status === 'pending') {
                    pendingKYC++;
                    if (pendingApprovals.length < 5) {
                        pendingApprovals.push({
                            id: p.id,
                            name: p.full_name,
                            role: p.role || 'unknown',
                            kycStatus: p.kyc_status,
                            date: new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                        });
                    }
                }
            }
        }

        return { totalAssets, totalUsers, pendingKYC, totalAumSum, pendingApprovals };
    }, [allAssets, profiles]);

    const kpis: KPIMetric[] = [
        { label: 'Total AUM', value: `₹${(totalAumSum / 10000000).toFixed(1)} Cr`, trend: 'up', change: 15.2 },
        { label: 'Total Users', value: totalUsers.toString(), trend: 'up', change: 8.5 },
        { label: 'Solar Assets', value: totalAssets.toString(), trend: 'up', change: 3 },
        { label: 'Platform Health', value: '99.9%', trend: 'stable' },
    ];

    const icons = [LayoutDashboard, Users, Sun, Shield];

    // Compliance items
    const complianceItems = [
        { item: 'RBI Reporting', status: 'compliant', lastUpdated: 'Today' },
        { item: 'Investor KYC', status: pendingKYC > 0 ? 'review_needed' : 'compliant', lastUpdated: 'Today' },
        { item: 'Asset Documentation', status: 'compliant', lastUpdated: 'Yesterday' },
        { item: 'Financial Audit', status: 'compliant', lastUpdated: 'Last week' },
    ];

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Admin Overview</h1>
                        <p className="text-muted-foreground">Platform Management & Oversight</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/admin/reports')}>
                            <FileText className="mr-2 h-4 w-4" />
                            Reports
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/admin/settings')}>
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
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Pending Approvals Widget */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-5 w-5 text-primary" />
                                Pending Approvals
                                <Badge variant="outline" className="ml-auto">{pendingKYC}</Badge>
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
                                        </div>
                                    ))}
                                    <Button variant="ghost" className="w-full text-primary" onClick={() => navigate('/dashboard/admin/users')}>
                                        Manage all approvals <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center text-muted-foreground py-4">
                                    No pending approvals
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Compliance Status Widget */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="h-5 w-5 text-green-600" />
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
                            <Button variant="ghost" className="w-full text-primary" onClick={() => navigate('/dashboard/admin/compliance')}>
                                View Compliance Details <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
