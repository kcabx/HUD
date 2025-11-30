import React, { useState } from 'react';
import { Volume2, Maximize2, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface ControlPanelProps {
  onParticleShapeChange: (shape: 'sphere' | 'heart' | 'flower' | 'firework' | 'nebula') => void;
  onColorChange: (color: string) => void;
  onParticleCountChange: (count: number) => void;
  onFullscreenToggle: () => void;
  onSettingsToggle: () => void;
  isFullscreen: boolean;
  particleCount: number;
}

const PARTICLE_SHAPES = [
  { id: 'sphere', label: '⚪ 球体', emoji: '⚪' },
  { id: 'heart', label: '❤️ 爱心', emoji: '❤️' },
  { id: 'flower', label: '🌸 花朵', emoji: '🌸' },
  { id: 'firework', label: '🎆 烟花', emoji: '🎆' },
  { id: 'nebula', label: '🌌 星云', emoji: '🌌' },
];

const COLORS = [
  { name: '红色', value: '#ff0080' },
  { name: '紫色', value: '#9000ff' },
  { name: '蓝色', value: '#0080ff' },
  { name: '青色', value: '#00ffff' },
  { name: '金色', value: '#ffcc00' },
  { name: '绿色', value: '#00ff80' },
];

export function ControlPanel({
  onParticleShapeChange,
  onColorChange,
  onParticleCountChange,
  onFullscreenToggle,
  onSettingsToggle,
  isFullscreen,
  particleCount,
}: ControlPanelProps) {
  const [selectedShape, setSelectedShape] = useState<string>('sphere');
  const [selectedColor, setSelectedColor] = useState<string>('#00ffff');
  const [showSettings, setShowSettings] = useState(false);

  const handleShapeChange = (shapeId: string) => {
    setSelectedShape(shapeId);
    onParticleShapeChange(shapeId as any);
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onColorChange(color);
  };

  const handleParticleCountChange = (value: number[]) => {
    onParticleCountChange(value[0]);
  };

  if (isFullscreen && !showSettings) {
    return (
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={() => setShowSettings(true)}
          className="glass-card p-4 rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
          title="显示控制面板"
        >
          <Settings className="w-6 h-6 text-cyan-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="glass-card mx-4 mb-4 p-6 pointer-events-auto max-w-2xl mx-auto">
        {/* 标题 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            粒子效果控制
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onFullscreenToggle}
              className="p-2 rounded-full hover:bg-white/20 transition-all duration-300"
              title="全屏模式"
            >
              <Maximize2 className="w-5 h-5 text-cyan-400" />
            </button>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 rounded-full hover:bg-white/20 transition-all duration-300"
              title="关闭面板"
            >
              <span className="text-cyan-400">✕</span>
            </button>
          </div>
        </div>

        {/* 粒子形状选择 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-white/80 mb-3">粒子形状</label>
          <div className="grid grid-cols-5 gap-2">
            {PARTICLE_SHAPES.map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleShapeChange(shape.id)}
                className={`p-3 rounded-2xl transition-all duration-300 font-semibold text-sm ${
                  selectedShape === shape.id
                    ? 'bg-gradient-to-r from-magenta-500 to-cyan-500 text-white scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <div className="text-lg mb-1">{shape.emoji}</div>
                <div className="text-xs">{shape.label.split(' ')[1]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 颜色选择 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-white/80 mb-3">粒子颜色</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className={`w-10 h-10 rounded-full transition-all duration-300 border-2 ${
                  selectedColor === color.value
                    ? 'border-white scale-110'
                    : 'border-white/30 hover:border-white/60'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* 粒子数量调整 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-semibold text-white/80">粒子数量</label>
            <span className="text-sm text-cyan-400 font-mono">{particleCount}</span>
          </div>
          <Slider
            value={[particleCount]}
            onValueChange={handleParticleCountChange}
            min={1000}
            max={50000}
            step={1000}
            className="w-full"
          />
        </div>

        {/* 手势提示 */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-start gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400 mt-1 flex-shrink-0" />
            <div className="text-xs text-white/60">
              <p className="font-semibold text-white/80 mb-1">手势控制：</p>
              <p>👐 张开双手 → 粒子扩散</p>
              <p>👊 合拢双手 → 粒子聚拢</p>
              <p>✌️ 捏合手指 → 旋转粒子</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
