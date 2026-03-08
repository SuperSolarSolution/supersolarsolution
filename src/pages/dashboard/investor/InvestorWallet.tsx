import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTransactions } from '@/hooks/useTransactions';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useWithdrawal, useWithdrawalRequests } from '@/hooks/useWithdrawal';
import { useReferrals } from '@/hooks/useReferrals';
import { useAuth } from '@/contexts/AuthContext';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Copy,
  Users,
  IndianRupee,
  Plus,
  Send,
  Loader2,
  Building2,
  Clock,
  Ban,
  CheckCircle2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function InvestorWallet() {
  const { profile, user } = useAuth();
  const { data: transactions, isLoading } = useTransactions();
  const { toast } = useToast();
  const { pay: razorpayPay, isPending: isAddingFunds } = useRazorpay({
    onSuccess: (amount) => {
      toast({
        title: 'Money Added',
        description: `₹${amount.toLocaleString()} added to your wallet successfully.`,
      });
      setAddMoneyAmount('');
    },
    onError: (error) => {
      if (error !== 'Payment cancelled') {
        toast({
          title: 'Payment Failed',
          description: error,
          variant: 'destructive',
        });
      }
    },
  });
  const { data: referralStats } = useReferrals();
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState(profile?.bank_account_number || '');
  const [bankIfsc, setBankIfsc] = useState(profile?.bank_ifsc || '');
  const [bankAccountHolder, setBankAccountHolder] = useState(profile?.bank_account_holder || '');
  const [copied, setCopied] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const { mutate: requestWithdrawal, isPending: isWithdrawing } = useWithdrawal();

  // Use real wallet balance from profile
  const walletBalance = profile?.wallet_balance || 0;

  // Real referral data
  const referralCode = referralStats?.referralCode || profile?.referral_code || 'Loading...';
  const referralEarnings = referralStats?.totalEarned || 0;
  const successfulReferrals = referralStats?.successfulReferrals || 0;
  const pendingReferrals = referralStats?.pendingReferrals || 0;

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Referral code copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareReferral = async () => {
    const shareData = {
      title: 'Join S³ - Super Solar Solutions',
      text: `Join me on S³ and invest in solar energy! Use my referral code ${referralCode} and we both earn ₹250 bonus. Sign up now:`,
      url: referralLink,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast({
          title: 'Link Copied!',
          description: 'Referral link copied to clipboard. Share it with your friends!',
        });
      }
    } catch (error) {
      // User cancelled or error
      if ((error as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(referralLink);
        toast({
          title: 'Link Copied!',
          description: 'Referral link copied to clipboard.',
        });
      }
    }
  };

  const handleAddMoney = () => {
    if (!addMoneyAmount || !user) return;
    razorpayPay(
      Number(addMoneyAmount),
      user.id,
      profile?.full_name || '',
      profile?.email || user.email || ''
    );
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !user || !bankAccountNumber || !bankIfsc || !bankAccountHolder) return;

    if (profile?.kyc_status !== 'approved') {
      toast({
        title: 'KYC Required',
        description: 'Please complete your KYC verification in Settings before withdrawing funds.',
        variant: 'destructive',
      });
      return;
    }

    requestWithdrawal(
      {
        amount: Number(withdrawAmount),
        bankAccountNumber,
        bankIfsc,
        bankAccountHolder,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Withdrawal Requested',
            description: `₹${Number(withdrawAmount).toLocaleString()} withdrawal request submitted. Funds will be transferred within 2-3 business days.`,
          });
          setWithdrawAmount('');
          setWithdrawDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: 'Withdrawal Failed',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
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
            <h1 className="text-2xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">Manage your funds and referrals</p>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="text-primary-foreground">
                <p className="text-sm opacity-80">Available Balance</p>
                <p className="text-4xl font-bold mt-2">₹{walletBalance.toLocaleString()}</p>
                <p className="text-sm opacity-80 mt-2">Last updated: Just now</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Money
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Money to Wallet</DialogTitle>
                      <DialogDescription>Add funds to invest in solar assets</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={addMoneyAmount}
                          onChange={(e) => setAddMoneyAmount(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        {[10000, 25000, 50000, 100000].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setAddMoneyAmount(amount.toString())}
                          >
                            ₹{(amount / 1000)}K
                          </Button>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddMoney} disabled={isAddingFunds || !addMoneyAmount}>
                        {isAddingFunds && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Funds
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <Send className="mr-2 h-4 w-4" />
                      Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw Funds</DialogTitle>
                      <DialogDescription>Transfer funds to your bank account</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {profile?.kyc_status !== 'approved' && (
                        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                          ⚠️ KYC verification is required to withdraw funds. Please complete KYC in <a href="/dashboard/investor/settings" className="underline font-medium">Settings</a>.
                        </div>
                      )}
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-2xl font-bold">₹{walletBalance.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Withdrawal Amount (₹)</Label>
                        <Input
                          type="number"
                          placeholder="Min ₹100"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          max={walletBalance}
                        />
                      </div>

                      <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Building2 className="h-4 w-4" />
                          Bank Account Details
                        </div>
                        <div className="space-y-2">
                          <Label>Account Holder Name</Label>
                          <Input
                            placeholder="Enter account holder name"
                            value={bankAccountHolder}
                            onChange={(e) => setBankAccountHolder(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Account Number</Label>
                          <Input
                            placeholder="Enter bank account number"
                            value={bankAccountNumber}
                            onChange={(e) => setBankAccountNumber(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>IFSC Code</Label>
                          <Input
                            placeholder="e.g. SBIN0001234"
                            value={bankIfsc}
                            onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                            maxLength={11}
                          />
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Funds will be transferred to your bank account within 2-3 business days.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleWithdraw}
                        disabled={
                          isWithdrawing ||
                          !withdrawAmount ||
                          Number(withdrawAmount) < 100 ||
                          Number(withdrawAmount) > walletBalance ||
                          !bankAccountNumber ||
                          !bankIfsc ||
                          !bankAccountHolder
                        }
                      >
                        {isWithdrawing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Withdraw ₹{withdrawAmount ? Number(withdrawAmount).toLocaleString() : '0'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ArrowDownLeft className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Credited</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹{transactions?.filter(tx => tx.type === 'return').reduce((sum, tx) => sum + Number(tx.amount), 0).toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-xl font-bold text-red-600">
                    ₹{transactions?.filter(tx => tx.type === 'investment').reduce((sum, tx) => sum + Number(tx.amount), 0).toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Referral Earnings</p>
                  <p className="text-xl font-bold text-primary">₹{referralEarnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Refer and Earn Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              <CardTitle>Refer & Earn</CardTitle>
            </div>
            <CardDescription>Invite friends and earn rewards on their investments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="p-4 rounded-lg bg-background border">
                  <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 bg-muted rounded-lg font-mono text-lg font-bold">
                      {referralCode}
                    </code>
                    <Button variant="outline" size="icon" onClick={handleCopyReferral}>
                      {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-background border">
                  <h4 className="font-semibold mb-2">How it works</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                      Share your referral code with friends
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                      They sign up and make their first investment
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                      You both earn ₹250 bonus on successful investment!
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-background border text-center">
                    <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">{successfulReferrals}</p>
                    <p className="text-sm text-muted-foreground">Successful Referrals</p>
                  </div>
                  <div className="p-4 rounded-lg bg-background border text-center">
                    <IndianRupee className="h-8 w-8 mx-auto text-green-600 mb-2" />
                    <p className="text-2xl font-bold">₹{referralEarnings.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Earned</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-background border">
                  <p className="text-sm text-muted-foreground mb-1">Pending Referrals</p>
                  <p className="text-xl font-bold">{pendingReferrals}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Waiting for first investment from referred users
                  </p>
                </div>
                <Button className="w-full" onClick={handleShareReferral}>
                  <Gift className="mr-2 h-4 w-4" />
                  Share Referral Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>All wallet transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="credit">Credits</TabsTrigger>
                <TabsTrigger value="debit">Debits</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions && transactions.length > 0 ? (
                      transactions.slice(0, 10).map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize">{tx.type}</TableCell>
                          <TableCell>{tx.reference}</TableCell>
                          <TableCell className={`text-right font-semibold ${tx.type === 'return' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'return' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={tx.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}>
                              {tx.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No transactions yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="credit" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions?.filter(tx => tx.type === 'return').map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{tx.reference}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          +₹{Number(tx.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600">
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="debit" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions?.filter(tx => tx.type === 'investment').map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{tx.reference}</TableCell>
                        <TableCell className="text-right font-semibold text-red-600">
                          -₹{Number(tx.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-500/10 text-green-600">
                            {tx.status}
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
      </div>
    </DashboardLayout>
  );
}