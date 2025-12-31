
import React, { useState } from 'react';
import { ChevronLeft, Share2, Download, Printer, MoreHorizontal, Check, X, Info, FileText, Cloud, ShieldCheck } from 'lucide-react';
import StatusPill from '../components/StatusPill';
import { RequestStatus } from '../types';
import { useLanguage } from '../LanguageContext';

interface RequestDetailProps {
  id: string;
  onBack: () => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ id, onBack }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(t('details'));

  const steps = [
    { label: 'Created', status: 'completed', user: 'Nguyen Van An', date: 'Oct 24, 09:00 AM' },
    { label: 'Dept Head Review', status: 'completed', user: 'Manager Peter', date: 'Oct 24, 11:30 AM' },
    { label: 'Finance Verification', status: 'current', user: 'Audit Team', date: 'Pending' },
    { label: 'Final Approval', status: 'pending', user: 'Director Jane', date: 'Future' },
  ];

  const attachments = [
    { name: 'Proposal_Q3_Project.pdf', size: '2.4 MB', source: 'Local', status: 'Clean' },
    { name: 'High_Res_Infrastructure_Map.zip', size: '842 MB', source: 'Nextcloud', status: 'Clean' },
    { name: 'Budget_Draft_Excel_v2.xlsx', size: '150 KB', source: 'Local', status: 'Clean' },
  ];

  const tabs = [t('details'), t('attachments'), t('timeline'), t('comments')];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">REQ-2024-0012</h2>
              <StatusPill status={RequestStatus.PENDING} />
            </div>
            <p className="text-sm text-slate-500">Yêu cầu nghỉ phép & Bàn giao nội bộ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-200"><Share2 size={18} /></button>
          <button className="p-2 text-slate-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-200"><Printer size={18} /></button>
          <button className="p-2 text-slate-500 hover:bg-white rounded-lg border border-transparent hover:border-slate-200"><MoreHorizontal size={18} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-100">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-semibold transition-all relative ${
                    activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === t('details') && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                    <InfoRow label={t('requester')} value="Nguyen Van An (IT-01)" />
                    <InfoRow label={t('priority')} value="High" />
                    <InfoRow label={t('createdAt')} value="Oct 24, 2024 09:00 AM" />
                    <InfoRow label={t('slaDeadline')} value="Oct 26, 2024 17:00 PM" />
                  </div>
                  <div className="space-y-2 pt-6 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('description')}</label>
                    <p className="text-slate-700 leading-relaxed">
                      Tôi xin nghỉ phép ngắn hạn để kiểm tra sức khỏe từ ngày 27/10 đến 28/10. Mọi công việc sẽ được bàn giao cho anh Bình (SysAdmin). Tệp đính kèm chứa kế hoạch bàn giao và thông tin quản trị hệ thống (qua liên kết Nextcloud bảo mật).
                    </p>
                  </div>
                </div>
              )}

              {activeTab === t('attachments') && (
                <div className="space-y-3">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${file.source === 'Nextcloud' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                          {file.source === 'Nextcloud' ? <Cloud size={20} /> : <FileText size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">{file.size}</span>
                            <span className="text-slate-200">•</span>
                            <span className="text-xs font-bold text-slate-400">{file.source} Storage</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold">
                          <ShieldCheck size={12} />
                          {file.status}
                        </div>
                        <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-xs text-center">
                    <b>{t('systemNote')}</b>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-6">{t('approvalWorkflow')}</h3>
            <div className="space-y-0 relative">
              <div className="absolute left-4 top-2 bottom-8 w-0.5 bg-slate-100"></div>
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4 mb-8 last:mb-0 relative">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-colors ${
                    step.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
                    step.status === 'current' ? 'bg-white border-indigo-600 text-indigo-600' :
                    'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {step.status === 'completed' ? <Check size={14} /> : (i + 1)}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-900'}`}>{step.label}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{step.user}</p>
                    {step.date !== 'Future' && <p className="text-[10px] text-slate-400 mt-1 font-medium">{step.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
              <Check size={18} /> {t('approve')}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all">
                <X size={18} /> {t('reject')}
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all">
                <Info size={18} /> {t('moreInfo')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

export default RequestDetail;
