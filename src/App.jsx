import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Layers, CreditCard, PlusCircle, Settings,
  LogOut, Key, Loader2, ArrowRight, Check, ShieldCheck,
  Radio, Paperclip, Send, GitCommit, Inbox, Users, CheckCircle,
  Play, FileText, X, ArrowLeft, Bell, RefreshCw, Unlock, MessageSquare
} from 'lucide-react';

// ==========================================
// 1. SYSTEM CONFIGURATION
// ==========================================
const API_URL = 'https://script.google.com/macros/s/AKfycbzrUxs2EJV5yHoD5B9St1OkLQt_ycYYprxJsNNnvrh4RyQcRibNWMF4mZuPzVMaxYsOog/exec';

// ==========================================
// 2. MAIN APP & ROUTER
// ==========================================
export default function App() {
  const [session, setSession] = useState(null); // { type: 'client'|'admin', creds: {} }
  const [isInitializing, setIsInitializing] = useState(true);

  // Check LocalStorage on Mount
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

  if (isInitializing) return <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" /></div>;

  if (!session) return <LoginGate onLogin={setSession} />;

  if (session.type === 'admin') return <AdminOS session={session} onLogout={handleLogout} />;
  if (session.type === 'client') return <ClientOS session={session} onLogout={handleLogout} />;
}

