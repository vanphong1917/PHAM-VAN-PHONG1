
import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, Users, Filter, Search, MoreVertical, Shield, Mail, X, User as UserIcon, 
  Building2, Briefcase, CheckCircle2, AtSign, Lock, Trash2, UserCog, Ban, Unlock, KeyRound, ExternalLink, Key, Eye, EyeOff
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const DEFAULT_ROLES = [
  { id: 'ADMIN', label: 'Administrator' },
  { id: 'DIRECTOR', label: 'Director' },
  { id: 'HEAD', label: 'Department Head' },
  { id: 'STAFF', label: 'Staff Member' },
  { id: 'USER', label: 'Basic User' }
];

const UserManagement: React.FC = () => {
  const { t } = useLanguage();
  
  const [db, setDb] = useState<any>(() => {
    const cache = localStorage.getItem('hdh_master_db_cache');
    return cache ? JSON.parse(cache) : { users: [], departments: [] };
  });

  const [users, setUsers] = useState<any[]>(db.users || []);
  const [departments, setDepartments] = useState<any[]>(db.departments || []);

  const [systemRoles, setSystemRoles] = useState(() => {
    const saved = localStorage.getItem('hdh_portal_roles');
    return saved ? JSON.parse(saved) : DEFAULT_ROLES;
  });

  const roleLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    systemRoles.forEach((r: any) => {
      map[r.id] = r.label;
    });
    return map;
  }, [systemRoles]);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [resettingUser, setResettingUser] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Sync back function
  const saveToMaster = (updatedUsers: any[]) => {
    const newDb = { ...db, users: updatedUsers };
    localStorage.setItem('hdh_master_db_cache', JSON.stringify(newDb));
    window.dispatchEvent(new Event('storage_sync'));
    setUsers(updatedUsers);
    setDb(newDb);
  };

  useEffect(() => {
    const handleSync = () => {
      // Sync Master DB (Users, Depts)
      const cache = localStorage.getItem('hdh_master_db_cache');
      if (cache) {
        const parsed = JSON.parse(cache);
        setDb(parsed);
        setUsers(parsed.users || []);
        setDepartments(parsed.departments || []);
      }
      
      // Sync System Roles - Đảm bảo dropdown và nhãn luôn cập nhật theo module RolesPermissions
      const savedRoles = localStorage.getItem('hdh_portal_roles');
      if (savedRoles) {
        setSystemRoles(JSON.parse(savedRoles));
      }
    };
    window.addEventListener('storage_sync', handleSync);
    return () => window.removeEventListener('storage_sync', handleSync);
  }, []);

  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    email: '',
    password: '123',
    dept: departments.length > 0 ? departments[0].name : 'IT Systems',
    role: 'USER'
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra trùng lặp Username hoặc Email (Case insensitive)
    const isUsernameExist = users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase());
    const isEmailExist = users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());

    if (isUsernameExist) {
      alert(`Lỗi: Tên đăng nhập "${newUser.username}" đã tồn tại trong hệ thống.`);
      return;
    }
    if (isEmailExist) {
      alert(`Lỗi: Email "${newUser.email}" đã được sử dụng.`);
      return;
    }

    const userToAdd = { id: Date.now(), ...newUser, status: 'Active', avatar: '' };
    const updatedUsers = [...users, userToAdd];
    saveToMaster(updatedUsers);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsAddUserOpen(false);
      setNewUser({ 
        name: '', 
        username: '', 
        email: '', 
        password: '123', 
        dept: departments.length > 0 ? departments[0].name : 'IT Systems', 
        role: 'USER' 
      });
    }, 1000);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra trùng lặp cho các tài khoản khác khi cập nhật
    const isUsernameExist = users.some(u => u.id !== editingUser.id && u.username.toLowerCase() === editingUser.username.toLowerCase());
    const isEmailExist = users.some(u => u.id !== editingUser.id && u.email.toLowerCase() === editingUser.email.toLowerCase());

    if (isUsernameExist) {
      alert(`Lỗi: Tên đăng nhập "${editingUser.username}" đang thuộc về một nhân viên khác.`);
      return;
    }
    if (isEmailExist) {
      alert(`Lỗi: Email "${editingUser.email}" đang thuộc về một nhân viên khác.`);
      return;
    }

    const updatedUsers = users.map((u: any) => u.id === editingUser.id ? editingUser : u);
    saveToMaster(updatedUsers);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setEditingUser(null);
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;

    const updatedUsers = users.map((u: any) => 
      u.id === resettingUser.id ? { ...u, password: newPassword || '123' } : u
    );
    
    saveToMaster(updatedUsers);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setResettingUser(null);
      setNewPassword('');
    }, 1500);
  };

  const deleteUser = (id: number) => {
    if(confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này?")) {
      saveToMaster(users.filter((u: any) => u.id !== id));
    }
  };

  const toggleStatus = (id: number) => {
    const updatedUsers = users.map((u: any) => {
      if (u.id === id) return { ...u, status: u.status === 'Active' ? 'Locked' : 'Active' };
      return u;
    });
    saveToMaster(updatedUsers);
  };

  const filteredUsers = users.filter((u: any) => {
    const q = searchQuery.toLowerCase();
    const roleLabel = (roleLabelMap[u.role] || u.role).toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.dept || '').toLowerCase().includes(q) ||
      roleLabel.includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="text-indigo-600" size={28} /> Quản lý Nhân sự
          </h2>
          <p className="text-slate-500 text-sm italic">Quản lý định danh cho {users.length} nhân viên trong hệ thống.</p>
        </div>
        <button 
          onClick={() => setIsAddUserOpen(true)}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          Thêm nhân viên
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, phòng ban, vai trò..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Nhân viên</th>
                <th className="px-6 py-4">Tài khoản</th>
                <th className="px-6 py-4">Phòng ban</th>
                <th className="px-6 py-4">Vai trò</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg overflow-hidden ${user.status === 'Locked' ? 'bg-slate-300' : 'bg-indigo-600'}`}>
                        {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user.name}</p>
                        <p className="text-[10px] font-medium text-slate-400 italic">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-mono text-slate-600">{user.username}</td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">{user.dept}</td>
                  <td className="px-6 py-5">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${
                      user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      user.role === 'DIRECTOR' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                      {roleLabelMap[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${user.status === 'Active' ? 'text-emerald-500 border-emerald-100 bg-emerald-50' : 'text-rose-500 border-rose-100 bg-rose-50'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="relative group/menu inline-block">
                      <button className="p-2 text-slate-400 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-slate-200 transition-all">
                        <MoreVertical size={18} />
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-30 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible transition-all">
                        <button onClick={() => setEditingUser(user)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600">
                          <UserCog size={16} /> Sửa hồ sơ
                        </button>
                        <button onClick={() => setResettingUser(user)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-amber-600 hover:bg-slate-50">
                          <Key size={16} /> Reset mật khẩu
                        </button>
                        <button onClick={() => toggleStatus(user.id)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold ${user.status === 'Active' ? 'text-rose-500' : 'text-emerald-500'} hover:bg-slate-50`}>
                          {user.status === 'Active' ? <Ban size={16} /> : <Unlock size={16} />} {user.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa'}
                        </button>
                        <button onClick={() => deleteUser(user.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50">
                          <Trash2 size={16} /> Xóa vĩnh viễn
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(isAddUserOpen || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
           <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
              <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">
                  {editingUser ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
                </h3>
                <button onClick={() => {setIsAddUserOpen(false); setEditingUser(null);}} className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="p-10 space-y-6">
                {isSuccess ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center shadow-lg animate-bounce">
                      <CheckCircle2 size={40} />
                    </div>
                    <p className="font-black text-slate-900 text-lg uppercase tracking-tighter">Dữ liệu đã được lưu</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và tên</label>
                      <input 
                        type="text" 
                        required
                        value={editingUser ? editingUser.name : newUser.name}
                        onChange={(e) => editingUser ? setEditingUser({...editingUser, name: e.target.value}) : setNewUser({...newUser, name: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-bold text-sm"
                        placeholder="VD: Nguyễn Văn A"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                        <input 
                          type="text" 
                          required
                          value={editingUser ? editingUser.username : newUser.username}
                          onChange={(e) => editingUser ? setEditingUser({...editingUser, username: e.target.value}) : setNewUser({...newUser, username: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-mono text-sm"
                          placeholder="nv.a"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <input 
                          type="email" 
                          required
                          value={editingUser ? editingUser.email : newUser.email}
                          onChange={(e) => editingUser ? setEditingUser({...editingUser, email: e.target.value}) : setNewUser({...newUser, email: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-mono text-sm"
                          placeholder="a@hdh.com.vn"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phòng ban</label>
                        <select 
                          value={editingUser ? editingUser.dept : newUser.dept}
                          onChange={(e) => editingUser ? setEditingUser({...editingUser, dept: e.target.value}) : setNewUser({...newUser, dept: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                        >
                          {departments.map((d: any) => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                          {departments.length === 0 && <option value="IT Systems">IT Systems (Default)</option>}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                          Vai trò
                        </label>
                        <select 
                          value={editingUser ? editingUser.role : newUser.role}
                          onChange={(e) => editingUser ? setEditingUser({...editingUser, role: e.target.value}) : setNewUser({...newUser, role: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                        >
                          {systemRoles.map((role: any) => (
                            <option key={role.id} value={role.id}>{role.label} ({role.id})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                      <button type="button" onClick={() => {setIsAddUserOpen(false); setEditingUser(null);}} className="px-6 py-2.5 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-600">Hủy</button>
                      <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 active:scale-95">Lưu thông tin</button>
                    </div>
                  </>
                )}
              </form>
           </div>
        </div>
      )}

      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Reset Mật khẩu</h3>
              <button onClick={() => setResettingUser(null)} className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-10 space-y-6">
              {isSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="font-black text-slate-900 uppercase tracking-tighter">Mật khẩu đã được thay đổi</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-amber-600 shadow-sm overflow-hidden">
                      {resettingUser.avatar ? <img src={resettingUser.avatar} className="w-full h-full object-cover" /> : resettingUser.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{resettingUser.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">@{resettingUser.username}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600" size={18} />
                      <input 
                        type={showPwd ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-mono text-sm"
                        placeholder="Nhập mật khẩu an toàn"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                      >
                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setNewPassword('123')}
                      className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest mt-1"
                    >
                      Dùng mặc định (123)
                    </button>
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setResettingUser(null)} className="px-6 py-2.5 text-slate-400 font-bold uppercase tracking-widest text-xs">Hủy</button>
                    <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100">Xác nhận Reset</button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
