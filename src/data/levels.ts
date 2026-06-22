import type { Level } from '@/types';

export const LEVELS: Level[] = [
  {
    id: 'level-1',
    name: '入门：平原初探',
    description: '熟悉基本操作，在平坦地形上划分简单地块',
    difficulty: 1,
    terrainType: 'plain',
    maxArea: 150,
    targetPlots: 2,
    waterAreas: [],
    size: { width: 40, depth: 40 },
    heightSeed: 12345,
    heightScale: 0.5,
  },
  {
    id: 'level-2',
    name: '进阶：避让水系',
    description: '学习识别并避让水系，地块边界不可穿越水域',
    difficulty: 2,
    terrainType: 'plain',
    maxArea: 120,
    targetPlots: 3,
    waterAreas: [
      {
        id: 'water-1',
        polygon: [
          { x: -5, z: -8 },
          { x: 5, z: -10 },
          { x: 8, z: 0 },
          { x: 3, z: 8 },
          { x: -6, z: 6 },
          { x: -8, z: -2 },
        ],
      },
    ],
    size: { width: 40, depth: 40 },
    heightSeed: 23456,
    heightScale: 0.8,
  },
  {
    id: 'level-3',
    name: '挑战：丘陵地带',
    description: '解锁山地形素材，在起伏地形上完成精准划分',
    difficulty: 3,
    terrainType: 'mountain',
    maxArea: 100,
    targetPlots: 3,
    waterAreas: [
      {
        id: 'water-1',
        polygon: [
          { x: -12, z: -5 },
          { x: -6, z: -8 },
          { x: -4, z: -2 },
          { x: -8, z: 2 },
        ],
      },
    ],
    size: { width: 40, depth: 40 },
    heightSeed: 34567,
    heightScale: 3,
  },
  {
    id: 'level-4',
    name: '高级：密林地籍',
    description: '解锁林地素材，多水域复杂地形下的地块划分',
    difficulty: 4,
    terrainType: 'forest',
    maxArea: 90,
    targetPlots: 4,
    waterAreas: [
      {
        id: 'water-1',
        polygon: [
          { x: -10, z: -12 },
          { x: -4, z: -14 },
          { x: -2, z: -8 },
          { x: -6, z: -4 },
          { x: -12, z: -6 },
        ],
      },
      {
        id: 'water-2',
        polygon: [
          { x: 6, z: 4 },
          { x: 12, z: 2 },
          { x: 14, z: 8 },
          { x: 8, z: 12 },
          { x: 4, z: 8 },
        ],
      },
    ],
    size: { width: 40, depth: 40 },
    heightSeed: 45678,
    heightScale: 2,
  },
  {
    id: 'level-5',
    name: '大师：综合测绘',
    description: '综合考验所有技能，完成复杂地形的多地块划分',
    difficulty: 5,
    terrainType: 'mountain',
    maxArea: 80,
    targetPlots: 5,
    waterAreas: [
      {
        id: 'water-1',
        polygon: [
          { x: -14, z: -10 },
          { x: -8, z: -12 },
          { x: -6, z: -6 },
          { x: -10, z: -2 },
          { x: -16, z: -4 },
        ],
      },
      {
        id: 'water-2',
        polygon: [
          { x: 2, z: -6 },
          { x: 8, z: -8 },
          { x: 10, z: -2 },
          { x: 4, z: 2 },
        ],
      },
      {
        id: 'water-3',
        polygon: [
          { x: 0, z: 8 },
          { x: 6, z: 6 },
          { x: 8, z: 12 },
          { x: 2, z: 14 },
          { x: -4, z: 10 },
        ],
      },
    ],
    size: { width: 40, depth: 40 },
    heightSeed: 56789,
    heightScale: 3.5,
  },
];

export const PLOT_COLORS = [
  '#c9a96a',
  '#4ac9c9',
  '#c97a4a',
  '#a44ac9',
  '#4a7ac9',
  '#c9c94a',
];
