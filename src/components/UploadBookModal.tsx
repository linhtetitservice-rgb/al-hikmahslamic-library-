import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Link2, 
  Sparkles,
  Shield,
  Lock,
  HardDrive,
  RefreshCw,
  Search,
  Loader2,
  Check
} from 'lucide-react';
import { Book, BookCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  signInWithGoogleWorkspace, 
  getWorkspaceAccessToken, 
  logoutWorkspace, 
  listDrivePdfFiles, 
  downloadDriveFileAsDataUrl, 
  DriveFileItem 
} from '../services/googleWorkspaceService';

interface UploadBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookUploaded: (newBook: Book) => void;
}

export const UploadBookModal: React.FC<UploadBookModalProps> = ({
  isOpen,
  onClose,
  onBookUploaded,
}) => {
  const { isAuthenticated, isAdmin, user, loginAsAdmin, openAuthModal } = useAuth();

  const [uploadSource, setUploadSource] = useState<'file' | 'gdrive' | 'url'>('file');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<BookCategory>('general');
  const [description, setDescription] = useState('');
  const [isMemberOnly, setIsMemberOnly] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [onlinePdfUrl, setOnlinePdfUrl] = useState<string>('');
  
  // Google Drive state
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(false);
  const [isFetchingDriveFileId, setIsFetchingDriveFileId] = useState<string | null>(null);
  const [selectedDriveFile, setSelectedDriveFile] = useState<DriveFileItem | null>(null);
  const [driveSearch, setDriveSearch] = useState<string>('');
  const [driveError, setDriveError] = useState<string>('');
  const [isDriveSigningIn, setIsDriveSigningIn] = useState<boolean>(false);

  const [contentSample, setContentSample] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check existing Google Workspace token on load
  useEffect(() => {
    if (isOpen) {
      const existingToken = getWorkspaceAccessToken();
      if (existingToken) {
        setDriveToken(existingToken);
        if (driveFiles.length === 0) {
          loadGoogleDriveFiles(existingToken);
        }
      }
    }
  }, [isOpen]);

  const loadGoogleDriveFiles = async (token: string, search?: string) => {
    setIsLoadingDrive(true);
    setDriveError('');
    try {
      const files = await listDrivePdfFiles(token, search);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Failed to load Google Drive files:', err);
      setDriveError('Google Drive မှ စာအုပ်များ ဆွဲယူရာတွင် အခက်အခဲရှိနေပါသည်။ ကျေးဇူးပြု၍ ပြန်လည်ကြိုးစားပါ။');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleDriveSignIn = async () => {
    setIsDriveSigningIn(true);
    setDriveError('');
    try {
      const res = await signInWithGoogleWorkspace();
      setDriveToken(res.accessToken);
      loadGoogleDriveFiles(res.accessToken);
    } catch (err: any) {
      setDriveError('Google ဖြင့် ဝင်ရောက်ခြင်း မအောင်မြင်ပါ။ နောက်တစ်ကြိမ် ကြိုးစားကြည့်ပါ။');
    } finally {
      setIsDriveSigningIn(false);
    }
  };

  // Fetch file content directly from Google Drive
  const handleSelectDriveFile = async (file: DriveFileItem) => {
    if (!driveToken) return;
    setIsFetchingDriveFileId(file.id);
    setErrorMessage('');
    try {
      const dataUrl = await downloadDriveFileAsDataUrl(driveToken, file.id, file.mimeType);
      setFileUrl(dataUrl);
      setSelectedDriveFile(file);
      setSelectedFile(null); // Clear local file if any
      
      // Auto-populate title if empty or default
      if (!title || title === selectedFile?.name.replace(/\.[^/.]+$/, '')) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      setErrorMessage('Google Drive မှ ဖိုင်ဆွဲယူ၍ မရနိုင်ပါ။ ဖိုင်ခွင့်ပြုချက်ကို စစ်ဆေးပေးပါ: ' + (err.message || ''));
    } finally {
      setIsFetchingDriveFileId(null);
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedDriveFile(null);
      
      // Read as Data URL so it is fully self-contained and persistent
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFileUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUseSampleUrl = (url: string, sampleTitle: string, sampleAuthor: string, cat: BookCategory) => {
    setUploadSource('url');
    setOnlinePdfUrl(url);
    setTitle(sampleTitle);
    setAuthor(sampleAuthor);
    setCategory(cat);
    setDescription('အွန်လိုင်းမှ တိုက်ရိုက်ဖတ်ရှုနိုင်သော အစ္စလာမ့် PDF ကျမ်းစာအုပ်');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAdmin) {
      setErrorMessage('စာအုပ်နှင့် PDF တင်သွင်းရန် Admin စီမံခန့်ခွဲသူ အခွင့်အရေး လိုအပ်ပါသည်');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('စာအုပ်အမည် ထည့်သွင်းပေးပါ');
      return;
    }

    const activePdfUrl = (uploadSource === 'file' || uploadSource === 'gdrive') ? fileUrl : onlinePdfUrl.trim();

    if (!activePdfUrl && !contentSample.trim()) {
      setErrorMessage(uploadSource === 'gdrive' 
        ? 'Google Drive မှ PDF ဖိုင်တစ်ခုကို ရွေးချယ်ပြီး ဆွဲယူပေးပါ' 
        : 'PDF ဖိုင် သို့မဟုတ် အွန်လိုင်း PDF လင့်ခ် သို့မဟုတ် စာသား တစ်ခုခု ထည့်သွင်းပေးပါ'
      );
      return;
    }

    setIsSubmitting(true);

    const categoryNamesMm: Record<BookCategory, string> = {
      all: 'အားလုံး',
      quran: 'ကျမ်းမြတ်ကုရ်အာန်',
      hadith: 'ဟဒီးဆ်တော်များ',
      fiqh: 'ဖိကာဟ်နှင့် တရားဓမ္မ',
      history: 'သမိုင်းနှင့် အတ္ထုပ္ပတ္တိ',
      aqeedah: 'အကီဒဟ်နှင့် ယုံကြည်ချက်',
      dua: 'ဒိုအာနှင့် ဇိကိရ်',
      family: 'မိသားစုနှင့် လူငယ်',
      general: 'အထွေထွေ ဗဟုသုတ',
    };

    let calculatedSize = 'PDF Document';
    if (selectedFile) {
      calculatedSize = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
    } else if (selectedDriveFile && selectedDriveFile.size) {
      calculatedSize = `${(parseInt(selectedDriveFile.size, 10) / (1024 * 1024)).toFixed(1)} MB`;
    } else if (uploadSource === 'gdrive') {
      calculatedSize = 'Google Drive PDF';
    }

    const newBook: Book = {
      id: 'book-uploaded-' + Date.now(),
      title: title.trim(),
      author: author.trim() || (uploadSource === 'gdrive' ? 'Google Drive မှ စာအုပ်' : 'အမည်မသိ ရေးသားသူ'),
      category,
      categoryNameMm: categoryNamesMm[category] || 'အထွေထွေ',
      description: description.trim() || (uploadSource === 'gdrive' ? `Google Drive မှ တင်သွင်းထားသော ${selectedDriveFile?.name || 'PDF'} ကျမ်းစာအုပ်` : 'တင်ထားသော စာအုပ်နှင့် PDF မှတ်တမ်း'),
      pagesCount: selectedFile ? 15 : selectedDriveFile ? 20 : 25,
      isMemberOnly,
      publishedYear: '၂၀၂၆',
      language: 'မြန်မာ',
      fileSize: calculatedSize,
      isPdfUploaded: !!activePdfUrl,
      pdfDataUrl: activePdfUrl || '',
      downloadUrl: selectedDriveFile?.webViewLink || activePdfUrl || '',
      chapters: contentSample.trim() ? [
        {
          id: 'up-1',
          title: 'အခန်း (၁) - စာအုပ် မိတ်ဆက်နှင့် အစပြုခြင်း',
          pageNumber: 1,
          content: contentSample.trim(),
        }
      ] : [],
    };

    onBookUploaded(newBook);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-lg w-full my-6 overflow-hidden border border-stone-200 dark:border-stone-800 transition-colors">
        
        {/* Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  PDF စာအုပ်တင်မည်
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold">
                  Admin သီးသန့်
                </span>
              </div>
              <p className="text-xs text-emerald-300">
                စာကြည့်တိုက် အရည်အသွေး ထိန်းသိမ်းရန် Admin စီမံခန့်ခွဲသူသာ စာအုပ် တင်သွင်းခွင့်ရှိပါသည်
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-emerald-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAdmin ? (
          /* Guard: Admin Login Required */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Admin စီမံခန့်ခွဲသူသာ တင်သွင်းခွင့်ရှိပါသည်
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                အစ္စလာမ်မီ ဒစ်ဂျစ်တယ် စာကြည့်တိုက်၏ စာအုပ်အရည်အသွေးနှင့် မူပိုင်ခွင့် စည်းကမ်းများ ထိန်းသိမ်းရန်အတွက် စာအုပ်နှင့် PDF များကို Admin စီမံခန့်ခွဲသူသာ တင်သွင်းခွင့်ရှိပါသည်။
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                ပိတ်မည်
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAsAdmin();
                }}
                className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-lg text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-stone-950" />
                <span>Admin အဖြစ် ချက်ချင်းဝင်ရောက်မည်</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form Body for Admin */
          <div>
            {/* Admin identity banner */}
            <div className="mx-6 mt-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center justify-between text-xs text-emerald-950 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>Admin စီမံခန့်ခွဲသူ (<strong className="text-emerald-900 dark:text-emerald-300">{user?.name || 'Admin'}</strong>) အဖြစ် စာအုပ် တင်သွင်းနေပါသည်</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold text-[10px]">
                စစ်ဆေးပြီး
              </span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Source Toggle: Local File vs Google Drive vs Online URL */}
              <div className="grid grid-cols-3 gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUploadSource('file')}
                  className={`py-1.5 px-2 rounded-md font-semibold text-xs transition-colors cursor-pointer text-center truncate ${
                    uploadSource === 'file' ? 'bg-white dark:bg-stone-700 shadow-xs text-emerald-900 dark:text-emerald-300' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  မိမိစက်မှ PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUploadSource('gdrive');
                    if (driveToken && driveFiles.length === 0) {
                      loadGoogleDriveFiles(driveToken);
                    }
                  }}
                  className={`py-1.5 px-2 rounded-md font-semibold text-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1 truncate ${
                    uploadSource === 'gdrive' ? 'bg-white dark:bg-stone-700 shadow-xs text-emerald-900 dark:text-emerald-300' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">Google Drive မှဆွဲယူ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadSource('url')}
                  className={`py-1.5 px-2 rounded-md font-semibold text-xs transition-colors cursor-pointer text-center truncate ${
                    uploadSource === 'url' ? 'bg-white dark:bg-stone-700 shadow-xs text-emerald-900 dark:text-emerald-300' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  အွန်လိုင်း PDF လင့်ခ်
                </button>
              </div>

              {/* Upload Method 1: Local PDF File */}
              {uploadSource === 'file' && (
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    မိမိစက်ထဲမှ PDF ဖိုင် ရွေးချယ်ပါ
                  </label>
                  <div className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-emerald-600 dark:hover:border-emerald-500 rounded-lg p-4 text-center cursor-pointer transition-colors bg-stone-50 dark:bg-stone-800/60">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload-input"
                    />
                    <label htmlFor="pdf-upload-input" className="cursor-pointer block">
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <span>{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <FileText className="w-8 h-8 text-stone-400 mx-auto" />
                          <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                            PDF ဖိုင် ရွေးချယ်ရန် ဤနေရာကို နှိပ်ပါ
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400">
                            တင်ပြီးသည်နှင့် ဝဘ်ဆိုက်ပေါ်တွင် ချက်ချင်း Online ဖတ်နိုင်ပါသည်
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              {/* Upload Method 2: Google Drive Pull & Select */}
              {uploadSource === 'gdrive' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-medium text-stone-700 dark:text-stone-300">
                      Google Drive ထဲရှိ PDF စာအုပ်ကို ရွေးချယ်ပြီး ဆွဲယူတင်သွင်းပါ
                    </label>
                    {driveToken && (
                      <button
                        type="button"
                        onClick={() => loadGoogleDriveFiles(driveToken, driveSearch)}
                        disabled={isLoadingDrive}
                        className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                        <span>အသစ်ပြန်စစ်မည်</span>
                      </button>
                    )}
                  </div>

                  {!driveToken ? (
                    /* Sign in with Google Drive Box */
                    <div className="p-5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
                        <HardDrive className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          Google Drive နှင့် ချိတ်ဆက်ပါ
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                          သင်၏ Google Drive ထဲရှိ PDF ဖိုင်များကို ဤစာကြည့်တိုက်ထဲသို့ တိုက်ရိုက်ဆွဲယူ ရွေးချယ်နိုင်ပါသည်
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleDriveSignIn}
                        disabled={isDriveSigningIn}
                        className="inline-flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600 border border-stone-300 dark:border-stone-600 rounded-lg shadow-xs text-xs font-semibold text-stone-700 dark:text-stone-100 cursor-pointer"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        <span>{isDriveSigningIn ? 'ချိတ်ဆက်နေသည်...' : 'Sign in with Google'}</span>
                      </button>
                    </div>
                  ) : (
                    /* Drive Browser & Selector */
                    <div className="space-y-2">
                      {/* Search box in Drive */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={driveSearch}
                          onChange={(e) => {
                            setDriveSearch(e.target.value);
                            loadGoogleDriveFiles(driveToken, e.target.value);
                          }}
                          placeholder="Google Drive ထဲရှိ စာအုပ်အမည် ရှာဖွေပါ..."
                          className="w-full pl-8 pr-3 py-1.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                        />
                      </div>

                      {/* Selected File Badge */}
                      {selectedDriveFile && fileUrl && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-emerald-950 dark:text-emerald-200">
                                ဆွဲယူပြီးပါပြီ: {selectedDriveFile.name}
                              </span>
                              <span className="text-[11px] text-stone-500 dark:text-stone-400 ml-2">
                                ({selectedDriveFile.size ? (parseInt(selectedDriveFile.size, 10) / (1024 * 1024)).toFixed(2) + ' MB' : 'PDF'})
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold shrink-0">
                            အဆင်သင့်ဖြစ်ပြီ ✓
                          </span>
                        </div>
                      )}

                      {/* Files list */}
                      {isLoadingDrive ? (
                        <div className="p-6 text-center text-xs text-stone-500 dark:text-stone-400">
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-emerald-700 dark:text-emerald-400" />
                          <span>Google Drive မှ စာအုပ်များ ရှာဖွေနေပါသည်...</span>
                        </div>
                      ) : driveFiles.length === 0 ? (
                        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700 text-center text-xs text-stone-500 dark:text-stone-400">
                          {driveSearch ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော PDF မတွေ့ပါ' : 'Google Drive တွင် PDF စာအုပ်များ မတွေ့ရှိသေးပါ'}
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 border border-stone-200 dark:border-stone-700 rounded-lg p-2 bg-stone-50/50 dark:bg-stone-800/40">
                          {driveFiles.map((file) => {
                            const isSelected = selectedDriveFile?.id === file.id;
                            const isFetching = isFetchingDriveFileId === file.id;
                            return (
                              <div
                                key={file.id}
                                className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                                  isSelected
                                    ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-400 text-emerald-950 dark:text-emerald-200 font-semibold ring-1 ring-emerald-400'
                                    : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                                  <div className="truncate">
                                    <div className="truncate font-medium">{file.name}</div>
                                    <div className="text-[10px] text-stone-400 dark:text-stone-500">
                                      {file.size ? `${(parseInt(file.size, 10) / (1024 * 1024)).toFixed(2)} MB` : 'PDF'}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleSelectDriveFile(file)}
                                  disabled={isFetching}
                                  className={`ml-2 px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                                    isSelected
                                      ? 'bg-emerald-800 dark:bg-emerald-700 text-white'
                                      : 'bg-stone-200 dark:bg-stone-700 hover:bg-emerald-700 hover:text-white text-stone-700 dark:text-stone-200'
                                  }`}
                                >
                                  {isFetching ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      <span>ဆွဲယူနေ...</span>
                                    </>
                                  ) : isSelected ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>ဆွဲယူပြီး</span>
                                    </>
                                  ) : (
                                    <span>ဆွဲယူရွေးမည်</span>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Upload Method 2: Online PDF Link */}
              {uploadSource === 'url' && (
                <div className="space-y-2">
                  <label className="block font-medium text-stone-700 dark:text-stone-300">
                    အွန်လိုင်း PDF လိပ်စာ (Direct PDF URL)
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={onlinePdfUrl}
                      onChange={(e) => setOnlinePdfUrl(e.target.value)}
                      placeholder="https://example.com/books/sample.pdf"
                      className="w-full pl-9 pr-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none text-xs"
                    />
                  </div>

                  {/* Sample Online Islamic PDFs */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>စမ်းသပ်ဖတ်ရှုရန် နမူနာ PDF စာအုပ်များ:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleUseSampleUrl(
                          'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                          'အစ္စလာမ့် အခြေခံ အသိပညာ လက်စွဲ (PDF)',
                          'ဒါရုလ်အိဖ်တာဟ် ပညာရှင်များ',
                          'fiqh'
                        )}
                        className="text-[11px] px-2 py-0.5 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 hover:text-emerald-900 dark:hover:text-emerald-300 rounded border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                      >
                        + အခြေခံလက်စွဲ PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUseSampleUrl(
                          'https://pdfobject.com/pdf/sample.pdf',
                          'ကုရ်အာန်နှင့် ဟဒီးဆ်တော် လမ်းညွှန် (PDF စာအုပ်)',
                          'သာသနာ့ဓမ္မသတ်အဖွဲ့',
                          'hadith'
                        )}
                        className="text-[11px] px-2 py-0.5 bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 hover:text-emerald-900 dark:hover:text-emerald-300 rounded border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
                      >
                        + ဟဒီးဆ်လမ်းညွှန် PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Book Title */}
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  စာအုပ် / စာတမ်း အမည် <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ဥပမာ- ကုရ်အာန်အလင်းရောင် လက်စွဲ"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  ရေးသားပြုစုသူ / ဆရာတော်
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="ဥပမာ- မုဖ်သီ ဦးအေးလွင်"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  ကဏ္ဍ (Category) ရွေးချယ်ပါ
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BookCategory)}
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 cursor-pointer"
                >
                  <option value="quran">ကျမ်းမြတ်ကုရ်အာန်နှင့် တဖ်စီရ်</option>
                  <option value="hadith">ဟဒီးဆ်တော်များ</option>
                  <option value="fiqh">ဖိကာဟ်နှင့် တရားဓမ္မ</option>
                  <option value="history">သမိုင်းနှင့် အတ္ထုပ္ပတ္တိ</option>
                  <option value="aqeedah">အကီဒဟ်နှင့် ယုံကြည်ချက်</option>
                  <option value="dua">ဒိုအာနှင့် ဇိကိရ်</option>
                  <option value="family">မိသားစုနှင့် လူငယ်</option>
                  <option value="general">အထွေထွေ ဗဟုသုတ</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  အကျဉ်းချုပ် ရှင်းလင်းချက်
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="စာအုပ်၏ အဓိက အနှစ်ချုပ် သို့မဟုတ် ရည်ရွယ်ချက်..."
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Direct Text content alternative */}
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  သို့မဟုတ် စာသား တိုက်ရိုက်ရိုက်ထည့်ရန် (Optional)
                </label>
                <textarea
                  rows={2}
                  value={contentSample}
                  onChange={(e) => setContentSample(e.target.value)}
                  placeholder="စာအုပ်ပါ အကြောင်းအရာများကို ဤနေရာတွင် တိုက်ရိုက်ကူးယူ ထည့်သွင်းနိုင်ပါသည်..."
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Member Only Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="member-only-toggle"
                  checked={isMemberOnly}
                  onChange={(e) => setIsMemberOnly(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="member-only-toggle" className="text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer">
                  မန်ဘာဝင်များသာ ဖတ်ရှုခွင့်ပြုမည် (Members Only)
                </label>
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-xs font-medium cursor-pointer"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>စာအုပ်တင်၍ Online ဖတ်မည်</span>
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
};
