import React from 'react';
import { 
  X, 
  User, 
  Bookmark, 
  Clock, 
  Heart, 
  HelpCircle, 
  LogOut, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Headphones,
  Play,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Book, AudioSermon } from '../types';
import { toMyanmarDigits } from '../utils/hijriCalendar';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  audios?: AudioSermon[];
  onOpenBook: (book: Book, pageNumber?: number) => void;
  onResumeAudio?: (sermon: AudioSermon, timestamp: number) => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({
  isOpen,
  onClose,
  books,
  audios = [],
  onOpenBook,
  onResumeAudio,
}) => {
  const { user, logout, submittedQuestions, removeAudioBookmark } = useAuth();

  if (!isOpen || !user) return null;

  const favoriteBooks = books.filter((b) => user.favoriteBookIds.includes(b.id));
  const audioBookmarks = user.audioBookmarks || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full my-6 overflow-hidden border border-stone-200 dark:border-stone-800 transition-colors">
        
        {/* User Card Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full border-2 border-amber-400 object-cover shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl text-white">{user.name}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold">
                  {user.roleNameMm}
                </span>
              </div>
              <p className="text-xs text-stone-300">{user.email}</p>
              <div className="text-[11px] text-emerald-300">
                အဖွဲ့ဝင် စတင်သည့်ကာလ: {user.joinedDate}
              </div>
            </div>
          </div>
        </div>

        {/* Member Data Tabs */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          
          {/* Section 1: Bookmarks */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>မှတ်သားထားသော စာမျက်နှာများ ({toMyanmarDigits(user.bookmarks.length)})</span>
            </h4>

            {user.bookmarks.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 italic">မှတ်သားထားသော စာမျက်နှာ မရှိသေးပါ။</p>
            ) : (
              <div className="space-y-2">
                {user.bookmarks.map((bm, idx) => {
                  const book = books.find((b) => b.id === bm.bookId);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-lg border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between gap-3 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{book?.title || 'စာအုပ်'}</div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          စာမျက်နှာ {toMyanmarDigits(bm.pageNumber)} · {bm.note || 'အမှတ်အသား'}
                        </div>
                      </div>

                      {book && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenBook(book, bm.pageNumber);
                          }}
                          className="px-3 py-1 bg-emerald-800 dark:bg-emerald-700 text-white rounded text-xs hover:bg-emerald-900 dark:hover:bg-emerald-600 flex items-center gap-1 cursor-pointer"
                        >
                          <span>ဖတ်မည်</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 1.5: Audio Sermons Bookmarks & Resume Progress */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center justify-between text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>တရားတော် နားဆင်မှု မှတ်တိုင်များ ({toMyanmarDigits(audioBookmarks.length)})</span>
              </div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">
                အချိန်မှတ်တိုင်မှ ဆက်လက်နားဆင်နိုင်သည်
              </span>
            </h4>

            {audioBookmarks.length === 0 ? (
              <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-dashed border-stone-200 dark:border-stone-700 text-center space-y-1">
                <p className="text-xs text-stone-500 dark:text-stone-400">မှတ်သားထားသော တရားတော် မှတ်တိုင် မရှိသေးပါ။</p>
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
                  တရားဒေသနာများ နားဆင်နေစဉ် အောက်ခြေဖွင့်စက်ရှိ <strong>"Bookmark"</strong> ခလုတ်ကို နှိပ်၍ မိမိရောက်ရှိသည့်နေရာကို အချိန်မရွေး သိမ်းဆည်းနိုင်ပါသည်
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {audioBookmarks.map((abm) => {
                  const sermon = audios.find((a) => a.id === abm.sermonId);
                  const displayTitle = sermon?.title || abm.sermonTitle || 'တရားတော်';
                  const displaySpeaker = sermon?.speaker || abm.speaker || 'ဆရာတော်';

                  return (
                    <div
                      key={abm.id || abm.sermonId}
                      className="p-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-200/80 dark:border-amber-800/60 hover:border-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm line-clamp-1">
                          {displayTitle}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600 dark:text-stone-300">
                          <span className="text-emerald-800 dark:text-emerald-400 font-medium">{displaySpeaker}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-900 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" />
                            {abm.timestampFormatted}
                          </span>
                          {abm.durationFormatted && (
                            <span className="text-stone-400 dark:text-stone-500">/ {abm.durationFormatted}</span>
                          )}
                          <span className="text-stone-400 dark:text-stone-500">· {abm.date}</span>
                        </div>
                        {abm.note && (
                          <div className="text-[11px] text-stone-600 dark:text-stone-300 bg-white/70 dark:bg-stone-800/80 px-2 py-1 rounded border border-stone-200/60 dark:border-stone-700/60 mt-1">
                            <span className="font-semibold text-stone-700 dark:text-stone-200">မှတ်ချက်:</span> {abm.note}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Resume / Play Button */}
                        <button
                          onClick={() => {
                            if (sermon && onResumeAudio) {
                              onClose();
                              onResumeAudio(sermon, abm.timestamp);
                            } else if (onResumeAudio) {
                              const fallbackSermon: AudioSermon = {
                                id: abm.sermonId,
                                title: displayTitle,
                                speaker: displaySpeaker,
                                category: 'bayan',
                                categoryMm: abm.categoryMm || 'တရားဒေသနာ',
                                description: abm.note || 'နားဆင်မှု မှတ်တိုင်မှ ဆက်လက်ဖွင့်ပါသည်',
                                audioUrl: '',
                                duration: abm.durationFormatted || '00:00',
                                publishedDate: '၂၀၂၆',
                              };
                              onClose();
                              onResumeAudio(fallbackSermon, abm.timestamp);
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-400 dark:hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{abm.timestampFormatted} မှ ဆက်နားဆင်မည်</span>
                        </button>

                        {/* Delete Bookmark Button */}
                        <button
                          onClick={() => removeAudioBookmark(abm.sermonId)}
                          title="ဤမှတ်တိုင်ကို ဖျက်မည်"
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Reading History */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>မကြာသေးမီက ဖတ်ရှုခဲ့မှု မှတ်တမ်း</span>
            </h4>

            {user.readingHistory.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 italic">ဖတ်ရှုမှု မှတ်တမ်း မရှိသေးပါ။</p>
            ) : (
              <div className="space-y-2">
                {user.readingHistory.map((rh, idx) => {
                  const book = books.find((b) => b.id === rh.bookId);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-lg border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-semibold text-stone-900 dark:text-stone-100">{book?.title || 'စာအုပ်'}</div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          နောက်ဆုံးဖတ်ခဲ့သော စာမျက်နှာ: {toMyanmarDigits(rh.lastPage)} ({rh.lastReadDate})
                        </div>
                      </div>

                      {book && (
                        <button
                          onClick={() => {
                            onClose();
                            onOpenBook(book, rh.lastPage);
                          }}
                          className="px-3 py-1 bg-emerald-800 dark:bg-emerald-700 text-white rounded text-xs hover:bg-emerald-900 dark:hover:bg-emerald-600 flex items-center gap-1 cursor-pointer"
                        >
                          <span>ဆက်ဖတ်ရန်</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Favorite Books */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>အနှစ်သက်ဆုံး စာအုပ်များ ({toMyanmarDigits(favoriteBooks.length)})</span>
            </h4>

            {favoriteBooks.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 italic">အနှစ်သက်ဆုံး စာအုပ် မထည့်သွင်းရသေးပါ။</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {favoriteBooks.map((fb) => (
                  <div
                    key={fb.id}
                    onClick={() => {
                      onClose();
                      onOpenBook(fb);
                    }}
                    className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-colors"
                  >
                    <div className="font-bold text-stone-900 dark:text-stone-100 line-clamp-1">{fb.title}</div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{fb.author}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Submitted Questions */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 text-sm border-b border-stone-100 dark:border-stone-800 pb-2">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>မေးမြန်းထားသော ဖသ်ဝါမေးခွန်းများ</span>
            </h4>

            {submittedQuestions.length === 0 ? (
              <p className="text-xs text-stone-500 dark:text-stone-400 italic">မေးမြန်းထားသော မေးခွန်း မရှိသေးပါ။</p>
            ) : (
              <div className="space-y-3">
                {submittedQuestions.map((q) => (
                  <div key={q.id} className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-lg border border-stone-200 dark:border-stone-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-700 dark:text-stone-300">မေးခွန်း:</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        q.status === 'answered' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {q.status === 'answered' ? 'ဖြေကြားပြီး' : 'စိစစ်ဆဲ'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-800 dark:text-stone-200 font-medium">{q.question}</p>
                    {q.answer && (
                      <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded border border-emerald-100 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200">
                        <strong className="block text-[11px] text-emerald-800 dark:text-emerald-400 mb-0.5">ဓမ္မသတ်အဖြေ-</strong>
                        <span>{q.answer}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer / Logout Button */}
        <div className="bg-stone-50 dark:bg-stone-900 p-4 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
          <span className="text-xs text-stone-500 dark:text-stone-400">အကောင့်စီမံခန့်ခွဲမှု</span>
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>အကောင့်မှ ထွက်မည် (Logout)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
