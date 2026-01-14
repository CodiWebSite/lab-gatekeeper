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

// Fetch publications for a lab
export function usePublications(labId: string | null, year?: number | null) {
  return useQuery({
    queryKey: ['publications', labId, year],
    queryFn: async () => {
      if (!labId) return [];
      
      let query = supabase
        .from('publications')
        .select('*')
        .eq('lab_id', labId)
        .order('year', { ascending: false })
        .order('display_order', { ascending: true });

      if (year) {
        query = query.eq('year', year);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Publication[];
    },
    enabled: !!labId,
  });
}

// Fetch publication years for a lab
export function usePublicationYears(labId: string | null) {
  return useQuery({
    queryKey: ['publication_years', labId],
    queryFn: async () => {
      if (!labId) return [];
      
      const { data, error } = await supabase
        .from('publications')
        .select('year')
        .eq('lab_id', labId)
        .order('year', { ascending: false });

      if (error) throw error;
      
      // Get unique years
      const years = [...new Set(data.map(p => p.year))];
      return years;
    },
    enabled: !!labId,
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

// Similar mutations for publications, projects, infrastructure...
export function useCreatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Publication, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('publications')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publications', variables.lab_id] });
      queryClient.invalidateQueries({ queryKey: ['publication_years', variables.lab_id] });
    },
  });
}

export function useUpdatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, labId, data }: { id: string; labId: string; data: Partial<Publication> }) => {
      const { error } = await supabase
        .from('publications')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      return labId;
    },
    onSuccess: (labId) => {
      queryClient.invalidateQueries({ queryKey: ['publications', labId] });
      queryClient.invalidateQueries({ queryKey: ['publication_years', labId] });
    },
  });
}

export function useDeletePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, labId }: { id: string; labId: string }) => {
      const { error } = await supabase
        .from('publications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return labId;
    },
    onSuccess: (labId) => {
      queryClient.invalidateQueries({ queryKey: ['publications', labId] });
      queryClient.invalidateQueries({ queryKey: ['publication_years', labId] });
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
