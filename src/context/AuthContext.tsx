import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SubmittedQuestion, AudioBookmark } from '../types';
import { 
  saveAudioBookmarkToFirestore, 
  deleteAudioBookmarkFromFirestore, 
  loadUserAudioBookmarksFromFirestore 
} from '../services/dbService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => boolean;
  loginAsAdmin: () => void;
  loginAsDemo: (role?: 'admin' | 'member' | 'student' | 'alim') => void;
  register: (name: string, email: string) => boolean;
  logout: () => void;
  toggleFavorite: (bookId: string) => void;
  addBookmark: (bookId: string, pageNumber: number, note?: string) => void;
  removeBookmark: (bookId: string, pageNumber: number) => void;
  updateReadingProgress: (bookId: string, pageNumber: number) => void;
  addAudioBookmark: (
    sermonId: string,
    timestamp: number,
    note?: string,
    sermonTitle?: string,
    speaker?: string,
    categoryMm?: string,
    durationFormatted?: string
  ) => void;
  removeAudioBookmark: (sermonId: string) => void;
  getAudioBookmark: (sermonId: string) => AudioBookmark | undefined;
  audioBookmarks: AudioBookmark[];
  submittedQuestions: SubmittedQuestion[];
  submitQuestion: (category: string, question: string) => void;
  isAuthModalOpen: boolean;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
  authModalMessage: string;
}

const STORAGE_KEY_USER = 'islamic_app_user';
const STORAGE_KEY_QUESTIONS = 'islamic_app_questions';
const STORAGE_KEY_GUEST_AUDIO_BOOKMARKS = 'islamic_app_guest_audio_bookmarks';

const formatAudioTimestamp = (secs: number): string => {
  if (isNaN(secs) || secs < 0) return '00:00';
  const totalSeconds = Math.floor(secs);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const remainingSecs = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (hours > 0) {
    return `${pad(hours)}:${pad(mins)}:${pad(remainingSecs)}`;
  }
  return `${pad(mins)}:${pad(remainingSecs)}`;
};

