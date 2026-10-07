import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Image as ImageIcon, 
  Sparkles, 
  FileText,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { DailyHadeethItem } from '../types';

interface DailyHadeethShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DailyHadeethItem;
}

export const DailyHadeethShareModal: React.FC<DailyHadeethShareModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isVerse = item.type === 'quran';

  // Text representation for copying
  const formattedText = `${isVerse ? '📖 ကုရ်အာန်အာယသ်တော်' : '📜 ဟဒီးဆ်တော်မြတ်'}\n« ${item.arabicText} »\n\n"${item.translationMm}"\n\nကျမ်းကိုး: ${item.reference}${item.narratorOrSurah ? ` (${item.narratorOrSurah})` : ''}\nအကြောင်းအရာ: #${item.themeMm}${item.explanationMm ? `\n💡 သင်ခန်းစာ: ${item.explanationMm}` : ''}\n\n— Al_HikMah အစ္စလာမ်မီ ဒစ်ဂျစ်တယ် စာကြည့်တိုက်\n${window.location.origin}`;

  // Helper to wrap text onto canvas
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    align: CanvasTextAlign = 'center'
  ): number => {
    ctx.textAlign = align;
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
  };

  // Generate Image onto Canvas
  useEffect(() => {
    if (!isOpen || !item) return;

    setIsGenerating(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 1. Background Gradient (Emerald 950 to Teal 950 to Stone 900)
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGrad.addColorStop(0, '#022c22');
    bgGrad.addColorStop(0.5, '#042f2e');
    bgGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);

    // 2. Decorative Islamic Geometric Border
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1000, 1000);

    // Inner subtle border
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(55, 55, 970, 970);

    // Corner decorative diamonds
    const drawDiamond = (cx: number, cy: number, size: number) => {
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - size, cy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    drawDiamond(55, 55, 12);
    drawDiamond(1025, 55, 12);
    drawDiamond(55, 1025, 12);
    drawDiamond(1025, 1025, 12);

    // 3. Header Badge: Al_HikMah Digital Library & Category
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AL_HIKMAH (الحكمة) • ဒစ်ဂျစ်တယ် စာကြည့်တိုက်', 540, 105);

    // Badge pill background
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(340, 130, 400, 45, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px "Myanmar Text", "Pyidaungsu", sans-serif';
    ctx.fillText(
      `${isVerse ? '📖 ကုရ်အာန်အာယသ်တော်' : '📜 ဟဒီးဆ်တော်မြတ်'}  •  #${item.themeMm}`,
      540,
      160
    );

    // 4. Arabic Calligraphy Text
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 38px "Traditional Arabic", "Amiri", "Scheherazade", serif, sans-serif';
    ctx.direction = 'rtl';
    const arabicQuote = isVerse ? `﴿ ${item.arabicText} ﴾` : `« ${item.arabicText} »`;
    let curY = wrapText(ctx, arabicQuote, 540, 260, 920, 65, 'center');
    ctx.direction = 'ltr';

    // Divider Line with Center Diamond
    curY += 20;
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(340, curY);
    ctx.lineTo(740, curY);
    ctx.stroke();
    drawDiamond(540, curY, 8);

    // 5. Myanmar Translation Box
    curY += 45;
    const translationStartY = curY;
    
    // Background card for translation
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.roundRect(100, translationStartY, 880, 240, 20);
    ctx.fill();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '28px "Myanmar Text", "Pyidaungsu", sans-serif';
    wrapText(ctx, `"${item.translationMm}"`, 540, translationStartY + 60, 820, 48, 'center');

    // 6. Lesson Note (if exists)
    let bottomSectionY = 780;
    if (item.explanationMm) {
      ctx.fillStyle = 'rgba(6, 78, 59, 0.6)';
      ctx.beginPath();
      ctx.roundRect(140, bottomSectionY - 60, 800, 75, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
      ctx.stroke();

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 20px "Myanmar Text", sans-serif';
      ctx.textAlign = 'center';
      wrapText(ctx, `💡 သင်ခန်းစာ: ${item.explanationMm}`, 540, bottomSectionY - 20, 750, 32, 'center');
    }

    // 7. Reference Citation
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 24px "Myanmar Text", sans-serif';
    ctx.textAlign = 'center';
    const refText = `${item.reference} ${item.narratorOrSurah ? `(${item.narratorOrSurah})` : ''}`;
    ctx.fillText(refText, 540, 890);

    // 8. Footer Watermark
    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('နေ့စဉ် တရားဒေသနာနှင့် စာကြည့်တိုက်: Al_HikMah ဒစ်ဂျစ်တယ် စာကြည့်တိုက်', 540, 970);

    // Convert to image data URL
    const url = canvas.toDataURL('image/png');
    setImagePreviewUrl(url);
    setIsGenerating(false);
  }, [isOpen, item]);

  if (!isOpen) return null;

  // Handle Download Image
  const handleDownloadImage = () => {
    if (!imagePreviewUrl) return;
    const a = document.createElement('a');
    a.href = imagePreviewUrl;
    a.download = `daily-hadeeth-${item.id || 'alhikmah'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!imagePreviewUrl) return;
    try {
      const response = await fetch(imagePreviewUrl);
      const blob = await response.blob();
      if (navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({ [blob.type]: blob })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      } else {
        handleDownloadImage();
      }
    } catch {
      handleDownloadImage();
    }
  };

  // Handle Copy Text to Clipboard
  const handleCopyText = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(formattedText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  // Handle Native Mobile Share
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        if (imagePreviewUrl) {
          const response = await fetch(imagePreviewUrl);
          const blob = await response.blob();
          const file = new File([blob], `daily-hadeeth-${item.id}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: item.reference,
              text: `« ${item.arabicText} »\n\n"${item.translationMm}"\n\n${item.reference}`,
              files: [file],
            });
            return;
          }
        }

        // Fallback to text share
        await navigator.share({
          title: item.reference,
          text: formattedText,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 dark:border-stone-800 animate-in fade-in-50 duration-200 my-8 transition-colors">
        
        {/* Modal Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>ဟဒီးဆ်တော် မျှဝေရန်</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-normal">
                  {isVerse ? 'အာယသ်တော်' : 'ဟဒီးဆ်'}
                </span>
              </h2>
              <p className="text-xs text-emerald-300">
                စာသားကူးယူနိုင်သလို ဆိုရှယ်မီဒီယာအတွက် လှပသော ပုံရိပ်အဖြစ်လည်း သိမ်းဆည်းမျှဝေနိုင်ပါသည်
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Visual Image Card Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
              <span className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-400">
                <ImageIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>လူမှုကွန်ရက်အတွက် အသင့်ပြင်ဆင်ထားသော ပုံရိပ်ကတ်ပြား (Image Preview):</span>
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">1080 × 1080 (HD Square)</span>
            </div>

            <div className="relative bg-stone-900 rounded-xl overflow-hidden border border-stone-300 dark:border-stone-700 shadow-inner flex items-center justify-center min-h-[260px] max-h-[380px]">
              {isGenerating || !imagePreviewUrl ? (
                <div className="flex flex-col items-center gap-2 text-stone-300 p-8 text-center animate-pulse">
                  <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-xs">ရုပ်ပုံကတ်ပြားကို အလိုအလျောက် ရေးဆွဲဖန်တီးနေပါသည်...</span>
                </div>
              ) : (
                <img 
                  src={imagePreviewUrl} 
                  alt="Daily Hadeeth Image Card"
                  className="max-h-[360px] w-auto object-contain mx-auto transition-transform hover:scale-[1.01]" 
                />
              )}
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            
            {/* 1. Download Image */}
            <button
              onClick={handleDownloadImage}
              disabled={!imagePreviewUrl}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-900 hover:bg-emerald-950 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>ပုံရိပ် ဒေါင်းလုဒ်ရယူမည်</span>
            </button>

            {/* 2. Copy Image (or Copy to Clipboard) */}
            <button
              onClick={handleCopyImage}
              disabled={!imagePreviewUrl}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {copiedImage ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>ပုံရိပ် ကူးယူပြီး</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                  <span>ပုံရိပ် ကူးယူမည်</span>
                </>
              )}
            </button>

            {/* 3. Native Share / Mobile Share */}
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>တိုက်ရိုက် မျှဝေမည်</span>
            </button>

          </div>

          {/* Text Version Copy Box */}
          <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>စာသားဖြင့် ကူးယူရန် (Text Version):</span>
              </span>
              <button
                onClick={handleCopyText}
                className="text-xs text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>ကူးယူပြီးပါပြီ</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>စာသား ကူးယူမည်</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-mono line-clamp-3 select-all leading-relaxed">
              « {item.arabicText} » — "{item.translationMm}" [{item.reference}]
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 dark:bg-stone-900 px-5 py-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
          <span className="text-stone-500 dark:text-stone-400">Facebook, Viber, Telegram, WhatsApp တို့တွင် အလွယ်တကူ မျှဝေပါ</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            ပိတ်မည်
          </button>
        </div>

      </div>
    </div>
  );
};
