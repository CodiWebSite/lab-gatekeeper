import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GroupMember, GroupResult, ResearchGroup } from '@/types/database';

// Fetch single research group
export function useResearchGroup(groupId: string | null) {
  return useQuery({
    queryKey: ['research_group', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      
      const { data, error } = await supabase
        .from('research_groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return data as ResearchGroup;
    },
    enabled: !!groupId,
  });
}

// Fetch group members
export function useGroupMembers(groupId: string | null) {
  return useQuery({
    queryKey: ['group_members', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as GroupMember[];
    },
    enabled: !!groupId,
  });
}

// Fetch group results
export function useGroupResults(groupId: string | null) {
  return useQuery({
    queryKey: ['group_results', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      
      const { data, error } = await supabase
        .from('group_results')
        .select('*')
        .eq('group_id', groupId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as GroupResult[];
    },
    enabled: !!groupId,
  });
}

// Check if a group has content (members or results)
export function useGroupHasContent(groupId: string | null) {
  const { data: members } = useGroupMembers(groupId);
  const { data: results } = useGroupResults(groupId);
  
  return (members && members.length > 0) || (results && results.length > 0);
}

// CRUD for group members
export function useCreateGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<GroupMember, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('group_members')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group_members', variables.group_id] });
    },
  });
}

export function useUpdateGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, groupId, data }: { id: string; groupId: string; data: Partial<GroupMember> }) => {
      const { error } = await supabase
        .from('group_members')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return groupId;
    },
    onSuccess: (groupId) => {
      queryClient.invalidateQueries({ queryKey: ['group_members', groupId] });
    },
  });
}

export function useDeleteGroupMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, groupId }: { id: string; groupId: string }) => {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return groupId;
    },
    onSuccess: (groupId) => {
      queryClient.invalidateQueries({ queryKey: ['group_members', groupId] });
    },
  });
}

// CRUD for group results
export function useCreateGroupResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<GroupResult, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('group_results')
        .insert(data);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group_results', variables.group_id] });
    },
  });
}

export function useUpdateGroupResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, groupId, data }: { id: string; groupId: string; data: Partial<GroupResult> }) => {
      const { error } = await supabase
        .from('group_results')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return groupId;
    },
    onSuccess: (groupId) => {
      queryClient.invalidateQueries({ queryKey: ['group_results', groupId] });
    },
  });
}

export function useDeleteGroupResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, groupId }: { id: string; groupId: string }) => {
      const { error } = await supabase
        .from('group_results')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return groupId;
    },
    onSuccess: (groupId) => {
      queryClient.invalidateQueries({ queryKey: ['group_results', groupId] });
    },
  });
}
