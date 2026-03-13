import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSIPPlans, useSIPExecutions, useUpdateSIPStatus, SIPPlan } from '@/hooks/useSIPPlans';
import {
  CalendarClock, Loader2, Pause, Play, XCircle, ChevronDown, ChevronUp,
  IndianRupee, MapPin, TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const statusConfig: Record<string, { label: string; class: string }> = {
  active: { label: 'Active', class: 'bg-green-500/10 text-green-600 border-green-500/20' },
  paused: { label: 'Paused', class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  completed: { label: 'Completed', class: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  cancelled: { label: 'Cancelled', class: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export default function InvestorSIPs() {
  const { data: sips, isLoading } = useSIPPlans();
  const updateStatus = useUpdateSIPStatus();

  const activeSIPs = sips?.filter(s => s.status === 'active') || [];
  const totalMonthly = activeSIPs.reduce((sum, s) => sum + Number(s.amount), 0);
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

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4">
              <p className="text-xs text-muted-foreground">Active SIPs</p>
              <p className="text-lg md:text-2xl font-bold">{activeSIPs.length}</p>
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

        {/* SIP Cards */}
        {sips && sips.length > 0 ? (
          <div className="space-y-3">
            {sips.map((sip) => (
              <SIPCard key={sip.id} sip={sip} onUpdateStatus={updateStatus.mutate} isUpdating={updateStatus.isPending} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarClock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No SIPs Yet</h3>
              <p className="text-muted-foreground text-sm">
                Go to Solar Assets and click "Start SIP" on any asset to begin.
              </p>
            </CardContent>
          </Card>
        )}
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
            <p className="font-semibold">{sip.sip_date}{getOrdinalSuffix(sip.sip_date)} of month</p>
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

        {sip.max_executions && (
          <p className="text-xs text-muted-foreground mb-3">
            Installments: {sip.executions_count} / {sip.max_executions}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {sip.status === 'active' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus({ sipId: sip.id, status: 'paused' })}
                disabled={isUpdating}
              >
                <Pause className="h-3 w-3 mr-1" /> Pause
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/30"
                onClick={() => onUpdateStatus({ sipId: sip.id, status: 'cancelled' })}
                disabled={isUpdating}
              >
                <XCircle className="h-3 w-3 mr-1" /> Cancel
              </Button>
            </>
          )}
          {sip.status === 'paused' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateStatus({ sipId: sip.id, status: 'active' })}
              disabled={isUpdating}
            >
              <Play className="h-3 w-3 mr-1" /> Resume
            </Button>
          )}

          <Collapsible open={showHistory} onOpenChange={setShowHistory}>
            <CollapsibleTrigger asChild>
              <Button size="sm" variant="ghost" className="ml-auto">
                History {showHistory ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        {/* Execution history */}
        <Collapsible open={showHistory} onOpenChange={setShowHistory}>
          <CollapsibleContent>
            <div className="mt-3 border-t pt-3 space-y-2">
              {executions && executions.length > 0 ? (
                executions.map((exec) => (
                  <div key={exec.id} className="flex items-center justify-between text-sm py-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        exec.status === 'success' ? 'bg-green-500/10 text-green-600' :
                        exec.status === 'skipped' ? 'bg-yellow-500/10 text-yellow-600' :
                        'bg-red-500/10 text-red-600'
                      }>
                        {exec.status}
                      </Badge>
                      <span>₹{Number(exec.amount).toLocaleString('en-IN')}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(exec.executed_at), 'dd MMM yyyy')}
                    </span>
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

function getOrdinalSuffix(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
