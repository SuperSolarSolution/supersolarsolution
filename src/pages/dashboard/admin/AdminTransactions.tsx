import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { useTransactions } from '@/hooks/useTransactions';
import { Loader2 } from 'lucide-react';

export default function AdminTransactions() {
    const { data: transactions, isLoading } = useTransactions();

    const mappedTransactions = transactions?.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount),
        fromEntity: tx.from_entity,
        toEntity: tx.to_entity,
        timestamp: new Date(tx.created_at),
        status: tx.status,
        reference: tx.reference,
    })) || [];

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Transactions</h1>
                    <p className="text-muted-foreground">Monitor platform financial activities</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <TransactionList transactions={mappedTransactions} title="All Transactions" />
                )}
            </div>
        </DashboardLayout>
    );
}
