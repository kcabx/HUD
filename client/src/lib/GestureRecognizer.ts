import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export interface GestureData {
  leftHandOpen: boolean;
  rightHandOpen: boolean;
  handDistance: number; // 0-1，表示两手之间的距离
  pinchStrength: number; // 0-1，捏合强度
  pinchAngle: number; // -180 到 180，捏合角度
  handsDetected: number; // 检测到的手数量
  confidence: number; // 检测置信度
}

export class GestureRecognizer {
  private hands: Hands | null = null;
  private camera: Camera | null = null;
  private canvasElement: HTMLCanvasElement;
  private videoElement: HTMLVideoElement;
  private gestureData: GestureData = {
    leftHandOpen: false,
    rightHandOpen: false,
    handDistance: 0,
    pinchStrength: 0,
    pinchAngle: 0,
    handsDetected: 0,
    confidence: 0,
  };
  private isInitialized = false;
  private onGestureUpdate: ((data: GestureData) => void) | null = null;

  constructor(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.hands.onResults(this.onHandsResults.bind(this));

    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        if (this.hands) {
          await this.hands.send({ image: this.videoElement });
        }
      },
      width: 1280,
      height: 720,
    });

    await (this.camera as any).initialize();
    (this.camera as any).start();
    this.isInitialized = true;
  }

  private onHandsResults(results: any): void {
    const ctx = this.canvasElement.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

    // 绘制视频帧
    ctx.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);

    if (results.landmarks && results.landmarks.length > 0) {
      // 处理手势数据
      this.processGestureData(results.landmarks, results.handedness);

      // 绘制手部关键点和连接线
      for (let i = 0; i < results.landmarks.length; i++) {
        drawConnectors(ctx, results.landmarks[i], HAND_CONNECTIONS, {
          color: '#00FFFF',
          lineWidth: 2,
        });
        drawLandmarks(ctx, results.landmarks[i], {
          color: '#FF00FF',
          lineWidth: 1,
          radius: 3,
        });
      }
    }

    // 调用回调函数
    if (this.onGestureUpdate) {
      this.onGestureUpdate(this.gestureData);
    }
  }

  private processGestureData(landmarks: any[], handedness: string[]): void {
    this.gestureData.handsDetected = landmarks.length;
    this.gestureData.confidence = 0.8; // 简化处理

    if (landmarks.length === 0) {
      this.gestureData.leftHandOpen = false;
      this.gestureData.rightHandOpen = false;
      this.gestureData.handDistance = 0;
      this.gestureData.pinchStrength = 0;
      return;
    }

    // 处理单手或双手
    if (landmarks.length === 1) {
      const hand = landmarks[0];
      const isOpen = this.isHandOpen(hand);

      if (handedness[0] === 'Left') {
        this.gestureData.leftHandOpen = isOpen;
        this.gestureData.rightHandOpen = false;
      } else {
        this.gestureData.rightHandOpen = isOpen;
        this.gestureData.leftHandOpen = false;
      }

      this.gestureData.handDistance = 0;
      this.gestureData.pinchStrength = this.calculatePinchStrength(hand);
      this.gestureData.pinchAngle = this.calculatePinchAngle(hand);
    } else if (landmarks.length === 2) {
      // 双手处理
      const leftHand = handedness[0] === 'Left' ? landmarks[0] : landmarks[1];
      const rightHand = handedness[0] === 'Right' ? landmarks[0] : landmarks[1];

      this.gestureData.leftHandOpen = this.isHandOpen(leftHand);
      this.gestureData.rightHandOpen = this.isHandOpen(rightHand);

      // 计算两手之间的距离
      this.gestureData.handDistance = this.calculateHandDistance(leftHand, rightHand);

      // 计算捏合强度（使用右手）
      this.gestureData.pinchStrength = this.calculatePinchStrength(rightHand);
      this.gestureData.pinchAngle = this.calculatePinchAngle(rightHand);
    }
  }

  private isHandOpen(landmarks: any[]): boolean {
    if (landmarks.length < 21) return false;

    const palmBase = landmarks[0];
    const palmMiddle = landmarks[9];
    let openFingers = 0;

    const fingerTips = [4, 8, 12, 16, 20];
    const palmDistance = Math.sqrt(
      Math.pow(palmMiddle.x - palmBase.x, 2) + Math.pow(palmMiddle.y - palmBase.y, 2)
    );

    for (const tipIndex of fingerTips) {
      const tip = landmarks[tipIndex];
      const distance = Math.sqrt(
        Math.pow(tip.x - palmBase.x, 2) + Math.pow(tip.y - palmBase.y, 2)
      );

      if (distance > palmDistance * 1.5) {
        openFingers++;
      }
    }

    return openFingers >= 3;
  }

  private calculatePinchStrength(landmarks: any[]): number {
    // 计算拇指和食指之间的距离
    if (landmarks.length < 9) return 0;

    const thumb = landmarks[4]; // 拇指尖端
    const index = landmarks[8]; // 食指尖端

    const distance = Math.sqrt(
      Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2)
    );

    // 将距离转换为 0-1 的捏合强度
    // 距离越小，捏合强度越大
    return Math.max(0, Math.min(1, 1 - distance * 2));
  }

  private calculatePinchAngle(landmarks: any[]): number {
    // 计算拇指和食指连线的角度
    if (landmarks.length < 9) return 0;

    const thumb = landmarks[4];
    const index = landmarks[8];

    const angle = Math.atan2(index.y - thumb.y, index.x - thumb.x);
    return (angle * 180) / Math.PI;
  }

  private calculateHandDistance(hand1: any[], hand2: any[]): number {
    // 计算两只手掌心之间的距离
    if (hand1.length < 1 || hand2.length < 1) return 0;

    const palm1 = hand1[0];
    const palm2 = hand2[0];

    const distance = Math.sqrt(
      Math.pow(palm1.x - palm2.x, 2) + Math.pow(palm1.y - palm2.y, 2)
    );

    // 将距离标准化到 0-1 范围
    return Math.max(0, Math.min(1, distance));
  }

  public onGestureChange(callback: (data: GestureData) => void): void {
    this.onGestureUpdate = callback;
  }

  public getGestureData(): GestureData {
    return this.gestureData;
  }

  public stop(): void {
    if (this.camera) {
      this.camera.stop();
    }
  }

  public dispose(): void {
    this.stop();
    if (this.hands) {
      this.hands.close();
    }
  }
}
