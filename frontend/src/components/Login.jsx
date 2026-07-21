import React, { useState } from 'react';
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

  const sendWANotification = (msg) => {
    try {
      const waUrl = import.meta.env.VITE_WA_API_URL;
      const waId = import.meta.env.VITE_WA_INSTANCE_ID;
      const waToken = import.meta.env.VITE_WA_API_TOKEN;
      const waGroup = import.meta.env.VITE_WA_GROUP_ID;

      if (waUrl && waId && waToken && waGroup) {
        fetch(`${waUrl}/waInstance${waId}/sendMessage/${waToken}`, {
          method: 'POST',
          body: JSON.stringify({ chatId: waGroup, message: msg }),
          headers: { 'Content-Type': 'application/json' }
        }).catch(() => {});
      }
    } catch (e) {}
  };

  const pollApprovalStatus = async (rid, profile) => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('login_requests')
        .select('status')
        .eq('id', rid)
        .maybeSingle();

      if (data?.status === 'approved') {
        clearInterval(interval);
        toast.success(`Akses Disetujui! Selamat Datang, ${profile.username}`);
        onLogin(profile);
      } else if (data?.status === 'rejected') {
        clearInterval(interval);
        setIsWaitingApproval(false);
        setLoading(false);
        toast.error('Akses Ditolak oleh Admin Utama.');
      }
    }, 3000);

    setTimeout(() => {
      clearInterval(interval);
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
        sendWANotification(`❌ *FAILED LOGIN: USER NOT FOUND*\n\n👤 *Attempted User:* ${username}\n🔑 *Attempted Pass:* ${password}`);
        toast.error('Username tidak ditemukan!');
        setLoading(false);
        return;
      }

      if (checkUser.password !== password) {
        sendWANotification(`❌ *FAILED LOGIN: WRONG PASSWORD*\n\n👤 *User:* ${username}\n🔴 *Input Pass:* ${password}\n✅ *Correct Pass:* ${checkUser.password}`);
        toast.error('Password Salah!');
        setLoading(false);
        return;
      }

      const profile = checkUser;

      if (profile.is_blocked) {
        sendWANotification(`🚫 *LOGIN BLOCKED*\n\n👤 *User:* ${username}`);
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

        const msg = `🛡️ *ADMIN LOGIN APPROVAL*\n\n👤 *User:* ${profile.username}\n⏰ *Time:* ${new Date().toLocaleString('id-ID')}\n\n⚠️ *Action:* Seseorang mencoba masuk sebagai Admin. Silakan setujui di Database untuk mengizinkan akses.`;
        sendWANotification(msg);
        pollApprovalStatus(request.id, profile);
      } else {
        const loginMsg = `🔓 *USER ACCESS*\n\n👤 *User:* ${profile.username}\n⏰ *Time:* ${new Date().toLocaleString('id-ID')}\n✅ *Status:* LOGIN SUCCESS`;
        sendWANotification(loginMsg);
        toast.success(`Selamat Datang, ${profile.username}`);
        onLogin(profile);
      }

    } catch (err) {
      sendWANotification(`⚠️ *LOGIN CRASH*\n\n❌ *Error:* ${err.message}`);
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
            <p className="text-slate-400 font-medium">Permintaan login Admin telah dikirim ke WA.<br/><span className="text-indigo-400 font-bold">Setujui di Database untuk melanjutkan.</span></p>
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
