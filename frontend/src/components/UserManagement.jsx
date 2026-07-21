import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, Trash2, Edit2, Lock, Unlock, X, ShieldAlert, Globe, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    can_view_tiktok: true,
    can_view_instagram: false,
    can_view_twitter: false
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await supabase.from('profiles').update(formData).eq('id', editingUser.id);
        toast.success('User updated successfully');
      } else {
        await supabase.from('profiles').insert([formData]);
        toast.success('User created successfully');
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'user', can_view_tiktok: true, can_view_instagram: false, can_view_twitter: false });
  };

  const toggleBlock = async (user) => {
    await supabase.from('profiles').update({ is_blocked: !user.is_blocked }).eq('id', user.id);
    toast.success(user.is_blocked ? 'User unblocked' : 'User blocked');
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (window.confirm('Delete user?')) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchUsers();
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 space-y-10 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#12141d] p-8 rounded-[2rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <ShieldAlert className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Security Protocol</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage Operative Access</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
          >
            <UserPlus className="w-5 h-5" /> Add New Operative
          </button>
        )}
      </div>

      {/* Inline Form - Integrated directly in the page */}
      {showForm && (
        <div className="bg-[#161922] border border-indigo-500/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <button onClick={resetForm} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-500"><X className="w-5 h-5" /></button>
          </div>

          <div className="mb-10">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">{editingUser ? 'Update Profile' : 'Initiate New Agent'}</h3>
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">Configure System Authorization</p>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Column 1: Credentials */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operative ID</label>
                <input type="text" placeholder="Username" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-white transition-all" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Hash</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full bg-white/5 border border-white/5 p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-white transition-all"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Column 2: Level & Stream */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Auth Level</label>
                <select className="w-full bg-slate-900 border border-white/5 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-white appearance-none cursor-pointer" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="user">Standard Agent</option>
                  <option value="admin">Master Administrator</option>
                </select>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest ml-1">Stream Access Control</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'can_view_tiktok', label: 'TikTok', color: 'emerald' },
                    { key: 'can_view_instagram', label: 'Instagram', color: 'rose' },
                    { key: 'can_view_twitter', label: 'Twitter', color: 'blue' }
                  ].map(p => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setFormData({...formData, [p.key]: !formData[p.key]})}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${formData[p.key] ? 'bg-indigo-500/10 border-indigo-500/40 text-white' : 'bg-transparent border-white/5 text-slate-600'}`}
                    >
                      <Globe className={`w-4 h-4 ${formData[p.key] ? `text-${p.color}-500` : 'text-slate-700'}`} />
                      <span className="text-[8px] font-black uppercase tracking-tighter">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 3: Actions */}
            <div className="flex flex-col justify-end gap-3 pb-1">
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 p-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
                {editingUser ? 'Confirm Update' : 'Initialize Agent'}
              </button>
              <button type="button" onClick={resetForm} className="w-full bg-white/5 hover:bg-white/10 p-5 rounded-2xl font-black uppercase text-[10px] text-slate-500 transition-all">
                Abort Protocol
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List Table */}
      <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#12141d] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161922] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">ID Codename</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Privilege</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Data Streams</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center">Protocol</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.id} className={`hover:bg-white/[0.01] transition-colors ${editingUser?.id === u.id ? 'bg-indigo-500/5' : ''}`}>
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-indigo-400 border border-white/5">
                        {u.username.substring(0,2).toUpperCase()}
                      </div>
                      <span className="font-bold text-white text-lg tracking-tight">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-500'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-7 text-center">
                    <div className="flex justify-center gap-2">
                      <div className={`p-2 rounded-lg ${u.can_view_tiktok ? 'bg-emerald-500/10 text-emerald-500' : 'text-slate-800 opacity-20'}`}><Globe className="w-4 h-4" /></div>
                      <div className={`p-2 rounded-lg ${u.can_view_instagram ? 'bg-rose-500/10 text-rose-500' : 'text-slate-800 opacity-20'}`}><Globe className="w-4 h-4" /></div>
                      <div className={`p-2 rounded-lg ${u.can_view_twitter ? 'bg-blue-500/10 text-blue-500' : 'text-slate-800 opacity-20'}`}><Globe className="w-4 h-4" /></div>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.is_blocked ? 'text-rose-500 bg-rose-500/5 border border-rose-500/20' : 'text-emerald-500 bg-emerald-500/5 border border-emerald-500/20'}`}>
                      {u.is_blocked ? 'Denied' : 'Granted'}
                    </span>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingUser(u); setFormData(u); setShowForm(true); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-slate-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => toggleBlock(u)} className={`p-3 rounded-2xl border transition-all ${u.is_blocked ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                        {u.is_blocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteUser(u.id)} className="p-3 bg-rose-500/5 hover:bg-rose-500/20 text-rose-500 rounded-2xl transition-all border border-rose-500/10"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
