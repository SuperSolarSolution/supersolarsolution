import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NBFCFunding {
  id: string;
  asset_id: string;
  nbfc_id: string;
  sanctioned_amount: number;
  disbursed_amount: number;
  status: 'sanctioned' | 'partially_disbursed' | 'fully_disbursed' | 'closed';
  created_at: string;
  updated_at: string;
  solar_assets?: {
    id: string;
    name: string;
    location: string;
    capacity_kw: number;
    status: string;
  };
}

export interface FundingMilestone {
  id: string;
  funding_id: string;
  name: string;
  target_date: string;
  completed_date: string | null;
  disbursement_amount: number;
  status: 'pending' | 'completed' | 'delayed';
  created_at: string;
}

export function useNBFCFunding() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['nbfc-funding', user?.id],
    queryFn: async () => {
      let query = supabase
        .from('nbfc_funding')
        .select(`
          *,
          solar_assets (
            id,
            name,
            location,
            capacity_kw,
            status
          )
        `)
        .order('created_at', { ascending: false });

      // Non-admin users can only see their own funding
      if (role !== 'admin' && user) {
        query = query.eq('nbfc_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as NBFCFunding[];
    },
    enabled: !!user,
  });
}

export function useFundingMilestones(fundingId?: string) {
  return useQuery({
    queryKey: ['funding-milestones', fundingId],
    queryFn: async () => {
      let query = supabase
        .from('funding_milestones')
        .select('*')
        .order('target_date', { ascending: true });

      if (fundingId) {
        query = query.eq('funding_id', fundingId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FundingMilestone[];
    },
    enabled: !!fundingId,
  });
}

export function useCreateFunding() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (funding: {
      asset_id: string;
      sanctioned_amount: number;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('nbfc_funding')
        .insert({
          ...funding,
          nbfc_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nbfc-funding'] });
    },
  });
}
