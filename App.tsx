
import React, { useState } from 'react';
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
  Globe
} from 'lucide-react';
import { LanguageProvider, useLanguage } from './LanguageContext';
import UserDashboard from './views/UserDashboard';
import AdminDashboard from './views/AdminDashboard';
import MailInbox from './views/MailInbox';
import RequestDetail from './views/RequestDetail';
import SystemMonitor from './views/SystemMonitor';
import UserManagement from './views/UserManagement';
import Login from './views/Login';

type ViewMode = 'USER' | 'ADMIN';
type Page = 'DASHBOARD' | 'INBOX' | 'REQUESTS' | 'USERS' | 'POLICIES' | 'SYSTEM' | 'ARCHIVE';

const AppContent: React.FC = () => {
  const { t, locale, setLocale } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('USER');
  const [activePage, setActivePage] = useState<Page>('DASHBOARD');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

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
      return <RequestDetail id={selectedRequestId} onBack={() => navigate('INBOX')} />;
    }

    switch (activePage) {
      case 'DASHBOARD':
        return viewMode === 'USER' ? <UserDashboard /> : <AdminDashboard onNavigate={navigate} />;
      case 'INBOX':
        return <MailInbox onViewRequest={(id) => navigate('REQUESTS', id)} />;
      case 'SYSTEM':
        return <SystemMonitor />;
      case 'USERS':
        return <UserManagement />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p>Trang "{activePage}" đang được triển khai.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 font-bold text-white text-lg">
              <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-600/30">
                <Layers size={20} />
              </div>
              <span className="tracking-tight">ENT-PORTAL</span>
            </div>
          ) : (
            <div className="bg-indigo-600 p-1.5 rounded-lg mx-auto shadow-lg shadow-indigo-600/30">
              <Layers size={20} className="text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
          <NavItem 
            icon={<PieChart size={20} />} 
            label={t('dashboard')} 
            active={activePage === 'DASHBOARD'} 
            collapsed={!sidebarOpen} 
            onClick={() => navigate('DASHBOARD')} 
          />
          <NavItem 
            icon={<Mail size={20} />} 
            label={t('internalMail')} 
            active={activePage === 'INBOX'} 
            collapsed={!sidebarOpen} 
            onClick={() => navigate('INBOX')} 
            badge="12"
          />
          <NavItem 
            icon={<Cloud size={20} />} 
            label={t('filePortal')} 
            active={activePage === 'ARCHIVE'} 
            collapsed={!sidebarOpen} 
            onClick={() => navigate('ARCHIVE')} 
          />

          <div className={`mt-8 mb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest ${!sidebarOpen && 'hidden'}`}>
            {t('management')}
          </div>

          <NavItem 
            icon={<Users size={20} />} 
            label={t('directory')} 
            active={activePage === 'USERS'} 
            collapsed={!sidebarOpen} 
            onClick={() => navigate('USERS')} 
          />
          <NavItem 
            icon={<Database size={20} />} 
            label={t('infrastructure')} 
            active={activePage === 'SYSTEM'} 
            collapsed={!sidebarOpen} 
            onClick={() => navigate('SYSTEM')} 
          />
          <NavItem 
            icon={<Shield size={20} />} 
            label={t('security')} 
            active={activePage === 'POLICIES'} 
            collapsed={!sidebarOpen} 
            onClick={() => navigate('POLICIES')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          {user.role === 'ADMIN' && (
            <button 
              onClick={() => setViewMode(viewMode === 'USER' ? 'ADMIN' : 'USER')}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${viewMode === 'ADMIN' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'} text-xs font-bold uppercase tracking-widest ${!sidebarOpen && 'justify-center'}`}
            >
              {viewMode === 'USER' ? <Settings size={18} /> : <FileText size={18} />}
              {sidebarOpen && (viewMode === 'USER' ? t('adminMode') : t('userMode'))}
            </button>
          )}
          <button 
            onClick={() => setUser(null)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all bg-slate-800/50 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 text-xs font-bold uppercase tracking-widest ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut size={18} />
            {sidebarOpen && "Đăng xuất"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              {sidebarOpen ? <Menu size={20} /> : <ChevronRight size={20} />}
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-4 py-2 rounded-xl w-80 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <Search size={16} />
              <input type="text" placeholder={t('searchPlaceholder')} className="bg-transparent border-none outline-none w-full font-medium" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button 
                onClick={() => setLocale('vi')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${locale === 'vi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                VN
              </button>
              <button 
                onClick={() => setLocale('en')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all ${locale === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                EN
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100 text-[10px] font-bold uppercase tracking-wider">
              <Archive size={14} />
              <span>{t('autoArchiving')}</span>
            </div>
            <button className="relative p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{viewMode === 'USER' ? t('userMode') : t('adminMode')}</div>
              </div>
              <img 
                src={`https://picsum.photos/seed/${user.name}/40/40`} 
                alt="Profile" 
                className="w-10 h-10 rounded-xl ring-2 ring-indigo-50 border-2 border-white shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50/50">
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
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, collapsed, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center p-3.5 rounded-xl transition-all relative ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    <div className={`${collapsed ? 'mx-auto' : 'mr-3'}`}>{icon}</div>
    {!collapsed && <span className="text-sm font-semibold">{label}</span>}
    {badge && !collapsed && (
      <span className={`ml-auto px-2 py-0.5 rounded-lg text-[10px] font-bold ${active ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>
        {badge}
      </span>
    )}
    {active && collapsed && (
      <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full"></div>
    )}
  </button>
);

export default App;
