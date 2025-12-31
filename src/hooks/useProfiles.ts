import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  kyc_status: 'pending' | 'approved' | 'rejected';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileWithRole extends Profile {
  role?: 'investor' | 'corporate' | 'nbfc' | 'implementer' | 'admin';
}

export function useAllProfiles() {
  const { role } = useAuth();

  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Profile[];
    },
    enabled: role === 'admin',
  });
}

export function useAllProfilesWithRoles() {
  const { role } = useAuth();

  return useQuery({
    queryKey: ['profiles-with-roles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      return (profiles || []).map(profile => ({
        ...profile,
        role: roleMap.get(profile.id),
      })) as ProfileWithRole[];
    },
    enabled: role === 'admin',
  });
}

export function useUpdateKYCStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'pending' | 'approved' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ kyc_status: status })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles-with-roles'] });
    },
  });
}
