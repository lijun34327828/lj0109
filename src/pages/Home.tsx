import { Star, Lock, Mountain, TreePine, Map, Award, Compass, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LEVELS } from '@/data/levels';
import { useUserProgressStore } from '@/store/useUserProgressStore';
import type { Level, TerrainType } from '@/types';

const terrainConfig: Record<TerrainType, { icon: any; label: string; gradient: string; color: string }> = {
  plain: {
    icon: Map,
    label: '平原',
    gradient: 'from-green-700/50 to-green-900/50',
    color: '#5a8a4a',
  },
  mountain: {
    icon: Mountain,
    label: '山地',
    gradient: 'from-amber-700/50 to-stone-900/50',
    color: '#8a7a6a',
  },
  forest: {
    icon: TreePine,
    label: '林地',
    gradient: 'from-emerald-800/50 to-green-950/50',
    color: '#3a5a2a',
  },
};

export default function Home() {
  const navigate = useNavigate();
  const completedLevels = useUserProgressStore(s => s.completedLevels);
  const unlockedTerrains = useUserProgressStore(s => s.unlockedTerrains);
  const totalStars = useUserProgressStore(s => s.totalStars);
  const isLevelUnlocked = useUserProgressStore(s => s.isLevelUnlocked);

  const completedCount = Object.values(completedLevels).filter(l => l.completed).length;

  const handleLevelClick = (level: Level, index: number) => {
    if (!isLevelUnlocked(level.id, index)) return;
    navigate(`/level/${level.id}`);
  };

  return (
    <div className="w-full h-full overflow-auto bg-gradient-to-b from-[#0a1a12] via-[#1a3a2a] to-[#0f2a1a]">
      <div className="min-h-full relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-survey-accent blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-survey-water blur-[100px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-12">
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Compass size={48} className="text-survey-accent" />
              <h1 className="font-serif text-5xl font-bold text-gradient-gold tracking-wider">
                测绘地块划分训练
              </h1>
            </div>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              三维交互训练系统，掌握规范的地块划分技能。
              在复杂地形中练习边界绘制、水系避让与面积控制。
            </p>
          </header>

          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="glass-panel rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-survey-accent mb-2">
                <TrendingUp size={20} />
                <span className="text-sm text-white/60">训练进度</span>
              </div>
              <div className="font-serif text-3xl font-bold text-gradient-gold">
                {completedCount} / {LEVELS.length}
              </div>
              <div className="text-xs text-white/40 mt-1">已完成关卡</div>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-survey-accent mb-2">
                <Star size={20} className="fill-survey-accent" />
                <span className="text-sm text-white/60">获得星数</span>
              </div>
              <div className="font-serif text-3xl font-bold text-gradient-gold">
                {totalStars} / {LEVELS.length * 3}
              </div>
              <div className="text-xs text-white/40 mt-1">总星数</div>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-survey-accent mb-2">
                <Award size={20} />
                <span className="text-sm text-white/60">解锁素材</span>
              </div>
              <div className="font-serif text-3xl font-bold text-gradient-gold">
                {unlockedTerrains.length} / 3
              </div>
              <div className="text-xs text-white/40 mt-1">地形类型</div>
            </div>
          </div>

          <h2 className="font-serif text-xl font-bold text-survey-accent/90 mb-4 flex items-center gap-2">
            <Map size={20} />
            关卡列表
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {LEVELS.map((level, index) => {
              const unlocked = isLevelUnlocked(level.id, index);
              const progress = completedLevels[level.id];
              const terrain = terrainConfig[level.terrainType];
              const TerrainIcon = terrain.icon;
              const terrainUnlocked = unlockedTerrains.includes(level.terrainType);

              return (
                <div
                  key={level.id}
                  onClick={() => handleLevelClick(level, index)}
                  className={`
                    glass-panel rounded-xl overflow-hidden card-glow
                    transition-all duration-300 cursor-pointer
                    ${unlocked ? 'hover:-translate-y-1 hover:shadow-survey-accent/20' : 'opacity-60 cursor-not-allowed'}
                  `}
                >
                  <div className={`h-32 bg-gradient-to-br ${terrain.gradient} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TerrainIcon size={64} className="text-white/20" />
                    </div>
                    
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="text-center">
                          <Lock size={32} className="text-white/60 mx-auto mb-1" />
                          <span className="text-xs text-white/50">完成上一关解锁</span>
                        </div>
                      </div>
                    )}

                    {!terrainUnlocked && unlocked && (
                      <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/50 text-xs text-survey-warning flex items-center gap-1">
                        <Award size={12} />
                        新素材
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 text-xs text-white/80">
                      <TerrainIcon size={12} style={{ color: terrain.color }} />
                      {terrain.label}
                    </div>

                    <div className="absolute top-2 left-2 flex gap-0.5">
                      {Array.from({ length: level.difficulty }).map((_, i) => (
                        <span key={i} className="text-survey-accent text-sm">★</span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-serif text-lg font-bold text-white mb-1">
                      {level.name}
                    </h3>
                    <p className="text-xs text-white/50 mb-3 line-clamp-2">
                      {level.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <Star
                            key={i}
                            size={18}
                            className={`transition-all ${
                              progress && progress.stars >= i
                                ? 'text-survey-accent fill-survey-accent'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-white/40">
                        目标 {level.targetPlots} 地块
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <footer className="mt-16 text-center text-white/30 text-xs">
            <p>地块边界校验规则 · 专业测绘技能训练系统</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
