import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Sun } from 'lucide-react';
import { UserRole } from '@/types';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'investor' as UserRole,
    acceptTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: Navigate to login
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container flex items-center justify-center py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Sun className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>Join S³ to start investing in solar infrastructure</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name / Company Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name or company"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">I am registering as</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investor">Individual Investor</SelectItem>
                    <SelectItem value="corporate">Corporate / Land Owner</SelectItem>
                    <SelectItem value="nbfc">NBFC / Institutional Funder</SelectItem>
                    <SelectItem value="implementer">EPC / Implementer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox 
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, acceptTerms: checked === true })
                  }
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                  I agree to the Terms of Service, Privacy Policy, and understand that KYC verification is required before investing.
                </Label>
              </div>
              <Button type="submit" className="w-full" disabled={!formData.acceptTerms}>
                Create Account
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
