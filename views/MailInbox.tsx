
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Mail, Search, Filter, RefreshCw, Star, Trash2, Archive, Inbox, FileText, Paperclip, X, 
  SendHorizontal, Save, Send, ChevronLeft, Maximize2, Download, Calendar, User, Tag, 
  ChevronDown, ChevronUp, Clock, Image as ImageIcon, Loader2,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Type, ALargeSmall, File as FileIcon, Paperclip as PaperclipIcon, UserPlus
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

type MailFolder = 'INBOX' | 'SENT' | 'DRAFTS';

interface MailItem {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  time: string;
  date: string;
  read: boolean;
  content: string;
  starred?: boolean;
  hasAttachment?: boolean;
  attachments?: { name: string; size: string; type: string; data: string }[];
}

interface MailInboxProps {
  currentUser: any;
}

const MailInbox: React.FC<MailInboxProps> = ({ currentUser }) => {
  const { t } = useLanguage();
  const [folder, setFolder] = useState<MailFolder>('INBOX');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);
  
  const [composeData, setComposeData] = useState<{ recipients: string[], subject: string, content: string }>({ 
    recipients: [], 
    subject: '', 
    content: '' 
  });
  const [recipientInput, setRecipientInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string, size: string, type: string, data: string }[]>([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [db, setDb] = useState<any>(() => {
    const cache = localStorage.getItem('hdh_master_db_cache');
    return cache ? JSON.parse(cache) : null;
  });

  const allUsers = useMemo(() => db?.users || [], [db]);

  const userMails = useMemo(() => {
    if (!db || !db.user_storages[currentUser.username]) return { INBOX: [], SENT: [], DRAFTS: [] };
    return db.user_storages[currentUser.username].mails;
  }, [db, currentUser.username]);

  const filteredMails = useMemo(() => {
    let currentList = userMails[folder] || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      currentList = currentList.filter((m: any) => 
        m.subject.toLowerCase().includes(q) || 
        m.fromName.toLowerCase().includes(q) ||
        m.content.toLowerCase().includes(q)
      );
    }
    return currentList;
  }, [userMails, folder, searchQuery]);

  // Gợi ý người nhận từ danh bạ Master DB
  const userSuggestions = useMemo(() => {
    if (!recipientInput.trim()) return [];
    const q = recipientInput.toLowerCase();
    return allUsers.filter((u: any) => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) || 
      u.username.toLowerCase().includes(q)
    ).filter((u: any) => !composeData.recipients.includes(u.email));
  }, [recipientInput, allUsers, composeData.recipients]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    // Fix: Explicitly cast 'file' to 'File' to avoid TS errors when Array.from loses type information
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFiles(prev => [...prev, {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type,
          data: event.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSendMail = () => {
    if (composeData.recipients.length === 0) {
      alert("Vui lòng chọn ít nhất một người nhận từ danh bạ.");
      return;
    }
    setIsSending(true);
    const now = new Date();
    const mailId = Date.now().toString();
    const content = contentRef.current?.innerHTML || '';

    const newMail: MailItem = {
      id: mailId,
      from: currentUser.username,
      fromName: currentUser.name,
      to: composeData.recipients.join(', '),
      subject: composeData.subject || '(Không tiêu đề)',
      content: content,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`,
      read: true,
      hasAttachment: attachedFiles.length > 0,
      attachments: attachedFiles
    };

    const newDb = { ...db };
    
    // 1. Lưu vào SENT của người gửi
    if (!newDb.user_storages[currentUser.username]) {
      newDb.user_storages[currentUser.username] = { mails: { INBOX: [], SENT: [], DRAFTS: [] }, files: [] };
    }
    newDb.user_storages[currentUser.username].mails.SENT = [newMail, ...(newDb.user_storages[currentUser.username].mails.SENT || [])];

    // 2. Chuyển phát vào INBOX từng người nhận
    composeData.recipients.forEach(email => {
      const targetUser = allUsers.find((u: any) => u.email === email);
      if (targetUser) {
        const username = targetUser.username;
        if (!newDb.user_storages[username]) {
          newDb.user_storages[username] = { mails: { INBOX: [], SENT: [], DRAFTS: [] }, files: [] };
        }
        const inboxMail = { ...newMail, read: false };
        newDb.user_storages[username].mails.INBOX = [inboxMail, ...(newDb.user_storages[username].mails.INBOX || [])];
      }
    });

    setTimeout(() => {
      setDb(newDb);
      localStorage.setItem('hdh_master_db_cache', JSON.stringify(newDb));
      window.dispatchEvent(new Event('storage_sync'));
      setIsSending(false);
      setIsComposeOpen(false);
      resetCompose();
      alert("Thư đã được gửi đến " + composeData.recipients.length + " người nhận.");
    }, 800);
  };

  const resetCompose = () => {
    setComposeData({ recipients: [], subject: '', content: '' });
    setAttachedFiles([]);
    setRecipientInput('');
    if (contentRef.current) contentRef.current.innerHTML = '';
  };

  const addRecipient = (email: string) => {
    if (email && !composeData.recipients.includes(email)) {
      setComposeData(prev => ({ ...prev, recipients: [...prev.recipients, email] }));
    }
    setRecipientInput('');
    setShowSuggestions(false);
  };

  const execCmd = (cmd: string, value: string = '') => {
    document.execCommand(cmd, false, value);
    contentRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fadeIn">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="text-indigo-600" size={24} /> {t('internalMail')}
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Nút mạng: Bare-Metal-Mail-Node-01</p>
        </div>
        <button 
          onClick={() => { resetCompose(); setIsComposeOpen(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
        >
          <Mail size={16} /> {t('compose')}
        </button>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <aside className="w-52 shrink-0 flex flex-col gap-1">
          <FolderBtn icon={<Inbox size={18} />} label="Hộp thư đến" active={folder === 'INBOX'} onClick={() => setFolder('INBOX')} count={userMails.INBOX.length} />
          <FolderBtn icon={<SendHorizontal size={18} />} label="Đã gửi" active={folder === 'SENT'} onClick={() => setFolder('SENT')} count={userMails.SENT.length} />
          <FolderBtn icon={<FileText size={18} />} label="Thư nháp" active={folder === 'DRAFTS'} onClick={() => setFolder('DRAFTS')} count={userMails.DRAFTS.length} />
        </aside>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thư..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-indigo-50 font-bold" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredMails.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <Inbox size={64} />
                <p className="text-[10px] font-black uppercase tracking-widest mt-4">Trống</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredMails.map((mail: any) => (
                  <div key={mail.id} onClick={() => setSelectedMail(mail)} className={`p-5 cursor-pointer hover:bg-slate-50 flex items-center gap-5 transition-all ${!mail.read ? 'bg-indigo-50/20' : ''}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${!mail.read ? 'bg-indigo-600' : 'bg-slate-300'}`}>{mail.fromName.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs ${!mail.read ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>{mail.fromName}</p>
                        <span className="text-[9px] font-bold text-slate-400">{mail.time}</span>
                      </div>
                      <h4 className={`text-sm truncate ${!mail.read ? 'font-black text-indigo-600' : 'text-slate-700 font-medium'}`}>{mail.subject}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedMail && (
          <div className="w-1/2 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <button onClick={() => setSelectedMail(null)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              <h1 className="text-2xl font-black text-slate-900 uppercase italic">{selectedMail.subject}</h1>
              <div className="flex items-center gap-4 py-4 border-y border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">{selectedMail.fromName.charAt(0)}</div>
                <div>
                  <p className="text-sm font-black text-slate-900">{selectedMail.fromName}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{selectedMail.time} • {selectedMail.date}</p>
                  <p className="text-[9px] text-indigo-600 font-bold">Đến: {selectedMail.to}</p>
                </div>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed min-h-[100px]" dangerouslySetInnerHTML={{ __html: selectedMail.content }}></div>
            </div>
          </div>
        )}
      </div>

      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-scaleUp max-h-[95vh]">
            <div className="px-10 py-6 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Mail size={24} />
                <h3 className="font-black text-sm uppercase tracking-widest italic">Soạn thư nội bộ</h3>
              </div>
              <button onClick={() => setIsComposeOpen(false)} className="p-2 hover:bg-white/20 rounded-2xl"><X size={28} /></button>
            </div>
            
            <div className="p-8 space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                {/* Ô nhập người nhận tích hợp Danh bạ */}
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[60px]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">Đến:</span>
                    {composeData.recipients.map(email => (
                      <div key={email} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-2 shadow-sm">
                        {email} <button onClick={() => setComposeData(prev => ({...prev, recipients: prev.recipients.filter(r => r !== email)}))}><X size={12} /></button>
                      </div>
                    ))}
                    <input 
                      type="text"
                      value={recipientInput}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => setRecipientInput(e.target.value)}
                      placeholder="Tìm tên hoặc email từ danh bạ..."
                      className="flex-1 bg-transparent outline-none text-xs font-bold min-w-[200px]"
                    />
                  </div>
                  {showSuggestions && userSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                      {userSuggestions.map((u: any) => (
                        <button key={u.id} onClick={() => addRecipient(u.email)} className="w-full p-4 text-left hover:bg-indigo-50 flex items-center gap-4 transition-all">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">{u.name.charAt(0)}</div>
                          <div>
                            <p className="text-xs font-black text-slate-900">{u.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{u.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input 
                  type="text"
                  placeholder="Tiêu đề thư..."
                  value={composeData.subject}
                  onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-sm"
                />
              </div>

              {/* Toolbar và Vùng soạn thảo */}
              <div className="border border-slate-200 rounded-[2rem] overflow-hidden flex flex-col min-h-[300px]">
                <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-100 border-b border-slate-200">
                  <EditorBtn icon={<Bold size={16} />} onClick={() => execCmd('bold')} />
                  <EditorBtn icon={<Italic size={16} />} onClick={() => execCmd('italic')} />
                  <EditorBtn icon={<Underline size={16} />} onClick={() => execCmd('underline')} />
                  <div className="w-px h-6 bg-slate-300 mx-1"></div>
                  <EditorBtn icon={<AlignLeft size={16} />} onClick={() => execCmd('justifyLeft')} />
                  <EditorBtn icon={<AlignCenter size={16} />} onClick={() => execCmd('justifyCenter')} />
                  <EditorBtn icon={<AlignRight size={16} />} onClick={() => execCmd('justifyRight')} />
                </div>
                <div ref={contentRef} contentEditable className="flex-1 p-8 outline-none text-sm text-slate-700 leading-relaxed font-medium bg-white overflow-y-auto"></div>
              </div>

              {/* Tệp đính kèm */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><PaperclipIcon size={14} /> Tệp đính kèm ({attachedFiles.length})</h5>
                  <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Thêm tệp</button>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                </div>
                <div className="flex flex-wrap gap-3">
                  {attachedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl group animate-scaleUp">
                      <FileIcon size={16} className="text-indigo-600" />
                      <p className="text-[10px] font-bold text-slate-900 max-w-[150px] truncate">{file.name}</p>
                      <button onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-rose-500"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
              <button onClick={() => setIsComposeOpen(false)} className="px-6 py-3 text-slate-400 font-black uppercase tracking-widest text-[10px]">Hủy</button>
              <button onClick={handleSendMail} disabled={isSending} className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 disabled:opacity-70 transition-all">
                {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} 
                {isSending ? "Đang gửi..." : "Gửi thư ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FolderBtn = ({ icon, label, active, onClick, count }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all border ${active ? 'bg-white border-slate-200 text-indigo-600 shadow-sm font-black' : 'border-transparent text-slate-400 hover:bg-white/60 hover:text-slate-900'}`}>
    <span className={active ? 'text-indigo-600' : 'text-slate-300'}>{icon}</span>
    <span className="text-[11px] font-black uppercase tracking-widest flex-1 text-left">{label}</span>
    {count > 0 && <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>}
  </button>
);

const EditorBtn = ({ icon, onClick }: any) => (
  <button type="button" onClick={(e) => { e.preventDefault(); onClick(); }} className="p-2 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-xl transition-all">
    {icon}
  </button>
);

export default MailInbox;