// ==========================================
// 3. LOGIN GATE
// ==========================================
function LoginGate({ onLogin }) {
  const [mode, setMode] = useState('client'); // 'client' | 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClientLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const projectId = e.target.projectId.value.toUpperCase();
    const authCode = e.target.authCode.value;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getDashboardData', project_id: projectId, auth_code: authCode })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      
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
    const adminCode = e.target.adminCode.value;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getAdminDashboard', payload: { admin_code: adminCode } })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      
      localStorage.setItem('15d_admin_auth', adminCode);
      onLogin({ type: 'admin', creds: { adminCode } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-800/20 blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="glass-panel w-full max-w-md p-8 bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight"><span className="text-[#D4AF37]">15D</span> OS</h1>
          <p className="text-sm text-zinc-400 mt-2">Enter credentials to access your environment.</p>
        </div>

        {mode === 'client' ? (
          <form onSubmit={handleClientLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Project ID</label>
              <input name="projectId" required placeholder="e.g. 15D-001" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 uppercase font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Auth Code</label>
              <input type="password" name="authCode" required placeholder="••••••••" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 font-mono" />
            </div>
            {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Key size={16} /> Authenticate</>}
            </button>
            <p className="text-center text-xs text-zinc-500 pt-4 cursor-pointer hover:text-white" onClick={() => setMode('admin')}>Admin Login</p>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Master Passcode</label>
              <input type="password" name="adminCode" required placeholder="Sovereign Access" className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 font-mono text-center" />
            </div>
            {error && <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 text-[#D4AF37] py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Unlock size={16} /> Access Network</>}
            </button>
            <p className="text-center text-xs text-zinc-500 pt-4 cursor-pointer hover:text-white" onClick={() => setMode('client')}>Client Login</p>
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
  const timelineRef = useRef(null);

  const fetchDashboard = async (isPoll = false) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'getDashboardData', project_id: session.creds.projectId, auth_code: session.creds.authCode })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      
      setData(prev => {
        // Check for new messages
        if (prev && result.data.timeline.length > prev.timeline.length && isPoll) {
          const latest = result.data.timeline[result.data.timeline.length - 1];
          if (latest.sender !== result.data.client_name) {
            setToast({ title: 'New Update', message: `Message from ${latest.sender}` });
          }
        }
        return result.data;
      });
    } catch (e) {
      if (e.message.includes('Unauthorized')) onLogout();
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
    if (!msg) return;
    e.target.reset();
    
    // Optimistic UI
    setData(prev => ({...prev, timeline: [...prev.timeline, { id: 'temp', sender: prev.client_name, message: msg, date: new Date().toISOString() }]}));

    try {
      await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'submitMessage', project_id: session.creds.projectId, auth_code: session.creds.authCode, payload: { message: msg } }) });
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
      await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'submitNewRequest', project_id: session.creds.projectId, auth_code: session.creds.authCode, payload: { request_type: type, details } }) });
      e.target.reset();
      setToast({ title: 'Success', message: 'Request logged successfully.' });
      setTab('dashboard');
      fetchDashboard();
    } catch (e) {
      setToast({ title: 'Error', message: e.message });
    }
  };

  if (loading || !data) return <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center"><Loader2 className="animate-spin text-[#D4AF37]" /></div>;

  const isLocked = data.project_state === 'Paused_Unpaid';

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-zinc-100 flex overflow-hidden">
      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
      
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 bg-black z-10 shrink-0">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tighter"><span className="text-[#D4AF37]">15D</span> SDOS</h1>
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
            <p className="text-xs text-zinc-500 mb-1">Status</p>
            <div className={`text-sm font-medium flex items-center gap-2 ${isLocked ? 'text-red-400' : 'text-white'}`}>
              <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
              {isLocked ? 'Locked (Unpaid)' : 'Active'}
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm transition-colors"><LogOut size={16}/> Disconnect</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex border-r border-white/5">
        <div className="flex-1 p-10 overflow-y-auto relative">
          
          {tab === 'dashboard' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold mb-6">Metrics & Status</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Completion</p>
                  <p className="text-3xl"><span className="text-white">{data.stats.progress_percent}</span><span className="text-[#D4AF37] text-xl">%</span></p>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl">
                  <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2">Pending Review</p>
                  <p className="text-3xl text-white">{data.stats.pending_review}</p>
                </div>
              </div>
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Active Queue</h3>
              <div className="space-y-3">
                {data.requests.length === 0 ? <p className="text-sm text-zinc-600">No active requests.</p> : data.requests.map(r => <RequestCard key={r.request_id} req={r} />)}
              </div>
            </div>
          )}

          {tab === 'scope' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold mb-2">Scope Summary</h2>
              <p className="text-sm text-zinc-400 mb-8">Established deliverables.</p>
              <div className="bg-white/[0.02] border border-[#D4AF37]/20 p-6 rounded-xl">
                <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldCheck size={16}/> Approved Scope</h3>
                <ul className="space-y-3 text-sm text-zinc-300">
                  {parseScope(data.approved_scope).map((item, i) => (
                    <li key={i} className="flex items-start gap-3"><Check size={16} className="text-zinc-500 mt-0.5"/> {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {tab === 'financials' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold mb-2">Financials</h2>
              <p className="text-sm text-zinc-400 mb-8">Billing and milestones.</p>
              {data.stats.unpaid_invoices > 0 ? (
                <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col gap-3">
                  <div className="flex justify-between items-center"><span className="text-sm font-medium">Outstanding Milestone</span><span className="text-xs uppercase px-2 py-1 bg-red-500/20 text-red-400 rounded">Due</span></div>
                  <p className="text-xl text-white">Invoice Pending</p>
                  <p className="text-xs text-zinc-400">You have {data.stats.unpaid_invoices} unpaid invoice(s). Check email for link.</p>
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col gap-3">
                  <div className="flex justify-between items-center"><span className="text-sm font-medium text-zinc-400">Account Status</span><span className="text-xs uppercase px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded">Settled</span></div>
                  <p className="text-sm text-zinc-400">All current milestones are paid.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'engine' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold mb-2">Scope Engine</h2>
              <p className="text-sm text-zinc-400 mb-8">Submit new requests deterministically.</p>
              <form onSubmit={handleEngineSubmit} className="bg-white/[0.02] border border-white/5 p-6 rounded-xl space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">Request Type</label>
                  <select name="type" required className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none">
                    <option value="" disabled>Select routing logic...</option>
                    <option value="Task">Standard Task (In Scope)</option>
                    <option value="Change Request">Change Request (Requires Quote)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 uppercase mb-2">Parameters</label>
                  <textarea name="details" required rows="4" placeholder="Describe the feature..." className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 resize-none"></textarea>
                </div>
                <button type="submit" className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  Submit to Engine <ArrowRight size={16}/>
                </button>
              </form>
            </div>
          )}

          {tab === 'settings' && (
            <div className="animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold mb-2">Settings</h2>
              <p className="text-sm text-zinc-400 mb-8">System preferences.</p>
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Email Notifications</p><p className="text-xs text-zinc-500">Alerts for timeline updates.</p></div>
                  <div className="w-10 h-5 bg-[#D4AF37]/50 rounded-full flex items-center justify-end px-1"><div className="w-3 h-3 bg-white rounded-full"></div></div>
                </div>
                <hr className="border-white/5" />
                <button className="text-sm text-zinc-400 hover:text-white flex items-center gap-2"><Key size={14}/> Request Auth Code Reset</button>
              </div>
            </div>
          )}
        </div>

        {/* TIMELINE (CHAT) */}
        <div className="w-96 bg-black/20 flex flex-col shrink-0">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <h2 className="text-sm font-bold flex items-center gap-2"><Radio size={16} className="text-[#D4AF37]"/> Unified Timeline</h2>
          </div>
          <div ref={timelineRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {data.timeline.map((log, i) => <TimelineBubble key={i} log={log} clientName={data.client_name} />)}
          </div>
          <div className="p-4 border-t border-white/5 bg-[#0B0B0D]">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <button type="button" className="p-3 text-zinc-500 hover:text-white bg-white/5 rounded-lg"><Paperclip size={18}/></button>
              <input name="message" required placeholder="Send message..." className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50" />
              <button type="submit" className="p-3 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg hover:bg-[#D4AF37]/20"><Send size={18}/></button>
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
  const [tab, setTab] = useState('queue');
  const [activeClient, setActiveClient] = useState(null); // Project ID
  const [clientData, setClientData] = useState(null);
  const [toast, setToast] = useState(null);
  const timelineRef = useRef(null);

  const fetchAdminData = async () => {
    try {
      if (activeClient) {
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'getAdminClientDetails', payload: { admin_code: session.creds.adminCode, target_project_id: activeClient } }) });
        const result = await res.json();
        setClientData(result.data);
      } else {
        const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'getAdminDashboard', payload: { admin_code: session.creds.adminCode } }) });
        const result = await res.json();
        setData(result.data);
      }
    } catch (e) {
      if (e.message.includes('Unauthorized')) onLogout();
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 15000);
    return () => clearInterval(interval);
  }, [activeClient]);

  useEffect(() => {
    if (timelineRef.current) timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
  }, [clientData?.timeline]);

  const updateStatus = async (reqId, projId, newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;
    try {
      await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'updateRequestStatus', payload: { admin_code: session.creds.adminCode, request_id: reqId, project_id: projId, new_status: newStatus } }) });
      setToast({ title: 'Success', message: 'Status updated.' });
      fetchAdminData();
    } catch (e) { setToast({ title: 'Error', message: e.message }); }
  };

  const handleAdminChat = async (e) => {
    e.preventDefault();
    const msg = e.target.message.value.trim();
    if (!msg || !activeClient) return;
    e.target.reset();
    
    setClientData(prev => ({...prev, timeline: [...prev.timeline, { id: 'temp', sender: 'Admin', message: msg, date: new Date().toISOString() }]}));
    try {
      await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'adminSubmitMessage', payload: { admin_code: session.creds.adminCode, target_project_id: activeClient, message: msg } }) });
      fetchAdminData();
    } catch (e) { setToast({ title: 'Error', message: 'Failed to send.' }); }
  };

  const actionableCount = data?.queue?.filter(r => ['Awaiting_Admin_Verification', 'Disputed', 'Intake'].includes(r.status)).length || 0;

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-zinc-100 flex overflow-hidden">
      {toast && <Toast title={toast.title} message={toast.message} onClose={() => setToast(null)} />}
      
      <aside className="w-72 border-r border-white/5 flex flex-col p-6 bg-black z-10 shrink-0">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tighter"><span className="text-[#D4AF37]">15D</span> Admin</h1>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Sovereign Control</p>
        </div>
        <nav className="flex-1 space-y-2">
          <NavBtn active={tab==='queue' && !activeClient} icon={<Inbox size={16}/>} label="Global Queue" badge={actionableCount} onClick={()=>{setTab('queue'); setActiveClient(null);}} />
          <NavBtn active={tab==='matrix' && !activeClient} icon={<Users size={16}/>} label="Clients Matrix" onClick={()=>{setTab('matrix'); setActiveClient(null);}} />
          <NavBtn active={tab==='settings'} icon={<Settings size={16}/>} label="Settings" onClick={()=>{setTab('settings'); setActiveClient(null);}} />
        </nav>
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 px-2"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> API Linked</div> <RefreshCw size={14} className="cursor-pointer hover:text-white" onClick={fetchAdminData}/></div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm transition-colors"><LogOut size={16}/> Disconnect</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <div className="p-6 md:p-8 border-b border-white/5 bg-black/20 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{activeClient ? 'Client Drill-Down' : tab === 'queue' ? 'Scope Routing' : tab === 'matrix' ? 'Operations Matrix' : 'Settings'}</h2>
          {activeClient && <button onClick={()=>{setActiveClient(null); setTab('matrix');}} className="text-sm flex items-center gap-2 text-zinc-400 hover:text-white bg-white/5 px-4 py-2 rounded-lg"><ArrowLeft size={16}/> Back to Matrix</button>}
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {tab === 'queue' && !activeClient && data && (
            <div className="max-w-4xl space-y-4 animate-in fade-in">
              {data.queue.filter(r => ['Awaiting_Admin_Verification', 'Disputed', 'Intake'].includes(r.status)).length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-xl text-center text-zinc-500"><CheckCircle size={40} className="mx-auto mb-3 opacity-50"/> Zero actionable items.</div>
              ) : data.queue.filter(r => ['Awaiting_Admin_Verification', 'Disputed', 'Intake'].includes(r.status)).map(req => (
                <div key={req.request_id} className={`bg-white/[0.02] p-6 rounded-xl border-l-4 ${req.status === 'Disputed' ? 'border-l-red-500' : 'border-l-blue-500'} flex flex-col gap-4`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-xs uppercase tracking-wider font-bold ${req.status === 'Disputed' ? 'text-red-400' : 'text-blue-400'}`}>{req.status.replace(/_/g, ' ')}</span>
                      <h3 className="text-lg font-medium mt-1">{req.client_name} <span className="text-zinc-500 text-sm">({req.project_id})</span></h3>
                    </div>
                    <span className="text-xs font-mono text-zinc-500">{req.request_id}</span>
                  </div>
                  <div className="bg-black/50 p-4 rounded-lg text-sm text-zinc-300 border border-white/5"><strong>{req.type}:</strong> {req.details}</div>
                  <div className="flex items-center gap-3">
                    <button onClick={()=>updateStatus(req.request_id, req.project_id, 'WIP')} className="px-4 py-2 text-sm rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 flex gap-2"><Play size={16}/> Approve to WIP</button>
                    <button onClick={()=>updateStatus(req.request_id, req.project_id, 'Pending_Quote')} className="px-4 py-2 text-sm rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex gap-2"><FileText size={16}/> Send Quote</button>
                    {req.status === 'Disputed' && <button onClick={()=>updateStatus(req.request_id, req.project_id, 'Completed')} className="px-4 py-2 text-sm rounded bg-white/5 text-white hover:bg-white/10 flex gap-2"><Check size={16}/> Resolve</button>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'matrix' && !activeClient && data && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden animate-in fade-in">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-black/40 text-xs text-zinc-500 uppercase border-b border-white/5"><tr><th className="px-6 py-4">Project ID</th><th className="px-6 py-4">Client Name</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th></tr></thead>
                <tbody className="divide-y divide-white/5">
                  {data.projects.map(p => (
                    <tr key={p.project_id} className={`hover:bg-white/5 transition-colors border-l-2 ${p.state === 'Paused_Unpaid' ? 'border-red-500/50' : 'border-transparent'}`}>
                      <td className="px-6 py-4 font-mono">{p.project_id}</td><td className="px-6 py-4 font-medium text-white">{p.client_name}</td>
                      <td className="px-6 py-4"><Badge status={p.state} /></td>
                      <td className="px-6 py-4 text-right"><button onClick={()=>setActiveClient(p.project_id)} className="text-[#D4AF37] hover:text-white text-xs font-medium flex items-center justify-end gap-1 ml-auto">Manage <ArrowRight size={12}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ACTIVE CLIENT DRILL DOWN */}
          {activeClient && clientData && (
            <div className="flex h-full gap-6 animate-in fade-in absolute inset-0 p-8">
              <div className="w-1/2 flex flex-col gap-6 overflow-y-auto pr-2">
                <div>
                  <h3 className="text-2xl font-bold text-[#D4AF37]">{clientData.client_name}</h3>
                  <p className="text-xs text-zinc-500 font-mono mt-1">{activeClient} • {clientData.project_state.replace('_',' ')}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl"><p className="text-[10px] text-zinc-500 uppercase mb-1">Completion</p><p className="text-2xl">{clientData.stats.progress_percent}%</p></div>
                  <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl"><p className="text-[10px] text-zinc-500 uppercase mb-1">Unpaid</p><p className={`text-2xl ${clientData.stats.unpaid_invoices > 0 ? 'text-red-400' : ''}`}>{clientData.stats.unpaid_invoices}</p></div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-500 uppercase mb-3">Client Queue</h3>
                  <div className="space-y-2">
                    {clientData.requests.map(r => <div key={r.request_id} className="p-3 rounded bg-white/5 border border-white/10 flex justify-between items-center"><div className="text-xs"><strong>{r.type}</strong><br/><span className="font-mono text-[10px] text-zinc-500">{r.request_id}</span></div><Badge status={r.status} /></div>)}
                  </div>
                </div>
              </div>
              <div className="w-1/2 bg-black/40 border border-white/5 rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2 text-sm text-[#D4AF37]"><MessageSquare size={16}/> Comms Link</div>
                <div ref={timelineRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                  {clientData.timeline.map((log, i) => <TimelineBubble key={i} log={log} clientName={clientData.client_name} isAdminView />)}
                </div>
                <form onSubmit={handleAdminChat} className="p-4 border-t border-white/5 flex gap-2 bg-[#0B0B0D]">
                  <input name="message" required placeholder="Reply as Admin..." className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-[#D4AF37]/50" />
                  <button type="submit" className="p-3 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg hover:bg-[#D4AF37]/20"><Send size={18}/></button>
                </form>
              </div>
            </div>
          )}

          {tab === 'settings' && !activeClient && (
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-xl max-w-md">
              <h3 className="text-lg font-bold mb-4">Admin Config</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Global Webhooks</p><p className="text-xs text-zinc-500">Discord Integration</p></div><div className="w-10 h-5 bg-[#D4AF37]/50 rounded-full flex items-center justify-end px-1"><div className="w-3 h-3 bg-white rounded-full"></div></div></div>
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

function NavBtn({ active, icon, label, badge, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${active ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
      <div className="flex items-center gap-3">{icon} {label}</div>
      {badge > 0 && <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{badge}</span>}
    </button>
  );
}

function Badge({ status }) {
  const styles = {
    'Intake': 'text-zinc-400 border-white/10 bg-white/5',
    'Awaiting_Admin_Verification': 'text-blue-400 border-blue-500/20 bg-blue-500/10',
    'Pending_Quote': 'text-blue-400 border-blue-500/20 bg-blue-500/10',
    'Approved_Pending_Payment': 'text-purple-400 border-purple-500/20 bg-purple-500/10',
    'WIP': 'text-[#D4AF37] border-[#D4AF37]/20 bg-[#D4AF37]/10',
    'Awaiting_Client_Review': 'text-orange-400 border-orange-500/20 bg-orange-500/10',
    'Disputed': 'text-red-400 border-red-500/20 bg-red-500/10',
    'Completed': 'text-green-400 border-green-500/20 bg-green-500/10',
    'Paused_Unpaid': 'text-red-500 border-red-500/20 bg-red-500/10'
  };
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${styles[status] || styles['Intake']}`}>{status.replace(/_/g, ' ')}</span>;
}

function RequestCard({ req }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 hover:bg-white/[0.04] transition-colors">
      <div className="flex justify-between items-start">
        <span className="text-xs font-mono text-zinc-500">{req.request_id}</span>
        <Badge status={req.status} />
      </div>
      <p className="text-sm font-medium">{req.type}</p>
    </div>
  );
}

function TimelineBubble({ log, clientName, isAdminView = false }) {
  const time = new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isSystem = log.sender === 'SYSTEM' || log.sender === 'System';
  const isMe = isAdminView ? log.sender === 'Admin' : log.sender === clientName;

  if (isSystem) return <div className="flex justify-center my-4"><div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-zinc-400 flex items-center gap-2"><GitCommit size={12}/><span className="text-white">{log.type.replace(/_/g, ' ')}:</span> {log.message}</div></div>;
  if (isMe) return <div className="flex flex-col items-end w-full pl-12"><span className="text-[10px] text-zinc-500 mb-1 mr-1">You • {time}</span><div className={`rounded-2xl rounded-tr-sm px-5 py-3 border text-sm whitespace-pre-wrap ${isAdminView ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/10 border-white/10 text-white'}`}>{log.message}</div></div>;
  
  return <div className="flex flex-col items-start w-full pr-12"><span className="text-[10px] text-zinc-500 mb-1 ml-1">{log.sender} • {time}</span><div className={`rounded-2xl rounded-tl-sm px-5 py-3 border text-sm whitespace-pre-wrap ${!isAdminView ? 'bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/10 border-white/10 text-white'}`}>{log.message}</div></div>;
}

function Toast({ title, message, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  return (
    <div className="bg-[#0B0B0D] border border-white/10 p-4 rounded-xl flex items-start gap-3 w-80 shadow-2xl border-l-2 border-l-[#D4AF37] animate-in slide-in-from-right-8">
      <Bell size={16} className="text-[#D4AF37] mt-0.5" />
      <div className="flex-1">
        <div className="flex justify-between items-center"><h4 className="text-sm font-bold text-white">{title}</h4><X size={14} className="text-zinc-500 cursor-pointer" onClick={onClose}/></div>
        <p className="text-xs text-zinc-400 mt-1">{message}</p>
      </div>
    </div>
  );
}

function parseScope(str) {
  try { return JSON.parse(str); } 
  catch(e) { return [str || 'No parameters defined.']; }
}
