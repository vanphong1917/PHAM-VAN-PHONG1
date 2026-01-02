
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, Share2, Download, Printer, MoreHorizontal, Check, X, Info, 
  FileText, Cloud, ShieldCheck, CheckCircle2, User, Clock, Send, Mail as MailIcon, AlertTriangle, Eye, ArrowDown, UserCheck, PlayCircle
} from 'lucide-react';
import StatusPill from '../components/StatusPill.tsx';
import { RequestStatus } from '../types.ts';
import { useLanguage } from '../LanguageContext.tsx';

interface RequestDetailProps {
  id: string;
  onBack: () => void;
  currentUser: any;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ id, onBack, currentUser }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(t('details'));
  const [isProcessing, setIsProcessing] = useState(false);
  const [requestData, setRequestData] = useState<any>(null);
  const [showToast, setShowToast] = useState<{show: boolean, msg: string}>({show: false, msg: ''});

  // Load Master DB Cache
  const [db, setDb] = useState<any>(() => {
    const cache = localStorage.getItem('hdh_master_db_cache');
    return cache ? JSON.parse(cache) : null;
  });

  useEffect(() => {
    if (db && db.global_requests) {
      const req = db.global_requests.find((r: any) => r.id === id);
      if (req) setRequestData(req);
    }
  }, [id, db]);

  const currentStepIndex = useMemo(() => {
    if (!requestData) return 0;
    const index = requestData.approvalLine.findIndex((s: any) => s.status !== 'completed' && s.status !== 'rejected');
    return index >= 0 ? index : requestData.approvalLine.length - 1;
  }, [requestData]);

  const isMyTurn = useMemo(() => {
    if (!requestData || requestData.status !== RequestStatus.PENDING) return false;
    const nextStep = requestData.approvalLine[currentStepIndex];
    return nextStep && nextStep.email === currentUser.email;
  }, [requestData, currentStepIndex, currentUser.email]);

  const updateRequest = (newStatus: RequestStatus, isRejection: boolean = false) => {
    if (!requestData) return;
    setIsProcessing(true);

    const newDb = { ...db };
    const reqIndex = newDb.global_requests.findIndex((r: any) => r.id === id);
    if (reqIndex === -1) return;

    const updatedReq = { ...newDb.global_requests[reqIndex] };
    const currentStep = { ...updatedReq.approvalLine[currentStepIndex] };

    if (isRejection) {
      updatedReq.status = RequestStatus.REJECTED;
      currentStep.status = 'rejected';
      currentStep.actionDate = new Date().toLocaleString();
      setShowToast({show: true, msg: 'Đã từ chối yêu cầu.'});
    } else {
      currentStep.status = 'completed';
      currentStep.actionDate = new Date().toLocaleString();
      const isLastStep = currentStepIndex === updatedReq.approvalLine.length - 1;
      if (isLastStep) {
        updatedReq.status = RequestStatus.APPROVED;
        setShowToast({show: true, msg: 'Phê duyệt hoàn tất toàn bộ tuyến!'});
      } else {
        updatedReq.status = RequestStatus.PENDING;
        setShowToast({show: true, msg: `Đã phê duyệt bước ${currentStepIndex + 1}.`});
      }
    }

    updatedReq.approvalLine[currentStepIndex] = currentStep;
    updatedReq.updatedAt = new Date().toISOString();
    newDb.global_requests[reqIndex] = updatedReq;

    setTimeout(() => {
      setDb(newDb);
      localStorage.setItem('hdh_master_db_cache', JSON.stringify(newDb));
      window.dispatchEvent(new Event('storage_sync'));
      setIsProcessing(false);
      setTimeout(() => setShowToast({show: false, msg: ''}), 3000);
    }, 1000);
  };

  const handleDownload = (file: any) => {
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewFile = (file: any) => {
    try {
      const base64Parts = file.data.split(',');
      if (base64Parts.length < 2) {
        // Fallback if not a data URL
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
      
      // Mở tệp bằng trình xem mặc định của trình duyệt/máy tính
      const newWindow = window.open(fileURL, '_blank');
      if (!newWindow) {
        alert("Vui lòng cho phép trình duyệt mở cửa sổ mới để xem tệp bằng trình đọc mặc định.");
      }
    } catch (e) {
      console.error("Lỗi khi xem tệp:", e);
      handleDownload(file); // Nếu không xem được thì tải về
    }
  };

  if (!requestData) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Đang nạp yêu cầu...</div>;

  const tabs = [t('details'), t('attachments'), t('timeline')];

  return (
    <div className="space-y-6 animate-fadeIn relative max-w-screen-2xl mx-auto">
      {showToast.show && (
        <div className="fixed top-20 right-4 sm:right-8 z-[60] bg-slate-900 text-white px-6 sm:px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-scaleUp border border-white/10 backdrop-blur-md">
          <div className="p-2 bg-emerald-500 rounded-xl"><Check size={20} /></div>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{showToast.msg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-6">
          <button onClick={onBack} className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 transition-all text-slate-600 shadow-sm active:scale-95">
            <ChevronLeft size={24} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight italic uppercase truncate">{requestData.code}</h2>
              <StatusPill status={requestData.status} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-bold truncate mt-1">{requestData.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><Share2 size={20} /></button>
          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><Printer size={20} /></button>
          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><MoreHorizontal size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/30 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 sm:px-8 py-5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${activeTab === tab ? 'text-indigo-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
                </button>
              ))}
            </div>

            <div className="p-6 sm:p-10">
              {activeTab === t('details') && (
                <div className="space-y-8 sm:space-y-10 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 sm:gap-y-10 gap-x-12">
                    <InfoRow label="Người khởi tạo" value={`${requestData.requester} (${requestData.dept})`} />
                    <InfoRow label="Độ ưu tiên" value={requestData.priority} />
                    <InfoRow label="Ngày tạo" value={new Date(requestData.createdAt).toLocaleString()} />
                    <InfoRow label="Phân loại" value={requestData.type} />
                  </div>
                  <div className="space-y-4 pt-8 sm:pt-10 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung chi tiết</label>
                    <div className="bg-slate-50 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] text-slate-700 leading-relaxed font-medium text-sm border border-slate-100" dangerouslySetInnerHTML={{ __html: requestData.description }}></div>
                  </div>
                </div>
              )}

              {activeTab === t('attachments') && (
                <div className="space-y-4 animate-fadeIn">
                  {(requestData.attachments || []).map((file: any, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all group gap-4">
                      <div className="flex items-center gap-4 sm:gap-5">
                        <div className="p-3 sm:p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform"><FileText size={20} sm:size={24} /></div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate">{file.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{file.size}</span>
                            <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest hidden sm:flex"><ShieldCheck size={12} /> Bare-metal Safe</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleViewFile(file)} className="flex items-center gap-2 px-4 py-2 sm:p-3 text-indigo-600 sm:text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-indigo-100 sm:border-transparent" title="Xem bằng trình đọc mặc định">
                           <Eye size={20} /> <span className="sm:hidden text-[10px] font-black uppercase">Xem</span>
                        </button>
                        <button onClick={() => handleDownload(file)} className="flex items-center gap-2 px-4 py-2 sm:p-3 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent sm:border-transparent" title="Tải về">
                           <Download size={20} /> <span className="sm:hidden text-[10px] font-black uppercase">Tải</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === t('timeline') && (
                <div className="space-y-10 animate-fadeIn overflow-x-hidden">
                   <div className="relative pl-6 sm:pl-8 space-y-10">
                      <div className="absolute left-[13px] sm:left-[15px] top-2 bottom-8 w-1 bg-slate-100 rounded-full"></div>
                      {requestData.approvalLine?.map((step: any, idx: number) => (
                        <div key={idx} className="relative flex items-start gap-4 sm:gap-6 group">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${
                            step.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
                            step.status === 'rejected' ? 'bg-rose-500 border-rose-500 text-white' :
                            idx === currentStepIndex && requestData.status === RequestStatus.PENDING ? 'bg-white border-indigo-600 text-indigo-600 shadow-xl animate-pulse' : 'bg-white border-slate-200 text-slate-300'
                          }`}>
                            {step.status === 'completed' ? <Check size={14} sm:size={16} className="stroke-[3]" /> : step.status === 'rejected' ? <X size={14} sm:size={16} className="stroke-[3]" /> : (idx + 1)}
                          </div>
                          <div className="flex-1 pt-1 min-w-0">
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                               <h4 className={`text-xs sm:text-sm font-black uppercase tracking-widest truncate ${step.status === 'rejected' ? 'text-rose-600' : step.status === 'completed' ? 'text-slate-900' : 'text-slate-400'}`}>{step.name}</h4>
                               <span className="text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded border uppercase bg-slate-50 text-slate-400 border-slate-100 self-start sm:self-center">{step.role}</span>
                             </div>
                             <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase truncate">{step.email}</p>
                             {step.actionDate && <p className="text-[8px] sm:text-[9px] font-black text-indigo-500 mt-2 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> Xử lý: {step.actionDate}</p>}
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:space-y-8">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6 sm:space-y-8">
             <div className="flex items-center gap-3">
               <UserCheck className="text-indigo-600" size={24} />
               <h3 className="font-black text-[10px] sm:text-[11px] text-slate-900 uppercase tracking-[0.2em]">Hành động phê duyệt</h3>
             </div>

             <div className={`p-5 sm:p-6 rounded-[1.5rem] border ${
               requestData.status === RequestStatus.APPROVED ? 'bg-emerald-50 border-emerald-100' :
               requestData.status === RequestStatus.REJECTED ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50 border-indigo-100'
             } space-y-3`}>
               <div className="flex items-center justify-between">
                 <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">Trạng thái hiện tại</span>
                 <div className="flex items-center gap-2">
                   {requestData.status === RequestStatus.PENDING && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
                   <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest ${
                     requestData.status === RequestStatus.APPROVED ? 'text-emerald-600' :
                     requestData.status === RequestStatus.REJECTED ? 'text-rose-600' : 'text-indigo-600'
                   }`}>{requestData.status}</span>
                 </div>
               </div>
               <div className="flex items-center gap-3 text-[11px] sm:text-xs font-bold text-slate-900">
                  <PlayCircle size={16} className="text-indigo-600 shrink-0" />
                  <span className="truncate">Bước {currentStepIndex + 1}: {requestData.approvalLine[currentStepIndex]?.name}</span>
               </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tuyến thu nhỏ</h4>
                <div className="space-y-3 pl-2">
                  {requestData.approvalLine.map((step: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 relative">
                      {idx < requestData.approvalLine.length - 1 && (
                        <div className={`absolute left-2.5 top-6 bottom-[-12px] w-0.5 ${idx < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                      )}
                      
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                        step.status === 'completed' ? 'bg-emerald-500 text-white' :
                        step.status === 'rejected' ? 'bg-rose-500 text-white' :
                        idx === currentStepIndex ? 'bg-indigo-600 text-white ring-4 ring-indigo-50' : 'bg-white border border-slate-200 text-slate-300'
                      }`}>
                        {step.status === 'completed' ? <Check size={10} className="stroke-[4]" /> : 
                         step.status === 'rejected' ? <X size={10} className="stroke-[4]" /> : 
                         <span className="text-[9px] font-black">{idx + 1}</span>}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-[10px] font-black uppercase tracking-tight truncate ${
                            idx === currentStepIndex ? 'text-slate-900' : 'text-slate-400'
                          }`}>{step.name}</p>
                          <span className={`text-[8px] font-black uppercase px-1 py-0.5 rounded shrink-0 ${
                            idx === currentStepIndex ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'
                          }`}>{step.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             {isMyTurn ? (
               <div className="space-y-4 pt-4 border-t border-slate-100">
                 <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-[1.5rem]">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic text-center">Đến lượt bạn xử lý</p>
                 </div>
                 <button disabled={isProcessing} onClick={() => updateRequest(RequestStatus.APPROVED)} className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl active:scale-95 disabled:opacity-50">
                   {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} Phê duyệt
                 </button>
                 <button disabled={isProcessing} onClick={() => updateRequest(RequestStatus.REJECTED, true)} className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95 disabled:opacity-50">
                   <X size={16} /> Từ chối
                 </button>
               </div>
             ) : (
               <div className="pt-4 border-t border-slate-100">
                  <div className="p-6 rounded-[2rem] text-center space-y-4 bg-slate-50 border border-slate-100">
                    <div className="flex justify-center">
                       <Clock size={32} className="text-slate-300 animate-pulse" />
                    </div>
                    <div>
                      <p className="font-black uppercase tracking-widest text-[10px] sm:text-[11px] text-slate-700 leading-tight">
                        {requestData.status === RequestStatus.APPROVED ? 'Đã hoàn tất' : 
                         requestData.status === RequestStatus.REJECTED ? 'Đã bị từ chối' : 
                         'Đang chờ xử lý'}
                      </p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mt-2">
                         {requestData.status === RequestStatus.PENDING ? 'Vui lòng chờ các cấp phê duyệt.' : 'Luồng này đã đóng.'}
                      </p>
                    </div>
                  </div>
               </div>
             )}
          </div>

          <div className="bg-indigo-600 rounded-[2rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden group hidden sm:block">
            <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-indigo-100 mb-4">Bare-metal Integrity</h4>
            <p className="text-sm font-bold leading-relaxed relative z-10">Mọi hành động phê duyệt đều được ghi nhật ký bất biến vào Master DB nội bộ.</p>
            <ShieldCheck size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div className="group min-w-0">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 truncate">{label}</p>
    <p className="text-sm font-bold text-slate-900 leading-tight border-b border-transparent group-hover:border-indigo-100 pb-1 transition-all truncate">{value}</p>
  </div>
);

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

export default RequestDetail;
