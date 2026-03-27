import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { app } from "@/lib/firebase/config";

const storage = getStorage(app);

export async function uploadCustomSound(
  userId: string,
  soundId: string,
  blob: Blob,
  mimeType: string
): Promise<string> {
  const ext = mimeType.includes("mp4") ? "mp4" : "webm";
  const storageRef = ref(storage, `users/${userId}/sounds/${soundId}.${ext}`);
  await uploadBytes(storageRef, blob, { contentType: mimeType });
  return getDownloadURL(storageRef);
}

export async function deleteCustomSound(
  userId: string,
  soundId: string
): Promise<void> {
  // Try both extensions — we don't know which was used at upload time
  for (const ext of ["webm", "mp4"]) {
    try {
      const storageRef = ref(
        storage,
        `users/${userId}/sounds/${soundId}.${ext}`
      );
      await deleteObject(storageRef);
      return;
    } catch {
      // try next extension
    }
  }
}
