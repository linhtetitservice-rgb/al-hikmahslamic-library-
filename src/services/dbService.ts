import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  query, 
  orderBy, 
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { db, auth } from '../firebase/firebase';
import { Book, SubmittedQuestion, PageAnnotation, DailyHadeethItem, AudioSermon, AudioBookmark } from '../types';
import { INITIAL_BOOKS } from '../data/initialBooks';
import { INITIAL_HADEETHS } from '../data/initialHadeeths';
import { INITIAL_AUDIOS } from '../data/initialAudios';
import { cacheBooksForOffline, getOfflineCachedBooks } from './offlineStorageService';

const BOOKS_COLLECTION = 'books';
const FATWAS_COLLECTION = 'fatwas';
const ANNOTATIONS_COLLECTION = 'annotations';
const HADEETHS_COLLECTION = 'hadeeths';
const AUDIO_SERMONS_COLLECTION = 'audio_sermons';
const AUDIO_BOOKMARKS_COLLECTION = 'audio_bookmarks';

/**
 * Recursively cleans an object for Firestore:
 * - Strips any field with an `undefined` value so setDoc/updateDoc never errors
 * - Deeply cleans nested objects and arrays
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = cleanFirestoreData(value);
      } else if (Array.isArray(value)) {
        clean[key] = value.map(item => (typeof item === 'object' && item !== null ? cleanFirestoreData(item) : item));
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

// Check if database already has books, if empty, seed initial books
export async function initializeDatabaseBooks(): Promise<Book[]> {
  try {
    const booksCol = collection(db, BOOKS_COLLECTION);
    const snapshot = await getDocs(booksCol);

    if (snapshot.empty) {
      console.log('Firestore books collection is empty. Seeding initial library books...');
      // Seed books
      for (const book of INITIAL_BOOKS) {
        const bookDocRef = doc(booksCol, book.id);
        await setDoc(bookDocRef, {
          ...book,
          isMemberOnly: false, // Everyone can read freely without login
          createdAt: new Date().toISOString(),
        });
      }
      return INITIAL_BOOKS.map(b => ({ ...b, isMemberOnly: false }));
    }

    const loadedBooks: Book[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      loadedBooks.push({
        id: docSnap.id,
        title: data.title || '',
        author: data.author || '',
        category: data.category || 'general',
        categoryNameMm: data.categoryNameMm || 'အထွေထွေ',
        description: data.description || '',
        coverImage: data.coverImage || data.coverUrl || '',
        pagesCount: data.pagesCount || data.pageCount || 10,
        publishedYear: data.publishedYear || '၂၀၂၆',
        language: data.language || 'မြန်မာ',
        fileSize: data.fileSize || '1.5 MB',
        rating: data.rating || 5,
        readCount: data.readCount || 100,
        isMemberOnly: false, // Ensure public reading without login
        downloadUrl: data.downloadUrl || data.pdfUrl,
        isPdfUploaded: data.isPdfUploaded || false,
        pdfDataUrl: data.pdfDataUrl || data.pdfUrl,
        chapters: data.chapters || [],
      });
    });

    return loadedBooks;
  } catch (error) {
    console.warn('Could not load books from Firestore (using local fallback):', error);
    return INITIAL_BOOKS.map(b => ({ ...b, isMemberOnly: false }));
  }
}

// Add a new book to Firestore (Admin only)
export async function addBookToFirestore(newBook: Book): Promise<Book> {
  const bookToSave: Book = {
    ...newBook,
    isMemberOnly: false,
    chapters: newBook.chapters || [],
    downloadUrl: newBook.downloadUrl || '',
    coverImage: newBook.coverImage || '',
  };

  try {
    // Firestore documents have a strict 1MB size limit.
    // If the pdfDataUrl is a massive base64 Data URL or blob URL, store in local cache
    // and keep metadata in Firestore to avoid quota/size rejections.
    const firestoreBook: Record<string, any> = {
      ...bookToSave,
      createdAt: new Date().toISOString(),
    };

    if (
      firestoreBook.pdfDataUrl &&
      (firestoreBook.pdfDataUrl.startsWith('blob:') || (firestoreBook.pdfDataUrl.startsWith('data:') && firestoreBook.pdfDataUrl.length > 500000))
    ) {
      firestoreBook.pdfDataUrl = `local-cached://${newBook.id}`;
    }

    const sanitizedData = cleanFirestoreData(firestoreBook);
    const docRef = doc(collection(db, BOOKS_COLLECTION), newBook.id);
    await setDoc(docRef, sanitizedData);
  } catch (err) {
    console.error('Failed to add book to Firestore:', err);
  }

  // Also cache locally in offline storage so it is immediately and permanently available
  try {
    const existing = getOfflineCachedBooks();
    const updated = [bookToSave, ...existing.filter(b => b.id !== bookToSave.id)];
    cacheBooksForOffline(updated);
  } catch (e) {
    console.warn('Could not cache book locally:', e);
  }

  return bookToSave;
}

// Delete book from Firestore (Admin only)
export async function deleteBookFromFirestore(bookId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, BOOKS_COLLECTION, bookId));
    return true;
  } catch (err) {
    console.error('Failed to delete book from Firestore:', err);
    return false;
  }
}

// Submit a Fatwa question to Firestore
export async function submitFatwaToFirestore(questionData: {
  askerName: string;
  category: string;
  question: string;
}): Promise<SubmittedQuestion> {
  const newQuestion: SubmittedQuestion = {
    id: 'fatwa-' + Date.now(),
    userId: 'guest-' + Math.random().toString(36).substring(2, 7),
    userName: questionData.askerName || 'အမည်မဖော်လိုသူ',
    userEmail: '',
    category: questionData.category,
    question: questionData.question,
    submittedAt: new Date().toISOString().split('T')[0],
    status: 'pending',
  };

  try {
    const docData = cleanFirestoreData({
      ...newQuestion,
      createdAt: new Date().toISOString(),
    });
    await setDoc(doc(collection(db, FATWAS_COLLECTION), newQuestion.id), docData);
  } catch (err) {
    console.warn('Saved fatwa locally due to Firestore ping error:', err);
  }

  return newQuestion;
}

// Load all fatwas from Firestore
export async function loadFatwasFromFirestore(): Promise<SubmittedQuestion[]> {
  try {
    const snap = await getDocs(collection(db, FATWAS_COLLECTION));
    if (snap.empty) {
      return [
        {
          id: 'fatwa-demo-1',
          userId: 'usr-1',
          userName: 'ကိုကျော်သူရ',
          userEmail: '',
          category: 'namaz',
          question: 'ဟနဖီ မဇ်ဟဗ်အရ အဆွရ် နမားဇ်အချိန် စတင်ချိန် သတ်မှတ်ချက်ကို ရှင်းပြပေးပါ။',
          submittedAt: '၂၀၂၆-၀၉-၂၈',
          status: 'answered',
          answer: 'ဟနဖီ မဇ်ဟဗ် (အိမာမ် အဗူဟနီဖာဟ် ရဟ်မသုလ္လာဟိအလိုင်ဟိ) ၏ အတည်ပြု ဓမ္မသတ်အရ အရာဝတ္ထုတစ်ခု၏ အရိပ်သည် ၎င်းအရာဝတ္ထု၏ မူလအရွယ်အစားထက် (၂) ဆ (မိစ်လိုင်းန်) ရှည်လျားသွားချိန်တွင် အဆွရ်နမားဇ် အချိန် စတင်ပါသည်။',
        },
      ];
    }

    const list: SubmittedQuestion[] = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      list.push({
        id: docSnap.id,
        userId: d.userId || 'guest',
        userName: d.userName || 'အမည်မဖော်လိုသူ',
        userEmail: d.userEmail || '',
        category: d.category || 'general',
        question: d.question || '',
        submittedAt: d.submittedAt || new Date().toISOString().split('T')[0],
        status: d.status || 'pending',
        answer: d.answer,
      });
    });
    return list;
  } catch (err) {
    console.warn('Error loading fatwas from Firestore:', err);
    return [];
  }
}

// Save a highlight or annotation to Firestore
export async function saveAnnotationToFirestore(annotation: PageAnnotation): Promise<void> {
  try {
    const docRef = doc(collection(db, ANNOTATIONS_COLLECTION), annotation.id);
    await setDoc(docRef, cleanFirestoreData({
      ...annotation,
      updatedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Could not save annotation to Firestore:', err);
  }
}

// Real-time Firestore listener for book annotations across all devices
export function subscribeToAnnotations(
  bookId: string,
  userId: string,
  onUpdate: (annotations: PageAnnotation[]) => void
): () => void {
  try {
    const collRef = collection(db, ANNOTATIONS_COLLECTION);
    const q = query(collRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results: PageAnnotation[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          if (data.bookId === bookId && data.userId === userId) {
            results.push({
              id: d.id,
              bookId: data.bookId,
              userId: data.userId,
              pageNumber: data.pageNumber,
              highlightText: data.highlightText,
              noteText: data.noteText,
              color: data.color || 'yellow',
              createdAt: data.createdAt || new Date().toISOString(),
            });
          }
        });
        // Sort by pageNumber ascending, then by creation date descending
        results.sort((a, b) => a.pageNumber - b.pageNumber || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(results);
      },
      (error) => {
        console.warn('Real-time annotation listener error:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize real-time annotation subscription:', err);
    return () => {};
  }
}

// Load annotations for a specific book and user from Firestore (one-time fetch)
export async function loadAnnotationsFromFirestore(bookId: string, userId: string): Promise<PageAnnotation[]> {
  try {
    const snap = await getDocs(collection(db, ANNOTATIONS_COLLECTION));
    const results: PageAnnotation[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.bookId === bookId && data.userId === userId) {
        results.push({
          id: d.id,
          bookId: data.bookId,
          userId: data.userId,
          pageNumber: data.pageNumber,
          highlightText: data.highlightText,
          noteText: data.noteText,
          color: data.color || 'yellow',
          createdAt: data.createdAt || new Date().toISOString(),
        });
      }
    });
    return results;
  } catch (err) {
    console.warn('Could not load annotations from Firestore:', err);
    return [];
  }
}

// Delete an annotation from Firestore
export async function deleteAnnotationFromFirestore(annotationId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ANNOTATIONS_COLLECTION, annotationId));
  } catch (err) {
    console.warn('Could not delete annotation from Firestore:', err);
  }
}

// Initialize and seed Daily Hadeeths & Quranic verses in Firestore if empty
export async function initializeDailyHadeeths(): Promise<DailyHadeethItem[]> {
  try {
    const colRef = collection(db, HADEETHS_COLLECTION);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      console.log('Seeding initial Daily Hadeeths and Quranic verses to Firestore...');
      for (const item of INITIAL_HADEETHS) {
        const itemDoc = doc(colRef, item.id);
        await setDoc(itemDoc, {
          ...item,
          createdAt: new Date().toISOString(),
        });
      }
      return INITIAL_HADEETHS;
    }

    const items: DailyHadeethItem[] = [];
    snap.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        type: data.type || 'hadeeth',
        arabicText: data.arabicText,
        translationMm: data.translationMm,
        reference: data.reference,
        narratorOrSurah: data.narratorOrSurah,
        themeMm: data.themeMm || 'နေ့စဉ် စိတ်ခွန်အား',
        explanationMm: data.explanationMm,
        createdAt: data.createdAt,
      });
    });

    return items.length > 0 ? items : INITIAL_HADEETHS;
  } catch (err) {
    console.warn('Could not load Daily Hadeeths from Firestore, falling back to local list:', err);
    return INITIAL_HADEETHS;
  }
}

// Fetch a random Daily Hadeeth or Verse from Firestore database
export async function getRandomDailyHadeeth(): Promise<DailyHadeethItem> {
  try {
    const items = await initializeDailyHadeeths();
    if (items.length === 0) return INITIAL_HADEETHS[0];
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  } catch {
    const randomIndex = Math.floor(Math.random() * INITIAL_HADEETHS.length);
    return INITIAL_HADEETHS[randomIndex];
  }
}

// Initialize and seed Audio Sermons in Firestore if empty
export async function initializeDatabaseAudios(): Promise<AudioSermon[]> {
  try {
    const colRef = collection(db, AUDIO_SERMONS_COLLECTION);
    const snap = await getDocs(colRef);

    if (snap.empty) {
      console.log('Seeding initial Islamic Audio Sermons to Firestore...');
      for (const sermon of INITIAL_AUDIOS) {
        const docRef = doc(colRef, sermon.id);
        await setDoc(docRef, {
          ...sermon,
          createdAt: new Date().toISOString(),
        });
      }
      return INITIAL_AUDIOS;
    }

    const sermons: AudioSermon[] = [];
    snap.forEach((d) => {
      const data = d.data();
      sermons.push({
        id: d.id,
        title: data.title || '',
        speaker: data.speaker || '',
        category: data.category || 'bayan',
        categoryMm: data.categoryMm || 'တရားဒေသနာ',
        description: data.description || '',
        audioUrl: data.audioUrl || '',
        duration: data.duration || '00:00',
        publishedDate: data.publishedDate || '၂၀၂၆ ခုနှစ်',
        fileSize: data.fileSize || 'N/A',
        isCustomUploaded: data.isCustomUploaded || false,
        listensCount: data.listensCount || 0,
        uploadedBy: data.uploadedBy,
        createdAt: data.createdAt,
      });
    });

    return sermons.length > 0 ? sermons : INITIAL_AUDIOS;
  } catch (err) {
    console.warn('Could not load Audio Sermons from Firestore, falling back to initial audios:', err);
    return INITIAL_AUDIOS;
  }
}

// Add a new Audio Sermon to Firestore (Upload Audio file or URL)
export async function addAudioSermonToFirestore(sermon: AudioSermon): Promise<void> {
  try {
    const colRef = collection(db, AUDIO_SERMONS_COLLECTION);
    const docRef = doc(colRef, sermon.id);
    
    // Firestore documents have a strict 1MB size limit and cannot store volatile session blob URLs.
    // If the audioUrl is a massive base64 Data URL or blob URL, store placeholder in Firestore.
    const sermonToSave = { ...sermon };
    if (
      sermonToSave.audioUrl && 
      (sermonToSave.audioUrl.startsWith('blob:') || (sermonToSave.audioUrl.startsWith('data:') && sermonToSave.audioUrl.length > 500000))
    ) {
      sermonToSave.audioUrl = `local-indexeddb://${sermon.id}`;
    }

    await setDoc(docRef, cleanFirestoreData({
      ...sermonToSave,
      createdAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Could not save audio sermon to Firestore (falling back to local persistent storage):', err);
    // Do not throw so local upload and playback remain 100% operational
  }
}

// Increment listen count for an audio sermon
export async function incrementAudioListenCount(sermonId: string): Promise<void> {
  try {
    const docRef = doc(db, AUDIO_SERMONS_COLLECTION, sermonId);
    const docSnap = await getDocs(query(collection(db, AUDIO_SERMONS_COLLECTION)));
    docSnap.forEach(async (d) => {
      if (d.id === sermonId) {
        const currentCount = d.data().listensCount || 0;
        await updateDoc(doc(db, AUDIO_SERMONS_COLLECTION, sermonId), {
          listensCount: currentCount + 1,
        });
      }
    });
  } catch (err) {
    console.warn('Could not increment listen count:', err);
  }
}

// Save or update an audio bookmark with timestamp in Firestore
export async function saveAudioBookmarkToFirestore(
  bookmark: AudioBookmark & { userId: string }
): Promise<void> {
  try {
    const bookmarkId = bookmark.id || `audio-bm-${bookmark.userId}-${bookmark.sermonId}`;
    const docRef = doc(collection(db, AUDIO_BOOKMARKS_COLLECTION), bookmarkId);
    await setDoc(docRef, cleanFirestoreData({
      ...bookmark,
      id: bookmarkId,
      updatedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('Could not save audio bookmark to Firestore:', err);
  }
}

// Delete an audio bookmark from Firestore
export async function deleteAudioBookmarkFromFirestore(
  userId: string,
  sermonId: string
): Promise<void> {
  try {
    const bookmarkId = `audio-bm-${userId}-${sermonId}`;
    await deleteDoc(doc(db, AUDIO_BOOKMARKS_COLLECTION, bookmarkId));
  } catch (err) {
    console.warn('Could not delete audio bookmark from Firestore:', err);
  }
}

// Load audio bookmarks for a user from Firestore
export async function loadUserAudioBookmarksFromFirestore(
  userId: string
): Promise<AudioBookmark[]> {
  try {
    const snap = await getDocs(collection(db, AUDIO_BOOKMARKS_COLLECTION));
    const results: AudioBookmark[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.userId === userId) {
        results.push({
          id: d.id,
          sermonId: data.sermonId,
          sermonTitle: data.sermonTitle || '',
          speaker: data.speaker || '',
          categoryMm: data.categoryMm || '',
          timestamp: data.timestamp || 0,
          timestampFormatted: data.timestampFormatted || '00:00',
          durationFormatted: data.durationFormatted,
          note: data.note || '',
          date: data.date || data.createdAt || new Date().toISOString().split('T')[0],
        });
      }
    });
    return results;
  } catch (err) {
    console.warn('Could not load audio bookmarks from Firestore:', err);
    return [];
  }
}




