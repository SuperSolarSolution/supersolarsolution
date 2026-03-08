import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInvestments } from '@/hooks/useInvestments';
import { PieChart, TrendingUp, Calendar, ArrowUpRight, Loader2, Filter } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function InvestorInvestments() {
  const { data: investments, isLoading } = useInvestments();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInvestments = investments?.filter(inv =>
    statusFilter === 'all' ? true : inv.status === statusFilter
  ) || [];

  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  const totalExpected = investments?.reduce((sum, inv) => sum + Number(inv.expected_returns), 0) || 0;
  const totalActual = investments?.reduce((sum, inv) => sum + Number(inv.actual_returns), 0) || 0;

  const statusColors: Record<string, string> = {
    committed: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    deployed: 'bg-green-500/10 text-green-600 border-green-500/20',
    returned: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  };

  if (isLoading) {
    return (
      <DashboardLayout role="investor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="investor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">My Investments</h1>
            <p className="text-sm text-muted-foreground">Track and manage your solar investments</p>
          </div>
          <Button asChild size="sm">
            <Link to="/dashboard/investor/assets">
              <ArrowUpRight className="mr-1 md:mr-2 h-4 w-4" />
              <span className="hidden md:inline">New Investment</span>
              <span className="md:hidden">Invest</span>
            </Link>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">₹{(totalInvested / 100000).toFixed(2)}L</p>
              <p className="text-xs text-muted-foreground mt-1">Across {investments?.length || 0} investments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expected Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">₹{(totalExpected / 100000).toFixed(2)}L</p>
              <p className="text-xs text-green-600 mt-1">+{((totalExpected / totalInvested - 1) * 100 || 0).toFixed(1)}% projected</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Actual Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">₹{(totalActual / 100000).toFixed(2)}L</p>
              <p className="text-xs text-muted-foreground mt-1">Credited to wallet</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="committed">Committed</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Investment List */}
        <div className="space-y-4">
          {filteredInvestments.length > 0 ? (
            filteredInvestments.map((investment) => {
              const progress = (Number(investment.actual_returns) / Number(investment.expected_returns)) * 100;
              return (
                <Card key={investment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {investment.solar_assets?.name || 'Solar Asset'}
                          </h3>
                          <Badge variant="outline" className={statusColors[investment.status]}>
                            {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {investment.solar_assets?.location || 'Location not specified'}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Investment Amount</p>
                            <p className="font-semibold">₹{(Number(investment.amount) / 100000).toFixed(2)}L</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Expected Returns</p>
                            <p className="font-semibold text-primary">₹{(Number(investment.expected_returns) / 100000).toFixed(2)}L</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Actual Returns</p>
                            <p className="font-semibold text-green-600">₹{(Number(investment.actual_returns) / 100000).toFixed(2)}L</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Maturity Date</p>
                            <p className="font-semibold">{new Date(investment.maturity_date).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Returns Progress</span>
                            <span className="font-medium">{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No investments yet</h3>
                <p className="text-muted-foreground mb-4">Start investing in solar assets to see your portfolio here</p>
                <Button>Explore Solar Assets</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}