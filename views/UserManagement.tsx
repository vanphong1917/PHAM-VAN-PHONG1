
import React, { useState } from 'react';
import { UserPlus, Filter, Search, MoreVertical, Shield, Mail, Phone, MapPin, X, User as UserIcon, Building2, Briefcase, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const UserManagement: React.FC = () => {
  const { t } = useLanguage();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [users, setUsers] = useState([
    { id: 1, name: 'Nguyen Van An', email: 'an.nv@enterprise.com', dept: 'IT Systems', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Manager Peter', email: 'peter@enterprise.com', dept: 'Operations', role: 'Head', status: 'Active' },
    { id: 3, name: 'Director Jane', email: 'jane.d@enterprise.com', dept: 'Executive', role: 'Director', status: 'Active' },
    { id: 4, name: 'Tran Binh', email: 'binh.t@enterprise.com', dept: 'IT Systems', role: 'User', status: 'Active' },
    { id: 5, name: 'Lê Minh', email: 'minh.l@enterprise.com', dept: 'HR Dept', role: 'Staff', status: 'Locked' },
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    dept: 'IT Systems',
    role: 'User'
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const id = users.length + 1;
    const userToAdd = { ...newUser, id, status: 'Active' };
    
    // Simulate API delay
    setTimeout(() => {
      setUsers([...users, userToAdd]);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsAddUserOpen(false);
        setNewUser({ name: '', email: '', dept: 'IT Systems', role: 'User' });
      }, 1500);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('directory')}</h2>
          <p className="text-slate-500">Quản lý danh tính đồng bộ từ AD Domain Controller nội bộ</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <UserPlus size={16} /> {t('addUser')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              className="pl-10 pr-4 py-2 bg-slate-50 border-none outline-none rounded-lg text-sm w-full" 
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 text-slate-600 bg-slate-50 rounded-lg text-sm font-medium hover:bg-slate-100">
            <Filter size={16} /> Lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">{t('fullName')}</th>
                <th className="px-6 py-4">{t('emailAddress')}</th>
                <th className="px-6 py-4">{t('department')}</th>
                <th className="px-6 py-4">{t('role')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={`https://picsum.photos/seed/user${user.id}/40/40`} className="w-9 h-9 rounded-full" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-400">ID: EMP-00{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.dept}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold inline-flex">
                      <Shield size={10} /> {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase ${user.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t(user.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"><MoreVertical size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 uppercase tracking-wide text-sm">{t('addUser')}</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-5">
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-scaleUp">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-50">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="font-bold text-slate-800">Người dùng đã được tạo thành công</p>
                  <p className="text-xs text-slate-500">Đang đồng bộ với Active Directory...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('fullName')}</label>
                    <div className="relative group">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                      <input 
                        type="text" 
                        required
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-sm"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('emailAddress')}</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600" size={18} />
                      <input 
                        type="email" 
                        required
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-sm"
                        placeholder="email@enterprise.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('department')}</label>
                      <div className="relative group">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select 
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-sm appearance-none"
                          value={newUser.dept}
                          onChange={(e) => setNewUser({...newUser, dept: e.target.value})}
                        >
                          <option>IT Systems</option>
                          <option>HR Dept</option>
                          <option>Finance</option>
                          <option>Operations</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('role')}</label>
                      <div className="relative group">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select 
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 font-medium text-sm appearance-none"
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                        >
                          <option>User</option>
                          <option>Staff</option>
                          <option>Head</option>
                          <option>Director</option>
                          <option>Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsAddUserOpen(false)}
                      className="px-6 py-2.5 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600"
                    >
                      {t('cancel')}
                    </button>
                    <button 
                      type="submit"
                      className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5"
                    >
                      {t('save')}
                    </button>
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
