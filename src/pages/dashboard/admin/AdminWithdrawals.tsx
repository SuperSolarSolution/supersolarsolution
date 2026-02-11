import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAdminWithdrawals, useUpdateWithdrawalStatus } from '@/hooks/useAdminWithdrawals';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, CheckCircle, XCircle, Clock, Banknote } from 'lucide-react';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  processing: { label: 'Processing', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

export default function AdminWithdrawals() {
  const { data: withdrawals, isLoading } = useAdminWithdrawals();
  const updateStatus = useUpdateWithdrawalStatus();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);

  const filtered = withdrawals?.filter((w) => {
    const matchesSearch =
      w.bank_account_holder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w as any).profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w as any).profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = withdrawals?.filter((w) => w.status === 'pending').length || 0;
  const totalPending = withdrawals
    ?.filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + Number(w.amount), 0) || 0;

  const openActionDialog = (request: any, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setDialogAction(action);
    setAdminNotes('');
  };

  const handleAction = async () => {
    if (!selectedRequest || !dialogAction) return;
    const newStatus = dialogAction === 'approve' ? 'completed' : 'rejected';
    try {
      await updateStatus.mutateAsync({ id: selectedRequest.id, status: newStatus, adminNotes });
      toast({
        title: `Withdrawal ${dialogAction === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `₹${Number(selectedRequest.amount).toLocaleString()} request has been ${newStatus}.`,
      });
      setSelectedRequest(null);
      setDialogAction(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to update withdrawal status.', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Withdrawal Requests</h1>
          <p className="text-muted-foreground">Review and process user withdrawal requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Banknote className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Pending Amount</p>
                  <p className="text-2xl font-bold">₹{totalPending.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{withdrawals?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle>All Withdrawal Requests</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Bank Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered && filtered.length > 0 ? (
                      filtered.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{(req as any).profile?.full_name || req.bank_account_holder}</div>
                              <div className="text-xs text-muted-foreground">{(req as any).profile?.email || '—'}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">₹{Number(req.amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>{req.bank_account_holder}</div>
                              <div className="text-muted-foreground">A/C: {req.bank_account_number}</div>
                              <div className="text-muted-foreground">IFSC: {req.bank_ifsc}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[req.status]?.variant || 'outline'}>
                              {statusConfig[req.status]?.label || req.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            {req.status === 'pending' ? (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="text-green-600" onClick={() => openActionDialog(req, 'approve')}>
                                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="text-destructive" onClick={() => openActionDialog(req, 'reject')}>
                                  <XCircle className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">{req.admin_notes || '—'}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">No withdrawal requests found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approve/Reject Dialog */}
        <Dialog open={!!selectedRequest && !!dialogAction} onOpenChange={() => { setSelectedRequest(null); setDialogAction(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogAction === 'approve' ? 'Approve' : 'Reject'} Withdrawal</DialogTitle>
              <DialogDescription>
                {dialogAction === 'approve'
                  ? 'Confirm that the payout has been processed manually.'
                  : 'Provide a reason for rejecting this withdrawal request.'}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-2">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-sm"><strong>Amount:</strong> ₹{Number(selectedRequest.amount).toLocaleString()}</p>
                  <p className="text-sm"><strong>Account:</strong> {selectedRequest.bank_account_holder}</p>
                  <p className="text-sm"><strong>A/C No:</strong> {selectedRequest.bank_account_number}</p>
                  <p className="text-sm"><strong>IFSC:</strong> {selectedRequest.bank_ifsc}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Admin Notes (optional)</label>
                  <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Add notes..." />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => { setSelectedRequest(null); setDialogAction(null); }}>Cancel</Button>
              <Button
                variant={dialogAction === 'approve' ? 'default' : 'destructive'}
                onClick={handleAction}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? 'Processing...' : dialogAction === 'approve' ? 'Approve & Mark Paid' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
