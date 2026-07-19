import React, { useState, useMemo } from 'react';
import { ExternalLink, TrendingUp, Flame, Star, ArrowUpDown, ChevronLeft, ChevronRight, User } from 'lucide-react';

function SellerTable({ sellers, loading }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('followers_count');
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 10;

  const sortedSellers = useMemo(() => {
    const sorted = [...sellers];
    sorted.sort((a, b) => {
      const aVal = a[sortField] || 0;
      const bVal = b[sortField] || 0;
      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [sellers, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedSellers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSellers = sortedSellers.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getViralBadge = (seller) => {
    if (!seller.is_viral) return null;
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full ring-1 ring-orange-200/50">
        <Flame className="w-3.5 h-3.5 fill-current" />
        <span className="text-xs font-bold uppercase tracking-wider">Viral</span>
      </div>
    );
  };

  const getEngagementColor = (rate) => {
    if (!rate) return 'text-slate-400';
    if (rate > 5) return 'text-emerald-600 bg-emerald-50';
    if (rate > 2) return 'text-blue-600 bg-blue-50';
    return 'text-amber-600 bg-amber-50';
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute top-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-slate-500 font-medium animate-pulse">Syncing seller data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="-mx-6 -mb-6 overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Seller Profile</th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors group"
                  onClick={() => handleSort('followers_count')}
                >
                  <div className="flex items-center gap-1.5">
                    Followers
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-opacity ${sortField === 'followers_count' ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`} />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors group"
                  onClick={() => handleSort('engagement_rate')}
                >
                  <div className="flex items-center gap-1.5">
                    Engagement
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-opacity ${sortField === 'engagement_rate' ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`} />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {currentSellers.map((seller, index) => (
                <tr
                  key={seller.id}
                  className="group hover:bg-slate-50/80 transition-all duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                      {startIndex + index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={seller.avatar_url || `https://ui-avatars.com/api/?name=${seller.display_name || seller.username}&background=f1f5f9&color=64748b&bold=true`}
                          alt={seller.display_name}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${seller.display_name || seller.username}&background=f1f5f9&color=64748b&bold=true`;
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                           <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {seller.display_name || seller.username}
                        </div>
                        <div className="text-xs font-medium text-slate-500">@{seller.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-700">
                      {seller.followers_count?.toLocaleString() || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getEngagementColor(seller.engagement_rate)}`}>
                      {seller.engagement_rate ? `${seller.engagement_rate.toFixed(2)}%` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {getViralBadge(seller)}
                      {seller.is_viral && seller.viral_reason && (
                        <div className="group/tooltip relative">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl">
                            {seller.viral_reason}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <a
                      href={seller.tiktok_url || `https://www.tiktok.com/@${seller.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 text-slate-600 text-xs font-bold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{startIndex + 1}</span> to <span className="text-slate-900">{Math.min(startIndex + itemsPerPage, sortedSellers.length)}</span> of <span className="text-slate-900">{sortedSellers.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      ) : (
         currentSellers.length === 0 && (
          <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 mt-6">
            <div className="inline-flex p-4 bg-white rounded-2xl shadow-sm mb-4">
              <User className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No sellers found</h3>
            <p className="text-slate-500 mt-1 max-w-xs mx-auto">Start by running the scraper to populate your dashboard with seller analytics.</p>
          </div>
        )
      )}
    </div>
  );
}

export default SellerTable;