const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 'usr-admin',
    name: 'စာကြည့်တိုက် အက်ဒမင်',
    email: 'admin@alhikmah.mm',
    role: 'admin',
    roleNameMm: 'အက်ဒမင် စီမံခန့်ခွဲသူ (Admin)',
    isAdmin: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    joinedDate: '၂၀၂၅ ခုနှစ်',
    bookmarks: [],
    audioBookmarks: [],
    readingHistory: [],
    favoriteBookIds: [],
  },
  member: {
    id: 'usr-1',
    name: 'ကိုကျော်သူရ',
    email: 'kyaw.thura@example.com',
    role: 'member',
    roleNameMm: 'အဖွဲ့ဝင် (Member)',
    isAdmin: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    joinedDate: '၂၀၂၅ ခုနှစ်',
    bookmarks: [{ bookId: 'book-quran-intro', pageNumber: 1, note: 'ဆူရဟ် ဖာသိဟဟ် အဓိပ္ပာယ်', date: '၂၀၂၆-၀၉-၂၀' }],
    audioBookmarks: [
      {
        id: 'abm-1',
        sermonId: 'sermon-1',
        sermonTitle: 'သန့်ရှင်းစင်ကြယ်ခြင်းနှင့် နမားဇ်၏ အရေးပါမှု တရားဒေသနာ',
        speaker: 'မောင်လာနာ ဦးအေးလွင်',
        categoryMm: 'တရားဒေသနာ (Bayan)',
        timestamp: 165,
        timestampFormatted: '02:45',
        note: 'ဝူဇူပြုလုပ်ခြင်း၏ သွန္နသ်တော်များ ရှင်းလင်းချက်',
        date: '၂၀၂၆-၀၉-၂၉',
      }
    ],
    readingHistory: [{ bookId: 'book-quran-intro', lastPage: 2, lastReadDate: '၂၀၂၆-၀၉-၂၈' }],
    favoriteBookIds: ['book-quran-intro', 'book-hadith-nawawi'],
  },
  student: {
    id: 'usr-2',
    name: 'မဆုမြတ်မိုး',
    email: 'su.myat@example.com',
    role: 'student',
    roleNameMm: 'သာသနာ့ပညာသင်ယူသူ (Student of Knowledge)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    joinedDate: '၂၀၂၄ ခုနှစ်',
    bookmarks: [{ bookId: 'book-hadith-nawawi', pageNumber: 8, note: 'ဂျိဗ်ရီလ် ဟဒီးဆ်တော်', date: '၂၀၂၆-၀၉-၂၂' }],
    audioBookmarks: [],
    readingHistory: [{ bookId: 'book-hadith-nawawi', lastPage: 8, lastReadDate: '၂၀၂၆-၀၉-၂၉' }],
    favoriteBookIds: ['book-hadith-nawawi', 'book-seerah-prophet'],
  },
  alim: {
    id: 'usr-3',
    name: 'ဆရာဦးဟာရှင်မ်',
    email: 'hashim@example.com',
    role: 'alim',
    roleNameMm: 'ဓမ္မသတ်ပညာရှင် (Scholar)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: '၂၀၂၃ ခုနှစ်',
    bookmarks: [],
    audioBookmarks: [],
    readingHistory: [],
    favoriteBookIds: ['book-fiqh-namaz', 'book-zakat-guide'],
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && !parsed.audioBookmarks) {
          parsed.audioBookmarks = [];
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Guest audio bookmarks fallback for non-authenticated users
  const [guestAudioBookmarks, setGuestAudioBookmarks] = useState<AudioBookmark[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GUEST_AUDIO_BOOKMARKS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [submittedQuestions, setSubmittedQuestions] = useState<SubmittedQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_QUESTIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'q-demo-1',
        userId: 'usr-1',
        userName: 'ကိုကျော်သူရ',
        userEmail: 'kyaw.thura@example.com',
        category: 'namaz',
        question: 'အလုပ်ချိန်အတွင်း နမားဇ် ဖတ်ရန် အခက်အခဲရှိပါက မည်သို့ ဆောင်ရွက်သင့်ပါသလဲ။',
        submittedAt: '၂၀၂၆-၀၉-၂၂',
        status: 'answered',
        answer: 'အလုပ်ရှင်နှင့် ညှိနှိုင်း၍ ဖရဇ် နမားဇ် မိနစ်အနည်းငယ် အချိန်ပေးရန် မေတ္တာရပ်ခံပါ။ အလွန်အရေးပေါ်ပါက သွန်းနသ်များကို ခေတ္တချန်လှပ်၍ ဖရဇ်ကို အချိန်မီပြီးစီးအောင် ဝတ်ပြုနိုင်ပါသည်။',
      },
    ];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState('');

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  }, [user]);

  // Persist guest audio bookmarks
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_GUEST_AUDIO_BOOKMARKS, JSON.stringify(guestAudioBookmarks));
  }, [guestAudioBookmarks]);

  // Sync user bookmarks from Firestore on login
  useEffect(() => {
    if (user?.id) {
      loadUserAudioBookmarksFromFirestore(user.id).then((cloudBookmarks) => {
        if (cloudBookmarks && cloudBookmarks.length > 0) {
          setUser((prev) => {
            if (!prev) return null;
            const currentBms = prev.audioBookmarks || [];
            const mergedMap = new Map<string, AudioBookmark>();
            // Add cloud bookmarks
            cloudBookmarks.forEach((b) => mergedMap.set(b.sermonId, b));
            // Let local newer bookmarks take precedence
            currentBms.forEach((b) => mergedMap.set(b.sermonId, b));
            return {
              ...prev,
              audioBookmarks: Array.from(mergedMap.values()),
            };
          });
        }
      });
    }
  }, [user?.id]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(submittedQuestions));
  }, [submittedQuestions]);

  const login = (email: string) => {
    const existing = Object.values(DEMO_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      // Merge any guest audio bookmarks into user profile
      const mergedAudioBookmarks = [...(existing.audioBookmarks || [])];
      guestAudioBookmarks.forEach((gb) => {
        if (!mergedAudioBookmarks.some((b) => b.sermonId === gb.sermonId)) {
          mergedAudioBookmarks.push(gb);
        }
      });
      setUser({ ...existing, audioBookmarks: mergedAudioBookmarks });
      setIsAuthModalOpen(false);
      return true;
    }
    // Generic fallback user login
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: email.split('@')[0],
      email,
      role: 'member',
      roleNameMm: 'အဖွဲ့ဝင် (Member)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      joinedDate: '၂၀၂၆ ခုနှစ်',
      bookmarks: [],
      audioBookmarks: [...guestAudioBookmarks],
      readingHistory: [],
      favoriteBookIds: [],
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const loginAsAdmin = () => {
    setUser(DEMO_USERS.admin);
    setIsAuthModalOpen(false);
  };

  const loginAsDemo = (role: 'admin' | 'member' | 'student' | 'alim' = 'member') => {
    const chosen = DEMO_USERS[role] || DEMO_USERS.member;
    const mergedAudioBookmarks = [...(chosen.audioBookmarks || [])];
    guestAudioBookmarks.forEach((gb) => {
      if (!mergedAudioBookmarks.some((b) => b.sermonId === gb.sermonId)) {
        mergedAudioBookmarks.push(gb);
      }
    });
    setUser({ ...chosen, audioBookmarks: mergedAudioBookmarks });
    setIsAuthModalOpen(false);
  };

  const register = (name: string, email: string) => {
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: name || 'အဖွဲ့ဝင်အသစ်',
      email: email || `user${Date.now()}@domain.com`,
      role: 'member',
      roleNameMm: 'အဖွဲ့ဝင် (Member)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      joinedDate: '၂၀၂၆ ခုနှစ်',
      bookmarks: [],
      audioBookmarks: [...guestAudioBookmarks],
      readingHistory: [],
      favoriteBookIds: [],
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const toggleFavorite = (bookId: string) => {
    if (!user) {
      openAuthModal('စာအုပ်များကို သိမ်းဆည်းရန် ဦးစွာ Login ဝင်ရောက်ပါ');
      return;
    }
    const exists = user.favoriteBookIds.includes(bookId);
    const updatedFavorites = exists
      ? user.favoriteBookIds.filter((id) => id !== bookId)
      : [...user.favoriteBookIds, bookId];
    setUser({ ...user, favoriteBookIds: updatedFavorites });
  };

  const addBookmark = (bookId: string, pageNumber: number, note?: string) => {
    if (!user) {
      openAuthModal('စာမျက်နှာ မှတ်သားရန် Login ဝင်ရောက်ပါ');
      return;
    }
    const filtered = user.bookmarks.filter((b) => !(b.bookId === bookId && b.pageNumber === pageNumber));
    const newBookmark = {
      bookId,
      pageNumber,
      note: note || '',
      date: new Date().toISOString().split('T')[0],
    };
    setUser({ ...user, bookmarks: [newBookmark, ...filtered] });
  };

  const removeBookmark = (bookId: string, pageNumber: number) => {
    if (!user) return;
    const updated = user.bookmarks.filter((b) => !(b.bookId === bookId && b.pageNumber === pageNumber));
    setUser({ ...user, bookmarks: updated });
  };

  const updateReadingProgress = (bookId: string, pageNumber: number) => {
    if (!user) return;
    const filtered = user.readingHistory.filter((h) => h.bookId !== bookId);
    const updated = [
      { bookId, lastPage: pageNumber, lastReadDate: new Date().toISOString().split('T')[0] },
      ...filtered,
    ];
    setUser({ ...user, readingHistory: updated });
  };

  // Add or update an audio sermon progress bookmark in user profile
  const addAudioBookmark = (
    sermonId: string,
    timestamp: number,
    note?: string,
    sermonTitle?: string,
    speaker?: string,
    categoryMm?: string,
    durationFormatted?: string
  ) => {
    const formatted = formatAudioTimestamp(timestamp);
    const dateStr = new Date().toISOString().split('T')[0];

    const newBookmark: AudioBookmark = {
      id: `abm-${sermonId}-${Date.now()}`,
      sermonId,
      sermonTitle: sermonTitle || 'အစ္စလာမ်မီ တရားဒေသနာ',
      speaker: speaker || 'ဆရာတော်',
      categoryMm: categoryMm || 'တရားဒေသနာ',
      timestamp: Math.max(0, Math.floor(timestamp)),
      timestampFormatted: formatted,
      durationFormatted,
      note: note || '',
      date: dateStr,
    };

    if (user) {
      const currentList = user.audioBookmarks || [];
      const filtered = currentList.filter((b) => b.sermonId !== sermonId);
      const updatedList = [newBookmark, ...filtered];
      setUser({ ...user, audioBookmarks: updatedList });

      // Persist to Firestore database
      saveAudioBookmarkToFirestore({ ...newBookmark, userId: user.id });
    } else {
      // Guest local storage fallback
      setGuestAudioBookmarks((prev) => {
        const filtered = prev.filter((b) => b.sermonId !== sermonId);
        return [newBookmark, ...filtered];
      });
    }
  };

  // Remove an audio bookmark
  const removeAudioBookmark = (sermonId: string) => {
    if (user) {
      const currentList = user.audioBookmarks || [];
      const updated = currentList.filter((b) => b.sermonId !== sermonId);
      setUser({ ...user, audioBookmarks: updated });
      deleteAudioBookmarkFromFirestore(user.id, sermonId);
    } else {
      setGuestAudioBookmarks((prev) => prev.filter((b) => b.sermonId !== sermonId));
    }
  };

  // Get active audio bookmark for a sermon
  const getAudioBookmark = (sermonId: string): AudioBookmark | undefined => {
    if (user) {
      return (user.audioBookmarks || []).find((b) => b.sermonId === sermonId);
    }
    return guestAudioBookmarks.find((b) => b.sermonId === sermonId);
  };

  // Current active list of audio bookmarks
  const activeAudioBookmarks = user ? user.audioBookmarks || [] : guestAudioBookmarks;

  const submitQuestion = (category: string, question: string) => {
    if (!user) {
      openAuthModal('ဖသ်ဝါမေးခွန်း ပေးပို့ရန် Login ဝင်ရောက်ပါ');
      return;
    }
    const newQ: SubmittedQuestion = {
      id: 'q-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      category,
      question,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    setSubmittedQuestions([newQ, ...submittedQuestions]);
  };

  const openAuthModal = (message?: string) => {
    setAuthModalMessage(message || '');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalMessage('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        loginAsAdmin,
        loginAsDemo,
        register,
        logout,
        toggleFavorite,
        addBookmark,
        removeBookmark,
        updateReadingProgress,
        addAudioBookmark,
        removeAudioBookmark,
        getAudioBookmark,
        audioBookmarks: activeAudioBookmarks,
        submittedQuestions,
        submitQuestion,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

