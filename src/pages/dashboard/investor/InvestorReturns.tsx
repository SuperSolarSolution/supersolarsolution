import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInvestments } from '@/hooks/useInvestments';
import { useTransactions } from '@/hooks/useTransactions';
import { TrendingUp, Wallet, Download, Calendar, ArrowDownRight, ArrowUpRight, Loader2, IndianRupee } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useMemo } from 'react';

export default function InvestorReturns() {
  const { data: investments, isLoading: investmentsLoading } = useInvestments();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();

  const isLoading = investmentsLoading || transactionsLoading;

  const { totalActualReturns, totalExpectedReturns, totalInvested } = useMemo(() => {
    return investments?.reduce(
      (acc, inv) => {
        acc.totalActualReturns += Number(inv.actual_returns);
        acc.totalExpectedReturns += Number(inv.expected_returns);
        acc.totalInvested += Number(inv.amount);
        return acc;
      },
      { totalActualReturns: 0, totalExpectedReturns: 0, totalInvested: 0 }
    ) || { totalActualReturns: 0, totalExpectedReturns: 0, totalInvested: 0 };
  }, [investments]);

  // Filter return transactions
  const returnTransactions = transactions?.filter(tx => tx.type === 'return') || [];

  // Calculate monthly returns (mock data for chart)
  const monthlyData = [
    { month: 'Jul', returns: 12500, projected: 15000 },
    { month: 'Aug', returns: 14200, projected: 15000 },
    { month: 'Sep', returns: 13800, projected: 15000 },
    { month: 'Oct', returns: 16100, projected: 15000 },
    { month: 'Nov', returns: 15400, projected: 15000 },
    { month: 'Dec', returns: 17200, projected: 15000 },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600',
    completed: 'bg-green-500/10 text-green-600',
    failed: 'bg-red-500/10 text-red-600',
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
            <h1 className="text-2xl font-bold">Returns & Payouts</h1>
            <p className="text-muted-foreground">Track your earnings and payout history</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Statement
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold">₹{(totalInvested / 100000).toFixed(2)}L</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actual Returns</p>
                  <p className="text-2xl font-bold text-green-600">₹{(totalActualReturns / 100000).toFixed(2)}L</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expected Returns</p>
                  <p className="text-2xl font-bold text-primary">₹{(totalExpectedReturns / 100000).toFixed(2)}L</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ROI Achieved</p>
                  <p className="text-2xl font-bold">
                    {totalInvested > 0 ? ((totalActualReturns / totalInvested) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Returns Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Returns Trend</CardTitle>
            <CardDescription>Monthly returns vs projected returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `₹${value/1000}K`} />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="returns" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorReturns)" 
                    name="Actual Returns"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projected" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5" 
                    name="Projected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>All your return payouts</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnTransactions.length > 0 ? (
                      returnTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{tx.reference}</TableCell>
                          <TableCell>{tx.from_entity}</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            +₹{Number(tx.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[tx.status]}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No payout transactions yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="completed" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnTransactions.filter(tx => tx.status === 'completed').map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{tx.reference}</TableCell>
                        <TableCell>{tx.from_entity}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          +₹{Number(tx.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[tx.status]}>
                            Completed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="pending" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnTransactions.filter(tx => tx.status === 'pending').map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{tx.reference}</TableCell>
                        <TableCell>{tx.from_entity}</TableCell>
                        <TableCell className="font-semibold text-yellow-600">
                          +₹{Number(tx.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[tx.status]}>
                            Pending
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tax Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Summary (FY 2024-25)</CardTitle>
            <CardDescription>Summary of TDS deducted on your returns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Gross Returns</p>
                <p className="text-xl font-bold mt-1">₹{(totalActualReturns / 100000).toFixed(2)}L</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">TDS Deducted (10%)</p>
                <p className="text-xl font-bold mt-1 text-red-600">₹{(totalActualReturns * 0.1 / 100000).toFixed(2)}L</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Net Returns</p>
                <p className="text-xl font-bold mt-1 text-green-600">₹{(totalActualReturns * 0.9 / 100000).toFixed(2)}L</p>
              </div>
              <div className="flex items-center justify-center">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Form 26AS
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}