
import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Clock, FileCheck, AlertCircle, Send, Inbox, ChevronRight, Database } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface UserDashboardProps {
  currentUser: any;
  onNavigate: (page: any) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser, onNavigate }) => {
  const { t } = useLanguage();
  
  const [db, setDb] = useState<any>(() => {
    const cache = localStorage.getItem('hdh_master_db_cache');
    return cache ? JSON.parse(cache) : null;
  });

  useEffect(() => {
    const handleSync = () => {
      const cache = localStorage.getItem('hdh_master_db_cache');
      if (cache) setDb(JSON.parse(cache));
    };
    window.addEventListener('storage_sync', handleSync);
    return () => window.removeEventListener('storage_sync', handleSync);
  }, []);

  const userData = useMemo(() => {
    if (!db || !db.user_storages[currentUser.username]) {
      return { mails: { INBOX: [], SENT: [], DRAFTS: [] }, files: [] };
    }
    return db.user_storages[currentUser.username];
  }, [db, currentUser.username]);

  const waitingApprovalCount = useMemo(() => {
    if (!db || !db.global_requests) return 0;
    return db.global_requests.filter((req: any) => {
      if (req.status !== 'PENDING') return false;
      const nextStep = req.approvalLine?.find((s: any) => s.status !== 'completed' && s.status !== 'rejected');
      return nextStep && nextStep.email === currentUser.email;
    }).length;
  }, [db, currentUser.email]);

  const quotaStats = useMemo(() => {
    const mailCount = userData.mails.INBOX.length + userData.mails.SENT.length + userData.mails.DRAFTS.length;
    const fileCount = userData.files?.length || 0;
    const usedMB = (mailCount * 0.15) + (fileCount * 2);
    const totalMB = 20480; 
    const percent = Math.min((usedMB / totalMB) * 100, 100);
    return {
      used: usedMB.toFixed(2),
      total: "20 GB",
      percent: percent.toFixed(1)
    };
  }, [userData]);

  const recentMails = useMemo(() => {
    return userData.mails.INBOX.slice(0, 3);
  }, [userData]);

  return (
    <div className="space-y-6 lg:space-y-8 animate-fadeIn">
      {/* Stats Grid - Responsive column count */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          title="Thư đến" 
          value={userData.mails.INBOX.length} 
          icon={<Inbox className="text-indigo-600" size={24} />} 
          sub="Inbox"
          onClick={() => onNavigate('INBOX')}
        />
        <StatCard 
          title="Đã gửi" 
          value={userData.mails.SENT.length} 
          icon={<Send className="text-emerald-600" size={24} />} 
          sub="Sent"
          onClick={() => onNavigate('INBOX')}
        />
        <StatCard 
          title="Phê duyệt" 
          value={waitingApprovalCount} 
          icon={<Clock className="text-amber-600" size={24} />} 
          sub="Wait-me"
          onClick={() => onNavigate('APPROVALS')}
        />
        <StatCard 
          title="Nextcloud" 
          value={`${userData.files?.length || 0} tệp`} 
          icon={<AlertCircle className="text-rose-600" size={24} />} 
          sub="Files"
          onClick={() => onNavigate('ARCHIVE')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Mails - Fluid height */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base lg:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="text-indigo-600" size={20} /> Công tác gần đây
            </h3>
            <button onClick={() => onNavigate('INBOX')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Xem tất cả</button>
          </div>
          
          <div className="space-y-3 lg:space-y-4 flex-1">
            {recentMails.length > 0 ? recentMails.map((mail: any) => (
              <div 
                key={mail.id} 
                onClick={() => onNavigate('INBOX')}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50/50 transition-all cursor-pointer group border border-transparent hover:border-indigo-100"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 shrink-0 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    {mail.fromName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm font-bold text-slate-900 truncate">{mail.subject}</p>
                    <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Từ: {mail.fromName} • {mail.time}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center py-10 lg:py-20 opacity-20">
                <Mail size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest mt-2">Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>

        {/* Quota Section - Stack on mobile */}
        <div className="space-y-6 lg:space-y-8">
          <div className="bg-indigo-600 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-base lg:text-lg italic tracking-tight">Hạn ngạch Mail</h4>
                <div className="p-2 bg-white/10 rounded-lg"><Database size={18} /></div>
              </div>
              <p className="text-indigo-100 text-[10px] lg:text-xs mb-6 font-medium">Bạn đã dùng {quotaStats.used} MB trên {quotaStats.total}.</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-[9px] lg:text-[10px] font-black uppercase tracking-widest">
                  <span>Usage</span>
                  <span>{quotaStats.percent}%</span>
                </div>
                <div className="w-full bg-white/10 h-2 lg:h-2.5 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000" style={{width: `${quotaStats.percent}%`}}></div>
                </div>
              </div>
              
              <button onClick={() => onNavigate('ARCHIVE')} className="w-full py-3 lg:py-3.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-95">
                Quản lý kho tệp
              </button>
            </div>
            <Mail size={120} className="absolute -bottom-8 -right-8 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>

          <div className="bg-slate-900 rounded-3xl p-4 lg:p-6 border border-slate-800 flex items-center gap-4">
             <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/20">
                <FileCheck size={20} lg:size={24} />
             </div>
             <div className="min-w-0">
                <p className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Status</p>
                <p className="text-[10px] lg:text-xs font-bold text-white uppercase italic truncate">On-Premise Verified</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, sub, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-5 lg:p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-lg transition-all group active:scale-95"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 lg:p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-slate-100 group-hover:scale-110">{icon}</div>
      <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub}</span>
    </div>
    <h4 className="text-2xl lg:text-3xl font-black text-slate-900 mb-0.5 lg:mb-1 tracking-tighter">{value}</h4>
    <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
  </div>
);

export default UserDashboard;
