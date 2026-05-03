import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';

interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `paintings/${timestamp}-${safeName}`;
    const storageRef = ref(storage, path);

    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);

    return { success: true, url };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error('Image upload error:', error);
    return { success: false, error: message };
  }
};
