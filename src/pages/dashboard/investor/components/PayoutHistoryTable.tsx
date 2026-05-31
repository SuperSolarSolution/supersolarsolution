// @ts-nocheck
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Database } from '@/types/supabase';

type Transaction = Database['public']['Tables']['transactions']['Row'];

interface PayoutHistoryTableProps {
  returnTransactions: Transaction[];
  statusColors: Record<string, string>;
}

export function PayoutHistoryTable({ returnTransactions, statusColors }: PayoutHistoryTableProps) {
  return (
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
  );
}