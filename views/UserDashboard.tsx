
import React from 'react';
import { Mail, Clock, FileCheck, AlertCircle } from 'lucide-react';
import StatusPill from '../components/StatusPill';
import { RequestStatus } from '../types';
import { useLanguage } from '../LanguageContext';

interface UserDashboardProps {
  onNavigate: (page: any) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={t('newMails')} 
          value="12" 
          icon={<Mail className="text-blue-500" />} 
          change={`+3 ${t('today')}`} 
          onClick={() => onNavigate('INBOX')}
        />
        <StatCard 
          title={t('toApprove')} 
          value="5" 
          icon={<Clock className="text-amber-500" />} 
          change={`2 ${t('urgent')}`} 
          onClick={() => onNavigate('APPROVALS')}
        />
        <StatCard 
          title={t('myRequests')} 
          value="8" 
          icon={<FileCheck className="text-emerald-500" />} 
          change={`1 ${t('APPROVED')}`} 
          onClick={() => onNavigate('APPROVALS')}
        />
        <StatCard 
          title={t('largeFiles')} 
          value="142" 
          icon={<AlertCircle className="text-rose-500" />} 
          change={`Nextcloud ${t('usage')}: 45%`} 
          onClick={() => onNavigate('ARCHIVE')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Cộng tác nội bộ gần đây</h3>
            <button 
              onClick={() => onNavigate('APPROVALS')}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              {t('viewAll')}
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className="px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group"
                onClick={() => onNavigate('APPROVALS')}
              >
                <div className="flex items-center gap-4">
                  <img src={`https://picsum.photos/seed/${i+10}/40/40`} className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">Báo cáo hiệu suất hàng tuần Q3</p>
                    <p className="text-xs text-slate-500">{t('sender')}: Manager Peter • 2 giờ trước</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500">
                    ID: {1000 + i}
                  </div>
                  <StatusPill status={i === 2 ? RequestStatus.PENDING : RequestStatus.APPROVED} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4">{t('mailboxQuota')}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-500">{t('usage')}</span>
                  <span className="font-semibold text-slate-900">4.2 GB / 20 GB</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '21%' }}></div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-blue-800 text-xs leading-relaxed flex gap-3">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>{t('hotStoreNote')}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-lg p-6 text-white">
            <h3 className="font-bold mb-2">{t('needBigFile')}</h3>
            <p className="text-indigo-100 text-sm mb-4">{t('policyNote')}</p>
            <button 
              onClick={() => onNavigate('ARCHIVE')}
              className="w-full py-2 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors"
            >
              {t('openPortal')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, change, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group"
  >
    <div>
      <p className="text-sm text-slate-500 font-medium mb-1 group-hover:text-slate-700">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{value}</h3>
      <p className="text-xs text-slate-400 mt-2">{change}</p>
    </div>
    <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">{icon}</div>
  </div>
);

export default UserDashboard;
