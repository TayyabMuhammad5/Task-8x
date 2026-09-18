export type GenerationMode = 'video' | 'image';
export type GenerationStatus = 'pending' | 'completed' | 'failed';

export interface GenerationResult {
  id: string;
  status: GenerationStatus;
  url?: string;
  mode: GenerationMode;
  prompt: string;
}

export interface GenerationProvider {
  generate(prompt: string, mode: GenerationMode): Promise<GenerationResult>;
}

export class MockProvider implements GenerationProvider {
  async generate(prompt: string, mode: GenerationMode): Promise<GenerationResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Math.random().toString(36).substring(7),
          status: 'completed',
          mode,
          prompt,
          url: mode === 'video' 
            ? 'https://www.w3schools.com/html/mov_bbb.mp4' // placeholder video
            : 'https://picsum.photos/800/600' // placeholder image
        });
      }, 3000); // 3 second mock delay
    });
  }
}

export const provider = new MockProvider();
