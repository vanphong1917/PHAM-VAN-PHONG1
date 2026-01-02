
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ClipboardCheck, Search, Filter, Clock, ChevronRight, User, AlertCircle, 
  CheckCircle2, Plus, X, FileText, Send, Info, Tag, Layers, Loader2,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List,
  Paperclip, UserPlus, UserCheck, Eye, Trash2, ArrowDown
} from 'lucide-react';
import StatusPill from '../components/StatusPill.tsx';
import { RequestStatus, SLAStatus } from '../types.ts';
import { useLanguage } from '../LanguageContext.tsx';

interface ApprovalListProps {
  onViewRequest: (id: string) => void;
  currentUser: any;
}

interface ApprovalStep {
  id: string;
  name: string;
  email: string;
  role: 'APPROVER' | 'CONSENT' | 'NOTIFY';
  status?: 'pending' | 'completed' | 'rejected';
}

const ApprovalList: React.FC<ApprovalListProps> = ({ onViewRequest, currentUser }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<'WAITING' | 'WATCHING' | 'HISTORY'>('WAITING');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Master DB
  const [db, setDb] = useState<any>(() => {
    const cache = localStorage.getItem('hdh_master_db_cache');
    return cache ? JSON.parse(cache) : { global_requests: [], users: [] };
  });

  useEffect(() => {
    const handleSync = () => {
      const cache = localStorage.getItem('hdh_master_db_cache');
      if (cache) setDb(JSON.parse(cache));
    };
    window.addEventListener('storage_sync', handleSync);
    return () => window.removeEventListener('storage_sync', handleSync);
  }, []);

  const [newRequest, setNewRequest] = useState({
    title: '',
    type: 'Nghỉ phép',
    priority: 'Normal'
  });
  const [attachments, setAttachments] = useState<{ name: string, size: string, type: string, data: string }[]>([]);
  const [approvalLine, setApprovalLine] = useState<ApprovalStep[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'APPROVER' | 'CONSENT' | 'NOTIFY'>('APPROVER');

  const filteredUserSuggestions = useMemo(() => {
    if (userSearch.length < 2) return [];
    return (db.users || []).filter((u: any) => 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [userSearch, db.users]);

  const filteredTasks = useMemo(() => {
    let list = db.global_requests || [];
    
    if (filter === 'WAITING') {
      // Logic "Đang chờ tôi": Status PENDING và bước tiếp theo trong line là email của tôi
      list = list.filter((req: any) => {
        if (req.status !== RequestStatus.PENDING) return false;
        const nextStep = req.approvalLine.find((s: any) => s.status !== 'completed');
        return nextStep && nextStep.email === currentUser.email;
      });
    } else if (filter === 'HISTORY') {
      list = list.filter((req: any) => req.status === RequestStatus.APPROVED || req.status === RequestStatus.REJECTED);
    } else if (filter === 'WATCHING') {
      // Đang theo dõi: Những yêu cầu do chính tôi tạo hoặc tôi có tên trong line nhưng không phải người duyệt hiện tại
      list = list.filter((req: any) => req.requesterEmail === currentUser.email || req.approvalLine.some((s: any) => s.email === currentUser.email));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t: any) => t.title.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
    }
    return list;
  }, [db.global_requests, filter, searchQuery, currentUser.email]);

  const execCmd = (cmd: string, value: string = '') => {
    document.execCommand(cmd, false, value);
    editorRef.current?.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fix: Explicitly cast 'file' to 'File' to avoid TS errors when Array.from loses type information
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type,
          data: event.target?.result as string
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const addStepToLine = (user: any) => {
    if (approvalLine.some(s => s.email === user.email)) return;
    const newStep: ApprovalStep = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: selectedRole,
      status: 'pending'
    };
    setApprovalLine([...approvalLine, newStep]);
    setUserSearch('');
    setShowUserSuggestions(false);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (approvalLine.length === 0) {
      alert("Vui lòng thiết lập ít nhất 1 người phê duyệt.");
      return;
    }
    setIsSubmitting(true);

    const requestId = Date.now().toString();
    const requestCode = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const newTask = {
      id: requestId,
      code: requestCode,
      title: newRequest.title,
      type: newRequest.type,
      priority: newRequest.priority,
      description: editorRef.current?.innerHTML || '',
      requester: currentUser.name,
      requesterEmail: currentUser.email,
      dept: currentUser.dept || 'N/A',
      status: RequestStatus.PENDING,
      sla: SLAStatus.NORMAL,
      deadline: '48h',
      approvalLine: approvalLine,
      attachments: attachments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newDb = { ...db };
    newDb.global_requests = [newTask, ...(newDb.global_requests || [])];

    setTimeout(() => {
      localStorage.setItem('hdh_master_db_cache', JSON.stringify(newDb));
      window.dispatchEvent(new Event('storage_sync'));
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
      resetForm();
      alert("Yêu cầu phê duyệt đã được gửi đi!");
    }, 1000);
  };

  const resetForm = () => {
    setNewRequest({ title: '', type: 'Nghỉ phép', priority: 'Normal' });
    setAttachments([]);
    setApprovalLine([]);
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('myApprovals')}</h2>
          <p className="text-slate-500 text-sm">Hệ thống luồng phê duyệt tập trung từ Master DB.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
        >
          <Plus size={20} /> Tạo yêu cầu
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <TabButton active={filter === 'WAITING'} onClick={() => setFilter('WAITING')} label={t('waitingMe')} count={filteredTasks.length.toString()} />
        <TabButton active={filter === 'WATCHING'} onClick={() => setFilter('WATCHING')} label={t('watching')} />
        <TabButton active={filter === 'HISTORY'} onClick={() => setFilter('HISTORY')} label={t('completed')} />
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')} 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100 min-h-[400px]">
          {filteredTasks.length > 0 ? filteredTasks.map((task: any) => (
            <div 
              key={task.id} 
              className="p-6 hover:bg-indigo-50/30 cursor-pointer transition-all group flex items-start gap-6"
              onClick={() => onViewRequest(task.id)}
            >
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100 shrink-0 transition-all group-hover:scale-110">
                <ClipboardCheck size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.code}</span>
                  <StatusPill status={task.status} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <User size={14} className="text-slate-400" />
                    {task.requester} <span className="text-slate-300 mx-1">/</span> {task.dept}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400">
                    <Clock size={14} />
                    {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all self-center" />
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
              <ClipboardCheck size={80} className="opacity-5 mb-4" />
              <p className="font-black text-xs uppercase tracking-widest italic opacity-40">Không có yêu cầu nào</p>
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp max-h-[90vh]">
            <div className="px-10 py-8 bg-indigo-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl"><Layers size={24} /></div>
                <div>
                  <h3 className="font-black text-lg uppercase tracking-widest italic">Tạo yêu cầu phê duyệt mới</h3>
                  <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Bare-metal Secure Workflow</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-white/20 rounded-2xl transition-all"><X size={28} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phân loại</label>
                      <select 
                        value={newRequest.type}
                        onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-sm"
                      >
                        <option>Nghỉ phép</option>
                        <option>Công tác</option>
                        <option>Đề xuất thiết bị</option>
                        <option>Bàn giao công việc</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Độ ưu tiên</label>
                      <select 
                        value={newRequest.priority}
                        onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-sm"
                      >
                        <option value="Low">Thấp</option>
                        <option value="Normal">Bình thường</option>
                        <option value="High">Khẩn cấp</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tiêu đề</label>
                    <input 
                      type="text" 
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                      placeholder="VD: Đề xuất phê duyệt mua sắm Workstation..."
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-indigo-50 font-black text-sm text-slate-900"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chi tiết</label>
                    <div className="border border-slate-200 rounded-[2rem] overflow-hidden bg-white">
                      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-100">
                        <EditorToolbarBtn icon={<Bold size={16} />} onClick={() => execCmd('bold')} />
                        <EditorToolbarBtn icon={<Italic size={16} />} onClick={() => execCmd('italic')} />
                        <EditorToolbarBtn icon={<Underline size={16} />} onClick={() => execCmd('underline')} />
                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                        <EditorToolbarBtn icon={<AlignLeft size={16} />} onClick={() => execCmd('justifyLeft')} />
                        <EditorToolbarBtn icon={<AlignCenter size={16} />} onClick={() => execCmd('justifyCenter')} />
                        <EditorToolbarBtn icon={<AlignRight size={16} />} onClick={() => execCmd('justifyRight')} />
                      </div>
                      <div 
                        ref={editorRef}
                        contentEditable
                        className="w-full min-h-[300px] p-8 outline-none text-sm text-slate-700 leading-relaxed font-medium"
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 space-y-6 flex flex-col h-full shadow-inner">
                    <div className="flex items-center gap-3 mb-2">
                      <UserCheck size={20} className="text-indigo-600" />
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Tuyến phê duyệt</h4>
                    </div>

                    <div className="space-y-4">
                      <div className="flex p-1 bg-white border border-slate-200 rounded-2xl">
                        {(['APPROVER', 'CONSENT', 'NOTIFY'] as const).map(role => (
                          <button 
                            key={role}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                              selectedRole === role ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {role === 'APPROVER' ? 'Phê duyệt' : role === 'CONSENT' ? 'Đồng thuận' : 'Thông báo'}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="text" 
                          value={userSearch}
                          onChange={(e) => { setUserSearch(e.target.value); setShowUserSuggestions(true); }}
                          placeholder="Thêm người xử lý..." 
                          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-xs"
                        />
                        {showUserSuggestions && filteredUserSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-[60] overflow-hidden">
                            {filteredUserSuggestions.map(u => (
                              <button key={u.id} type="button" onClick={() => addStepToLine(u)} className="w-full p-4 text-left hover:bg-indigo-50 flex items-center gap-4 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">{u.name.charAt(0)}</div>
                                <div><p className="text-xs font-black text-slate-900">{u.name}</p><p className="text-[10px] font-bold text-slate-400">{u.email}</p></div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                      {approvalLine.map((step, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm relative group animate-fadeIn">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">{idx + 1}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate">{step.name}</p>
                              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border bg-slate-50 text-slate-400">{step.role}</span>
                            </div>
                          </div>
                          <button onClick={() => setApprovalLine(approvalLine.filter(s => s.email !== step.email))} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
                  <Paperclip size={18} className="text-indigo-600" /> Đính kèm tệp
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-3 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600">Hủy</button>
                <button onClick={handleCreateRequest} disabled={isSubmitting} className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-200 active:scale-95 disabled:opacity-50 transition-all">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Gửi yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditorToolbarBtn = ({ icon, onClick }: any) => (
  <button type="button" onClick={onClick} className="p-2 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-xl transition-all">{icon}</button>
);

const TabButton = ({ active, onClick, label, count }: any) => (
  <button onClick={onClick} className={`px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
    <div className="flex items-center gap-2">{label}{count && <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${active ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>{count}</span>}</div>
    {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
  </button>
);

export default ApprovalList;
