import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProjects, Project } from '@/hooks/useProjects';
import { Loader2, Zap, MapPin, Calendar, Building2 } from 'lucide-react';
import { InvestModal } from '@/components/dashboard/nbfc/InvestModal';

export default function ProjectDiscovery() {
    const { data: projects, isLoading } = useProjects();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
                    <h1 className="text-2xl font-bold">Project Discovery</h1>
                    <p className="text-muted-foreground">Find and fund high-potential solar projects</p>
                </div>

                {projects && projects.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project) => (
                            <Card key={project.project_id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl">{project.project_name}</CardTitle>
                                            <CardDescription className="flex items-center mt-1">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {project.location}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={project.status === 'Approved' ? 'default' : 'secondary'}>
                                            {project.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Capacity</span>
                                            <span className="font-medium flex items-center">
                                                <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                                                {project.estimated_capacity_kw} kW
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Type</span>
                                            <span className="font-medium capitalize">{project.project_type || 'Solar'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Avg Consumption</span>
                                            <span className="font-medium">{project.avg_power_consumption_kwh ? `${project.avg_power_consumption_kwh} kWh` : 'N/A'}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs uppercase tracking-wider">Posted</span>
                                            <span className="font-medium flex items-center">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" onClick={() => setSelectedProject(project)}>
                                        View Details & Invest
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                            <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-lg font-medium text-muted-foreground">No Projects Available</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-2">
                                There are currently no approved projects looking for funding. Check back later.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <InvestModal
                isOpen={!!selectedProject}
                onClose={() => setSelectedProject(null)}
                project={selectedProject}
            />
        </DashboardLayout>
    );
}
