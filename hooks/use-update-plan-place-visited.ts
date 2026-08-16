'use client';

import { useMutation } from '@tanstack/react-query';

import { updatePlanPlaceVisited } from '@/api/travel';

export function useUpdatePlanPlaceVisited() {
  return useMutation({
    mutationFn: ({ planPlaceId, visited }: { planPlaceId: string; visited: boolean }) =>
      updatePlanPlaceVisited(planPlaceId, visited),
  });
}
