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
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from '@/components/ui/responsive-dialog';
import { useState, useMemo } from 'react';
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
  const { data: withdrawalRequests } = useWithdrawalRequests();
  const walletBalance = profile?.wallet_balance || 0;

  const referralCode = referralStats?.referralCode || profile?.referral_code || 'Loading...';
  const referralEarnings = referralStats?.totalEarned || 0;
  const successfulReferrals = referralStats?.successfulReferrals || 0;
  const pendingReferrals = referralStats?.pendingReferrals || 0;

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const { totalCredited, totalInvested, returnTransactions, investmentTransactions } = useMemo(() => {
    let credited = 0;
    let invested = 0;
    const returns = [];
    const investments = [];

    if (transactions) {
      for (const tx of transactions) {
        if (tx.type === 'return') {
          credited += Number(tx.amount);
          returns.push(tx);
        } else if (tx.type === 'investment') {
          invested += Number(tx.amount);
          investments.push(tx);
        }
      }
    }
    return { totalCredited: credited, totalInvested: invested, returnTransactions: returns, investmentTransactions: investments };
  }, [transactions]);

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
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast({
          title: 'Link Copied!',
          description: 'Referral link copied to clipboard. Share it with your friends!',
        });
      }
    } catch (error) {
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
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Wallet</h1>
          <p className="text-sm text-muted-foreground">Manage your funds and referrals</p>
        </div>

        {/* Wallet Balance Card - full bleed on mobile */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 opacity-0 animate-scale-in border-0 shadow-lg -mx-3 md:mx-0 rounded-none md:rounded-xl">
          <CardContent className="pt-6 pb-6 px-4 md:px-6">
            <div className="text-primary-foreground">
              <p className="text-sm opacity-80">Available Balance</p>
              <p className="text-3xl md:text-4xl font-bold mt-1">₹{walletBalance.toLocaleString()}</p>
              <p className="text-xs opacity-70 mt-1">Last updated: Just now</p>
            </div>
            {/* Action buttons row */}
            <div className="flex gap-2 mt-4">
              <ResponsiveDialog>
                <ResponsiveDialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="flex-1 md:flex-none">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Money
                  </Button>
                </ResponsiveDialogTrigger>
                <ResponsiveDialogContent>
                  <ResponsiveDialogHeader>
                    <ResponsiveDialogTitle>Add Money to Wallet</ResponsiveDialogTitle>
                    <ResponsiveDialogDescription>Add funds to invest in solar assets</ResponsiveDialogDescription>
                  </ResponsiveDialogHeader>
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
                    <div className="flex gap-2 flex-wrap">
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
                  <ResponsiveDialogFooter>
                    <Button onClick={handleAddMoney} disabled={isAddingFunds || !addMoneyAmount} className="w-full md:w-auto">
                      {isAddingFunds && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Funds
                    </Button>
                  </ResponsiveDialogFooter>
                </ResponsiveDialogContent>
              </ResponsiveDialog>

              <ResponsiveDialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                <ResponsiveDialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="flex-1 md:flex-none">
                    <Send className="mr-1.5 h-4 w-4" />
                    Withdraw
                  </Button>
                </ResponsiveDialogTrigger>
                <ResponsiveDialogContent>
                  <ResponsiveDialogHeader>
                    <ResponsiveDialogTitle>Withdraw Funds</ResponsiveDialogTitle>
                    <ResponsiveDialogDescription>Transfer funds to your bank account</ResponsiveDialogDescription>
                  </ResponsiveDialogHeader>
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
                  <ResponsiveDialogFooter>
                    <Button
                      className="w-full md:w-auto"
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
                  </ResponsiveDialogFooter>
                </ResponsiveDialogContent>
              </ResponsiveDialog>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats - horizontal scroll on mobile */}
        <div className="flex gap-3 overflow-x-auto scroll-snap-x scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-4">
          <Card className="min-w-[60vw] md:min-w-0">
            <CardContent className="pt-5 pb-4 px-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                  <ArrowDownLeft className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Credited</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{totalCredited.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-[60vw] md:min-w-0">
            <CardContent className="pt-5 pb-4 px-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Invested</p>
                  <p className="text-lg font-bold text-red-600">
                    ₹{totalInvested.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-[60vw] md:min-w-0">
            <CardContent className="pt-5 pb-4 px-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Referral Earnings</p>
                  <p className="text-lg font-bold text-primary">₹{referralEarnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Refer and Earn Section - compact on mobile */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3 md:pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                <CardTitle className="text-base md:text-lg">Refer & Earn</CardTitle>
              </div>
              <Button size="sm" onClick={handleShareReferral} className="md:hidden">
                Share
              </Button>
            </div>
            <CardDescription className="text-xs md:text-sm">Invite friends and earn rewards on their investments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:gap-6 md:grid-cols-2">
              <div>
                <div className="p-3 md:p-4 rounded-lg bg-background border">
                  <p className="text-xs text-muted-foreground mb-1.5">Your Referral Code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 md:px-4 md:py-3 bg-muted rounded-lg font-mono text-base md:text-lg font-bold">
                      {referralCode}
                    </code>
                    <Button variant="outline" size="icon" onClick={handleCopyReferral} className="h-9 w-9">
                      {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="mt-3 p-3 md:p-4 rounded-lg bg-background border hidden md:block">
                  <h4 className="font-semibold mb-2">How it works</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      Share your referral code with friends
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      They sign up and make their first investment
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      You both earn ₹250 bonus on successful investment!
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 md:p-4 rounded-lg bg-background border text-center">
                    <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto text-primary mb-1" />
                    <p className="text-xl md:text-2xl font-bold">{successfulReferrals}</p>
                    <p className="text-xs text-muted-foreground">Successful</p>
                  </div>
                  <div className="p-3 md:p-4 rounded-lg bg-background border text-center">
                    <IndianRupee className="h-6 w-6 md:h-8 md:w-8 mx-auto text-green-600 mb-1" />
                    <p className="text-xl md:text-2xl font-bold">₹{referralEarnings.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Earned</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background border">
                  <p className="text-xs text-muted-foreground mb-0.5">Pending Referrals</p>
                  <p className="text-lg font-bold">{pendingReferrals}</p>
                  <p className="text-xs text-muted-foreground">
                    Waiting for first investment
                  </p>
                </div>
                <Button className="w-full hidden md:flex" onClick={handleShareReferral}>
                  <Gift className="mr-2 h-4 w-4" />
                  Share Referral Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Requests History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Withdrawal Requests</CardTitle>
            <CardDescription className="text-xs md:text-sm">Track the status of your withdrawal requests</CardDescription>
          </CardHeader>
          <CardContent className="px-0 md:px-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden md:table-cell">Bank Account</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Admin Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalRequests && withdrawalRequests.length > 0 ? (
                    withdrawalRequests.map((wr) => (
                      <TableRow key={wr.id}>
                        <TableCell className="text-xs md:text-sm">{new Date(wr.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-semibold text-sm">₹{Number(wr.amount).toLocaleString()}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm">
                            <p>{wr.bank_account_holder}</p>
                            <p className="text-muted-foreground text-xs">A/C: ****{wr.bank_account_number.slice(-4)}</p>
                            <p className="text-muted-foreground text-xs">IFSC: {wr.bank_ifsc}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              wr.status === 'completed'
                                ? 'bg-green-500/10 text-green-600'
                                : wr.status === 'rejected'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-yellow-500/10 text-yellow-600'
                            }
                          >
                            <span className="mr-1">
                              {wr.status === 'completed' ? (
                                <CheckCircle2 className="inline h-3 w-3" />
                              ) : wr.status === 'rejected' ? (
                                <Ban className="inline h-3 w-3" />
                              ) : (
                                <Clock className="inline h-3 w-3" />
                              )}
                            </span>
                            {wr.status.charAt(0).toUpperCase() + wr.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {wr.admin_notes || '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No withdrawal requests yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Transaction History</CardTitle>
            <CardDescription className="text-xs md:text-sm">All wallet transactions</CardDescription>
          </CardHeader>
          <CardContent className="px-0 md:px-6">
            <Tabs defaultValue="all">
              <TabsList className="mx-4 md:mx-0">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="credit">Credits</TabsTrigger>
                <TabsTrigger value="debit">Debits</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="hidden md:table-cell">Type</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions && transactions.length > 0 ? (
                        transactions.slice(0, 10).map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-xs md:text-sm">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="capitalize hidden md:table-cell">{tx.type}</TableCell>
                            <TableCell className="hidden md:table-cell">{tx.reference}</TableCell>
                            <TableCell className={`text-right font-semibold text-sm ${tx.type === 'return' ? 'text-green-600' : 'text-red-600'}`}>
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
                </div>
              </TabsContent>
              <TabsContent value="credit" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returnTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-xs md:text-sm">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="hidden md:table-cell">{tx.reference}</TableCell>
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
                </div>
              </TabsContent>
              <TabsContent value="debit" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {investmentTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-xs md:text-sm">{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="hidden md:table-cell">{tx.reference}</TableCell>
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
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
