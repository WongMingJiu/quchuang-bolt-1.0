import type { VercelRequest, VercelResponse } from '@vercel/node';
import { arkFetch, mapModel, serverSupabase } from './_seedance';
import type { GenerationAsset, GenerationMode } from '../src/types';

interface GenerateRequestBody {
  prompt: string;
  mode: GenerationMode;
  model: string;
  aspect_ratio: string;
  duration: number;
  generate_audio: boolean;
  watermark: boolean;
  media_uploads: GenerationAsset[];
}

function buildContent(mode: GenerationMode, prompt: string, uploads: GenerationAsset[]) {
  const content: Array<Record<string, unknown>> = [{ type: 'text', text: prompt }];

  if (mode === 'image-to-video' || mode === 'image-to-video-first-last') {
    uploads
      .filter(item => item.type === 'image')
      .forEach(item => {
        content.push({
          type: 'image_url',
          image_url: { url: item.publicUrl },
          role: item.role === 'first_frame' || item.role === 'last_frame' ? item.role : 'reference_image',
        });
      });
  }

  if (mode === 'omni-reference') {
    uploads.forEach(item => {
      if (item.type === 'image') {
        content.push({
          type: 'image_url',
          image_url: { url: item.publicUrl },
          role: item.role ?? 'reference_image',
        });
      }
      if (item.type === 'video') {
        content.push({
          type: 'video_url',
          video_url: { url: item.publicUrl },
          role: item.role ?? 'reference_video',
        });
      }
      if (item.type === 'audio') {
        content.push({
          type: 'audio_url',
          audio_url: { url: item.publicUrl },
          role: item.role ?? 'reference_audio',
        });
      }
    });
  }

  return content;
}

function validatePayload(body: Partial<GenerateRequestBody>) {
  if (!body.prompt?.trim()) {
    throw new Error('Prompt is required.');
  }

  if (body.mode === 'image-to-video' && (body.media_uploads ?? []).some(item => item.type !== 'image')) {
    throw new Error('Image-to-video only supports image references.');
  }

  if (body.mode === 'image-to-video-first-last') {
    const images = (body.media_uploads ?? []).filter(item => item.type === 'image');
    if (images.length !== 2 || images.length !== (body.media_uploads ?? []).length) {
      throw new Error('Image-to-video-first-last requires exactly 2 images.');
    }
  }

  if (body.mode === 'omni-reference' && (body.media_uploads ?? []).length > 9) {
    throw new Error('Omni-reference supports up to 9 files.');
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as GenerateRequestBody;
    validatePayload(body);

    const payload = {
      model: mapModel(body.model),
      content: buildContent(body.mode, body.prompt, body.media_uploads ?? []),
      generate_audio: body.generate_audio,
      ratio: body.aspect_ratio,
      duration: body.duration,
      watermark: body.watermark ?? false,
    };

    const arkResponse = await arkFetch('/contents/generations/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const { data, error } = await serverSupabase
      .from('generations')
      .insert([
        {
          prompt: body.prompt,
          mode: body.mode,
          model: body.model,
          aspect_ratio: body.aspect_ratio,
          duration: body.duration,
          generate_audio: body.generate_audio,
          watermark: body.watermark ?? false,
          status: 'generating',
          video_url: null,
          thumbnail_url: null,
          is_favorited: false,
          media_uploads: body.media_uploads ?? [],
          provider: 'seedance',
          provider_task_id: arkResponse.id,
          error_message: null,
          completed_at: null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({ generation: data, providerTask: arkResponse });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to create Seedance generation task.',
    });
  }
}
