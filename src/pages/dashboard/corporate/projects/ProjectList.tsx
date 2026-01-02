import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

export default function ProjectList() {
    const navigate = useNavigate();

    const { data: projects, isLoading } = useQuery({
        queryKey: ['corporate-projects'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    return (
        <DashboardLayout role="corporate">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Projects</h1>
                        <p className="text-muted-foreground">Manage your solar projects</p>
                    </div>
                    <Button onClick={() => navigate('/dashboard/corporate/projects/new')}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">Loading projects...</div>
                        ) : projects?.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No projects found. Start by creating a new one.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {projects?.map((project) => (
                                    <div
                                        key={project.project_id}
                                        className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                    >
                                        <div>
                                            <h3 className="font-medium">{project.project_name}</h3>
                                            <p className="text-sm text-muted-foreground">{project.location}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{project.estimated_capacity_kw} kW</p>
                                                <p className="text-xs text-muted-foreground">Capacity</p>
                                            </div>
                                            <Badge variant={
                                                project.status === 'Approved' ? 'default' :
                                                    project.status === 'Live' ? 'secondary' :
                                                        'outline'
                                            }>
                                                {project.status}
                                            </Badge>
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
