import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { useCreateSIP } from '@/hooks/useSIPPlans';
import { SolarAsset } from '@/hooks/useSolarAssets';
import { CalendarClock, IndianRupee, TrendingUp, Loader2 } from 'lucide-react';

interface SIPSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: SolarAsset | null;
}

export function SIPSetupModal({ isOpen, onClose, asset }: SIPSetupModalProps) {
  const [amount, setAmount] = useState('');
  const [sipDate, setSipDate] = useState('1');
  const [duration, setDuration] = useState('');
  const createSIP = useCreateSIP();

  if (!asset) return null;

  const monthlyAmount = Number(amount) || 0;
  const months = Number(duration) || 12;
  const totalProjected = monthlyAmount * months;
  const projectedReturns = totalProjected * (Number(asset.expected_irr) / 100);

  const handleSubmit = () => {
    if (monthlyAmount < 500) return;

    createSIP.mutate(
      {
        asset_id: asset.id,
        amount: monthlyAmount,
        sip_date: Number(sipDate),
        max_executions: duration ? Number(duration) : null,
      },
      {
        onSuccess: () => {
          setAmount('');
          setSipDate('1');
          setDuration('');
          onClose();
        },
      }
    );
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Start Solar SIP
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Set up a recurring monthly investment in {asset.name}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="space-y-4 py-2">
          {/* Asset info */}
          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <p className="text-sm font-medium">{asset.name}</p>
            <p className="text-xs text-muted-foreground">{asset.location} • {asset.capacity_kw} kW • IRR {asset.expected_irr}%</p>
          </div>

          {/* Monthly amount */}
          <div className="space-y-2">
            <Label>Monthly SIP Amount (₹)</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Min ₹500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                min={500}
              />
            </div>
            {monthlyAmount > 0 && monthlyAmount < 500 && (
              <p className="text-xs text-destructive">Minimum SIP amount is ₹500</p>
            )}
          </div>

          {/* SIP date */}
          <div className="space-y-2">
            <Label>SIP Date (Day of Month)</Label>
            <Select value={sipDate} onValueChange={setSipDate}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 28 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {i + 1}{getOrdinalSuffix(i + 1)} of every month
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label>Duration (optional)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
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

          {/* Projected returns card */}
          {monthlyAmount >= 500 && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4" />
                Projected Returns
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Total Investment</p>
                  <p className="font-semibold">₹{totalProjected.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Est. Returns ({asset.expected_irr}%)</p>
                  <p className="font-semibold text-green-600">₹{projectedReturns.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={monthlyAmount < 500 || createSIP.isPending}
            className="flex-1"
          >
            {createSIP.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Start SIP
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function getOrdinalSuffix(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
