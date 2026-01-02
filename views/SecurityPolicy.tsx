
import React, { useState, useEffect } from 'react';
import { Shield, Key, FileWarning, Clock, Lock, Smartphone, Save, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
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

const SecurityPolicy: React.FC = () => {
  const { t } = useLanguage();
  const [showValues, setShowValues] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize from master cache
  const [policies, setPolicies] = useState(() => {
    const cache = localStorage.getItem('hdh_master_db_cache');
    const db = cache ? JSON.parse(cache) : {};
    return db.policies || DEFAULT_POLICIES;
  });

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
      localStorage.setItem('hdh_master_db_cache', JSON.stringify(db));
      window.dispatchEvent(new Event('storage_sync'));
    }
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

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
              <div className="h-12 w-12 flex items-center justify-center border-4 border-emerald-500 border-t-transparent rounded-full font-black text-[10px] text-emerald-600 animate-spin-slow">
                {policies.adminMfa && policies.requireComplexity ? '98%' : '65%'}
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
            <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-indigo-600 cursor-pointer hover:underline uppercase tracking-widest">
              Xem tất cả các phiên đang hoạt động <Lock size={14} />
            </div>
          </div>
        </div>
      </div>
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
