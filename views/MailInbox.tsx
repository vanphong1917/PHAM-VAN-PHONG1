
import React, { useState } from 'react';
import { Mail, Search, Filter, RefreshCw, Star, Trash2, Archive, Inbox, FileText, Paperclip, X, SendHorizontal, Save, Send, ChevronLeft, Fullscreen, Maximize2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

type MailFolder = 'INBOX' | 'SENT' | 'DRAFTS';

const MailInbox: React.FC = () => {
  const { t } = useLanguage();
  const [folder, setFolder] = useState<MailFolder>('INBOX');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMail, setSelectedMail] = useState<any>(null);

  const mockMails: Record<MailFolder, any[]> = {
    INBOX: [
      { id: '1', from: 'IT Department', subject: 'Thông báo bảo trì máy chủ MAIL01 hàng tháng', time: '10:45 AM', date: '25/10/2024', read: false, content: 'Chào mọi người,\n\nHệ thống Mail (MailEnable) sẽ được bảo trì định kỳ vào tối nay lúc 22:00. Dự kiến thời gian bảo trì kéo dài 30 phút.\n\nTrong thời gian này, dịch vụ Webmail và IMAP có thể bị gián đoạn tạm thời. Vui lòng lưu lại các dự thảo công việc đang dở dang.\n\nTrân trọng,\nĐội ngũ vận hành IT' },
      { id: '2', from: 'Phòng Nhân sự', subject: 'Lưu ý về quy trình đăng ký nghỉ phép mới', time: '09:12 AM', date: '25/10/2024', read: true, content: 'Thông báo về việc thay đổi quy trình nghỉ phép từ ngày 01/11...\n\nCác nhân viên cần truy cập vào cổng Workplace > Phê duyệt của tôi để thực hiện quy trình mới.' },
      { id: '3', from: 'Hệ thống Bảo mật', subject: 'Cảnh báo: Đăng nhập từ thiết bị mới', time: 'Yesterday', date: '24/10/2024', read: true, content: 'Phát hiện đăng nhập mới từ địa chỉ IP lạ: 192.168.1.55 vào lúc 14:00 hôm qua.\n\nNếu đây không phải là bạn, vui lòng đổi mật khẩu ngay lập tức tại phần Chính sách bảo mật.' },
      { id: '4', from: 'Văn phòng Giám đốc', subject: 'Công văn cập nhật chính sách nội bộ 2024', time: 'Oct 24', date: '24/10/2024', read: true, content: 'Vui lòng xem thông tin chi tiết về các thay đổi chính sách nhân sự và vận hành năm 2024.\n\nTệp đính kèm đã được chuyển sang Nextcloud do kích thước lớn.' },
      { id: '5', from: 'Hệ thống Sao lưu', subject: 'Báo cáo sao lưu hàng ngày: Thành công', time: 'Oct 23', date: '23/10/2024', read: true, content: 'Tất cả các máy chủ DC1, DC2, MAIL01 đã được sao lưu thành công lên hệ thống BACKUP01.\n\nTính toàn vẹn dữ liệu: 100%.' },
    ],
    SENT: [
      { id: 's1', to: 'Quản lý Peter', subject: 'Báo cáo hạ tầng Q3 - Bản cuối', time: '11:20 AM', date: '25/10/2024', read: true, content: 'Gửi anh Peter báo cáo hạ tầng site A và site B sau khi nâng cấp RAID6...' },
      { id: 's2', to: 'Phòng Nhân sự', subject: 'Xác nhận tham gia khóa đào tạo an toàn thông tin', time: 'Oct 22', date: '22/10/2024', read: true, content: 'Tôi xác nhận sẽ tham gia buổi đào tạo sáng thứ Sáu này.' },
    ],
    DRAFTS: [
      { id: 'd1', to: '(Chưa có người nhận)', subject: 'Dự thảo cấu hình cluster dự phòng site B', time: '30 phút trước', date: '25/10/2024', read: true, content: 'Các bước triển khai bao gồm: \n1. Cấu hình Heartbeat...\n2. Đồng bộ Index...' },
    ]
  };

  const currentMails = mockMails[folder];

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="text-indigo-600" size={24} /> {t('internalMail')}
          </h2>
          <p className="text-slate-500 text-sm">Hệ thống liên lạc On-Premise bảo mật cao.</p>
        </div>
        <button 
          onClick={() => setIsComposeOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Mail size={18} /> {t('compose')}
        </button>
      </div>

      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        {/* Sidebar Folders */}
        <aside className="w-56 flex flex-col gap-1 shrink-0 hidden lg:flex">
          <FolderButton icon={<Inbox size={18} />} label={t('inbox')} active={folder === 'INBOX'} onClick={() => {setFolder('INBOX'); setSelectedMail(null);}} count="12" />
          <FolderButton icon={<SendHorizontal size={18} />} label={t('sent')} active={folder === 'SENT'} onClick={() => {setFolder('SENT'); setSelectedMail(null);}} />
          <FolderButton icon={<FileText size={18} />} label={t('drafts')} active={folder === 'DRAFTS'} onClick={() => {setFolder('DRAFTS'); setSelectedMail(null);}} count="1" />
          
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
            <div className="px-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Lưu trữ chuyên sâu</h4>
              <div className="space-y-3">
                <button className="flex items-center gap-2 text-xs text-slate-500 font-bold hover:text-indigo-600 transition-colors"><Archive size={14} className="text-slate-300" /> Mail cũ (ARCH01)</button>
                <button className="flex items-center gap-2 text-xs text-slate-500 font-bold hover:text-rose-600 transition-colors"><Trash2 size={14} className="text-slate-300" /> Thùng rác</button>
              </div>
            </div>
            
            <div className="mx-2 p-3 bg-slate-900 rounded-xl text-white">
              <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                <span>Dung lượng</span>
                <span>35%</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full mb-2">
                <div className="bg-indigo-500 h-full rounded-full" style={{width: '35%'}}></div>
              </div>
              <p className="text-[10px] font-medium text-slate-300">7.2 GB / 20 GB</p>
            </div>
          </div>
        </aside>

        {/* Mail List & Reader Split View */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex overflow-hidden">
          {/* List Area */}
          <div className={`flex-1 flex flex-col min-w-0 border-r border-slate-100 ${selectedMail ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search')} 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 outline-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 transition-all" 
                />
              </div>
              <button className="p-2 text-slate-400 hover:text-indigo-600 bg-white border border-slate-200 rounded-xl transition-all shadow-sm"><RefreshCw size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {currentMails.map((mail) => (
                <div 
                  key={mail.id} 
                  className={`p-4 cursor-pointer transition-all hover:bg-slate-50 ${selectedMail?.id === mail.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : ''} ${!mail.read ? 'bg-white' : 'bg-slate-50/20'}`}
                  onClick={() => setSelectedMail(mail)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm ${!mail.read ? 'font-bold text-slate-900' : 'text-slate-600 font-medium'}`}>
                      {folder === 'INBOX' ? mail.from : mail.to}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{mail.time}</span>
                  </div>
                  <h4 className={`text-sm truncate mb-1 ${!mail.read ? 'font-bold text-slate-900' : 'text-slate-500 font-medium'}`}>
                    {mail.subject}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {mail.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Reader Area */}
          <div className={`flex-[1.5] flex flex-col bg-white overflow-hidden transition-all duration-300 ${selectedMail ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0 pointer-events-none'}`}>
            {selectedMail ? (
              <div className="h-full flex flex-col">
                {/* Reader Toolbar */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedMail(null)} className="md:hidden p-2 text-slate-500 hover:bg-white rounded-lg border border-slate-200"><ChevronLeft size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg border border-transparent hover:border-slate-200 transition-all"><Star size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-rose-600 rounded-lg border border-transparent hover:border-slate-200 transition-all"><Trash2 size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg border border-transparent hover:border-slate-200 transition-all"><Archive size={18} /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors uppercase tracking-widest">Trả lời</button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg border border-transparent hover:border-slate-200"><Maximize2 size={18} /></button>
                  </div>
                </div>

                {/* Mail Content */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                  <div className="max-w-3xl mx-auto space-y-10">
                    <div className="space-y-6">
                      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
                        {selectedMail.subject}
                      </h1>
                      <div className="flex items-center gap-4 py-4 border-y border-slate-100">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-100">
                          {(folder === 'INBOX' ? selectedMail.from : selectedMail.to).charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900">
                            {folder === 'INBOX' ? selectedMail.from : selectedMail.to}
                            <span className="text-slate-400 font-normal ml-2"> &lt;system@enterprise.com&gt;</span>
                          </p>
                          <p className="text-xs text-slate-500 font-medium">Gửi lúc {selectedMail.time}, ngày {selectedMail.date}</p>
                        </div>
                        <div className="hidden sm:block">
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-widest rounded border border-slate-200">
                            Internal Only
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-base text-slate-700 leading-[1.8] whitespace-pre-wrap font-medium">
                      {selectedMail.content}
                    </div>

                    {selectedMail.id === '1' && (
                      <div className="mt-12 p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-between group hover:border-indigo-300 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600 border border-slate-100">
                            <FileText size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Chi-tiet-bao-tri.pdf</p>
                            <p className="text-xs text-slate-400 font-medium">1.2 MB • Tài liệu nội bộ</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Tải về</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-200 mb-6">
                  <Mail size={40} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Chọn một thư để xem nội dung</h3>
                <p className="text-sm text-slate-400 max-w-xs">Trao đổi thông tin nội bộ trên nền tảng On-Premise bảo mật cao.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp">
            <div className="px-6 py-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail size={18} />
                <h3 className="font-bold text-sm tracking-widest uppercase">{t('compose')}</h3>
              </div>
              <button onClick={() => setIsComposeOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 py-2 border-b border-slate-100">
                <label className="w-16 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('to')}</label>
                <input type="text" placeholder="nhan-vien@enterprise.com" className="flex-1 outline-none text-sm font-bold text-slate-800 bg-transparent" />
              </div>
              <div className="flex items-center gap-4 py-2 border-b border-slate-100">
                <label className="w-16 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('subject_table')}</label>
                <input type="text" placeholder="Tiêu đề thư nội bộ..." className="flex-1 outline-none text-sm font-bold text-slate-800 bg-transparent" />
              </div>
              <textarea className="w-full h-64 outline-none text-sm leading-relaxed text-slate-700 bg-slate-50/50 p-6 rounded-2xl resize-none border border-slate-100 focus:border-indigo-100" placeholder={t('message')}></textarea>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-indigo-600 font-bold transition-all text-xs"><Paperclip size={16} /> Đính kèm</button>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsComposeOpen(false)} className="px-4 py-2 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest transition-colors">{t('discard')}</button>
                <button onClick={() => setIsComposeOpen(false)} className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95"><Send size={16} /> {t('send')}</button>
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
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${active ? 'bg-white text-indigo-600 shadow-sm border-slate-200 font-bold' : 'text-slate-500 hover:text-indigo-600 border-transparent hover:bg-white/40'}`}>
    <span className={active ? 'text-indigo-600' : 'text-slate-400'}>{icon}</span>
    <span className="text-sm">{label}</span>
    {count && <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>}
  </button>
);

export default MailInbox;
