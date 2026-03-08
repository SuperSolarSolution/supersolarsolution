import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WithdrawParams {
  amount: number;
  bankAccountNumber: string;
  bankIfsc: string;
  bankAccountHolder: string;
}

export function useWithdrawalRequests() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['withdrawal-requests', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useWithdrawal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ amount, bankAccountNumber, bankIfsc, bankAccountHolder }: WithdrawParams) => {
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase.rpc('request_withdrawal' as any, {
        p_user_id: user.id,
        p_amount: amount,
        p_bank_account_number: bankAccountNumber,
        p_bank_ifsc: bankIfsc,
        p_bank_account_holder: bankAccountHolder,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
    },
  });
}
