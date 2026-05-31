import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function ImplementerSettings() {
  const { profile } = useAuth();
  return (
    <DashboardLayout role="implementer">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your team profile and notifications</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg">Company Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Company / Team Name</Label><Input defaultValue={profile?.full_name || ''} /></div>
            <div className="space-y-2"><Label>Contact Email</Label><Input defaultValue={profile?.email || ''} disabled /></div>
            <div className="space-y-2"><Label>Phone</Label><Input defaultValue={profile?.phone || ''} /></div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
