
import React, { useState } from 'react';
import { Mail, Lock, Shield, Layers, ArrowRight, AlertCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t, locale, setLocale } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    // Mock authentication
    setTimeout(() => {
      if (email === 'admin@enterprise.com' && password === 'admin123') {
        onLogin({ email, role: 'ADMIN', name: 'Nguyen Van An' });
      } else if (email === 'user@enterprise.com' && password === 'user123') {
        onLogin({ email, role: 'USER', name: 'User Test' });
      } else {
        setError(true);
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center bg-white shadow-sm rounded-lg p-1 border border-slate-200">
            <button 
              onClick={() => setLocale('vi')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${locale === 'vi' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              TIẾNG VIỆT
            </button>
            <button 
              onClick={() => setLocale('en')}
              className={`px-3 py-1 text-[10px] font-bold rounded transition-all ${locale === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              ENGLISH
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
          <div className="p-8 pb-6 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl text-white mb-6 shadow-lg shadow-indigo-200">
              <Layers size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('loginTitle')}</h1>
            <p className="text-slate-500 text-sm">{t('hotStorageDesc')}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-lg text-xs flex items-center gap-3 animate-shake">
                <AlertCircle size={16} />
                <span>{t('loginError')}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">{t('emailAddress')}</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mật khẩu</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-xs text-slate-500 font-medium group-hover:text-slate-700 transition-colors">{t('rememberMe')}</span>
              </label>
              <a href="#" className="text-xs text-indigo-600 font-bold hover:underline">{t('forgotPassword')}</a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {t('login')}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium">
              <Shield size={14} />
              <span>Cơ sở hạ tầng On-Premise được bảo mật 256-bit</span>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          Powered by MailEnable & Nextcloud Systems
        </p>
      </div>
    </div>
  );
};

export default Login;
