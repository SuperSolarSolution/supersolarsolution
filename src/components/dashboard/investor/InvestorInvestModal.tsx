import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateInvestment } from '@/hooks/useInvestments';
import { SolarAsset } from '@/hooks/useSolarAssets';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';

interface InvestorInvestModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: SolarAsset | null;
}

export function InvestorInvestModal({ isOpen, onClose, asset }: InvestorInvestModalProps) {
    const [amount, setAmount] = useState('');
    const { profile } = useAuth();
    const { mutate: invest, isPending } = useCreateInvestment();

    // Reset amount when asset changes
    useEffect(() => {
        setAmount('');
    }, [asset]);

    const calculateReturns = (investAmount: number) => {
        if (!asset) return 0;
        // Simple calculation: Amount * (1 + IRR/100 * Years)
        // This gives total amount returned. If "expected_returns" means strictly profit, subtract amount.
        // Based on dashboard, "Expected Returns" seems to be total value or profit? 
        // Dashboard says "Total Invested" and "Expected Returns". Usually returns means profit.
        // But let's assume it's total payout for now, or just profit.
        // Let's stick to profit: Amount * (IRR/100) * Years
        return investAmount * (asset.expected_irr / 100) * asset.expected_life_years;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!asset || !amount) return;

        const investAmount = Number(amount);
        const walletBalance = profile?.wallet_balance || 0;

        if (investAmount > walletBalance) {
            toast.error('Insufficient wallet balance');
            return;
        }

        const maturityDate = new Date();
        maturityDate.setFullYear(maturityDate.getFullYear() + asset.expected_life_years);

        invest(
            {
                asset_id: asset.id,
                amount: investAmount,
                maturity_date: maturityDate.toISOString(),
                expected_returns: calculateReturns(investAmount),
            },
            {
                onSuccess: () => {
                    toast.success('Investment processed successfully');
                    onClose();
                },
                onError: (error) => {
                    toast.error(`Investment failed: ${error.message}`);
                },
            }
        );
    };

    if (!asset) return null;

    const remainingFunding = asset.total_investment - asset.funded_amount;
    const projectedReturn = amount ? calculateReturns(Number(amount)) : 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invest in {asset.name}</DialogTitle>
                    <DialogDescription>
                        Enter the amount you wish to invest in this solar asset.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="asset-details">Asset Details</Label>
                        <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/50 grid grid-cols-2 gap-2">
                            <p><strong>Capacity:</strong> {asset.capacity_kw} kW</p>
                            <p><strong>IRR:</strong> {asset.expected_irr}%</p>
                            <p><strong>Tenure:</strong> {asset.expected_life_years} Years</p>
                            <p><strong>Available:</strong> ₹{(remainingFunding / 100000).toFixed(1)}L</p>
                            <p className="col-span-2 text-primary font-medium">
                                <strong>Wallet Balance:</strong> ₹{((profile?.wallet_balance || 0) / 100000).toFixed(2)}L
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="amount">Investment Amount (₹)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="Min ₹5000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="5000"
                            max={remainingFunding}
                            step="1000"
                        />
                        {amount && (
                            <p className="text-xs text-green-600 font-medium">
                                Projected Profit: ₹{(projectedReturn / 100000).toFixed(2)}L over {asset.expected_life_years} years
                            </p>
                        )}
                        {amount && Number(amount) > (profile?.wallet_balance || 0) && (
                            <p className="text-xs text-red-600 font-medium">
                                Insufficient wallet balance
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                isPending ||
                                !amount ||
                                Number(amount) > remainingFunding ||
                                Number(amount) > (profile?.wallet_balance || 0)
                            }
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Investment
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
