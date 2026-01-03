import { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  title?: string;
}

const typeConfig: Record<Transaction['type'], { icon: React.ComponentType<any>; label: string; color: string }> = {
  investment: { icon: ArrowUpRight, label: 'Investment', color: 'text-primary' },
  return: { icon: ArrowDownLeft, label: 'Return', color: 'text-green-600' },
  disbursement: { icon: ArrowRight, label: 'Disbursement', color: 'text-blue-600' },
  billing: { icon: ArrowUpRight, label: 'Billing', color: 'text-orange-600' },
  deposit: { icon: ArrowDownLeft, label: 'Deposit', color: 'text-green-600' },
  withdrawal: { icon: ArrowUpRight, label: 'Withdrawal', color: 'text-red-600' },
  referral_bonus: { icon: ArrowDownLeft, label: 'Referral Bonus', color: 'text-purple-600' },
};

const statusColors: Record<Transaction['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function TransactionList({ transactions, title = 'Recent Transactions' }: TransactionListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((txn) => {
          const config = typeConfig[txn.type];
          const Icon = config.icon;
          
          return (
            <div key={txn.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className={cn('rounded-full bg-muted p-2', config.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{config.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {txn.fromEntity} → {txn.toEntity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(txn.timestamp, 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{formatCurrency(txn.amount)}</p>
                <Badge variant="outline" className={cn('text-xs', statusColors[txn.status])}>
                  {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
