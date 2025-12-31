import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sun, 
  TrendingUp, 
  Shield, 
  Building2, 
  Users, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Leaf,
  IndianRupee
} from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Structured Returns',
    description: 'Earn competitive IRR through structured solar lease and PPA models',
  },
  {
    icon: Shield,
    title: 'Regulator Ready',
    description: 'Full compliance with NBFC guidelines and audit-ready infrastructure',
  },
  {
    icon: Building2,
    title: 'Asset-Backed Security',
    description: 'Every investment is tied to tangible solar infrastructure assets',
  },
  {
    icon: Users,
    title: 'Multi-Party Ecosystem',
    description: 'Connect investors, corporates, NBFCs, and implementers seamlessly',
  },
];

const stats = [
  { value: '₹120 Cr+', label: 'Assets Under Management' },
  { value: '24+', label: 'Solar Projects' },
  { value: '15%', label: 'Avg. IRR' },
  { value: '1200+', label: 'Active Investors' },
];

const roles = [
  {
    title: 'Investors',
    description: 'Fund solar assets and earn structured returns with full transparency',
    icon: IndianRupee,
    path: '/dashboard/investor',
    color: 'bg-primary/10 text-primary',
  },
  {
    title: 'Corporates',
    description: 'Reduce energy costs and achieve sustainability goals',
    icon: Building2,
    path: '/dashboard/corporate',
    color: 'bg-green-100 text-green-700',
  },
  {
    title: 'NBFCs',
    description: 'Deploy capital into verified solar infrastructure projects',
    icon: BarChart3,
    path: '/dashboard/nbfc',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Implementers',
    description: 'Build and maintain solar assets with project management tools',
    icon: Sun,
    path: '/dashboard/implementer',
    color: 'bg-orange-100 text-orange-700',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sun className="h-4 w-4" />
              India's Solar Asset Financing Platform
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              S<sup className="text-2xl md:text-3xl">3</sup> – Super Solar Solutions
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              A secure, auditable platform connecting P2P investors, NBFCs, corporates, and implementers 
              for structured solar asset financing and leasing.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link to="/calculator">
                  Calculate Your ROI
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for Financial Infrastructure</h2>
            <p className="text-muted-foreground">
              Enterprise-grade security, complete auditability, and deterministic financial calculations
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="relative overflow-hidden">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Portal</h2>
            <p className="text-muted-foreground">
              Role-based access with dedicated dashboards for each stakeholder
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Link key={role.title} to={role.path}>
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className={`mb-4 inline-flex rounded-lg p-3 ${role.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">{role.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                      <span className="inline-flex items-center text-sm font-medium text-primary">
                        Access Portal <ArrowRight className="ml-1 h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link to="/dashboard/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
              <Shield className="mr-2 h-4 w-4" />
              Admin Console
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How S³ Works</h2>
            <p className="text-muted-foreground">
              A transparent, traceable flow from investment to returns
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-2">Fund Solar Assets</h3>
                <p className="text-sm text-muted-foreground">
                  Investors and NBFCs commit capital to verified solar projects with clear terms
                </p>
              </div>
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-2">Generate Power</h3>
                <p className="text-sm text-muted-foreground">
                  Implementers install and maintain assets, corporates consume clean energy
                </p>
              </div>
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-2">Earn Returns</h3>
                <p className="text-sm text-muted-foreground">
                  Returns flow back through structured lease or PPA payments, fully audited
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Leaf className="mx-auto mb-4 h-12 w-12 text-primary-foreground opacity-80" />
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
              Ready to Invest in Solar Infrastructure?
            </h2>
            <p className="mb-8 text-primary-foreground/80">
              Start with our ROI calculator to see projected returns before committing any capital.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/calculator">
                  Try ROI Calculator
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sun className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">S³ – Super Solar Solutions</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 S³ Solar. All rights reserved. Regulated financial infrastructure.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
