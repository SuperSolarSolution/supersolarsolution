import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FundingChart } from '@/components/charts/FundingChart';
import { useNBFCFunding } from '@/hooks/useNBFCFunding';
import { Loader2 } from 'lucide-react';

export default function FundAllocation() {
    const { data: funding, isLoading } = useNBFCFunding();

    if (isLoading) {
        return (
            <DashboardLayout role="nbfc">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    const fundAllocationData = funding?.map((f, index) => ({
        name: f.solar_assets?.name || f.projects?.project_name || 'Pending Details',
        value: Number(f.sanctioned_amount),
        color: `hsl(${index * 60}, 70%, 50%)`,
    })) || [];

    return (
        <DashboardLayout role="nbfc">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Fund Allocation</h1>
                    <p className="text-muted-foreground">Visual breakdown of your sanctioned funds</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {fundAllocationData.length > 0 ? (
                        <FundingChart data={fundAllocationData} title="Fund Allocation by Project/Asset" />
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>Fund Allocation</CardTitle>
                            </CardHeader>
                            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                                No funding data available.
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
