import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Upload, 
  Filter, 
  Lock, 
  Sparkles, 
  Bookmark, 
  Share2, 
  Check,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  Bot
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PrayerHeader } from './components/PrayerHeader';
import { Navbar } from './components/Navbar';
import { BookCard } from './components/BookCard';
import { BookReader } from './components/BookReader';
import { UploadBookModal } from './components/UploadBookModal';
import { FullPrayerScheduleModal } from './components/FullPrayerScheduleModal';
import { FatwaSection } from './components/FatwaSection';
import { ZakatCalculator } from './components/ZakatCalculator';
import { QurbaniCalculator } from './components/QurbaniCalculator';
import { GeminiChatbot } from './components/GeminiChatbot';
import { AuthModal } from './components/AuthModal';
import { MemberProfileModal } from './components/MemberProfileModal';
import { Footer } from './components/Footer';
import { AudioSection } from './components/AudioSection';
import { UploadAudioModal } from './components/UploadAudioModal';
import { ShareWebModal } from './components/ShareWebModal';
import { INITIAL_BOOKS } from './data/initialBooks';
import { INITIAL_AUDIOS } from './data/initialAudios';
import { Book, BookCategory, CityPrayerConfig, AudioSermon } from './types';
import { MYANMAR_CITIES } from './utils/prayerTimes';
import { toMyanmarDigits } from './utils/hijriCalendar';
import { 
  initializeDatabaseBooks, 
  addBookToFirestore, 
  initializeDatabaseAudios,
  addAudioSermonToFirestore 
} from './services/dbService';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { DailyHadeeth } from './components/DailyHadeeth';
import { HardDrive, Headphones } from 'lucide-react';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MonthlyPrayerTimetableModal } from './components/MonthlyPrayerTimetableModal';
import { saveCustomAudiosMetadata, loadCustomAudiosWithBlobs } from './services/audioStorageService';

