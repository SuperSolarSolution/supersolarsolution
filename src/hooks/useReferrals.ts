import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReferralStats {
    totalReferrals: number;
    pendingReferrals: number;
    successfulReferrals: number;
    totalEarned: number;
    referralCode: string | null;
}

export function useReferrals() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['referrals', user?.id],
        queryFn: async (): Promise<ReferralStats> => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('referral_analytics')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) {
                // If row doesn't exist yet (edge case), return defaults
                if (error.code === 'PGRST116') {
                    return {
                        totalReferrals: 0,
                        pendingReferrals: 0,
                        successfulReferrals: 0,
                        totalEarned: 0,
                        referralCode: null
                    };
                }
                throw error;
            }

            return {
                totalReferrals: data.total_referrals || 0,
                pendingReferrals: data.pending_referrals || 0,
                successfulReferrals: data.successful_referrals || 0,
                totalEarned: data.total_earned || 0,
                referralCode: data.referral_code,
            };
        },
        enabled: !!user,
    });
}
