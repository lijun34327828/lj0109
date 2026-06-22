export interface Vertex2D {
  x: number;
  z: number;
}

export interface Vertex3D {
  x: number;
  y: number;
  z: number;
}

export interface WaterArea {
  id: string;
  polygon: Vertex2D[];
}

export type TerrainType = 'plain' | 'mountain' | 'forest';

export interface Level {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  terrainType: TerrainType;
  maxArea: number;
  targetPlots: number;
  waterAreas: WaterArea[];
  size: { width: number; depth: number };
  heightSeed: number;
  heightScale: number;
}

export interface PlotValidation {
  closed: boolean;
  areaValid: boolean;
  noWaterCrossing: boolean;
  noOverlap: boolean;
}

export interface Plot {
  id: string;
  vertices: Vertex3D[];
  isClosed: boolean;
  area: number;
  validation: PlotValidation;
  color: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface LevelProgress {
  stars: number;
  completed: boolean;
  bestArea?: number;
}

export interface UserProgress {
  completedLevels: Record<string, LevelProgress>;
  unlockedTerrains: TerrainType[];
  totalStars: number;
}

export type ToolMode = 'draw' | 'edit' | 'delete' | 'view';
