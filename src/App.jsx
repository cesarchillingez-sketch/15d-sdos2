import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Layers, CreditCard, PlusCircle, Settings,
  LogOut, Key, Loader2, ArrowRight, Check, ShieldCheck,
  Radio, Paperclip, Send, GitCommit, Inbox, Users, CheckCircle,
  Play, FileText, X, ArrowLeft, Bell, RefreshCw, Unlock, MessageSquare,
  ShieldAlert, Briefcase, Calendar, File as FileIcon
} from 'lucide-react';

// ==========================================
// 1. SYSTEM CONFIGURATION
// ==========================================
// PASTE YOUR V4 LIVE GOOGLE APPS SCRIPT URL HERE:
const API_URL = 'https://script.google.com/macros/s/AKfycbzrUxs2EJV5yHoD5B9St1OkLQt_ycYYprxJsNNnvrh4RyQcRibNWMF4mZuPzVMaxYsOog/exec';

// --- UNIVERSAL API CALLER (Fixes GAS CORS Blocks & Silent Failures) ---
const apiCall = async (action, reqData = {}) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...reqData })
    });
    
    const text = await res.text();
    
    // Catch Google's silent HTML redirect (happens if deployment permissions are wrong)
    if (text.trim().startsWith('<')) {
      throw new Error("Deployment Error: Please ensure your Google Apps Script is deployed as a Web App, Execute as 'Me', and Who has access is set to 'Anyone'.");
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch(e) {
      console.error("Raw response:", text);
      throw new Error("Server returned invalid data. Check console for details.");
    }
    
    if (!result.success) throw new Error(result.message);
    return result.data;
  } catch (error) {
    throw error;
  }
};

