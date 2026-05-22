import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';
import { Users, DollarSign, Activity, LogOut, ArrowLeft, Bell, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UsersTable from '../components/UsersTable';
import TransactionsTable from '../components/TransactionsTable';

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [liveFeed, setLiveFeed] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();

        const socket = io('https://paynest-backend-ie16.onrender.com');
        socket.on('connect', () => {
            socket.emit('register', 'admin_room');
        });
        
        socket.on('new_transaction', (data: any) => {
            setLiveFeed(prev => [{
                id: Date.now(),
                type: 'transaction',
                message: `$${data.amount?.toLocaleString()} ${data.isSuspicious ? 'suspicious transfer' : 'transferred'} by ${data.sender}`,
                isSuspicious: data.isSuspicious,
                time: new Date()
            }, ...prev].slice(0, 50));
        });

        socket.on('new_user', (data: any) => {
            setLiveFeed(prev => [{
                id: Date.now(),
                type: 'user',
                message: `New registration: ${data.name}`,
                isSuspicious: false,
                time: new Date()
            }, ...prev].slice(0, 50));
        });

        return () => { socket.close(); };
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('https://paynest-backend-ie16.onrender.com/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!stats) {
        return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading Admin Dashboard...</div>;
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black flex items-center gap-3">
                            <div className="bg-primary-600 p-2 rounded-xl">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                            Admin <span className="text-primary-500">Panel</span>
                        </h1>
                        <p className="text-gray-400 mt-2">Manage users, monitor transactions, and view analytics.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition">
                            <ArrowLeft className="w-4 h-4" /> User App
                        </button>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition">
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10 pb-4">
                    {['overview', 'users', 'transactions'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl font-bold transition-all capitalize ${
                                activeTab === tab ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                            <Users className="w-6 h-6 text-primary-400" />
                                        </div>
                                        <h3 className="text-gray-400 font-medium">Total Users</h3>
                                    </div>
                                    <p className="text-4xl font-black">{stats.totalUsers}</p>
                                </div>
                                <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                            <Activity className="w-6 h-6 text-green-400" />
                                        </div>
                                        <h3 className="text-gray-400 font-medium">Total Transactions</h3>
                                    </div>
                                    <p className="text-4xl font-black">{stats.totalTransactions}</p>
                                </div>
                                <div className="glass-card p-6 rounded-3xl border border-white/10 relative overflow-hidden group">
                                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                            <DollarSign className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h3 className="text-gray-400 font-medium">Total Money Flow</h3>
                                    </div>
                                    <p className="text-4xl font-black">${stats.totalMoneyFlow?.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Live Feed & Charts */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Live Feed panel (takes 1 col) */}
                                <div className="glass-card p-6 rounded-3xl border border-white/10 flex flex-col h-[26rem] xl:col-span-1">
                                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Bell className="w-5 h-5 text-primary-400" /> Live Feed
                                        </h3>
                                        <span className="text-[10px] font-bold px-2 py-1 uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md animate-pulse">
                                            Live Socket
                                        </span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 scroll-thin">
                                        <AnimatePresence>
                                            {liveFeed.length === 0 ? (
                                                <div className="text-center text-gray-500 text-sm py-10">No recent activity detected.</div>
                                            ) : (
                                                liveFeed.map(feed => (
                                                    <motion.div
                                                        key={feed.id}
                                                        initial={{ opacity: 0, x: -20, height: 0 }}
                                                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                                                        className={`p-3 rounded-xl border text-sm flex gap-3 ${
                                                            feed.isSuspicious ? 'bg-orange-500/10 border-orange-500/30' : 
                                                            feed.type === 'user' ? 'bg-blue-500/10 border-blue-500/30' : 
                                                            'bg-white/5 border-white/10'
                                                        }`}
                                                    >
                                                        {feed.isSuspicious ? (
                                                            <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
                                                        ) : feed.type === 'user' ? (
                                                            <Users className="w-5 h-5 text-blue-400 shrink-0" />
                                                        ) : (
                                                            <Activity className="w-5 h-5 text-green-400 shrink-0" />
                                                        )}
                                                        <div className="flex flex-col flex-1">
                                                            <span className="text-gray-200">{feed.message}</span>
                                                            <span className="text-xs text-gray-500 font-mono mt-1">{feed.time.toLocaleTimeString()}</span>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Charts (takes 2 cols) */}
                                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="glass-card p-6 rounded-3xl border border-white/10 h-[26rem]">
                                        <h3 className="text-xl font-bold mb-6">Users Growth (Last 30 Days)</h3>
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={stats.recentUsers}>
                                                    <defs>
                                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                                    <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', color: '#fff' }}
                                                        itemStyle={{ color: '#8b5cf6' }}
                                                    />
                                                    <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="glass-card p-6 rounded-3xl border border-white/10 h-[26rem]">
                                        <h3 className="text-xl font-bold mb-6">Transactions Volume</h3>
                                        <div className="h-72">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={stats.recentTransactions}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                                    <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                    <Tooltip 
                                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', color: '#fff' }}
                                                        cursor={{ fill: '#334155', opacity: 0.4 }}
                                                    />
                                                    <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && <UsersTable />}
                    
                    {activeTab === 'transactions' && <TransactionsTable />}
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
