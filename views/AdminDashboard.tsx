
import React from 'react';
import { Server, Activity, Database, ShieldAlert, Cpu, HardDrive, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const AdminDashboard: React.FC<{ onNavigate: (page: any) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('infraOverview')}</h2>
          <p className="text-slate-500">{t('monitoringServers')}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">{t('downloadReport')}</button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">{t('systemAudit')}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ServerNode 
          name="MAIL01" 
          role={t('mail01Role')} 
          specs="24 vCPU | 128GB RAM" 
          storage="RAID6 12TB" 
          status={t('Healthy')} 
          health={92}
        />
        <ServerNode 
          name="NC01" 
          role={t('nc01Role')} 
          specs="16 vCPU | 32GB RAM" 
          storage="RAID6 20TB" 
          status={t('Healthy')} 
          health={98}
        />
        <ServerNode 
          name="ARCH01" 
          role={t('arch01Role')} 
          specs="8 vCPU | 64GB RAM" 
          storage="HDD 40TB" 
          status={t('Healthy')} 
          health={100}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{t('resourceUsage')}</h3>
            <Activity size={18} className="text-slate-400" />
          </div>
          <div className="p-6 space-y-6">
            <ResourceProgress label="NVMe Index Store (MAIL01)" value={45} limit="4TB" status="Good" />
            <ResourceProgress label="Mail Data RAID6" value={78} limit="12TB" status={t('Warning')} />
            <ResourceProgress label="Archive Drive" value={12} limit="40TB" status="Optimal" />
            <ResourceProgress label="Nextcloud Storage" value={62} limit="20TB" status="Good" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">{t('mailTraffic')}</h3>
            <Database size={18} className="text-slate-400" />
          </div>
          <div className="p-6">
            <div className="flex items-end gap-2 h-40 mb-6">
              {[30, 45, 60, 40, 70, 95, 80, 50, 40, 65, 85, 100, 75, 45, 35].map((h, i) => (
                <div key={i} className="flex-1 bg-indigo-100 rounded-t hover:bg-indigo-400 transition-colors group relative">
                  <div className="bg-indigo-600 rounded-t w-full absolute bottom-0" style={{ height: `${h}%` }}></div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none">
                    {h*250} pkts
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 font-medium mb-1">{t('totalEmails')}</p>
                <h4 className="text-xl font-bold text-slate-900">24,582</h4>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 font-medium mb-1">{t('relayRate')}</p>
                <h4 className="text-xl font-bold text-slate-900">98.2%</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ServerNode = ({ name, role, specs, storage, status, health }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:border-indigo-300 transition-all cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
        <Server size={20} />
      </div>
      <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
        <CheckCircle2 size={14} />
        {status}
      </div>
    </div>
    <h4 className="text-lg font-bold text-slate-900 mb-1">{name}</h4>
    <p className="text-sm text-slate-500 mb-4">{role}</p>
    <div className="space-y-2 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <Cpu size={14} /> {specs}
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <HardDrive size={14} /> {storage}
      </div>
    </div>
  </div>
);

const ResourceProgress = ({ label, value, limit, status }: any) => (
  <div>
    <div className="flex justify-between text-sm mb-2">
      <span className="font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Total: {limit}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
          status === 'Warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
        }`}>{status}</span>
      </div>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2.5">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ${
          value > 75 ? 'bg-amber-500' : 'bg-indigo-600'
        }`} 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

export default AdminDashboard;
