
import React, { useState, useEffect } from 'react';
import { Server, Activity, Database, ShieldAlert, Cpu, HardDrive, CheckCircle2, Save, Users as UsersIcon, Mail, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../LanguageContext.tsx';

interface AdminDashboardProps {
  onNavigate: (page: any) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  
  const [stats, setStats] = useState({
    userCount: 0,
    mailCount: 0,
    storageUsage: 35,
    serverHealth: 98
  });

  useEffect(() => {
    // Lấy dữ liệu thực tế từ LocalStorage
    const users = JSON.parse(localStorage.getItem('hdh_portal_users') || '[]');
    const mails = JSON.parse(localStorage.getItem('hdh_portal_mails') || '{"INBOX":[], "SENT":[], "DRAFTS":[]}');
    
    // Tính tổng tất cả email trong hệ thống
    const totalMails = 
      (mails.INBOX?.length || 0) + 
      (mails.SENT?.length || 0) + 
      (mails.DRAFTS?.length || 0);
    
    // Giả lập dung lượng dựa trên số lượng tệp tin (nếu có Portal File)
    const files = JSON.parse(localStorage.getItem('hdh_portal_files') || '[]');
    const simulatedStorage = 32 + (files.length * 0.2) + (totalMails * 0.01);
    
    setStats({
      userCount: users.length,
      mailCount: totalMails,
      storageUsage: simulatedStorage > 100 ? 99.9 : simulatedStorage,
      serverHealth: 98 // Có thể cập nhật logic check health tại đây
    });
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Trung tâm Quản trị HDH</h2>
          <p className="text-slate-500 text-sm italic">Quản lý định danh, tài nguyên và lưu trữ On-Premise.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Hệ thống đang ổn định</span>
        </div>
      </div>

      {/* Các chỉ số chính có tích hợp điều hướng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat 
          label="Nhân sự" 
          value={stats.userCount} 
          icon={<UsersIcon size={16} />} 
          color="bg-indigo-600" 
          onClick={() => onNavigate('USERS')}
          subLabel="Quản lý định danh"
        />
        <MiniStat 
          label="Tổng Emails" 
          value={stats.mailCount} 
          icon={<Mail size={16} />} 
          color="bg-rose-600" 
          onClick={() => onNavigate('INBOX')}
          subLabel="Lưu lượng nội bộ"
        />
        <MiniStat 
          label="Server Health" 
          value={`${stats.serverHealth}%`} 
          icon={<CheckCircle2 size={16} />} 
          color="bg-emerald-600" 
          onClick={() => onNavigate('SYSTEM')}
          subLabel="Trạng thái máy chủ"
        />
        <MiniStat 
          label="Dung lượng" 
          value={`${stats.storageUsage.toFixed(1)}%`} 
          icon={<Database size={16} />} 
          color="bg-amber-600" 
          onClick={() => onNavigate('SYSTEM')}
          subLabel="Storage On-Premise"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ServerNode 
          name="MAIL01" 
          role="Mail Server" 
          specs="24 vCPU | 128GB" 
          status="Online" 
          health={95} 
          onClick={() => onNavigate('SYSTEM')}
        />
        <ServerNode 
          name="NC01" 
          role="Nextcloud Storage" 
          specs="16 vCPU | 32GB" 
          status="Online" 
          health={100} 
          onClick={() => onNavigate('ARCHIVE')}
        />
        <ServerNode 
          name="DC1" 
          role="Active Directory" 
          specs="8 vCPU | 16GB" 
          status="Online" 
          health={100} 
          onClick={() => onNavigate('USERS')}
        />
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:border-indigo-200 transition-all group">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-slate-100 rounded-2xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
            <Save size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Sao lưu & Phục hồi vật lý</h3>
            <p className="text-sm text-slate-500">Toàn bộ cơ sở dữ liệu (Account, Policy, Mails) hiện đang được lưu trữ cục bộ.</p>
          </div>
        </div>
        <button 
          onClick={() => onNavigate('SYSTEM')}
          className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
        >
          <HardDrive size={14} /> Cấu hình sao lưu tệp
        </button>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, icon, color, onClick, subLabel }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group relative overflow-hidden"
  >
    <div className={`p-3 rounded-xl text-white ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
    <div className="flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <h4 className="text-xl font-black text-slate-900 leading-tight">{value}</h4>
      <p className="text-[9px] font-medium text-slate-400 mt-0.5">{subLabel}</p>
    </div>
    <ArrowUpRight className="absolute top-4 right-4 text-slate-200 group-hover:text-indigo-400 transition-colors" size={14} />
  </div>
);

const ServerNode = ({ name, role, specs, status, health, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-indigo-300 cursor-pointer transition-all group"
  >
    <div className="flex justify-between items-start mb-4">
      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{name}</h4>
      <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 uppercase tracking-widest">{status}</span>
    </div>
    <p className="text-xs text-slate-400 font-bold uppercase mb-4">{role}</p>
    <div className="space-y-4">
      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
        <span>Resource Load</span>
        <span>{health}%</span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-1000" 
          style={{width: `${health}%`}}
        ></div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-mono text-slate-400">{specs}</p>
        <div className="text-[10px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">Chi tiết →</div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
