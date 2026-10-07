import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  BookmarkCheck, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Moon, 
  Coffee, 
  Maximize2, 
  Minimize2, 
  List, 
  Download, 
  Share2, 
  Lock, 
  UserCheck, 
  BookOpen,
  Highlighter,
  Trash2,
  Plus,
  MessageSquare
} from 'lucide-react';
import { Book, PageAnnotation } from '../types';
import { useAuth } from '../context/AuthContext';
import { toMyanmarDigits } from '../utils/hijriCalendar';
import { 
  saveAnnotationToFirestore, 
  loadAnnotationsFromFirestore, 
  subscribeToAnnotations,
  deleteAnnotationFromFirestore 
} from '../services/dbService';

interface BookReaderProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  initialPage?: number;
}

export const BookReader: React.FC<BookReaderProps> = ({
  book,
  isOpen,
  onClose,
  initialPage = 1,
}) => {
  const { user, isAuthenticated, openAuthModal, addBookmark, removeBookmark, updateReadingProgress } = useAuth();

  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Annotations & Highlights state
  const [annotations, setAnnotations] = useState<PageAnnotation[]>([]);
  const [isAnnotationDrawerOpen, setIsAnnotationDrawerOpen] = useState(false);
  const [highlightInput, setHighlightInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [selectedColor, setSelectedColor] = useState<'yellow' | 'green' | 'blue' | 'pink'>('yellow');
  const [isSavingAnnotation, setIsSavingAnnotation] = useState(false);

  // Real-time Firestore subscription for annotations across all devices
  useEffect(() => {
    if (!isOpen || !user?.id) {
      setAnnotations([]);
      return;
    }

    // Subscribe to real-time updates across multiple tabs/devices
    const unsubscribe = subscribeToAnnotations(book.id, user.id, (updatedAnnotations) => {
      setAnnotations(updatedAnnotations);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, book.id, user?.id]);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage, book]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      updateReadingProgress(book.id, currentPage);
    }
  }, [currentPage, isOpen, isAuthenticated, book.id]);

  if (!isOpen) return null;

  const totalPages = book.pagesCount || 10;
  const isMemberLocked = book.isMemberOnly && !isAuthenticated;

  // Determine current chapter or page content
  const chapters = book.chapters || [];
  const currentChapter = chapters.find((c) => c.pageNumber === currentPage) || chapters[0];

  const isBookmarked = user?.bookmarks.some(
    (b) => b.bookId === book.id && b.pageNumber === currentPage
  );

  const handleToggleBookmark = () => {
    if (!isAuthenticated) {
      openAuthModal('စာမျက်နှာ မှတ်သားရန် Login ဝင်ရောက်ပါ');
      return;
    }
    if (isBookmarked) {
      removeBookmark(book.id, currentPage);
    } else {
      addBookmark(book.id, currentPage, `${book.title} - စာမျက်နှာ ${currentPage}`);
    }
  };

  const handleAddAnnotation = async () => {
    if (!isAuthenticated || !user) {
      openAuthModal('မှတ်စုနှင့် Highlight များ Firestore တွင် သိမ်းဆည်းရန် Login ဝင်ရောက်ပါ');
      return;
    }
    if (!noteInput.trim() && !highlightInput.trim()) return;

    setIsSavingAnnotation(true);
    const newAnn: PageAnnotation = {
      id: 'ann-' + Date.now(),
      bookId: book.id,
      userId: user.id,
      pageNumber: currentPage,
      highlightText: highlightInput.trim() || undefined,
      noteText: noteInput.trim() || 'စာမျက်နှာ မှတ်သားချက်',
      color: selectedColor,
      createdAt: new Date().toISOString(),
    };

    await saveAnnotationToFirestore(newAnn);
    setAnnotations((prev) => [newAnn, ...prev]);
    setHighlightInput('');
    setNoteInput('');
    setIsSavingAnnotation(false);
  };

  const handleDeleteAnnotation = async (annId: string) => {
    await deleteAnnotationFromFirestore(annId);
    setAnnotations((prev) => prev.filter((a) => a.id !== annId));
  };

  const currentPageAnnotations = annotations.filter((a) => a.pageNumber === currentPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  const themeClasses = {
    light: 'reader-theme-light bg-white text-stone-800',
    sepia: 'reader-theme-sepia bg-[#fbf0d9] text-[#433422]',
    dark: 'reader-theme-dark bg-stone-900 text-stone-100',
  }[theme];

  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-loose',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose',
  }[fontSize];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${themeClasses} transition-colors duration-200`}>
      
      {/* Top Reader Navigation Bar */}
      <div className="px-4 py-3 border-b flex items-center justify-between border-stone-200/50 bg-stone-100/40 dark:bg-stone-800/40 backdrop-blur-xs">
        
        {/* Book Title & Chapter indicator */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            title="စာဖတ်စနစ်မှ ထွက်မည်"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base truncate">
              {book.title}
            </h3>
            <div className="flex items-center gap-2 text-xs opacity-75 truncate">
              <span>{book.author}</span>
              <span>·</span>
              <span>စာမျက်နှာ {toMyanmarDigits(currentPage)} / {toMyanmarDigits(totalPages)}</span>
            </div>
          </div>
        </div>

        {/* Reader Controls: Font, Theme, Toc, Bookmark */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Table of contents toggle */}
          {chapters.length > 0 && (
            <button
              onClick={() => setIsTocOpen(!isTocOpen)}
              className="p-2 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-xs flex items-center gap-1"
              title="မာတိကာ"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">မာတိကာ</span>
            </button>
          )}

          {/* Font size adjustments */}
          <div className="flex items-center bg-stone-200/60 dark:bg-stone-700/60 rounded p-0.5">
            <button
              onClick={() => setFontSize(fontSize === 'xl' ? 'lg' : fontSize === 'lg' ? 'base' : 'sm')}
              className="p-1 hover:bg-white dark:hover:bg-stone-600 rounded text-xs"
              title="စာလုံးသေးရန်"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] px-1 font-mono uppercase">{fontSize}</span>
            <button
              onClick={() => setFontSize(fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'xl')}
              className="p-1 hover:bg-white dark:hover:bg-stone-600 rounded text-xs"
              title="စာလုံးကြီးရန်"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme toggles */}
          <div className="flex items-center bg-stone-200/60 dark:bg-stone-700/60 rounded p-0.5">
            <button
              onClick={() => setTheme('light')}
              className={`p-1 rounded ${theme === 'light' ? 'bg-white shadow-xs' : ''}`}
              title="အဖြူရောင်စနစ်"
            >
              <Sun className="w-3.5 h-3.5 text-amber-600" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1 rounded ${theme === 'sepia' ? 'bg-[#ebd9b4] shadow-xs' : ''}`}
              title="စက္ကူညိုရောင်စနစ်"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-800" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1 rounded ${theme === 'dark' ? 'bg-stone-600 text-white shadow-xs' : ''}`}
              title="ညကြည့်စနစ်"
            >
              <Moon className="w-3.5 h-3.5 text-blue-400" />
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={`p-2 rounded hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors ${
              isBookmarked ? 'text-amber-500' : 'opacity-70'
            }`}
            title={isBookmarked ? 'မှတ်သားပြီးသား' : 'ဤစာမျက်နှာကို မှတ်သားရန်'}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Highlight & Annotation Button */}
          <button
            onClick={() => setIsAnnotationDrawerOpen(!isAnnotationDrawerOpen)}
            className={`p-2 rounded text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              isAnnotationDrawerOpen || currentPageAnnotations.length > 0
                ? 'bg-amber-100 text-amber-950 font-bold dark:bg-amber-950 dark:text-amber-200'
                : 'hover:bg-stone-200 dark:hover:bg-stone-700 opacity-70'
            }`}
            title="စာမျက်နှာ မှတ်စုနှင့် Highlight များ"
          >
            <Highlighter className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Highlight/မှတ်စု</span>
            {currentPageAnnotations.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] flex items-center justify-center font-bold">
                {currentPageAnnotations.length}
              </span>
            )}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 rounded hover:bg-stone-200 dark:hover:bg-stone-700 opacity-70 relative"
            title="မျှဝေရန်"
          >
            <Share2 className="w-4 h-4" />
            {copiedNotification && (
              <span className="absolute -bottom-7 right-0 bg-stone-800 text-white text-[10px] px-2 py-0.5 rounded shadow">
                လင့်ခ် ကူးယူပြီး
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Table of contents sidebar drawer */}
        {isTocOpen && chapters.length > 0 && (
          <div className="w-72 border-r border-stone-200/40 dark:border-stone-700/40 p-4 overflow-y-auto bg-stone-50/90 dark:bg-stone-800/90 backdrop-blur-xs shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm">မာတိကာ ကဏ္ဍများ</h4>
              <button
                onClick={() => setIsTocOpen(false)}
                className="text-xs opacity-60 hover:opacity-100"
              >
                ပိတ်ရန်
              </button>
            </div>
            <ul className="space-y-1.5 text-xs">
              {chapters.map((ch) => (
                <li key={ch.id}>
                  <button
                    onClick={() => {
                      setCurrentPage(ch.pageNumber);
                      setIsTocOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded transition-colors ${
                      currentPage === ch.pageNumber
                        ? 'bg-emerald-600 text-white font-medium'
                        : 'hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <div className="truncate">{ch.title}</div>
                    <div className="text-[10px] opacity-70">စာမျက်နှာ {toMyanmarDigits(ch.pageNumber)}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Book Viewport / Reader Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-6 flex justify-center">
          <div className={book.pdfDataUrl ? 'max-w-5xl w-full flex flex-col h-full' : 'max-w-3xl w-full'}>
            
            {book.pdfDataUrl ? (
              /* User Uploaded / Online PDF View */
              <div className="flex flex-col h-full flex-1 space-y-2">
                {/* PDF Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
                  <div className="flex items-center gap-2 font-medium text-stone-700 dark:text-stone-300">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>PDF အွန်လိုင်း ဖတ်ရှုခြင်းစနစ်</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={book.pdfDataUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white dark:bg-stone-700 hover:bg-stone-50 border border-stone-300 dark:border-stone-600 rounded text-stone-800 dark:text-stone-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Window အသစ်တွင် ဖွင့်ရန်</span>
                    </a>

                    <a
                      href={book.pdfDataUrl}
                      download={`${book.title}.pdf`}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF ဒေါင်းလုဒ်</span>
                    </a>
                  </div>
                </div>

                {/* PDF Embedded Viewport */}
                <div className="w-full flex-1 min-h-[75vh] h-[78vh] rounded-lg border border-stone-300 dark:border-stone-700 overflow-hidden shadow-inner bg-stone-800">
                  <iframe
                    src={`${book.pdfDataUrl}#toolbar=1&navpanes=1`}
                    title={book.title}
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            ) : (
              /* High-Quality Typography Book Reading Page */
              <article className={`space-y-6 ${fontSizeClasses}`}>
                
                {/* Chapter Title */}
                {currentChapter && (
                  <header className="border-b pb-4 border-stone-300/40 dark:border-stone-700/40">
                    <h2 className="text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-400">
                      {currentChapter.title}
                    </h2>
                    <div className="text-xs opacity-60 mt-1">
                      {book.title} · အခန်းကဏ္ဍ
                    </div>
                  </header>
                )}

                {/* Chapter Content with proper whitespace and Arabic/Myanmar typography */}
                <div className="whitespace-pre-line font-myanmar">
                  {currentChapter ? currentChapter.content : (
                    <div className="text-center py-16 opacity-75">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p>စာမျက်နှာ {toMyanmarDigits(currentPage)} ကို ဖတ်ရှုနေပါသည်</p>
                      <p className="text-xs mt-1">နောက်စာမျက်နှာများသို့ ကူးပြောင်းဖတ်ရှုနိုင်ပါသည်</p>
                    </div>
                  )}
                </div>

                {/* End of chapter decorative seal */}
                <div className="text-center py-8 opacity-40">
                  <span className="font-arabic text-lg">❖ ❖ ❖</span>
                </div>
              </article>
            )}

          </div>
        </div>

        {/* Annotations & Highlights Drawer */}
        {isAnnotationDrawerOpen && (
          <aside className="w-80 border-l border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 p-4 overflow-y-auto flex flex-col shrink-0 text-xs shadow-lg z-20">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-700">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100">
                  <Highlighter className="w-4 h-4 text-amber-500" />
                  <span>စာမျက်နှာ {toMyanmarDigits(currentPage)} မှတ်စုများ</span>
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Real-time Sync (တိုက်ရိုက်ချိတ်ဆက်ပြီး)</span>
                </div>
              </div>
              <button
                onClick={() => setIsAnnotationDrawerOpen(false)}
                className="text-[11px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                ပိတ်မည်
              </button>
            </div>

            {/* Form to add new Highlight / Note */}
            <div className="pt-3 space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  ကောက်နုတ်ချက် (Highlight Text)
                </label>
                <textarea
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  placeholder="ကောက်နုတ်လိုသော စာသားကို ရေးထည့်ပါ..."
                  rows={2}
                  className="w-full p-2 text-xs border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-1">
                  ကိုယ်ပိုင်မှတ်စု (Note)
                </label>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="မှတ်သားလိုသော အချက်အလက် သို့မဟုတ် ဓမ္မသတ် မှတ်စု..."
                  rows={2}
                  className="w-full p-2 text-xs border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Color picker */}
              <div>
                <span className="block text-[10px] text-stone-500 mb-1">Highlight အရောင်:</span>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'yellow', bg: 'bg-yellow-400', label: 'ဝါ' },
                    { id: 'green', bg: 'bg-emerald-400', label: 'စိမ်း' },
                    { id: 'blue', bg: 'bg-sky-400', label: 'ပြာ' },
                    { id: 'pink', bg: 'bg-rose-400', label: 'ပန်း' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c.id as any)}
                      className={`w-6 h-6 rounded-full ${c.bg} transition-all cursor-pointer ${
                        selectedColor === c.id ? 'ring-2 ring-stone-900 dark:ring-white scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddAnnotation}
                disabled={isSavingAnnotation || (!highlightInput.trim() && !noteInput.trim())}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isSavingAnnotation ? 'သိမ်းဆည်းနေသည်...' : 'Firestore တွင် သိမ်းမည်'}</span>
              </button>
            </div>

            {/* List of current page annotations */}
            <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-700 flex-1 space-y-2">
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                သိမ်းဆည်းထားသော မှတ်စုများ ({currentPageAnnotations.length})
              </div>

              {currentPageAnnotations.length === 0 ? (
                <div className="text-center py-6 text-stone-400 text-xs">
                  ဤစာမျက်နှာအတွက် မှတ်စု မရှိသေးပါ။
                </div>
              ) : (
                <div className="space-y-2">
                  {currentPageAnnotations.map((ann) => {
                    const colorStyles: Record<string, string> = {
                      yellow: 'bg-yellow-50 border-yellow-300 text-yellow-950 dark:bg-yellow-950/30 dark:border-yellow-700 dark:text-yellow-200',
                      green: 'bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-200',
                      blue: 'bg-sky-50 border-sky-300 text-sky-950 dark:bg-sky-950/30 dark:border-sky-700 dark:text-sky-200',
                      pink: 'bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/30 dark:border-rose-700 dark:text-rose-200',
                    };

                    return (
                      <div
                        key={ann.id}
                        className={`p-2.5 rounded-lg border text-xs space-y-1.5 relative group ${colorStyles[ann.color] || colorStyles.yellow}`}
                      >
                        {ann.highlightText && (
                          <div className="italic font-serif pl-2 border-l-2 border-current opacity-90">
                            "{ann.highlightText}"
                          </div>
                        )}
                        <div className="font-medium">
                          {ann.noteText}
                        </div>
                        <div className="flex items-center justify-between text-[10px] opacity-60 pt-1">
                          <span>စာမျက်နှာ {toMyanmarDigits(ann.pageNumber)}</span>
                          <button
                            onClick={() => handleDeleteAnnotation(ann.id)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                            title="ဖျက်မည်"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Reading Pagination & Progress Bar */}
      <footer className="px-4 py-2.5 border-t border-stone-200/50 dark:border-stone-700/50 bg-stone-100/40 dark:bg-stone-800/40 backdrop-blur-xs flex items-center justify-between gap-3 text-xs">
        
        {/* Prev Page Button */}
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors cursor-pointer ${
            currentPage <= 1
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">ရှေ့စာမျက်နှာ</span>
        </button>

        {/* Center Progress Slider / Input */}
        <div className="flex items-center gap-3 flex-1 max-w-sm">
          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="font-mono text-[11px] shrink-0 font-medium">
            {toMyanmarDigits(currentPage)} / {toMyanmarDigits(totalPages)}
          </div>
        </div>

        {/* Next Page Button */}
        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          className={`flex items-center gap-1 px-3 py-1.5 rounded transition-colors cursor-pointer ${
            currentPage >= totalPages
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <span className="hidden sm:inline">နောက်စာမျက်နှာ</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </footer>

    </div>
  );
};
