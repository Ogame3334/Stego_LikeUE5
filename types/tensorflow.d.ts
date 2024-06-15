declare module '@tensorflow/tfjs' {
    // @tensorflow/tfjsの型定義を追加（必要に応じて追加）
  }
  
  declare module '@tensorflow-models/posenet' {
    export interface Keypoint {
      score: number;
      part: string;
      position: {
        x: number;
        y: number;
      };
    }
  
    export interface Pose {
      score: number;
      keypoints: Keypoint[];
    }
  
    export interface PoseNet {
      estimateSinglePose(
        imageElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
        config: {
          flipHorizontal: boolean;
        }
      ): Promise<Pose>;
    }
  
    export function load(): Promise<PoseNet>;
  }
  
  declare module '@tensorflow/tfjs-backend-webgl' {
    // @tensorflow/tfjs-backend-webglの型定義を追加（必要に応じて追加）
  }
