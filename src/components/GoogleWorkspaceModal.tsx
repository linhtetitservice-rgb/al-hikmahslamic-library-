import React, { useState, useEffect } from 'react';
import { 
  X, 
  HardDrive, 
  FileText, 
  Upload, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  FolderOpen, 
  BookOpen, 
  Eye, 
  Sparkles,
  Users,
  Check,
  Loader2,
  Search,
  FileAudio,
  Music
} from 'lucide-react';
import { 
  signInWithGoogleWorkspace, 
  getWorkspaceAccessToken, 
  logoutWorkspace, 
  listDrivePdfFiles, 
  listDriveAudioFiles,
  downloadDriveFileBlob, 
  downloadDriveFileAsDataUrl,
  createIslamicFatwaGoogleForm, 
  listUserGoogleForms, 
  getFormResponses,
  DriveFileItem, 
  GoogleFormItem,
  GoogleFormResponseItem 
} from '../services/googleWorkspaceService';
import { Book, BookCategory, AudioSermon } from '../types';
import { addBookToFirestore, addAudioSermonToFirestore } from '../services/dbService';
import { saveAudioBlobToIndexedDB } from '../services/audioStorageService';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBookInReader: (book: Book) => void;
  onBookUploaded?: (book: Book) => void;
  onAudioUploaded?: (sermon: AudioSermon) => void;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onOpenBookInReader,
  onBookUploaded,
  onAudioUploaded,
}) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'forms'>('drive');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Drive state
  const [driveFilter, setDriveFilter] = useState<'all' | 'pdf' | 'audio'>('all');
  const [driveSearch, setDriveSearch] = useState('');
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveError, setDriveError] = useState('');

  // Import to Library state
  const [importingDriveFile, setImportingDriveFile] = useState<DriveFileItem | null>(null);
  const [importTitle, setImportTitle] = useState('');
  const [importAuthor, setImportAuthor] = useState('');
  const [importCategory, setImportCategory] = useState<BookCategory>('general');
  const [importAudioCategory, setImportAudioCategory] = useState<'bayan' | 'quran' | 'hadith' | 'dua' | 'history'>('bayan');
  const [importDescription, setImportDescription] = useState('');
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Forms state
  const [formsList, setFormsList] = useState<GoogleFormItem[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [formsError, setFormsError] = useState('');
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedFormResponses, setSelectedFormResponses] = useState<GoogleFormResponseItem[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);

  // Confirmation modal state for mutating operations per Workspace skill
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const loadDriveFiles = async (authToken: string, search?: string, filter: 'all' | 'pdf' | 'audio' = driveFilter) => {
    setIsLoadingDrive(true);
    setDriveError('');
    try {
      if (filter === 'pdf') {
        const files = await listDrivePdfFiles(authToken, search);
        setDriveFiles(files);
      } else if (filter === 'audio') {
        const files = await listDriveAudioFiles(authToken, search);
        setDriveFiles(files);
      } else {
        const [pdfFiles, audioFiles] = await Promise.allSettled([
          listDrivePdfFiles(authToken, search),
          listDriveAudioFiles(authToken, search),
        ]);
        const combined: DriveFileItem[] = [];
        if (pdfFiles.status === 'fulfilled') combined.push(...pdfFiles.value);
        if (audioFiles.status === 'fulfilled') {
          const existingIds = new Set(combined.map(f => f.id));
          audioFiles.value.forEach(f => {
            if (!existingIds.has(f.id)) combined.push(f);
          });
        }
        setDriveFiles(combined);
      }
    } catch (err: any) {
      console.error('Failed to load Google Drive files:', err);
      setDriveError('Google Drive ဖိုင်များ ဆွဲယူရာတွင် အခက်အခဲရှိနေပါသည်။ ခွင့်ပြုချက် သို့မဟုတ် ကွန်ရက်ကို စစ်ဆေးပေးပါ။');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const loadForms = async (authToken: string) => {
    setIsLoadingForms(true);
    setFormsError('');
    try {
      const forms = await listUserGoogleForms(authToken);
      setFormsList(forms);
    } catch (err: any) {
      setFormsError('Google Forms စာရင်း ရယူရာတွင် အခက်အခဲရှိနေပါသည်။');
    } finally {
      setIsLoadingForms(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const existingToken = getWorkspaceAccessToken();
    if (existingToken) {
      setToken(existingToken);
      setIsSignedIn(true);
      loadDriveFiles(existingToken, driveSearch, driveFilter);
      loadForms(existingToken);
    }
  }, [isOpen]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setDriveError('');
    setFormsError('');
    try {
      const res = await signInWithGoogleWorkspace();
      setToken(res.accessToken);
      setUserEmail(res.user.email);
      setIsSignedIn(true);
      loadDriveFiles(res.accessToken, driveSearch, driveFilter);
      loadForms(res.accessToken);
    } catch (err: any) {
      setDriveError('Google ဖြင့် ဝင်ရောက်ခြင်း မအောင်မြင်ပါ။ နောက်တစ်ကြိမ် ကြိုးစားကြည့်ပါ။');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutWorkspace();
    setToken(null);
    setIsSignedIn(false);
    setDriveFiles([]);
    setFormsList([]);
  };

  // Convert Drive PDF file into Reader book
  const handleOpenDriveFile = async (file: DriveFileItem) => {
    if (!token) return;
    try {
      setIsLoadingDrive(true);
      const blob = await downloadDriveFileBlob(token, file.id);
      const fileUrl = URL.createObjectURL(blob);

      const virtualBook: Book = {
        id: `drive-${file.id}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        author: 'Google Drive မှ စာအုပ်',
        category: 'general',
        categoryNameMm: 'Google Drive',
        description: 'Google Drive မှ တိုက်ရိုက်ဖတ်ရှုသော PDF ကျမ်းစာအုပ်ဖြစ်ပါသည်။',
        pagesCount: 20,
        publishedYear: '၂၀၂၆',
        language: 'မြန်မာ / အာရဗီ',
        isMemberOnly: false,
        isPdfUploaded: true,
        pdfDataUrl: fileUrl,
        downloadUrl: file.webViewLink,
        chapters: [
          {
            id: 'ch-1',
            title: file.name,
            pageNumber: 1,
            content: `Google Drive PDF ဖိုင်: ${file.name}\n\nဖိုင်အရွယ်အစား: ${file.size ? (parseInt(file.size, 10) / 1024 / 1024).toFixed(2) + ' MB' : 'သိမ်းဆည်းထားသော ဖိုင်'}\nအွန်လိုင်း Drive မှ တိုက်ရိုက် ဖွင့်လှစ်ဖတ်ရှုနေပါသည်...`,
          },
        ],
      };

      onClose();
      onOpenBookInReader(virtualBook);
    } catch (err: any) {
      setDriveError('Google Drive ဖိုင်ကို ဖွင့်လှစ်၍ မရနိုင်ပါ။ ခွင့်ပြုချက် သို့မဟုတ် ဖိုင်ဖော်မတ်ကို စစ်ဆေးပါ။');
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const isAudioFile = (file: DriveFileItem) => {
    const name = file.name.toLowerCase();
    const mime = (file.mimeType || '').toLowerCase();
    return mime.includes('audio') || name.endsWith('.mp3') || name.endsWith('.m4a') || name.endsWith('.wav') || name.endsWith('.aac') || name.endsWith('.ogg') || name.endsWith('.flac');
  };

  // Open the import metadata form for a specific file
  const handleStartImport = (file: DriveFileItem) => {
    setImportingDriveFile(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setImportTitle(cleanName);
    setImportAuthor(isAudioFile(file) ? 'Google Drive တရားတော်' : 'Google Drive စာရေးသူ');
    setImportDescription(`Google Drive မှ တင်သွင်းထားသော ${file.name} ဖိုင်`);
    setImportSuccessMsg(null);
  };

  // Execute the import and upload to catalog
  const handleConfirmImport = async () => {
    if (!token || !importingDriveFile) return;
    setIsProcessingImport(true);
    setDriveError('');

    const file = importingDriveFile;
    const isAudio = isAudioFile(file);

    try {
      if (isAudio) {
        // Download audio blob and persist to IndexedDB & Firestore
        const blob = await downloadDriveFileBlob(token, file.id, file.mimeType);
        const sermonId = `sermon-drive-${Date.now()}`;
        await saveAudioBlobToIndexedDB(sermonId, blob);
        const audioUrl = URL.createObjectURL(blob);

        const categoryNamesMm: Record<string, string> = {
          bayan: 'တရားဒေသနာ (Bayan)',
          quran: 'ကုရ်အာန် ရွတ်ဖတ်သံ',
          hadith: 'ဟဒီးဆ်တော်များ',
          dua: 'ဒိုအာနှင့် ဇိကိရ်',
          history: 'သမိုင်းနှင့် အတ္ထုပ္ပတ္တိ',
        };

        const sizeMb = file.size ? `${(parseInt(file.size, 10) / (1024 * 1024)).toFixed(1)} MB` : 'Google Drive Audio';

        const newSermon: AudioSermon = {
          id: sermonId,
          title: importTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
          speaker: importAuthor.trim() || 'Google Drive တရားတော်',
          category: importAudioCategory,
          categoryMm: categoryNamesMm[importAudioCategory] || 'တရားဒေသနာ',
          description: importDescription.trim() || `Google Drive မှ တင်သွင်းထားသော ${file.name} အသံဖိုင်`,
          audioUrl: audioUrl,
          duration: '15:00',
          publishedDate: `${new Date().getFullYear()} ခုနှစ်`,
          fileSize: sizeMb,
          isCustomUploaded: true,
          listensCount: 1,
          uploadedBy: userEmail || 'Google Drive',
          createdAt: new Date().toISOString(),
        };

        await addAudioSermonToFirestore(newSermon);
        onAudioUploaded?.(newSermon);

        setImportSuccessMsg(`တရားဒေသနာတော် အသံဖိုင် "${newSermon.title}" ကို အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ ✓`);
      } else {
        // Download PDF file as Data URL and persist to Firestore
        const dataUrl = await downloadDriveFileAsDataUrl(token, file.id, file.mimeType);

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

        const sizeMb = file.size ? `${(parseInt(file.size, 10) / (1024 * 1024)).toFixed(2)} MB` : 'Google Drive PDF';

        const newBook: Book = {
          id: `book-drive-${Date.now()}`,
          title: importTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
          author: importAuthor.trim() || 'Google Drive မှ စာအုပ်',
          category: importCategory,
          categoryNameMm: categoryNamesMm[importCategory] || 'အထွေထွေ',
          description: importDescription.trim() || `Google Drive မှ တင်သွင်းထားသော ${file.name} PDF ကျမ်းစာအုပ်`,
          pagesCount: 25,
          publishedYear: '၂၀၂၆',
          language: 'မြန်မာ',
          fileSize: sizeMb,
          isMemberOnly: false,
          isPdfUploaded: true,
          pdfDataUrl: dataUrl,
          downloadUrl: file.webViewLink || '',
          chapters: [
            {
              id: 'ch-1',
              title: file.name,
              pageNumber: 1,
              content: `Google Drive PDF ဖိုင်: ${file.name}\n\nစာကြည့်တိုက်ထဲသို့ အောင်မြင်စွာ တင်သွင်းသိမ်းဆည်းထားပြီး ဖြစ်ပါသည်။`,
            },
          ],
        };

        await addBookToFirestore(newBook);
        onBookUploaded?.(newBook);

        setImportSuccessMsg(`စာအုပ် "${newBook.title}" ကို စာကြည့်တိုက်ထဲသို့ အောင်မြင်စွာ တင်သွင်းပြီးပါပြီ ✓`);
      }

      setImportingDriveFile(null);
    } catch (err: any) {
      console.error('Import failed:', err);
      setDriveError('ဖိုင်တင်သွင်းရာတွင် အခက်အခဲရှိနေပါသည်: ' + (err.message || ''));
    } finally {
      setIsProcessingImport(false);
    }
  };

  // Create Google Form with explicit confirmation per skill requirement
  const handlePromptCreateForm = () => {
    if (!token) return;
    setConfirmModal({
      isOpen: true,
      title: 'Google Form အသစ် ဖန်တီးမည်လား?',
      message: 'သင်၏ Google Account ထဲသို့ "Al_HikMah - အစ္စလာမ် ဓမ္မသတ်နှင့် သာသနာ့ အမေးအဖြေ ဖောင်" အမည်ဖြင့် Google Form အသစ်တစ်ခုကို ထည့်သွင်း ဖန်တီးပေးမည် ဖြစ်ပါသည်။',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setIsCreatingForm(true);
        try {
          const newForm = await createIslamicFatwaGoogleForm(token);
          setFormsList((prev) => [newForm, ...prev]);
        } catch (err: any) {
          setFormsError('Google Form ဖန်တီးမှု မအောင်မြင်ပါ: ' + (err.message || ''));
        } finally {
          setIsCreatingForm(false);
        }
      },
    });
  };

  // View responses for a form
  const handleViewResponses = async (form: GoogleFormItem) => {
    if (!token) return;
    setSelectedFormId(form.formId);
    setIsLoadingResponses(true);
    try {
      const responses = await getFormResponses(token, form.formId);
      setSelectedFormResponses(responses);
    } catch (err: any) {
      console.warn('Could not load form responses:', err);
      setSelectedFormResponses([]);
    } finally {
      setIsLoadingResponses(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-4xl w-full my-6 overflow-hidden border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] transition-colors">
          
          {/* Header */}
          <div className="bg-emerald-950 text-white p-5 flex items-center justify-between shrink-0 border-b border-emerald-900 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900 border border-emerald-700 flex items-center justify-center text-amber-400">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  <span>Google Workspace ချိတ်ဆက်မှု</span>
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                    Drive & Forms
                  </span>
                </h3>
                <p className="text-xs text-stone-300">
                  Google Drive မှ ဖိုင်များကို တိုက်ရိုက်ဆွဲယူတင်သွင်းခြင်းနှင့် Forms စီမံခန့်ခွဲခြင်း
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
            
            {importSuccessMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
                <button
                  onClick={() => setImportSuccessMsg(null)}
                  className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-100 text-[11px] font-bold cursor-pointer"
                >
                  ပိတ်မည်
                </button>
              </div>
            )}

            {!isSignedIn ? (
              /* Signed Out State */
              <div className="py-8 text-center space-y-5 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <HardDrive className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                    Google Workspace နှင့် ချိတ်ဆက်ပါ
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    Google Drive မှ PDF စာအုပ်များနှင့် တရားဒေသနာ အသံဖိုင်များကို စာကြည့်တိုက်ထဲသို့ တိုက်ရိုက်ဆွဲယူတင်သွင်းနိုင်ပြီး Google Forms မေးမြန်းလွှာများကို စီမံခန့်ခွဲနိုင်ပါသည်
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-left text-xs space-y-2">
                  <div className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>ပါဝင်သော ဝန်ဆောင်မှုများ:</span>
                  </div>
                  <ul className="text-stone-600 dark:text-stone-300 text-[11px] space-y-1 list-disc list-inside">
                    <li>Google Drive မှ PDF စာအုပ်များနှင့် အသံဖိုင်များကို စာကြည့်တိုက်ထဲသို့ တိုက်ရိုက်တင်သွင်းခြင်း</li>
                    <li>Google Drive ထဲရှိ စာအုပ်များကို အက်ပ်အတွင်း တိုက်ရိုက် ဖွင့်ဖတ်ခြင်း</li>
                    <li>သာသနာ့ဓမ္မသတ် မေးမြန်းလွှာ Google Form အလိုအလျောက် ဖန်တီးခြင်းနှင့် တုံ့ပြန်မှုများ စစ်ဆေးခြင်း</li>
                  </ul>
                </div>

                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full py-2.5 px-4 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-600 text-stone-800 dark:text-stone-100 rounded-xl shadow-xs text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isSigningIn ? 'Google သို့ ချိတ်ဆက်နေသည်...' : 'Google အကောင့်ဖြင့် ချိတ်ဆက်မည်'}</span>
                </button>

                {driveError && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs rounded-lg border border-rose-200 dark:border-rose-800">
                    {driveError}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Account info bar & Tab Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    {/* Unboxed segmented tab controls */}
                    <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-semibold">
                      <button
                        onClick={() => setActiveTab('drive')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          activeTab === 'drive'
                            ? 'bg-white dark:bg-stone-700 text-emerald-950 dark:text-emerald-200 shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                      >
                        <HardDrive className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                        <span>Google Drive ဖိုင်များ</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('forms')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          activeTab === 'forms'
                            ? 'bg-white dark:bg-stone-700 text-emerald-950 dark:text-emerald-200 shadow-xs'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                        <span>Google Forms မေးမြန်းလွှာများ</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-stone-500 dark:text-stone-400 truncate max-w-[180px]">
                      {userEmail || 'Google ချိတ်ဆက်ပြီး'}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-stone-500 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 underline cursor-pointer text-[11px]"
                    >
                      ချိတ်ဆက်မှုဖြုတ်မည်
                    </button>
                  </div>
                </div>

                {/* TAB 1: Google Drive */}
                {activeTab === 'drive' && (
                  <div className="space-y-4 pt-4">
                    
                    {/* Search & Filter Toolbar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={driveSearch}
                          onChange={(e) => {
                            setDriveSearch(e.target.value);
                            if (token) loadDriveFiles(token, e.target.value, driveFilter);
                          }}
                          placeholder="Google Drive ထဲရှိ စာအုပ်နှင့် ဖိုင်အမည် ရှာဖွေပါ..."
                          className="w-full pl-8 pr-3 py-1.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* File Filter (All, PDF, Audio) */}
                        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg text-xs">
                          <button
                            onClick={() => {
                              setDriveFilter('all');
                              if (token) loadDriveFiles(token, driveSearch, 'all');
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                              driveFilter === 'all'
                                ? 'bg-white dark:bg-stone-700 text-emerald-950 dark:text-emerald-200 shadow-xs'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                            }`}
                          >
                            အားလုံး
                          </button>
                          <button
                            onClick={() => {
                              setDriveFilter('pdf');
                              if (token) loadDriveFiles(token, driveSearch, 'pdf');
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                              driveFilter === 'pdf'
                                ? 'bg-white dark:bg-stone-700 text-emerald-950 dark:text-emerald-200 shadow-xs'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                            }`}
                          >
                            <BookOpen className="w-3 h-3 text-rose-500" />
                            <span>PDF စာအုပ်များ</span>
                          </button>
                          <button
                            onClick={() => {
                              setDriveFilter('audio');
                              if (token) loadDriveFiles(token, driveSearch, 'audio');
                            }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                              driveFilter === 'audio'
                                ? 'bg-white dark:bg-stone-700 text-emerald-950 dark:text-emerald-200 shadow-xs'
                                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                            }`}
                          >
                            <FileAudio className="w-3 h-3 text-purple-500" />
                            <span>အသံဖိုင်များ</span>
                          </button>
                        </div>

                        <button
                          onClick={() => token && loadDriveFiles(token, driveSearch, driveFilter)}
                          disabled={isLoadingDrive}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                          <span className="hidden sm:inline">စစ်ဆေးမည်</span>
                        </button>
                      </div>
                    </div>

                    {driveError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800">
                        {driveError}
                      </div>
                    )}

                    {/* Import Confirmation / Customization Panel */}
                    {importingDriveFile && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-400 dark:border-emerald-600 rounded-2xl space-y-3 animate-in fade-in-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                            <h4 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
                              {isAudioFile(importingDriveFile) ? 'Google Drive မှ အသံဖိုင်ကို တရားတော် စာရင်းထဲသို့ တင်သွင်းမည်' : 'Google Drive မှ စာအုပ်ကို စာကြည့်တိုက်ထဲသို့ တင်သွင်းမည်'}
                            </h4>
                          </div>
                          <button
                            onClick={() => setImportingDriveFile(null)}
                            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                              {isAudioFile(importingDriveFile) ? 'တရားတော် ခေါင်းစဉ်' : 'စာအုပ် အမည်'}
                            </label>
                            <input
                              type="text"
                              value={importTitle}
                              onChange={(e) => setImportTitle(e.target.value)}
                              className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                              {isAudioFile(importingDriveFile) ? 'ဟောကြားသူ ဆရာတော်' : 'ရေးသားသူ ပညာရှင်'}
                            </label>
                            <input
                              type="text"
                              value={importAuthor}
                              onChange={(e) => setImportAuthor(e.target.value)}
                              className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                              ကဏ္ဍ / အမျိုးအစား
                            </label>
                            {isAudioFile(importingDriveFile) ? (
                              <select
                                value={importAudioCategory}
                                onChange={(e) => setImportAudioCategory(e.target.value as any)}
                                className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                              >
                                <option value="bayan">တရားဒေသနာ (Bayan)</option>
                                <option value="quran">ကျမ်းမြတ်ကုရ်အာန် ရွတ်ဖတ်သံ</option>
                                <option value="hadith">ဟဒီးဆ်တော်များ</option>
                                <option value="dua">ဒိုအာနှင့် ဇိကိရ်</option>
                                <option value="history">သမိုင်းနှင့် အတ္ထုပ္ပတ္တိ</option>
                              </select>
                            ) : (
                              <select
                                value={importCategory}
                                onChange={(e) => setImportCategory(e.target.value as BookCategory)}
                                className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                              >
                                <option value="general">အထွေထွေ ဗဟုသုတ</option>
                                <option value="quran">ကျမ်းမြတ်ကုရ်အာန်</option>
                                <option value="hadith">ဟဒီးဆ်တော်များ</option>
                                <option value="fiqh">ဖိကာဟ်နှင့် တရားဓမ္မ</option>
                                <option value="aqeedah">အကီဒဟ်နှင့် ယုံကြည်ချက်</option>
                                <option value="history">သမိုင်းနှင့် အတ္ထုပ္ပတ္တိ</option>
                                <option value="dua">ဒိုအာနှင့် ဇိကိရ်</option>
                                <option value="family">မိသားစုနှင့် လူငယ်</option>
                              </select>
                            )}
                          </div>

                          <div>
                            <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                              ဖော်ပြချက် / အကျဉ်းချုပ်
                            </label>
                            <input
                              type="text"
                              value={importDescription}
                              onChange={(e) => setImportDescription(e.target.value)}
                              placeholder="ဖိုင်အကြောင်း အကျဉ်းချုပ်..."
                              className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setImportingDriveFile(null)}
                            className="px-3 py-1.5 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                          >
                            မလုပ်ဆောင်ပါ
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmImport}
                            disabled={isProcessingImport}
                            className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            {isProcessingImport ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>တင်သွင်းနေပါသည်...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>အတည်ပြု၍ စာကြည့်တိုက်ထဲသို့ တင်မည်</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {isLoadingDrive ? (
                      <div className="text-center py-10 text-xs text-stone-500 dark:text-stone-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-700 dark:text-emerald-400" />
                        Google Drive ထဲရှိ စာအုပ်နှင့် ဖိုင်များကို ရှာဖွေနေပါသည်...
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="text-center py-10 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 p-6 space-y-2">
                        <FolderOpen className="w-8 h-8 text-stone-400 mx-auto" />
                        <div className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                          {driveSearch ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော ဖိုင် မတွေ့ပါ' : 'Google Drive တွင် သင့်လျော်သော ဖိုင်များ မတွေ့ရှိသေးပါ'}
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                          သင်၏ Google Drive ထဲသို့ PDF စာအုပ်များ သို့မဟုတ် MP3 အသံဖိုင်များ ထည့်သွင်းထားပါက ဤနေရာတွင် တိုက်ရိုက် ဆွဲယူတင်သွင်းနိုင်မည် ဖြစ်ပါသည်။
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                        {driveFiles.map((file) => {
                          const isAudio = isAudioFile(file);
                          return (
                            <div
                              key={file.id}
                              className="p-3 bg-stone-50 dark:bg-stone-800/80 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 border border-stone-200 dark:border-stone-700 hover:border-emerald-300 rounded-xl transition-all flex flex-col justify-between"
                            >
                              <div className="flex items-start gap-2.5">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isAudio 
                                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' 
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                }`}>
                                  {isAudio ? <Music className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate" title={file.name}>
                                    {file.name}
                                  </div>
                                  <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-2">
                                    <span>{file.size ? `${(parseInt(file.size, 10) / (1024 * 1024)).toFixed(2)} MB` : (isAudio ? 'Audio File' : 'PDF Document')}</span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-700 font-bold uppercase">
                                      {isAudio ? 'Audio' : 'PDF'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-3 flex items-center justify-between border-t border-stone-200/60 dark:border-stone-700/60 mt-3 gap-1">
                                {file.webViewLink && (
                                  <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 shrink-0"
                                  >
                                    <span>Drive</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}

                                <div className="flex items-center gap-1.5">
                                  {!isAudio && (
                                    <button
                                      onClick={() => handleOpenDriveFile(file)}
                                      className="px-2 py-1 bg-stone-200 dark:bg-stone-700 hover:bg-emerald-700 hover:text-white dark:hover:bg-emerald-600 text-stone-700 dark:text-stone-200 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>ဖတ်မည်</span>
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleStartImport(file)}
                                    className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Upload className="w-3 h-3" />
                                    <span>ဆွဲတင်မည်</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Google Forms */}
                {activeTab === 'forms' && (
                  <div className="space-y-4 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                          အစ္စလာမ် သာသနာ့ ဖသ်ဝါမေးမြန်းလွှာ Google Forms များ
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          Google Forms မှတစ်ဆင့် မေးခွန်းများ စုဆောင်းနိုင်ပြီး တုံ့ပြန်မှုများကို တိုက်ရိုက် ကြည့်ရှုနိုင်ပါသည်
                        </p>
                      </div>

                      <button
                        onClick={handlePromptCreateForm}
                        disabled={isCreatingForm}
                        className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isCreatingForm ? 'ဖန်တီးနေသည်...' : 'Google Form အသစ် ဖန်တီးမည်'}</span>
                      </button>
                    </div>

                    {formsError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800">
                        {formsError}
                      </div>
                    )}

                    {isLoadingForms ? (
                      <div className="text-center py-10 text-xs text-stone-500 dark:text-stone-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-700 dark:text-purple-400" />
                        Google Forms စာရင်း ရယူနေပါသည်...
                      </div>
                    ) : formsList.length === 0 ? (
                      <div className="text-center py-10 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/80 p-6 space-y-3">
                        <FileText className="w-8 h-8 text-purple-400 mx-auto" />
                        <div className="text-sm font-semibold text-purple-950 dark:text-purple-200">
                          Google Form မရှိသေးပါ
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300 max-w-sm mx-auto">
                          "Google Form အသစ် ဖန်တီးမည်" ခလုတ်ကို နှိပ်၍ သာသနာ့ဓမ္မသတ် မေးမြန်းလွှာ Google Form တစ်ခုကို အသင့်မေးခွန်းပုံစံများဖြင့် ချက်ချင်း ဖန်တီးနိုင်ပါသည်။
                        </p>
                        <button
                          onClick={handlePromptCreateForm}
                          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ဖသ်ဝါမေးမြန်းလွှာ Google Form စတင်ဖန်တီးမည်</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formsList.map((form) => (
                          <div
                            key={form.formId}
                            className="p-4 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-500 transition-all space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                                    {form.title}
                                  </div>
                                  <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                                    ID: {form.formId}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewResponses(form)}
                                  className="px-3 py-1.5 bg-white dark:bg-stone-800 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-purple-800 dark:text-purple-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Users className="w-3.5 h-3.5" />
                                  <span>တုံ့ပြန်မှုများ စစ်ဆေးမည်</span>
                                </button>

                                {form.responderUri && (
                                  <a
                                    href={form.responderUri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
                                  >
                                    <span>Form ဖွင့်မည်</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Responses drawer for this form */}
                            {selectedFormId === form.formId && (
                              <div className="pt-3 border-t border-stone-200 dark:border-stone-700 mt-2 bg-white dark:bg-stone-900 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-bold text-xs text-purple-950 dark:text-purple-200">
                                    မေးမြန်းထားသော အဖြေများ ({selectedFormResponses.length})
                                  </span>
                                  <button
                                    onClick={() => setSelectedFormId(null)}
                                    className="text-[11px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                                  >
                                    ပိတ်မည်
                                  </button>
                                </div>

                                {isLoadingResponses ? (
                                  <div className="text-center py-4 text-xs text-stone-500 dark:text-stone-400">
                                    တုံ့ပြန်မှုများကို ဆွဲယူနေပါသည်...
                                  </div>
                                ) : selectedFormResponses.length === 0 ? (
                                  <div className="text-xs text-stone-500 dark:text-stone-400 py-3 text-center">
                                    ဤ Form တွင် ဖြေဆိုသူ မရှိသေးပါ။
                                  </div>
                                ) : (
                                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                    {selectedFormResponses.map((r, i) => (
                                      <div key={r.responseId || i} className="p-2.5 bg-stone-50 dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 text-xs">
                                        <div className="text-[10px] text-stone-400 mb-1">
                                          မေးမြန်းချိန်: {new Date(r.lastSubmittedTime || r.createTime).toLocaleString('my-MM')}
                                        </div>
                                        <div className="space-y-1">
                                          {r.answers && Object.entries(r.answers).map(([key, val]) => (
                                            <div key={key} className="text-stone-700 dark:text-stone-300">
                                              <span className="font-semibold text-stone-800 dark:text-stone-200">• </span>
                                              <span>{val.textAnswers?.answers?.map(a => a.value).join(', ') || 'အဖြေမရှိ'}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Google OAuth 2.0 Client-side စနစ်ဖြင့် လုံခြုံစွာ ချိတ်ဆက်ထားပါသည်</span>
            </span>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg font-medium transition-colors cursor-pointer"
            >
              ပိတ်မည်
            </button>
          </div>

        </div>
      </div>

      {/* Confirmation Dialog for Destructive / Mutating Action per skill */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-stone-900 rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4 border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <span>{confirmModal.title}</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg cursor-pointer"
              >
                မလုပ်ဆောင်ပါ
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-3.5 py-1.5 text-xs bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg cursor-pointer shadow-xs"
              >
                အတည်ပြု ဖန်တီးမည်
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
