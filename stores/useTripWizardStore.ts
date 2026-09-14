'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TripWizardData } from '@/types/tripWizard';

export const TOTAL_STEPS = 12;

const initialData: TripWizardData = {
  title: '',
  startDate: '',
  endDate: '',
  headCount: 1,
  companionType: null,
  travelStyles: [],
  pace: null,
  constraints: [],
  attractions: [],
  selectedPlaces: [],
  foods: [],
  accommodationStatus: null,
  accommodationRegions: [],
  bookedAccommodationName: '',
  generationMethod: null,
};

interface TripWizardStore {
  currentStep: number;
  data: TripWizardData;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateData: (updates: Partial<TripWizardData>) => void;
  reset: () => void;
}

export const useTripWizardStore = create<TripWizardStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      data: initialData,
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS),
        })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),
      goToStep: (step) =>
        set(() => ({
          currentStep: Math.max(1, Math.min(step, TOTAL_STEPS)),
        })),
      updateData: (updates) =>
        set((state) => ({
          data: { ...state.data, ...updates },
        })),
      reset: () => set({ currentStep: 1, data: initialData }),
    }),
    {
      name: 'trip-wizard',
      partialize: (state) => ({ data: state.data }),
    }
  )
);