// ==========================================
// 2. MAIN APP & ROUTER
// ==========================================
export default function App() {
  const [session, setSession] = useState(null); 
  const [isInitializing, setIsInitializing] = useState(true);

  // Persistent Session Storage Hook
  useEffect(() => {
    const adminCode = localStorage.getItem('15d_admin_auth');
    const clientId = localStorage.getItem('15d_project');
    const clientAuth = localStorage.getItem('15d_auth');

    if (adminCode) {
      setSession({ type: 'admin', creds: { adminCode } });
    } else if (clientId && clientAuth) {
      setSession({ type: 'client', creds: { projectId: clientId, authCode: clientAuth } });
    }
    setIsInitializing(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('15d_admin_auth');
    localStorage.removeItem('15d_project');
    localStorage.removeItem('15d_auth');
    setSession(null);
  };

  if (isInitializing) return <div className="font-sans min-h-screen bg-[#0B0B0D] flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={48} /></div>;
  if (!session) return <LoginGate onLogin={setSession} />;
  if (session.type === 'admin') return <AdminOS session={session} onLogout={handleLogout} />;
  if (session.type === 'client') return <ClientOS session={session} onLogout={handleLogout} />;
}

// ==========================================
// 3. LOGIN GATE
// ==========================================
function LoginGate({ onLogin }) {
  const [mode, setMode] = useState('client'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClientLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const projectId = e.target.projectId.value.toUpperCase().trim();
    const authCode = e.target.authCode.value.trim();

    try {
      await apiCall('getDashboardData', { project_id: projectId, auth_code: authCode });
      localStorage.setItem('15d_project', projectId);
      localStorage.setItem('15d_auth', authCode);
      onLogin({ type: 'client', creds: { projectId, authCode } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const adminCode = e.target.adminCode.value.trim();

    try {
      await apiCall('getAdminDashboard', { payload: { admin_code: adminCode } });
      localStorage.setItem('15d_admin_auth', adminCode);
      onLogin({ type: 'admin', creds: { adminCode } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen bg-[#0B0B0D] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-800/20 blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-md p-8 bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-display tracking-tight"><span className="text-[#D4AF37]">15D</span> OS</h1>
          <p className="text-sm text-zinc-400 mt-2">Enter credentials to access your environment.</p>
        </div>

        {mode === 'client' ? (
          <form onSubmit={handleClientLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Project ID</label>
              <input name="projectId" required placeholder="e.g. 15D-001" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 uppercase font-mono transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Auth Code</label>
              <input type="password" name="authCode" required placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 font-mono transition-colors" />
            </div>
            {error && <div className="text-red-400 text-sm bg-red-400/10 p-4 rounded-lg border border-red-400/20 shadow-inner">{error}</div>}
            <button type="submit" disabled={loading} className="w-full font-display font-medium bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Key size={16} /> Authenticate</>}
            </button>
            <p className="text-center text-xs text-zinc-500 pt-4 cursor-pointer hover:text-white transition-colors" onClick={() => setMode('admin')}>Switch to Admin Console</p>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Master Passcode</label>
              <input type="password" name="adminCode" required placeholder="Sovereign Access" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 font-mono text-center transition-colors" />
            </div>
            {error && <div className="text-red-400 text-sm bg-red-400/10 p-4 rounded-lg border border-red-400/20 shadow-inner">{error}</div>}
            <button type="submit" disabled={loading} className="w-full font-display font-medium bg-[#D4AF37]/10 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 text-[#D4AF37] py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Unlock size={16} /> Access Network</>}
            </button>
            <p className="text-center text-xs text-zinc-500 pt-4 cursor-pointer hover:text-white transition-colors" onClick={() => setMode('client')}>Switch to Client Workspace</p>
          </form>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. CLIENT OS
// ==========================================
function ClientOS({ session, onLogout }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const timelineRef = useRef(null);

  const fetchDashboard = async (isPoll = false) => {
    try {
      const result = await apiCall('getDashboardData', { project_id: session.creds.projectId, auth_code: session.creds.authCode });
      setData(prev => {
        if (prev && result.timeline.length > prev.timeline.length && isPoll) {
          const latest = result.timeline[result.timeline.length - 1];
          if (latest.sender !== result.client_name) {
            setToast({ title: 'New Update', message: `Message from ${latest.sender}` });
          }
        }
        return result;
      });
    } catch (e) {
      if (e.message.includes('Unauthorized') || e.message.includes('not found')) {
        onLogout();
      } else if (!isPoll) {
        setToast({ title: 'Connection Error', message: e.message });
      }
    } finally {
      if(!isPoll) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => fetchDashboard(true), 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timelineRef.current) timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
  }, [data?.timeline]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    const msg = e.target.message.value.trim();
    if (!msg && attachments.length === 0) return;
    
    const msgWithMedia = attachments.length > 0 ? `${msg}\n[Attached ${attachments.length} files]` : msg;
    
    e.target.reset();
    e.target.message.style.height = '';
    setAttachments([]);
    
    // Optimistic UI update
    setData(prev => ({...prev, timeline: [...prev.timeline, { id: 'temp', sender: prev.client_name, message: msgWithMedia, date: new Date().toISOString() }]}));

    try {
      await apiCall('submitMessage', { project_id: session.creds.projectId, auth_code: session.creds.authCode, payload: { message: msgWithMedia } });
      fetchDashboard(true);
    } catch (e) {
      setToast({ title: 'Error', message: 'Failed to send message.' });
    }
  };

  const handleEngineSubmit = async (e) => {
    e.preventDefault();
    const type = e.target.type.value;
    const details = e.target.details.value;
    setToast({ title: 'Processing', message: 'Routing to engine...' });

    try {
      await apiCall('submitNewRequest', { project_id: session.creds.projectId, auth_code: session.creds.authCode, payload: { request_type: type, details } });
      e.target.reset();
      setToast({ title: 'Success', message: 'Request logged successfully.' });
      setTab('dashboard');
      fetchDashboard();
    } catch (e) {
      setToast({ title: 'Error', message: e.message });
    }
  };

  if (loading || !data) return <div className="font-sans min-h-screen bg-[#0B0B0D] flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={48} /></div>;

  const isLocked = data.project_state === 'Paused_Unpaid';

  return (
    <div className="font-sans min-h-screen bg-[#0B0B0D] text-zinc-100 flex overflow-hidden">
      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
      
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 bg-black z-10 shrink-0 shadow-2xl">
        <div className="mb-10">
          <h1 className="text-2xl font-bold font-display tracking-tighter"><span className="text-[#D4AF37]">15D</span> SDOS</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{data.client_name}</p>
        </div>
        <nav className="flex-1 space-y-2">
          <NavBtn active={tab==='dashboard'} icon={<LayoutDashboard size={16}/>} label="Mission Control" onClick={()=>setTab('dashboard')} />
          <NavBtn active={tab==='scope'} icon={<Layers size={16}/>} label="Scope & Deliverables" onClick={()=>setTab('scope')} />
          <NavBtn active={tab==='financials'} icon={<CreditCard size={16}/>} label="Financials" badge={data.stats.unpaid_invoices} onClick={()=>setTab('financials')} />
          <NavBtn active={tab==='engine'} icon={<PlusCircle size={16}/>} label="Scope Engine" onClick={()=>setTab('engine')} />
          <NavBtn active={tab==='settings'} icon={<Settings size={16}/>} label="Settings" onClick={()=>setTab('settings')} />
        </nav>
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Project Status</p>
            <div className={`text-sm font-medium flex items-center gap-2 ${isLocked ? 'text-red-400' : 'text-white'}`}>
              <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
              {isLocked ? 'Locked (Unpaid)' : 'Active Workspace'}
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:border-red-500/20 text-sm transition-all border border-transparent font-medium shadow-sm"><LogOut size={16}/> Secure Disconnect</button>
        </div>
      </aside>

      <main className="flex-1 flex border-r border-white/5 bg-[#0B0B0D]">
        <div className="flex-1 p-10 overflow-y-auto relative">
          
          {tab === 'dashboard' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold font-display mb-6">Metrics & Status</h2>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl shadow-lg">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Completion</p>
                  <p className="text-4xl font-display"><span className="text-white">{data.stats.progress_percent}</span><span className="text-[#D4AF37] text-2xl">%</span></p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl shadow-lg">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Pending Review</p>
                  <p className="text-4xl font-display text-white">{data.stats.pending_review}</p>
                </div>
              </div>
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Active Queue</h3>
              <div className="space-y-3">
                {data.requests.length === 0 ? <p className="text-sm text-zinc-600 p-6 border border-dashed border-white/10 rounded-xl text-center">No active requests in the queue.</p> : data.requests.map(r => <RequestCard key={r.request_id} req={r} />)}
              </div>
            </div>
          )}

          {tab === 'scope' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold font-display mb-2">Scope Summary</h2>
              <p className="text-sm text-zinc-400 mb-8">Established parameters and deliverables.</p>
              <div className="bg-white/[0.02] border border-[#D4AF37]/20 p-8 rounded-xl shadow-lg">
                <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-6 flex items-center gap-2"><ShieldCheck size={18}/> Approved Scope Parameters</h3>
                <ul className="space-y-4 text-sm text-zinc-300">
                  {parseScope(data.approved_scope).map((item, i) => (
                    <li key={i} className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-white/5"><Check size={16} className="text-green-500 mt-0.5 shrink-0"/> {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === 'financials' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold font-display mb-2">Financials</h2>
              <p className="text-sm text-zinc-400 mb-8">Billing operations and milestones.</p>
              {data.stats.unpaid_invoices > 0 ? (
                <div className="p-8 rounded-xl border border-red-500/30 bg-red-500/5 flex flex-col gap-4 shadow-lg shadow-red-500/5">
                  <div className="flex justify-between items-center"><span className="text-sm font-medium text-red-100">Outstanding Milestone</span><span className="text-xs font-bold uppercase px-3 py-1 bg-red-500 text-white rounded">Action Required</span></div>
                  <p className="text-3xl font-display text-white">Invoice Pending</p>
                  <p className="text-sm text-red-200/70">You have {data.stats.unpaid_invoices} unpaid invoice(s). Please check your email for the secure payment link to resume operations.</p>
                </div>
              ) : (
                <div className="p-8 rounded-xl border border-green-500/20 bg-green-500/5 flex flex-col gap-4 shadow-lg">
                  <div className="flex justify-between items-center"><span className="text-sm font-medium text-green-100">Account Status</span><span className="text-xs font-bold uppercase px-3 py-1 bg-green-500 text-white rounded">Settled</span></div>
                  <p className="text-sm text-green-200/70">All current milestones are paid. There are no pending invoices.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'engine' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold font-display mb-2">Scope Engine</h2>
              <p className="text-sm text-zinc-400 mb-8">Submit new requests or tasks deterministically.</p>
              <form onSubmit={handleEngineSubmit} className="bg-white/[0.02] border border-white/5 p-8 rounded-xl space-y-6 shadow-lg">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Request Type</label>
                  <select name="type" required className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none transition-colors shadow-inner">
                    <option value="" disabled>Select routing logic...</option>
                    <option value="Task">Standard Task (In Scope)</option>
                    <option value="Change Request">Change Request (Requires Quote)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Parameters & Details</label>
                  <textarea name="details" required rows="5" placeholder="Describe the feature, changes, or additions needed..." className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-[#D4AF37]/50 resize-none transition-colors shadow-inner"></textarea>
                </div>
                <button type="submit" className="bg-[#D4AF37]/10 text-[#D4AF37] font-display font-medium border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 w-full py-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg">
                  Submit to Engine <ArrowRight size={18}/>
                </button>
              </form>
            </div>
          )}

          {tab === 'settings' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold font-display mb-2">Settings</h2>
              <p className="text-sm text-zinc-400 mb-8">Workspace preferences.</p>
              <div className="bg-white/[0.02] border border-white/5 p-8 rounded-xl space-y-6 shadow-lg max-w-2xl">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-white">Email Notifications</p><p className="text-xs text-zinc-500 mt-1">Receive alerts for timeline updates.</p></div>
                  <div className="w-10 h-5 bg-[#D4AF37]/50 rounded-full flex items-center justify-end px-1 cursor-pointer"><div className="w-3 h-3 bg-white rounded-full"></div></div>
                </div>
                <hr className="border-white/5" />
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-white">Dark Mode / Theme</p><p className="text-xs text-zinc-500 mt-1">Sovereign aesthetic applied globally.</p></div>
                  <div className="w-10 h-5 bg-[#D4AF37]/50 rounded-full flex items-center justify-end px-1 cursor-not-allowed"><div className="w-3 h-3 bg-white rounded-full"></div></div>
                </div>
                <hr className="border-white/5" />
                <button className="text-sm text-red-400 hover:text-red-300 flex items-center gap-2 py-2 transition-colors font-medium"><Key size={16}/> Request Auth Code Reset</button>
              </div>
            </div>
          )}
        </div>

        {/* TIMELINE (CHAT) WITH RICH MEDIA UI */}
        <div className="w-[400px] bg-black/20 flex flex-col shrink-0 border-l border-white/5">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h2 className="text-sm font-display font-bold flex items-center gap-2"><Radio size={16} className="text-[#D4AF37]"/> Unified Timeline</h2>
            <span className="text-[10px] uppercase font-bold tracking-widest text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20">Live</span>
          </div>
          <div ref={timelineRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {data.timeline.map((log, i) => <TimelineBubble key={i} log={log} clientName={data.client_name} />)}
          </div>
          <div className="p-5 border-t border-white/5 bg-[#0B0B0D]">
            <form onSubmit={handleChatSubmit} className="flex items-end gap-3 w-full">
              <input type="file" id="client-file-upload" className="hidden" multiple onChange={(e) => setAttachments(Array.from(e.target.files))} />
              <button type="button" onClick={() => document.getElementById('client-file-upload').click()} className="p-3 text-zinc-500 hover:text-white bg-white/5 border border-white/10 rounded-xl transition-colors mb-0.5"><Paperclip size={18}/></button>
              
              <div className="flex-1 flex flex-col gap-2">
                {attachments.length > 0 && (
                  <div className="flex gap-2 flex-wrap px-1 pt-1">
                    {attachments.map((f, i) => (
                      <div key={i} className="text-[10px] bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                        <FileIcon size={10}/> {f.name.length > 15 ? f.name.substring(0, 15) + '...' : f.name}
                        <X size={10} className="cursor-pointer ml-1 hover:text-white" onClick={()=>setAttachments(attachments.filter((_, idx) => index !== idx))}/>
                      </div>
                    ))}
                  </div>
                )}
                <textarea name="message" required={attachments.length === 0} placeholder="Type a message..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 resize-none max-h-32 transition-colors shadow-inner" onInput={(e) => { e.target.style.height = ''; e.target.style.height = e.target.scrollHeight + 'px'; }} />
              </div>
              <button type="submit" className="p-3 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl hover:bg-[#D4AF37]/20 transition-colors mb-0.5"><Send size={18}/></button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

// ==========================================
// 5. ADMIN OS
// ==========================================
function AdminOS({ session, onLogout }) {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('matrix'); // Default to matrix overview
  const [activeClient, setActiveClient] = useState(null); 
  const [clientData, setClientData] = useState(null);
  const [clientTab, setClientTab] = useState('comms'); // Sub-tabs for drilldown
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const timelineRef = useRef(null);

  const fetchAdminData = async (isPoll = false) => {
    try {
      if (activeClient) {
        const result = await apiCall('getAdminClientDetails', { payload: { admin_code: session.creds.adminCode, target_project_id: activeClient } });
        setClientData(result);
      } else {
        const result = await apiCall('getAdminDashboard', { payload: { admin_code: session.creds.adminCode } });
        setData(result);
      }
    } catch (e) {
      if (e.message.includes('Unauthorized') || e.message.includes('not found')) onLogout();
      else if (!isPoll) setToast({ title: 'Error', message: e.message });
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(() => fetchAdminData(true), 15000);
    return () => clearInterval(interval);
  }, [activeClient]);

  useEffect(() => {
    if (timelineRef.current) timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
  }, [clientData?.timeline, clientTab]);

  const updateStatus = async (reqId, projId, newStatus) => {
    if (!window.confirm(`Update status of request ${reqId} to ${newStatus.replace(/_/g, ' ')}?`)) return;
    try {
      await apiCall('updateRequestStatus', { payload: { admin_code: session.creds.adminCode, request_id: reqId, project_id: projId, new_status: newStatus } });
      setToast({ title: 'Success', message: `Status updated to ${newStatus.replace(/_/g, ' ')}.` });
      fetchAdminData(true);
    } catch (e) { setToast({ title: 'Error', message: e.message }); }
  };

  const handleAdminChat = async (e) => {
    e.preventDefault();
    const msg = e.target.message.value.trim();
    if (!msg && attachments.length === 0) return;
    
    const msgWithMedia = attachments.length > 0 ? `${msg}\n[Attached ${attachments.length} files]` : msg;
    
    e.target.reset();
    e.target.message.style.height = '';
    setAttachments([]);
    
    setClientData(prev => ({...prev, timeline: [...prev.timeline, { id: 'temp', sender: 'Admin', message: msgWithMedia, date: new Date().toISOString() }]}));
    try {
      await apiCall('adminSubmitMessage', { payload: { admin_code: session.creds.adminCode, target_project_id: activeClient, message: msgWithMedia } });
      fetchAdminData(true);
    } catch (e) { setToast({ title: 'Error', message: 'Failed to send.' }); }
  };

  if (loading || !data) return <div className="font-sans min-h-screen bg-[#0B0B0D] flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={48}/></div>;

  const actionableCount = data?.queue?.filter(r => ['Awaiting_Admin_Verification', 'Intake'].includes(r.status)).length || 0;
  const disputeCount = data?.queue?.filter(r => r.status === 'Disputed').length || 0;

  return (
    <div className="font-sans min-h-screen bg-[#0B0B0D] text-zinc-100 flex overflow-hidden">
      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
      
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 bg-black z-10 shrink-0 shadow-2xl">
        <div className="mb-10">
          <h1 className="text-2xl font-bold font-display tracking-tighter"><span className="text-[#D4AF37]">15D</span> Admin</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Sovereign Control</p>
        </div>
        <nav className="flex-1 space-y-2">
          <NavBtn active={tab==='matrix' && !activeClient} icon={<Users size={16}/>} label="Clients Matrix" onClick={()=>{setTab('matrix'); setActiveClient(null);}} />
          <NavBtn active={tab==='queue' && !activeClient} icon={<Inbox size={16}/>} label="Global Queue" badge={actionableCount} onClick={()=>{setTab('queue'); setActiveClient(null);}} />
          <NavBtn active={tab==='disputes' && !activeClient} icon={<ShieldAlert size={16}/>} label="Disputes" badge={disputeCount} onClick={()=>{setTab('disputes'); setActiveClient(null);}} />
          <NavBtn active={tab==='team' && !activeClient} icon={<Briefcase size={16}/>} label="Team & Deadlines" onClick={()=>{setTab('team'); setActiveClient(null);}} />
          <NavBtn active={tab==='settings' && !activeClient} icon={<Settings size={16}/>} label="Settings" onClick={()=>{setTab('settings'); setActiveClient(null);}} />
        </nav>
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 px-2"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> API Linked</div> <RefreshCw size={14} className="cursor-pointer hover:text-white transition-colors" onClick={()=>fetchAdminData(true)}/></div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:border-red-500/20 text-sm transition-all border border-transparent font-medium shadow-sm"><LogOut size={16}/> Disconnect</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-[#0B0B0D]">
        <div className="p-6 md:p-8 border-b border-white/5 bg-black/20 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold font-display">{activeClient ? 'Client Operations Console' : tab === 'queue' ? 'Scope Routing' : tab === 'matrix' ? 'Master Matrix' : tab === 'disputes' ? 'Dispute Resolution' : tab === 'team' ? 'Collaboration Management' : 'Settings'}</h2>
          {activeClient && <button onClick={()=>{setActiveClient(null); setTab('matrix');}} className="text-sm flex items-center gap-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/5"><ArrowLeft size={16}/> Back to Matrix</button>}
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {/* TAB: GLOBAL QUEUE */}
          {tab === 'queue' && !activeClient && data && (
            <div className="max-w-4xl space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold font-display text-white">Actionable Requests</h2>
              {data.queue.filter(r => ['Awaiting_Admin_Verification', 'Intake'].includes(r.status)).length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 p-12 rounded-xl text-center text-zinc-500 shadow-inner"><CheckCircle size={48} className="mx-auto mb-4 opacity-50"/> <p className="text-lg">Zero actionable items in the routing queue.</p></div>
              ) : data.queue.filter(r => ['Awaiting_Admin_Verification', 'Intake'].includes(r.status)).map(req => (
                <RequestActionCard key={req.request_id} req={req} onUpdate={updateStatus} />
              ))}
            </div>
          )}

          {/* TAB: DISPUTES */}
          {tab === 'disputes' && !activeClient && data && (
            <div className="max-w-4xl space-y-6 animate-in fade-in">
               <h2 className="text-xl font-bold font-display text-red-400 flex items-center gap-2"><ShieldAlert size={20}/> Active Client Disputes</h2>
               {data.queue.filter(r => r.status === 'Disputed').length === 0 ? (
                  <div className="bg-white/[0.02] border border-white/5 p-12 rounded-xl text-center text-zinc-500 shadow-inner"><CheckCircle size={48} className="mx-auto mb-4 opacity-50"/> <p className="text-lg">No active disputes to resolve.</p></div>
               ) : data.queue.filter(r => r.status === 'Disputed').map(req => (
                  <RequestActionCard key={req.request_id} req={req} onUpdate={updateStatus} isDispute={true} />
               ))}
            </div>
          )}

          {/* TAB: TEAM & DEADLINES */}
          {tab === 'team' && !activeClient && data && (
            <div className="max-w-5xl space-y-6 animate-in fade-in">
              <p className="text-sm text-zinc-400 mb-6 border-b border-white/5 pb-4">Overview of work in progress and administrative assignments.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 shadow-lg">
                    <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-6 flex items-center gap-2"><Briefcase size={18}/> Active Assignments</h3>
                    <div className="space-y-4">
                        {data.projects.filter(p => p.state === 'WIP').map(p => (
                            <div key={p.project_id} className="p-4 bg-black/40 rounded-lg border border-white/5 flex justify-between items-center shadow-inner">
                                <div><p className="text-sm font-medium text-white">{p.client_name}</p><p className="text-xs text-zinc-500 mt-1">Lead Architect Assigned</p></div>
                                <Badge status="WIP"/>
                            </div>
                        ))}
                        {data.projects.filter(p => p.state === 'WIP').length === 0 && <p className="text-sm text-zinc-500 italic p-4 border border-dashed border-white/10 rounded-lg text-center">No active projects require assignment.</p>}
                    </div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 shadow-lg">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Calendar size={18}/> Imminent Deadlines</h3>
                    <div className="space-y-4">
                        {data.queue.filter(q => q.status === 'WIP').slice(0, 6).map(q => (
                            <div key={q.request_id} className="p-4 bg-black/40 rounded-lg border border-white/5 shadow-inner border-l-2 border-l-blue-500/50">
                                <p className="text-sm font-medium text-white line-clamp-1">{q.details}</p>
                                <p className="text-xs text-zinc-500 mt-1 flex justify-between"><span>{q.client_name}</span> <span>{q.type}</span></p>
                            </div>
                        ))}
                        {data.queue.filter(q => q.status === 'WIP').length === 0 && <p className="text-sm text-zinc-500 italic p-4 border border-dashed border-white/10 rounded-lg text-center">No tasks currently in progress.</p>}
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MATRIX */}
          {tab === 'matrix' && !activeClient && data && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden animate-in fade-in shadow-xl">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-black/60 text-xs text-zinc-500 uppercase border-b border-white/5 tracking-wider">
                  <tr><th className="px-6 py-5">Project ID</th><th className="px-6 py-5">Client Name</th><th className="px-6 py-5">Status</th><th className="px-6 py-5 text-right">Operations</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5 bg-black/20">
                  {data.projects.map(p => (
                    <tr key={p.project_id} className={`hover:bg-white/[0.04] transition-colors border-l-2 ${p.state === 'Paused_Unpaid' ? 'border-red-500/50' : 'border-transparent'}`}>
                      <td className="px-6 py-5 font-mono text-zinc-400">{p.project_id}</td>
                      <td className="px-6 py-5 font-medium text-white text-base">{p.client_name}</td>
                      <td className="px-6 py-5"><Badge status={p.state} /></td>
                      <td className="px-6 py-5 text-right">
                        <button onClick={()=>setActiveClient(p.project_id)} className="bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 px-4 py-2 rounded-lg text-xs font-bold transition-colors ml-auto shadow-sm">Open Workspace</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ACTIVE CLIENT DRILL DOWN */}
          {activeClient && clientData && (
            <div className="flex h-full gap-8 animate-in fade-in absolute inset-0 p-8">
              
              {/* Left Column: Client Overview */}
              <div className="w-[45%] flex flex-col gap-6 overflow-y-auto pr-2">
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 shadow-lg">
                  <h3 className="text-3xl font-bold font-display text-[#D4AF37] mb-1">{clientData.client_name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-xs text-zinc-400 font-mono bg-black/50 px-2 py-1 rounded border border-white/5">{activeClient}</p>
                    <Badge status={clientData.project_state} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl shadow-md"><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">System Completion</p><p className="text-3xl font-display text-white">{clientData.stats.progress_percent}<span className="text-[#D4AF37] text-xl">%</span></p></div>
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl shadow-md"><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Unpaid Invoices</p><p className={`text-3xl font-display ${clientData.stats.unpaid_invoices > 0 ? 'text-red-400' : 'text-white'}`}>{clientData.stats.unpaid_invoices}</p></div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 shadow-md flex-1 overflow-hidden flex flex-col">
                  <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-4 flex items-center gap-2"><Layers size={16}/> Active Client Queue</h3>
                  <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                    {clientData.requests.length === 0 ? <p className="text-xs text-zinc-500 italic p-4 text-center border border-dashed border-white/10 rounded">No active requests.</p> : null}
                    {clientData.requests.map(r => (
                      <div key={r.request_id} className={`p-4 rounded-lg bg-black/40 border flex justify-between items-center shadow-inner ${r.status === 'Completed' ? 'border-green-500/20 text-green-400' : r.status === 'Disputed' ? 'border-red-500/30' : 'border-white/5'}`}>
                        <div className="text-xs">
                          <strong className="text-white text-sm">{r.type}</strong><br/>
                          <span className="font-mono text-[10px] text-zinc-500">{r.request_id}</span>
                        </div>
                        <Badge status={r.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Right Column: Interaction Hub */}
              <div className="w-[55%] flex flex-col h-full bg-black/20 border border-white/5 rounded-xl shadow-2xl overflow-hidden">
                
                {/* Internal Tabs for Client View */}
                <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="flex bg-black/50 p-1 rounded-lg border border-white/5 w-fit">
                      <button onClick={()=>setClientTab('comms')} className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${clientTab==='comms'?'bg-[#D4AF37]/20 text-[#D4AF37] shadow-sm':'text-zinc-500 hover:text-white'}`}>Timeline & Comms</button>
                      <button onClick={()=>setClientTab('scope')} className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${clientTab==='scope'?'bg-[#D4AF37]/20 text-[#D4AF37] shadow-sm':'text-zinc-500 hover:text-white'}`}>Approved Scope</button>
                  </div>
                </div>

                {clientTab === 'comms' && (
                  <>
                    <div ref={timelineRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                      {clientData.timeline.length === 0 ? <div className="text-center text-zinc-600 mt-10 text-sm">No communications logged.</div> : null}
                      {clientData.timeline.map((log, i) => <TimelineBubble key={i} log={log} clientName={clientData.client_name} isAdminView />)}
                    </div>
                    <form onSubmit={handleAdminChat} className="p-5 border-t border-white/5 flex items-end gap-3 bg-[#0B0B0D]">
                      <input type="file" id="admin-file-upload" className="hidden" multiple onChange={(e) => setAttachments(Array.from(e.target.files))} />
                      <button type="button" onClick={() => document.getElementById('admin-file-upload').click()} className="p-3 text-zinc-500 hover:text-white bg-white/5 border border-white/10 rounded-xl transition-colors mb-0.5"><Paperclip size={18}/></button>
                      
                      <div className="flex-1 flex flex-col gap-2">
                        {attachments.length > 0 && (
                          <div className="flex gap-2 flex-wrap px-1 pt-1">
                            {attachments.map((f, i) => (
                              <div key={i} className="text-[10px] bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] px-2 py-1 rounded-md flex items-center gap-1 font-medium">
                                <FileIcon size={10}/> {f.name.length > 20 ? f.name.substring(0, 20) + '...' : f.name}
                                <X size={10} className="cursor-pointer ml-1 hover:text-white" onClick={()=>setAttachments(attachments.filter((_, idx) => index !== idx))}/>
                              </div>
                            ))}
                          </div>
                        )}
                        <textarea name="message" required={attachments.length === 0} placeholder="Message client directly..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 resize-none max-h-32 transition-colors shadow-inner" onInput={(e) => { e.target.style.height = ''; e.target.style.height = e.target.scrollHeight + 'px'; }} />
                      </div>
                      <button type="submit" className="p-3 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl hover:bg-[#D4AF37]/20 transition-colors mb-0.5"><Send size={18}/></button>
                    </form>
                  </>
                )}

                {clientTab === 'scope' && (
                  <div className="flex-1 overflow-y-auto p-8 bg-black/40">
                    <h3 className="text-lg font-bold text-[#D4AF37] uppercase tracking-widest mb-6 flex items-center gap-2"><ShieldCheck size={20}/> Secured Parameters</h3>
                    <ul className="space-y-4 text-sm text-zinc-300">
                      {parseScope(clientData.approved_scope).map((item, i) => (
                        <li key={i} className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-lg border border-white/5 shadow-sm"><Check size={18} className="text-green-500 mt-0.5 shrink-0"/> <span className="text-base">{item}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'settings' && !activeClient && (
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-xl max-w-2xl shadow-xl animate-in fade-in">
              <h3 className="text-xl font-bold font-display mb-6">Admin Configuration</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-white">Global Webhooks</p><p className="text-xs text-zinc-500 mt-1">Discord/Slack Integration for system alerts.</p></div><div className="w-10 h-5 bg-[#D4AF37]/50 rounded-full flex items-center justify-end px-1 cursor-not-allowed"><div className="w-3 h-3 bg-white rounded-full"></div></div></div>
                <hr className="border-white/5" />
                <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-white">Auto-Routing</p><p className="text-xs text-zinc-500 mt-1">Automatically send standard tasks to WIP.</p></div><div className="w-10 h-5 bg-white/10 border border-white/10 rounded-full flex items-center justify-start px-1 cursor-not-allowed"><div className="w-3 h-3 bg-zinc-500 rounded-full"></div></div></div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ==========================================
// 6. MICRO COMPONENTS
// ==========================================

function RequestActionCard({ req, onUpdate, isDispute = false }) {
  return (
    <div className={`bg-white/[0.02] p-6 rounded-xl border-l-4 ${isDispute ? 'border-l-red-500 shadow-red-500/10' : 'border-l-blue-500 shadow-blue-500/10'} flex flex-col gap-4 shadow-lg transition-all hover:bg-white/[0.04]`}>
      <div className="flex justify-between items-start">
        <div>
          <span className={`text-xs uppercase tracking-widest font-bold ${isDispute ? 'text-red-400' : 'text-blue-400'}`}>{req.status.replace(/_/g, ' ')}</span>
          <h3 className="text-xl font-medium mt-2 text-white">{req.client_name} <span className="text-zinc-500 text-sm ml-2 font-mono">({req.project_id})</span></h3>
        </div>
        <span className="text-xs font-mono text-zinc-500 bg-black/50 px-2 py-1 rounded border border-white/5">{req.request_id}</span>
      </div>
      <div className="bg-black/50 p-5 rounded-lg text-sm text-zinc-300 border border-white/5 shadow-inner">
        <strong className="text-white block mb-1">{req.type}:</strong> {req.details}
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {req.status !== 'WIP' && req.status !== 'Completed' && (
            <button onClick={()=>onUpdate(req.request_id, req.project_id, 'WIP')} className="px-4 py-2.5 text-sm rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 flex items-center gap-2 transition-colors font-medium"><Play size={16}/> Approve to WIP</button>
        )}
        {req.status !== 'Pending_Quote' && req.status !== 'Completed' && (
            <button onClick={()=>onUpdate(req.request_id, req.project_id, 'Pending_Quote')} className="px-4 py-2.5 text-sm rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 flex items-center gap-2 transition-colors font-medium"><FileText size={16}/> Send Quote</button>
        )}
        {isDispute && (
            <button onClick={()=>onUpdate(req.request_id, req.project_id, 'Completed')} className="px-4 py-2.5 text-sm rounded-lg bg-white/5 text-white hover:bg-white/10 border border-white/10 flex items-center gap-2 transition-colors font-medium"><Check size={16}/> Resolve Dispute</button>
        )}
      </div>
    </div>
  );
}

function NavBtn({ active, icon, label, badge, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg text-sm font-medium transition-all border border-transparent ${active ? 'bg-white/10 text-white border-white/5 shadow-sm' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
      <div className="flex items-center gap-3">{icon} {label}</div>
      {badge > 0 && <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">{badge}</span>}
    </button>
  );
}

function Badge({ status }) {
  const styles = {
    'Intake': 'text-zinc-400 border-white/10 bg-white/5',
    'Awaiting_Admin_Verification': 'text-blue-400 border-blue-500/20 bg-blue-500/10',
    'Pending_Quote': 'text-purple-400 border-purple-500/20 bg-purple-500/10',
    'Approved_Pending_Payment': 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10',
    'WIP': 'text-[#D4AF37] border-[#D4AF37]/20 bg-[#D4AF37]/10',
    'Awaiting_Client_Review': 'text-orange-400 border-orange-500/20 bg-orange-500/10',
    'Disputed': 'text-red-400 border-red-500/20 bg-red-500/10',
    'Completed': 'text-green-400 border-green-500/20 bg-green-500/10',
    'Paused_Unpaid': 'text-red-500 border-red-500/20 bg-red-500/10'
  };
  return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${styles[status] || styles['Intake']}`}>{status.replace(/_/g, ' ')}</span>;
}

function RequestCard({ req }) {
  return (
    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-3 hover:bg-white/[0.04] transition-colors shadow-sm">
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono text-zinc-500 bg-black/50 px-2 py-1 rounded border border-white/5">{req.request_id}</span>
        <Badge status={req.status} />
      </div>
      <p className="text-base font-medium text-white">{req.type}</p>
    </div>
  );
}

function TimelineBubble({ log, clientName, isAdminView = false }) {
  const time = new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isSystem = log.sender === 'SYSTEM' || log.sender === 'System';
  const isMe = isAdminView ? log.sender === 'Admin' : log.sender === clientName;

  if (isSystem) return <div className="flex justify-center my-6"><div className="bg-black/60 border border-white/5 shadow-inner rounded-full px-5 py-2 text-xs text-zinc-400 flex items-center gap-2"><GitCommit size={14} className="text-[#D4AF37]"/><span className="text-white font-bold tracking-widest uppercase text-[10px]">{log.type.replace(/_/g, ' ')}:</span> {log.message}</div></div>;
  if (isMe) return <div className="flex flex-col items-end w-full pl-16 mb-6"><span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-1 mr-1">You • {time}</span><div className={`rounded-2xl rounded-tr-sm px-5 py-4 border text-sm whitespace-pre-wrap shadow-lg ${isAdminView ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/10 border-white/10 text-white'}`}>{log.message}</div></div>;
  
  return <div className="flex flex-col items-start w-full pr-16 mb-6"><span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-1 ml-1">{log.sender} • {time}</span><div className={`rounded-2xl rounded-tl-sm px-5 py-4 border text-sm whitespace-pre-wrap shadow-lg ${!isAdminView ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]' : 'bg-black/60 border-white/5 text-zinc-300'}`}>{log.message}</div></div>;
}

function Toast({ title, message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  return (
    <div className="bg-[#0B0B0D] border border-white/10 p-5 rounded-xl flex items-start gap-4 w-80 shadow-2xl border-l-4 border-l-[#D4AF37] animate-in slide-in-from-right-8 z-50">
      <Bell size={18} className="text-[#D4AF37] mt-0.5" />
      <div className="flex-1">
        <div className="flex justify-between items-center"><h4 className="text-sm font-bold text-white font-display">{title}</h4><X size={14} className="text-zinc-500 cursor-pointer hover:text-white" onClick={onClose}/></div>
        <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

function parseScope(str) {
  try { return JSON.parse(str); } 
  catch(e) { return [str || 'No parameters defined.']; }
}
