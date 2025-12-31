
import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Shield, 
  FileText, 
  Users, 
  Settings, 
  Database, 
  PieChart, 
  Bell, 
  Search, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Layers,
  Archive,
  Cloud,
  Globe,
  LayoutDashboard,
  ShieldAlert,
  UserCircle,
  ClipboardList,
  Languages
} from 'lucide-react';
import { LanguageProvider, useLanguage } from './LanguageContext';
import UserDashboard from './views/UserDashboard';
import AdminDashboard from './views/AdminDashboard';
import MailInbox from './views/MailInbox';
import ApprovalList from './views/ApprovalList';
import RequestDetail from './views/RequestDetail';
import SystemMonitor from './views/SystemMonitor';
import UserManagement from './views/UserManagement';
import SecurityPolicy from './views/SecurityPolicy';
import Login from './views/Login';

type ViewMode = 'USER' | 'ADMIN';
type Page = 'DASHBOARD' | 'INBOX' | 'APPROVALS' | 'REQUESTS' | 'USERS' | 'POLICIES' | 'SYSTEM' | 'ARCHIVE';

const AppContent: React.FC = () => {
  const { t, locale, setLocale } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('USER');
  const [activePage, setActivePage] = useState<Page>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    setActivePage('DASHBOARD');
    setSelectedRequestId(null);
  }, [viewMode]);

  const navigate = (page: Page, id?: string) => {
    setActivePage(page);
    if (id) setSelectedRequestId(id);
    else setSelectedRequestId(null);
  };

  if (!user) {
    return <Login onLogin={(u) => {
      setUser(u);
      setViewMode(u.role === 'ADMIN' ? 'ADMIN' : 'USER');
    }} />;
  }

  const renderContent = () => {
    if (selectedRequestId && activePage === 'REQUESTS') {
      return <RequestDetail id={selectedRequestId} onBack={() => navigate('APPROVALS')} />;
    }

    switch (activePage) {
      case 'DASHBOARD':
        return viewMode === 'USER' ? <UserDashboard onNavigate={navigate} /> : <AdminDashboard onNavigate={navigate} />;
      case 'INBOX':
        return <MailInbox />;
      case 'APPROVALS':
        return <ApprovalList onViewRequest={(id) => navigate('REQUESTS', id)} />;
      case 'SYSTEM':
        return <SystemMonitor />;
      case 'USERS':
        return <UserManagement />;
      case 'POLICIES':
        return <SecurityPolicy />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Trang "{activePage}" đang được triển khai.</p>
          </div>
        );
    }
  };

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className={`flex h-screen overflow-hidden ${viewMode === 'ADMIN' ? 'bg-slate-100/50' : 'bg-slate-50'}`}>
      <aside className={`transition-all duration-300 flex flex-col z-20 shadow-xl ${
        viewMode === 'ADMIN' ? 'bg-slate-950 text-slate-300' : 'bg-slate-900 text-slate-300'
      } ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        
        <div className={`p-4 flex items-center justify-between border-b ${viewMode === 'ADMIN' ? 'border-slate-800' : 'border-slate-800/50'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2 font-bold text-white text-lg">
              <div className={`${viewMode === 'ADMIN' ? 'bg-rose-600 shadow-rose-600/20' : 'bg-indigo-600 shadow-indigo-600/20'} p-1.5 rounded-lg shadow-lg`}>
                <Layers size={20} />
              </div>
              <span className="tracking-tight italic">ENT-PORTAL</span>
            </div>
          ) : (
            <div className={`${viewMode === 'ADMIN' ? 'bg-rose-600' : 'bg-indigo-600'} p-1.5 rounded-lg mx-auto`}>
              <Layers size={20} className="text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
          {viewMode === 'USER' ? (
            <>
              <div className={`mb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>
                Workplace
              </div>
              <NavItem icon={<LayoutDashboard size={20} />} label={t('dashboard')} active={activePage === 'DASHBOARD'} collapsed={!sidebarOpen} onClick={() => navigate('DASHBOARD')} />
              <NavItem icon={<Mail size={20} />} label={t('internalMail')} active={activePage === 'INBOX'} collapsed={!sidebarOpen} onClick={() => navigate('INBOX')} badge="12" />
              <NavItem icon={<ClipboardList size={20} />} label={t('myApprovals')} active={activePage === 'APPROVALS' || activePage === 'REQUESTS'} collapsed={!sidebarOpen} onClick={() => navigate('APPROVALS')} badge="3" />
              <NavItem icon={<Cloud size={20} />} label={t('filePortal')} active={activePage === 'ARCHIVE'} collapsed={!sidebarOpen} onClick={() => navigate('ARCHIVE')} />
            </>
          ) : (
            <>
              <div className={`mb-2 px-4 text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>
                Control Center
              </div>
              <NavItem icon={<PieChart size={20} />} label="Báo cáo Tổng quan" active={activePage === 'DASHBOARD'} collapsed={!sidebarOpen} onClick={() => navigate('DASHBOARD')} colorClass="text-rose-400" activeClass="bg-rose-600" />
              <NavItem icon={<Users size={20} />} label={t('directory')} active={activePage === 'USERS'} collapsed={!sidebarOpen} onClick={() => navigate('USERS')} colorClass="text-rose-400" activeClass="bg-rose-600" />
              <NavItem icon={<Database size={20} />} label={t('infrastructure')} active={activePage === 'SYSTEM'} collapsed={!sidebarOpen} onClick={() => navigate('SYSTEM')} colorClass="text-rose-400" activeClass="bg-rose-600" />
              <NavItem icon={<Shield size={20} />} label={t('security')} active={activePage === 'POLICIES'} collapsed={!sidebarOpen} onClick={() => navigate('POLICIES')} colorClass="text-rose-400" activeClass="bg-rose-600" />
            </>
          )}
        </nav>

        <div className={`p-4 border-t ${viewMode === 'ADMIN' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-800'} space-y-2`}>
          {isAdmin && (
            <button 
              onClick={() => setViewMode(viewMode === 'USER' ? 'ADMIN' : 'USER')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
                viewMode === 'ADMIN' 
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' 
                  : 'bg-indigo-600/10 border-indigo-600/20 text-indigo-400 hover:bg-indigo-600/20'
              } text-[10px] font-bold uppercase tracking-widest ${!sidebarOpen && 'justify-center'}`}
            >
              {viewMode === 'USER' ? <ShieldAlert size={18} /> : <UserCircle size={18} />}
              {sidebarOpen && (viewMode === 'USER' ? "Vào Quản trị" : "Về Workplace")}
            </button>
          )}
          <button onClick={() => setUser(null)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all bg-transparent hover:bg-rose-950/30 text-slate-500 hover:text-rose-400 text-[10px] font-bold uppercase tracking-widest ${!sidebarOpen && 'justify-center'}`}>
            <LogOut size={18} />
            {sidebarOpen && "Đăng xuất"}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {viewMode === 'ADMIN' && <div className="h-1 bg-rose-600 w-full shrink-0"></div>}

        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              {sidebarOpen ? <Menu size={20} /> : <ChevronRight size={20} />}
            </button>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
              viewMode === 'ADMIN' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
            }`}>
              {viewMode === 'ADMIN' ? "Admin Mode" : "User Mode"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-xl w-48 lg:w-64 focus-within:ring-2 focus-within:ring-indigo-100 transition-all border border-slate-200/50">
              <Search size={16} />
              <input type="text" placeholder={t('search')} className="bg-transparent border-none outline-none w-full font-medium" />
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200">
              <button onClick={() => setLocale('vi')} className={`px-2 py-1 text-[9px] font-bold rounded transition-all ${locale === 'vi' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>VI</button>
              <button onClick={() => setLocale('en')} className={`px-2 py-1 text-[9px] font-bold rounded transition-all ${locale === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>EN</button>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${viewMode === 'ADMIN' ? 'text-rose-600' : 'text-slate-400'}`}>
                  {user.role}
                </div>
              </div>
              <img src={`https://picsum.photos/seed/${user.name}/40/40`} alt="Profile" className={`w-10 h-10 rounded-xl border-2 shadow-sm ${viewMode === 'ADMIN' ? 'border-rose-200 ring-2 ring-rose-50' : 'border-white ring-2 ring-indigo-50'}`} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  badge?: string;
  colorClass?: string;
  activeClass?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, collapsed, onClick, badge, colorClass = "text-slate-400", activeClass = "bg-indigo-600" }) => (
  <button onClick={onClick} className={`w-full flex items-center p-3.5 rounded-xl transition-all relative group ${active ? `${activeClass} text-white shadow-lg` : `${colorClass} hover:text-white hover:bg-white/10`}`}>
    <div className={`${collapsed ? 'mx-auto' : 'mr-3'} transition-transform group-hover:scale-110`}>{icon}</div>
    {!collapsed && <span className="text-sm font-semibold">{label}</span>}
    {badge && !collapsed && (
      <span className={`ml-auto px-2 py-0.5 rounded-lg text-[10px] font-bold ${active ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>{badge}</span>
    )}
  </button>
);

export default App;
