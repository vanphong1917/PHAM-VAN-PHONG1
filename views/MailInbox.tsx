
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Mail, Search, Filter, RefreshCw, Star, Trash2, Archive, Inbox, FileText, Paperclip, X, 
  SendHorizontal, Save, Send, ChevronLeft, Maximize2, Download, Calendar, User, Tag, 
  ChevronDown, ChevronUp, Clock, Image as ImageIcon, Loader2,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Type, ALargeSmall, File as FileIcon, Paperclip as PaperclipIcon, UserPlus, Eye
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

const FONT_FAMILIES = [
  { label: 'Inter (Hệ thống)', value: 'Inter, sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' }
];

const FONT_SIZES = [
  { label: 'Nhỏ', value: '1' },
  { label: 'Thường', value: '3' },
  { label: 'Lớn', value: '5' },
  { label: 'Rất lớn', value: '7' }
];

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
    const mailId = 'mail-' + Date.now().toString();
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
      attachments: [...attachedFiles]
    };

    const newDb = { ...db };
    if (!newDb.user_storages[currentUser.username]) {
      newDb.user_storages[currentUser.username] = { mails: { INBOX: [], SENT: [], DRAFTS: [] }, files: [] };
    }
    newDb.user_storages[currentUser.username].mails.SENT = [newMail, ...(newDb.user_storages[currentUser.username].mails.SENT || [])];

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
      alert("Thư đã được gửi thành công.");
    }, 800);
  };

  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    const now = new Date();
    const draftId = 'draft-' + Date.now().toString();
    const content = contentRef.current?.innerHTML || '';

    const draftMail: MailItem = {
      id: draftId,
      from: currentUser.username,
      fromName: currentUser.name,
      to: composeData.recipients.join(', '),
      subject: composeData.subject || '(Thư nháp không tiêu đề)',
      content: content,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`,
      read: true,
      hasAttachment: attachedFiles.length > 0,
      attachments: [...attachedFiles]
    };

    const newDb = { ...db };
    if (!newDb.user_storages[currentUser.username]) {
      newDb.user_storages[currentUser.username] = { mails: { INBOX: [], SENT: [], DRAFTS: [] }, files: [] };
    }
    newDb.user_storages[currentUser.username].mails.DRAFTS = [draftMail, ...(newDb.user_storages[currentUser.username].mails.DRAFTS || [])];

    setTimeout(() => {
      setDb(newDb);
      localStorage.setItem('hdh_master_db_cache', JSON.stringify(newDb));
      window.dispatchEvent(new Event('storage_sync'));
      setIsSavingDraft(false);
      setIsComposeOpen(false);
      resetCompose();
      alert("Đã lưu vào thư nháp.");
    }, 600);
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

  const handleDownload = (file: any) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewFile = (file: any) => {
    try {
      const base64Parts = file.data.split(',');
      if (base64Parts.length < 2) {
         window.open(file.data, '_blank');
         return;
      }
      
      const base64Data = base64Parts[1];
      const contentType = base64Parts[0].split(':')[1].split(';')[0];
      
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });
      const fileURL = URL.createObjectURL(blob);
      
      // Mở bằng trình xem mặc định
      const newWindow = window.open(fileURL, '_blank');
      if (!newWindow) {
        alert("Vui lòng cho phép trình duyệt mở cửa sổ mới để xem tệp bằng trình đọc mặc định.");
      }
    } catch (e) {
      console.error("Lỗi khi xem tệp:", e);
      handleDownload(file);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 lg:gap-6 animate-fadeIn max-w-screen-2xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="text-indigo-600" size={24} /> {t('internalMail')}
          </h2>
          <p className="text-slate-500 text-[9px] lg:text-[10px] font-black uppercase tracking-widest mt-1">Nút mạng: Bare-Metal-Mail-Node-01</p>
        </div>
        <button 
          onClick={() => { resetCompose(); setIsComposeOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
        >
          <Mail size={16} /> {t('compose')}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0 overflow-hidden">
        {/* Sidebar Folders - Horizontal on mobile */}
        <aside className="w-full lg:w-52 shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto scrollbar-hide py-1">
          <FolderBtn icon={<Inbox size={18} />} label="Hộp thư" active={folder === 'INBOX'} onClick={() => setFolder('INBOX')} count={userMails.INBOX.length} />
          <FolderBtn icon={<SendHorizontal size={18} />} label="Đã gửi" active={folder === 'SENT'} onClick={() => setFolder('SENT')} count={userMails.SENT.length} />
          <FolderBtn icon={<FileText size={18} />} label="Nháp" active={folder === 'DRAFTS'} onClick={() => setFolder('DRAFTS')} count={userMails.DRAFTS.length} />
        </aside>

        {/* Mail List Area */}
        <div className={`flex-1 bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden ${selectedMail ? 'hidden lg:flex' : 'flex'}`}>
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
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                <Inbox size={64} />
                <p className="text-[10px] font-black uppercase tracking-widest mt-4">Trống</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredMails.map((mail: any) => (
                  <div key={mail.id} onClick={() => setSelectedMail(mail)} className={`p-4 lg:p-5 cursor-pointer hover:bg-slate-50 flex items-center gap-4 lg:gap-5 transition-all ${!mail.read ? 'bg-indigo-50/20' : ''}`}>
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-white ${!mail.read ? 'bg-indigo-600' : 'bg-slate-300'}`}>{mail.fromName.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs truncate max-w-[150px] ${!mail.read ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>{mail.fromName}</p>
                        <span className="text-[9px] font-bold text-slate-400">{mail.time}</span>
                      </div>
                      <h4 className={`text-sm truncate ${!mail.read ? 'font-black text-indigo-600' : 'text-slate-700 font-medium'}`}>{mail.subject}</h4>
                      {mail.hasAttachment && <Paperclip size={12} className="text-slate-400 mt-1" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mail Detail Area - Fullscreen on mobile when selected */}
        {selectedMail && (
          <div className="fixed inset-0 lg:relative lg:inset-auto z-50 lg:z-0 lg:w-1/2 bg-white lg:rounded-[2.5rem] border-0 lg:border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
            <div className="p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-white lg:bg-transparent">
              <button onClick={() => setSelectedMail(null)} className="p-2 hover:bg-slate-100 rounded-xl flex items-center gap-2 text-slate-600">
                <ChevronLeft size={20} className="lg:hidden" />
                <X size={20} className="hidden lg:block" />
                <span className="lg:hidden text-xs font-black uppercase tracking-widest">Quay lại</span>
              </button>
              <div className="flex gap-1 lg:gap-2">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl"><Star size={20} /></button>
                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-xl"><Trash2 size={20} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6 lg:space-y-8">
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 uppercase italic leading-tight break-words">{selectedMail.subject}</h1>
              <div className="flex items-center gap-4 py-4 border-y border-slate-100">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0">{selectedMail.fromName.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{selectedMail.fromName}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{selectedMail.time} • {selectedMail.date}</p>
                  <p className="text-[9px] text-indigo-600 font-bold truncate">Đến: {selectedMail.to}</p>
                </div>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed min-h-[150px] break-words overflow-x-auto" dangerouslySetInnerHTML={{ __html: selectedMail.content }}></div>
              
              {selectedMail.attachments && selectedMail.attachments.length > 0 && (
                <div className="pt-8 border-t border-slate-100 space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <PaperclipIcon size={14} /> Tệp đính kèm ({selectedMail.attachments.length})
                  </h5>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedMail.attachments.map((file, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl group hover:bg-white hover:shadow-md transition-all gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0"><FileIcon size={18} /></div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">{file.size}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => handleViewFile(file)}
                            className="flex items-center gap-2 px-3 py-1.5 text-indigo-600 bg-white border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors"
                          >
                            <Eye size={16} /> <span className="text-[9px] font-black uppercase">Xem</span>
                          </button>
                          <button 
                            onClick={() => handleDownload(file)}
                            className="flex items-center gap-2 px-3 py-1.5 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <Download size={16} /> <span className="text-[9px] font-black uppercase">Tải</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isComposeOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 lg:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-4xl h-full lg:h-auto lg:rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-scaleUp lg:max-h-[95vh]">
            <div className="px-6 lg:px-10 py-4 lg:py-6 bg-indigo-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <Mail size={24} />
                <h3 className="font-black text-xs lg:text-sm uppercase tracking-widest italic">Soạn thư nội bộ</h3>
              </div>
              <button onClick={() => setIsComposeOpen(false)} className="p-2 hover:bg-white/20 rounded-2xl transition-all"><X size={28} /></button>
            </div>
            
            <div className="p-4 lg:p-8 space-y-4 lg:space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-3">
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2 p-3 lg:p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[50px] lg:min-h-[60px]">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-8 lg:w-12">Đến:</span>
                    {composeData.recipients.map(email => (
                      <div key={email} className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 shadow-sm">
                        {email} <button onClick={() => setComposeData(prev => ({...prev, recipients: prev.recipients.filter(r => r !== email)}))}><X size={10} /></button>
                      </div>
                    ))}
                    <input 
                      type="text"
                      value={recipientInput}
                      onFocus={() => setShowSuggestions(true)}
                      onChange={(e) => setRecipientInput(e.target.value)}
                      placeholder="Tìm tên hoặc email..."
                      className="flex-1 bg-transparent outline-none text-xs font-bold min-w-[150px]"
                    />
                  </div>
                  {showSuggestions && userSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[70] overflow-hidden max-h-60 overflow-y-auto">
                      {userSuggestions.map((u: any) => (
                        <button key={u.id} onClick={() => addRecipient(u.email)} className="w-full p-3 lg:p-4 text-left hover:bg-indigo-50 flex items-center gap-4 transition-all">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 shrink-0 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">{u.name.charAt(0)}</div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate">{u.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{u.email}</p>
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
                  className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-sm"
                />
              </div>

              <div className="border border-slate-200 rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden flex flex-col min-h-[250px] lg:min-h-[350px]">
                <div className="flex flex-wrap items-center gap-1 lg:gap-2 p-2 lg:p-3 bg-slate-100 border-b border-slate-200 overflow-x-auto">
                  <EditorBtn icon={<Bold size={16} />} onClick={() => execCmd('bold')} title="In đậm" />
                  <EditorBtn icon={<Italic size={16} />} onClick={() => execCmd('italic')} title="In nghiêng" />
                  <EditorBtn icon={<Underline size={16} />} onClick={() => execCmd('underline')} title="Gạch chân" />
                  <div className="w-px h-6 bg-slate-300 mx-1"></div>
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    <Type size={14} className="text-slate-400" />
                    <select onChange={(e) => execCmd('fontName', e.target.value)} className="text-[9px] font-bold bg-transparent outline-none cursor-pointer">
                      {FONT_FAMILIES.map(f => (<option key={f.value} value={f.value}>{f.label}</option>))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200">
                    <ALargeSmall size={14} className="text-slate-400" />
                    <select onChange={(e) => execCmd('fontSize', e.target.value)} defaultValue="3" className="text-[9px] font-bold bg-transparent outline-none cursor-pointer">
                      {FONT_SIZES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
                    </select>
                  </div>
                  <div className="w-px h-6 bg-slate-300 mx-1"></div>
                  <EditorBtn icon={<AlignLeft size={16} />} onClick={() => execCmd('justifyLeft')} title="Căn trái" />
                  <EditorBtn icon={<AlignCenter size={16} />} onClick={() => execCmd('justifyCenter')} title="Căn giữa" />
                  <EditorBtn icon={<AlignRight size={16} />} onClick={() => execCmd('justifyRight')} title="Căn phải" />
                </div>
                <div 
                  ref={contentRef} 
                  contentEditable 
                  className="flex-1 p-4 lg:p-8 outline-none text-sm text-slate-700 leading-relaxed font-medium bg-white overflow-y-auto min-h-[200px]"
                ></div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><PaperclipIcon size={14} /> Tệp ({attachedFiles.length})</h5>
                  <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Thêm tệp</button>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl group animate-scaleUp">
                      <FileIcon size={14} className="text-indigo-600" />
                      <p className="text-[9px] font-bold text-slate-900 max-w-[100px] truncate">{file.name}</p>
                      <button onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 lg:px-10 py-4 lg:py-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3 lg:gap-4 shrink-0">
              <button onClick={() => setIsComposeOpen(false)} className="hidden sm:block px-6 py-3 text-slate-400 font-black uppercase tracking-widest text-[10px]">Hủy</button>
              <div className="flex w-full sm:w-auto gap-2 lg:gap-4">
                <button 
                  onClick={handleSaveDraft} 
                  disabled={isSavingDraft || isSending}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 lg:px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-slate-50 active:scale-95 disabled:opacity-50"
                >
                  {isSavingDraft ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Nháp
                </button>
                <button 
                  onClick={handleSendMail} 
                  disabled={isSending || isSavingDraft} 
                  className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 lg:px-10 py-3 lg:py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 disabled:opacity-70 transition-all"
                >
                  {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} 
                  Gửi thư
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FolderBtn = ({ icon, label, active, onClick, count }: any) => (
  <button onClick={onClick} className={`shrink-0 lg:w-full flex items-center gap-2 lg:gap-4 px-4 lg:px-5 py-2.5 lg:py-4 rounded-xl lg:rounded-2xl transition-all border ${active ? 'bg-white border-slate-200 text-indigo-600 shadow-sm font-black' : 'border-transparent text-slate-400 hover:bg-white/60 hover:text-slate-900'}`}>
    <span className={active ? 'text-indigo-600' : 'text-slate-300'}>{icon}</span>
    <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-left">{label}</span>
    {count > 0 && <span className={`text-[8px] lg:text-[9px] px-1.5 py-0.5 rounded-md ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>}
  </button>
);

const EditorBtn = ({ icon, onClick, title }: any) => (
  <button 
    type="button" 
    title={title}
    onClick={(e) => { e.preventDefault(); onClick(); }} 
    className="p-1.5 lg:p-2 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-lg transition-all"
  >
    {icon}
  </button>
);

export default MailInbox;
