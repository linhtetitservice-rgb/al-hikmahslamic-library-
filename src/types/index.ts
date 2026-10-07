export type BookCategory = 
  | 'all'
  | 'quran'
  | 'hadith'
  | 'fiqh'
  | 'history'
  | 'aqeedah'
  | 'dua'
  | 'family'
  | 'general';

export interface BookChapter {
  id: string;
  title: string;
  pageNumber: number;
  content: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  categoryNameMm: string;
  description: string;
  coverImage?: string;
  pagesCount: number;
  isMemberOnly: boolean;
  publishedYear: string;
  language: string;
  fileSize?: string;
  downloadUrl?: string;
  isPdfUploaded?: boolean;
  pdfDataUrl?: string; // For client uploaded PDFs or embedded object URLs
  chapters?: BookChapter[];
  rating?: number;
  readCount?: number;
}

export interface AudioBookmark {
  id?: string;
  sermonId: string;
  sermonTitle?: string;
  speaker?: string;
  categoryMm?: string;
  timestamp: number; // in seconds
  timestampFormatted: string; // e.g. "14:20"
  durationFormatted?: string; // e.g. "45:00"
  note?: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'student' | 'alim';
  roleNameMm: string;
  avatar: string;
  joinedDate: string;
  isAdmin?: boolean;
  bookmarks: { bookId: string; pageNumber: number; note?: string; date: string }[];
  audioBookmarks?: AudioBookmark[];
  readingHistory: { bookId: string; lastPage: number; lastReadDate: string }[];
  favoriteBookIds: string[];
}

export interface PrayerTimeData {
  name: string;
  nameMm: string;
  nameAr: string;
  time: string; // 12-hour format e.g. "05:12 AM" or "01:15 PM"
  time12: string; // "05:12 AM"
  time12Mm: string; // "နံနက် ၀၅:၁၂"
  time24?: string; // "05:12"
  isCurrent?: boolean;
  isNext?: boolean;
  descriptionMm?: string;
}

export interface QurbaniShareholder {
  id: string;
  name: string;
  phone?: string;
  shareCount: number; // 1 to 7
  niyyahFor: string; // e.g., "မိမိကိုယ်တိုင်အတွက်", "ဖခင်ကြီးအတွက်", "ကွယ်လွန်သူမိခင်အတွက်"
  paidAmount: number;
}

export interface CityPrayerConfig {
  id: string;
  nameMm: string;
  nameEn: string;
  regionMm: string;
  regionType: 'state' | 'region' | 'union';
  lat: number;
  lng: number;
  timezone: number; // UTC offset +6.5 for Myanmar
}

export interface Fatwa {
  id: string;
  question: string;
  questionerName?: string;
  category: string;
  categoryMm: string;
  askedDate: string;
  answer: string;
  dalilMm: string; // References / ကျမ်းကိုး
  scholarName: string;
  institution: string;
  verified: boolean;
  viewsCount: number;
}

export interface SubmittedQuestion {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  question: string;
  submittedAt: string;
  status: 'pending' | 'answered';
  answer?: string;
}

export interface PageAnnotation {
  id: string;
  bookId: string;
  userId: string;
  pageNumber: number;
  highlightText?: string;
  noteText: string;
  color: 'yellow' | 'green' | 'blue' | 'pink';
  createdAt: string;
}

export interface DailyHadeethItem {
  id: string;
  type: 'hadeeth' | 'quran';
  arabicText: string;
  translationMm: string;
  reference: string;
  narratorOrSurah?: string;
  themeMm: string;
  explanationMm?: string;
  createdAt?: string;
}

export interface AudioSermon {
  id: string;
  title: string;
  speaker: string;
  category: 'bayan' | 'quran' | 'hadith' | 'dua' | 'nasheed' | 'history';
  categoryMm: string;
  description: string;
  audioUrl: string;
  duration?: string;
  publishedDate: string;
  fileSize?: string;
  isCustomUploaded?: boolean;
  listensCount?: number;
  uploadedBy?: string;
  createdAt?: string;
}
