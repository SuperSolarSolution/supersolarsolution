import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EnergyGeneration {
  id: string;
  asset_id: string;
  date: string;
  generated_kwh: number;
  consumed_kwh: number;
  exported_kwh: number;
  created_at: string;
}

export function useEnergyGeneration(assetId?: string) {
  return useQuery({
    queryKey: ['energy-generation', assetId],
    queryFn: async () => {
      let query = supabase
        .from('energy_generation')
        .select('*')
        .order('date', { ascending: true });

      if (assetId) {
        query = query.eq('asset_id', assetId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EnergyGeneration[];
    },
  });
}

export function useEnergyGenerationByAsset(assetIds: string[]) {
  return useQuery({
    queryKey: ['energy-generation', 'assets', assetIds],
    queryFn: async () => {
      if (assetIds.length === 0) return [];

      const { data, error } = await supabase
        .from('energy_generation')
        .select('*')
        .in('asset_id', assetIds)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as EnergyGeneration[];
    },
    enabled: assetIds.length > 0,
  });
}
