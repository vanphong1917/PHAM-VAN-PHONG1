
import React, { useState } from 'react';
import { UserPlus, Filter, Search, MoreVertical, Shield, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const UserManagement: React.FC = () => {
  const { t } = useLanguage();
  
  const users = [
    { id: 1, name: 'Nguyen Van An', email: 'an.nv@enterprise.com', dept: 'IT Systems', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Manager Peter', email: 'peter@enterprise.com', dept: 'Operations', role: 'Head', status: 'Active' },
    { id: 3, name: 'Director Jane', email: 'jane.d@enterprise.com', dept: 'Executive', role: 'Director', status: 'Active' },
    { id: 4, name: 'Tran Binh', email: 'binh.t@enterprise.com', dept: 'IT Systems', role: 'User', status: 'Active' },
    { id: 5, name: 'Lê Minh', email: 'minh.l@enterprise.com', dept: 'HR Dept', role: 'Staff', status: 'Locked' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('directory')}</h2>
          <p className="text-slate-500">Quản lý danh tính đồng bộ từ AD Domain Controller nội bộ</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
            <UserPlus size={16} /> Thêm người dùng
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
    </div>
  );
};

export default UserManagement;
