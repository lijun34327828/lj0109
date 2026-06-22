import { Star, X, Home, RotateCcw, ArrowRight, Mountain, TreePine, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSurveySceneStore } from '@/store/useSurveySceneStore';
import { useUserProgressStore } from '@/store/useUserProgressStore';
import { LEVELS } from '@/data/levels';
import type { Level } from '@/types';

interface ResultModalProps {
  level: Level;
}

export default function ResultModal({ level }: ResultModalProps) {
  const navigate = useNavigate();
  const showResultModal = useSurveySceneStore(s => s.showResultModal);
  const earnedStars = useSurveySceneStore(s => s.earnedStars);
  const validationResult = useSurveySceneStore(s => s.validationResult);
  const closeResultModal = useSurveySceneStore(s => s.closeResultModal);
  const resetScene = useSurveySceneStore(s => s.resetScene);
  const setLevel = useSurveySceneStore(s => s.setLevel);

  const completeLevel = useUserProgressStore(s => s.completeLevel);
  const unlockTerrain = useUserProgressStore(s => s.unlockTerrain);

  const currentIndex = LEVELS.findIndex(l => l.id === level.id);
  const nextLevel = currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;

  const newTerrainUnlock: string | null = (() => {
    if (earnedStars >= 2 && level.terrainType === 'plain') return 'mountain';
    if (earnedStars >= 2 && level.terrainType === 'mountain') return 'forest';
    return null;
  })();

  useEffect(() => {
    if (showResultModal && earnedStars > 0) {
      completeLevel(level.id, earnedStars);
      if (newTerrainUnlock) {
        unlockTerrain(newTerrainUnlock as any);
      }
    }
  }, [showResultModal, earnedStars, level.id, completeLevel, unlockTerrain, newTerrainUnlock]);

  if (!showResultModal) return null;

  const isSuccess = earnedStars > 0;

  const handleRetry = () => {
    closeResultModal();
    resetScene();
  };

  const handleNextLevel = () => {
    if (!nextLevel) return;
    closeResultModal();
    setLevel(nextLevel);
  };

  const handleHome = () => {
    closeResultModal();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel rounded-2xl p-8 max-w-md w-full mx-4 card-glow animate-[scaleIn_0.3s_ease-out]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className={`font-serif text-2xl font-bold ${
              isSuccess ? 'text-gradient-gold' : 'text-survey-error'
            }`}>
              {isSuccess ? '关卡完成！' : '校验未通过'}
            </h2>
            <p className="text-white/60 text-sm mt-1">{level.name}</p>
          </div>
          <button
            onClick={closeResultModal}
            className="p-2 rounded-lg hover:bg-survey-secondary/50 text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isSuccess && (
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3].map(i => (
              <Star
                key={i}
                size={48}
                className={`transition-all duration-500 ${
                  i <= earnedStars
                    ? 'text-survey-accent fill-survey-accent drop-shadow-[0_0_12px_rgba(201,169,106,0.6)]'
                    : 'text-white/20'
                }`}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}

        {!isSuccess && validationResult && (
          <div className="bg-survey-error/10 border border-survey-error/30 rounded-xl p-4 mb-6 space-y-2">
            {validationResult.errors.map((err, i) => (
              <div key={i} className="text-sm text-survey-error/90 flex items-start gap-2">
                <span>•</span>
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}

        {newTerrainUnlock && isSuccess && (
          <div className="bg-survey-success/10 border border-survey-success/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-survey-success font-semibold mb-1">
              <Award size={18} />
              解锁新地形素材！
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              {newTerrainUnlock === 'mountain' ? (
                <><Mountain size={16} /> 山地地形已解锁</>
              ) : (
                <><TreePine size={16} /> 林地地形已解锁</>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleRetry}
              className="btn-survey flex-1 flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              重新挑战
            </button>
            {isSuccess && nextLevel && (
              <button
                onClick={handleNextLevel}
                className="btn-survey-primary flex-1 flex items-center justify-center gap-2"
              >
                下一关
                <ArrowRight size={16} />
              </button>
            )}
          </div>
          <button
            onClick={handleHome}
            className="btn-survey w-full flex items-center justify-center gap-2"
          >
            <Home size={16} />
            返回关卡选择
          </button>
        </div>
      </div>
    </div>
  );
}
