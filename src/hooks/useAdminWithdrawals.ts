import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  bank_account_holder: string;
  bank_account_number: string;
  bank_ifsc: string;
  status: string;
  admin_notes: string | null;
  razorpay_payout_id: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    full_name: string;
    email: string;
  };
}

export function useAdminWithdrawals() {
  const { role } = useAuth();

  return useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*, profile:profiles!withdrawal_requests_user_id_fkey(full_name, email)')
        .order('created_at', { ascending: false });

      if (error) {
        // If the join fails, fetch without it
        const { data: fallback, error: fallbackError } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (fallbackError) throw fallbackError;
        return fallback as unknown as WithdrawalRequest[];
      }
      return data as unknown as WithdrawalRequest[];
    },
    enabled: role === 'admin',
  });
}

export function useUpdateWithdrawalStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .update({ status, admin_notes: adminNotes || null, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
    },
  });
}
