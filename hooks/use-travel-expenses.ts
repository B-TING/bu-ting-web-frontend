'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  confirmTravelSettlement,
  createTravelExpense,
  getTravelExpenses,
  getTravelExpenseSummary,
  getTravelSettlement,
} from '@/api/travel-expense';
import type { TravelExpenseCreateRequest } from '@/types/budget';

export function useTravelExpenses(travelId: string) {
  return useQuery({
    queryKey: ['travel-expenses', travelId],
    queryFn: () => getTravelExpenses(travelId),
    enabled: Boolean(travelId),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
}

export function useTravelExpenseSummary(travelId: string) {
  return useQuery({
    queryKey: ['travel-expense-summary', travelId],
    queryFn: () => getTravelExpenseSummary(travelId),
    enabled: Boolean(travelId),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
}

export function useTravelSettlement(travelId: string) {
  return useQuery({
    queryKey: ['travel-settlement', travelId],
    queryFn: () => getTravelSettlement(travelId),
    enabled: Boolean(travelId),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
  });
}

export function useCreateTravelExpense(travelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: TravelExpenseCreateRequest) => createTravelExpense(travelId, request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['travel-expenses', travelId] }),
        queryClient.invalidateQueries({ queryKey: ['travel-expense-summary', travelId] }),
        queryClient.invalidateQueries({ queryKey: ['travel-settlement', travelId] }),
      ]);
    },
  });
}

export function useConfirmTravelSettlement(travelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => confirmTravelSettlement(travelId),
    onSuccess: (settlement) => {
      queryClient.setQueryData(['travel-settlement', travelId], settlement);
    },
  });
}
