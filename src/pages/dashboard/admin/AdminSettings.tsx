import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function AdminSettings() {
    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Platform Settings</h1>
                    <p className="text-muted-foreground">Configure global platform parameters</p>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="platform-name">Platform Name</Label>
                                <Input id="platform-name" defaultValue="SuperSolarSolution" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="support-email">Support Email</Label>
                                <Input id="support-email" defaultValue="support@supersolarsolution.com" />
                            </div>
                            <Button>Save Changes</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="transaction-fee">Base Transaction Fee (%)</Label>
                                <Input id="transaction-fee" type="number" defaultValue="0.5" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="platform-fee">Platform Fee (%)</Label>
                                <Input id="platform-fee" type="number" defaultValue="2.0" />
                            </div>
                            <Button>Update Fees</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
