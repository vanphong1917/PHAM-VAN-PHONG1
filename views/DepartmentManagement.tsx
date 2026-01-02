
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Plus, Search, MoreVertical, Trash2, Edit3, X, 
  CheckCircle2, Users, Briefcase, Info, AlertCircle, Loader2
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  head: string;
  description: string;
}

const DepartmentManagement: React.FC = () => {
  const [db, setDb] = useState<any>(() => {
    const cache = localStorage.getItem('hdh_master_db_cache');
    return cache ? JSON.parse(cache) : { departments: [], users: [] };
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [newDept, setNewDept] = useState<Department>({
    id: '',
    name: '',
    head: '',
    description: ''
  });

  // Sync back to master cache
  const saveToDb = (data: any) => {
    localStorage.setItem('hdh_master_db_cache', JSON.stringify(data));
    window.dispatchEvent(new Event('storage_sync'));
    setDb(data);
  };

  // Tính số lượng nhân viên mỗi phòng ban
  const deptStats = useMemo(() => {
    const stats: Record<string, number> = {};
    (db.users || []).forEach((u: any) => {
      stats[u.dept] = (stats[u.dept] || 0) + 1;
    });
    return stats;
  }, [db.users]);

  const filteredDepts = (db.departments || []).filter((d: Department) => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const deptId = newDept.id || `DEPT-${Date.now().toString().slice(-4)}`;
    const deptToAdd = { ...newDept, id: deptId };
    
    const newDb = { ...db, departments: [...(db.departments || []), deptToAdd] };
    
    setTimeout(() => {
      saveToDb(newDb);
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsAddModalOpen(false);
        setNewDept({ id: '', name: '', head: '', description: '' });
      }, 1000);
    }, 600);
  };

  const handleUpdateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setIsLoading(true);

    const updatedDepts = db.departments.map((d: Department) => 
      d.id === editingDept.id ? editingDept : d
    );
    
    const newDb = { ...db, departments: updatedDepts };
    
    setTimeout(() => {
      saveToDb(newDb);
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setEditingDept(null);
      }, 1000);
    }, 600);
  };

  const deleteDept = (id: string) => {
    const deptName = db.departments.find((d: any) => d.id === id)?.name;
    if (deptStats[deptName] > 0) {
      alert(`Không thể xóa phòng ban "${deptName}" vì vẫn còn ${deptStats[deptName]} nhân viên đang trực thuộc.`);
      return;
    }
    if (confirm("Xác nhận xóa phòng ban này?")) {
      const newDb = { ...db, departments: db.departments.filter((d: any) => d.id !== id) };
      saveToDb(newDb);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="text-rose-600" size={28} /> Quản lý Phòng ban
          </h2>
          <p className="text-slate-500 text-sm italic">Cấu trúc sơ đồ tổ chức liên kết trực tiếp với danh bạ và mail nội bộ.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95"
        >
          Thêm phòng ban
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
              placeholder="Tìm kiếm phòng ban..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-100" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
          {filteredDepts.map((dept: Department) => (
            <div key={dept.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:border-rose-300 hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Building2 size={24} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingDept(dept)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"><Edit3 size={16} /></button>
                  <button onClick={() => deleteDept(dept.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">{dept.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{dept.id}</p>
              
              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Users size={12}/> Nhân sự</span>
                  <span className="text-xs font-black text-rose-600">{deptStats[dept.name] || 0} Thành viên</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Briefcase size={12}/> Trưởng phòng</span>
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{dept.head || "Chưa bổ nhiệm"}</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                <Building2 size={120} />
              </div>
            </div>
          ))}

          {filteredDepts.length === 0 && (
            <div className="col-span-full py-20 text-center flex flex-col items-center opacity-30">
              <Building2 size={80} />
              <p className="font-black text-xs uppercase tracking-[0.3em] mt-4">Không tìm thấy phòng ban</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add/Edit */}
      {(isAddModalOpen || editingDept) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm italic">
                {editingDept ? "Cập nhật Phòng ban" : "Thêm Phòng ban mới"}
              </h3>
              <button onClick={() => {setIsAddModalOpen(false); setEditingDept(null);}} className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={editingDept ? handleUpdateDept : handleAddDept} className="p-10 space-y-6">
              {isSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="font-black text-slate-900 uppercase tracking-tighter text-center">Dữ liệu hạ tầng đã cập nhật</p>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên phòng ban</label>
                    <input 
                      type="text" 
                      required
                      value={editingDept ? editingDept.name : newDept.name}
                      onChange={(e) => editingDept ? setEditingDept({...editingDept, name: e.target.value}) : setNewDept({...newDept, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-100 font-bold text-sm"
                      placeholder="VD: Kỹ thuật phần mềm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mã phòng ban (ID)</label>
                      <input 
                        type="text" 
                        value={editingDept ? editingDept.id : newDept.id}
                        disabled={!!editingDept}
                        onChange={(e) => setNewDept({...newDept, id: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-100 font-mono text-sm disabled:opacity-50"
                        placeholder="VD: DEPT04"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Trưởng phòng</label>
                      <select 
                        value={editingDept ? editingDept.head : newDept.head}
                        onChange={(e) => editingDept ? setEditingDept({...editingDept, head: e.target.value}) : setNewDept({...newDept, head: e.target.value})}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-100 font-bold text-sm"
                      >
                        <option value="">-- Chọn trưởng phòng --</option>
                        {db.users.map((u: any) => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả chức năng</label>
                    <textarea 
                      rows={3}
                      value={editingDept ? editingDept.description : newDept.description}
                      onChange={(e) => editingDept ? setEditingDept({...editingDept, description: e.target.value}) : setNewDept({...newDept, description: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-100 text-sm font-medium resize-none"
                      placeholder="Nhiệm vụ chính của phòng ban..."
                    />
                  </div>

                  <div className="pt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => {setIsAddModalOpen(false); setEditingDept(null);}} className="px-6 py-2.5 text-slate-400 font-bold uppercase tracking-widest text-xs">Hủy</button>
                    <button type="submit" disabled={isLoading} className="px-10 py-3 bg-rose-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-rose-100 flex items-center gap-2">
                      {isLoading && <Loader2 size={14} className="animate-spin" />}
                      Lưu thông tin
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

export default DepartmentManagement;
