import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Investment {
  id: string;
  asset_id: string;
  investor_id: string;
  amount: number;
  status: 'committed' | 'deployed' | 'returned';
  expected_returns: number;
  actual_returns: number;
  start_date: string;
  maturity_date: string;
  created_at: string;
  updated_at: string;
  solar_assets?: {
    id: string;
    name: string;
    location: string;
    capacity_kw: number;
    status: string;
    risk_score: string;
    expected_irr: number;
  };
}

export function useInvestments() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['investments', user?.id],
    queryFn: async () => {
      let query = supabase
        .from('investments')
        .select(`
          *,
          solar_assets (
            id,
            name,
            location,
            capacity_kw,
            status,
            risk_score,
            expected_irr
          )
        `)
        .order('created_at', { ascending: false });

      // Non-admin users can only see their own investments
      if (role !== 'admin' && user) {
        query = query.eq('investor_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Investment[];
    },
    enabled: !!user,
  });
}

export function useCreateInvestment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (investment: {
      asset_id: string;
      amount: number;
      maturity_date: string;
      expected_returns?: number;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase.rpc('invest_in_asset', {
        p_asset_id: investment.asset_id,
        p_investor_id: user.id,
        p_amount: investment.amount,
        p_expected_returns: investment.expected_returns || 0,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
    },
  });
}
