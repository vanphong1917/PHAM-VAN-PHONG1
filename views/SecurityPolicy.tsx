
import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, FileWarning, Clock, Lock, Smartphone, Save, AlertCircle, 
  Eye, EyeOff, CheckCircle2, Monitor, Globe, X, LogOut, ShieldAlert,
  Smartphone as PhoneIcon, Laptop, MonitorStop
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const DEFAULT_POLICIES = {
  minPasswordLength: 12,
  requireComplexity: true,
  passwordExpiry: 90,
  maxFileSize: 35,
  enforceNextcloud: true,
  adminMfa: true,
  lanMfa: false,
  autoLogout: 30,
  deviceLimit: 3
};

const SIMULATED_SESSIONS = [
  { id: 'SESS-001', user: 'admin.hdh', device: 'Chrome / Windows 11', ip: '192.168.1.15', location: 'Hà Nội, VN', lastActive: 'Đang hoạt động', current: true, type: 'PC' },
  { id: 'SESS-002', user: 'admin.hdh', device: 'iPhone 15 Pro', ip: '172.16.0.42', location: 'TP. Hồ Chí Minh, VN', lastActive: '2 phút trước', current: false, type: 'MOBILE' },
  { id: 'SESS-003', user: 'phong.hdh', device: 'Edge / MacOS', ip: '10.0.4.102', location: 'Hà Nội, VN', lastActive: '15 phút trước', current: false, type: 'PC' }
];

