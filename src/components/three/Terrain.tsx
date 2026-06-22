import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { SimplexNoise } from '@/utils/noise';
import type { TerrainType } from '@/types';

interface TerrainProps {
  width: number;
  depth: number;
  seed: number;
  heightScale: number;
  terrainType: TerrainType;
}

const TERRAIN_COLORS: Record<TerrainType, { low: string; mid: string; high: string }> = {
  plain: { low: '#5a8a4a', mid: '#6a9a5a', high: '#7aaa6a' },
  mountain: { low: '#6a5a4a', mid: '#8a7a6a', high: '#aa9a8a' },
  forest: { low: '#2a4a1a', mid: '#3a5a2a', high: '#4a6a3a' },
};

export default function Terrain({ width, depth, seed, heightScale, terrainType }: TerrainProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const segments = 80;

  const { geometry, colors } = useMemo(() => {
    const noise = new SimplexNoise(seed);
    const geo = new THREE.PlaneGeometry(width, depth, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;
    const colorArray = new Float32Array(positions.count * 3);
    const colorScheme = TERRAIN_COLORS[terrainType];
    const lowColor = new THREE.Color(colorScheme.low);
    const midColor = new THREE.Color(colorScheme.mid);
    const highColor = new THREE.Color(colorScheme.high);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      
      let height = 0;
      if (terrainType === 'plain') {
        height = noise.fbm(x * 0.08, z * 0.08, 3) * heightScale;
      } else if (terrainType === 'mountain') {
        height = noise.fbm(x * 0.05, z * 0.05, 5) * heightScale;
        height += Math.abs(noise.noise2D(x * 0.15, z * 0.15)) * heightScale * 0.3;
      } else {
        height = noise.fbm(x * 0.07, z * 0.07, 4) * heightScale;
        height += Math.abs(noise.noise2D(x * 0.2, z * 0.2)) * heightScale * 0.2;
      }
      
      positions.setY(i, height);

      const normalizedHeight = (height + heightScale) / (heightScale * 2);
      let vertexColor: THREE.Color;
      if (normalizedHeight < 0.4) {
        vertexColor = lowColor.clone().lerp(midColor, normalizedHeight / 0.4);
      } else if (normalizedHeight < 0.7) {
        vertexColor = midColor.clone().lerp(highColor, (normalizedHeight - 0.4) / 0.3);
      } else {
        vertexColor = highColor;
      }

      colorArray[i * 3] = vertexColor.r;
      colorArray[i * 3 + 1] = vertexColor.g;
      colorArray[i * 3 + 2] = vertexColor.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    geo.computeVertexNormals();

    return { geometry: geo, colors: colorArray };
  }, [width, depth, seed, heightScale, terrainType]);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.9}
        metalness={0.05}
        flatShading={false}
      />
    </mesh>
  );
}

export function getTerrainHeight(
  x: number,
  z: number,
  seed: number,
  heightScale: number,
  terrainType: TerrainType
): number {
  const noise = new SimplexNoise(seed);
  let height = 0;
  if (terrainType === 'plain') {
    height = noise.fbm(x * 0.08, z * 0.08, 3) * heightScale;
  } else if (terrainType === 'mountain') {
    height = noise.fbm(x * 0.05, z * 0.05, 5) * heightScale;
    height += Math.abs(noise.noise2D(x * 0.15, z * 0.15)) * heightScale * 0.3;
  } else {
    height = noise.fbm(x * 0.07, z * 0.07, 4) * heightScale;
    height += Math.abs(noise.noise2D(x * 0.2, z * 0.2)) * heightScale * 0.2;
  }
  return height;
}
