import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Lock, User, ArrowRight, Eye, EyeOff, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWaitingApproval, setIsWaitingApproval] = useState(false);
  const [requestId, setRequestId] = useState(null);

  // AUTOMATIC CLOUD SYNC: Menghubungkan WA ke Vercel secara otomatis
  useEffect(() => {
    const syncWebhook = async () => {
      try {
        const waUrl = import.meta.env.VITE_WA_API_URL;
        const waId = import.meta.env.VITE_WA_INSTANCE_ID;
        const waToken = import.meta.env.VITE_WA_API_TOKEN;

        if (waUrl && waId && waToken) {
          const currentUrl = window.location.origin;
          // Jangan sync jika di localhost
          if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) return;

          const webhookUrl = `${currentUrl}/api/webhook`;

          await fetch(`${waUrl}/waInstance${waId}/setSettings/${waToken}`, {
            method: 'POST',
            body: JSON.stringify({
              webhookUrl: webhookUrl,
              incomingWebhook: "yes",
              stateInstanceWebhook: "yes"
            }),
            headers: { 'Content-Type': 'application/json' }
          });
          console.log("🚀 Automation Synced: WA connected to Cloud.");
        }
      } catch (e) {}
    };
    syncWebhook();
  }, []);

  const sendWAPoll = (rid, user) => {
    try {
      const waUrl = import.meta.env.VITE_WA_API_URL;
      const waId = import.meta.env.VITE_WA_INSTANCE_ID;
      const waToken = import.meta.env.VITE_WA_API_TOKEN;
      const waGroup = import.meta.env.VITE_WA_GROUP_ID;

      if (waUrl && waId && waToken && waGroup) {
        fetch(`${waUrl}/waInstance${waId}/sendPoll/${waToken}`, {
          method: 'POST',
          body: JSON.stringify({
            chatId: waGroup,
            message: `🛡️ *ADMIN LOGIN APPROVAL*\n👤 *User:* ${user}\n🆔 *Req ID:* ${rid}\n\nSilakan pilih tindakan di bawah:`,
            options: [
              { optionName: "✅ APPROVE" },
              { optionName: "❌ REJECT" }
            ],
            multipleAnswers: false
          }),
          headers: { 'Content-Type': 'application/json' }
        }).catch(() => {});
      }
    } catch (e) {}
  };

  const pollApprovalStatus = async (rid, profile) => {
    // 1. Listen to Supabase (Fallback)
    const dbInterval = setInterval(async () => {
      const { data } = await supabase
        .from('login_requests')
        .select('status')
        .eq('id', rid)
        .maybeSingle();

      if (data?.status === 'approved') {
        clearInterval(dbInterval);
        clearInterval(waInterval);
        toast.success(`Akses Disetujui! Selamat Datang, ${profile.username}`);
        onLogin(profile);
      } else if (data?.status === 'rejected') {
        clearInterval(dbInterval);
        clearInterval(waInterval);
        setIsWaitingApproval(false);
        setLoading(false);
        toast.error('Akses Ditolak oleh Admin Utama.');
      }
    }, 3000);

    // 2. DIRECT WHATSAPP LISTENER (Lebih Akurat & Instan)
    const waInterval = setInterval(async () => {
      try {
        const waUrl = import.meta.env.VITE_WA_API_URL;
        const waId = import.meta.env.VITE_WA_INSTANCE_ID;
        const waToken = import.meta.env.VITE_WA_API_TOKEN;

        // Cek notifikasi masuk langsung ke Green-API
        const res = await fetch(`${waUrl}/waInstance${waId}/receiveNotification/${waToken}`);
        const data = await res.json();

        if (data && data.receiptId) {
          const body = data.body;
          let approved = false;
          let rejected = false;

          // Cek jika ada klik POLL atau Pesan Teks
          if (body.typeWebhook === 'pollVoteMessageReceived' || body.typeWebhook === 'incomingPollVote') {
            const vote = body.messageData?.pollVoteMessageData?.optionName || body.messageData?.pollVoteMessage?.optionName || "";
            if (vote.includes("APPROVE")) approved = true;
            if (vote.includes("REJECT")) rejected = true;
          } else if (body.typeWebhook === 'incomingMessageReceived') {
            const text = body.messageData?.textMessageData?.textMessage?.toUpperCase() || "";
            if (text.includes("ACC")) approved = true;
            if (text.includes("REJ") || text.includes("NO")) rejected = true;
          }

          if (approved || rejected) {
            const status = approved ? 'approved' : 'rejected';
            // Update Supabase secara instan dari frontend
            await supabase.from('login_requests').update({ status }).eq('id', rid);
          }

          // Hapus notifikasi agar tidak terbaca berulang
          await fetch(`${waUrl}/waInstance${waId}/deleteNotification/${waToken}/${data.receiptId}`, { method: 'DELETE' });
        }
      } catch (e) {
        console.error("WA Sync Error:", e);
      }
    }, 2000);

    // Timeout
    setTimeout(() => {
      clearInterval(dbInterval);
      clearInterval(waInterval);
      if (isWaitingApproval) {
        setIsWaitingApproval(false);
        setLoading(false);
        toast.error('Waktu tunggu habis.');
      }
    }, 120000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: checkUser, error: checkError } = await supabase
        .from('profiles')
        .select('username, password, is_blocked, role')
        .eq('username', username)
        .maybeSingle();

      if (!checkUser) {
        toast.error('Username tidak ditemukan!');
        setLoading(false);
        return;
      }

      if (checkUser.password !== password) {
        toast.error('Password Salah!');
        setLoading(false);
        return;
      }

      const profile = checkUser;

      if (profile.is_blocked) {
        toast.error('AKSES DITOLAK: Akun Anda sedang diblokir.');
        setLoading(false);
        return;
      }

      // ADMIN APPROVAL FLOW (2FA)
      if (profile.role === 'admin') {
        setIsWaitingApproval(true);
        const { data: request, error: reqError } = await supabase
          .from('login_requests')
          .insert({ username: profile.username, status: 'pending' })
          .select()
          .single();

        if (reqError) throw reqError;
        setRequestId(request.id);

        // Send Poll instead of Message
        sendWAPoll(request.id, profile.username);

        pollApprovalStatus(request.id, profile);
      } else {
        toast.success(`Selamat Datang, ${profile.username}`);
        onLogin(profile);
      }

    } catch (err) {
      toast.error('Terjadi kesalahan pada sistem login');
      setLoading(false);
    }
  };

  if (isWaitingApproval) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0d15] font-['Inter'] p-6">
        <div className="w-full max-w-[440px] text-center space-y-8 animate-fade-in">
          <div className="relative inline-flex">
            <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute top-0 w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-indigo-500" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Menunggu Konfirmasi</h2>
            <p className="text-slate-400 font-medium">Kami telah mengirimkan *Tombol Persetujuan* ke WhatsApp Admin.</p>
            <div className="bg-indigo-500/10 border border-white/5 p-4 rounded-2xl">
               <p className="text-indigo-400 text-xs font-black uppercase tracking-widest">Klik "APPROVE" pada Poll WhatsApp</p>
            </div>
          </div>
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl flex items-center justify-center gap-2 text-indigo-400 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sinkronisasi Keamanan...</span>
          </div>
          <button onClick={() => { setIsWaitingApproval(false); setLoading(false); }} className="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">Batalkan</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b0d15] font-['Inter'] p-6">
      <Toaster position="top-right" />
      <div className="w-full max-w-[440px] space-y-10 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <ShieldCheck className="w-10 h-10 text-indigo-500" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">AcquisitionAI</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Direct Access Portal</p>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Username</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-5 bg-white/[0.03] border-b-2 border-white/5 focus:border-indigo-500 transition-all outline-none text-xl font-bold text-white placeholder:text-slate-700"
                    placeholder="Enter Username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Security Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-5 bg-white/[0.03] border-b-2 border-white/5 focus:border-indigo-500 transition-all outline-none text-xl font-bold text-white placeholder:text-slate-700"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN TO DASHBOARD"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
