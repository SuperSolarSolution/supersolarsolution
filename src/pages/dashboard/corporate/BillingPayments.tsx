import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function BillingPayments() {
    const { data: invoices, isLoading } = useQuery({
        queryKey: ['corporate-invoices'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('invoices')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    const totalPayable = invoices
        ?.filter(i => i.status === 'Pending')
        .reduce((sum, i) => sum + Number(i.amount), 0) || 0;

    const lastPayment = invoices
        ?.filter(i => i.status === 'Paid')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    return (
        <DashboardLayout role="corporate">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Billing & Payments</h1>
                    <p className="text-muted-foreground">Manage your invoices and payments</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payable</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{totalPayable.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {invoices?.filter(i => i.status === 'Pending').length || 0} pending invoices
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Last Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{Number(lastPayment?.amount || 0).toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {lastPayment?.month ? `For ${lastPayment.month}` : 'No payments yet'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">Average Monthly Bill</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₹{invoices && invoices.length > 0
                                    ? Math.round(invoices.reduce((sum, i) => sum + Number(i.amount), 0) / invoices.length).toLocaleString()
                                    : '0'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Based on invoice history</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoice History</CardTitle>
                        <CardDescription>View and download monthly invoices</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">Loading invoices...</div>
                        ) : invoices?.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">No invoices found.</div>
                        ) : (
                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-4 text-left font-medium">Month</th>
                                            <th className="p-4 text-right font-medium">Units</th>
                                            <th className="p-4 text-right font-medium">Rate</th>
                                            <th className="p-4 text-right font-medium">Amount</th>
                                            <th className="p-4 text-center font-medium">Status</th>
                                            <th className="p-4 text-right font-medium">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices?.map((bill) => (
                                            <tr key={bill.invoice_id} className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="p-4 font-medium">{bill.month}</td>
                                                <td className="p-4 text-right">{Number(bill.units_consumed).toLocaleString()}</td>
                                                <td className="p-4 text-right">₹{bill.rate}</td>
                                                <td className="p-4 text-right font-bold">₹{Number(bill.amount).toLocaleString()}</td>
                                                <td className="p-4 text-center">
                                                    <Badge variant={bill.status === 'Paid' ? 'secondary' : 'destructive'}>
                                                        {bill.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Button variant="ghost" size="sm" disabled={!bill.pdf_url}>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
