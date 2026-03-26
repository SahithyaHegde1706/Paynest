import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, History, Settings, Search, CreditCard, Send, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';

const Dashboard: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const userRes = await axios.get('http://localhost:5002/api/users/details', config);
                const transRes = await axios.get('http://localhost:5002/api/users/transactions', config);
                
                setUser(userRes.data);
                setTransactions(transRes.data);
            } catch (err) {
                console.error(err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-[#0f172a] min-h-screen text-white pb-20">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold">Hello, <span className="gradient-text">{user?.name}</span> 👋</h2>
                        <p className="text-gray-400">Welcome back! Here's your financial summary.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="glass p-2 rounded-xl text-gray-400 hover:text-white cursor-pointer transition-colors border border-white/5">
                            <Settings className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Top Grid: Balance & Chat Section */}
                <div className="grid md:grid-cols-1 gap-8">
                    {/* Balance Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative group col-span-1"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition-opacity" />
                        <div className="relative glass-card p-8 rounded-[2rem] border border-white/10 h-full overflow-hidden">
                            <div className="flex justify-between items-start mb-12">
                                <div className="space-y-1">
                                    <p className="text-sm text-primary-300 font-semibold uppercase tracking-wider">Total Balance</p>
                                    <h3 className="text-5xl font-black text-white">₹{user?.balance?.toLocaleString() || '10,000'}.00</h3>
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                                    <CreditCard className="w-8 h-8 text-primary-400" />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Link to="/send" className="flex-1 flex items-center justify-center gap-3 bg-white text-black font-bold py-4 rounded-2xl hover:bg-primary-50 transition-all shadow-lg group/btn">
                                    <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                    Send Money
                                </Link>
                                <Link to="/chat" className="flex-1 flex items-center justify-center gap-3 glass text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all border border-white/10 group/btn">
                                    <MessageSquare className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                    Chat
                                </Link>
                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="flex-1 flex items-center justify-center gap-3 bg-red-500/10 text-red-400 font-bold py-4 rounded-2xl hover:bg-red-500/20 transition-all border border-red-500/20 group/btn">
                                        <Shield className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                        Admin Panel
                                    </Link>
                                )}
                            </div>
                            
                            {/* Abstract Shapes */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-600/10 blur-[80px] rounded-full pointer-events-none" />
                        </div>
                    </motion.div>
                </div>

                {/* Transactions Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <History className="w-6 h-6 text-primary-500" />
                            <h3 className="text-2xl font-bold">Recent Transactions</h3>
                        </div>
                        <button className="text-sm text-primary-500 font-bold hover:underline">View All</button>
                    </div>

                    <div className="glass-card rounded-[2rem] border border-white/10 overflow-hidden">
                        {transactions.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {transactions.map((tx: any, i) => {
                                    const isReceived = tx.receiverId?._id === user?._id || tx.receiverId === user?._id;
                                    const relatedUser = isReceived ? tx.senderId : tx.receiverId;
                                    const relatedEmail = relatedUser?.email || 'Unknown';
                                    return (
                                    <div key={i} className="flex items-center justify-between p-6 hover:bg-white/5 transition-all cursor-pointer group">
                                         <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center font-bold text-white group-hover:bg-primary-600 transition-colors uppercase">
                                                 {relatedEmail.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">
                                                    {isReceived 
                                                        ? `Received ₹${tx.amount?.toLocaleString()} from ${relatedUser?.name || relatedEmail}` 
                                                        : `Sent ₹${tx.amount?.toLocaleString()} to ${relatedUser?.name || relatedEmail}`}
                                                </p>
                                                <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleString()}</p>
                                            </div>
                                         </div>
                                         <div className="text-right">
                                            <p className={`font-black ${isReceived ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {isReceived ? '+' : '-'} ₹{tx.amount?.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">{tx.status || 'Completed'}</p>
                                         </div>
                                    </div>
                                )})}
                            </div>
                        ) : (
                            <div className="p-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-600">
                                    <Search className="w-10 h-10" />
                                </div>
                                <p className="text-gray-500 font-medium">No transactions found yet.</p>
                                <button className="px-6 py-2 bg-primary-600/20 text-primary-500 rounded-xl font-bold border border-primary-600/20 hover:bg-primary-600/30 transition-all">Start Sending</button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Floating Action Button (hidden to match restrictions) */}
        </div>
    );
};

export default Dashboard;
