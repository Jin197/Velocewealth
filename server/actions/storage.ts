'use server';

import { storage } from '@/lib/storage';
import { isSupabaseConfigured } from '@/lib/env';
import type { ActionResult } from './profile';

const NOT_CONFIGURED: ActionResult = {
  error: 'Backend non configuré. Voir ONBOARDING.md.',
};

export async function uploadReceiptAction(
  formData: FormData,
): Promise<ActionResult & { path?: string }> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const file = formData.get('file');
  if (!(file instanceof File)) return { error: 'Fichier manquant' };
  return storage.uploadReceipt(file);
}

export async function uploadVehiclePhotoAction(
  formData: FormData,
): Promise<ActionResult & { path?: string }> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const file = formData.get('file');
  if (!(file instanceof File)) return { error: 'Fichier manquant' };
  return storage.uploadVehiclePhoto(file);
}

export async function uploadAvatarAction(
  formData: FormData,
): Promise<ActionResult & { path?: string }> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const file = formData.get('file');
  if (!(file instanceof File)) return { error: 'Fichier manquant' };
  return storage.uploadAvatar(file);
}
