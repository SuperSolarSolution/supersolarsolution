import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSIPPlans, useSIPExecutions, useUpdateSIPStatus, SIPPlan } from '@/hooks/useSIPPlans';
import {
  CalendarClock, Loader2, Pause, Play, XCircle, ChevronDown, ChevronUp,
  IndianRupee, MapPin, TrendingUp, AlertTriangle
} from 'lucide-react';
import { format, differenceInHours, parseISO } from 'date-fns';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { getOrdinalSuffix } from '@/lib/utils';

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: 'Active', class: 'bg-green-500/10 text-green-600 border-green-500/20' },
  paused: { label: 'Paused', class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  completed: { label: 'Completed', class: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  cancelled: { label: 'Cancelled', class: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export default function InvestorSIPs() {
  const { data: sips, isLoading } = useSIPPlans();
  const updateStatus = useUpdateSIPStatus();
  const [updatingSipId, setUpdatingSipId] = useState<string | null>(null);

  const handleUpdate = async (params: { sipId: string; status: 'active' | 'paused' | 'cancelled' }) => {
    setUpdatingSipId(params.sipId);
    try {
      await updateStatus.mutateAsync(params);
    } finally {
      setUpdatingSipId(null);
    }
  };

  const activeOrPaused = sips?.filter(s => s.status === 'active' || s.status === 'paused') || [];
  const cancelled = sips?.filter(s => s.status === 'cancelled' || s.status === 'completed') || [];
  const totalMonthly = sips?.filter(s => s.status === 'active').reduce((sum, s) => sum + Number(s.amount), 0) || 0;
  const totalInvested = sips?.reduce((sum, s) => sum + Number(s.total_invested), 0) || 0;

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
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />
            Solar SIPs
          </h1>
          <p className="text-sm text-muted-foreground">Manage your recurring solar investments</p>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4">
              <p className="text-xs text-muted-foreground">Active SIPs</p>
              <p className="text-lg md:text-2xl font-bold">{activeOrPaused.filter(s => s.status === 'active').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <p className="text-xs text-muted-foreground">Monthly Outflow</p>
              <p className="text-lg md:text-2xl font-bold">₹{totalMonthly.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4">
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-lg md:text-2xl font-bold">₹{totalInvested.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active/Paused</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-3 mt-4">
            {activeOrPaused.map((sip) => (
              <SIPCard key={sip.id} sip={sip} onUpdateStatus={handleUpdate} isUpdating={updatingSipId === sip.id} />
            ))}
          </TabsContent>
          <TabsContent value="history" className="space-y-3 mt-4">
            {cancelled.map((sip) => (
              <SIPCard key={sip.id} sip={sip} onUpdateStatus={handleUpdate} isUpdating={updatingSipId === sip.id} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function SIPCard({ sip, onUpdateStatus, isUpdating }: {
  sip: SIPPlan;
  onUpdateStatus: (params: { sipId: string; status: 'active' | 'paused' | 'cancelled' }) => void;
  isUpdating: boolean;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const { data: executions } = useSIPExecutions(showHistory ? sip.id : null);
  const config = statusConfig[sip.status];
  
  const nextDate = sip.next_execution_date ? parseISO(sip.next_execution_date) : null;
  const isCloseToExecution = nextDate ? differenceInHours(nextDate, new Date()) < 24 : false;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold">{sip.solar_assets?.name || 'Solar Asset'}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {sip.solar_assets?.location}
            </p>
          </div>
          <Badge variant="outline" className={config.class}>{config.label}</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Monthly Amount</p>
            <p className="font-semibold flex items-center gap-1">
              <IndianRupee className="h-3 w-3" />
              {Number(sip.amount).toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">SIP Date</p>
            <p className="font-semibold">{sip.sip_date}{getOrdinalSuffix(sip.sip_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Next Debit</p>
            <p className="font-semibold">
              {sip.status === 'active' ? format(new Date(sip.next_execution_date), 'dd MMM yyyy') : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Invested</p>
            <p className="font-semibold text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              ₹{Number(sip.total_invested).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {sip.status === 'active' && isCloseToExecution && (
          <div className="flex items-center gap-2 p-2 mb-3 bg-amber-500/10 text-amber-600 text-xs rounded border border-amber-500/20">
            <AlertTriangle className="h-4 w-4" />
            <span>Next debit is within 24 hours. Changes may apply from next cycle.</span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {sip.status === 'active' && (
            <>
              <Button size="sm" variant="outline" onClick={() => onUpdateStatus({ sipId: sip.id, status: 'paused' })} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Pause className="h-3 w-3 mr-1" />} Pause
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30" disabled={isUpdating}>
                    <XCircle className="h-3 w-3 mr-1" /> Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel SIP Plan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently cancel your monthly SIP of <strong>₹{Number(sip.amount).toLocaleString('en-IN')}</strong> for <strong>{sip.solar_assets?.name || 'Solar Asset'}</strong>. This action is immediate and cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, Keep Active</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onUpdateStatus({ sipId: sip.id, status: 'cancelled' })}>Yes, Cancel SIP</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {sip.status === 'paused' && (
            <Button size="sm" variant="outline" onClick={() => onUpdateStatus({ sipId: sip.id, status: 'active' })} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Play className="h-3 w-3 mr-1" />} Resume
            </Button>
          )}

          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setShowHistory(!showHistory)}>
            History {showHistory ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>
        </div>

        <Collapsible open={showHistory}>
          <CollapsibleContent>
            <div className="mt-3 border-t pt-3 space-y-2">
              {executions && executions.length > 0 ? (
                executions.map((exec) => (
                  <div key={exec.id} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={exec.status === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}>{exec.status}</Badge>
                      <span>₹{Number(exec.amount).toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(exec.executed_at), 'dd MMM yyyy')}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">No executions yet</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
