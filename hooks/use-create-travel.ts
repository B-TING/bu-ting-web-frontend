'use client';

import { useMutation } from '@tanstack/react-query';

import { createTravel } from '@/api/travel';

export function useCreateTravel() {
  return useMutation({ mutationFn: createTravel });
}
