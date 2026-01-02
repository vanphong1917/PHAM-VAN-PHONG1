
import React, { useState, useEffect, useMemo } from 'react';
import { Mail, Clock, FileCheck, AlertCircle, Send, Inbox, ChevronRight, Database } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface UserDashboardProps {
  currentUser: any;
  onNavigate: (page: any) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser, onNavigate }) => {
  const { t } = useLanguage();
  
  // Lấy dữ liệu từ Master DB Cache
  const [db, setDb] = useState<any>(() => {
    const cache = localStorage.getItem('hdh_master_db_cache');
    return cache ? JSON.parse(cache) : null;
  });

  // Load phân vùng của user hiện tại
  const userData = useMemo(() => {
    if (!db || !db.user_storages[currentUser.username]) {
      return { mails: { INBOX: [], SENT: [], DRAFTS: [] }, files: [] };
    }
    return db.user_storages[currentUser.username];
  }, [db, currentUser.username]);

  // Tính toán hạn ngạch Mail (Giả lập dung lượng dựa trên số item)
  const quotaStats = useMemo(() => {
    const mailCount = userData.mails.INBOX.length + userData.mails.SENT.length + userData.mails.DRAFTS.length;
    const fileCount = userData.files?.length || 0;
    
    // Mỗi mail giả định 150KB, mỗi file 2MB
    const usedMB = (mailCount * 0.15) + (fileCount * 2);
    const totalMB = 20480; // 20GB
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
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Thư đến" 
          value={userData.mails.INBOX.length} 
          icon={<Inbox className="text-indigo-600" />} 
          sub="Hộp thư chính"
          onClick={() => onNavigate('INBOX')}
        />
        <StatCard 
          title="Đã gửi" 
          value={userData.mails.SENT.length} 
          icon={<Send className="text-emerald-600" />} 
          sub="Nhật ký liên lạc"
          onClick={() => onNavigate('INBOX')}
        />
        <StatCard 
          title="Phê duyệt" 
          value={db?.global_requests?.filter((r: any) => r.status === 'PENDING').length || 0} 
          icon={<Clock className="text-amber-600" />} 
          sub="Hệ thống chờ"
          onClick={() => onNavigate('APPROVALS')}
        />
        <StatCard 
          title="Nextcloud" 
          value={`${userData.files?.length || 0} tệp`} 
          icon={<AlertCircle className="text-rose-600" />} 
          sub="Lưu trữ tệp lớn"
          onClick={() => onNavigate('ARCHIVE')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="text-indigo-600" size={20} /> Công tác gần đây (Mails mới nhất)
            </h3>
            <button onClick={() => onNavigate('INBOX')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Xem toàn bộ</button>
          </div>
          
          <div className="space-y-4 flex-1">
            {recentMails.length > 0 ? recentMails.map((mail: any) => (
              <div 
                key={mail.id} 
                onClick={() => onNavigate('INBOX')}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50/50 transition-all cursor-pointer group border border-transparent hover:border-indigo-100"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    {mail.fromName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{mail.subject}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Từ: {mail.fromName} • {mail.time}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center py-10 opacity-20">
                <Mail size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest mt-2">Chưa có luồng công tác</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg">Hạn ngạch Mail</h4>
                <div className="p-2 bg-white/10 rounded-lg"><Database size={18} /></div>
              </div>
              <p className="text-indigo-100 text-xs mb-6 font-medium">Bạn đã sử dụng {quotaStats.used} MB trên {quotaStats.total}.</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Dung lượng đã dùng</span>
                  <span>{quotaStats.percent}%</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000" style={{width: `${quotaStats.percent}%`}}></div>
                </div>
              </div>
              
              <button onClick={() => onNavigate('ARCHIVE')} className="w-full py-3.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-lg active:scale-95">
                Quản lý kho tệp tin
              </button>
            </div>
            <Mail size={140} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/20">
                <FileCheck size={24} />
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Trạng thái bảo mật</p>
                <p className="text-xs font-bold text-white uppercase italic">On-Premise Verified</p>
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
    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 hover:shadow-lg transition-all group active:scale-95"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-slate-100 group-hover:scale-110">{icon}</div>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{sub}</span>
    </div>
    <h4 className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{value}</h4>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
  </div>
);

export default UserDashboard;
