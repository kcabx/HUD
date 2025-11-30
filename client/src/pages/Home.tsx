import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeRenderer } from '@/lib/ThreeRenderer';
import { GestureRecognizer, GestureData } from '@/lib/GestureRecognizer';
import { ControlPanel } from '@/components/ControlPanel';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const gestureCanvasRef = useRef<HTMLCanvasElement>(null);

  const [threeRenderer, setThreeRenderer] = useState<ThreeRenderer | null>(null);
  const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [particleCount, setParticleCount] = useState(10000);
  const [particleShape, setParticleShape] = useState<'sphere' | 'heart' | 'flower' | 'firework' | 'nebula'>('sphere');
  const [particleColor, setParticleColor] = useState(new THREE.Color(0x00ffff));

  // 初始化 Three.js 和手势识别
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !gestureCanvasRef.current) return;

    const initializeSystem = async () => {
      try {
        // 初始化 Three.js 渲染器
        const renderer = new ThreeRenderer(canvasRef.current!);
        renderer.initializeParticles({
          particleCount,
          particleSize: 0.05,
          particleColor,
          particleShape,
          bloomIntensity: 1,
        });
        renderer.start();
        setThreeRenderer(renderer);

        // 初始化手势识别
        const recognizer = new GestureRecognizer(videoRef.current!, gestureCanvasRef.current!);
        await recognizer.initialize();
        setGestureRecognizer(recognizer);

        // 监听手势变化
        recognizer.onGestureChange((gestureData: GestureData) => {
          updateParticlesFromGesture(gestureData, renderer);
        });
      } catch (error) {
        console.error('初始化失败:', error);
      }
    };

    initializeSystem();

    return () => {
      if (threeRenderer) {
        threeRenderer.dispose();
      }
      if (gestureRecognizer) {
        gestureRecognizer.dispose();
      }
    };
  }, []);

  // 根据手势更新粒子
  const updateParticlesFromGesture = (gestureData: GestureData, renderer: ThreeRenderer) => {
    // 计算缩放因子（基于手距离）
    const scale = 0.5 + gestureData.handDistance * 1.5;

    // 计算旋转角度（基于捏合角度）
    const rotation = (gestureData.pinchAngle * Math.PI) / 180;

    renderer.updateParticles(scale, rotation, particleColor);
  };

  // 处理粒子形状变化
  const handleParticleShapeChange = (shape: 'sphere' | 'heart' | 'flower' | 'firework' | 'nebula') => {
    setParticleShape(shape);
    if (threeRenderer) {
      threeRenderer.setParticleShape(shape);
    }
  };

  // 处理颜色变化
  const handleColorChange = (colorHex: string) => {
    const color = new THREE.Color(colorHex);
    setParticleColor(color);
    if (threeRenderer) {
      threeRenderer.updateParticles(1, 0, color);
    }
  };

  // 处理粒子数量变化
  const handleParticleCountChange = (count: number) => {
    setParticleCount(count);
    if (threeRenderer) {
      threeRenderer.setParticleCount(count);
    }
  };

  // 全屏切换
  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      canvasRef.current?.requestFullscreen().catch((err) => {
        console.error('全屏请求失败:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        console.error('退出全屏失败:', err);
      });
      setIsFullscreen(false);
    }
  };

  return (
    <div className="w-full h-screen bg-background overflow-hidden relative">
      {/* Three.js 画布 */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ display: 'block' }}
      />

      {/* 隐藏的视频元素（用于手势识别） */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
      />

      {/* 手势识别绘制画布 */}
      <canvas
        ref={gestureCanvasRef}
        className={`absolute top-0 left-0 ${isFullscreen ? 'hidden' : 'w-1/4 h-1/4 border border-cyan-500/30'}`}
        style={{
          opacity: isFullscreen ? 0 : 0.7,
        }}
      />

      {/* 控制面板 */}
      {!isFullscreen && (
        <ControlPanel
          onParticleShapeChange={handleParticleShapeChange}
          onColorChange={handleColorChange}
          onParticleCountChange={handleParticleCountChange}
          onFullscreenToggle={handleFullscreenToggle}
          onSettingsToggle={() => {}}
          isFullscreen={isFullscreen}
          particleCount={particleCount}
        />
      )}

      {/* 全屏时的快速控制按钮 */}
      {isFullscreen && (
        <div className="fixed top-8 right-8 z-50 flex gap-4">
          <button
            onClick={handleFullscreenToggle}
            className="glass-card p-4 rounded-full hover:bg-white/20 transition-all duration-300"
            title="退出全屏"
          >
            <span className="text-cyan-400 text-xl">✕</span>
          </button>
        </div>
      )}

      {/* 状态指示器 */}
      <div className="fixed top-8 left-8 z-40 glass-card p-4 rounded-2xl text-sm text-white/70">
        <div className="font-mono">
          <div>粒子数: {particleCount}</div>
          <div>形状: {particleShape}</div>
          <div className="text-cyan-400 mt-2">✓ 手势识别已启动</div>
        </div>
      </div>
    </div>
  );
}
