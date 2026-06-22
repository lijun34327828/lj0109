import * as turf from '@turf/turf';
import type { Vertex3D, Vertex2D, Plot, WaterArea, ValidationResult } from '@/types';

type TurfPolygon = ReturnType<typeof turf.polygon>['geometry'];

function verticesToTurfPolygon(vertices: Vertex3D[]): TurfPolygon | null {
  if (vertices.length < 3) return null;
  const coords = vertices.map(v => [v.x, v.z] as [number, number]);
  coords.push([vertices[0].x, vertices[0].z]);
  return turf.polygon([coords]).geometry;
}

function vertex2DToTurfPolygon(vertices: Vertex2D[]): TurfPolygon | null {
  if (vertices.length < 3) return null;
  const coords = vertices.map(v => [v.x, v.z] as [number, number]);
  coords.push([vertices[0].x, vertices[0].z]);
  return turf.polygon([coords]).geometry;
}

export function calculateArea(vertices: Vertex3D[]): number {
  const polygon = verticesToTurfPolygon(vertices);
  if (!polygon) return 0;
  return turf.area(turf.feature(polygon));
}

export function isClosed(vertices: Vertex3D[], tolerance: number = 0.5): boolean {
  if (vertices.length < 3) return false;
  const first = vertices[0];
  const last = vertices[vertices.length - 1];
  const dist = Math.sqrt(
    Math.pow(first.x - last.x, 2) + Math.pow(first.z - last.z, 2)
  );
  return dist < tolerance;
}

export function checkWaterCrossing(
  vertices: Vertex3D[],
  waterAreas: WaterArea[]
): boolean {
  if (vertices.length < 2) return false;

  const plotPolygon = verticesToTurfPolygon(vertices);
  if (!plotPolygon) return false;
  const plotFeature = turf.feature(plotPolygon);

  for (const water of waterAreas) {
    const waterPolygon = vertex2DToTurfPolygon(water.polygon);
    if (!waterPolygon) continue;
    const waterFeature = turf.feature(waterPolygon);
    
    const intersection = turf.intersect(
      turf.featureCollection([plotFeature, waterFeature])
    );
    if (intersection) {
      return true;
    }
  }
  return false;
}

export function checkPlotOverlap(plot: Plot, allPlots: Plot[]): boolean {
  if (plot.vertices.length < 3) return false;

  const plotPolygon = verticesToTurfPolygon(plot.vertices);
  if (!plotPolygon) return false;
  const plotFeature = turf.feature(plotPolygon);

  for (const other of allPlots) {
    if (other.id === plot.id) continue;
    if (other.vertices.length < 3) continue;

    const otherPolygon = verticesToTurfPolygon(other.vertices);
    if (!otherPolygon) continue;
    const otherFeature = turf.feature(otherPolygon);

    const intersection = turf.intersect(
      turf.featureCollection([plotFeature, otherFeature])
    );
    if (intersection) {
      const interArea = turf.area(intersection);
      if (interArea > 0.1) {
        return true;
      }
    }
  }
  return false;
}

export function validatePlot(
  plot: Plot,
  maxArea: number,
  waterAreas: WaterArea[],
  allPlots: Plot[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const closed = isClosed(plot.vertices);
  if (!closed) {
    errors.push('地块边界未闭合');
  }

  const area = calculateArea(plot.vertices);
  if (area > maxArea) {
    errors.push(`地块面积 ${area.toFixed(1)} 超过最大限制 ${maxArea}`);
  } else if (area > 0 && area < maxArea * 0.3) {
    warnings.push('地块面积较小，建议充分利用空间');
  }

  const crossesWater = checkWaterCrossing(plot.vertices, waterAreas);
  if (crossesWater) {
    errors.push('地块边界穿越水系区域');
  }

  const hasOverlap = checkPlotOverlap(plot, allPlots);
  if (hasOverlap) {
    errors.push('地块与其他地块存在重叠');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateAllPlots(
  plots: Plot[],
  targetPlots: number,
  maxArea: number,
  waterAreas: WaterArea[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (plots.length < targetPlots) {
    errors.push(`需要完成 ${targetPlots} 个地块划分，当前仅有 ${plots.length} 个`);
  } else if (plots.length > targetPlots) {
    warnings.push(`地块数量 ${plots.length} 超过目标 ${targetPlots} 个`);
  }

  for (const plot of plots) {
    const result = validatePlot(plot, maxArea, waterAreas, plots);
    errors.push(...result.errors.map(e => `[${plot.id.slice(-4)}] ${e}`));
    warnings.push(...result.warnings.map(w => `[${plot.id.slice(-4)}] ${w}`));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function calculateStars(
  plots: Plot[],
  targetPlots: number,
  maxArea: number,
  errorsCount: number
): number {
  if (errorsCount > 0) return 0;
  
  let stars = 1;
  
  const validCount = plots.filter(p => p.isClosed).length;
  if (validCount >= targetPlots) stars++;
  
  const allEfficient = plots.every(p => p.area >= maxArea * 0.5);
  if (allEfficient && validCount === targetPlots) stars++;
  
  return Math.min(stars, 3);
}
