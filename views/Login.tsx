
import React, { useState, useEffect } from 'react';
import { Mail, Lock, Shield, Layers, ArrowRight, AlertCircle, ChevronLeft, CheckCircle2, User as UserIcon, Smartphone, Key, HardDrive, RefreshCw } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface LoginProps {
  onLogin: (user: any, rememberMe: boolean) => void;
  onConnect?: () => void;
  isDiskConnected?: boolean;
}

type LoginView = 'LOGIN' | 'MFA_CHALLENGE' | 'FORGOT_PASSWORD' | 'RESET_SUCCESS';

const Login: React.FC<LoginProps> = ({ onLogin, onConnect, isDiskConnected }) => {
  const { t, locale, setLocale } = useLanguage();
  const [view, setView] = useState<LoginView>('LOGIN');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);

  const [db, setDb] = useState<any>(() => {
    const cache = localStorage.getItem('hdh_master_db_cache');
    return cache ? JSON.parse(cache) : null;
  });

  // Tự động cập nhật DB state khi Master DB thay đổi (ví dụ: sau khi kết nối disk thành công)
  useEffect(() => {
    const handleSync = () => {
      const cache = localStorage.getItem('hdh_master_db_cache');
      if (cache) setDb(JSON.parse(cache));
    };
    window.addEventListener('storage_sync', handleSync);
    return () => window.removeEventListener('storage_sync', handleSync);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    if (view === 'LOGIN') {
      setTimeout(() => {
        // Lấy danh sách user thực tế từ Master DB Cache (Đồng bộ từ hdh_master_db.json)
        const cache = localStorage.getItem('hdh_master_db_cache');
        const currentDb = cache ? JSON.parse(cache) : { users: [] };
        const savedUsers = currentDb.users || [];

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

          // Kiểm tra chính sách MFA
          const policies = currentDb.policies || {};
          const isAdminMfaEnabled = foundUser.role === 'ADMIN' && policies.adminMfa;

          if (isAdminMfaEnabled) {
            setAuthenticatedUser(foundUser);
            setView('MFA_CHALLENGE');
            setIsLoading(false);
          } else {
            onLogin({ 
              email: foundUser.email, 
              role: foundUser.role, 
              name: foundUser.name,
              username: foundUser.username,
              avatar: foundUser.avatar
            }, rememberMe);
          }
        } else {
          setError(true);
          setIsLoading(false);
        }
      }, 800);
    } else if (view === 'MFA_CHALLENGE') {
      // Giả lập xác thực mã OTP
      setTimeout(() => {
        if (mfaCode === '123456' || mfaCode.length === 6) {
          onLogin({ 
            email: authenticatedUser.email, 
            role: authenticatedUser.role, 
            name: authenticatedUser.name,
            username: authenticatedUser.username,
            avatar: authenticatedUser.avatar
          }, rememberMe);
        } else {
          alert("Mã xác thực không chính xác. Vui lòng thử lại.");
        }
        setIsLoading(false);
      }, 1000);
    } else if (view === 'FORGOT_PASSWORD') {
      setTimeout(() => {
        setView('RESET_SUCCESS');
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        
        {/* Widget LAN Sync Connection - Rất quan trọng để khắc phục lỗi không đồng bộ giữa các trình duyệt/máy tính */}
        <div className={`p-4 rounded-[1.5rem] border shadow-sm transition-all animate-fadeIn ${
          isDiskConnected ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-white shadow-sm`}>
                <HardDrive size={18} className={!isDiskConnected ? 'animate-pulse' : ''} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                  {isDiskConnected ? 'LAN Sync Active' : 'Offline / Isolated'}
                </p>
                <p className="text-[9px] font-bold mt-1 opacity-70 truncate italic">
                  {isDiskConnected ? 'Master DB: hdh_master_db.json connected' : 'Database chưa được liên kết với mạng LAN'}
                </p>
              </div>
            </div>
            {!isDiskConnected ? (
              <button 
                onClick={onConnect}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-rose-700 active:scale-95 transition-all"
              >
                Kết nối LAN
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600">
                <CheckCircle2 size={12} /> Live
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden text-slate-700">
          
          {/* Header */}
          <div className="p-8 pb-4 text-center">
            <div className={`inline-flex items-center justify-center p-4 rounded-2xl text-white mb-6 shadow-xl ${view === 'MFA_CHALLENGE' ? 'bg-rose-600 shadow-rose-100' : 'bg-indigo-600 shadow-indigo-200'}`}>
               {view === 'MFA_CHALLENGE' ? <Smartphone size={32} /> : <Layers size={32} />}
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tighter italic">Hệ thống hdh portal</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6 px-4">
              {view === 'LOGIN' ? 'Xác thực người dùng nội bộ' : 
               view === 'MFA_CHALLENGE' ? 'Xác thực đa yếu tố (MFA Required)' :
               'Khôi phục quyền truy cập'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 pt-0 space-y-5">
            
            {/* View: MFA Challenge */}
            {view === 'MFA_CHALLENGE' ? (
              <div className="space-y-6 animate-scaleUp">
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4">
                  <Shield className="text-rose-600 shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-xs font-bold text-rose-900 leading-tight">Mã bảo mật bare-metal</p>
                    <p className="text-[10px] text-rose-700/70 font-medium mt-1">Nhập mã 6 chữ số từ ứng dụng Authenticator của bạn.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">OTP Code</label>
                  <div className="relative group">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-600" size={18} />
                    <input 
                      type="text"
                      maxLength={6}
                      value={mfaCode}
                      autoFocus
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-rose-50 focus:border-rose-600 transition-all font-black text-xl tracking-[0.5em] text-center"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || mfaCode.length < 6}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-100 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? "Đang xác nhận..." : "Xác thực và Truy cập"}
                </button>

                <button 
                  type="button"
                  onClick={() => setView('LOGIN')}
                  className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                >
                  Quay lại đăng nhập
                </button>
              </div>
            ) : view === 'RESET_SUCCESS' ? (
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
                    <AlertCircle size={16} /> Sai thông tin đăng nhập hoặc Database chưa đồng bộ
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

                {!isDiskConnected && (
                  <p className="text-[9px] text-slate-400 text-center font-bold italic leading-relaxed px-4">
                    Lưu ý: Nếu bạn vừa tạo tài khoản ở trình duyệt khác, hãy nhấn "Kết nối LAN" và chọn thư mục dữ liệu hdh để đồng bộ trước khi đăng nhập.
                  </p>
                )}
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
