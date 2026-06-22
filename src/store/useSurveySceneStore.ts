import { create } from 'zustand';
import type { Plot, Vertex3D, ToolMode, Level, ValidationResult } from '@/types';
import { PLOT_COLORS } from '@/data/levels';
import {
  calculateArea,
  isClosed,
  checkWaterCrossing,
  checkPlotOverlap,
  validateAllPlots,
} from '@/utils/validation';

interface SurveySceneState {
  currentLevel: Level | null;
  plots: Plot[];
  activePlotId: string | null;
  toolMode: ToolMode;
  selectedVertexIndex: number | null;
  validationResult: ValidationResult | null;
  showResultModal: boolean;
  earnedStars: number;

  setLevel: (level: Level) => void;
  setToolMode: (mode: ToolMode) => void;
  resetScene: () => void;

  createNewPlot: () => void;
  addVertex: (vertex: Vertex3D) => void;
  updateVertex: (index: number, vertex: Vertex3D) => void;
  removeVertex: (index: number) => void;
  closePlot: () => void;
  selectPlot: (plotId: string | null) => void;
  deletePlot: (plotId: string) => void;
  setSelectedVertex: (index: number | null) => void;

  validateCurrentScene: () => ValidationResult;
  submitLevel: () => number;
  closeResultModal: () => void;
}

function generatePlotId(): string {
  return `plot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useSurveySceneStore = create<SurveySceneState>((set, get) => ({
  currentLevel: null,
  plots: [],
  activePlotId: null,
  toolMode: 'draw',
  selectedVertexIndex: null,
  validationResult: null,
  showResultModal: false,
  earnedStars: 0,

  setLevel: (level: Level) => {
    set({
      currentLevel: level,
      plots: [],
      activePlotId: null,
      toolMode: 'draw',
      selectedVertexIndex: null,
      validationResult: null,
      showResultModal: false,
      earnedStars: 0,
    });
  },

  setToolMode: (mode: ToolMode) => {
    set({ toolMode: mode, selectedVertexIndex: null });
  },

  resetScene: () => {
    set({
      plots: [],
      activePlotId: null,
      toolMode: 'draw',
      selectedVertexIndex: null,
      validationResult: null,
    });
  },

  createNewPlot: () => {
    const state = get();
    const colorIndex = state.plots.length % PLOT_COLORS.length;
    const newPlot: Plot = {
      id: generatePlotId(),
      vertices: [],
      isClosed: false,
      area: 0,
      validation: {
        closed: false,
        areaValid: true,
        noWaterCrossing: true,
        noOverlap: true,
      },
      color: PLOT_COLORS[colorIndex],
    };
    set({
      plots: [...state.plots, newPlot],
      activePlotId: newPlot.id,
      toolMode: 'draw',
      selectedVertexIndex: null,
    });
  },

  addVertex: (vertex: Vertex3D) => {
    const state = get();
    let activePlotId = state.activePlotId;

    if (!activePlotId || state.plots.find(p => p.id === activePlotId)?.isClosed) {
      const colorIndex = state.plots.length % PLOT_COLORS.length;
      const newPlot: Plot = {
        id: generatePlotId(),
        vertices: [],
        isClosed: false,
        area: 0,
        validation: {
          closed: false,
          areaValid: true,
          noWaterCrossing: true,
          noOverlap: true,
        },
        color: PLOT_COLORS[colorIndex],
      };
      set({
        plots: [...state.plots, newPlot],
        activePlotId: newPlot.id,
      });
      activePlotId = newPlot.id;
    }

    set(prevState => ({
      plots: prevState.plots.map(p => {
        if (p.id !== activePlotId || p.isClosed) return p;
        const newVertices = [...p.vertices, vertex];
        return {
          ...p,
          vertices: newVertices,
        };
      }),
      selectedVertexIndex: null,
    }));
  },

  updateVertex: (index: number, vertex: Vertex3D) => {
    const state = get();
    const activePlotId = state.activePlotId;
    if (!activePlotId) return;

    set(prevState => ({
      plots: prevState.plots.map(p => {
        if (p.id !== activePlotId) return p;
        const newVertices = [...p.vertices];
        newVertices[index] = vertex;
        return { ...p, vertices: newVertices };
      }),
    }));
  },

  removeVertex: (index: number) => {
    const state = get();
    const activePlotId = state.activePlotId;
    if (!activePlotId) return;

    set(prevState => ({
      plots: prevState.plots.map(p => {
        if (p.id !== activePlotId) return p;
        const newVertices = p.vertices.filter((_, i) => i !== index);
        return { ...p, vertices: newVertices, isClosed: false };
      }),
      selectedVertexIndex: null,
    }));
  },

  closePlot: () => {
    const state = get();
    const activePlotId = state.activePlotId;
    const level = state.currentLevel;
    if (!activePlotId || !level) return;

    set(prevState => {
      const newPlots = prevState.plots.map(p => {
        if (p.id !== activePlotId) return p;
        if (p.vertices.length < 3) return p;

        const closed = isClosed(p.vertices);
        const finalVertices = closed ? p.vertices : [...p.vertices, p.vertices[0]];
        const area = calculateArea(finalVertices);
        const crossesWater = checkWaterCrossing(finalVertices, level.waterAreas);
        const hasOverlap = checkPlotOverlap({ ...p, vertices: finalVertices }, prevState.plots);

        return {
          ...p,
          vertices: finalVertices,
          isClosed: true,
          area,
          validation: {
            closed: true,
            areaValid: area <= level.maxArea,
            noWaterCrossing: !crossesWater,
            noOverlap: !hasOverlap,
          },
        };
      });
      return { plots: newPlots, activePlotId: null };
    });
  },

  selectPlot: (plotId: string | null) => {
    set({
      activePlotId: plotId,
      selectedVertexIndex: null,
      toolMode: plotId ? 'edit' : 'draw',
    });
  },

  deletePlot: (plotId: string) => {
    set(prevState => ({
      plots: prevState.plots.filter(p => p.id !== plotId),
      activePlotId: prevState.activePlotId === plotId ? null : prevState.activePlotId,
      selectedVertexIndex: null,
    }));
  },

  setSelectedVertex: (index: number | null) => {
    set({ selectedVertexIndex: index });
  },

  validateCurrentScene: () => {
    const state = get();
    const level = state.currentLevel;
    if (!level) {
      const result: ValidationResult = { valid: false, errors: ['未加载关卡'], warnings: [] };
      set({ validationResult: result });
      return result;
    }

    const result = validateAllPlots(
      state.plots,
      level.targetPlots,
      level.maxArea,
      level.waterAreas
    );
    set({ validationResult: result });
    return result;
  },

  submitLevel: () => {
    const state = get();
    const level = state.currentLevel;
    if (!level) return 0;

    const result = state.validateCurrentScene();
    const errorsCount = result.errors.length;

    let stars = 0;
    if (errorsCount === 0) {
      stars = 1;
      const validCount = state.plots.filter(p => p.isClosed).length;
      if (validCount >= level.targetPlots) stars++;
      const allEfficient = state.plots.every(p => p.area >= level.maxArea * 0.5);
      if (allEfficient && validCount === level.targetPlots) stars++;
      stars = Math.min(stars, 3);
    }

    set({ showResultModal: true, earnedStars: stars });
    return stars;
  },

  closeResultModal: () => {
    set({ showResultModal: false });
  },
}));
