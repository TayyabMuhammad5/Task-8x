export interface AIModel {
  id: string;
  name: string;
  type: 'video' | 'image';
  creditCost: number;
  badge?: 'TOP' | 'NEW';
}

export const AI_MODELS: AIModel[] = [
  { id: 'seedance-2.5', name: 'Seedance 2.5', type: 'video', creditCost: 45, badge: 'TOP' },
  { id: 'kling-3.0', name: 'Kling 3.0', type: 'video', creditCost: 60 },
  { id: 'sora-2', name: 'Sora 2', type: 'video', creditCost: 80 },
  { id: 'veo-3.1', name: 'Veo 3.1', type: 'video', creditCost: 70, badge: 'NEW' },
  { id: 'wan', name: 'Wan', type: 'video', creditCost: 35 },
  { id: 'gpt-image-2', name: 'GPT Image 2', type: 'image', creditCost: 7 },
  { id: 'nano-banana-pro', name: 'Nano Banana Pro', type: 'image', creditCost: 5 },
  { id: 'dall-e-3', name: 'DALL·E 3', type: 'image', creditCost: 10, badge: 'NEW' },
];

export const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4'] as const;
export type AspectRatio = typeof ASPECT_RATIOS[number];

export const DEFAULT_CREDITS = 50;

/** Placeholder video URLs — public domain / free stock */
export const PLACEHOLDER_VIDEOS = [
  'https://www.w3schools.com/html/mov_bbb.mp4',
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
  'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
];
