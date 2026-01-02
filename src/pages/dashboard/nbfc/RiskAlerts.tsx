import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNBFCFunding } from '@/hooks/useNBFCFunding';
import { useSolarAssets } from '@/hooks/useSolarAssets';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function RiskAlerts() {
    const { data: funding, isLoading: fundingLoading } = useNBFCFunding();
    const { data: allAssets, isLoading: assetsLoading } = useSolarAssets();

    if (fundingLoading || assetsLoading) {
        return (
            <DashboardLayout role="nbfc">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    const fundedAssetIds = new Set(funding?.map(f => f.asset_id).filter(id => id !== null) || []);
    const fundedAssets = allAssets?.filter(asset => fundedAssetIds.has(asset.id)) || [];

    const riskAlerts = fundedAssets
        ?.filter(asset => asset.status === 'maintenance')
        .map(asset => ({
            asset: asset.name,
            alert: 'Asset is under maintenance',
            severity: 'low' as const,
        })) || [];

    return (
        <DashboardLayout role="nbfc">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Risk Alerts</h1>
                    <p className="text-muted-foreground">Monitor potential risks and performance issues</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            Active Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {riskAlerts.length === 0 ? (
                            <div className="flex items-center gap-2 text-green-600 py-4">
                                <CheckCircle className="h-5 w-5" />
                                <span>No active risk alerts. Portfolio is healthy.</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {riskAlerts.map((alert, idx) => (
                                    <div key={idx} className="flex items-start gap-3 rounded-lg border border-border p-3">
                                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.severity === 'low' ? 'text-yellow-600' :
                                            alert.severity === 'info' ? 'text-blue-600' : 'text-red-600'
                                            }`} />
                                        <div>
                                            <p className="text-sm font-medium">{alert.asset}</p>
                                            <p className="text-sm text-muted-foreground">{alert.alert}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
