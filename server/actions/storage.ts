'use server';

import { storage } from '@/lib/storage';
import type { ActionResult } from './profile';

export async function uploadReceiptAction(
  formData: FormData,
): Promise<ActionResult & { path?: string }> {
  const file = formData.get('file');
  if (!(file instanceof File)) return { error: 'Fichier manquant' };
  return storage.uploadReceipt(file);
}

export async function uploadVehiclePhotoAction(
  formData: FormData,
): Promise<ActionResult & { path?: string }> {
  const file = formData.get('file');
  if (!(file instanceof File)) return { error: 'Fichier manquant' };
  return storage.uploadVehiclePhoto(file);
}

export async function uploadAvatarAction(
  formData: FormData,
): Promise<ActionResult & { path?: string }> {
  const file = formData.get('file');
  if (!(file instanceof File)) return { error: 'Fichier manquant' };
  return storage.uploadAvatar(file);
}
