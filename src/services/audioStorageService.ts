// IndexedDB & Local Storage Service for Offline Islamic Audio Sermons
import { AudioSermon } from '../types';

const DB_NAME = 'AlHikmahAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'audio_blobs';
const LOCAL_CUSTOM_AUDIOS_KEY = 'al_hikmah_custom_uploaded_audios_v1';

// Open or create IndexedDB
function openAudioDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save audio file (Blob, ArrayBuffer, or Data URL) to IndexedDB
 */
export async function saveAudioBlobToIndexedDB(id: string, data: Blob | string): Promise<void> {
  try {
    const db = await openAudioDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.put({ id, data, updatedAt: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save audio to IndexedDB:', err);
  }
}

/**
 * Retrieve audio file from IndexedDB and return as playable URL (Blob URL or Data URL)
 */
export async function getAudioUrlFromIndexedDB(id: string): Promise<string | null> {
  try {
    const db = await openAudioDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => {
        if (!req.result || !req.result.data) {
          resolve(null);
          return;
        }

        const data = req.result.data;
        if (data instanceof Blob) {
          const blobUrl = URL.createObjectURL(data);
          resolve(blobUrl);
        } else if (typeof data === 'string') {
          resolve(data);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to get audio from IndexedDB:', err);
    return null;
  }
}

/**
 * Persist custom uploaded audio metadata list to localStorage
 */
export function saveCustomAudiosMetadata(audios: AudioSermon[]): void {
  try {
    if (typeof window === 'undefined') return;
    const customOnly = audios.filter((a) => a.isCustomUploaded);
    // Sanitize huge data URLs and volatile session blob URLs from metadata storage
    const sanitized = customOnly.map((a) => {
      if (a.audioUrl && (a.audioUrl.startsWith('blob:') || (a.audioUrl.startsWith('data:') && a.audioUrl.length > 50000))) {
        return { ...a, audioUrl: `local-indexeddb://${a.id}` };
      }
      return a;
    });
    localStorage.setItem(LOCAL_CUSTOM_AUDIOS_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn('Could not save custom audios metadata to localStorage:', err);
  }
}

/**
 * Load custom uploaded audios metadata from localStorage and resolve IndexedDB audio streams
 */
export async function loadCustomAudiosWithBlobs(): Promise<AudioSermon[]> {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_CUSTOM_AUDIOS_KEY);
    if (!raw) return [];

    const parsed: AudioSermon[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Resolve any IndexedDB audio streams
    const resolved: AudioSermon[] = await Promise.all(
      parsed.map(async (item) => {
        if (item.audioUrl && (item.audioUrl.startsWith('local-indexeddb://') || item.audioUrl.startsWith('blob:'))) {
          const blobUrl = await getAudioUrlFromIndexedDB(item.id);
          if (blobUrl) {
            return { ...item, audioUrl: blobUrl };
          }
        }
        return item;
      })
    );

    return resolved;
  } catch (err) {
    console.warn('Could not load custom audios from localStorage:', err);
    return [];
  }
}

/**
 * Helper to convert various link types (e.g. Google Drive, Archive.org) into direct audio stream URLs
 */
export function normalizeAudioLink(url: string): string {
  const trimmed = url.trim();
  
  // Google Drive: https://drive.google.com/file/d/FILE_ID/view... -> direct stream
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  // Google Drive open link: https://drive.google.com/open?id=FILE_ID
  const driveOpenMatch = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveOpenMatch && driveOpenMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveOpenMatch[1]}`;
  }

  return trimmed;
}
