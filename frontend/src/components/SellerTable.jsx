import React, { useState } from 'react';
import {
  ExternalLink, TrendingUp, Flame, Star,
  ChevronDown, ChevronUp, MapPin, Phone,
  Music2, CheckCircle2, MoreHorizontal
} from 'lucide-react';

function SellerTable({ sellers, loading }) {
  const [expandedId, setExpandedId] = useState(null);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-6 glass-card border-none">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/5 rounded-full"></div>
          <div className="absolute top-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Menghubungkan ke Sistem AI...</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#12141d]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#161922] border-b border-white/5">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">#</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Nama Seller</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Nomor HP</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Kategori</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Wilayah</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Potensi Score</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Alasan Potensial</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sellers.map((seller, index) => (
              <React.Fragment key={seller.id}>
                <tr
                  onClick={() => setExpandedId(expandedId === seller.id ? null : seller.id)}
                  className={`group cursor-pointer transition-all duration-300 hover:bg-white/[0.02] ${expandedId === seller.id ? 'bg-indigo-500/[0.03]' : ''}`}
                >
                  <td className="px-8 py-10 align-top">
                    <span className="text-sm font-black text-slate-700">{(index + 1).toString().padStart(2, '0')}</span>
                  </td>

                  <td className="px-8 py-10 align-top min-w-[350px]">
                    <div className="flex gap-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black italic tracking-tighter">@{seller.username}</span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase rounded-lg">Verified</span>
                          {seller.is_viral && (
                            <div className="bg-rose-500 p-1 rounded-lg shadow-lg shadow-rose-500/30 ml-1">
                              <Flame className="w-3 h-3 text-white fill-current" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {seller.is_trending && (
                            <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-rose-600 rounded-lg flex items-center gap-1.5 shadow-lg shadow-rose-500/20">
                              <TrendingUp className="w-3 h-3 text-white" />
                              <span className="text-[10px] font-black uppercase text-white">Trending</span>
                            </div>
                          )}
                          <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg flex items-center gap-1.5">
                            <Music2 className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] font-black uppercase text-slate-400">TikTok</span>
                          </div>
                        </div>

                        <div className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                          TikTok Platform · <span className="text-indigo-400">{seller.followers_count?.toLocaleString() || 0} followers</span> · ER: <span className="text-emerald-400">{seller.engagement_rate || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-10 align-top">
                    <div className="flex items-center gap-2 group/phone">
                      <div className="p-2 bg-slate-900 rounded-lg group-hover/phone:bg-indigo-500/10 transition-colors">
                        <Phone className="w-4 h-4 text-slate-600 group-hover/phone:text-indigo-500" />
                      </div>
                      <span className="text-sm font-bold tracking-widest text-slate-400 group-hover/phone:text-slate-200">
                        {seller.phone_number || 'N/A'}
                      </span>
                    </div>
                  </td>

                  <td className="px-8 py-10 align-top">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{seller.category || 'General'}</span>
                    </div>
                  </td>

                  <td className="px-8 py-10 align-top">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-black text-slate-300 italic uppercase tracking-tight">{seller.city || '-'}</div>
                    </div>
                  </td>

                  <td className="px-8 py-10 align-top min-w-[200px]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                          style={{ width: `${seller.potential_score || 0}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                        <span className="text-2xl font-black italic tracking-tighter text-indigo-400">{seller.potential_score || 0}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-10 align-top max-w-[300px]">
                    <p className="text-xs font-medium text-slate-500 leading-relaxed italic">
                      "{seller.potential_reason || 'No analysis available'}"
                    </p>
                  </td>
                </tr>

                {expandedId === seller.id && (
                  <tr className="bg-indigo-500/[0.02]">
                    <td colSpan="7" className="px-12 py-12">
                      <div className="glass-card p-10 flex flex-col gap-10">
                        <div className="flex flex-wrap gap-12 border-b border-white/5 pb-10">
                          <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Buka Profil Sosmed</span>
                            <div className="flex gap-4">
                              <a
                                href={seller.tiktok_url || `https://www.tiktok.com/@${seller.username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-6 py-3 bg-slate-900 border border-white/5 rounded-2xl hover:bg-slate-800 transition-all group"
                              >
                                <Music2 className="w-5 h-5 text-slate-500 group-hover:text-white" />
                                <span className="text-sm font-bold text-slate-400 group-hover:text-white">TikTok <span className="text-slate-600">@{seller.username}</span></span>
                                <ExternalLink className="w-4 h-4 text-slate-700" />
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
                          <StatItem label="Followers" value={seller.followers_count?.toLocaleString()} />
                          <StatItem label="Engagement" value={`${seller.engagement_rate}%`} color="text-emerald-500" />
                          <StatItem label="Potensi Score" value={`${seller.potential_score}/100`} color="text-indigo-400" />
                          <StatItem label="Total Video" value={seller.video_count?.toLocaleString()} />
                          <StatItem label="Tgl Update" value={new Date(seller.last_scraped).toLocaleDateString()} />

                          <StatItem label="Kota/Kab" value={seller.city} color="text-amber-500" />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatItem({ label, value, color = "text-white" }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</span>
      <span className={`text-sm font-black uppercase ${color}`}>{value}</span>
    </div>
  );
}

export default SellerTable;
