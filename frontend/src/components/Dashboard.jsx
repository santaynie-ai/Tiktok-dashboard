import React, { useState, useEffect } from 'react';
import SellerTable from './SellerTable';
import UserManagement from './UserManagement';
import { supabase } from '../lib/supabase';
import {
  LogOut, TrendingUp, Users, RefreshCw, Search, Square
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('data');
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('potential_score');

  const CATEGORIES = [
    "Kuliner", "Fashion", "Beauty", "Skincare",
    "Gadget", "Elektronik", "Home Living", "Jasa"
  ];
  const [engineStatus, setEngineStatus] = useState('offline');
  const [activeScraping, setActiveScraping] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedScrapeCategory, setSelectedScrapeCategory] = useState('General');

  useEffect(() => {
    fetchSellers();
    checkEngine();
    checkActiveTasks(); // Cek tugas aktif saat load/refresh
    const interval = setInterval(() => {
      checkEngine();
      checkActiveTasks();
    }, 15000);

    const channel = supabase.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sellers' }, () => fetchSellers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'search_queries' }, (p) => {
        if (p.new.status === 'processing' || p.new.status === 'pending') {
          setActiveScraping(p.new.query);
          setIsProcessing(true);
        } else {
          setActiveScraping(null);
          setIsProcessing(false);
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const checkEngine = async () => {
    try {
      const { data } = await supabase.from('system_status').select('last_seen').eq('id', 'main_engine').single();
      if (data) {
        const diff = (new Date() - new Date(data.last_seen)) / 1000;
        setEngineStatus(diff < 60 ? 'online' : 'offline');
      }
    } catch (e) { setEngineStatus('offline'); }
  };

  const checkActiveTasks = async () => {
    const { data } = await supabase
      .from('search_queries')
      .select('query, status')
      .in('status', ['pending', 'processing'])
      .limit(1)
      .maybeSingle();

    if (data) {
      setActiveScraping(data.query);
      setIsProcessing(true);
    } else {
      setActiveScraping(null);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let result = [...sellers];
    if (user.role !== 'admin') {
      result = result.filter(s => {
        if (s.platform === 'tiktok' && !user.can_view_tiktok) return false;
        if (s.platform === 'instagram' && !user.can_view_instagram) return false;
        if (s.platform === 'twitter' && !user.can_view_twitter) return false;
        return true;
      });
    }
    if (platformFilter !== 'all') result = result.filter(s => s.platform === platformFilter);
    if (categoryFilter !== 'all') result = result.filter(s => s.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.username.toLowerCase().includes(q) || (s.display_name && s.display_name.toLowerCase().includes(q)));
    }
    result.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
    setFilteredSellers(result);
  }, [searchQuery, platformFilter, sortBy, sellers, user]);

  const fetchSellers = async () => {
    const { data } = await supabase.from('sellers').select('*').limit(100).order('created_at', { ascending: false });
    if (data) setSellers(data);
    setLoading(false);
  };

  const handleScrape = async () => {
    if (!searchQuery.trim()) {
      toast.error('Masukkan kata kunci pencarian dahulu!');
      return;
    }
    const clean = searchQuery.trim().replace('@', '');
    const { error } = await supabase.from('search_queries').upsert({ query: clean, status: 'pending' }, { onConflict: 'query' });
    if (!error) {
      toast.success(`Task @${clean} dikirim ke Cloud`);
      setIsProcessing(true);
      setActiveScraping(clean);
    }
  };

  const handleStop = async () => {
    if (!activeScraping) return;
    const { error } = await supabase
      .from('search_queries')
      .update({ status: 'cancelled' })
      .eq('query', activeScraping);

    if (!error) {
      toast('Engine diberhentikan', { icon: '🛑' });
      setIsProcessing(false);
      setActiveScraping(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d15] text-white font-['Inter']">
      <Toaster position="top-right" />

      <nav className="border-b border-white/5 bg-[#0b0d15]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl"><Users className="w-6 h-6 text-white" /></div>
              <span className="text-xl font-black tracking-tighter uppercase italic">AcquisitionAI</span>
            </div>
            <div className="hidden md:flex bg-white/5 p-1 rounded-2xl border border-white/5">
              <button onClick={() => setActiveTab('data')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'data' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>Data Dashboard</button>
              {user.role === 'admin' && (
                <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}>Manage Users</button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-white/5 rounded-xl">
              <div className={`w-1.5 h-1.5 rounded-full ${engineStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
              <span className="text-[10px] font-black uppercase text-slate-400">@{user.username} ({user.role})</span>
            </div>
            <button onClick={onLogout} className="p-2.5 text-slate-500 hover:text-rose-500 transition-colors"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 pt-24 pb-12">
        {activeTab === 'users' ? (
          <UserManagement />
        ) : (
          <>
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-3 rounded-2xl"><TrendingUp className="w-8 h-8 text-white" /></div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">Intelligence Dashboard</h1>
              </div>
              <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <select
                  className="bg-[#161922] border border-white/5 rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-400"
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Semua Kategori</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="relative flex-1 lg:min-w-[300px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    className="w-full bg-[#161922] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                {isProcessing ? (
                  <button onClick={handleStop} className="bg-rose-600 hover:bg-rose-500 px-8 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20">
                    <Square className="w-4 h-4 fill-current" /> STOP
                  </button>
                ) : (
                  <button onClick={handleScrape} className="bg-indigo-600 hover:bg-indigo-500 px-8 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20">Scrape</button>
                )}
              </div>
            </div>

            {isProcessing && activeScraping && (
              <div className="mb-8 p-6 bg-indigo-600/20 border border-indigo-500/30 rounded-3xl flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                  <div>
                    <span className="font-black uppercase italic tracking-tight text-white block">Engine is scanning: @{activeScraping}</span>
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Do not close this page for best performance</span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase text-indigo-400 animate-pulse">Running AI Agent</div>
              </div>
            )}

            <SellerTable sellers={filteredSellers} loading={loading} />
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
