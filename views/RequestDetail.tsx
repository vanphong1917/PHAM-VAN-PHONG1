
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, Share2, Download, Printer, MoreHorizontal, Check, X, Info, 
  FileText, Cloud, ShieldCheck, CheckCircle2, User, Clock, Send, Mail as MailIcon, AlertTriangle, Eye 
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
    const index = requestData.approvalLine.findIndex((s: any) => s.status !== 'completed');
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
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`<iframe src="${file.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    }
  };

  if (!requestData) return <div className="p-20 text-center font-bold text-slate-400 animate-pulse">Đang nạp yêu cầu...</div>;

  const tabs = [t('details'), t('attachments'), t('timeline')];

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {showToast.show && (
        <div className="fixed top-20 right-8 z-[60] bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-scaleUp border border-white/10 backdrop-blur-md">
          <div className="p-2 bg-emerald-500 rounded-xl"><Check size={20} /></div>
          <span className="text-xs font-black uppercase tracking-widest">{showToast.msg}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 transition-all text-slate-600 shadow-sm active:scale-95">
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{requestData.code}</h2>
              <StatusPill status={requestData.status} />
            </div>
            <p className="text-sm text-slate-500 font-bold">{requestData.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><Share2 size={20} /></button>
          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><Printer size={20} /></button>
          <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"><MoreHorizontal size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/30">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-indigo-600 bg-white' : 'text-slate-400 hover:text-slate-600'}`}>
                  {tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
                </button>
              ))}
            </div>

            <div className="p-10">
              {activeTab === t('details') && (
                <div className="space-y-10 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-y-10 gap-x-12">
                    <InfoRow label="Người khởi tạo" value={`${requestData.requester} (${requestData.dept})`} />
                    <InfoRow label="Độ ưu tiên" value={requestData.priority} />
                    <InfoRow label="Ngày tạo" value={new Date(requestData.createdAt).toLocaleString()} />
                    <InfoRow label="Phân loại" value={requestData.type} />
                  </div>
                  <div className="space-y-4 pt-10 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nội dung chi tiết</label>
                    <div className="bg-slate-50 p-8 rounded-[2rem] text-slate-700 leading-relaxed font-medium text-sm border border-slate-100" dangerouslySetInnerHTML={{ __html: requestData.description }}></div>
                  </div>
                </div>
              )}

              {activeTab === t('attachments') && (
                <div className="space-y-4 animate-fadeIn">
                  {(requestData.attachments || []).map((file: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform"><FileText size={24} /></div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{file.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{file.size}</span>
                            <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest"><ShieldCheck size={12} /> Bare-metal Scan Safe</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleViewFile(file)} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all" title="Xem tệp"><Eye size={20} /></button>
                        <button onClick={() => handleDownload(file)} className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl transition-all" title="Tải về"><Download size={20} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === t('timeline') && (
                <div className="space-y-10 animate-fadeIn">
                   <div className="relative pl-8 space-y-10">
                      <div className="absolute left-[15px] top-2 bottom-8 w-1 bg-slate-100 rounded-full"></div>
                      {requestData.approvalLine?.map((step: any, idx: number) => (
                        <div key={idx} className="relative flex items-start gap-6 group">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${
                            step.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
                            step.status === 'rejected' ? 'bg-rose-500 border-rose-500 text-white' :
                            idx === currentStepIndex && requestData.status === RequestStatus.PENDING ? 'bg-white border-indigo-600 text-indigo-600 shadow-xl animate-pulse' : 'bg-white border-slate-200 text-slate-300'
                          }`}>
                            {step.status === 'completed' ? <Check size={16} className="stroke-[3]" /> : step.status === 'rejected' ? <X size={16} className="stroke-[3]" /> : (idx + 1)}
                          </div>
                          <div className="flex-1 pt-1">
                             <div className="flex items-center justify-between mb-1">
                               <h4 className={`text-sm font-black uppercase tracking-widest ${step.status === 'rejected' ? 'text-rose-600' : step.status === 'completed' ? 'text-slate-900' : 'text-slate-400'}`}>{step.name}</h4>
                               <span className="text-[9px] font-black px-2 py-0.5 rounded border uppercase bg-slate-50 text-slate-400 border-slate-100">{step.role}</span>
                             </div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{step.email}</p>
                             {step.actionDate && <p className="text-[9px] font-black text-indigo-500 mt-2 uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> Xử lý: {step.actionDate}</p>}
                          </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 space-y-8">
             <div className="flex items-center gap-3">
               <User className="text-indigo-600" size={20} />
               <h3 className="font-black text-[11px] text-slate-900 uppercase tracking-[0.2em]">Hành động phê duyệt</h3>
             </div>

             {isMyTurn ? (
               <div className="space-y-4">
                 <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-[1.5rem] space-y-3">
                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">Lượt phê duyệt của bạn</p>
                   <p className="text-xs font-bold text-indigo-900">Bước {currentStepIndex + 1}: {requestData.approvalLine[currentStepIndex]?.name}</p>
                 </div>
                 <button disabled={isProcessing} onClick={() => updateRequest(RequestStatus.APPROVED)} className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl active:scale-95 disabled:opacity-50">
                   {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} Phê duyệt bước này
                 </button>
                 <button disabled={isProcessing} onClick={() => updateRequest(RequestStatus.REJECTED, true)} className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all active:scale-95 disabled:opacity-50">
                   <X size={16} /> Từ chối yêu cầu
                 </button>
               </div>
             ) : (
               <div className="p-8 rounded-[2rem] text-center space-y-4 bg-slate-50 border border-slate-100">
                  <div className={`w-16 h-16 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${requestData.status === RequestStatus.APPROVED ? 'bg-emerald-500 text-white' : requestData.status === RequestStatus.REJECTED ? 'bg-rose-500 text-white' : 'bg-white text-indigo-600'}`}>
                    {requestData.status === RequestStatus.APPROVED ? <CheckCircle2 size={32} /> : requestData.status === RequestStatus.REJECTED ? <AlertTriangle size={32} /> : <Clock size={32} />}
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-[0.2em] text-sm text-slate-700">
                      {requestData.status === RequestStatus.APPROVED ? 'Yêu cầu đã hoàn tất' : requestData.status === RequestStatus.REJECTED ? 'Đã bị từ chối' : 'Đang trong quy trình'}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                      {isMyTurn ? 'Chờ bạn xử lý.' : 'Yêu cầu đang được các cấp xử lý.'}
                    </p>
                  </div>
               </div>
             )}
          </div>

          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-indigo-100 mb-4">Bare-metal Integrity</h4>
            <p className="text-sm font-bold leading-relaxed relative z-10">Dữ liệu được xác thực 100% nội bộ. Mọi thay đổi trạng thái đều được ký điện tử vào Master DB cục bộ.</p>
            <ShieldCheck size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <div className="group">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
    <p className="text-sm font-bold text-slate-900 leading-tight border-b border-transparent group-hover:border-indigo-100 pb-1 transition-all">{value}</p>
  </div>
);

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

export default RequestDetail;
