import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface SIPPlan {
  id: string;
  investor_id: string;
  asset_id: string;
  amount: number;
  sip_date: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  next_execution_date: string;
  total_invested: number;
  executions_count: number;
  max_executions: number | null;
  created_at: string;
  updated_at: string;
  solar_assets?: {
    name: string;
    location: string;
    capacity_kw: number;
    expected_irr: number;
    status: string;
  };
}

export interface SIPExecution {
  id: string;
  sip_id: string;
  amount: number;
  status: string;
  failure_reason: string | null;
  executed_at: string;
}

export function useSIPPlans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sip-plans', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sip_plans')
        .select('*, solar_assets(name, location, capacity_kw, expected_irr, status)')
        .eq('investor_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as SIPPlan[];
    },
    enabled: !!user?.id,
  });
}

export function useSIPExecutions(sipId: string | null) {
  return useQuery({
    queryKey: ['sip-executions', sipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sip_executions')
        .select('*')
        .eq('sip_id', sipId!)
        .order('executed_at', { ascending: false });

      if (error) throw error;
      return data as unknown as SIPExecution[];
    },
    enabled: !!sipId,
  });
}

export function useCreateSIP() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      asset_id: string;
      amount: number;
      sip_date: number;
      max_executions?: number | null;
      payment_method?: 'wallet' | 'mandate';
      mandate_id?: string | null;
    }) => {
      // Calculate next execution date
      const now = new Date();
      const nextDate = new Date(now.getFullYear(), now.getMonth(), params.sip_date);
      if (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      const nextExecDate = nextDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('sip_plans')
        .insert({
          investor_id: user!.id,
          asset_id: params.asset_id,
          amount: params.amount,
          sip_date: params.sip_date,
          next_execution_date: nextExecDate,
          max_executions: params.max_executions || null,
          payment_method: params.payment_method || 'wallet',
          mandate_id: params.mandate_id || null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sip-plans'] });
      toast({ title: 'SIP Created!', description: 'Your Solar SIP has been set up successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSIPStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sipId, status }: { sipId: string; status: 'active' | 'paused' | 'cancelled' }) => {
      const { error } = await supabase
        .from('sip_plans')
        .update({ status } as any)
        .eq('id', sipId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sip-plans'] });
      toast({ title: 'SIP Updated', description: 'SIP status has been updated.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
