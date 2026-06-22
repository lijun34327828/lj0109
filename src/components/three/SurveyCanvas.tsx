import { useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import Terrain, { getTerrainHeight } from './Terrain';
import Water from './Water';
import PlotBoundary from './PlotBoundary';
import { useSurveySceneStore } from '@/store/useSurveySceneStore';
import type { Level, Vertex3D } from '@/types';

interface SurveyCanvasProps {
  level: Level;
}

export default function SurveyCanvas({ level }: SurveyCanvasProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, level.heightScale * 3 + 15, level.size.depth * 0.9], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: 'linear-gradient(to bottom, #1a2a3a 0%, #2a4a3a 100%)' }}
    >
      <SceneContent level={level} />
    </Canvas>
  );
}

function SceneContent({ level }: SurveyCanvasProps) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    camera.position.set(0, level.heightScale * 3 + 15, level.size.depth * 0.9);
    camera.lookAt(0, 0, 0);
  }, [level, camera]);

  return (
    <>
      <Sky sunPosition={[100, 50, 100]} turbidity={0.5} rayleigh={0.5} />
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={0.5} />
      <fog attach="fog" args={['#1a2a3a', 30, 80]} />

      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#88aacc', '#446644', 0.4]} />
      <directionalLight
        position={[20, 40, 20]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      <group name="terrain-surface">
        <TerrainWithPicker level={level} />
      </group>
      
      <Water waterAreas={level.waterAreas} heightScale={level.heightScale} />

      <PlotsLayer level={level} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={60}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, 0, 0]}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={0.4} />
      </EffectComposer>
    </>
  );
}

function TerrainWithPicker({ level }: { level: Level }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const toolMode = useSurveySceneStore(s => s.toolMode);
  const addVertex = useSurveySceneStore(s => s.addVertex);
  const { scene } = useThree();

  const handleClick = (e: any) => {
    if (toolMode !== 'draw') return;
    e.stopPropagation();

    const height = getTerrainHeight(
      e.point.x,
      e.point.z,
      level.heightSeed,
      level.heightScale,
      level.terrainType
    );

    const vertex: Vertex3D = {
      x: e.point.x,
      y: height,
      z: e.point.z,
    };

    addVertex(vertex);
  };

  return (
    <group>
      <Terrain
        width={level.size.width}
        depth={level.size.depth}
        seed={level.heightSeed}
        heightScale={level.heightScale}
        terrainType={level.terrainType}
      />
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, level.heightScale * 0.1, 0]}
        onClick={handleClick}
        visible={false}
      >
        <planeGeometry args={[level.size.width * 1.5, level.size.depth * 1.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

function PlotsLayer({ level }: { level: Level }) {
  const plots = useSurveySceneStore(s => s.plots);
  const activePlotId = useSurveySceneStore(s => s.activePlotId);
  const selectPlot = useSurveySceneStore(s => s.selectPlot);
  const updateVertex = useSurveySceneStore(s => s.updateVertex);
  const setSelectedVertex = useSurveySceneStore(s => s.setSelectedVertex);
  const toolMode = useSurveySceneStore(s => s.toolMode);
  const deletePlot = useSurveySceneStore(s => s.deletePlot);

  const handlePlotClick = (plotId: string) => {
    if (toolMode === 'delete') {
      deletePlot(plotId);
    } else {
      selectPlot(plotId);
    }
  };

  const handleVertexClick = (plotId: string, index: number) => {
    selectPlot(plotId);
    setSelectedVertex(index);
  };

  const handleVertexDrag = (plotId: string, index: number, position: Vertex3D) => {
    selectPlot(plotId);
    updateVertex(index, position);
  };

  return (
    <group>
      {plots.map(plot => (
        <group key={plot.id} onClick={() => handlePlotClick(plot.id)}>
          <PlotBoundary
            plot={plot}
            isActive={plot.id === activePlotId}
            onVertexClick={(index) => handleVertexClick(plot.id, index)}
            onVertexDrag={(index, pos) => handleVertexDrag(plot.id, index, pos)}
          />
        </group>
      ))}
    </group>
  );
}
