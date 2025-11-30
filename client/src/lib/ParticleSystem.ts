import * as THREE from 'three';

export interface ParticleSystemConfig {
  particleCount: number;
  particleSize: number;
  particleColor: THREE.Color;
  particleShape: 'sphere' | 'heart' | 'flower' | 'firework' | 'nebula';
  bloomIntensity: number;
}

export class ParticleSystem {
  private scene: THREE.Scene;
  private particles: THREE.Points | null = null;
  private particleGeometry: THREE.BufferGeometry | null = null;
  private particleMaterial: THREE.PointsMaterial | null = null;
  private config: ParticleSystemConfig;
  private targetScale = 1;
  private currentScale = 1;
  private targetRotation = 0;
  private currentRotation = 0;
  private positions: Float32Array | null = null;
  private velocities: Float32Array | null = null;

  constructor(scene: THREE.Scene, config: ParticleSystemConfig) {
    this.scene = scene;
    this.config = config;
    this.initializeParticles();
  }

  private initializeParticles(): void {
    // 创建粒子几何体
    this.particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.config.particleCount * 3);
    this.velocities = new Float32Array(this.config.particleCount * 3);

    // 根据形状生成粒子位置
    this.generateParticleShape(positions);

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.positions = positions;

    // 创建粒子材质
    this.particleMaterial = new THREE.PointsMaterial({
      color: this.config.particleColor,
      size: this.config.particleSize,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      fog: false,
    });

    // 创建粒子系统
    this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particles);
  }

  private generateParticleShape(positions: Float32Array): void {
    const count = this.config.particleCount;
    const shape = this.config.particleShape;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      switch (shape) {
        case 'sphere':
          this.generateSphereParticle(positions, i3, count);
          break;
        case 'heart':
          this.generateHeartParticle(positions, i3, count);
          break;
        case 'flower':
          this.generateFlowerParticle(positions, i3, count);
          break;
        case 'firework':
          this.generateFireworkParticle(positions, i3, count);
          break;
        case 'nebula':
          this.generateNebulaParticle(positions, i3, count);
          break;
        default:
          this.generateSphereParticle(positions, i3, count);
      }
    }
  }

  private generateSphereParticle(positions: Float32Array, index: number, total: number): void {
    const phi = Math.acos(-1 + (2 * index) / total);
    const theta = Math.sqrt(total * Math.PI) * phi;
    const radius = 3;

    positions[index] = radius * Math.cos(theta) * Math.sin(phi);
    positions[index + 1] = radius * Math.sin(theta) * Math.sin(phi);
    positions[index + 2] = radius * Math.cos(phi);
  }

  private generateHeartParticle(positions: Float32Array, index: number, total: number): void {
    const t = (index / total) * Math.PI * 2;
    const scale = 2;

    // 心形参数方程
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    positions[index] = (x / 16) * scale;
    positions[index + 1] = (y / 16) * scale;
    positions[index + 2] = (Math.random() - 0.5) * 0.5;
  }

  private generateFlowerParticle(positions: Float32Array, index: number, total: number): void {
    const t = (index / total) * Math.PI * 2;
    const petals = 6;
    const petalT = t * petals;
    const r = 2 * Math.cos(petalT);

    positions[index] = r * Math.cos(t);
    positions[index + 1] = r * Math.sin(t);
    positions[index + 2] = (Math.random() - 0.5) * 0.3;
  }

  private generateFireworkParticle(positions: Float32Array, index: number, total: number): void {
    const angle = (index / total) * Math.PI * 2;
    const radius = 0.1 + Math.random() * 3;

    positions[index] = radius * Math.cos(angle);
    positions[index + 1] = radius * Math.sin(angle);
    positions[index + 2] = (Math.random() - 0.5) * 2;

    if (this.velocities) {
      this.velocities[index * 3] = Math.cos(angle) * (Math.random() + 0.5);
      this.velocities[index * 3 + 1] = Math.sin(angle) * (Math.random() + 0.5);
      this.velocities[index * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
  }

  private generateNebulaParticle(positions: Float32Array, index: number, total: number): void {
    const x = (Math.random() - 0.5) * 6;
    const y = (Math.random() - 0.5) * 6;
    const z = (Math.random() - 0.5) * 6;

    positions[index] = x;
    positions[index + 1] = y;
    positions[index + 2] = z;
  }

  public setScale(scale: number): void {
    this.targetScale = Math.max(0.5, Math.min(2, scale));
  }

  public setRotation(angle: number): void {
    this.targetRotation = angle;
  }

  public setColor(color: THREE.Color): void {
    if (this.particleMaterial) {
      this.particleMaterial.color = color;
    }
  }

  public setParticleShape(shape: 'sphere' | 'heart' | 'flower' | 'firework' | 'nebula'): void {
    if (this.config.particleShape !== shape) {
      this.config.particleShape = shape;
      if (this.positions) {
        this.generateParticleShape(this.positions);
        if (this.particleGeometry) {
          this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
          this.particleGeometry.attributes.position.needsUpdate = true;
        }
      }
    }
  }

  public setParticleCount(count: number): void {
    if (this.config.particleCount !== count) {
      this.config.particleCount = count;
      this.scene.remove(this.particles!);
      this.initializeParticles();
    }
  }

  public update(deltaTime: number): void {
    // 平滑缩放过渡
    this.currentScale += (this.targetScale - this.currentScale) * 0.1;

    // 平滑旋转过渡
    const rotationDiff = this.targetRotation - this.currentRotation;
    this.currentRotation += rotationDiff * 0.1;

    if (this.particles) {
      this.particles.scale.set(this.currentScale, this.currentScale, this.currentScale);
      this.particles.rotation.z = this.currentRotation;

      // 更新粒子位置（用于烟花效果）
      if (this.config.particleShape === 'firework' && this.positions && this.velocities) {
        const positions = this.positions;
        for (let i = 0; i < this.config.particleCount; i++) {
          const i3 = i * 3;
          positions[i3] += this.velocities[i3] * deltaTime;
          positions[i3 + 1] += this.velocities[i3 + 1] * deltaTime;
          positions[i3 + 2] += this.velocities[i3 + 2] * deltaTime;

          // 重力效果
          this.velocities[i3 + 2] -= 0.5 * deltaTime;
        }
        if (this.particleGeometry) {
          this.particleGeometry.attributes.position.needsUpdate = true;
        }
      }
    }
  }

  public dispose(): void {
    if (this.particles) {
      this.scene.remove(this.particles);
    }
    if (this.particleGeometry) {
      this.particleGeometry.dispose();
    }
    if (this.particleMaterial) {
      this.particleMaterial.dispose();
    }
  }
}
