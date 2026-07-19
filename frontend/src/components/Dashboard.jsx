import React, { useState, useEffect } from 'react';
import SellerTable from './SellerTable';
import { supabase } from '../lib/supabase';
import { LogOut, TrendingUp, Users, Video, Heart, LayoutDashboard, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function Dashboard() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    viral: 0,
    avgEngagement: 0,
  });

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .order('followers_count', { ascending: false });

      if (error) throw error;

      setSellers(data || []);

      if (data) {
        const viral = data.filter(s => s.is_viral).length;
        const avgEng = data.reduce((acc, s) => acc + (s.engagement_rate || 0), 0) / data.length || 0;
        setStats({
          total: data.length,
          viral,
          avgEngagement: avgEng,
        });
      }
    } catch (error) {
      toast.error('Failed to load sellers');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('demo_mode'); // Hapus status demo
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <Toaster position="top-right" />

      {/* Navigation */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                TikTok Dashboard
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchSellers}
                disabled={refreshing}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Seller Insights</h1>
          <p className="text-slate-500 mt-1 font-medium text-lg">UMKM performance analytics and trend monitoring</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Sellers', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', shadow: 'shadow-blue-500/10' },
            { label: 'Viral Trends', value: stats.viral, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', shadow: 'shadow-emerald-500/10' },
            { label: 'Avg Engagement', value: `${stats.avgEngagement.toFixed(2)}%`, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', shadow: 'shadow-rose-500/10' },
          ].map((stat, idx) => (
            <div key={idx} className={`card hover:shadow-xl transition-shadow duration-300 border-none ring-1 ring-slate-200/60 ${stat.shadow}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-4 ${stat.bg} rounded-2xl`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="card border-none ring-1 ring-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden">
          <div className="flex items-center justify-between mb-6 px-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Leaderboard</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Ranked by follower count and engagement</p>
            </div>
          </div>
          <SellerTable sellers={sellers} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;