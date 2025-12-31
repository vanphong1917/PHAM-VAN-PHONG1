
import React, { useState } from 'react';
import { ClipboardCheck, Search, Filter, Clock, ChevronRight, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import StatusPill from '../components/StatusPill';
import { RequestStatus, SLAStatus } from '../types';
import { useLanguage } from '../LanguageContext';

interface ApprovalListProps {
  onViewRequest: (id: string) => void;
}

const ApprovalList: React.FC<ApprovalListProps> = ({ onViewRequest }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'WAITING' | 'WATCHING' | 'HISTORY'>('WAITING');

  const tasks = [
    { 
      id: '12', 
      code: 'REQ-2024-0012', 
      title: 'Yêu cầu nghỉ phép & Bàn giao nội bộ', 
      requester: 'Nguyen Van An', 
      dept: 'IT Systems',
      status: RequestStatus.PENDING, 
      sla: SLAStatus.DUE_SOON,
      deadline: 'Hôm nay, 17:00'
    },
    { 
      id: '15', 
      code: 'REQ-2024-0015', 
      title: 'Đề xuất nâng cấp RAM máy chủ NC01', 
      requester: 'Tran Binh', 
      dept: 'IT Systems',
      status: RequestStatus.PENDING, 
      sla: SLAStatus.NORMAL,
      deadline: 'Ngày mai'
    },
    { 
      id: '18', 
      code: 'REQ-2024-0018', 
      title: 'Báo cáo chi phí vận hành Site B', 
      requester: 'Finance Dept', 
      dept: 'Accounting',
      status: RequestStatus.MORE_INFO, 
      sla: SLAStatus.OVERDUE,
      deadline: 'Đã quá hạn 2 ngày'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('myApprovals')}</h2>
          <p className="text-slate-500 text-sm">Xử lý các quy trình phê duyệt và nhiệm vụ được giao.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <TabButton active={filter === 'WAITING'} onClick={() => setFilter('WAITING')} label={t('waitingMe')} count="3" />
        <TabButton active={filter === 'WATCHING'} onClick={() => setFilter('WATCHING')} label={t('watching')} />
        <TabButton active={filter === 'HISTORY'} onClick={() => setFilter('HISTORY')} label={t('completed')} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 outline-none" 
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-slate-600 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50">
            <Filter size={16} /> Lọc
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="p-6 hover:bg-slate-50 cursor-pointer transition-all group flex items-start gap-6"
              onClick={() => onViewRequest(task.id)}
            >
              <div className={`p-3 rounded-2xl shrink-0 transition-colors ${
                task.sla === SLAStatus.OVERDUE ? 'bg-rose-50 text-rose-600' : 
                task.sla === SLAStatus.DUE_SOON ? 'bg-amber-50 text-amber-600' : 
                'bg-indigo-50 text-indigo-600'
              }`}>
                <ClipboardCheck size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.code}</span>
                  <StatusPill status={task.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                  {task.title}
                </h3>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <User size={14} />
                    {task.requester} • {task.dept}
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${
                    task.sla === SLAStatus.OVERDUE ? 'text-rose-600' : 
                    task.sla === SLAStatus.DUE_SOON ? 'text-amber-600' : 
                    'text-slate-500'
                  }`}>
                    <Clock size={14} />
                    {task.deadline}
                  </div>
                </div>
              </div>

              <div className="flex items-center self-center">
                <ChevronRight className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
          <button className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors">
            {t('viewAll')}
          </button>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`px-4 py-3 text-sm font-bold transition-all relative ${
      active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
    }`}
  >
    <div className="flex items-center gap-2">
      {label}
      {count && (
        <span className={`px-1.5 py-0.5 rounded text-[10px] ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
          {count}
        </span>
      )}
    </div>
    {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>}
  </button>
);

export default ApprovalList;
