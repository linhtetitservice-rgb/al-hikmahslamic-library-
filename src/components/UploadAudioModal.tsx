import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Music, 
  Link as LinkIcon, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Mic, 
  FileAudio,
  User,
  Tag,
  Shield,
  Lock,
  HardDrive,
  RefreshCw,
  Search,
  Loader2,
  Check
} from 'lucide-react';
import { AudioSermon } from '../types';
import { addAudioSermonToFirestore } from '../services/dbService';
import { saveAudioBlobToIndexedDB, normalizeAudioLink } from '../services/audioStorageService';
import { useAuth } from '../context/AuthContext';
import { 
  signInWithGoogleWorkspace, 
  getWorkspaceAccessToken, 
  listDriveAudioFiles, 
  downloadDriveFileBlob, 
  DriveFileItem 
} from '../services/googleWorkspaceService';

interface UploadAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioUploaded: (sermon: AudioSermon) => void;
  uploaderName?: string;
}

export const UploadAudioModal: React.FC<UploadAudioModalProps> = ({
  isOpen,
  onClose,
  onAudioUploaded,
  uploaderName,
}) => {
  const { isAdmin, isAuthenticated, openAuthModal, loginAsAdmin, user } = useAuth();

  const [activeUploadType, setActiveUploadType] = useState<'file' | 'gdrive' | 'url'>('file');
  const [title, setTitle] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [category, setCategory] = useState<'bayan' | 'quran' | 'hadith' | 'dua' | 'history'>('bayan');
  const [description, setDescription] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  
  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioDuration, setAudioDuration] = useState<string>('00:00');
  const [fileSizeText, setFileSizeText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Google Drive state
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [driveAudioFiles, setDriveAudioFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(false);
  const [isFetchingDriveAudioId, setIsFetchingDriveAudioId] = useState<string | null>(null);
  const [selectedDriveAudio, setSelectedDriveAudio] = useState<DriveFileItem | null>(null);
  const [driveAudioBlob, setDriveAudioBlob] = useState<Blob | null>(null);
  const [driveSearch, setDriveSearch] = useState<string>('');
  const [driveError, setDriveError] = useState<string>('');
  const [isDriveSigningIn, setIsDriveSigningIn] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const existingToken = getWorkspaceAccessToken();
      if (existingToken) {
        setDriveToken(existingToken);
        if (driveAudioFiles.length === 0) {
          loadGoogleDriveAudios(existingToken);
        }
      }
    }
  }, [isOpen]);

  const loadGoogleDriveAudios = async (token: string, search?: string) => {
    setIsLoadingDrive(true);
    setDriveError('');
    try {
      const files = await listDriveAudioFiles(token, search);
      setDriveAudioFiles(files);
    } catch (err: any) {
      console.error('Failed to load Drive audio:', err);
      setDriveError('Google Drive မှ အသံဖိုင်များ ဆွဲယူရာတွင် အခက်အခဲရှိနေပါသည်။');
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
      loadGoogleDriveAudios(res.accessToken);
    } catch (err: any) {
      setDriveError('Google ဖြင့် ဝင်ရောက်ခြင်း မအောင်မြင်ပါ။ နောက်တစ်ကြိမ် ကြိုးစားကြည့်ပါ။');
    } finally {
      setIsDriveSigningIn(false);
    }
  };

  const handleSelectDriveAudio = async (file: DriveFileItem) => {
    if (!driveToken) return;
    setIsFetchingDriveAudioId(file.id);
    setErrorMessage('');
    try {
      const blob = await downloadDriveFileBlob(driveToken, file.id, file.mimeType);
      setDriveAudioBlob(blob);
      setSelectedDriveAudio(file);
      setSelectedFile(null);

      const sizeMb = (blob.size / (1024 * 1024)).toFixed(1);
      setFileSizeText(`${sizeMb} MB`);

      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      if (!title) {
        setTitle(cleanName);
      }

      // Try reading duration
      try {
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audio.onloadedmetadata = () => {
          const mins = Math.floor(audio.duration / 60);
          const secs = Math.floor(audio.duration % 60);
          const pad = (n: number) => String(n).padStart(2, '0');
          setAudioDuration(`${pad(mins)}:${pad(secs)}`);
        };
      } catch {
        setAudioDuration('15:00');
      }
    } catch (err: any) {
      setErrorMessage('Google Drive မှ အသံဖိုင် ဆွဲယူ၍ မရပါ: ' + (err.message || ''));
    } finally {
      setIsFetchingDriveAudioId(null);
    }
  };

  if (!isOpen) return null;

  const categoryNamesMm: Record<string, string> = {
    bayan: 'တရားဒေသနာ (Bayan)',
    quran: 'ကုရ်အာန် ရွတ်ဖတ်သံ',
    hadith: 'ဟဒီးဆ်တော်များ',
    dua: 'ဒိုအာနှင့် ဇိကိရ်',
    history: 'သမိုင်းနှင့် အတ္ထုပ္ပတ္တိ',
  };

  // Handle local audio file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type && !file.type.startsWith('audio/') && !file.type.includes('audio') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg|opus|mp4|webm|flac|m4b|wma|aiff)$/i)) {
      setErrorMessage('ကျေးဇူးပြု၍ အသံဖိုင် (MP3, WAV, M4A, AAC, OGG စသည်) သာ ရွေးချယ်ပေးပါ');
      return;
    }

    setSelectedFile(file);
    setSelectedDriveAudio(null);
    setDriveAudioBlob(null);

    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setFileSizeText(`${sizeMb} MB`);

    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName);
    }

    try {
      const audioUrl = URL.createObjectURL(file);
      const audio = new Audio(audioUrl);
      audio.onloadedmetadata = () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        const pad = (n: number) => String(n).padStart(2, '0');
        setAudioDuration(`${pad(mins)}:${pad(secs)}`);
      };
    } catch {
      setAudioDuration('00:00');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isAdmin) {
      setErrorMessage('တရားတော် အသံဖိုင်တင်သွင်းရန် Admin စီမံခန့်ခွဲသူ အခွင့်အရေး လိုအပ်ပါသည်');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('တရားတော်ခေါင်းစဉ် ထည့်သွင်းပေးပါ');
      return;
    }
    if (!speaker.trim()) {
      setErrorMessage('ဟောကြားသူ သို့မဟုတ် ရွတ်ဖတ်သူ ဆရာတော်အမည် ထည့်သွင်းပေးပါ');
      return;
    }

    const sermonId = `sermon-${Date.now()}`;
    let finalAudioUrl = '';

    if (activeUploadType === 'file') {
      if (!selectedFile) {
        setErrorMessage('အသံဖိုင် ရွေးချယ်ပေးပါ');
        return;
      }

      setIsProcessing(true);
      setUploadProgress(30);

      try {
        await saveAudioBlobToIndexedDB(sermonId, selectedFile);
        finalAudioUrl = URL.createObjectURL(selectedFile);
        setUploadProgress(70);
      } catch (err) {
        console.warn('Could not save to IndexedDB directly, fallback to data URL:', err);
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('ဖိုင်ဖတ်ရှုမှု မအောင်မြင်ပါ'));
            reader.readAsDataURL(selectedFile);
          });
          finalAudioUrl = dataUrl;
          await saveAudioBlobToIndexedDB(sermonId, dataUrl);
        } catch {
          setErrorMessage('အသံဖိုင် စီမံဆောင်ရွက်ရာတွင် အခက်အခဲရှိနေပါသည်');
          setIsProcessing(false);
          return;
        }
      }
    } else if (activeUploadType === 'gdrive') {
      if (!driveAudioBlob) {
        setErrorMessage('Google Drive မှ အသံဖိုင်တစ်ခု ရွေးချယ်ပြီး ဆွဲယူပေးပါ');
        return;
      }

      setIsProcessing(true);
      setUploadProgress(30);

      try {
        await saveAudioBlobToIndexedDB(sermonId, driveAudioBlob);
        finalAudioUrl = URL.createObjectURL(driveAudioBlob);
        setUploadProgress(70);
      } catch (err) {
        console.warn('Could not save Drive audio to IndexedDB:', err);
        finalAudioUrl = selectedDriveAudio?.webViewLink || '';
      }
    } else {
      if (!externalUrl.trim()) {
        setErrorMessage('အသံဖိုင် လင့်ခ် (URL) ထည့်သွင်းပေးပါ');
        return;
      }
      finalAudioUrl = normalizeAudioLink(externalUrl);
      setIsProcessing(true);
    }

    try {
      const newSermon: AudioSermon = {
        id: sermonId,
        title: title.trim(),
        speaker: speaker.trim(),
        category,
        categoryMm: categoryNamesMm[category] || 'တရားဒေသနာ',
        description: description.trim() || 'အစ္စလာမ်မီ တရားဒေသနာတော် အသံဖိုင်။',
        audioUrl: finalAudioUrl,
        duration: audioDuration || '15:00',
        publishedDate: `${new Date().getFullYear()} ခုနှစ်`,
        fileSize: fileSizeText || (activeUploadType === 'url' ? 'အွန်လိုင်း' : 'Google Drive Audio'),
        isCustomUploaded: true,
        listensCount: 1,
        uploadedBy: uploaderName || (activeUploadType === 'gdrive' ? 'Google Drive မှ' : 'အဖွဲ့ဝင်'),
        createdAt: new Date().toISOString(),
      };

      await addAudioSermonToFirestore(newSermon);
      
      setUploadProgress(100);
      onAudioUploaded(newSermon);
      onClose();
    } catch (err) {
      console.warn('Audio uploaded with local fallback:', err);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-stone-200 dark:border-stone-800 animate-in fade-in-50 duration-200 my-8 transition-colors">
        
        {/* Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  အစ္စလာမ်မီ တရားဒေသနာ အသံဖိုင်တင်မည်
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-bold">
                  Admin သီးသန့်
                </span>
              </div>
              <p className="text-xs text-emerald-300">
                စာကြည့်တိုက် အရည်အသွေး ထိန်းသိမ်းရန် Admin စီမံခန့်ခွဲသူသာ အသံဖိုင် တင်သွင်းခွင့်ရှိပါသည်
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
                အစ္စလာမ်မီ ဒစ်ဂျစ်တယ် စာကြည့်တိုက်၏ စည်းကမ်းနှင့် အချက်အလက် အရည်အသွေး ထိန်းသိမ်းရန်အတွက် တရားဒေသနာတော် အသံဖိုင်များကို Admin စီမံခန့်ခွဲသူသာ တင်သွင်းခွင့်ရှိပါသည်။
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
          <>
            {/* Admin identity banner */}
            <div className="mx-6 mt-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center justify-between text-xs text-emerald-950 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>Admin စီမံခန့်ခွဲသူ (<strong className="text-emerald-900 dark:text-emerald-300">{user?.name || 'Admin'}</strong>) အဖြစ် အသံဖိုင် တင်သွင်းနေပါသည်</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold text-[10px]">
                စစ်ဆေးပြီး
              </span>
            </div>

            {/* Tab switcher: Local File vs Google Drive vs Online URL */}
            <div className="grid grid-cols-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/70 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveUploadType('file')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center truncate ${
                  activeUploadType === 'file'
                    ? 'bg-white dark:bg-stone-800 text-emerald-900 dark:text-emerald-300 border-b-2 border-emerald-800 dark:border-emerald-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-emerald-900 dark:hover:text-emerald-300'
                }`}
              >
                <FileAudio className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">စက်ထဲမှ အသံဖိုင်</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveUploadType('gdrive');
                  if (driveToken && driveAudioFiles.length === 0) {
                    loadGoogleDriveAudios(driveToken);
                  }
                }}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center truncate ${
                  activeUploadType === 'gdrive'
                    ? 'bg-white dark:bg-stone-800 text-emerald-900 dark:text-emerald-300 border-b-2 border-emerald-800 dark:border-emerald-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-emerald-900 dark:hover:text-emerald-300'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Google Drive မှဆွဲယူ</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveUploadType('url')}
                className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center truncate ${
                  activeUploadType === 'url'
                    ? 'bg-white dark:bg-stone-800 text-emerald-900 dark:text-emerald-300 border-b-2 border-emerald-800 dark:border-emerald-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-emerald-900 dark:hover:text-emerald-300'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">အွန်လိုင်း လင့်ခ် (URL)</span>
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Mode 1: Local File Selection */}
              {activeUploadType === 'file' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    အသံဖိုင် ရွေးချယ်ပါ (MP3, WAV, M4A, OGG) *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-600 dark:hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 rounded-xl p-5 text-center cursor-pointer transition-colors"
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3 text-emerald-900 dark:text-emerald-200">
                        <FileAudio className="w-8 h-8 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        <div className="text-left">
                          <div className="text-xs sm:text-sm font-bold truncate max-w-[260px]">
                            {selectedFile.name}
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400">
                            အရွယ်အစား: {fileSizeText} {audioDuration !== '00:00' && `· ကြာချိန်: ${audioDuration}`}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-emerald-700 dark:text-emerald-400 mx-auto mb-2" />
                        <span className="text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-200 block">
                          အသံဖိုင် ရွေးချယ်ရန် ဤနေရာကို နှိပ်ပါ
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">
                          MP3, M4A, WAV, AAC ဖော်မတ်များ လက်ခံပါသည်
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mode 2: Google Drive Selection */}
              {activeUploadType === 'gdrive' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                      Google Drive ထဲရှိ အသံဖိုင်ကို ရွေးချယ်ပြီး ဆွဲယူတင်သွင်းပါ
                    </label>
                    {driveToken && (
                      <button
                        type="button"
                        onClick={() => loadGoogleDriveAudios(driveToken, driveSearch)}
                        disabled={isLoadingDrive}
                        className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                        <span>အသစ်ပြန်စစ်မည်</span>
                      </button>
                    )}
                  </div>

                  {!driveToken ? (
                    <div className="p-5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 text-center space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center mx-auto">
                        <HardDrive className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          Google Drive နှင့် ချိတ်ဆက်ပါ
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                          သင်၏ Google Drive ထဲရှိ MP3 တရားတော် အသံဖိုင်များကို စာကြည့်တိုက်ထဲသို့ တိုက်ရိုက်ဆွဲယူ ရွေးချယ်နိုင်ပါသည်
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
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={driveSearch}
                          onChange={(e) => {
                            setDriveSearch(e.target.value);
                            loadGoogleDriveAudios(driveToken, e.target.value);
                          }}
                          placeholder="Google Drive ထဲရှိ အသံဖိုင်အမည် ရှာဖွေပါ..."
                          className="w-full pl-8 pr-3 py-1.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 rounded-lg text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                        />
                      </div>

                      {/* Selected Drive Audio Card */}
                      {selectedDriveAudio && driveAudioBlob && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-emerald-950 dark:text-emerald-200">
                                ဆွဲယူပြီးပါပြီ: {selectedDriveAudio.name}
                              </span>
                              <span className="text-[11px] text-stone-500 dark:text-stone-400 ml-2">
                                ({fileSizeText})
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold shrink-0">
                            အဆင်သင့်ဖြစ်ပြီ ✓
                          </span>
                        </div>
                      )}

                      {isLoadingDrive ? (
                        <div className="p-6 text-center text-xs text-stone-500 dark:text-stone-400">
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-purple-700 dark:text-purple-400" />
                          <span>Google Drive မှ အသံဖိုင်များ ရှာဖွေနေပါသည်...</span>
                        </div>
                      ) : driveAudioFiles.length === 0 ? (
                        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700 text-center text-xs text-stone-500 dark:text-stone-400">
                          {driveSearch ? 'ရှာဖွေမှုနှင့် ကိုက်ညီသော အသံဖိုင် မတွေ့ပါ' : 'Google Drive တွင် MP3/အသံဖိုင်များ မတွေ့ရှိသေးပါ'}
                        </div>
                      ) : (
                        <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 border border-stone-200 dark:border-stone-700 rounded-lg p-2 bg-stone-50/50 dark:bg-stone-800/40">
                          {driveAudioFiles.map((file) => {
                            const isSelected = selectedDriveAudio?.id === file.id;
                            const isFetching = isFetchingDriveAudioId === file.id;
                            return (
                              <div
                                key={file.id}
                                className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                                  isSelected
                                    ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-400 text-purple-950 dark:text-purple-200 font-semibold ring-1 ring-purple-400'
                                    : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <Music className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                                  <div className="truncate">
                                    <div className="truncate font-medium">{file.name}</div>
                                    <div className="text-[10px] text-stone-400 dark:text-stone-500">
                                      {file.size ? `${(parseInt(file.size, 10) / (1024 * 1024)).toFixed(2)} MB` : 'Audio'}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleSelectDriveAudio(file)}
                                  disabled={isFetching}
                                  className={`ml-2 px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                                    isSelected
                                      ? 'bg-purple-800 dark:bg-purple-700 text-white'
                                      : 'bg-stone-200 dark:bg-stone-700 hover:bg-purple-700 hover:text-white text-stone-700 dark:text-stone-200'
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

              {/* Mode 3: Online Audio URL */}
              {activeUploadType === 'url' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    အသံဖိုင် လင့်ခ် (Direct MP3 URL သို့မဟုတ် Drive Link) *
                  </label>
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://example.com/audio/bayan.mp3"
                    className="w-full px-3.5 py-2.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  တရားတော် / ဒေသနာတော် ခေါင်းစဉ် *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ဥပမာ - စိတ်နှလုံးငြိမ်းချမ်းမှု မြန်မာဘာသာ တရားဒေသနာ"
                  className="w-full px-3.5 py-2.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  required
                />
              </div>

              {/* Speaker / Scholar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    ဟောကြားသူ / ရွတ်ဖတ်သူ ဆရာတော် *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={speaker}
                      onChange={(e) => setSpeaker(e.target.value)}
                      placeholder="ဥပမာ - မောင်လာနာ ဦးအေးလွင်"
                      className="w-full pl-9 pr-3.5 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                    အမျိုးအစား *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  >
                    <option value="bayan">တရားဒေသနာ (Bayan)</option>
                    <option value="quran">ကုရ်အာန် ရွတ်ဖတ်သံ</option>
                    <option value="hadith">ဟဒီးဆ်တော်များ</option>
                    <option value="dua">ဒိုအာနှင့် ဇိကိရ်</option>
                    <option value="history">သမိုင်းနှင့် အတ္ထုပ္ပတ္တိ</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  တရားတော် အကျဉ်းချုပ် ရှင်းလင်းချက် (စိတ်ကြိုက်)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="တရားတော်တွင် ပါဝင်သော အဓိက သာသနာ့လမ်းညွှန်ချက် အကျဉ်း..."
                  className="w-full px-3.5 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none resize-none"
                />
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-semibold rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  ပယ်ဖျက်မည်
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-emerald-900 hover:bg-emerald-950 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>တင်သွင်းနေပါသည်...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>အသံဖိုင် တင်မည်</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
