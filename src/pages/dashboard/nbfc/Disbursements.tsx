import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNBFCFunding } from '@/hooks/useNBFCFunding';
import { Loader2 } from 'lucide-react';

export default function Disbursements() {
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

    return (
        <DashboardLayout role="nbfc">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Disbursements</h1>
                    <p className="text-muted-foreground">Track disbursement status across all projects</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Disbursement Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {funding && funding.length > 0 ? (
                            <div className="space-y-4">
                                {funding.map((f) => (
                                    <div key={f.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full ${f.status === 'fully_disbursed' ? 'bg-green-500' :
                                                f.status === 'partially_disbursed' ? 'bg-primary' : 'bg-muted'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {f.solar_assets?.name || f.projects?.project_name || 'Unknown Project'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Disbursed: ₹{(Number(f.disbursed_amount) / 10000000).toFixed(2)} Cr / ₹{(Number(f.sanctioned_amount) / 10000000).toFixed(2)} Cr
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={
                                            f.status === 'fully_disbursed' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' :
                                                f.status === 'partially_disbursed' ? 'bg-primary/10 text-primary' : ''
                                        }>
                                            {f.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                No funding records yet
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
