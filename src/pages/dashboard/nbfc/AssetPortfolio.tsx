import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AssetTable } from '@/components/dashboard/AssetTable';
import { Card, CardContent } from '@/components/ui/card';
import { useNBFCFunding } from '@/hooks/useNBFCFunding';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { Loader2 } from 'lucide-react';

export default function AssetPortfolio() {
    const { data: funding, isLoading: fundingLoading } = useNBFCFunding();
    const { data: allAssets, isLoading: assetsLoading } = useSolarAssets();

    const isLoading = fundingLoading || assetsLoading;

    if (isLoading) {
        return (
            <DashboardLayout role="nbfc">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    // Get funded asset IDs
    const fundedAssetIds = new Set(funding?.map(f => f.asset_id).filter(id => id !== null) || []);
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

    return (
        <DashboardLayout role="nbfc">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Asset Portfolio</h1>
                    <p className="text-muted-foreground">Manage and monitor all funded solar assets</p>
                </div>

                {mappedAssets.length > 0 ? (
                    <AssetTable assets={mappedAssets} />
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            No active solar assets in portfolio yet. Investments may still be in project phase.
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}
