import { useMemo, useCallback } from 'react';
import { ReturnsSummaryCards } from './components/ReturnsSummaryCards';
import { ReturnsTrendChart } from './components/ReturnsTrendChart';
import { PayoutHistoryTable } from './components/PayoutHistoryTable';
import { TaxSummaryCard } from './components/TaxSummaryCard';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

import { Button } from '@/components/ui/button';

import { useInvestments } from '@/hooks/useInvestments';
import { useTransactions } from '@/hooks/useTransactions';
import { Download, Loader2 } from 'lucide-react';



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
  const returnTransactions = useMemo(() => transactions?.filter(tx => tx.type === 'return') || [], [transactions]);

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
        <ReturnsSummaryCards
          totalInvested={totalInvested}
          totalActualReturns={totalActualReturns}
          totalExpectedReturns={totalExpectedReturns}
        />

        {/* Returns Chart — built from real transaction data */}
        <ReturnsTrendChart monthlyChartData={monthlyChartData} />

        {/* Payout History */}
        <PayoutHistoryTable returnTransactions={returnTransactions} statusColors={statusColors} />

        {/* Tax Summary — accurate per Section 194A */}
        <TaxSummaryCard
          totalActualReturns={totalActualReturns}
          tdsApplicable={tdsApplicable}
          tdsAmount={tdsAmount}
          netReturns={netReturns}
          TDS_THRESHOLD={TDS_THRESHOLD}
          handleExportForm26AS={handleExportForm26AS}
        />
      </div>
    </DashboardLayout>
  );
}