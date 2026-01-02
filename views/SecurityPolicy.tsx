
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

  // Initialize from localStorage
  const [policies, setPolicies] = useState(() => {
    const saved = localStorage.getItem('hdh_portal_policies');
    return saved ? JSON.parse(saved) : DEFAULT_POLICIES;
  });

  const handleToggle = (key: keyof typeof policies) => {
    setPolicies((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleValueChange = (key: keyof typeof policies, value: number) => {
    setPolicies((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Persist to "disk" (localStorage)
    localStorage.setItem('hdh_portal_policies', JSON.stringify(policies));
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('securityTitle')}</h2>
          <p className="text-slate-500 text-sm">Quản lý cấu hình bảo mật On-Premise (Dữ liệu đã được đồng bộ với ổ cứng mô phỏng)</p>
        </div>
        <div className="flex items-center gap-3">
          {showSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold animate-scaleUp">
              <CheckCircle2 size={18} />
              Đã lưu thay đổi vào hệ thống
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
            {t('save')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Password Policy */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Key size={18} className="text-indigo-600" /> {t('passwordPolicy')}
            </h3>
            <button onClick={() => setShowValues(!showValues)} className="text-slate-400 hover:text-indigo-600">
              {showValues ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="p-6 space-y-6">
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileWarning size={18} className="text-amber-600" /> {t('attachmentPolicyTitle')}
            </h3>
          </div>
          <div className="p-6 space-y-6">
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
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-amber-800 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>Chính sách này giúp duy trì hiệu năng ổ NVMe Index và tránh làm phình Database Mailbox.</p>
            </div>
          </div>
        </div>

        {/* MFA & Identification */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Smartphone size={18} className="text-emerald-600" /> {t('mfaTitle')}
            </h3>
          </div>
          <div className="p-6 space-y-6">
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
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Tình trạng bảo mật</p>
                  <p className="text-[10px] text-slate-500 font-medium">Cấp độ: {policies.adminMfa && policies.requireComplexity ? 'CAO - TUÂN THỦ' : 'TRUNG BÌNH'}</p>
                </div>
              </div>
              <div className="h-10 w-10 flex items-center justify-center border-4 border-emerald-500 border-t-transparent rounded-full font-bold text-[10px] text-emerald-600">
                {policies.adminMfa && policies.requireComplexity && policies.enforceNextcloud ? '95%' : '65%'}
              </div>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Clock size={18} className="text-slate-600" /> {t('sessionPolicy')}
            </h3>
          </div>
          <div className="p-6 space-y-6">
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
            <div className="pt-4 flex items-center gap-2 text-xs font-bold text-indigo-600 cursor-pointer hover:underline uppercase tracking-widest">
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
      <h4 className="text-sm font-bold text-slate-800 mb-1">{label}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 min-w-[110px] justify-between shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="bg-transparent border-none outline-none text-sm font-bold text-slate-900 w-12 text-center"
      />
      <span className="text-[10px] font-bold text-slate-400 uppercase">{unit}</span>
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
      <h4 className="text-sm font-bold text-slate-800 mb-1">{label}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </div>
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full relative transition-all duration-200 shrink-0 ${enabled ? 'bg-indigo-600 shadow-inner' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${enabled ? 'left-7' : 'left-1'}`}></div>
    </button>
  </div>
);

export default SecurityPolicy;
