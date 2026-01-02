import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateFunding } from '@/hooks/useNBFCFunding';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '@/hooks/useProjects';

interface InvestModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
}

export function InvestModal({ isOpen, onClose, project }: InvestModalProps) {
    const [amount, setAmount] = useState('');
    const { mutate: invest, isPending } = useCreateFunding();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!project || !amount) return;

        invest(
            {
                project_id: project.project_id,
                sanctioned_amount: Number(amount),
            },
            {
                onSuccess: () => {
                    toast.success('Investment sanctioned successfully');
                    onClose();
                    setAmount('');
                },
                onError: (error) => {
                    toast.error(`Investment failed: ${error.message}`);
                },
            }
        );
    };

    if (!project) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invest in {project.project_name}</DialogTitle>
                    <DialogDescription>
                        Enter the amount you wish to sanction for this project.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="project-details">Project Details</Label>
                        <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/50">
                            <p><strong>Capacity:</strong> {project.estimated_capacity_kw} kW</p>
                            <p><strong>Location:</strong> {project.location}</p>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Sanction Amount (₹)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="e.g. 5000000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="1000"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending || !amount}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Investment
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
