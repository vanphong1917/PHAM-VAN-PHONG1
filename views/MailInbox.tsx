
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Mail, Search, Filter, RefreshCw, Star, Trash2, Archive, Inbox, FileText, Paperclip, X, 
  SendHorizontal, Save, Send, ChevronLeft, Maximize2, Download, Calendar, User, Tag, 
  ChevronDown, ChevronUp, Clock, Image as ImageIcon, Loader2,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Type, ALargeSmall, File as FileIcon, Paperclip as PaperclipIcon
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
  const [attachedFiles, setAttachedFiles] = useState<{ name: string, size: string, type: string, data: string }[]>([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lấy toàn bộ dữ liệu từ Master DB Cache
  const [db, setDb] = useState<any>(() => {
    const cache = localStorage.getItem('hdh_master_db_cache');
    return cache ? JSON.parse(cache) : null;
  });

  // Load mails của user hiện tại
  const userMails = useMemo(() => {
    if (!db || !db.user_storages[currentUser.username]) return { INBOX: [], SENT: [], DRAFTS: [] };
    return db.user_storages[currentUser.username].mails;
  }, [db, currentUser.username]);

  const allUsers = useMemo(() => db?.users || [], [db]);

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

  // Logic xử lý đính kèm tệp
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAttachedFiles(prev => [...prev, {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type,
          data: base64
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Logic lưu nháp
  const handleSaveDraft = () => {
    setIsSavingDraft(true);
    const now = new Date();
    const mailId = 'draft-' + Date.now().toString();
    const content = contentRef.current?.innerHTML || '';

    const draftMail: MailItem = {
      id: mailId,
      from: currentUser.username,
      fromName: currentUser.name,
      to: composeData.recipients.join(', '),
      subject: composeData.subject || '(Không tiêu đề)',
      content: content,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`,
      read: true,
      attachments: attachedFiles
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
    }, 500);
  };

  // Logic gửi thư (Hỗ trợ nhiều người nhận)
  const handleSendMail = () => {
    if (composeData.recipients.length === 0) {
      alert("Vui lòng chọn ít nhất một người nhận.");
      return;
    }
    if (!composeData.subject) {
      if (!confirm("Gửi thư không có tiêu đề?")) return;
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
      starred: false,
      hasAttachment: attachedFiles.length > 0,
      attachments: attachedFiles
    };

    const newDb = { ...db };
    
    // 1. Lưu vào thư mục SENT của người gửi
    if (!newDb.user_storages[currentUser.username]) {
      newDb.user_storages[currentUser.username] = { mails: { INBOX: [], SENT: [], DRAFTS: [] }, files: [] };
    }
    newDb.user_storages[currentUser.username].mails.SENT = [newMail, ...(newDb.user_storages[currentUser.username].mails.SENT || [])];

    // 2. Chuyển phát vào INBOX của những người nhận
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
      alert("Thư đã được gửi đi thành công.");
    }, 800);
  };

  const resetCompose = () => {
    setComposeData({ recipients: [], subject: '', content: '' });
    setAttachedFiles([]);
    setRecipientInput('');
    if (contentRef.current) contentRef.current.innerHTML = '';
  };

  const addRecipient = (email: string) => {
    const trimmed = email.trim();
    if (trimmed && !composeData.recipients.includes(trimmed)) {
      setComposeData(prev => ({ ...prev, recipients: [...prev.recipients, trimmed] }));
    }
    setRecipientInput('');
  };

  const removeRecipient = (email: string) => {
    setComposeData(prev => ({ ...prev, recipients: prev.recipients.filter(r => r !== email) }));
  };

  const execCmd = (cmd: string, value: string = '') => {
    document.execCommand(cmd, false, value);
    contentRef.current?.focus();
  };

  const fontFamilies = ["Inter", "Arial", "Times New Roman", "Courier New", "Georgia", "Verdana"];
  const fontSizes = [
    { label: 'Rất nhỏ', value: '1' },
    { label: 'Nhỏ', value: '2' },
    { label: 'Bình thường', value: '3' },
    { label: 'Lớn', value: '4' },
    { label: 'Rất lớn', value: '5' },
    { label: 'Khổng lồ', value: '6' },
  ];

  return (
    <div className="h-full flex flex-col gap-4 animate-fadeIn">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mail className="text-indigo-600" size={24} /> {t('internalMail')}
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Cụm máy chủ: Bare-Metal-Mail-Node-01</p>
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
                placeholder="Tìm kiếm thư trong phân vùng..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:ring-4 focus:ring-indigo-50 font-bold" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredMails.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <Inbox size={64} />
                <p className="text-[10px] font-black uppercase tracking-widest mt-4">Không có dữ liệu</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredMails.map((mail: any) => (
                  <div 
                    key={mail.id} 
                    onClick={() => setSelectedMail(mail)}
                    className={`p-5 cursor-pointer hover:bg-slate-50 flex items-center gap-5 transition-all ${!mail.read ? 'bg-indigo-50/20' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white ${!mail.read ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                      {mail.fromName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs ${!mail.read ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>{mail.fromName}</p>
                        <span className="text-[9px] font-bold text-slate-400">{mail.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm truncate flex-1 ${!mail.read ? 'font-black text-indigo-600' : 'text-slate-700 font-medium'}`}>{mail.subject}</h4>
                        {mail.attachments?.length > 0 && <PaperclipIcon size={12} className="text-slate-400" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedMail && (
          <div className="w-1/2 bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button onClick={() => setSelectedMail(null)} className="p-2 hover:bg-white rounded-xl text-slate-400"><X size={20} /></button>
              <div className="flex gap-2">
                <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><Trash2 size={18} /></button>
                <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><Star size={18} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              <div>
                <h1 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">{selectedMail.subject}</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Đến: {selectedMail.to}</p>
              </div>
              <div className="flex items-center gap-4 py-4 border-y border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-xl shadow-indigo-100">{selectedMail.fromName.charAt(0)}</div>
                <div>
                  <p className="text-sm font-black text-slate-900">{selectedMail.fromName}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedMail.time} • {selectedMail.date}</p>
                </div>
              </div>
              <div className="text-sm text-slate-700 leading-relaxed font-medium min-h-[100px]" dangerouslySetInnerHTML={{ __html: selectedMail.content }}></div>
              
              {selectedMail.attachments && selectedMail.attachments.length > 0 && (
                <div className="pt-8 border-t border-slate-100">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <PaperclipIcon size={14} /> Tệp đính kèm ({selectedMail.attachments.length})
                  </h5>
                  <div className="flex flex-wrap gap-3">
                    {selectedMail.attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl group hover:bg-indigo-50 transition-all">
                        <FileIcon size={18} className="text-indigo-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{file.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{file.size}</p>
                        </div>
                        <a href={file.data} download={file.name} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Download size={16} /></a>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col animate-scaleUp max-h-[95vh]">
            <div className="px-10 py-6 bg-indigo-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl"><Mail size={24} /></div>
                <h3 className="font-black text-sm uppercase tracking-[0.2em] italic">Compose Internal Mail</h3>
              </div>
              <button onClick={() => setIsComposeOpen(false)} className="p-2 hover:bg-white/20 rounded-2xl transition-all"><X size={28} /></button>
            </div>
            
            <div className="p-8 space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[60px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 shrink-0">Đến:</span>
                  {composeData.recipients.map(email => (
                    <div key={email} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-2 shadow-sm animate-scaleUp">
                      {email} <button onClick={() => removeRecipient(email)}><X size={12} /></button>
                    </div>
                  ))}
                  <input 
                    type="text"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addRecipient(recipientInput);
                      }
                    }}
                    onBlur={() => addRecipient(recipientInput)}
                    placeholder="Nhập địa chỉ người nhận..."
                    className="flex-1 bg-transparent outline-none text-xs font-bold min-w-[150px]"
                  />
                </div>
                <input 
                  type="text"
                  placeholder="Tiêu đề thư..."
                  value={composeData.subject}
                  onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-black text-sm"
                />
              </div>

              <div className="border border-slate-200 rounded-[2rem] overflow-hidden flex flex-col min-h-[400px]">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 shrink-0">
                  <select 
                    onChange={(e) => execCmd('fontName', e.target.value)}
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                  >
                    {fontFamilies.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select 
                    onChange={(e) => execCmd('fontSize', e.target.value)}
                    className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none"
                    defaultValue="3"
                  >
                    {fontSizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <div className="w-px h-6 bg-slate-300 mx-1"></div>
                  <EditorBtn icon={<Bold size={16} />} onClick={() => execCmd('bold')} />
                  <EditorBtn icon={<Italic size={16} />} onClick={() => execCmd('italic')} />
                  <EditorBtn icon={<Underline size={16} />} onClick={() => execCmd('underline')} />
                  <div className="w-px h-6 bg-slate-300 mx-1"></div>
                  <EditorBtn icon={<AlignLeft size={16} />} onClick={() => execCmd('justifyLeft')} />
                  <EditorBtn icon={<AlignCenter size={16} />} onClick={() => execCmd('justifyCenter')} />
                  <EditorBtn icon={<AlignRight size={16} />} onClick={() => execCmd('justifyRight')} />
                  <div className="w-px h-6 bg-slate-300 mx-1"></div>
                  <EditorBtn icon={<List size={16} />} onClick={() => execCmd('insertUnorderedList')} />
                  <EditorBtn icon={<ListOrdered size={16} />} onClick={() => execCmd('insertOrderedList')} />
                  <div className="w-px h-6 bg-slate-300 mx-1"></div>
                  <EditorBtn icon={<ImageIcon size={16} />} onClick={() => {
                    const url = prompt("Nhập URL hình ảnh:");
                    if (url) execCmd('insertImage', url);
                  }} />
                </div>
                {/* Editable Area */}
                <div 
                  ref={contentRef}
                  contentEditable
                  className="flex-1 p-8 outline-none text-sm text-slate-700 leading-relaxed font-medium bg-white overflow-y-auto"
                ></div>
              </div>

              {/* Attachments Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <PaperclipIcon size={14} /> Tệp đính kèm ({attachedFiles.length})
                  </h5>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-black text-indigo-600 uppercase hover:underline"
                  >
                    Thêm tệp tin
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                </div>
                <div className="flex flex-wrap gap-3">
                  {attachedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl group animate-scaleUp">
                      <FileIcon size={16} className="text-indigo-600" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-900 max-w-[150px] truncate">{file.name}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase">{file.size}</p>
                      </div>
                      <button onClick={() => removeAttachment(idx)} className="text-slate-300 hover:text-rose-500 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"
                  title="Đính kèm tệp"
                >
                  <PaperclipIcon size={20} />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isSending}
                  className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  {isSavingDraft ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} 
                  Lưu nháp
                </button>
                <button 
                  onClick={handleSendMail}
                  disabled={isSending || isSavingDraft}
                  className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-100 active:scale-95 transition-all disabled:opacity-70"
                >
                  {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} 
                  {isSending ? "Đang gửi..." : "Gửi thư nội bộ"}
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
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all border ${active ? 'bg-white border-slate-200 text-indigo-600 shadow-sm font-black' : 'border-transparent text-slate-400 hover:bg-white/60 hover:text-slate-900'}`}>
    <span className={active ? 'text-indigo-600' : 'text-slate-300'}>{icon}</span>
    <span className="text-[11px] font-black uppercase tracking-widest flex-1 text-left">{label}</span>
    {count > 0 && <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${active ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{count}</span>}
  </button>
);

const EditorBtn = ({ icon, onClick }: any) => (
  <button 
    type="button"
    onClick={(e) => { e.preventDefault(); onClick(); }} 
    className="p-2 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-xl transition-all hover:shadow-sm"
  >
    {icon}
  </button>
);

export default MailInbox;
