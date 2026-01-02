
import React, { useState } from 'react';
import { Mail, Lock, Shield, Layers, ArrowRight, AlertCircle, ChevronLeft, CheckCircle2, User as UserIcon } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface LoginProps {
  onLogin: (user: any, rememberMe: boolean) => void;
}

type LoginView = 'LOGIN' | 'FORGOT_PASSWORD' | 'RESET_SUCCESS';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t, locale, setLocale } = useLanguage();
  const [view, setView] = useState<LoginView>('LOGIN');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    if (view === 'LOGIN') {
      setTimeout(() => {
        // Lấy danh sách user thực tế từ "ổ cứng"
        const savedUsersRaw = localStorage.getItem('hdh_portal_users');
        const savedUsers = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];

        // Kiểm tra khớp thông tin
        const foundUser = savedUsers.find((u: any) => 
          (u.username === identifier || u.email === identifier) && 
          u.password === password
        );

        if (foundUser) {
          if (foundUser.status === 'Locked') {
            alert("Tài khoản của bạn đang bị khóa bởi quản trị viên hệ thống.");
            setIsLoading(false);
            return;
          }
          onLogin({ 
            email: foundUser.email, 
            role: foundUser.role, 
            name: foundUser.name,
            username: foundUser.username 
          }, rememberMe);
        } else {
          setError(true);
        }
        setIsLoading(false);
      }, 800);
    } else if (view === 'FORGOT_PASSWORD') {
      setTimeout(() => {
        setView('RESET_SUCCESS');
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-700">
          <div className="p-8 pb-4 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-2xl text-white mb-6 shadow-xl shadow-indigo-200">
               <Layers size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tighter italic">Hệ thống hdh portal</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
              {view === 'LOGIN' ? 'Xác thực người dùng nội bộ' : 'Khôi phục quyền truy cập'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 pt-0 space-y-5">
            {view === 'RESET_SUCCESS' ? (
              <div className="space-y-6 text-center animate-fadeIn">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-900">Yêu cầu đã được gửi!</p>
                  <p className="text-xs text-slate-500 leading-relaxed italic">
                    Một liên kết khôi phục đã được gửi tới email liên kết với tài khoản <span className="font-bold text-indigo-600">{identifier}</span>. 
                    Vui lòng kiểm tra hộp thư hoặc liên hệ quản trị IT.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setView('LOGIN')} 
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            ) : view === 'FORGOT_PASSWORD' ? (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email / Username</label>
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Nhập tài khoản cần khôi phục"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-bold text-sm"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-70"
                >
                  {isLoading ? "Đang xử lý..." : "Gửi liên kết khôi phục"}
                </button>

                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={() => { setView('LOGIN'); setError(false); }} 
                    className="flex items-center justify-center gap-2 mx-auto text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                  >
                    <ChevronLeft size={14} /> Quay lại đăng nhập
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-fadeIn">
                {error && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 animate-shake">
                    <AlertCircle size={16} /> Sai thông tin đăng nhập
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Account ID</label>
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Username hoặc Email"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-bold text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Security Key</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu hệ thống"
                    required
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-bold text-sm"
                  />
                </div>

                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 border-2 rounded-md transition-all ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}>
                        {rememberMe && <CheckCircle2 size={14} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duy trì đăng nhập</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={() => { setView('FORGOT_PASSWORD'); setError(false); }} 
                    className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-70"
                >
                  {isLoading ? "Đang xác thực..." : "Đăng nhập hệ thống"}
                </button>
              </div>
            )}
          </form>
        </div>
        <p className="mt-8 text-center text-slate-400 text-[9px] font-bold uppercase tracking-[0.3em]">Protected by Enterprise Security v2.5</p>
      </div>
    </div>
  );
};

export default Login;
