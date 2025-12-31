
import React from 'react';
import { Activity, Clock, Database, Server, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const SystemMonitor: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Giám sát Hạ tầng & Sao lưu</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">
            <RefreshCw size={16} /> Đồng bộ AD
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Bảo mật hệ thống: Ổn định</h3>
            <p className="text-sm text-slate-500">Tất cả máy chủ nội bộ đang hoạt động trong ngưỡng an toàn.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <MonitorCard title="Độ trễ AD" value="12ms" status="Excellent" trend="Ổn định" />
          <MonitorCard title="Trạng thái Backup01" value="Online" status="Good" trend="Hoàn tất snapshot" />
          <MonitorCard title="Băng thông Nextcloud" value="1.2 GB/s" status="Optimal" trend="Đỉnh điểm" />
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden text-white">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Database className="text-indigo-400" /> {t('storageArch')}
            </h3>
            <span className="text-xs font-mono text-slate-400">RAID CONTROLLER: H740P</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StorageBlock label="M: MAIL DATA" type="RAID 6" usage="8.2TB / 12TB" color="bg-indigo-500" />
            <StorageBlock label="I: INDEX (NVMe)" type="RAID 1" usage="1.8TB / 4TB" color="bg-cyan-400" />
            <StorageBlock label="Q: QUEUE/LOGS" type="SSD" usage="240GB / 1TB" color="bg-emerald-400" />
            <StorageBlock label="A: ARCHIVE" type="COLD" usage="4.8TB / 40TB" color="bg-slate-500" />
          </div>

          <div className="mt-12 p-6 bg-slate-800 rounded-xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-700 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-400">92%</span>
                </div>
                <svg className="absolute top-0 left-0 w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#6366f1" strokeWidth="4" strokeDasharray="175" strokeDashoffset="14" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold">{t('lastBackup')} (BACKUP01)</h4>
                <p className="text-sm text-slate-400">Hoàn tất 4 giờ trước. Dung lượng: 1.2 TB. Đích: Ổ rời Khe 1.</p>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-all">{t('verifyIntegrity')}</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity size={18} className="text-indigo-600" /> {t('retentionPolicies')}
          </h3>
          <div className="space-y-4">
            <PolicyItem title="Hot Mail Storage" desc={t('hotStorageDesc')} value="ACTIVE" />
            <PolicyItem title="Archive Automove" desc={t('autoMoveDesc')} value="CRON 00:00" />
            <PolicyItem title="Large Attachment Policy" desc={t('largeFilePolicyDesc')} value="FORCE-ON" />
          </div>
        </div>
        
        <div className="bg-rose-50 rounded-xl border border-rose-100 p-6">
          <h3 className="font-bold text-rose-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} /> {t('systemAlerts')}
          </h3>
          <div className="space-y-3">
            <AlertItem type="Warn" msg="Thư mục Queue MAIL01 đạt 85%. Hiệu năng SSD có thể giảm." />
            <AlertItem type="Info" msg="Nhắc nhở xoay vòng ổ sao lưu: Vui lòng lắp ổ Friday-05." />
            <AlertItem type="Success" msg="Lập chỉ mục tuần trên ổ NVMe hoàn tất sau 12 phút." />
          </div>
        </div>
      </div>
    </div>
  );
};

const MonitorCard = ({ title, value, status, trend }: any) => (
  <div className="space-y-2">
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
    <div className="flex items-end gap-3">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className={`text-xs font-bold pb-1 ${status === 'Excellent' || status === 'Good' || status === 'Optimal' ? 'text-emerald-500' : 'text-amber-500'}`}>{status}</span>
    </div>
    <p className="text-[10px] text-slate-500">{trend}</p>
  </div>
);

const StorageBlock = ({ label, type, usage, color }: any) => (
  <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] font-bold text-slate-500 tracking-tighter uppercase">{type}</span>
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
    </div>
    <h5 className="text-sm font-bold mb-1">{label}</h5>
    <p className="text-xs text-slate-400 mb-3">{usage}</p>
    <div className="w-full bg-slate-700 rounded-full h-1">
      <div className={`${color} h-full rounded-full`} style={{ width: '68%' }}></div>
    </div>
  </div>
);

const PolicyItem = ({ title, desc, value }: any) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
    <div>
      <h6 className="text-sm font-semibold text-slate-800">{title}</h6>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{value}</span>
  </div>
);

const AlertItem = ({ type, msg }: any) => (
  <div className={`text-xs p-3 rounded-lg border flex gap-3 ${
    type === 'Warn' ? 'bg-amber-100/50 border-amber-200 text-amber-800' :
    type === 'Success' ? 'bg-emerald-100/50 border-emerald-200 text-emerald-800' :
    'bg-blue-100/50 border-blue-200 text-blue-800'
  }`}>
    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
      type === 'Warn' ? 'bg-amber-500' : type === 'Success' ? 'bg-emerald-500' : 'bg-blue-500'
    }`}></div>
    {msg}
  </div>
);

export default SystemMonitor;
