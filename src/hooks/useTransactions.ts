import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Transaction {
  id: string;
  type: 'investment' | 'return' | 'disbursement' | 'billing' | 'deposit' | 'withdrawal';
  amount: number;
  from_entity: string;
  to_entity: string;
  user_id: string | null;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  created_at: string;
}

export function useTransactions() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Non-admin users can only see their own transactions
      if (role !== 'admin' && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });
}

export function useAddFunds() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase.rpc('add_funds' as any, {
        p_user_id: user.id,
        p_amount: amount,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}
