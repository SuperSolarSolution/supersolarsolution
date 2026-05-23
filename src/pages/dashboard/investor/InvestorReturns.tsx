import { useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useInvestments } from '@/hooks/useInvestments';
import { useTransactions } from '@/hooks/useTransactions';
import { TrendingUp, Wallet, Download, Calendar, ArrowUpRight, Loader2, IndianRupee, FileText, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { format, parseISO, startOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// TDS threshold as per Section 194A (interest income): ₹40,000 per year
const TDS_THRESHOLD = 40000;
const TDS_RATE = 0.10;

export default function InvestorReturns() {
  const { data: investments, isLoading: investmentsLoading } = useInvestments();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { toast } = useToast();

  const isLoading = investmentsLoading || transactionsLoading;

  const { totalActualReturns, totalExpectedReturns, totalInvested } = useMemo(() => {
    if (!investments) return { totalActualReturns: 0, totalExpectedReturns: 0, totalInvested: 0 };

    let actual = 0;
    let expected = 0;
    let invested = 0;

    for (const inv of investments) {
      actual += Number(inv.actual_returns) || 0;
      expected += Number(inv.expected_returns) || 0;
      invested += Number(inv.amount) || 0;
    }

    return {
      totalActualReturns: actual,
      totalExpectedReturns: expected,
      totalInvested: invested
    };
  }, [investments]);

  // Filter return transactions
  const returnTransactions = transactions?.filter(tx => tx.type === 'return') || [];

  // Build real monthly returns chart data from actual transactions
  const monthlyChartData = useMemo(() => {
    if (!transactions || !investments) return [];

    // Aggregate actual returns by month from transaction history
    const actualByMonth: Record<string, number> = {};
    transactions
      .filter(tx => tx.type === 'return' && tx.status === 'completed')
      .forEach(tx => {
        const monthKey = format(parseISO(tx.created_at), 'MMM yyyy');
        actualByMonth[monthKey] = (actualByMonth[monthKey] || 0) + Number(tx.amount);
      });

    // Calculate projected monthly returns from investments
    // Sum of (amount × expected_irr%) / 12 for all active investments
    const monthlyProjected = investments
      .filter(inv => inv.status === 'deployed' || inv.status === 'committed')
      .reduce((sum, inv) => {
        const irr = Number(inv.solar_assets?.expected_irr || 0) / 100;
        return sum + (Number(inv.amount) * irr) / 12;
      }, 0);

    // Build sorted list of months that have data
    const months = Object.keys(actualByMonth).sort((a, b) =>
      new Date(a).getTime() - new Date(b).getTime()
    );

    // If no real data yet, show last 6 months with projected only
    if (months.length === 0) {
      const result = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        result.push({
          month: format(startOfMonth(d), 'MMM yy'),
          'Actual Returns': 0,
          'Projected': Math.round(monthlyProjected),
        });
      }
      return result;
    }

    return months.map(m => ({
      month: format(new Date(m), 'MMM yy'),
      'Actual Returns': Math.round(actualByMonth[m]),
      'Projected': Math.round(monthlyProjected),
    }));
  }, [transactions, investments]);

  // TDS calculation — Section 194A: 10% TDS only if annual return > ₹40,000
  const tdsApplicable = totalActualReturns > TDS_THRESHOLD;
  const tdsAmount = tdsApplicable ? Math.round(totalActualReturns * TDS_RATE) : 0;
  const netReturns = totalActualReturns - tdsAmount;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600',
    completed: 'bg-green-500/10 text-green-600',
    failed: 'bg-red-500/10 text-red-600',
  };

  // Export CSV of return transactions
  const handleExportStatement = useCallback(() => {
    if (!returnTransactions.length) {
      toast({ title: 'No Data', description: 'No return transactions to export yet.', variant: 'destructive' });
      return;
    }
    const headers = ['Date', 'Reference', 'From', 'Amount (₹)', 'Status'];
    const rows = returnTransactions.map(tx => [
      format(parseISO(tx.created_at), 'dd/MM/yyyy'),
      tx.reference,
      tx.from_entity,
      Number(tx.amount).toFixed(2),
      tx.status,
    ]);
    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${v}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `returns_statement_${format(new Date(), 'dd-MM-yyyy')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Statement Exported', description: 'Your returns statement has been downloaded as CSV.' });
  }, [returnTransactions, toast]);

  // Export Form 26AS summary CSV
  const handleExportForm26AS = useCallback(() => {
    if (!tdsApplicable) {
      toast({
        title: 'TDS Not Applicable',
        description: `Your returns (₹${totalActualReturns.toLocaleString('en-IN')}) are below the ₹40,000 TDS threshold. No Form 26AS data available.`,
        variant: 'destructive',
      });
      return;
    }
    const headers = ['Section', 'Deductor', 'PAN of Deductor', 'Gross Amount (₹)', 'TDS Rate', 'TDS Deducted (₹)', 'Net Amount (₹)'];
    const rows = [[
      '194A',
      'Super Solar Solutions Pvt Ltd',
      'XXXXXXXXXX',
      totalActualReturns.toFixed(2),
      '10%',
      tdsAmount.toFixed(2),
      netReturns.toFixed(2),
    ]];
    const csvContent = [headers, ...rows]
      .map(row => row.map(v => `"${v}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form26AS_summary_FY${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(2)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Form 26AS Summary Exported', description: 'Summary CSV downloaded successfully.' });
  }, [totalActualReturns, tdsAmount, netReturns, tdsApplicable, toast]);

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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Returns &amp; Payouts</h1>
            <p className="text-muted-foreground">Track your earnings and payout history</p>
          </div>
          <Button variant="outline" onClick={handleExportStatement}>
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
                    {totalInvested > 0 ? ((totalActualReturns / totalInvested) * 100).toFixed(1) : '0.0'}%
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ArrowUpRight className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Returns Chart — built from real transaction data */}
        <Card>
          <CardHeader>
            <CardTitle>Returns Trend</CardTitle>
            <CardDescription>
              Monthly actual returns vs projected — based on your real transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChartData}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <Tooltip
                      formatter={(value: number, name: string) => [`₹${value.toLocaleString('en-IN')}`, name]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Actual Returns"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorActual)"
                    />
                    <Line
                      type="monotone"
                      dataKey="Projected"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No return transactions yet. Chart will populate as returns are credited.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>All your return payouts from solar assets</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
              {(['all', 'completed', 'pending'] as const).map(tab => {
                const filtered = tab === 'all'
                  ? returnTransactions
                  : returnTransactions.filter(tx => tx.status === tab);
                return (
                  <TabsContent key={tab} value={tab} className="mt-4">
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
                        {filtered.length > 0 ? (
                          filtered.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell className="font-medium">
                                {format(parseISO(tx.created_at), 'dd MMM yyyy')}
                              </TableCell>
                              <TableCell className="font-mono text-sm">{tx.reference}</TableCell>
                              <TableCell>{tx.from_entity}</TableCell>
                              <TableCell className="font-semibold text-green-600">
                                +₹{Number(tx.amount).toLocaleString('en-IN')}
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
                              No {tab !== 'all' ? tab : ''} payout transactions yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Tax Summary — accurate per Section 194A */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Tax Summary (FY {new Date().getFullYear()}-{(new Date().getFullYear() + 1).toString().slice(2)})</CardTitle>
                <CardDescription>TDS deducted on returns as per Section 194A</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportForm26AS}>
                <FileText className="mr-2 h-4 w-4" />
                Download Form 26AS
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* TDS Threshold Notice */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-700 mb-6">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong>Section 194A (TDS on Interest Income):</strong> TDS at 10% is applicable only when annual returns exceed ₹40,000.
                {!tdsApplicable && (
                  <span className="block mt-1 text-green-700 font-medium">
                    ✓ Your current returns are below the ₹40,000 threshold — No TDS applicable.
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Gross Returns</p>
                <p className="text-xl font-bold mt-1">₹{totalActualReturns.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">TDS Threshold (194A)</p>
                <p className="text-xl font-bold mt-1">₹{TDS_THRESHOLD.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  TDS Deducted ({tdsApplicable ? '10%' : 'N/A'})
                </p>
                <p className={`text-xl font-bold mt-1 ${tdsApplicable ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {tdsApplicable ? `₹${tdsAmount.toLocaleString('en-IN')}` : '₹0'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Net Returns</p>
                <p className="text-xl font-bold mt-1 text-green-600">
                  ₹{netReturns.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              * Consult your tax advisor for accurate tax filing. TDS certificate (Form 16A) will be issued by the platform at year-end.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}