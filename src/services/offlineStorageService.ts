import { Book } from '../types';
import { INITIAL_BOOKS } from '../data/initialBooks';

const CACHE_BOOKS_KEY = 'al_hikmah_cached_books_v1';
const CACHE_PRAYER_KEY_PREFIX = 'al_hikmah_prayer_cache_';

/**
 * Cache books into localStorage / IndexedDB for offline access
 */
export function cacheBooksForOffline(books: Book[]): void {
  try {
    if (typeof window === 'undefined') return;
    // Store metadata & book content
    // We sanitize large base64 if needed, but ensure chapters are preserved
    localStorage.setItem(CACHE_BOOKS_KEY, JSON.stringify(books));
  } catch (err) {
    console.warn('Could not cache books to localStorage (quota or disabled):', err);
  }
}

/**
 * Retrieve cached books when offline
 */
export function getOfflineCachedBooks(): Book[] {
  try {
    if (typeof window === 'undefined') return INITIAL_BOOKS;
    const raw = localStorage.getItem(CACHE_BOOKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read cached books from localStorage:', err);
  }
  return INITIAL_BOOKS;
}

/**
 * Cache prayer schedule for a specific city and date
 */
export function cachePrayerSchedule(cityId: string, dateStr: string, schedule: any): void {
  try {
    if (typeof window === 'undefined') return;
    const key = `${CACHE_PRAYER_KEY_PREFIX}${cityId}_${dateStr}`;
    localStorage.setItem(key, JSON.stringify(schedule));
  } catch (err) {
    console.warn('Could not cache prayer times for offline:', err);
  }
}

/**
 * Retrieve cached prayer schedule for offline use
 */
export function getOfflinePrayerSchedule(cityId: string, dateStr: string): any | null {
  try {
    if (typeof window === 'undefined') return null;
    const key = `${CACHE_PRAYER_KEY_PREFIX}${cityId}_${dateStr}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not read cached prayer times:', err);
  }
  return null;
}
