import { supabase } from './supabase';
import { PLACEHOLDER_VIDEOS, type AspectRatio } from './constants';

export type GenerationMode = 'video' | 'image';
export type GenerationStatus = 'pending' | 'completed' | 'failed';

export interface GenerationResult {
  id: string;
  user_id: string;
  status: GenerationStatus;
  result_url: string | null;
  mode: GenerationMode;
  prompt: string;
  model: string;
  aspect_ratio: string;
  credit_cost: number;
  created_at: string;
}

export interface GenerationConfig {
  model: string;
  aspectRatio: AspectRatio;
}

/** Returns a randomized placeholder URL for videos */
function getPlaceholderUrl(mode: GenerationMode): string {
  // Rotate through placeholder videos
  const idx = Math.floor(Math.random() * PLACEHOLDER_VIDEOS.length);
  return PLACEHOLDER_VIDEOS[idx];
}

export class SupabaseProvider {
  /**
   * Two-phase generation:
   * 1. Deduct credits atomically
   * 2. Insert pending row immediately
   * 3. After mock delay, update to completed with result URL
   */
  async generate(
    prompt: string,
    mode: GenerationMode,
    userId: string,
    config: GenerationConfig
  ): Promise<GenerationResult> {
    // Phase 0: Deduct credits atomically (server-side check)
    const { error: creditError } = await supabase.rpc('deduct_credits', {
      cost: this.getCreditCost(config.model),
    });
    if (creditError) {
      throw new Error(creditError.message.includes('Insufficient')
        ? 'Insufficient credits'
        : creditError.message
      );
    }

    // Phase 1: Insert pending row immediately
    const creditCost = this.getCreditCost(config.model);
    const { data: pendingRow, error: insertError } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        prompt,
        model: config.model,
        mode,
        status: 'pending' as GenerationStatus,
        aspect_ratio: config.aspectRatio,
        credit_cost: creditCost,
      })
      .select()
      .single();

    if (insertError || !pendingRow) {
      throw new Error(insertError?.message ?? 'Failed to create generation');
    }

    // Phase 2: Wait for generation (real for image, mock for video)
    let resultUrl: string;
    try {
      resultUrl = await this.simulateGeneration(mode, prompt);
    } catch (err) {
      // Mark as failed if generation times out or fails
      await supabase
        .from('generations')
        .update({ status: 'failed' as GenerationStatus })
        .eq('id', pendingRow.id);
      throw err;
    }

    const { data: completedRow, error: updateError } = await supabase
      .from('generations')
      .update({
        status: 'completed' as GenerationStatus,
        result_url: resultUrl,
      })
      .eq('id', pendingRow.id)
      .select()
      .single();

    if (updateError || !completedRow) {
      await supabase
        .from('generations')
        .update({ status: 'failed' as GenerationStatus })
        .eq('id', pendingRow.id);
      throw new Error('Failed to save completed generation');
    }

    return completedRow as GenerationResult;
  }

  private getCreditCost(modelId: string): number {
    const costs: Record<string, number> = {
      'seedance-2.5': 45,
      'kling-3.0': 60,
      'sora-2': 80,
      'veo-3.1': 70,
      'wan': 35,
      'gpt-image-2': 7,
      'nano-banana-pro': 5,
      'dall-e-3': 10,
    };
    return costs[modelId] ?? 45;
  }

  private simulateGeneration(mode: GenerationMode, prompt: string): Promise<string> {
    if (mode === 'image') {
      const seed = Math.floor(Math.random() * 1000000);
      const url = `https://image.pollinations.ai/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
      
      return new Promise((resolve, reject) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          reject(new Error('Image generation timed out'));
        }, 20000); // 20s timeout
        
        img.onload = () => {
          clearTimeout(timeout);
          resolve(url);
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Image generation failed'));
        };
        
        img.src = url;
      });
    }

    // Video path remains the same mock
    return new Promise((resolve) => {
      const delay = 2000 + Math.random() * 3000; // 2-5 seconds
      setTimeout(() => {
        resolve(getPlaceholderUrl(mode));
      }, delay);
    });
  }
}

/** Fetch all generations for the current user, newest first */
export async function fetchGenerations(): Promise<GenerationResult[]> {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as GenerationResult[];
}

/** Fetch a single generation by ID */
export async function fetchGeneration(id: string): Promise<GenerationResult | null> {
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as GenerationResult;
}

export const provider = new SupabaseProvider();