function MainApp() {
  const { isAuthenticated, isAdmin, openAuthModal, user } = useAuth();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'library' | 'audio' | 'fatwa' | 'zakat' | 'qurbani' | 'chatbot'>('library');

  // Books State (initial + user uploads)
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [audios, setAudios] = useState<AudioSermon[]>(INITIAL_AUDIOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookCategory>('all');
  const [accessFilter, setAccessFilter] = useState<'all' | 'free' | 'member'>('all');

  // Load books and audio sermons from Firestore database on mount
  useEffect(() => {
    initializeDatabaseBooks().then((dbBooks) => {
      if (dbBooks && dbBooks.length > 0) {
        setBooks(dbBooks);
      }
    });

    initializeDatabaseAudios().then(async (dbAudios) => {
      const customAudios = await loadCustomAudiosWithBlobs();
      const existingIds = new Set((dbAudios || []).map((a) => a.id));
      const uniqueCustom = customAudios.filter((a) => !existingIds.has(a.id));
      setAudios([...uniqueCustom, ...(dbAudios || [])]);
    });
  }, []);

  // Active Reader Modal
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [readerInitialPage, setReaderInitialPage] = useState<number>(1);

  // Resume Audio State for Bookmark Links
  const [resumeAudioState, setResumeAudioState] = useState<{ sermon: AudioSermon; timestamp: number } | null>(null);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadAudioModalOpen, setIsUploadAudioModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMonthlyTimetableOpen, setIsMonthlyTimetableOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatbotDrawerOpen, setIsChatbotDrawerOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  // Active city for schedule
  const [selectedCity, setSelectedCity] = useState<CityPrayerConfig>(MYANMAR_CITIES[1]); // Default Yangon

  // Resume audio playback from bookmarks (e.g. from Profile modal)
  const handleResumeAudio = (sermon: AudioSermon, timestamp: number) => {
    setActiveTab('audio');
    setResumeAudioState({ sermon, timestamp });
  };

  // Handle Book Upload (Persisted to Firestore database - Admin only)
  const handleBookUploaded = async (newBook: Book) => {
    if (!isAdmin) {
      openAuthModal('စာအုပ်အသစ်တင်ရန် Admin စီမံခန့်ခွဲသူအဖြစ် Login ဝင်ရောက်ပေးပါ');
      return;
    }
    await addBookToFirestore(newBook);
    setBooks((prev) => [newBook, ...prev]);
    // Automatically open the uploaded book to read!
    setReadingBook(newBook);
    setReaderInitialPage(1);
  };

  // Handle Audio Sermon Upload (Persisted to Firestore & IndexedDB - Admin only)
  const handleAudioUploaded = (newSermon: AudioSermon) => {
    if (!isAdmin) {
      openAuthModal('တရားတော် အသံဖိုင် တင်သွင်းရန် Admin စီမံခန့်ခွဲသူအဖြစ် Login ဝင်ရောက်ပေးပါ');
      return;
    }
    setAudios((prev) => {
      const updated = [newSermon, ...prev];
      saveCustomAudiosMetadata(updated);
      return updated;
    });
    setActiveTab('audio');
  };

  // Open book to read - Anyone can read without login!
  const handleOpenBook = (book: Book, pageNumber: number = 1) => {
    setReadingBook(book);
    setReaderInitialPage(pageNumber);
  };

  // Categories list
  const categoryFilters: { id: BookCategory; label: string }[] = [
    { id: 'all', label: 'အားလုံး' },
    { id: 'quran', label: 'ကျမ်းမြတ်ကုရ်အာန်' },
    { id: 'hadith', label: 'ဟဒီးဆ်တော်များ' },
    { id: 'fiqh', label: 'ဖိကာဟ်နှင့် တရားဓမ္မ' },
    { id: 'history', label: 'သမိုင်းနှင့် အတ္ထုပ္ပတ္တိ' },
    { id: 'aqeedah', label: 'အကီဒဟ်' },
    { id: 'dua', label: 'ဒိုအာနှင့် ဇိကိရ်' },
    { id: 'family', label: 'မိသားစုနှင့် လူငယ်' },
  ];

  // Filtered books (All books are 100% free for all users)
  const filteredBooks = books.filter((b) => {
    const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.categoryNameMm.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-myanmar selection:bg-emerald-700 selection:text-white transition-colors duration-200">
      
      {/* 1. Top Header: Islamic Hijri Date & 5 Daily Prayer Times & Solar Times */}
      <PrayerHeader
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onOpenFullSchedule={() => setIsScheduleModalOpen(true)}
        onOpenMonthlyTimetable={() => setIsMonthlyTimetableOpen(true)}
      />

      {/* 2. Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenSchedule={() => setIsScheduleModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenWorkspace={() => setIsWorkspaceModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
      />

      {/* 3. Main Dynamic Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        
        {/* Tab 1: Library & PDF Reader View */}
        {activeTab === 'library' && (
          <div className="space-y-8">
            
            {/* Hero Section with Islamic Banner & Daily Inspiration Hadeeth */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Left Column: Digital Library Introduction Banner */}
              <div className="lg:col-span-7 bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="relative z-10 space-y-3">
                  <span className="font-arabic text-amber-300 text-lg block">
                    اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
                  </span>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                    မြန်မာမွတ်စလင်မ် အစ္စလာမ်မီ ဒစ်ဂျစ်တယ် စာကြည့်တိုက်
                  </h1>
                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                    ကုရ်အာန်၊ ဟဒီးဆ်၊ ဖိကာဟ်၊ ဓမ္မသတ်နှင့် သမိုင်းစာအုပ်များကို မည်သူမဆို Login ဝင်ရန်မလိုဘဲ အခမဲ့ လွတ်လပ်စွာ ဖတ်ရှုနိုင်ပါသည်။ စာအုပ်အသစ်တင်သွင်းရန်နှင့် ဒေတာဘေ့စ် စီမံခန့်ခွဲရန် Admin သာ ဝင်ရောက်ရန် လိုအပ်ပါသည်။
                  </p>
                </div>

                {/* Quick action buttons in hero */}
                <div className="relative z-10 flex flex-wrap items-center gap-2.5 pt-6">
                  <button
                    onClick={() => {
                      if (!isAdmin) {
                        openAuthModal('စာအုပ်အသစ်တင်ရန် Admin စီမံခန့်ခွဲသူအဖြစ် Login ဝင်ရောက်ပေးပါ');
                      } else {
                        setIsUploadModalOpen(true);
                      }
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg text-xs sm:text-sm font-bold shadow transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isAdmin ? 'စာအုပ်/PDF အသစ်တင်ရန်' : 'စာအုပ်/PDF တင်ရန် (Admin သီးသန့်)'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('audio')}
                    className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-emerald-700 rounded-lg text-xs sm:text-sm font-semibold shadow transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Headphones className="w-4 h-4 text-emerald-400" />
                    <span>တရားတော် အသံဖိုင်များ</span>
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-4 py-2 bg-amber-600/90 hover:bg-amber-600 text-white rounded-lg text-xs sm:text-sm font-bold shadow transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>ဝဘ်ဆိုက်လင့်ခ် မျှဝေမည်</span>
                  </button>

                  {/* PWA In-App Install Prompt */}
                  <PWAInstallButton variant="hero" />

                  <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-900/60 border border-emerald-700/60 rounded-lg text-emerald-200 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Login မလိုဘဲ အခမဲ့ ဖတ်ရှုနိုင်သည်</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Daily Hadeeth Component (Daily Inspiration) */}
              <div className="lg:col-span-5 flex flex-col">
                <DailyHadeeth className="h-full" />
              </div>
            </div>

            {/* Search, Category & Access Filter Controls */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 space-y-4 shadow-xs">
              
              {/* Row 1: Search and Access Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="စာအုပ်အမည်၊ ဆရာတော် သို့မဟုတ် သော့ချက်စကားလုံးဖြင့် ရှာဖွေပါ..."
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none placeholder-stone-400 dark:placeholder-stone-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    >
                      ဖျက်မည်
                    </button>
                  )}
                </div>

                {/* Free Library Badge */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800/80 shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>စာအုပ်အားလုံး ၁၀၀% အခမဲ့ (ငွေပေးစရာ/Login မလိုပါ)</span>
                </div>
              </div>

              {/* Row 2: Category Tabs (Functional segmented buttons per design constitution) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categoryFilters.map((cf) => (
                  <button
                    key={cf.id}
                    onClick={() => setSelectedCategory(cf.id)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cf.id
                        ? 'bg-emerald-800 dark:bg-emerald-700 text-white font-semibold shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {cf.label}
                  </button>
                ))}
              </div>

              {/* Stats & active filters count */}
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
                <span>
                  ရရှိနိုင်သော စာအုပ် စုစုပေါင်း: <strong className="text-stone-900 dark:text-stone-200">{toMyanmarDigits(filteredBooks.length)}</strong> အုပ်
                </span>
                {user && (
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>မှတ်သားထားသည်များ ({toMyanmarDigits(user.bookmarks.length)})</span>
                  </button>
                )}
              </div>

            </div>

            {/* Books Catalog Grid */}
            {filteredBooks.length === 0 ? (
              <div className="p-16 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
                <BookOpen className="w-12 h-12 text-stone-400 dark:text-stone-500 mx-auto" />
                <h3 className="font-bold text-base text-stone-800 dark:text-stone-200">
                  ရှာဖွေမှုနှင့် ကိုက်ညီသော စာအုပ် မတွေ့ရှိပါ
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  စာအုပ်ခေါင်းစဉ် သို့မဟုတ် ကဏ္ဍကို ပြန်လည်စစ်ဆေးပါ သို့မဟုတ် သင်ကိုယ်တိုင် PDF ဖိုင် အသစ်တင်နိုင်ပါသည်။
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 bg-emerald-800 dark:bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 dark:hover:bg-emerald-600 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>စာအုပ်အသစ်တင်ရန်</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onRead={handleOpenBook}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* Tab 2: Islamic Audio Sermons & Quran Recitations */}
        {activeTab === 'audio' && (
          <AudioSection
            audios={audios}
            onOpenUploadAudio={() => {
              if (!isAdmin) {
                openAuthModal('တရားတော် အသံဖိုင် တင်သွင်းရန် Admin စီမံခန့်ခွဲသူအဖြစ် Login ဝင်ရောက်ပေးပါ');
              } else {
                setIsUploadAudioModalOpen(true);
              }
            }}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            resumeRequest={resumeAudioState}
            onResumeHandled={() => setResumeAudioState(null)}
          />
        )}

        {/* Tab 3: Fatwa Portal */}
        {activeTab === 'fatwa' && (
          <FatwaSection />
        )}

        {/* Tab 4: Zakat Calculator */}
        {activeTab === 'zakat' && (
          <ZakatCalculator />
        )}

        {/* Tab 5: Qurbani Calculator & Sharia System */}
        {activeTab === 'qurbani' && (
          <QurbaniCalculator />
        )}

        {/* Tab 6: Gemini Islamic Knowledge Chatbot */}
        {activeTab === 'chatbot' && (
          <GeminiChatbot />
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Islamic AI Assistant Button */}
      {activeTab !== 'chatbot' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsChatbotDrawerOpen(!isChatbotDrawerOpen)}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-900 hover:bg-emerald-950 text-white rounded-full shadow-lg border border-emerald-700/60 transition-transform hover:scale-105 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-800 flex items-center justify-center text-amber-400">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold font-myanmar pr-1">
              {isChatbotDrawerOpen ? 'AI ပိတ်မည်' : 'သာသနာ့ AI မေးမည်'}
            </span>
          </button>
        </div>
      )}

      {/* Floating Chatbot Drawer / Widget */}
      {isChatbotDrawerOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[94vw] sm:w-[460px] shadow-2xl rounded-2xl overflow-hidden border border-emerald-800/40">
          <GeminiChatbot
            isWidget={true}
            onClose={() => setIsChatbotDrawerOpen(false)}
          />
        </div>
      )}

      {/* Book & PDF Interactive Reader Modal */}
      {readingBook && (
        <BookReader
          book={readingBook}
          isOpen={!!readingBook}
          onClose={() => setReadingBook(null)}
          initialPage={readerInitialPage}
        />
      )}

      {/* Upload Book / PDF Modal */}
      <UploadBookModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onBookUploaded={handleBookUploaded}
      />

      {/* Full Solar & Islamic Prayer Timetable Modal */}
      <FullPrayerScheduleModal
        city={selectedCity}
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSelectCity={setSelectedCity}
        onOpenMonthlyTimetable={() => setIsMonthlyTimetableOpen(true)}
      />

      {/* Monthly Prayer Timetable with PDF and PNG Export Modal */}
      <MonthlyPrayerTimetableModal
        isOpen={isMonthlyTimetableOpen}
        onClose={() => setIsMonthlyTimetableOpen(false)}
        initialCity={selectedCity}
      />

      {/* Member Authentication Modal */}
      <AuthModal />

      {/* Member Profile, Bookmarks & History Modal */}
      <MemberProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        books={books}
        audios={audios}
        onOpenBook={handleOpenBook}
        onResumeAudio={handleResumeAudio}
      />

      {/* Google Workspace (Drive & Forms) Integration Modal */}
      <GoogleWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onOpenBookInReader={handleOpenBook}
        onBookUploaded={handleBookUploaded}
        onAudioUploaded={handleAudioUploaded}
      />

      {/* Upload Islamic Audio Sermon Modal */}
      <UploadAudioModal
        isOpen={isUploadAudioModalOpen}
        onClose={() => setIsUploadAudioModalOpen(false)}
        onAudioUploaded={handleAudioUploaded}
        uploaderName={user?.name || 'အစ္စလာမ်မီ ဓမ္မမိတ်ဆွေ'}
      />

      {/* Share Web Link & Multi-User Modal */}
      <ShareWebModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        sharedUrl={typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-qsoluk6opvhpow2jn6jefw-40259916469.asia-southeast1.run.app'}
      />

      {/* Offline Connectivity Status Toast */}
      <OfflineIndicator />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
