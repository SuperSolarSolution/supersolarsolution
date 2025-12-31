import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SolarAsset {
  id: string;
  name: string;
  location: string;
  capacity_kw: number;
  status: 'planning' | 'under_construction' | 'operational' | 'maintenance';
  installation_date: string | null;
  expected_life_years: number;
  annual_degradation: number;
  corporate_id: string | null;
  implementer_id: string | null;
  total_investment: number;
  funded_amount: number;
  expected_irr: number;
  risk_score: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export function useSolarAssets() {
  return useQuery({
    queryKey: ['solar-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solar_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SolarAsset[];
    },
  });
}

export function useSolarAsset(id: string) {
  return useQuery({
    queryKey: ['solar-assets', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solar_assets')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as SolarAsset | null;
    },
    enabled: !!id,
  });
}

export function useCreateSolarAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: Omit<SolarAsset, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('solar_assets')
        .insert(asset)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solar-assets'] });
    },
  });
}

export function useUpdateSolarAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SolarAsset> & { id: string }) => {
      const { data, error } = await supabase
        .from('solar_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solar-assets'] });
    },
  });
}
