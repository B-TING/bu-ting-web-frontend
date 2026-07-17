import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PersistedTravelogueComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface ImportedTravelPlan {
  storyId: string;
  title: string;
  author: string;
  placeCount: number;
  periodLabel: string;
  importedAt: string;
}

interface TravelogueStoreState {
  likedStoryIds: string[];
  commentsByStoryId: Record<string, PersistedTravelogueComment[]>;
  importedPlans: ImportedTravelPlan[];
  activePlanTitle: string | null;
  toggleLike: (storyId: string) => void;
  addComment: (storyId: string, author: string, content: string) => void;
  importPlan: (plan: ImportedTravelPlan) => void;
  isLiked: (storyId: string) => boolean;
  getComments: (storyId: string) => PersistedTravelogueComment[];
  hasImportedPlan: (storyId: string) => boolean;
}

export const useTravelogueStore = create<TravelogueStoreState>()(
  persist(
    (set, get) => ({
      likedStoryIds: [],
      commentsByStoryId: {},
      importedPlans: [],
      activePlanTitle: '2박 3일 부산 여행',
      toggleLike: (storyId) =>
        set((state) => {
          const exists = state.likedStoryIds.includes(storyId);

          return {
            likedStoryIds: exists
              ? state.likedStoryIds.filter((id) => id !== storyId)
              : [...state.likedStoryIds, storyId],
          };
        }),
      addComment: (storyId, author, content) =>
        set((state) => {
          const currentComments = state.commentsByStoryId[storyId] ?? [];

          return {
            commentsByStoryId: {
              ...state.commentsByStoryId,
              [storyId]: [
                ...currentComments,
                {
                  id: `${storyId}-${Date.now()}`,
                  author,
                  content,
                  createdAt: new Date().toISOString(),
                },
              ],
            },
          };
        }),
      importPlan: (plan) =>
        set((state) => ({
          importedPlans: state.importedPlans.some((item) => item.storyId === plan.storyId)
            ? state.importedPlans
            : [...state.importedPlans, plan],
        })),
      isLiked: (storyId) => get().likedStoryIds.includes(storyId),
      getComments: (storyId) => get().commentsByStoryId[storyId] ?? [],
      hasImportedPlan: (storyId) => get().importedPlans.some((item) => item.storyId === storyId),
    }),
    {
      name: 'travelogue-store',
    },
  ),
);
