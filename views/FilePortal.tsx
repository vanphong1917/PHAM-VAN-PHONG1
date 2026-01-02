
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Cloud, Folder, File, FileText, FileImage, FileCode, MoreVertical, 
  Share2, Download, Trash2, Search, Upload, ChevronRight, 
  HardDrive, Clock, Star, Users, FolderPlus, Info, 
  X, CheckCircle2, Link as LinkIcon, ExternalLink, Archive, RotateCcw, Eye, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'zip' | 'jpg' | 'png' | 'other' | string;
  size: string;
  modified: string;
  modifiedAt: number;
  owner: string;
  parentId: string | null;
  shared?: boolean;
  starred?: boolean;
  inTrash?: boolean;
  data?: string; // Chứa Base64 thực tế
}

const FilePortal: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ALL' | 'RECENT' | 'STARRED' | 'SHARED' | 'TRASH'>('ALL');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showShareModal, setShowShareModal] = useState<FileItem | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [db, setDb] = useState<any>(() => {
    const cache = localStorage.getItem('hdh_master_db_cache');
    return cache ? JSON.parse(cache) : { user_storages: {} };
  });

  const currentUser = useMemo(() => {
    const session = localStorage.getItem('hdh_current_session');
    return session ? JSON.parse(session) : null;
  }, []);

  const files: FileItem[] = useMemo(() => {
    if (!currentUser || !db.user_storages[currentUser.username]) return [];
    return db.user_storages[currentUser.username].files || [];
  }, [db, currentUser]);

  const saveFilesToDb = (newFiles: FileItem[]) => {
    if (!currentUser) return;
    const newDb = { ...db };
    if (!newDb.user_storages[currentUser.username]) {
      newDb.user_storages[currentUser.username] = { mails: { INBOX: [], SENT: [], DRAFTS: [] }, files: [] };
    }
    newDb.user_storages[currentUser.username].files = newFiles;
    setDb(newDb);
    localStorage.setItem('hdh_master_db_cache', JSON.stringify(newDb));
    window.dispatchEvent(new Event('storage_sync'));
  };

  const currentFiles = useMemo(() => {
    let baseList = files;
    if (activeTab === 'TRASH') {
      baseList = baseList.filter(f => f.inTrash);
    } else {
      baseList = baseList.filter(f => !f.inTrash);
      if (activeTab === 'STARRED') baseList = baseList.filter(f => f.starred);
      else if (activeTab === 'SHARED') baseList = baseList.filter(f => f.shared);
      else if (activeTab === 'RECENT') baseList = [...baseList].sort((a, b) => b.modifiedAt - a.modifiedAt).slice(0, 15);
      else if (activeTab === 'ALL') baseList = baseList.filter(f => f.parentId === currentFolderId);
    }
    if (searchQuery.trim()) {
      baseList = baseList.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeTab !== 'RECENT') return baseList.sort((a, b) => (a.type === 'folder' ? -1 : 1));
    return baseList;
  }, [files, currentFolderId, searchQuery, activeTab]);

  const breadcrumbs = useMemo(() => {
    const list: { id: string | null; name: string }[] = [{ id: null, name: 'Nextcloud Files' }];
    if (activeTab !== 'ALL') {
      list[0].name = activeTab === 'RECENT' ? 'Gần đây' : activeTab === 'STARRED' ? 'Đã đánh dấu' : activeTab === 'SHARED' ? 'Đã chia sẻ' : 'Thùng rác';
      return list;
    }
    if (currentFolderId) {
      const folder = files.find(f => f.id === currentFolderId);
      if (folder) list.push({ id: folder.id, name: folder.name });
    }
    return list;
  }, [currentFolderId, files, activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || !currentUser) return;

    setIsUploading(true);
    const newItems: FileItem[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target?.result as string);
        reader.readAsDataURL(file);
      });

      newItems.push({
        id: 'file-' + Date.now().toString() + i,
        name: file.name,
        type: (file.name.split('.').pop()?.toLowerCase() || 'other'),
        size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
        modified: 'Vừa xong',
        modifiedAt: Date.now(),
        owner: currentUser.name,
        parentId: activeTab === 'ALL' ? currentFolderId : null,
        data: data
      });
    }

    setTimeout(() => {
      saveFilesToDb([...files, ...newItems]);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 800);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim() && currentUser) {
      const newFolder: FileItem = {
        id: 'folder-' + Date.now().toString(),
        name: newFolderName.trim(),
        type: 'folder',
        size: '--',
        modified: 'Vừa xong',
        modifiedAt: Date.now(),
        owner: currentUser.name,
        parentId: activeTab === 'ALL' ? currentFolderId : null
      };
      saveFilesToDb([...files, newFolder]);
      setNewFolderName('');
      setIsCreateFolderOpen(false);
    }
  };

  const handleDownloadFile = (file: FileItem) => {
    if (!file.data) return;
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewFile = (file: FileItem) => {
    if (file.type === 'folder') {
      setCurrentFolderId(file.id);
      return;
    }
    if (!file.data) {
      alert("Tệp tin này không có dữ liệu thực tế.");
      return;
    }

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
      
      // Mở tệp bằng trình xem mặc định (PDF viewer, Image viewer, etc.)
      const newWindow = window.open(fileURL, '_blank');
      if (!newWindow) {
        alert("Vui lòng cho phép trình duyệt mở cửa sổ mới để xem tệp bằng trình đọc mặc định.");
      }
    } catch (e) {
      console.error("Lỗi khi xem tệp:", e);
      handleDownloadFile(file);
    }
  };

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveFilesToDb(files.map(f => f.id === id ? { ...f, starred: !f.starred } : f));
  };

  const moveToTrash = (id: string) => {
    saveFilesToDb(files.map(f => f.id === id ? { ...f, inTrash: true } : f));
  };

  const restoreFromTrash = (id: string) => {
    saveFilesToDb(files.map(f => f.id === id ? { ...f, inTrash: false } : f));
  };

  const deletePermanently = (id: string) => {
    if (confirm("Xóa vĩnh viễn tệp này khỏi Nextcloud Node?")) {
      saveFilesToDb(files.filter(f => f.id !== id));
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder': return <Folder className="text-indigo-500 fill-indigo-500/20" />;
      case 'pdf': return <FileText className="text-rose-500" />;
      case 'xlsx': return <FileCode className="text-emerald-600" />;
      case 'zip': return <Archive className="text-amber-500" />;
      case 'jpg':
      case 'png': return <FileImage className="text-blue-500" />;
      default: return <File className="text-slate-400" />;
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fadeIn max-w-screen-2xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Cloud className="text-indigo-600" size={28} /> {t('filePortal')} (Nextcloud)
          </h2>
          <p className="text-slate-500 text-sm italic">Hệ thống đồng bộ dữ liệu tệp lớn qua bare-metal cluster.</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
          >
            {isUploading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
            Tải lên
          </button>
          <button onClick={() => setIsCreateFolderOpen(true)} className="p-3 bg-white border border-slate-200 text-indigo-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-90" title="Tạo thư mục mới"><FolderPlus size={22} /></button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
        {/* Mobile Navigation Tabs */}
        <aside className="w-full lg:w-56 shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto scrollbar-hide py-1">
          <SidebarBtn icon={<Cloud size={18} />} label="Tất cả" active={activeTab === 'ALL'} onClick={() => { setActiveTab('ALL'); setCurrentFolderId(null); }} />
          <SidebarBtn icon={<Clock size={18} />} label="Gần đây" active={activeTab === 'RECENT'} onClick={() => setActiveTab('RECENT')} />
          <SidebarBtn icon={<Star size={18} />} label="Đánh dấu" active={activeTab === 'STARRED'} onClick={() => setActiveTab('STARRED')} />
          <SidebarBtn icon={<Users size={18} />} label="Chia sẻ" active={activeTab === 'SHARED'} onClick={() => setActiveTab('SHARED')} />
          <SidebarBtn icon={<Trash2 size={18} />} label="Thùng rác" active={activeTab === 'TRASH'} onClick={() => setActiveTab('TRASH')} />

          <div className="mt-auto p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group hidden lg:block">
            <div className="relative z-10">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Storage Quota</h4>
              <div className="flex justify-between text-xs font-bold mb-2"><span>1.2 GB</span><span className="text-slate-500">20 GB</span></div>
              <div className="w-full bg-white/10 h-2 rounded-full mb-4"><div className="bg-indigo-400 h-full rounded-full transition-all duration-1000" style={{ width: '6%' }}></div></div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">NVMe Performance</p>
            </div>
            <HardDrive size={100} className="absolute -bottom-6 -right-6 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
              {breadcrumbs.map((bc, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight size={14} className="text-slate-300" />}
                  <button onClick={() => { if (activeTab !== 'ALL') setActiveTab('ALL'); setCurrentFolderId(bc.id); }} className={`text-xs font-black uppercase tracking-widest transition-colors ${idx === breadcrumbs.length - 1 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900'}`}>{bc.name}</button>
                </React.Fragment>
              ))}
            </nav>
            <div className="relative w-full sm:w-48 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm kiếm tài liệu..." className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] outline-none focus:ring-4 focus:ring-indigo-50 font-bold transition-all" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="min-w-full inline-block align-middle">
               <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="px-8 py-5">Tên tệp tin</th>
                      <th className="px-6 py-5 hidden sm:table-cell">Dung lượng</th>
                      <th className="px-6 py-5 hidden md:table-cell">Sửa đổi cuối</th>
                      <th className="px-6 py-5 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentFiles.map((file) => (
                      <tr key={file.id} className="group hover:bg-indigo-50/30 transition-all cursor-pointer" onClick={() => handleViewFile(file)}>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <button onClick={(e) => toggleStar(file.id, e)} className={`p-1 transition-colors ${file.starred ? 'text-amber-400' : 'text-slate-200 group-hover:text-slate-300'}`}><Star size={14} fill={file.starred ? 'currentColor' : 'none'} /></button>
                            <div className="p-3 bg-slate-100 rounded-2xl transition-all group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg shadow-indigo-100 shrink-0">{getFileIcon(file.type)}</div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900 flex items-center gap-2 truncate">{file.name}{file.shared && <Users size={12} className="text-indigo-400" />}</p>
                              <p className="text-[10px] font-bold text-slate-400 md:hidden uppercase tracking-widest">{file.size} • {file.modified}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell text-[11px] font-black text-slate-500 uppercase">{file.size}</td>
                        <td className="px-6 py-4 hidden md:table-cell text-[11px] font-bold text-slate-400 italic">{file.modified}</td>
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="relative group/actions inline-block">
                            <button className="p-2 text-slate-300 hover:text-indigo-600 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"><MoreVertical size={18} /></button>
                            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl py-3 z-20 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all">
                              {!file.inTrash ? (
                                <>
                                  <button onClick={() => handleViewFile(file)} className="w-full flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"><Eye size={16} /> Xem bằng trình đọc</button>
                                  <button onClick={() => handleDownloadFile(file)} className="w-full flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50"><Download size={16} /> Tải về máy</button>
                                  <button onClick={() => setShowShareModal(file)} className="w-full flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-indigo-50"><Share2 size={16} /> Chia sẻ liên kết</button>
                                  <div className="h-px bg-slate-50 my-2 mx-3"></div>
                                  <button onClick={() => moveToTrash(file.id)} className="w-full flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50"><Trash2 size={16} /> Chuyển vào Thùng rác</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => restoreFromTrash(file.id)} className="w-full flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50"><RotateCcw size={16} /> Khôi phục</button>
                                  <button onClick={() => deletePermanently(file.id)} className="w-full flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50"><Trash2 size={16} /> Xóa vĩnh viễn</button>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {currentFiles.length === 0 && (
              <div className="p-16 sm:p-32 text-center text-slate-300 flex flex-col items-center animate-fadeIn">
                <div className="p-10 bg-slate-50 rounded-[3rem] mb-6"><Folder size={80} className="opacity-10" /></div>
                <p className="font-black text-xs uppercase tracking-[0.3em] italic opacity-40">Khu vực dữ liệu trống</p>
                <p className="text-[10px] mt-2 font-bold text-slate-400 uppercase">Tải lên hoặc tạo thư mục mới trên Nextcloud</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isCreateFolderOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden animate-scaleUp">
            <div className="px-10 py-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-sm italic">New Nextcloud Folder</h3>
              <button onClick={() => setIsCreateFolderOpen(false)} className="p-2 hover:bg-white rounded-2xl transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateFolder} className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên thư mục</label>
                <div className="relative group">
                  <Folder className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
                  <input autoFocus type="text" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Tên thư mục mới..." className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setIsCreateFolderOpen(false)} className="px-6 py-3 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors">Hủy bỏ</button>
                <button type="submit" className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 active:scale-95 transition-all">Tạo thư mục</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarBtn = ({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button onClick={onClick} className={`shrink-0 lg:w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all border ${active ? 'bg-white border-slate-200 text-indigo-600 shadow-sm font-black' : 'border-transparent text-slate-400 hover:bg-white/60 hover:text-slate-900'}`}><span className={active ? 'text-indigo-600 transition-transform' : 'text-slate-300'}>{icon}</span><span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">{label}</span></button>
);

export default FilePortal;