const SecurityPolicy: React.FC = () => {
  const { t } = useLanguage();
  const [showValues, setShowValues] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // State quản lý Modal Sessions
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  // Initialize from master cache
  const [policies, setPolicies] = useState(() => {
    const cache = localStorage.getItem('hdh_master_db_cache');
    const db = cache ? JSON.parse(cache) : {};
    return db.policies || DEFAULT_POLICIES;
  });

  useEffect(() => {
    // Load sessions from DB or use simulated if empty
    const cache = localStorage.getItem('hdh_master_db_cache');
    const db = cache ? JSON.parse(cache) : {};
    if (!db.active_sessions) {
      setActiveSessions(SIMULATED_SESSIONS);
    } else {
      setActiveSessions(db.active_sessions);
    }
  }, []);

  const handleToggle = (key: keyof typeof policies) => {
    setPolicies((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleValueChange = (key: keyof typeof policies, value: number) => {
    setPolicies((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Cập nhật vào Master DB Cache
    const cache = localStorage.getItem('hdh_master_db_cache');
    if (cache) {
      const db = JSON.parse(cache);
      db.policies = policies;
      db.active_sessions = activeSessions; // Đồng bộ luôn cả danh sách phiên
      localStorage.setItem('hdh_master_db_cache', JSON.stringify(db));
      window.dispatchEvent(new Event('storage_sync'));
    }
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const revokeSession = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn ngắt kết nối thiết bị này? Người dùng sẽ phải đăng nhập lại.")) {
      const updated = activeSessions.filter(s => s.id !== id);
      setActiveSessions(updated);
      
      // Cập nhật Master DB ngay lập tức
      const cache = localStorage.getItem('hdh_master_db_cache');
      if (cache) {
        const db = JSON.parse(cache);
        db.active_sessions = updated;
        localStorage.setItem('hdh_master_db_cache', JSON.stringify(db));
        window.dispatchEvent(new Event('storage_sync'));
      }
    }
  };

  // Tính toán chỉ số an toàn hệ thống dựa trên cấu hình hiện tại
  const securityScore = (() => {
    let score = 50;
    if (policies.adminMfa) score += 25;
    if (policies.requireComplexity) score += 10;
    if (policies.minPasswordLength >= 12) score += 10;
    if (policies.lanMfa) score += 5;
    return score;
  })();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
             <Shield className="text-indigo-600" /> {t('securityTitle')}
          </h2>
          <p className="text-slate-500 text-sm">Quản lý cấu hình bảo mật On-Premise (Bare-metal Security Node).</p>
        </div>
        <div className="flex items-center gap-3">
          {showSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold animate-scaleUp">
              <CheckCircle2 size={18} />
              Đã đồng bộ chính sách vào Master DB
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save size={16} />
            )}
            Lưu chính sách bảo mật
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Policy */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-widest flex items-center gap-2">
              <Key size={18} className="text-indigo-600" /> {t('passwordPolicy')}
            </h3>
            <button onClick={() => setShowValues(!showValues)} className="text-slate-400 hover:text-indigo-600">
              {showValues ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="p-8 space-y-8">
            <PolicyControl 
              label={t('minPasswordLength')} 
              description="Số lượng ký tự tối thiểu yêu cầu cho mật khẩu người dùng"
              value={policies.minPasswordLength}
              onChange={(val: number) => handleValueChange('minPasswordLength', val)}
              unit="ký tự"
            />
            <ToggleControl 
              label={t('requireComplexity')} 
              description="Yêu cầu chứa chữ hoa, chữ thường, số và ký tự đặc biệt"
              enabled={policies.requireComplexity}
              onToggle={() => handleToggle('requireComplexity')}
            />
            <PolicyControl 
              label="Thời hạn mật khẩu" 
              description="Số ngày trước khi người dùng bắt buộc phải đổi mật khẩu"
              value={policies.passwordExpiry}
              onChange={(val: number) => handleValueChange('passwordExpiry', val)}
              unit="ngày"
            />
          </div>
        </div>

        {/* Attachment & File Policy */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-widest flex items-center gap-2">
              <FileWarning size={18} className="text-amber-600" /> {t('attachmentPolicyTitle')}
            </h3>
          </div>
          <div className="p-8 space-y-8">
            <PolicyControl 
              label={t('maxFileSize')} 
              description="Kích thước tối đa cho phép đính kèm trực tiếp trong Mail01"
              value={policies.maxFileSize}
              onChange={(val: number) => handleValueChange('maxFileSize', val)}
              unit="MB"
            />
            <ToggleControl 
              label={t('enforceNextcloud')} 
              description="Tự động chuyển đổi tệp lớn thành liên kết chia sẻ Nextcloud"
              enabled={policies.enforceNextcloud}
              onToggle={() => handleToggle('enforceNextcloud')}
            />
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 text-amber-800 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>Mọi tệp tin trên {policies.maxFileSize}MB sẽ được Nextcloud Cluster xử lý để tối ưu hiệu năng ổ NVMe Index.</p>
            </div>
          </div>
        </div>

        {/* MFA & Identification */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-widest flex items-center gap-2">
              <Smartphone size={18} className="text-emerald-600" /> {t('mfaTitle')}
            </h3>
          </div>
          <div className="p-8 space-y-8">
            <ToggleControl 
              label="Yêu cầu MFA cho quản trị viên" 
              description="Bắt buộc sử dụng Authenticator app cho tài khoản Admin"
              enabled={policies.adminMfa}
              onToggle={() => handleToggle('adminMfa')}
            />
            <ToggleControl 
              label="MFA cho người dùng LAN" 
              description="Kích hoạt MFA ngay cả khi truy cập từ mạng nội bộ"
              enabled={policies.lanMfa}
              onToggle={() => handleToggle('lanMfa')}
            />
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Tình trạng bảo mật</p>
                  <p className="text-[10px] text-slate-500 font-bold">Node: BARE-METAL-SEC-01</p>
                </div>
              </div>
              <div className="h-12 w-12 flex items-center justify-center border-4 border-emerald-500 border-t-transparent rounded-full font-black text-[10px] text-emerald-600">
                {securityScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-widest flex items-center gap-2">
              <Clock size={18} className="text-slate-600" /> {t('sessionPolicy')}
            </h3>
          </div>
          <div className="p-8 space-y-8">
            <PolicyControl 
              label={t('autoLogout')} 
              description="Thời gian không hoạt động trước khi phiên làm việc bị ngắt"
              value={policies.autoLogout}
              onChange={(val: number) => handleValueChange('autoLogout', val)}
              unit="phút"
            />
            <PolicyControl 
              label="Giới hạn thiết bị" 
              description="Số lượng thiết bị tối đa có thể đăng nhập cùng lúc"
              value={policies.deviceLimit}
              onChange={(val: number) => handleValueChange('deviceLimit', val)}
              unit="thiết bị"
            />
            <button 
              onClick={() => setIsSessionsModalOpen(true)}
              className="pt-4 flex items-center gap-2 text-[10px] font-black text-indigo-600 cursor-pointer hover:underline uppercase tracking-widest"
            >
              Xem tất cả các phiên đang hoạt động <Lock size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Sessions Modal */}
      {isSessionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Monitor size={20} /></div>
                 <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Quản lý phiên hoạt động</h3>
              </div>
              <button onClick={() => setIsSessionsModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8">
              <div className="mb-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3">
                <ShieldAlert className="text-indigo-600 shrink-0" size={20} />
                <p className="text-xs text-indigo-900 font-medium">
                  Danh sách dưới đây hiển thị tất cả các thiết bị hiện đang duy trì phiên đăng nhập vào hdh portal. Bạn có thể thu hồi quyền truy cập của bất kỳ thiết bị nào từ xa.
                </p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {activeSessions.map((session) => (
                  <div key={session.id} className="p-5 bg-white border border-slate-100 rounded-[1.5rem] hover:border-indigo-200 hover:shadow-sm transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${session.current ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                          {session.type === 'PC' ? <Laptop size={20} /> : <PhoneIcon size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-900">{session.device}</p>
                            {session.current && <span className="text-[8px] font-black bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded uppercase">Phiên hiện tại</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Globe size={12} /> {session.ip}</span>
                            <span className="text-slate-200">•</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.location}</span>
                          </div>
                        </div>
                      </div>
                      
                      {!session.current && (
                        <button 
                          onClick={() => revokeSession(session.id)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Ngắt kết nối thiết bị"
                        >
                          <MonitorStop size={20} />
                        </button>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tài khoản: <span className="text-indigo-600">{session.user}</span></p>
                      <p className="text-[10px] font-bold text-slate-400 italic">{session.lastActive}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsSessionsModalOpen(false)} className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all">
                Đóng danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface PolicyControlProps {
  label: string;
  description: string;
  value: number;
  unit: string;
  onChange: (val: number) => void;
}

const PolicyControl: React.FC<PolicyControlProps> = ({ label, description, value, unit, onChange }) => (
  <div className="flex items-start justify-between gap-6 group">
    <div className="flex-1">
      <h4 className="text-sm font-black text-slate-800 mb-1 uppercase tracking-tight">{label}</h4>
      <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 min-w-[120px] justify-between shadow-inner focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="bg-transparent border-none outline-none text-sm font-black text-slate-900 w-12 text-center"
      />
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{unit}</span>
    </div>
  </div>
);

interface ToggleControlProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

const ToggleControl: React.FC<ToggleControlProps> = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-start justify-between gap-6">
    <div className="flex-1">
      <h4 className="text-sm font-black text-slate-800 mb-1 uppercase tracking-tight">{label}</h4>
      <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
    </div>
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-all duration-300 shrink-0 shadow-inner ${enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${enabled ? 'left-7' : 'left-1'}`}></div>
    </button>
  </div>
);

export default SecurityPolicy;
