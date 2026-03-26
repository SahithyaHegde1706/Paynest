import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, History, ArrowLeft, Search, Filter, Download } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';

const ReceiveMoney: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTransactions = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const userStr = localStorage.getItem('user');
                const userObj = userStr ? JSON.parse(userStr) : {};
                const res = await axios.get('https://paynest-backend-ie16.onrender.com/api/users/transactions', config);
                // Filter for received only
                setTransactions(res.data.filter((tx: any) => tx.receiverId?._id === userObj._id || tx.receiverId === userObj._id));
            } catch (err) {
                console.error('Failed to load transactions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [navigate]);

    return (
        <div className="bg-[#0f172a] min-h-screen text-white">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 space-y-8 pb-20">
                <div className="flex flex-col md:row items-start md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-500 hover:text-primary-400 font-bold transition-all mb-2">
                            <ArrowLeft className="w-4 h-4" />
                            Return
                        </button>
                        <h2 className="text-4xl font-extrabold flex items-center gap-4">
                            <ArrowDownLeft className="w-10 h-10 text-emerald-500 bg-emerald-500/10 p-2 rounded-2xl" />
                            Received <span className="gradient-text">Payments</span>
                        </h2>
                        <p className="text-gray-400">View and manage all incoming funds into your wallet.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="glass p-2.5 rounded-xl text-gray-400 hover:text-white cursor-pointer border border-white/5 transition-all">
                            <Filter className="w-5 h-5" />
                        </div>
                        <div className="glass p-2.5 rounded-xl text-gray-400 hover:text-white cursor-pointer border border-white/5 transition-all">
                             <Download className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-[2.5rem] border border-white/10 overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex justify-center">
                            <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {transactions.map((tx: any, i) => {
                                const relatedEmail = tx.senderId?.email || 'Unknown';
                                return (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex flex-col md:row items-center justify-between p-8 hover:bg-emerald-500/5 transition-all group"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center font-bold text-xl text-emerald-500 border border-emerald-500/10 group-hover:scale-105 transition-transform uppercase">
                                            {relatedEmail.substring(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{relatedEmail}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><History className="w-3 h-3" /> {new Date(tx.date).toLocaleString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-700" />
                                                <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{tx.status || 'Completed'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right mt-4 md:mt-0">
                                        <p className="text-3xl font-black text-emerald-400">
                                            +₹{tx.amount?.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-gray-600 uppercase font-black uppercase tracking-[0.2em] pt-1">Wallet Deposit</p>
                                    </div>
                                </motion.div>
                            )})}
                        </div>
                    ) : (
                        <div className="p-24 text-center space-y-6">
                            <div className="w-24 h-24 bg-emerald-500/5 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/10">
                                <Search className="w-12 h-12 text-gray-600" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold">No Payments Received Yet</h4>
                                <p className="text-gray-500 max-w-sm mx-auto">Share your email to start receiving funds instantly from anyone on the PayNest network.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ReceiveMoney;
