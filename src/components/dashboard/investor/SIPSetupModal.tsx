import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from '@/components/ui/responsive-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCreateSIP } from '@/hooks/useSIPPlans';
import { SolarAsset } from '@/hooks/useSolarAssets';
import { 
  CalendarClock, 
  IndianRupee, 
  TrendingUp, 
  Loader2, 
  Wallet, 
  CreditCard, 
  QrCode, 
  Landmark, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrdinalSuffix } from '@/lib/utils';

interface SIPSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: SolarAsset | null;
}

export function SIPSetupModal({ isOpen, onClose, asset }: SIPSetupModalProps) {
  const { profile } = useAuth();
  const [amount, setAmount] = useState('');
  const [sipDate, setSipDate] = useState('1');
  const [duration, setDuration] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'mandate'>('wallet');
  
  // Mandate simulation states
  const [isMandateFlowOpen, setIsMandateFlowOpen] = useState(false);
  const [mandateType, setMandateType] = useState<'upi' | 'netbanking'>('upi');
  const [mandateStep, setMandateStep] = useState(0); // 0: Select, 1: Checkout, 2: Processing, 3: Success
  const [mandateUpiId, setMandateUpiId] = useState(profile?.upi_id || '');
  const [mandateBank, setMandateBank] = useState('');
  const [generatedMandateId, setGeneratedMandateId] = useState<string | null>(null);

  const createSIP = useCreateSIP();

  if (!asset) return null;

  const monthlyAmount = Number(amount) || 0;
  const months = Number(duration) || 12;
  const totalProjected = monthlyAmount * months;
  const projectedReturns = totalProjected * (Number(asset.expected_irr) / 100);

  const handleStartSIP = (mandateIdVal: string | null = null) => {
    if (monthlyAmount < 500) return;

    createSIP.mutate(
      {
        asset_id: asset.id,
        amount: monthlyAmount,
        sip_date: Number(sipDate),
        max_executions: duration ? Number(duration) : null,
        payment_method: paymentMethod,
        mandate_id: mandateIdVal,
      },
      {
        onSuccess: () => {
          setAmount('');
          setSipDate('1');
          setDuration('');
          setPaymentMethod('wallet');
          setIsMandateFlowOpen(false);
          setMandateStep(0);
          setGeneratedMandateId(null);
          onClose();
        },
      }
    );
  };

  const handleCreateMandate = () => {
    setMandateStep(2);
    setTimeout(() => {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      const randomDecimal = array[0] / (0xffffffff + 1);
      const uMRN = 'UMRN' + Math.floor(100000000000 + randomDecimal * 900000000000);
      setGeneratedMandateId(uMRN);
      setMandateStep(3);
    }, 2500);
  };

  const triggerSubmit = () => {
    if (monthlyAmount < 500) return;

    if (paymentMethod === 'mandate') {
      setIsMandateFlowOpen(true);
      setMandateStep(0);
    } else {
      handleStartSIP(null);
    }
  };

  return (
    <>
      <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <ResponsiveDialogContent className="sm:max-w-md bg-card border-border">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="flex items-center gap-2 text-xl font-bold">
              <CalendarClock className="h-5 w-5 text-primary" />
              Start Solar SIP
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Set up a recurring monthly investment in {asset.name}
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-4 py-2">
            {/* Asset info */}
            <div className="rounded-xl bg-muted/30 border border-border/40 p-4 space-y-1">
              <p className="text-sm font-semibold">{asset.name}</p>
              <p className="text-xs text-muted-foreground">{asset.location} • {asset.capacity_kw} kW • Expected IRR {asset.expected_irr}%</p>
            </div>

            {/* Monthly amount */}
            <div className="space-y-2">
              <Label className="font-semibold text-foreground/80">Monthly SIP Amount (₹)</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Min ₹500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9 py-6 text-base font-semibold border-border/70"
                  min={500}
                />
              </div>
              {monthlyAmount > 0 && monthlyAmount < 500 && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Minimum SIP amount is ₹500
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* SIP date */}
              <div className="space-y-2">
                <Label className="font-semibold text-foreground/80">SIP Execution Date</Label>
                <Select value={sipDate} onValueChange={setSipDate}>
                  <SelectTrigger className="border-border/70 py-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1}{getOrdinalSuffix(i + 1)} of month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="font-semibold text-foreground/80">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="border-border/70 py-6">
                    <SelectValue placeholder="Until cancelled" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Until cancelled</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment Method Cards Selection */}
            <div className="space-y-2.5">
              <Label className="font-semibold text-foreground/80">Payment Direct Debit Source</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group select-none ${
                    paymentMethod === 'wallet' 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                      : 'border-border/70 bg-card hover:bg-muted/10'
                  }`}
                  onClick={() => setPaymentMethod('wallet')}
                >
                  <div className="flex items-center gap-2">
                    <Wallet className={`h-4.5 w-4.5 ${paymentMethod === 'wallet' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-bold text-sm">Internal Wallet</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    Uses wallet balance. Requires manual funding if balance is low on due date.
                  </p>
                </div>

                <div 
                  className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group select-none ${
                    paymentMethod === 'mandate' 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                      : 'border-border/70 bg-card hover:bg-muted/10'
                  }`}
                  onClick={() => setPaymentMethod('mandate')}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className={`h-4.5 w-4.5 ${paymentMethod === 'mandate' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-bold text-sm">Bank Auto-Debit</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                    UPI AutoPay / eMandate setup. Auto debits from bank, zero manual wallet topups.
                  </p>
                </div>
              </div>
            </div>

            {/* Projected returns card */}
            {monthlyAmount >= 500 && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <TrendingUp className="h-4 w-4" />
                  Projected Solar SIP Returns
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Total Principal Investment</p>
                    <p className="font-bold text-foreground">₹{totalProjected.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Est. Returns ({asset.expected_irr}%)</p>
                    <p className="font-bold text-green-600">₹{projectedReturns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <ResponsiveDialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose} className="flex-1 py-6">
              Cancel
            </Button>
            <Button
              onClick={triggerSubmit}
              disabled={monthlyAmount < 500 || createSIP.isPending}
              className="flex-1 py-6 font-semibold"
            >
              {createSIP.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {paymentMethod === 'mandate' ? 'Configure Autopay' : 'Start Solar SIP'}
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>

      {/* AutoPay eMandate setup simulator modal */}
      <Dialog open={isMandateFlowOpen} onOpenChange={setIsMandateFlowOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 border-border/80 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <CreditCard className="h-5 w-5 text-primary" />
              Configure Bank Auto-Debit Mandate
            </DialogTitle>
            <DialogDescription>
              Set up NPCI direct debit approval for monthly solar yields
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {mandateStep === 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select your preferred automated debit channel to process monthly SIP deductions:</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className={`h-24 flex flex-col justify-center gap-2 border-2 hover:bg-muted/10 ${
                      mandateType === 'upi' ? 'border-primary bg-primary/5' : 'border-border/70'
                    }`}
                    onClick={() => setMandateType('upi')}
                  >
                    <QrCode className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xs">UPI AutoPay</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`h-24 flex flex-col justify-center gap-2 border-2 hover:bg-muted/10 ${
                      mandateType === 'netbanking' ? 'border-primary bg-primary/5' : 'border-border/70'
                    }`}
                    onClick={() => setMandateType('netbanking')}
                  >
                    <Landmark className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xs">NetBanking eMandate</span>
                  </Button>
                </div>
                <Button className="w-full mt-4 font-semibold" onClick={() => setMandateStep(1)}>
                  Proceed to Setup
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            )}

            {mandateStep === 1 && mandateType === 'upi' && (
              <div className="space-y-4 text-center">
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-sm text-left">
                  <span className="font-bold block text-foreground mb-1">UPI AutoPay Authorization</span>
                  Approve recurring mandates up to ₹{monthlyAmount} instantly via your UPI App.
                </div>

                <div className="max-w-[200px] mx-auto p-4 border rounded-xl bg-white flex flex-col items-center justify-center shadow-md">
                  {/* Styled mock SVG QR Code */}
                  <svg className="w-32 h-32 text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="0" y="0" width="20" height="20" />
                    <rect x="0" y="80" width="20" height="20" />
                    <rect x="80" y="0" width="20" height="20" />
                    <rect x="25" y="25" width="10" height="10" />
                    <rect x="45" y="15" width="20" height="15" />
                    <rect x="15" y="45" width="15" height="15" />
                    <rect x="65" y="55" width="15" height="25" />
                    <rect x="55" y="65" width="10" height="10" />
                    <rect x="35" y="75" width="20" height="10" />
                  </svg>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono uppercase tracking-widest">SOLAR_SIP_AUTOPAY</p>
                </div>

                <div className="space-y-2 max-w-sm mx-auto text-left">
                  <Label htmlFor="mandateUpi">UPI ID / VPA</Label>
                  <Input 
                    id="mandateUpi" 
                    placeholder="user@okaxis" 
                    value={mandateUpiId}
                    onChange={(e) => setMandateUpiId(e.target.value)}
                    className="py-5 font-mono text-center"
                  />
                </div>

                <Button className="w-full font-semibold" onClick={handleCreateMandate}>
                  Simulate UPI App Request
                </Button>
              </div>
            )}

            {mandateStep === 1 && mandateType === 'netbanking' && (
              <div className="space-y-4 text-left">
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-sm">
                  <span className="font-bold block text-foreground mb-1">eMandate Account Debit</span>
                  Authorizes monthly auto debits directly from your registered bank account.
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="mandateBankSelect">Select Bank Account</Label>
                    <Select value={mandateBank} onValueChange={setMandateBank}>
                      <SelectTrigger id="mandateBankSelect">
                        <SelectValue placeholder="Choose Bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sbi">State Bank of India</SelectItem>
                        <SelectItem value="hdfc">HDFC Bank</SelectItem>
                        <SelectItem value="icici">ICICI Bank</SelectItem>
                        <SelectItem value="axis">Axis Bank</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {profile?.bank_account_number && (
                    <div className="p-3 border rounded-lg bg-muted/20 text-xs flex justify-between items-center">
                      <div>
                        <span className="text-muted-foreground block">Linked Bank Account</span>
                        <span className="font-semibold font-mono text-foreground">
                          {profile.bank_account_holder} (IFSC: {profile.bank_ifsc})
                        </span>
                      </div>
                      <Badge className="bg-green-500/10 text-green-600 border border-green-500/10 text-[10px]">VERIFIED</Badge>
                    </div>
                  )}
                </div>

                <Button className="w-full mt-4 font-semibold" onClick={handleCreateMandate} disabled={!mandateBank}>
                  Simulate Bank mandate Portal Redirect
                </Button>
              </div>
            )}

            {mandateStep === 2 && (
              <div className="py-8 text-center space-y-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-bold">Registering Mandate...</h4>
                  <p className="text-xs text-muted-foreground">Handshaking with NPCI and authorizing payment limits</p>
                </div>
              </div>
            )}

            {mandateStep === 3 && (
              <div className="text-center space-y-6 py-2">
                <CheckCircle2 className="h-16 w-16 text-green-500 animate-bounce mx-auto" />
                
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-green-500">Auto-Debit Mandate Approved</h4>
                  <p className="text-sm text-muted-foreground px-4">
                    NPCI e-Mandate registered successfully. Your account is authorized for monthly deductions.
                  </p>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4 text-xs font-mono max-w-sm mx-auto text-left space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mandate ID (UMRN):</span>
                    <span className="font-bold text-foreground">{generatedMandateId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Limit:</span>
                    <span className="font-bold text-foreground">₹{monthlyAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="font-bold text-foreground">Monthly (Execution: {sipDate}{getOrdinalSuffix(Number(sipDate))})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-semibold text-emerald-600">ACTIVE</span>
                  </div>
                </div>

                <Button className="w-full font-semibold" onClick={() => handleStartSIP(generatedMandateId)}>
                  Confirm & Finalize SIP Setup
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
