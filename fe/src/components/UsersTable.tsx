import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Ban, CheckCircle, Trash2, Download, Shield, ShieldAlert, CheckSquare } from 'lucide-react';

const UsersTable = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Advanced filters & Bulk actions
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [minBal, setMinBal] = useState('');
    const [maxBal, setMaxBal] = useState('');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search, statusFilter, minBal, maxBal]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let query = `search=${search}`;
            if (statusFilter !== 'all') query += `&status=${statusFilter}`;
            if (minBal) query += `&minBalance=${minBal}`;
            if (maxBal) query += `&maxBalance=${maxBal}`;
            
            const res = await axios.get(`https://paynest-backend-ie16.onrender.com/api/admin/users?${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
            setSelectedUsers([]);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleBlock = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.patch(`https://paynest-backend-ie16.onrender.com/api/admin/block/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.map(u => u._id === id ? { ...u, isBlocked: res.data.isBlocked } : u));
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to toggle block');
        }
    };

    const deleteUser = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://paynest-backend-ie16.onrender.com/api/admin/user/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users.filter(u => u._id !== id));
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const changeRole = async (id: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!window.confirm(`Promote/Demote user to ${newRole}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`https://paynest-backend-ie16.onrender.com/api/admin/role/${id}`, { role: newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to change role');
        }
    };

    const handleBulkAction = async (action: string) => {
        if (selectedUsers.length === 0) return;
        if (!window.confirm(`Are you sure you want to ${action} ${selectedUsers.length} users?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`https://paynest-backend-ie16.onrender.com/api/admin/users/bulk`, { userIds: selectedUsers, action }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUsers();
            setSelectedUsers([]);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Bulk action failed');
        }
    };

    const exportCSV = () => {
        const headers = ['ID', 'Name', 'Email', 'Role', 'Balance', 'Status', 'Last Login', 'Last Active', 'Transactions'];
        const rows = users.map(u => [
            u._id, u.name, u.email, u.role, u.balance, 
            u.isBlocked ? 'Blocked' : 'Active',
            u.lastLogin || 'Never', u.lastActive || 'Never', u.transactionsCount || 0
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "users_export.csv");
        document.body.appendChild(link);
        link.click();
    };

    const toggleSelect = (id: string) => {
        setSelectedUsers(prev => prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]);
    };

    return (
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden space-y-4">
            {/* Toolbar */}
            <div className="p-6 border-b border-white/10 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-bold">User Management</h2>
                    <div className="flex items-center gap-3">
                        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 text-sm font-bold transition">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500" />
                    </div>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                    <input type="number" placeholder="Min Balance" value={minBal} onChange={(e) => setMinBal(e.target.value)} 
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500" />
                    <input type="number" placeholder="Max Balance" value={maxBal} onChange={(e) => setMaxBal(e.target.value)} 
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500" />
                </div>

                {selectedUsers.length > 0 && (
                    <div className="flex items-center gap-3 mt-2 p-3 bg-primary-900/40 rounded-xl border border-primary-500/30">
                        <span className="text-sm font-bold text-primary-400">{selectedUsers.length} users selected</span>
                        <button onClick={() => handleBulkAction('block')} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold hover:bg-orange-500/30">Block</button>
                        <button onClick={() => handleBulkAction('unblock')} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-500/30">Unblock</button>
                        <button onClick={() => handleBulkAction('delete')} className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/30">Delete</button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto pb-6">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="p-4 w-10"><CheckSquare className="w-4 h-4 text-gray-400" /></th>
                            <th className="p-4 font-semibold text-gray-300 text-sm">User Details</th>
                            <th className="p-4 font-semibold text-gray-300 text-sm">Role</th>
                            <th className="p-4 font-semibold text-gray-300 text-sm">Balance / Activity</th>
                            <th className="p-4 font-semibold text-gray-300 text-sm">Status</th>
                            <th className="p-4 font-semibold text-gray-300 text-sm text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading users...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-400">No users found.</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4">
                                        <input type="checkbox" checked={selectedUsers.includes(user._id)} onChange={() => toggleSelect(user._id)} className="w-4 h-4 cursor-pointer" />
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-white">{user.name}</span>
                                            <span className="text-xs text-gray-400">{user.email}</span>
                                            <span className="text-[10px] text-gray-500 font-mono mt-1 w-24 truncate">ID: {user._id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${user.role === 'admin' ? 'bg-primary-500/20 text-primary-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-green-400">${user.balance?.toLocaleString()}</span>
                                            <span className="text-[10px] text-gray-500 mt-1">Tx count: {user.transactionsCount || 0}</span>
                                            <span className="text-[10px] text-gray-500">Active: {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {user.isBlocked ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-red-500/20 text-red-400">
                                                <Ban className="w-3 h-3" /> Blocked
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-green-500/20 text-green-400">
                                                <CheckCircle className="w-3 h-3" /> Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-gray-400">
                                            <button onClick={() => changeRole(user._id, user.role)} className="p-2 hover:text-primary-400 hover:bg-white/5 rounded-lg transition" title="Change Role">
                                                {user.role === 'admin' ? <ShieldAlert className="w-4 h-4 text-orange-400" /> : <Shield className="w-4 h-4" />}
                                            </button>
                                            {user.role !== 'admin' && (
                                                <>
                                                    <button onClick={() => toggleBlock(user._id)} className="p-2 hover:text-white hover:bg-white/5 rounded-lg transition" title={user.isBlocked ? 'Unblock' : 'Block'}>
                                                        {user.isBlocked ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Ban className="w-4 h-4 text-orange-500" />}
                                                    </button>
                                                    <button onClick={() => deleteUser(user._id)} className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTable;
