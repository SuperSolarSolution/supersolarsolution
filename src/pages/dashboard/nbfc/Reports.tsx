import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

export default function Reports() {
    return (
        <DashboardLayout role="nbfc">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Reports</h1>
                    <p className="text-muted-foreground">Access and download financial and performance reports</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {['Quarterly Performance Report', 'Fund Utilization Summary', 'Risk Assessment Log'].map((report, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    {report}
                                </CardTitle>
                                <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
