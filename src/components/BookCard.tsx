import React from 'react';
import { BookOpen, Lock, Star, Heart, FileText, ArrowRight } from 'lucide-react';
import { Book } from '../types';
import { useAuth } from '../context/AuthContext';
import { toMyanmarDigits } from '../utils/hijriCalendar';

interface BookCardProps {
  book: Book;
  onRead: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onRead }) => {
  const { user, toggleFavorite } = useAuth();

  const isFavorite = user?.favoriteBookIds.includes(book.id) || false;

  // Background gradient motif according to category
  const categoryGradients: Record<string, string> = {
    quran: 'from-emerald-900 to-teal-950',
    hadith: 'from-cyan-950 to-slate-900',
    fiqh: 'from-amber-950 to-stone-900',
    history: 'from-amber-900 to-stone-950',
    aqeedah: 'from-indigo-950 to-slate-900',
    dua: 'from-emerald-950 to-stone-900',
    family: 'from-rose-950 to-stone-900',
    general: 'from-stone-800 to-stone-900',
  };

  const gradient = categoryGradients[book.category] || 'from-emerald-950 to-stone-900';

  return (
    <div className="group bg-white dark:bg-stone-900 rounded-xl border border-stone-200/90 dark:border-stone-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/60 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between">
      
      {/* Top Cover / Visual Header */}
      <div className={`relative h-44 bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between text-white overflow-hidden`}>
        
        {/* Subtle geometric pattern accent */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
        
        {/* Top bar on cover: Member Badge & Favorite Button */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[11px] font-medium text-emerald-300">
            အခမဲ့ဖတ်ရှုနိုင်
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(book.id);
            }}
            className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-stone-200 hover:text-rose-400 transition-colors cursor-pointer"
            title="အနှစ်သက်ဆုံးများထဲ ထည့်ရန်"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Center Title in cover */}
        <div className="relative z-10 space-y-1">
          <div className="text-[11px] text-stone-300 font-medium">
            {book.categoryNameMm}
          </div>
          <h3 className="font-bold text-base line-clamp-2 text-white leading-snug group-hover:text-amber-200 transition-colors">
            {book.title}
          </h3>
        </div>

        {/* Bottom cover metadata: Author */}
        <div className="relative z-10 text-[11px] text-stone-300/80 truncate">
          {book.author}
        </div>
      </div>

      {/* Card Body: Clean typography and metadata (NO PILLS, zero-pill discipline) */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Description */}
        <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
          {book.description}
        </p>

        {/* Quiet metadata separated by dots */}
        <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
          <span>{toMyanmarDigits(book.pagesCount)} စာမျက်နှာ</span>
          <span aria-hidden="true">·</span>
          <span>{book.language}</span>
          {book.fileSize && (
            <>
              <span aria-hidden="true">·</span>
              <span>{book.fileSize}</span>
            </>
          )}
        </div>

        {/* Interactive Action Button */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{book.rating ? book.rating.toFixed(1) : '4.9'}</span>
          </div>

          <button
            onClick={() => onRead(book)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ဖတ်ရှုမည်</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>

    </div>
  );
};
