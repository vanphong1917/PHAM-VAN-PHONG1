
import React, { useState } from 'react';
import { Activity, Clock, Database, Server, RefreshCw, AlertTriangle, ShieldCheck, HardDrive, Download, Upload, FileJson, Save, CheckCircle2, Loader2, Link, Zap } from 'lucide-react';
import { useLanguage } from '../LanguageContext.tsx';

interface SystemMonitorProps {
  isDiskConnected: boolean;
  onConnect: () => void;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ isDiskConnected, onConnect }) => {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const lastSync = new Date().toLocaleString();

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Server className="text-indigo-600" size={28} />
            Hệ thống & Lưu trữ vật lý
          </h2>
          <p className="text-slate-500 text-sm">Quản trị toàn diện bare-metal server và Master Database nội bộ.</p>
        </div>
      </div>

      {/* Module Kết nối Ổ cứng Thực tế */}
      <div className={`bg-white rounded-[2.5rem] shadow-xl border-2 overflow-hidden transition-all duration-500 ${isDiskConnected ? 'border-emerald-100' : 'border-rose-100'}`}>
        <div className={`p-8 border-b flex items-center justify-between ${isDiskConnected ? 'bg-emerald-50/50 border-emerald-50' : 'bg-rose-50/50 border-rose-50'}`}>
          <div className="flex items-center gap-5">
            <div className={`p-4 rounded-[1.5rem] text-white shadow-lg transition-all duration-500 ${isDiskConnected ? 'bg-emerald-500 shadow-emerald-100' : 'bg-rose-500 shadow-rose-100'}`}>
              <HardDrive size={32} className={!isDiskConnected ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">
                {isDiskConnected ? 'Ổ cứng vật lý: Đã liên kết' : 'Ổ cứng vật lý: Chưa kết nối'}
              </h3>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
                {isDiskConnected ? 'Dữ liệu đang được đồng bộ thời gian thực vào hdh_master_db.json' : 'Dữ liệu hiện chỉ lưu tạm thời trên trình duyệt (Rủi ro mất dữ liệu)'}
              </p>
            </div>
          </div>
          {!isDiskConnected ? (
            <button 
              onClick={onConnect}
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl active:scale-95 flex items-center gap-3"
            >
              <Zap size={18} className="text-amber-400" /> Kết nối thư mục dữ liệu
            </button>
          ) : (
            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-2xl border border-emerald-200 font-black text-[10px] uppercase tracking-widest">
              <CheckCircle2 size={18} /> Sync Active
            </div>
          )}
        </div>

        <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                <Link size={16} className="text-indigo-600" /> Cấu hình luồng dữ liệu (Data Stream)
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Database File</p>
                    <p className="text-sm font-mono font-bold text-slate-700">hdh_master_db.json</p>
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 bg-indigo-50 text-indigo-600 rounded border border-indigo-100">ON-PREM PRIMARY</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Mode</p>
                    <p className="text-sm font-black text-slate-700">Atomic Write (FSA API)</p>
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 bg-emerald-50 text-emerald-600 rounded border border-emerald-100">ENCRYPTED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
             <div className="relative z-10 space-y-6">
               <h4 className="font-black text-indigo-400 text-xs uppercase tracking-widest">Bảo mật vật lý</h4>
               <p className="text-sm font-bold leading-relaxed italic">"Dữ liệu của bạn không bao giờ rời khỏi ổ cứng của bạn. Trình duyệt chỉ đóng vai trò là giao diện điều khiển (UI Controller)."</p>
               <div className="pt-6 border-t border-white/10 space-y-3">
                 <div className="flex justify-between text-[10px] font-bold text-slate-400">
                   <span>Sync Status:</span>
                   <span className="text-emerald-400">100% Consistent</span>
                 </div>
                 <div className="w-full bg-white/10 h-1.5 rounded-full">
                   <div className="bg-emerald-400 h-full rounded-full w-full"></div>
                 </div>
               </div>
             </div>
             <ShieldCheck size={140} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden text-white">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Database className="text-indigo-400" /> Cấu hình Disk Raid (Simulated)
            </h3>
            <span className="text-xs font-mono text-slate-400">RAID CONTROLLER: H740P</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StorageBlock label="M: MAIL DATA" type="RAID 6" usage="8.2TB / 12TB" color="bg-indigo-500" />
            <StorageBlock label="I: INDEX (NVMe)" type="RAID 1" usage="1.8TB / 4TB" color="bg-cyan-400" />
            <StorageBlock label="Q: QUEUE/LOGS" type="SSD" usage="240GB / 1TB" color="bg-emerald-400" />
            <StorageBlock label="A: ARCHIVE" type="COLD" usage="4.8TB / 40TB" color="bg-slate-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

const StorageBlock = ({ label, type, usage, color }: any) => (
  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 transition-all hover:bg-slate-700/50 cursor-default">
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] font-bold text-slate-500 tracking-tighter uppercase">{type}</span>
      <div className={`w-2 h-2 rounded-full animate-pulse ${color}`}></div>
    </div>
    <h5 className="text-sm font-bold mb-1">{label}</h5>
    <p className="text-xs text-slate-400 mb-3">{usage}</p>
    <div className="w-full bg-slate-700 rounded-full h-1">
      <div className={`${color} h-full rounded-full transition-all duration-1000`} style={{ width: '68%' }}></div>
    </div>
  </div>
);

export default SystemMonitor;
