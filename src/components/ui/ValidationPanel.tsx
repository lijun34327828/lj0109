import { CheckCircle, XCircle, AlertTriangle, Info, Droplets, Ruler, Layers, Copy } from 'lucide-react';
import { useSurveySceneStore } from '@/store/useSurveySceneStore';
import type { Level } from '@/types';

interface ValidationPanelProps {
  level: Level;
}

export default function ValidationPanel({ level }: ValidationPanelProps) {
  const plots = useSurveySceneStore(s => s.plots);
  const activePlotId = useSurveySceneStore(s => s.activePlotId);
  const validateCurrentScene = useSurveySceneStore(s => s.validateCurrentScene);
  const submitLevel = useSurveySceneStore(s => s.submitLevel);
  const validationResult = useSurveySceneStore(s => s.validationResult);

  const activePlot = plots.find(p => p.id === activePlotId);
  const completedPlots = plots.filter(p => p.isClosed);

  const handleValidate = () => {
    validateCurrentScene();
  };

  const handleSubmit = () => {
    submitLevel();
  };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-72">
      <div className="glass-panel rounded-xl p-4 shadow-2xl">
        <h3 className="font-serif text-lg font-bold text-gradient-gold mb-3 flex items-center gap-2">
          <Info size={18} />
          校验状态
        </h3>

        <div className="space-y-3">
          <div className="glass-panel-light rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/70 flex items-center gap-1.5">
                <Layers size={14} />
                地块进度
              </span>
              <span className="text-sm font-semibold text-survey-accent">
                {completedPlots.length} / {level.targetPlots}
              </span>
            </div>
            <div className="w-full h-2 bg-survey-primary/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-survey-success to-survey-accent rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (completedPlots.length / level.targetPlots) * 100)}%` }}
              />
            </div>
          </div>

          {activePlot && (
            <div className="glass-panel-light rounded-lg p-3 space-y-2">
              <div className="text-sm font-medium text-survey-accent flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: activePlot.color }}
                />
                当前地块
              </div>
              
              <ValidationItem
                icon={<CheckCircle size={14} />}
                label="边界闭合"
                valid={activePlot.validation.closed}
                active={activePlot.vertices.length > 0}
              />
              
              <ValidationItem
                icon={<Ruler size={14} />}
                label={`面积: ${activePlot.area.toFixed(1)} / ${level.maxArea}`}
                valid={activePlot.validation.areaValid}
                active={activePlot.area > 0}
              />
              
              <ValidationItem
                icon={<Droplets size={14} />}
                label="未穿越水系"
                valid={activePlot.validation.noWaterCrossing}
                active={activePlot.vertices.length >= 3}
              />
              
              <ValidationItem
                icon={<Copy size={14} />}
                label="无边界重叠"
                valid={activePlot.validation.noOverlap}
                active={plots.length > 1}
              />
            </div>
          )}

          {!activePlot && plots.length === 0 && (
            <div className="glass-panel-light rounded-lg p-3 text-center text-white/50 text-sm">
              点击左侧"新建"或直接在地形上点击开始绘制
            </div>
          )}

          {validationResult && (
            <div className={`rounded-lg p-3 space-y-1.5 ${
              validationResult.valid 
                ? 'bg-survey-success/20 border border-survey-success/30' 
                : 'bg-survey-error/20 border border-survey-error/30'
            }`}>
              <div className="flex items-center gap-2 font-medium">
                {validationResult.valid ? (
                  <><CheckCircle size={16} className="text-survey-success" /> 校验通过</>
                ) : (
                  <><XCircle size={16} className="text-survey-error" /> 校验失败</>
                )}
              </div>
              {validationResult.errors.map((err, i) => (
                <div key={i} className="text-xs text-survey-error/90 flex items-start gap-1 pl-6">
                  <span className="mt-0.5">•</span>
                  <span>{err}</span>
                </div>
              ))}
              {validationResult.warnings.map((warn, i) => (
                <div key={i} className="text-xs text-survey-warning/90 flex items-start gap-1 pl-6">
                  <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={handleValidate}
            className="btn-survey w-full flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            运行校验
          </button>
          <button
            onClick={handleSubmit}
            className="btn-survey-primary w-full flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            提交关卡
          </button>
        </div>
      </div>
    </div>
  );
}

function ValidationItem({ 
  icon, 
  label, 
  valid, 
  active 
}: { 
  icon: React.ReactNode; 
  label: string; 
  valid: boolean; 
  active: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 text-xs ${
      active ? (valid ? 'text-survey-success' : 'text-survey-error') : 'text-white/30'
    }`}>
      {icon}
      <span className="flex-1">{label}</span>
      {active && (
        valid 
          ? <CheckCircle size={12} /> 
          : <XCircle size={12} />
      )}
    </div>
  );
}
