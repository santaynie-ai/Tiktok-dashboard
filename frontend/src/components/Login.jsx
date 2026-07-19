import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, User, Lock, ShieldCheck, TrendingUp, BarChart3, ArrowRight, CheckCircle2, Users, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // [DEMO BYPASS] Cek jika menggunakan kredensial demo
    if (username === 'admin' && password === 'admin123') {
      toast.success('Demo Login Successful!');
      localStorage.setItem('demo_mode', 'true'); // Simpan status demo agar tidak logout saat refresh
      onLogin(true);
      setLoading(false);
      return;
    }

    try {
      const email = `${username}@dashboard.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Jika error konfirmasi email, berikan instruksi atau bypass jika itu akun admin
        if (error.message.includes('Email not confirmed')) {
           toast.error('Please confirm your email or use Demo Credentials.');
           setLoading(false);
           return;
        }

        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });

          if (signUpError) {
            throw new Error('Login failed. Please check your credentials.');
          }

          toast.success('Account created! Please login again.');
          setLoading(false);
          return;
        }
        throw error;
      }

      if (data.user) {
        toast.success('Login successful!');
        onLogin(true);
      }
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-white font-['Inter']">
      <Toaster position="top-right" />

      {/* Left Section: Immersive Branding (Laptop Only) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] bg-[#0f172a] relative overflow-hidden flex-col p-12 xl:p-16 justify-between">
        {/* Animated background elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter italic uppercase">TikTok Analytics</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] mb-8 tracking-tight">
            Elevate your <br/>
            <span className="text-blue-500 text-glow">Business Strategy.</span>
          </h1>

          <div className="space-y-6 mt-12">
            {[
              "Real-time Seller Performance Tracking",
              "Viral Content Trend Analysis",
              "Deep Engagement Metrics for UMKM",
              "Automated Market Insights"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-300 group">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-lg font-medium tracking-wide">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Improved Social Proof Section */}
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center gap-5">
              {/* Profile/User Icons Group */}
              <div className="flex -space-x-4">
                {[
                  "https://ui-avatars.com/api/?name=User+1&background=0D8ABC&color=fff",
                  "https://ui-avatars.com/api/?name=User+2&background=2563EB&color=fff",
                  "https://ui-avatars.com/api/?name=User+3&background=4F46E5&color=fff",
                  "https://ui-avatars.com/api/?name=User+4&background=7C3AED&color=fff"
                ].map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    className="w-12 h-12 rounded-full border-4 border-[#0f172a] shadow-lg shadow-black/20"
                    alt="user"
                  />
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-[#0f172a] bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-black/20">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-white text-xl font-bold tracking-tight">+500 local sellers</span>
                <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">Joined today</span>
              </div>
            </div>

            <div className="mt-6 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 w-[78%] rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Form (Full Height, reaches corners) */}
      <div className="w-full lg:w-[55%] xl:w-[58%] min-h-screen flex flex-col bg-white">
        {/* Mobile Header (Hidden on laptop) */}
        <div className="lg:hidden p-6 flex justify-between items-center bg-slate-50 border-b border-slate-100">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight">TikTok Analytics</span>
           </div>
           <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">v1.2</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 md:p-20 lg:p-16 xl:p-24">
          <div className="w-full max-w-[460px]">
            <div className="mb-14">
              <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">Welcome.</h2>
              <p className="text-slate-500 text-xl font-medium leading-relaxed">Login to access your high-performance analytics dashboard.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Account Username</label>
                <div className="relative group">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <User className="w-6 h-6" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-5 bg-transparent border-b-2 border-slate-100 focus:border-blue-600 transition-all outline-none text-2xl font-bold text-slate-900 placeholder:text-slate-200"
                    placeholder="admin"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Secure Password</label>
                <div className="relative group">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <Lock className="w-6 h-6" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-5 bg-transparent border-b-2 border-slate-100 focus:border-blue-600 transition-all outline-none text-2xl font-bold text-slate-900 placeholder:text-slate-200"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all duration-300 shadow-2xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="text-lg uppercase tracking-wider">Start Analytics</span>
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-16 p-8 bg-slate-50 rounded-[3rem] border border-slate-100 relative overflow-hidden group hover:border-blue-200 transition-colors">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <div className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-500 mb-5">Access Keys</div>
                <div className="flex flex-col sm:flex-row gap-8">
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master User</div>
                    <div className="text-xl font-black text-slate-800">admin</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Code</div>
                    <div className="text-xl font-black text-slate-800">admin123</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-20 flex flex-col sm:flex-row justify-between items-center gap-6 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-t border-slate-100 pt-10">
              <span className="text-slate-300">TikTok Dashboard System &copy; {new Date().getFullYear()}</span>
              <div className="flex gap-8">
                <a href="#" className="hover:text-blue-600 transition-colors">Security</a>
                <a href="#" className="hover:text-blue-600 transition-colors">Protocol</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;