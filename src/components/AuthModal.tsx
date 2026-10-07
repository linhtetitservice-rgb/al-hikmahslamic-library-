import React, { useState } from 'react';
import { X, LogIn, UserPlus, Lock, Mail, User, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMessage,
    login,
    loginAsAdmin,
    loginAsDemo,
    register,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@alhikmah.mm');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email.trim()) {
        setError('အီးမေးလ် ရိုက်ထည့်ပါ');
        return;
      }
      if (email.trim().toLowerCase().includes('admin')) {
        loginAsAdmin();
      } else {
        login(email.trim(), password);
      }
    } else {
      if (!name.trim() || !email.trim()) {
        setError('အမည်နှင့် အီးမေးလ် အပြည့်အစုံ ရိုက်ထည့်ပါ');
        return;
      }
      register(name.trim(), email.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-md w-full my-6 overflow-hidden border border-stone-200 dark:border-stone-800 transition-colors">
        
        {/* Header */}
        <div className="bg-emerald-950 text-white p-6 relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-xl bg-emerald-800/80 border border-emerald-700 flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>

          <h3 className="font-bold text-xl text-white">
            {mode === 'login' ? 'အဖွဲ့ဝင်အဖြစ် ဝင်ရောက်ရန် (Login)' : 'အဖွဲ့ဝင်အသစ် စာရင်းသွင်းရန် (Register)'}
          </h3>

          <p className="text-xs text-emerald-200/90 mt-1">
            {authModalMessage || 'အစ္စလာမ်မီ ဒစ်ဂျစ်တယ် စာကြည့်တိုက်နှင့် သာသနာ့ ဝန်ဆောင်မှုများကို အပြည့်အဝ အသုံးပြုပါ'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          
          {/* Public access friendly notice */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 rounded-xl text-emerald-950 dark:text-emerald-200 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">စာဖတ်သူများအတွက် အထူးသတိပြုရန်-</span>
              <span>မည်သူမဆို အကောင့်ဖွင့်ရန် သို့မဟုတ် Login ဝင်ရန် မလိုအပ်ဘဲ စာကြည့်တိုက်ရှိ စာအုပ်များ၊ PDF များနှင့် တရားတော် အသံဖိုင်များကို လွတ်လပ်စွာ ဖတ်ရှုနားဆင်နိုင်ပါသည်။ စာအုပ်နှင့် တရားတော် အသံဖိုင် တင်သွင်းခြင်းအတွက် Admin သာ Login ဝင်ရန် လိုအပ်ပါသည်။</span>
            </div>
          </div>

          {/* Quick Admin Login Button */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={loginAsAdmin}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-slate-950" />
              <span>Admin စီမံခန့်ခွဲသူအဖြစ် ချက်ချင်းဝင်ရောက်မည်</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <hr className="w-full border-stone-200 dark:border-stone-800" />
            <span className="absolute bg-white dark:bg-stone-900 px-2 text-[11px] text-stone-400 dark:text-stone-500">သို့မဟုတ် အီးမေးလ်ဖြင့် ဝင်ရန်</span>
          </div>

          {/* Real login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 text-xs">
                  အမည်
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ဥပမာ- ကိုမင်းခန့်"
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 text-xs">
                အီးမေးလ် လိပ်စာ
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1 text-xs">
                စကားဝှက် (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>ဝင်ရောက်မည်</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>စာရင်းသွင်းမည်</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="text-center pt-1 text-xs text-stone-600 dark:text-stone-400">
            {mode === 'login' ? (
              <span>
                အကောင့် မရှိသေးပါသလား?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-emerald-800 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  အသစ်စာရင်းသွင်းရန်
                </button>
              </span>
            ) : (
              <span>
                အကောင့် ရှိပြီးသားဖြစ်ပါသလား?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-emerald-800 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Login ပြန်ဝင်ရန်
                </button>
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
