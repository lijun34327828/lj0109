import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import type { Plot, Vertex3D, ToolMode } from '@/types';
import { useSurveySceneStore } from '@/store/useSurveySceneStore';

interface PlotBoundaryProps {
  plot: Plot;
  isActive: boolean;
  onVertexClick: (index: number) => void;
  onVertexDrag: (index: number, position: Vertex3D) => void;
}

export default function PlotBoundary({ plot, isActive, onVertexClick, onVertexDrag }: PlotBoundaryProps) {
  const fillRef = useRef<THREE.Mesh>(null);

  const fillGeometry = useMemo(() => {
    return new THREE.BufferGeometry();
  }, []);

  const linePoints = useMemo(() => {
    return plot.vertices.map(v => [v.x, v.y + 0.15, v.z] as [number, number, number]);
  }, [plot.vertices]);

  useEffect(() => {
    if (!plot.isClosed || plot.vertices.length < 3) {
      fillGeometry.dispose();
      return;
    }

    const shape = new THREE.Shape();
    shape.moveTo(plot.vertices[0].x, plot.vertices[0].z);
    for (let i = 1; i < plot.vertices.length; i++) {
      shape.lineTo(plot.vertices[i].x, plot.vertices[i].z);
    }
    shape.closePath();

    const geo = new THREE.ShapeGeometry(shape);
    geo.rotateX(-Math.PI / 2);
    
    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      positions.setY(i, plot.vertices[0].y + 0.05);
    }
    
    fillGeometry.dispose();
    Object.assign(fillGeometry, geo);
  }, [plot.vertices, plot.isClosed, fillGeometry]);

  const isValid = plot.isClosed && 
    plot.validation.areaValid && 
    plot.validation.noWaterCrossing && 
    plot.validation.noOverlap;

  const lineColor = !plot.isClosed ? plot.color : (isValid ? '#4ac97a' : '#c94a4a');
  const fillOpacity = plot.isClosed ? 0.15 : 0.05;
  const fillColor = isValid ? '#4ac97a' : (plot.isClosed ? '#c94a4a' : plot.color);

  return (
    <group>
      <mesh ref={fillRef} geometry={fillGeometry}>
        <meshStandardMaterial
          color={fillColor}
          transparent
          opacity={fillOpacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {linePoints.length >= 2 && (
        <Line
          points={linePoints}
          color={lineColor}
          lineWidth={isActive ? 3 : 2}
          transparent
          opacity={0.9}
        />
      )}

      {plot.vertices.map((vertex, index) => (
        <VertexPoint
          key={`${plot.id}-${index}`}
          vertex={vertex}
          index={index}
          isActive={isActive}
          plotColor={plot.color}
          onClick={() => onVertexClick(index)}
          onDrag={(pos) => onVertexDrag(index, pos)}
        />
      ))}
    </group>
  );
}

interface VertexPointProps {
  vertex: Vertex3D;
  index: number;
  isActive: boolean;
  plotColor: string;
  onClick: () => void;
  onDrag: (position: Vertex3D) => void;
}

function VertexPoint({ vertex, isActive, plotColor, onClick, onDrag }: VertexPointProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, raycaster, scene } = useThree();
  const toolMode = useSurveySceneStore(s => s.toolMode);
  const selectedVertexIndex = useSurveySceneStore(s => s.selectedVertexIndex);
  const setSelectedVertex = useSurveySceneStore(s => s.setSelectedVertex);
  const activePlotId = useSurveySceneStore(s => s.activePlotId);
  const plots = useSurveySceneStore(s => s.plots);

  const activePlot = plots.find(p => p.id === activePlotId);
  const isSelected = activePlot && selectedVertexIndex !== null && 
    activePlot.vertices[selectedVertexIndex]?.x === vertex.x && 
    activePlot.vertices[selectedVertexIndex]?.z === vertex.z;

  const isDragging = useRef(false);
  const isHovered = useRef(false);

  const handlePointerDown = (e: any) => {
    if (toolMode !== 'edit' && toolMode !== 'delete') return;
    e.stopPropagation();
    isDragging.current = true;
    const idx = findVertexIndex(vertex, activePlotId, plots);
    if (idx >= 0) setSelectedVertex(idx);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onClick();
  };

  const handlePointerMove = (e: any) => {
    if (!isDragging.current || toolMode !== 'edit') return;
    e.stopPropagation();

    raycaster.setFromCamera(e.ndc || e.point, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const terrain = intersects.find(i => 
      i.object.type === 'Mesh' && (i.object as THREE.Mesh).geometry?.type === 'PlaneGeometry'
    );
    if (terrain) {
      onDrag({
        x: terrain.point.x,
        y: terrain.point.y + 0.1,
        z: terrain.point.z,
      });
    }
  };

  const handlePointerUp = (e: any) => {
    isDragging.current = false;
    setSelectedVertex(null);
    if (e.pointerId) {
      try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    }
  };

  const handlePointerOver = () => {
    isHovered.current = true;
    document.body.style.cursor = toolMode === 'edit' ? 'grab' : 'pointer';
  };

  const handlePointerOut = () => {
    isHovered.current = false;
    document.body.style.cursor = 'default';
  };

  useFrame(() => {
    if (!meshRef.current) return;
    const scale = (isHovered.current || isSelected) ? 1.4 : 1;
    meshRef.current.scale.setScalar(scale);
  });

  const color = isSelected ? '#ffffff' : (isActive ? plotColor : '#888888');

  return (
    <mesh
      ref={meshRef}
      position={[vertex.x, vertex.y + 0.25, vertex.z]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[0.18, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isSelected ? 0.6 : 0.3}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  );
}

function findVertexIndex(vertex: Vertex3D, activePlotId: string | null, plots: Plot[]): number {
  if (!activePlotId) return -1;
  const plot = plots.find(p => p.id === activePlotId);
  if (!plot) return -1;
  return plot.vertices.findIndex(v => 
    Math.abs(v.x - vertex.x) < 0.01 && Math.abs(v.z - vertex.z) < 0.01
  );
}
