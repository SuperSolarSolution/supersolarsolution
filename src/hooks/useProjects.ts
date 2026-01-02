import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Project {
    project_id: string;
    project_name: string;
    location: string;
    estimated_capacity_kw: number;
    status: string;
    corporate_id: string;
    created_at: string;
    avg_power_consumption_kwh?: number;
    project_type?: string;
}

export function useProjects() {
    return useQuery({
        queryKey: ['projects-approved'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('status', 'Approved')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Project[];
        },
    });
}

export function useAllProjects() {
    return useQuery({
        queryKey: ['all-projects'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Project[];
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) => {
            const { data, error } = await supabase
                .from('projects')
                .update(updates)
                .eq('project_id', projectId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects-approved'] });
            queryClient.invalidateQueries({ queryKey: ['all-projects'] });
        },
    });
}
