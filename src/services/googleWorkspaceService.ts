import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase/firebase';

// Required Google Workspace scopes
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.body.readonly',
  'https://www.googleapis.com/auth/forms.responses.readonly'
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => provider.addScope(scope));

// In-memory token caching per skill guidelines (never store tokens in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
}

export interface GoogleFormItem {
  formId: string;
  title: string;
  description?: string;
  responderUri?: string;
  revisionId?: string;
  responsesCount?: number;
}

export interface GoogleFormResponseItem {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  answers?: Record<string, { textAnswers?: { answers?: { value?: string }[] } }>;
}

/**
 * Initialize auth listener to keep track of user and token
 */
export function initWorkspaceAuth(
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) {
  return onAuthStateChanged(auth, async (user) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
}

/**
 * Google Sign In with Workspace scopes
 */
export async function signInWithGoogleWorkspace(): Promise<{ user: FirebaseUser; accessToken: string }> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google OAuth access token');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Workspace sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Get current in-memory access token
 */
export function getWorkspaceAccessToken(): string | null {
  return cachedAccessToken;
}

/**
 * Logout from Workspace
 */
export async function logoutWorkspace() {
  await signOut(auth);
  cachedAccessToken = null;
}

/* ==========================================================
   Google Drive APIs
   ========================================================== */

/**
 * Search and list PDF and document files in user's Google Drive
 */
export async function listDrivePdfFiles(token: string, searchKeyword?: string): Promise<DriveFileItem[]> {
  try {
    // Search for PDFs or files matching Islamic or books
    let q = "(mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.document') and trashed = false";
    if (searchKeyword && searchKeyword.trim()) {
      const sanitized = searchKeyword.replace(/'/g, "\\'");
      q += ` and name contains '${sanitized}'`;
    }
    const query = encodeURIComponent(q);
    const fields = encodeURIComponent('files(id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=40&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Google Drive API error: ${res.status}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Failed to list Drive files:', err);
    throw err;
  }
}

/**
 * Search and list audio files in user's Google Drive
 */
export async function listDriveAudioFiles(token: string, searchKeyword?: string): Promise<DriveFileItem[]> {
  try {
    let q = "(mimeType contains 'audio/' or name contains '.mp3' or name contains '.m4a' or name contains '.wav' or name contains '.aac' or name contains '.ogg' or name contains '.flac') and trashed = false";
    if (searchKeyword && searchKeyword.trim()) {
      const sanitized = searchKeyword.replace(/'/g, "\\'");
      q += ` and name contains '${sanitized}'`;
    }
    const query = encodeURIComponent(q);
    const fields = encodeURIComponent('files(id, name, mimeType, size, webViewLink, webContentLink, thumbnailLink, createdTime)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=40&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Google Drive API error: ${res.status}`);
    }

    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Failed to list Drive audio files:', err);
    throw err;
  }
}

/**
 * Download a file from Google Drive as a Blob
 */
export async function downloadDriveFileBlob(token: string, fileId: string, mimeType?: string): Promise<Blob> {
  let url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  if (mimeType === 'application/vnd.google-apps.document') {
    url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=application/pdf`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download file from Google Drive: ${res.status}`);
  }

  return await res.blob();
}

/**
 * Download a file from Google Drive as Base64 Data URL
 */
export async function downloadDriveFileAsDataUrl(token: string, fileId: string, mimeType?: string): Promise<string> {
  const blob = await downloadDriveFileBlob(token, fileId, mimeType);
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload an Islamic book / PDF to Google Drive
 */
export async function uploadBookToGoogleDrive(
  token: string,
  fileName: string,
  blobOrText: Blob | string,
  mimeType: string = 'application/pdf'
): Promise<DriveFileItem> {
  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: 'Uploaded via Al_HikMah Islamic Digital Library',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  
  if (typeof blobOrText === 'string') {
    form.append('file', new Blob([blobOrText], { type: mimeType }));
  } else {
    form.append('file', blobOrText);
  }

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload to Google Drive: ${res.status}`);
  }

  return await res.json();
}

/* ==========================================================
   Google Forms APIs
   ========================================================== */

/**
 * List Google Forms in user's Drive
 */
export async function listUserGoogleForms(token: string): Promise<GoogleFormItem[]> {
  try {
    const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.form' and trashed = false");
    const fields = encodeURIComponent('files(id, name, webViewLink, createdTime)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=20&orderBy=modifiedTime desc`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Google Drive forms search error: ${res.status}`);
    }

    const data = await res.json();
    const files = data.files || [];

    return files.map((f: any) => ({
      formId: f.id,
      title: f.name,
      responderUri: f.webViewLink,
    }));
  } catch (err) {
    console.error('Failed to list Google Forms:', err);
    throw err;
  }
}

/**
 * Get form details from Google Forms API
 */
export async function getFormDetails(token: string, formId: string): Promise<any> {
  const url = `https://forms.googleapis.com/v1/forms/${formId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Forms API error: ${res.status}`);
  }

  return await res.json();
}

/**
 * Get form responses from Google Forms API
 */
export async function getFormResponses(token: string, formId: string): Promise<GoogleFormResponseItem[]> {
  const url = `https://forms.googleapis.com/v1/forms/${formId}/responses`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Forms responses API error: ${res.status}`);
  }

  const data = await res.json();
  return data.responses || [];
}

/**
 * Create a new Islamic Fatwa & Inquiry Google Form
 */
export async function createIslamicFatwaGoogleForm(
  token: string,
  title: string = 'Al_HikMah - အစ္စလာမ် ဓမ္မသတ်နှင့် သာသနာ့ အမေးအဖြေ ဖောင်'
): Promise<GoogleFormItem> {
  // Step 1: Create empty form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: title,
        documentTitle: title,
      },
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Create form error: ${createRes.status}`);
  }

  const newForm = await createRes.json();
  const formId = newForm.formId;

  // Step 2: Batch update to add questions (Name, Category, Question)
  const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          createItem: {
            item: {
              title: 'အမည် (သို့မဟုတ် ကလောင်အမည်)',
              description: 'မေးမြန်းသူ၏ အမည်ကို ထည့်သွင်းပါ',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: false },
                },
              },
            },
            location: { index: 0 },
          },
        },
        {
          createItem: {
            item: {
              title: 'နေရပ်မြို့နယ် / တိုင်းဒေသကြီး',
              description: 'နမားဇ်အချိန်နှင့် ဒေသဆိုင်ရာ ဓမ္မသတ်အတွက် ဒေသကို ဖော်ပြပေးပါ',
              questionItem: {
                question: {
                  required: false,
                  textQuestion: { paragraph: false },
                },
              },
            },
            location: { index: 1 },
          },
        },
        {
          createItem: {
            item: {
              title: 'မေးခွန်းကဏ္ဍ (Question Category)',
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: 'RADIO',
                    options: [
                      { value: 'နမားဇ်နှင့် ဝူဇူ ဆိုင်ရာ' },
                      { value: 'ရမ်ဇာန် ဥပုသ်သီလ ဆိုင်ရာ' },
                      { value: 'ဇကားသ်နှင့် စီးပွားရေးဆိုင်ရာ' },
                      { value: 'အိမ်ထောင်ရေးနှင့် မိသားစုဆိုင်ရာ' },
                      { value: 'အထွေထွေ ဓမ္မသတ်' },
                    ],
                  },
                },
              },
            },
            location: { index: 2 },
          },
        },
        {
          createItem: {
            item: {
              title: 'သာသနာ့ဓမ္မသတ် မေးမြန်းချက် (Fatwa Question)',
              description: 'သိရှိလိုသော သာသနာ့ အဆုံးအဖြတ်ကို အသေးစိတ် ရေးသားပေးပါ',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: true },
                },
              },
            },
            location: { index: 3 },
          },
        },
      ],
    }),
  });

  if (!updateRes.ok) {
    console.warn('Batch update to add form fields failed, returning basic form', updateRes.status);
  }

  return {
    formId: formId,
    title: title,
    responderUri: newForm.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`,
  };
}
