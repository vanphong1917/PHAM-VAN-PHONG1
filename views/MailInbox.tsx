
import React, { useState } from 'react';
import { Mail, Search, Filter, RefreshCw, Star, Trash2, Archive, Inbox, Clock, Send, FileText, Paperclip, X, ChevronRight, SendHorizontal, Save } from 'lucide-react';
import StatusPill from '../components/StatusPill';
import { RequestStatus } from '../types';
import { useLanguage } from '../LanguageContext';

interface MailInboxProps {
  onViewRequest: (id: string) => void;
}

type MailFolder = 'INBOX' | 'SENT' | 'DRAFTS';

const MailInbox: React.FC<MailInboxProps> = ({ onViewRequest }) => {
  const { t } = useLanguage();
  const [folder, setFolder] = useState<MailFolder>('INBOX');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mockMails = {
    INBOX: [
      { id: '1', from: 'IT Department', subject: 'Server Maintenance Notice MAIL01', status: RequestStatus.APPROVED, time: '10:45 AM', read: false },
      { id: '2', from: 'HR Portal', subject: 'Leave Request Approval Required', status: RequestStatus.PENDING, time: '09:12 AM', read: true },
      { id: '3', from: 'Security System', subject: 'Alert: Login from New Device', status: RequestStatus.MORE_INFO, time: 'Yesterday', read: true },
      { id: '4', from: 'Admin Office', subject: 'Updated Internal Policies 2024', status: RequestStatus.APPROVED, time: 'Oct 24', read: true },
      { id: '5', from: 'Backup01', subject: 'Daily Backup Report: Successful', status: RequestStatus.APPROVED, time: 'Oct 23', read: true },
    ],
    SENT: [
      { id: 's1', to: 'Manager Peter', subject: 'Q3 Infrastructure Report Final', status: RequestStatus.APPROVED, time: '11:20 AM', read: true },
      { id: 's2', to: 'HR Dept', subject: 'Re: Training session confirmation', status: RequestStatus.APPROVED, time: 'Oct 22', read: true },
    ],
    DRAFTS: [
      { id: 'd1', to: '(Chưa có người nhận)', subject: 'Cấu hình cluster dự phòng site B', status: RequestStatus.DRAFT, time: '30 phút trước', read: true },
    ]
  };

  const currentMails = mockMails[folder];

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('internalMail')}</h2>
          <p className="text-slate-500 text-sm">Quản lý thư tín nội bộ doanh nghiệp bảo mật.</p>
        </div>
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
        >
          <Mail size={18} /> {t('compose')}
        </button>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Sidebar Navigation */}
        <aside className="w-64 flex flex-col gap-2 shrink-0 hidden lg:flex">
          <FolderButton 
            icon={<Inbox size={18} />} 
            label={t('inbox')} 
            active={folder === 'INBOX'} 
            onClick={() => setFolder('INBOX')} 
            count="12" 
          />
          <FolderButton 
            icon={<SendHorizontal size={18} />} 
            label={t('sent')} 
            active={folder === 'SENT'} 
            onClick={() => setFolder('SENT')} 
          />
          <FolderButton 
            icon={<FileText size={18} />} 
            label={t('drafts')} 
            active={folder === 'DRAFTS'} 
            onClick={() => setFolder('DRAFTS')} 
            count="1" 
          />
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
            <div className="px-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Hệ thống</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium hover:text-indigo-600 cursor-pointer">
                  <Archive size={14} /> 5 tháng gần đây
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium hover:text-indigo-600 cursor-pointer">
                  <Trash2 size={14} /> Thùng rác
                </div>
              </div>
            </div>
            
            <div className="mx-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-[10px] font-bold text-indigo-700 mb-2 uppercase tracking-wide">Dung lượng</p>
              <div className="w-full bg-indigo-200 h-1 rounded-full mb-2">
                <div className="bg-indigo-600 h-full rounded-full" style={{width: '35%'}}></div>
              </div>
              <p className="text-[10px] text-indigo-600 font-bold">7.2 GB / 20 GB</p>
            </div>
          </div>
        </aside>

        {/* Mail List Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {/* List Toolbar */}
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/30">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')} 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 outline-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-medium" 
                />
              </div>
              <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all shadow-sm">
                <RefreshCw size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                <Filter size={16} /> Lọc
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4 w-12 text-center"></th>
                  <th className="px-6 py-4">{folder === 'SENT' ? t('recipient') : t('sender')}</th>
                  <th className="px-6 py-4">{t('subject_table')}</th>
                  <th className="px-6 py-4">{t('status')}</th>
                  <th className="px-6 py-4 text-right">{t('received')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentMails.map((mail) => (
                  <tr 
                    key={mail.id} 
                    className={`group hover:bg-slate-50 cursor-pointer transition-colors ${!mail.read ? 'bg-indigo-50/20' : ''}`}
                    onClick={() => onViewRequest(mail.id)}
                  >
                    <td className="px-6 py-4 text-center">
                      <Star size={16} className="text-slate-200 group-hover:text-amber-400 transition-colors mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                          {(folder === 'SENT' ? mail.to : mail.from).substring(0, 1)}
                        </div>
                        <span className={`text-sm ${!mail.read ? 'font-bold text-slate-900' : 'text-slate-600 font-medium'}`}>
                          {folder === 'SENT' ? mail.to : mail.from}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-sm truncate max-w-xs ${!mail.read ? 'font-bold text-slate-900' : 'text-slate-500 font-medium'}`}>
                          {mail.subject}
                        </span>
                        {mail.id === '1' && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Paperclip size={10} /> Có tệp đính kèm
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={mail.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs text-slate-400 font-bold">
                        {mail.time}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2"><Inbox size={14} className="text-indigo-600" /> {currentMails.length} {t('totalEmails')}</span>
              <span className="flex items-center gap-2"><Clock size={14} /> Đồng bộ: 1 Phút trước</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-30 transition-all shadow-sm" disabled>{t('previous')}</button>
              <span className="px-2 text-slate-400">Trang 1</span>
              <button className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all shadow-sm">{t('next')}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail size={18} />
                <h3 className="font-bold text-sm tracking-wide uppercase">{t('compose')}</h3>
              </div>
              <button onClick={() => setIsComposeOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 py-2 border-b border-slate-100">
                <label className="w-16 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('to')}</label>
                <input 
                  type="text" 
                  placeholder="nhan-vien@enterprise.com, phong-ban@group.internal" 
                  className="flex-1 outline-none text-sm font-semibold text-slate-800 bg-transparent"
                />
              </div>
              <div className="flex items-center gap-4 py-2 border-b border-slate-100">
                <label className="w-16 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('subject_table')}</label>
                <input 
                  type="text" 
                  placeholder="Nhập tiêu đề thư nội bộ..." 
                  className="flex-1 outline-none text-sm font-semibold text-slate-800 bg-transparent"
                />
              </div>

              <textarea 
                className="w-full h-64 outline-none text-sm leading-relaxed text-slate-700 bg-slate-50/30 p-4 rounded-xl resize-none border border-slate-100 focus:border-indigo-100"
                placeholder={t('message')}
              ></textarea>

              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-800 text-[10px] leading-relaxed">
                <AlertCircle size={14} className="shrink-0" />
                <p><b>CHÍNH SÁCH HỆ THỐNG:</b> {t('attachmentPolicy')}</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-xs font-bold transition-all">
                  <Paperclip size={16} /> Đính kèm
                </button>
                <button className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-xs font-bold transition-all">
                  <Save size={16} /> Lưu nháp
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  {t('discard')}
                </button>
                <button 
                  onClick={() => setIsComposeOpen(false)}
                  className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
                >
                  <Send size={16} /> {t('send')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface FolderButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: string;
}

const FolderButton: React.FC<FolderButtonProps> = ({ icon, label, active, onClick, count }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-white text-indigo-600 shadow-sm border border-slate-200 font-bold' 
        : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50 border border-transparent'
    }`}
  >
    <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{icon}</span>
    <span className="text-sm">{label}</span>
    {count && (
      <span className={`ml-auto px-1.5 py-0.5 rounded-lg text-[10px] font-bold ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
        {count}
      </span>
    )}
  </button>
);

const AlertCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default MailInbox;
