import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LEVELS } from '@/data/levels';
import { useSurveySceneStore } from '@/store/useSurveySceneStore';
import SurveyCanvas from '@/components/three/SurveyCanvas';
import ToolBar from '@/components/ui/ToolBar';
import ValidationPanel from '@/components/ui/ValidationPanel';
import TopBar from '@/components/ui/TopBar';
import ResultModal from '@/components/ui/ResultModal';
import { Compass } from 'lucide-react';

export default function Level() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const currentLevel = useSurveySceneStore(s => s.currentLevel);
  const setLevel = useSurveySceneStore(s => s.setLevel);

  useEffect(() => {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) {
      navigate('/');
      return;
    }
    setLevel(level);
  }, [levelId, navigate, setLevel]);

  if (!currentLevel) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-survey-primary">
        <div className="text-center">
          <Compass size={48} className="text-survey-accent mx-auto mb-4 animate-spin" style={{ animationDuration: '3s' }} />
          <p className="text-white/60">加载场景中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <SurveyCanvas level={currentLevel} />
      <TopBar level={currentLevel} />
      <ToolBar />
      <ValidationPanel level={currentLevel} />
      <ResultModal level={currentLevel} />
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="glass-panel-light rounded-full px-4 py-2 text-xs text-white/60 flex items-center gap-4">
          <span>🖱️ 左键：添加顶点/选中</span>
          <span>🖱️ 拖拽：旋转视角</span>
          <span>🖱️ 滚轮：缩放</span>
        </div>
      </div>
    </div>
  );
}
