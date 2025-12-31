
import React from 'react';
import { RequestStatus } from '../types';
import { useLanguage } from '../LanguageContext';

interface StatusPillProps {
  status: RequestStatus | string;
}

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const { t } = useLanguage();
  
  const getStyles = () => {
    switch (status) {
      case RequestStatus.APPROVED:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case RequestStatus.PENDING:
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case RequestStatus.REJECTED:
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case RequestStatus.MORE_INFO:
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case RequestStatus.DRAFT:
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStyles()}`}>
      {t(status as string)}
    </span>
  );
};

export default StatusPill;
