import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function NBFCSettings() {
    const { profile } = useAuth();

    return (
        <DashboardLayout role="nbfc">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your profile and account preferences</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Organization Profile</CardTitle>
                        <CardDescription>Update your NBFC organization details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input id="name" defaultValue={profile?.full_name || ''} readOnly />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" defaultValue={profile?.email || ''} readOnly />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="license">NBFC License Number</Label>
                            <Input id="license" defaultValue="NBFC-2024-XXXX" />
                        </div>
                        <Button>Save Changes</Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
