import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { WaterArea } from '@/types';

interface WaterProps {
  waterAreas: WaterArea[];
  heightScale: number;
}

export default function Water({ waterAreas, heightScale }: WaterProps) {
  return (
    <group>
      {waterAreas.map((area, index) => (
        <WaterMesh key={area.id} area={area} baseHeight={-heightScale * 0.3} index={index} />
      ))}
    </group>
  );
}

function WaterMesh({ area, baseHeight, index }: { area: WaterArea; baseHeight: number; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const pts = area.polygon;
    if (pts.length < 3) return new THREE.PlaneGeometry(0, 0);

    shape.moveTo(pts[0].x, pts[0].z);
    for (let i = 1; i < pts.length; i++) {
      shape.lineTo(pts[i].x, pts[i].z);
    }
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    
    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setY(i, baseHeight);
    }
    geo.computeVertexNormals();

    return geo;
  }, [area, baseHeight]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      const t = clock.getElapsedTime() + index * 0.5;
      materialRef.current.emissiveIntensity = 0.05 + Math.sin(t * 0.8) * 0.03;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} position={[0, 0, 0]}>
      <meshStandardMaterial
        ref={materialRef}
        color="#3a7ca5"
        transparent
        opacity={0.8}
        roughness={0.1}
        metalness={0.3}
        emissive="#1a4a6a"
        emissiveIntensity={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
