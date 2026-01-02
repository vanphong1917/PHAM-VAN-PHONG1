
import React, { useState, useEffect } from 'react';
import { LockKeyhole, Shield, Users, Save, CheckCircle2, ChevronRight, Info, AlertCircle, Trash2, Edit3, PlusCircle, Loader2, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface PermissionCategory {
  id: string;
  label: string;
  permissions: {
    id: string;
    label: string;
    description: string;
  }[];
}

const DEFAULT_ROLES = [
  { id: 'ADMIN', label: 'Administrator', description: 'Toàn quyền quản trị hệ thống bare-metal và bảo mật.' },
  { id: 'DIRECTOR', label: 'Director', description: 'Quyền phê duyệt cuối cùng cho mọi yêu cầu tài chính/nhân sự.' },
  { id: 'HEAD', label: 'Department Head', description: 'Quản lý phê duyệt và xem báo cáo cấp phòng ban.' },
  { id: 'STAFF', label: 'Staff Member', description: 'Nhân viên có quyền truy cập mail và tạo yêu cầu.' },
  { id: 'USER', label: 'Basic User', description: 'Tài khoản người dùng cơ bản với quyền hạn tối thiểu.' }
];

const permissionCategories: PermissionCategory[] = [
  {
    id: 'user_mgmt',
    label: 'Quản lý người dùng',
    permissions: [
      { id: 'user_view', label: 'Xem danh sách', description: 'Quyền xem thông tin cơ bản của nhân viên.' },
      { id: 'user_create', label: 'Tạo mới/Mời', description: 'Quyền tạo tài khoản và đồng bộ với AD.' },
      { id: 'user_edit', label: 'Chỉnh sửa thông tin', description: 'Quyền cập nhật phòng ban, vai trò.' },
      { id: 'user_reset_pwd', label: 'Reset mật khẩu', description: 'Quyền bắt buộc đổi mật khẩu cho người dùng.' },
    ]
  },
  {
    id: 'system_mgmt',
    label: 'Quản trị hệ thống',
    permissions: [
      { id: 'sys_monitor', label: 'Giám sát hạ tầng', description: 'Xem trạng thái MAIL01, NC01, ARCH01.' },
      { id: 'sys_backup', label: 'Quản lý sao lưu', description: 'Thực hiện snapshot và kiểm tra integrity.' },
      { id: 'sys_policy', label: 'Cấu hình chính sách', description: 'Thay đổi SLA, Retention, Security rules.' },
    ]
  },
  {
    id: 'audit_mgmt',
    label: 'Audit & Báo cáo',
    permissions: [
      { id: 'audit_view', label: 'Xem nhật ký hệ thống', description: 'Truy cập Logs, login failures.' },
      { id: 'audit_export', label: 'Xuất báo cáo PDF/CSV', description: 'Quyền tải dữ liệu vận hành hàng tháng.' },
    ]
  }
];

const RolesPermissions: React.FC = () => {
  const { t } = useLanguage();
  const [selectedRoleId, setSelectedRoleId] = useState<string>('ADMIN');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  
  // State quản lý danh sách vai trò
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('hdh_portal_roles');
    return saved ? JSON.parse(saved) : DEFAULT_ROLES;
  });

  // State cho Modal thêm vai trò
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRole, setNewRole] = useState({ id: '', label: '', description: '' });

  // Persisted state for active permissions per role
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('hdh_portal_role_permissions');
    return saved ? JSON.parse(saved) : {
      ADMIN: ['user_view', 'user_create', 'user_edit', 'user_reset_pwd', 'sys_monitor', 'sys_backup', 'sys_policy', 'audit_view', 'audit_export'],
      DIRECTOR: ['user_view', 'sys_monitor', 'audit_view', 'audit_export'],
      HEAD: ['user_view', 'audit_view'],
      STAFF: ['user_view'],
      USER: ['user_view']
    };
  });

  // Sync user counts from actual directory
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('hdh_portal_users') || '[]');
    const counts: Record<string, number> = {};
    users.forEach((u: any) => {
      const roleId = u.role || 'USER';
      counts[roleId] = (counts[roleId] || 0) + 1;
    });
    setUserCounts(counts);
  }, []);

  // Lưu danh sách vai trò khi có thay đổi
  useEffect(() => {
    localStorage.setItem('hdh_portal_roles', JSON.stringify(roles));
  }, [roles]);

  const handleTogglePermission = (permissionId: string) => {
    setRolePermissions(prev => {
      const current = prev[selectedRoleId] || [];
      const updated = current.includes(permissionId)
        ? current.filter(id => id !== permissionId)
        : [...current, permissionId];
      return { ...prev, [selectedRoleId]: updated };
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('hdh_portal_role_permissions', JSON.stringify(rolePermissions));
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.id || !newRole.label) return;

    const roleId = newRole.id.toUpperCase().replace(/\s+/g, '_');
    
    // Kiểm tra trùng lặp
    if (roles.find((r: any) => r.id === roleId)) {
      alert("ID vai trò này đã tồn tại!");
      return;
    }

    const roleToAdd = { ...newRole, id: roleId };
    setRoles([...roles, roleToAdd]);
    
    // Khởi tạo quyền mặc định (chỉ xem)
    setRolePermissions(prev => ({
      ...prev,
      [roleId]: ['user_view']
    }));

    setIsAddModalOpen(false);
    setNewRole({ id: '', label: '', description: '' });
    setSelectedRoleId(roleId);
  };

  const handleDeleteRole = (id: string) => {
    if (['ADMIN', 'USER'].includes(id)) {
      alert("Không thể xóa vai trò hệ thống mặc định.");
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa vai trò ${id}?`)) {
      const updatedRoles = roles.filter((r: any) => r.id !== id);
      setRoles(updatedRoles);
      if (selectedRoleId === id) setSelectedRoleId('ADMIN');
    }
  };

  const selectedRole = roles.find((r: any) => r.id === selectedRoleId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <LockKeyhole className="text-rose-600" size={28} />
            Phân quyền & Vai trò Hệ thống
          </h2>
          <p className="text-slate-500 text-sm italic">Cấu hình ma trận quyền hạn đồng bộ 1:1 với danh bạ nhân viên nội bộ.</p>
        </div>
        <div className="flex items-center gap-3">
          {showSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold animate-scaleUp">
              <CheckCircle2 size={18} />
              Đã cập nhật vai trò hệ thống
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all disabled:opacity-70 active:scale-95"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Lưu ma trận quyền
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Role Selection Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Hệ thống vai trò</span>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="p-1 hover:bg-rose-100 rounded-lg transition-colors text-rose-600 active:scale-90"
                title="Thêm vai trò mới"
              >
                <PlusCircle size={20} />
              </button>
            </div>
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {roles.map((role: any) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full p-5 flex items-center gap-4 transition-all text-left group relative ${
                    selectedRoleId === role.id ? 'bg-rose-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-3 rounded-xl transition-all ${
                    selectedRoleId === role.id ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-slate-100 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-600'
                  }`}>
                    <Shield size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${selectedRoleId === role.id ? 'text-rose-900' : 'text-slate-800'}`}>
                      {role.label}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      {userCounts[role.id] || 0} Nhân sự
                    </p>
                  </div>
                  {selectedRoleId === role.id && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-rose-600 rounded-l-full"></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Info size={16} className="text-indigo-400" /> Liên kết Tài khoản
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Ma trận này được áp dụng cho mọi người dùng có Vai trò tương ứng trong Danh bạ. Việc thay đổi sẽ ảnh hưởng đến khả năng truy cập các module hạ tầng.
              </p>
            </div>
            <LockKeyhole size={80} className="absolute -bottom-4 -right-4 text-white/5 rotate-12" />
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
            <div className="p-8 border-b border-slate-100 bg-slate-50/20">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Thiết lập: {selectedRole?.label}</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-mono font-bold">{selectedRoleId}</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mt-1">{selectedRole?.description}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200 hover:bg-white transition-all shadow-sm"><Edit3 size={18} /></button>
                  {!['ADMIN', 'USER'].includes(selectedRoleId) && (
                    <button 
                      onClick={() => handleDeleteRole(selectedRoleId)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 hover:bg-white transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-0">
              <table className="w-full text-left border-collapse">
                <tbody className="divide-y divide-slate-100">
                  {permissionCategories.map(category => (
                    <React.Fragment key={category.id}>
                      <tr className="bg-slate-50/50">
                        <td colSpan={2} className="px-8 py-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{category.label}</span>
                        </td>
                      </tr>
                      {category.permissions.map(permission => (
                        <tr key={permission.id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{permission.label}</p>
                              <p className="text-xs text-slate-500 font-medium">{permission.description}</p>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() => handleTogglePermission(permission.id)}
                              className={`w-12 h-6 rounded-full relative transition-all duration-300 shrink-0 inline-block shadow-inner ${
                                rolePermissions[selectedRoleId]?.includes(permission.id) 
                                  ? 'bg-rose-600' 
                                  : 'bg-slate-200'
                              }`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${
                                rolePermissions[selectedRoleId]?.includes(permission.id) ? 'left-7' : 'left-1'
                              }`}></div>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <AlertCircle size={16} className="text-amber-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Tính năng phân quyền này liên kết trực tiếp tới Account Control của Windows Server nội bộ.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thêm vai trò */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">Thêm Vai trò mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddRole} className="p-10 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Vai trò (System ID)</label>
                <input 
                  type="text" 
                  required
                  placeholder="VD: MANAGER, AUDITOR..."
                  value={newRole.id}
                  onChange={(e) => setNewRole({...newRole, id: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-100 font-mono text-sm"
                />
                <p className="text-[9px] text-slate-400 italic ml-1">* Sẽ được tự động định dạng thành chữ hoa và nối bằng dấu gạch dưới.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên hiển thị</label>
                <input 
                  type="text" 
                  required
                  placeholder="VD: Quản lý cấp trung"
                  value={newRole.label}
                  onChange={(e) => setNewRole({...newRole, label: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-100 font-bold text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả nhiệm vụ</label>
                <textarea 
                  rows={3}
                  placeholder="Mô tả ngắn gọn quyền hạn của vai trò này..."
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-100 text-sm font-medium resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="px-6 py-2.5 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-600"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-100 active:scale-95"
                >
                  Tạo vai trò
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissions;
