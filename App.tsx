
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, Shield, FileText, Users, Settings, Database, PieChart, Bell, Search, LogOut,
  ChevronRight, Menu, X, Layers, Archive, Cloud, Globe, LayoutDashboard,
  ShieldAlert, UserCircle, ClipboardList, Languages, LockKeyhole, HardDrive, AlertTriangle, Check
} from 'lucide-react';
import { LanguageProvider, useLanguage } from './LanguageContext.tsx';
import UserDashboard from './views/UserDashboard.tsx';
import AdminDashboard from './views/AdminDashboard.tsx';
import MailInbox from './views/MailInbox.tsx';
import ApprovalList from './views/ApprovalList.tsx';
import RequestDetail from './views/RequestDetail.tsx';
import SystemMonitor from './views/SystemMonitor.tsx';
import UserManagement from './views/UserManagement.tsx';
import RolesPermissions from './views/RolesPermissions.tsx';
import SecurityPolicy from './views/SecurityPolicy.tsx';
import UserProfile from './views/UserProfile.tsx';
import FilePortal from './views/FilePortal.tsx';
import Login from './views/Login.tsx';

const DB_FILE_NAME = 'hdh_master_db.json';

// Cấu trúc DB mới: Tách biệt dữ liệu từng user
const DEFAULT_SYSTEM_DATA = {
  users: [
    { id: 1, name: 'Admin System', username: 'admin.hdh', email: 'admin@hdh.com.vn', dept: 'IT Systems', role: 'ADMIN', status: 'Active', password: 'admin123', avatar: '' },
    { id: 2, name: 'Nguyễn Văn Phong', username: 'phong.hdh', email: 'phong.hdh@hdh.com.vn', dept: 'IT Systems', role: 'USER', status: 'Active', password: '123', avatar: '' }
  ],
  // Phân vùng dữ liệu riêng cho từng user
  user_storages: {
    'admin.hdh': { mails: { INBOX: [], SENT: [], DRAFTS: [] }, files: [] },
    'phong.hdh': { mails: { INBOX: [], SENT: [], DRAFTS: [] }, files: [] }
  },
  global_requests: [],
  policies: {
    minPasswordLength: 8,
    requireComplexity: true,
    maxFileSize: 35,
    enforceNextcloud: true,
    autoLogout: 30
  }
};

type Page = 'DASHBOARD' | 'INBOX' | 'APPROVALS' | 'REQUESTS' | 'USERS' | 'ROLES' | 'POLICIES' | 'SYSTEM' | 'ARCHIVE' | 'PROFILE';

