import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProgress, TerrainType, LevelProgress } from '@/types';

interface UserProgressState extends UserProgress {
  completeLevel: (levelId: string, stars: number) => void;
  unlockTerrain: (terrain: TerrainType) => void;
  isLevelUnlocked: (levelId: string, levelIndex: number) => boolean;
  getLevelProgress: (levelId: string) => LevelProgress | undefined;
  resetProgress: () => void;
}

const initialProgress: UserProgress = {
  completedLevels: {},
  unlockedTerrains: ['plain'],
  totalStars: 0,
};

export const useUserProgressStore = create<UserProgressState>()(
  persist(
    (set, get) => ({
      ...initialProgress,

      completeLevel: (levelId: string, stars: number) => {
        const state = get();
        const existing = state.completedLevels[levelId];
        const prevStars = existing?.stars || 0;
        const newStars = Math.max(prevStars, stars);

        set({
          completedLevels: {
            ...state.completedLevels,
            [levelId]: {
              stars: newStars,
              completed: true,
            },
          },
          totalStars: state.totalStars + Math.max(0, newStars - prevStars),
        });
      },

      unlockTerrain: (terrain: TerrainType) => {
        const state = get();
        if (!state.unlockedTerrains.includes(terrain)) {
          set({
            unlockedTerrains: [...state.unlockedTerrains, terrain],
          });
        }
      },

      isLevelUnlocked: (levelId: string, levelIndex: number) => {
        if (levelIndex === 0) return true;
        const state = get();
        const prevLevelIds = Object.keys(state.completedLevels);
        return prevLevelIds.length >= levelIndex;
      },

      getLevelProgress: (levelId: string) => {
        return get().completedLevels[levelId];
      },

      resetProgress: () => {
        set(initialProgress);
      },
    }),
    {
      name: 'survey-progress-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
