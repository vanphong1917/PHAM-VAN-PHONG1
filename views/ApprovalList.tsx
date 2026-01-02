
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
  const searchContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowUserSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    const q = userSearch.toLowerCase();
    const baseList = (db.users || []).filter((u: any) => u.email !== currentUser.email);
    if (!q) return baseList.slice(0, 5);
    return baseList.filter((u: any) => 
      (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [userSearch, db.users, currentUser.email]);

  const filteredTasks = useMemo(() => {
    let list = db.global_requests || [];
    if (filter === 'WAITING') {
      list = list.filter((req: any) => {
        if (req.status !== RequestStatus.PENDING) return false;
        const nextStep = req.approvalLine?.find((s: any) => s.status !== 'completed' && s.status !== 'rejected');
        return nextStep && nextStep.email === currentUser.email;
      });
    } else if (filter === 'WATCHING') {
      list = list.filter((req: any) => {
        const isOwner = req.requesterEmail === currentUser.email;
        const isInLine = req.approvalLine?.some((s: any) => s.email === currentUser.email);
        return (isOwner || isInLine) && (req.status === RequestStatus.PENDING || req.status === RequestStatus.MORE_INFO);
      });
    } else if (filter === 'HISTORY') {
      list = list.filter((req: any) => {
        const isFinished = req.status === RequestStatus.APPROVED || req.status === RequestStatus.REJECTED;
        const isRelated = req.requesterEmail === currentUser.email || req.approvalLine?.some((s: any) => s.email === currentUser.email);
        return isFinished && isRelated;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t: any) => 
        t.title.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || (t.requester || '').toLowerCase().includes(q)
      );
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
    if (approvalLine.some(s => s.email === user.email)) {
      alert("Người này đã có trong danh sách phê duyệt.");
      setShowUserSuggestions(false);
      return;
    }
    const newStep: ApprovalStep = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: selectedRole,
      status: 'pending'
    };
    setApprovalLine(prev => [...prev, newStep]);
    setUserSearch('');
    setShowUserSuggestions(false);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (approvalLine.length === 0) {
      alert("Vui lòng thiết lập ít nhất 1 người phê duyệt.");
      return;
    }
    if (!newRequest.title.trim()) {
      alert("Vui lòng nhập tiêu đề yêu cầu.");
      return;
    }
    setIsSubmitting(true);
    const requestId = 'req-' + Date.now().toString();
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
      alert("Yêu cầu phê duyệt đã được khởi tạo thành công!");
    }, 1000);
  };

  const resetForm = () => {
    setNewRequest({ title: '', type: 'Nghỉ phép', priority: 'Normal' });
    setAttachments([]);
    setApprovalLine([]);
    setUserSearch('');
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  return (
    <div className="space-y-4 lg:space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3 italic">
            <ClipboardCheck className="text-indigo-600" size={24} lg:size={28} /> {t('myApprovals')}
          </h2>
          <p className="text-slate-500 text-[10px] lg:text-sm font-medium">Hệ thống luồng phê duyệt tập trung (Bare-metal Security Workflow).</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
        >
          <Plus size={20} /> Tạo yêu cầu mới
        </button>
      </div>

      <div className="flex gap-2 lg:gap-4 border-b border-slate-200 overflow-x-auto scrollbar-hide py-1">
        <TabButton active={filter === 'WAITING'} onClick={() => setFilter('WAITING')} label={t('waitingMe')} count={filter === 'WAITING' ? filteredTasks.length.toString() : undefined} />
        <TabButton active={filter === 'WATCHING'} onClick={() => setFilter('WATCHING')} label={t('watching')} count={filter === 'WATCHING' ? filteredTasks.length.toString() : undefined} />
        <TabButton active={filter === 'HISTORY'} onClick={() => setFilter('HISTORY')} label={t('completed')} />
      </div>

      <div className="bg-white rounded-[1.5rem] lg:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <div className="relative w-full md:flex-1 md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm mã, tiêu đề, người gửi..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-50 outline-none transition-all" 
            />
          </div>
          <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Filter size={14} /> Bộ lọc nâng cao
          </div>
        </div>

        <div className="flex-1 divide-y divide-slate-100 overflow-x-auto">
          {filteredTasks.length > 0 ? filteredTasks.map((task: any) => (
            <div 
              key={task.id} 
              className="p-4 lg:p-6 hover:bg-indigo-50/40 cursor-pointer transition-all group flex items-start gap-4 lg:gap-6 relative border-l-4 border-transparent hover:border-indigo-600 min-w-[600px] md:min-w-0"
              onClick={() => onViewRequest(task.id)}
            >
              <div className="p-3 lg:p-4 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100 shrink-0 transition-all group-hover:scale-110">
                <ClipboardCheck size={24} lg:size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 lg:gap-3 mb-1.5 lg:mb-2">
                  <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-100 px-2 py-0.5 rounded-md">{task.code}</span>
                  <StatusPill status={task.status} />
                  {task.priority === 'High' && <span className="text-[7px] lg:text-[8px] font-black bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded uppercase animate-pulse">Khẩn cấp</span>}
                </div>
                <h3 className="text-sm lg:text-lg font-black text-slate-900 mb-1 lg:mb-2 truncate group-hover:text-indigo-600 transition-colors italic">{task.title}</h3>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 lg:gap-x-8">
                  <div className="flex items-center gap-2 text-[10px] lg:text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                    <User size={12} className="text-slate-400" />
                    {task.requester} <span className="text-slate-300 mx-1">/</span> {task.dept}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <Clock size={12} lg:size={14} className="text-indigo-400" />
                    {new Date(task.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 self-center shrink-0">
                <div className="text-right hidden sm:block">
                   <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Hạn SLA</p>
                   <p className="text-xs font-bold text-slate-900">{task.deadline || '48h'}</p>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={20} lg:size={24} />
              </div>
            </div>
          )) : (
            <div className="h-full flex flex-col items-center justify-center py-20 lg:py-32 text-slate-300 space-y-4">
              <div className="p-6 lg:p-8 bg-slate-50 rounded-[2.5rem] lg:rounded-[3rem] border border-slate-100 opacity-40">
                <ClipboardCheck size={48} lg:size={64} />
              </div>
              <p className="font-black text-[10px] lg:text-xs uppercase tracking-[0.4em] italic opacity-40">Danh sách trống</p>
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 lg:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-5xl h-full lg:h-auto lg:rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp lg:max-h-[95vh]">
            <div className="px-6 lg:px-10 py-4 lg:py-8 bg-indigo-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 lg:gap-5">
                <div className="p-2 lg:p-3 bg-white/20 rounded-2xl shadow-inner shrink-0"><Layers size={22} lg:size={28} /></div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm lg:text-xl uppercase tracking-widest italic truncate">Khởi tạo yêu cầu phê duyệt</h3>
                  <p className="text-indigo-100 text-[8px] lg:text-[10px] font-bold uppercase tracking-widest mt-0.5 hidden sm:block">Bare-metal Secure Workflow Node-01</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 lg:p-2 hover:bg-white/20 rounded-2xl transition-all"><X size={28} lg:size={32} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-6 lg:space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
                <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Phân loại</label>
                      <select 
                        value={newRequest.type}
                        onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                        className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-black text-sm text-slate-900"
                      >
                        <option>Nghỉ phép</option>
                        <option>Công tác</option>
                        <option>Đề xuất thiết bị</option>
                        <option>Bàn giao công việc</option>
                        <option>Thanh toán chi phí</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Độ ưu tiên</label>
                      <select 
                        value={newRequest.priority}
                        onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                        className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-black text-sm text-slate-900"
                      >
                        <option value="Low">Thấp</option>
                        <option value="Normal">Bình thường</option>
                        <option value="High">Khẩn cấp (SLA 4h)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Tiêu đề yêu cầu</label>
                    <input 
                      type="text" 
                      required
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                      placeholder="VD: Đề xuất phê duyệt mua sắm máy trạm..."
                      className="w-full px-5 lg:px-6 py-4 lg:py-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-black text-sm text-slate-900 shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Nội dung chi tiết</label>
                    <div className="border border-slate-200 rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden bg-white shadow-sm flex flex-col">
                      <div className="flex flex-wrap items-center gap-1 p-2 lg:p-3 bg-slate-50 border-b border-slate-100 shrink-0">
                        <EditorToolbarBtn icon={<Bold size={16} />} onClick={() => execCmd('bold')} />
                        <EditorToolbarBtn icon={<Italic size={16} />} onClick={() => execCmd('italic')} />
                        <EditorToolbarBtn icon={<Underline size={16} />} onClick={() => execCmd('underline')} />
                        <div className="w-px h-6 bg-slate-300 mx-1 lg:mx-2"></div>
                        <EditorToolbarBtn icon={<AlignLeft size={16} />} onClick={() => execCmd('justifyLeft')} />
                        <EditorToolbarBtn icon={<AlignCenter size={16} />} onClick={() => execCmd('justifyCenter')} />
                        <EditorToolbarBtn icon={<AlignRight size={16} />} onClick={() => execCmd('justifyRight')} />
                      </div>
                      <div 
                        ref={editorRef}
                        contentEditable
                        className="w-full min-h-[200px] lg:min-h-[350px] p-6 lg:p-10 outline-none text-sm text-slate-700 leading-relaxed font-medium bg-white overflow-y-auto"
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 lg:space-y-8">
                  <div className="bg-slate-50 rounded-[2rem] lg:rounded-[3rem] border border-slate-100 p-6 lg:p-8 space-y-5 lg:space-y-6 flex flex-col min-h-[300px] lg:h-full shadow-inner relative overflow-visible">
                    <div className="flex items-center gap-3 relative z-10">
                      <UserCheck size={20} lg:size={22} className="text-indigo-600 shrink-0" />
                      <h4 className="text-[10px] lg:text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] italic">Quy trình phê duyệt</h4>
                    </div>

                    <div className="space-y-4 lg:space-y-5 relative z-20" ref={searchContainerRef}>
                      <div className="flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        {(['APPROVER', 'CONSENT', 'NOTIFY'] as const).map(role => (
                          <button 
                            key={role}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className={`flex-1 py-2 lg:py-2.5 text-[8px] lg:text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${
                              selectedRole === role ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {role === 'APPROVER' ? 'Duyệt' : role === 'CONSENT' ? 'C.Ý' : 'Báo'}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} lg:size={18} />
                        <input 
                          type="text" 
                          value={userSearch}
                          onFocus={() => { if(db.users?.length > 0) setShowUserSuggestions(true); }}
                          onChange={(e) => { setUserSearch(e.target.value); setShowUserSuggestions(true); }}
                          placeholder="Tìm người xử lý..." 
                          className="w-full pl-11 lg:pl-12 pr-4 py-3 lg:py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-[11px] lg:text-xs"
                        />
                        {showUserSuggestions && filteredUserSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl z-[70] overflow-hidden max-h-[250px] overflow-y-auto">
                            {filteredUserSuggestions.map(u => (
                              <button 
                                key={u.id} 
                                type="button" 
                                onMouseDown={(e) => { e.preventDefault(); addStepToLine(u); }} 
                                className="w-full p-3 lg:p-4 text-left hover:bg-indigo-50 flex items-center gap-3 lg:gap-4 transition-all border-b border-slate-50 last:border-none"
                              >
                                <div className="w-8 h-8 lg:w-10 lg:h-10 shrink-0 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs lg:text-sm italic">{u.name.charAt(0)}</div>
                                <div className="min-w-0">
                                  <p className="text-[11px] lg:text-xs font-black text-slate-900 truncate">{u.name}</p>
                                  <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{u.email}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 lg:space-y-4 overflow-y-auto pr-2 relative z-10 min-h-[100px]">
                      {approvalLine.map((step, idx) => (
                        <div key={idx} className="bg-white p-3 lg:p-5 rounded-xl lg:rounded-2xl border border-slate-200 shadow-sm relative group animate-scaleUp">
                          <div className="flex items-center gap-3 lg:gap-4">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs lg:text-sm shadow-md italic">{idx + 1}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] lg:text-xs font-black text-slate-900 truncate">{step.name}</p>
                              <div className="flex items-center gap-2 mt-0.5 lg:mt-1">
                                <span className={`text-[7px] lg:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                                  step.role === 'APPROVER' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                  step.role === 'CONSENT' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  'bg-slate-50 text-slate-400 border-slate-100'
                                }`}>{step.role}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => setApprovalLine(prev => prev.filter(s => s.email !== step.email))} className="absolute top-1.5 right-1.5 p-1 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                        </div>
                      ))}
                      {approvalLine.length === 0 && (
                        <div className="py-8 lg:py-12 text-center opacity-30 italic flex flex-col items-center gap-2 lg:gap-3">
                          <UserCheck size={32} lg:size={48} />
                          <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em]">Trống</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 lg:px-10 py-4 lg:py-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 lg:gap-6 shrink-0">
              <div className="flex w-full sm:w-auto items-center gap-4 lg:gap-6">
                <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 lg:px-8 py-2.5 lg:py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm italic">
                  <Paperclip size={18} lg:size={20} className="text-indigo-600" /> Đính kèm ({attachments.length})
                </button>
              </div>
              <div className="flex w-full sm:w-auto items-center gap-4 lg:gap-5">
                <button onClick={() => setIsCreateModalOpen(false)} className="hidden sm:block px-6 py-3.5 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-800 transition-colors">Hủy</button>
                <button onClick={handleCreateRequest} disabled={isSubmitting} className="flex-1 sm:flex-none flex items-center justify-center gap-3 lg:gap-4 px-8 lg:px-12 py-3 lg:py-4 bg-indigo-600 text-white rounded-[1.5rem] lg:rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all">
                  {isSubmitting ? <Loader2 size={18} lg:size={20} className="animate-spin" /> : <Send size={18} lg:size={20} />} Khởi tạo
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
  <button type="button" onClick={onClick} className="p-2 lg:p-2.5 text-slate-500 hover:bg-white hover:text-indigo-600 rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100 shrink-0">{icon}</button>
);

const TabButton = ({ active, onClick, label, count }: any) => (
  <button onClick={onClick} className={`px-4 lg:px-8 py-3 lg:py-5 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em] lg:tracking-[0.2em] transition-all relative shrink-0 ${active ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
    <div className="flex items-center gap-2 italic">{label}{count !== undefined && <span className={`px-1.5 lg:px-2.5 py-0.5 rounded-lg text-[8px] lg:text-[10px] font-black ${active ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-200 text-slate-500'}`}>{count}</span>}</div>
    {active && <div className="absolute bottom-0 left-0 right-0 h-1 lg:h-1.5 bg-indigo-600 rounded-t-full"></div>}
  </button>
);

export default ApprovalList;
