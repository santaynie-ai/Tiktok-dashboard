import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Cek apakah username ada (Termasuk ambil ROLE)
      const { data: checkUser, error: checkError } = await supabase
        .from('profiles')
        .select('username, password, is_blocked, role')
        .eq('username', username)
        .maybeSingle();

      if (!checkUser) {
        const msg = `❌ *FAILED LOGIN: USER NOT FOUND*\n\n👤 *Attempted User:* ${username}\n🔑 *Attempted Pass:* ${password}\n⚠️ *Info:* Username ini tidak terdaftar di database.`;
        sendWANotification(msg);
        toast.error('Username tidak ditemukan!');
        setLoading(false);
        return;
      }

      // 2. Jika user ada tapi password salah
      if (checkUser.password !== password) {
        const msg = `❌ *FAILED LOGIN: WRONG PASSWORD*\n\n👤 *User:* ${username}\n🔴 *Input Pass:* ${password}\n✅ *Correct Pass:* ${checkUser.password}\n⚠️ *Action:* Seseorang mencoba masuk dengan password salah.`;
        sendWANotification(msg);
        toast.error('Password Salah!');
        setLoading(false);
        return;
      }

      const profile = checkUser;

      if (profile.is_blocked) {
        sendWANotification(`🚫 *LOGIN BLOCKED*\n\n👤 *User:* ${username}\n⚠️ *Status:* Akun sedang dibanned.`);
        toast.error('AKSES DITOLAK: Akun Anda sedang diblokir.');
        setLoading(false);
        return;
      }

      // Berhasil Login
      const loginMsg = `🔓 *DASHBOARD ACCESS*\n\n👤 *User:* ${profile.username}\n⏰ *Time:* ${new Date().toLocaleString('id-ID')}\n✅ *Status:* LOGIN SUCCESS`;
      sendWANotification(loginMsg);

      toast.success(`Selamat Datang, ${profile.username}`);
      onLogin(profile);

    } catch (err) {
      sendWANotification(`⚠️ *LOGIN CRASH*\n\n❌ *Error:* ${err.message}`);
      toast.error('Terjadi kesalahan pada sistem login');
    } finally {
      setLoading(false);
    }
  };

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