const AppContent: React.FC = () => {
  const { t, locale, setLocale } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [activePage, setActivePage] = useState<Page>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'USER' | 'ADMIN'>('USER');

  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isDiskConnected, setIsDiskConnected] = useState(false);

  const syncToDisk = useCallback(async (data: any) => {
    if (!dirHandle) return;
    try {
      const fileHandle = await dirHandle.getFileHandle(DB_FILE_NAME, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
      console.log('✅ Master DB đã được cập nhật trên ổ cứng');
    } catch (err) {
      console.error('❌ Lỗi ghi file vật lý:', err);
    }
  }, [dirHandle]);

  const connectToPhysicalDisk = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker();
      setDirHandle(handle);
      setIsDiskConnected(true);
      
      try {
        const fileHandle = await handle.getFileHandle(DB_FILE_NAME);
        const file = await fileHandle.getFile();
        const diskData = JSON.parse(await file.text());
        
        // Cập nhật Cache LocalStorage từ Disk
        localStorage.setItem('hdh_master_db_cache', JSON.stringify(diskData));
        console.log('📂 Đã nạp Master DB từ ổ cứng vật lý');
      } catch (e) {
        await syncToDisk(DEFAULT_SYSTEM_DATA);
        localStorage.setItem('hdh_master_db_cache', JSON.stringify(DEFAULT_SYSTEM_DATA));
      }
    } catch (err) {
      console.error('Kết nối ổ cứng thất bại');
    }
  };

  useEffect(() => {
    if (!isDiskConnected) return;
    const handleGlobalUpdate = () => {
      const cache = localStorage.getItem('hdh_master_db_cache');
      if (cache) syncToDisk(JSON.parse(cache));
    };
    window.addEventListener('storage_sync', handleGlobalUpdate);
    return () => window.removeEventListener('storage_sync', handleGlobalUpdate);
  }, [isDiskConnected, syncToDisk]);

  useEffect(() => {
    const savedSession = localStorage.getItem('hdh_current_session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      setUser(parsed);
      setViewMode(parsed.role === 'ADMIN' ? 'ADMIN' : 'USER');
    }
  }, []);

  const navigate = (page: Page, id?: string) => {
    setActivePage(page);
    if (id) setSelectedRequestId(id);
    else setSelectedRequestId(null);
  };

  if (!user) {
    return <Login onLogin={(u, r) => {
      setUser(u);
      setViewMode(u.role === 'ADMIN' ? 'ADMIN' : 'USER');
      if (r) localStorage.setItem('hdh_current_session', JSON.stringify(u));
    }} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${viewMode === 'ADMIN' ? 'bg-slate-100/50' : 'bg-slate-50'}`}>
      <aside className={`transition-all duration-300 flex flex-col z-20 shadow-2xl ${
        viewMode === 'ADMIN' ? 'bg-slate-950 text-slate-300' : 'bg-slate-900 text-slate-300'
      } ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 font-bold text-white text-lg overflow-hidden">
            <div className={`${viewMode === 'ADMIN' ? 'bg-rose-600' : 'bg-indigo-600'} p-1.5 rounded-lg shadow-lg shrink-0`}>
              <Layers size={20} />
            </div>
            {sidebarOpen && <span className="tracking-tighter text-2xl font-black italic uppercase">hdh</span>}
          </div>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
          {viewMode === 'USER' ? (
            <>
              <NavItem icon={<LayoutDashboard size={20} />} label={t('dashboard')} active={activePage === 'DASHBOARD'} collapsed={!sidebarOpen} onClick={() => navigate('DASHBOARD')} />
              <NavItem icon={<Mail size={20} />} label={t('internalMail')} active={activePage === 'INBOX'} collapsed={!sidebarOpen} onClick={() => navigate('INBOX')} />
              <NavItem icon={<ClipboardList size={20} />} label={t('myApprovals')} active={activePage === 'APPROVALS' || activePage === 'REQUESTS'} collapsed={!sidebarOpen} onClick={() => navigate('APPROVALS')} />
              <NavItem icon={<Cloud size={20} />} label={t('filePortal')} active={activePage === 'ARCHIVE'} collapsed={!sidebarOpen} onClick={() => navigate('ARCHIVE')} />
              <NavItem icon={<UserCircle size={20} />} label="Cá nhân" active={activePage === 'PROFILE'} collapsed={!sidebarOpen} onClick={() => navigate('PROFILE')} />
            </>
          ) : (
            <>
              <NavItem icon={<PieChart size={20} />} label="Tổng quan" active={activePage === 'DASHBOARD'} collapsed={!sidebarOpen} onClick={() => navigate('DASHBOARD')} colorClass="text-rose-400" activeClass="bg-rose-600" />
              <NavItem icon={<Users size={20} />} label={t('directory')} active={activePage === 'USERS'} collapsed={!sidebarOpen} onClick={() => navigate('USERS')} colorClass="text-rose-400" activeClass="bg-rose-600" />
              <NavItem icon={<Database size={20} />} label="Hệ thống" active={activePage === 'SYSTEM'} collapsed={!sidebarOpen} onClick={() => navigate('SYSTEM')} colorClass="text-rose-400" activeClass="bg-rose-600" />
              <NavItem icon={<Shield size={20} />} label="Bảo mật" active={activePage === 'POLICIES'} collapsed={!sidebarOpen} onClick={() => navigate('POLICIES')} colorClass="text-rose-400" activeClass="bg-rose-600" />
            </>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
           <button onClick={() => { setUser(null); localStorage.removeItem('hdh_current_session'); }} className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-slate-500 hover:text-rose-400 text-[10px] font-bold uppercase tracking-widest">
            <LogOut size={18} /> {sidebarOpen && "Đăng xuất"}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-500 transition-all border border-transparent hover:border-slate-200">
              <Menu size={22} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 italic mb-1">On-Premise Infrastructure</h1>
              {!isDiskConnected ? (
                <button onClick={connectToPhysicalDisk} className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest animate-pulse">
                  <AlertTriangle size={14} /> Chưa kết nối ổ cứng vật lý
                </button>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                  <HardDrive size={14} /> Database: hdh_master_db.json (Live)
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('PROFILE')}>
              <div className="text-right hidden md:block">
                <div className="text-sm font-black text-slate-900 leading-tight uppercase italic">{user.name}</div>
                <div className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${viewMode === 'ADMIN' ? 'text-rose-600' : 'text-slate-400'}`}>
                  {user.role} Access
                </div>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl overflow-hidden border-2 border-white ${viewMode === 'ADMIN' ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/50">
          {activePage === 'INBOX' ? (
            <MailInbox currentUser={user} />
          ) : activePage === 'SYSTEM' ? (
            <SystemMonitor isDiskConnected={isDiskConnected} onConnect={connectToPhysicalDisk} />
          ) : activePage === 'DASHBOARD' ? (
            viewMode === 'USER' ? <UserDashboard currentUser={user} onNavigate={navigate} /> : <AdminDashboard onNavigate={navigate} />
          ) : activePage === 'USERS' ? (
            <UserManagement />
          ) : activePage === 'PROFILE' ? (
            <UserProfile user={user} />
          ) : activePage === 'ARCHIVE' ? (
            <FilePortal />
          ) : activePage === 'APPROVALS' ? (
            <ApprovalList currentUser={user} onViewRequest={(id) => navigate('REQUESTS', id)} />
          ) : activePage === 'REQUESTS' && selectedRequestId ? (
            <RequestDetail id={selectedRequestId} currentUser={user} onBack={() => navigate('APPROVALS')} />
          ) : null}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, collapsed, onClick, colorClass = "text-slate-400", activeClass = "bg-indigo-600" }: any) => (
  <button onClick={onClick} className={`w-full flex items-center p-4 rounded-2xl transition-all relative group mb-1 ${active ? `${activeClass} text-white shadow-xl font-bold` : `${colorClass} hover:text-white hover:bg-white/10`}`}>
    <div className={`${collapsed ? 'mx-auto' : 'mr-4'} transition-transform group-hover:scale-110`}>{icon}</div>
    {!collapsed && <span className="text-xs font-black uppercase tracking-widest">{label}</span>}
    {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
  </button>
);

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;
