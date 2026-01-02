
import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Mail, Building2, Calendar, Camera, Lock, Bell, Shield, Save, 
  CheckCircle2, Key, Smartphone, Eye, EyeOff, LogOut, Settings, Info, AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface UserProfileProps {
  user: any;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Khởi tạo state từ dữ liệu thực tế trong DB
  const [localUserData, setLocalUserData] = useState<any>(null);

  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem('hdh_portal_users') || '[]');
    const currentUser = allUsers.find((u: any) => u.username === user.username);
    if (currentUser) {
      setLocalUserData(currentUser);
    } else {
      setLocalUserData(user);
    }
  }, [user.username]);

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    notifyEmail: true,
    notifyBrowser: true,
    notifySystem: true,
    mfaEnabled: user.role === 'ADMIN'
  });

  if (!localUserData) return <div className="p-20 text-center font-bold text-slate-400">Đang truy xuất hạ tầng profile...</div>;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Avatar = reader.result as string;
        
        // LƯU THỰC: Cập nhật vào DB tổng
        const allUsers = JSON.parse(localStorage.getItem('hdh_portal_users') || '[]');
        const updatedUsers = allUsers.map((u: any) => 
          u.username === localUserData.username ? { ...u, avatar: base64Avatar } : u
        );
        localStorage.setItem('hdh_portal_users', JSON.stringify(updatedUsers));

        // Cập nhật session hiện tại
        const session = JSON.parse(localStorage.getItem('hdh_current_session') || '{}');
        if (session.username === localUserData.username) {
          localStorage.setItem('hdh_current_session', JSON.stringify({ ...session, avatar: base64Avatar }));
        }

        setLocalUserData({ ...localUserData, avatar: base64Avatar });
        window.dispatchEvent(new Event('storage'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      // Chỉ Admin mới được xử lý logic đổi mật khẩu ở đây
      if (isAdmin && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          alert("Mật khẩu xác nhận không khớp");
          setIsSaving(false);
          return;
        }
        
        const allUsers = JSON.parse(localStorage.getItem('hdh_portal_users') || '[]');
        const updatedUsers = allUsers.map((u: any) => 
          u.username === localUserData.username ? { ...u, password: formData.newPassword } : u
        );
        localStorage.setItem('hdh_portal_users', JSON.stringify(updatedUsers));
      }

      // Lưu các settings thông báo (User vẫn được quyền chỉnh sửa cái này)
      const settings = {
        notifyEmail: formData.notifyEmail,
        notifyBrowser: formData.notifyBrowser,
        notifySystem: formData.notifySystem,
        mfaEnabled: formData.mfaEnabled
      };
      localStorage.setItem(`hdh_settings_${localUserData.username}`, JSON.stringify(settings));

      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  const currentAvatar = localUserData.avatar || `https://picsum.photos/seed/${localUserData.name}/120/120`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <User className="text-indigo-600" size={28} />
            Hồ sơ cá nhân
          </h2>
          <p className="text-slate-500 text-sm italic">Hệ thống lưu trữ On-premise Bare-metal (Dữ liệu tồn tại trên ổ cứng cục bộ).</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold animate-scaleUp bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
            <CheckCircle2 size={18} />
            Đã đồng bộ dữ liệu vào ổ cứng
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Summary & Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-32 bg-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            </div>
            <div className="px-6 pb-8 text-center -mt-16 relative z-10">
              <div className="relative inline-block group">
                <div className="w-32 h-32 rounded-[2rem] border-8 border-white shadow-2xl overflow-hidden bg-slate-200">
                  <img 
                    src={currentAvatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  onClick={handleAvatarClick}
                  className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 border-4 border-white"
                >
                  <Camera size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
              <h3 className="mt-4 text-xl font-black text-slate-900 uppercase italic tracking-tighter">{localUserData.name}</h3>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${localUserData.role === 'ADMIN' ? 'text-rose-600' : 'text-indigo-600'}`}>
                System {localUserData.role}
              </p>
            </div>
            <div className="border-t border-slate-50 p-8 space-y-6 bg-slate-50/30">
              <InfoItem icon={<Mail size={16} />} label="Email định danh" value={localUserData.email} />
              <InfoItem icon={<Building2 size={16} />} label="Phòng ban" value={localUserData.dept || "IT Systems"} />
              <InfoItem icon={<User size={16} />} label="Mã nhân viên" value={`EMP-${localUserData.id}`} />
              <InfoItem icon={<Calendar size={16} />} label="Ngày khởi tạo" value="20/10/2024" />
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <h4 className="font-black text-[11px] mb-6 flex items-center gap-3 uppercase tracking-[0.2em] text-indigo-400">
              <Shield size={18} /> Bảo mật & MFA
            </h4>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authenticator Status</span>
                <span className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-widest ${formData.mfaEnabled ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {formData.mfaEnabled ? 'Protected' : 'Risk'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium">
                * Mã xác thực 2 lớp (MFA) được đồng bộ hóa với hệ thống AD nội bộ để bảo vệ các thao tác hạ tầng.
              </p>
              {isAdmin && (
                <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">
                  Lấy lại mã phục hồi
                </button>
              )}
            </div>
            <Lock size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSaveSettings} className="space-y-8">
            
            {/* Password Section - CHỈ HIỂN THỊ VỚI ADMIN */}
            {isAdmin ? (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-fadeIn">
                <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><Key className="text-indigo-600" size={18} /></div>
                  <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-[0.2em] italic">Thay đổi khóa bảo mật</h3>
                </div>
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu cũ</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={formData.oldPassword}
                          onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-bold" 
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <div></div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={formData.newPassword}
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-bold" 
                          placeholder="Tối thiểu 8 ký tự"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-bold" 
                          placeholder="Nhập lại mật khẩu mới"
                        />
                      </div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-indigo-600 font-black uppercase tracking-widest flex items-center gap-2 hover:underline"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showPassword ? "Ẩn khóa bí mật" : "Hiện khóa bí mật"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 rounded-[2.5rem] border border-amber-200 p-8 flex items-start gap-6 animate-fadeIn shadow-sm shadow-amber-50">
                <div className="p-4 bg-white rounded-2xl text-amber-600 shadow-sm border border-amber-100">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-2">Thông báo bảo mật</h3>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Theo quy định an toàn hệ thống hdh, người dùng không được phép tự thay đổi các thiết lập bảo mật cấp cao (Mật khẩu, MFA). 
                  </p>
                  <p className="text-xs text-amber-700/80 leading-relaxed font-bold mt-2 italic">
                    Vui lòng liên hệ Quản trị viên (Admin) hoặc bộ phận IT Systems để yêu cầu cập nhật thông tin bảo mật.
                  </p>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm"><Bell className="text-indigo-600" size={18} /></div>
                <h3 className="font-black text-slate-900 text-[11px] uppercase tracking-[0.2em] italic">Kênh thông báo nội bộ</h3>
              </div>
              <div className="p-10 space-y-10 bg-white">
                <ToggleItem 
                  label="Email Notification" 
                  description="Nhận thông báo mail khi có yêu cầu phê duyệt mới trong luồng." 
                  enabled={formData.notifyEmail}
                  onToggle={() => setFormData({...formData, notifyEmail: !formData.notifyEmail})}
                />
                <ToggleItem 
                  label="Browser Realtime" 
                  description="Thông báo đẩy ngay lập tức trên trình duyệt khi nhận Mail nội bộ." 
                  enabled={formData.notifyBrowser}
                  onToggle={() => setFormData({...formData, notifyBrowser: !formData.notifyBrowser})}
                />
                <ToggleItem 
                  label="Security Critical" 
                  description="Các cảnh báo về thay đổi hạ tầng và khóa tài khoản từ quản trị viên." 
                  enabled={formData.notifySystem}
                  onToggle={() => setFormData({...formData, notifySystem: !formData.notifySystem})}
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-end gap-6 pt-4">
              <button 
                type="button" 
                className="px-6 py-2.5 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-800 transition-all"
              >
                Hủy thay đổi
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-70 active:scale-95"
              >
                {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                Lưu dữ liệu vào ổ cứng
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-start gap-5 group">
    <div className="mt-1 p-3 bg-white border border-slate-100 text-slate-400 rounded-xl transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg shadow-indigo-50">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-colors">{label}</p>
      <p className="text-sm font-bold text-slate-900 truncate">{value}</p>
    </div>
  </div>
);

const ToggleItem = ({ label, description, enabled, onToggle }: { label: string, description: string, enabled: boolean, onToggle: () => void }) => (
  <div className="flex items-center justify-between gap-10">
    <div className="flex-1">
      <h4 className="text-xs font-black text-slate-800 mb-1 uppercase tracking-widest">{label}</h4>
      <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
    <button 
      type="button"
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 shrink-0 shadow-inner ${enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${enabled ? 'left-7' : 'left-1'}`}></div>
    </button>
  </div>
);

export default UserProfile;
