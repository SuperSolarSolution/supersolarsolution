import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Contracts() {
    const { data: projects, isLoading } = useQuery({
        queryKey: ['corporate-contracts'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .not('lease_start_date', 'is', null); // Only show projects with active contracts

            if (error) throw error;
            return data;
        },
    });

    return (
        <DashboardLayout role="corporate">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Contracts</h1>
                    <p className="text-muted-foreground">Legal agreements and documents</p>
                </div>

                {isLoading ? (
                    <div>Loading contracts...</div>
                ) : projects?.length === 0 ? (
                    <div className="text-muted-foreground max-w-lg">
                        No active contracts found. Contracts appear here once projects are approved and agreements are signed.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {projects?.map((project) => (
                            <div key={project.project_id} className="contents">
                                {/* Lease Agreement Card */}
                                {project.lease_start_date && (
                                    <Card>
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <FileText className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Land Lease Agreement</CardTitle>
                                                <p className="text-sm text-muted-foreground">{project.project_name}</p>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground block">Start Date</span>
                                                    <span className="font-medium">{project.lease_start_date}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">End Date</span>
                                                    <span className="font-medium">{project.lease_end_date}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">Status</span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">Duration</span>
                                                    <span className="font-medium">{project.lease_duration_years} Years</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* PPA Card */}
                                {project.ppa_start_date && (
                                    <Card>
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <FileText className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Power Purchase Agreement</CardTitle>
                                                <p className="text-sm text-muted-foreground">{project.project_name}</p>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground block">Start Date</span>
                                                    <span className="font-medium">{project.ppa_start_date}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">End Date</span>
                                                    <span className="font-medium">{project.ppa_end_date}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">Tariff</span>
                                                    <span className="font-medium">₹{project.ppa_rate}/Unit</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">Renewal</span>
                                                    <span className="font-medium">Auto-renew</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
