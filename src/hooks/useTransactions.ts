import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Transaction {
  id: string;
  type: 'investment' | 'return' | 'disbursement' | 'billing';
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
