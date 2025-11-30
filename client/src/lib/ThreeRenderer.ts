import * as THREE from 'three';
import { ParticleSystem, ParticleSystemConfig } from './ParticleSystem';

export class ThreeRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particleSystem: ParticleSystem | null = null;
  private animationFrameId: number | null = null;
  private lastTime = Date.now();

  constructor(canvas: HTMLCanvasElement) {
    // 初始化场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a);
    this.scene.fog = new THREE.Fog(0x0a0a1a, 100, 1000);

    // 初始化相机
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 10;

    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 添加灯光
    this.setupLighting();

    // 处理窗口缩放
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private setupLighting(): void {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // 点光源 - 红色
    const redLight = new THREE.PointLight(0xff0080, 1, 100);
    redLight.position.set(10, 10, 10);
    this.scene.add(redLight);

    // 点光源 - 青色
    const cyanLight = new THREE.PointLight(0x00ffff, 1, 100);
    cyanLight.position.set(-10, -10, 10);
    this.scene.add(cyanLight);

    // 点光源 - 紫色
    const purpleLight = new THREE.PointLight(0x9000ff, 0.8, 100);
    purpleLight.position.set(0, 10, -10);
    this.scene.add(purpleLight);
  }

  public initializeParticles(config: ParticleSystemConfig): void {
    if (this.particleSystem) {
      this.particleSystem.dispose();
    }

    this.particleSystem = new ParticleSystem(this.scene, config);
  }

  public updateParticles(
    scale: number,
    rotation: number,
    color?: THREE.Color
  ): void {
    if (!this.particleSystem) return;

    this.particleSystem.setScale(scale);
    this.particleSystem.setRotation(rotation);

    if (color) {
      this.particleSystem.setColor(color);
    }
  }

  public setParticleShape(shape: 'sphere' | 'heart' | 'flower' | 'firework' | 'nebula'): void {
    if (this.particleSystem) {
      this.particleSystem.setParticleShape(shape);
    }
  }

  public setParticleCount(count: number): void {
    if (this.particleSystem) {
      this.particleSystem.setParticleCount(count);
    }
  }

  public start(): void {
    this.animate();
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const now = Date.now();
    const deltaTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // 更新粒子系统
    if (this.particleSystem) {
      this.particleSystem.update(deltaTime);
    }

    // 旋转场景（可选的背景旋转）
    this.scene.rotation.y += 0.0001;

    // 渲染场景
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize = (): void => {
    const canvas = this.renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public dispose(): void {
    this.stop();

    if (this.particleSystem) {
      this.particleSystem.dispose();
    }

    this.renderer.dispose();
    window.removeEventListener('resize', this.onWindowResize);
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
}
