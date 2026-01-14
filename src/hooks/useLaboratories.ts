import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Laboratory, ResearchGroup, Publication, Project, Infrastructure } from '@/types/database';

// Fetch all laboratories
export function useLaboratories() {
  return useQuery({
    queryKey: ['laboratories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('laboratories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Laboratory[];
    },
  });
}

// Fetch single laboratory
export function useLaboratory(labId: string | null) {
  return useQuery({
    queryKey: ['laboratory', labId],
    queryFn: async () => {
      if (!labId) return null;
      
      const { data, error } = await supabase
        .from('laboratories')
        .select('*')
        .eq('id', labId)
        .single();

      if (error) throw error;
      return data as Laboratory;
    },
    enabled: !!labId,
  });
}

// Fetch research groups for a lab
export function useResearchGroups(labId: string | null) {
  return useQuery({
    queryKey: ['research_groups', labId],
    queryFn: async () => {
      if (!labId) return [];
      
      const { data, error } = await supabase
        .from('research_groups')
        .select('*')
        .eq('lab_id', labId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as ResearchGroup[];
    },
    enabled: !!labId,
  });
}

// Types for publication years content
export interface PublicationYear {
  id: string;
  lab_id: string;
  year: number;
  content: string;
  created_at: string;
  updated_at: string;
}

// Fetch publication years with content for a lab
export function usePublicationYearsContent(labId: string | null) {
  return useQuery({
    queryKey: ['publication_years_content', labId],
    queryFn: async () => {
      if (!labId) return [];
      
      const { data, error } = await supabase
        .from('publication_years')
        .select('*')
        .eq('lab_id', labId)
        .order('year', { ascending: false });

      if (error) throw error;
      return data as PublicationYear[];
    },
    enabled: !!labId,
  });
}

// Fetch just the years list for a lab (for year chips)
export function usePublicationYears(labId: string | null) {
  return useQuery({
    queryKey: ['publication_years', labId],
    queryFn: async () => {
      if (!labId) return [];
      
      const { data, error } = await supabase
        .from('publication_years')
        .select('year')
        .eq('lab_id', labId)
        .order('year', { ascending: false });

      if (error) throw error;
      return data.map(p => p.year);
    },
    enabled: !!labId,
  });
}

// Fetch content for a specific year
export function usePublicationYearContent(labId: string | null, year: number | null) {
  return useQuery({
    queryKey: ['publication_year_content', labId, year],
    queryFn: async () => {
      if (!labId || !year) return null;
      
      const { data, error } = await supabase
        .from('publication_years')
        .select('*')
        .eq('lab_id', labId)
        .eq('year', year)
        .maybeSingle();

      if (error) throw error;
      return data as PublicationYear | null;
    },
    enabled: !!labId && !!year,
  });
}

// Fetch projects for a lab
export function useProjects(labId: string | null) {
  return useQuery({
    queryKey: ['projects', labId],
    queryFn: async () => {
      if (!labId) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('lab_id', labId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!labId,
  });
}

// Fetch infrastructure for a lab
export function useInfrastructure(labId: string | null) {
  return useQuery({
    queryKey: ['infrastructure', labId],
    queryFn: async () => {
      if (!labId) return [];
      
      const { data, error } = await supabase
        .from('infrastructure')
        .select('*')
        .eq('lab_id', labId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Infrastructure[];
    },
    enabled: !!labId,
  });
}

// Update laboratory
export function useUpdateLaboratory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Laboratory> }) => {
      const { error } = await supabase
        .from('laboratories')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['laboratories'] });
      queryClient.invalidateQueries({ queryKey: ['laboratory', variables.id] });
    },
  });
}

// Create research group
export function useCreateResearchGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<ResearchGroup, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('research_groups')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['research_groups', variables.lab_id] });
    },
  });
}

// Update research group
export function useUpdateResearchGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, labId, data }: { id: string; labId: string; data: Partial<ResearchGroup> }) => {
      const { error } = await supabase
        .from('research_groups')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      return labId;
    },
    onSuccess: (labId) => {
      queryClient.invalidateQueries({ queryKey: ['research_groups', labId] });
    },
  });
}

// Delete research group
export function useDeleteResearchGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, labId }: { id: string; labId: string }) => {
      const { error } = await supabase
        .from('research_groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return labId;
    },
    onSuccess: (labId) => {
      queryClient.invalidateQueries({ queryKey: ['research_groups', labId] });
    },
  });
}

// Upsert publication year content (insert or update)
export function useUpsertPublicationYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ labId, year, content }: { labId: string; year: number; content: string }) => {
      const { error } = await supabase
        .from('publication_years')
        .upsert({ 
          lab_id: labId, 
          year, 
          content,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'lab_id,year' 
        });

      if (error) throw error;
      return { labId, year };
    },
    onSuccess: ({ labId, year }) => {
      queryClient.invalidateQueries({ queryKey: ['publication_years', labId] });
      queryClient.invalidateQueries({ queryKey: ['publication_years_content', labId] });
      queryClient.invalidateQueries({ queryKey: ['publication_year_content', labId, year] });
    },
  });
}

// Delete publication year
export function useDeletePublicationYear() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ labId, year }: { labId: string; year: number }) => {
      const { error } = await supabase
        .from('publication_years')
        .delete()
        .eq('lab_id', labId)
        .eq('year', year);

      if (error) throw error;
      return labId;
    },
    onSuccess: (labId) => {
      queryClient.invalidateQueries({ queryKey: ['publication_years', labId] });
      queryClient.invalidateQueries({ queryKey: ['publication_years_content', labId] });
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('projects')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.lab_id] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, labId, data }: { id: string; labId: string; data: Partial<Project> }) => {
      const { error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      return labId;
    },
    onSuccess: (labId) => {
      queryClient.invalidateQueries({ queryKey: ['projects', labId] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, labId }: { id: string; labId: string }) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return labId;
    },
    onSuccess: (labId) => {
      queryClient.invalidateQueries({ queryKey: ['projects', labId] });
    },
  });
}

export function useCreateInfrastructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Infrastructure, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('infrastructure')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure', variables.lab_id] });
    },
  });
}

export function useUpdateInfrastructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, labId, data }: { id: string; labId: string; data: Partial<Infrastructure> }) => {
      const { error } = await supabase
        .from('infrastructure')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      return labId;
    },
    onSuccess: (labId) => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure', labId] });
    },
  });
}

export function useDeleteInfrastructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, labId }: { id: string; labId: string }) => {
      const { error } = await supabase
        .from('infrastructure')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return labId;
    },
    onSuccess: (labId) => {
      queryClient.invalidateQueries({ queryKey: ['infrastructure', labId] });
    },
  });
}
