import { PenLine, Hand, Trash2, Eye, Plus, Check, RotateCcw } from 'lucide-react';
import { useSurveySceneStore } from '@/store/useSurveySceneStore';
import type { ToolMode } from '@/types';

const tools: { mode: ToolMode; icon: any; label: string }[] = [
  { mode: 'draw', icon: PenLine, label: '绘制' },
  { mode: 'edit', icon: Hand, label: '编辑' },
  { mode: 'delete', icon: Trash2, label: '删除' },
  { mode: 'view', icon: Eye, label: '查看' },
];

export default function ToolBar() {
  const toolMode = useSurveySceneStore(s => s.toolMode);
  const setToolMode = useSurveySceneStore(s => s.setToolMode);
  const createNewPlot = useSurveySceneStore(s => s.createNewPlot);
  const closePlot = useSurveySceneStore(s => s.closePlot);
  const resetScene = useSurveySceneStore(s => s.resetScene);
  const activePlot = useSurveySceneStore(s => 
    s.plots.find(p => p.id === s.activePlotId)
  );
  const canClose = activePlot && !activePlot.isClosed && activePlot.vertices.length >= 3;

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
      <div className="glass-panel rounded-xl p-2 flex flex-col gap-1.5 shadow-2xl">
        {tools.map(tool => {
          const Icon = tool.icon;
          const isActive = toolMode === tool.mode;
          return (
            <button
              key={tool.mode}
              onClick={() => setToolMode(tool.mode)}
              className={`
                w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5
                transition-all duration-200 group
                ${isActive 
                  ? 'bg-survey-accent text-survey-primary shadow-lg shadow-survey-accent/30' 
                  : 'hover:bg-survey-secondary/60 text-survey-accent/80 hover:text-survey-accent'
                }
              `}
              title={tool.label}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{tool.label}</span>
            </button>
          );
        })}

        <div className="w-full h-px bg-survey-accent/20 my-1" />

        <button
          onClick={createNewPlot}
          className="w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5
            transition-all duration-200
            bg-survey-success/20 hover:bg-survey-success text-survey-success hover:text-survey-primary"
          title="新建地块"
        >
          <Plus size={20} />
          <span className="text-[10px] font-medium">新建</span>
        </button>

        <button
          onClick={closePlot}
          disabled={!canClose}
          className={`
            w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5
            transition-all duration-200
            ${canClose 
              ? 'bg-survey-accent/30 hover:bg-survey-accent text-survey-accent hover:text-survey-primary cursor-pointer' 
              : 'bg-survey-secondary/30 text-white/20 cursor-not-allowed'
            }
          `}
          title="闭合地块"
        >
          <Check size={20} />
          <span className="text-[10px] font-medium">闭合</span>
        </button>

        <button
          onClick={resetScene}
          className="w-12 h-12 rounded-lg flex flex-col items-center justify-center gap-0.5
            transition-all duration-200
            bg-survey-error/20 hover:bg-survey-error text-survey-error hover:text-white"
          title="重置场景"
        >
          <RotateCcw size={20} />
          <span className="text-[10px] font-medium">重置</span>
        </button>
      </div>
    </div>
  );
}
