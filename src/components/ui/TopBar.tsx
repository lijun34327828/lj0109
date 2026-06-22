import { ArrowLeft, Mountain, TreePine, Map, Ruler, Target, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Level } from '@/types';

interface TopBarProps {
  level: Level;
}

const terrainIcons = {
  plain: Map,
  mountain: Mountain,
  forest: TreePine,
};

const terrainLabels = {
  plain: '平原',
  mountain: '山地',
  forest: '林地',
};

export default function TopBar({ level }: TopBarProps) {
  const navigate = useNavigate();
  const TerrainIcon = terrainIcons[level.terrainType];

  return (
    <div className="absolute top-0 left-0 right-0 z-10">
      <div className="glass-panel mx-4 mt-4 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
              bg-survey-secondary/50 hover:bg-survey-secondary text-white/80 hover:text-white
              transition-all duration-200"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">返回</span>
          </button>

          <div className="h-6 w-px bg-survey-accent/20" />

          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg font-bold text-gradient-gold">
                  {level.name}
                </h1>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: level.difficulty }).map((_, i) => (
                    <span key={i} className="text-survey-accent text-sm">★</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-white/50">{level.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-survey-secondary/40">
            <TerrainIcon size={14} className="text-survey-accent" />
            <span className="text-xs text-white/70">{terrainLabels[level.terrainType]}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-survey-secondary/40">
            <Target size={14} className="text-survey-success" />
            <span className="text-xs text-white/70">地块数: {level.targetPlots}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-survey-secondary/40">
            <Ruler size={14} className="text-survey-accent" />
            <span className="text-xs text-white/70">最大面积: {level.maxArea}</span>
          </div>

          {level.waterAreas.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-survey-water/20">
              <Droplets size={14} className="text-survey-water" />
              <span className="text-xs text-white/70">水系: {level.waterAreas.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
