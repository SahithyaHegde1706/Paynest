import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, Mail, DollarSign, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';

const SendMoney: React.FC = () => {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;
        
        setLoading(true);
        setStatus('idle');
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5002/api/users/send-money', {
                recipientEmail, 
                amount: parseFloat(amount) 
            }, config);
            
            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Transaction failed. Please try again.');
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0f172a] min-h-screen text-white">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-6 pt-32 flex flex-col items-center">
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-xl"
                >
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>

                    <div className="glass-card p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {status === 'idle' ? (
                                <motion.div 
                                    key="form"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-bold flex items-center gap-3">
                                            <Send className="w-8 h-8 text-primary-500" />
                                            Send Money
                                        </h3>
                                        <p className="text-gray-400">Transfer funds instantly to any PayNest user.</p>
                                    </div>

                                    <form onSubmit={handleSend} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-300 ml-1">Recipient Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                                                <input 
                                                    type="email" 
                                                    value={recipientEmail}
                                                    onChange={(e) => setRecipientEmail(e.target.value)}
                                                    placeholder="Enter recipient's email" 
                                                    required
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-300 ml-1">Amount (₹)</label>
                                            <div className="relative group">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                                                <input 
                                                    type="number" 
                                                    step="0.01"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    placeholder="0.00" 
                                                    required
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-3xl font-black text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
                                                />
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                {[100, 500, 1000, 5000].map(val => (
                                                    <button 
                                                        key={val}
                                                        type="button" 
                                                        onClick={() => setAmount(val.toString())}
                                                        className="px-4 py-1.5 rounded-lg glass text-xs font-bold hover:bg-white/10 transition-all border border-white/5 text-gray-400 hover:text-white"
                                                    >
                                                        +₹{val}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:cursor-not-allowed text-white font-black py-5 rounded-2xl shadow-2xl shadow-primary-600/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] mt-4"
                                        >
                                            {loading ? (
                                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    Send Money Now
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </motion.div>
                            ) : status === 'success' ? (
                                <motion.div 
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-10 space-y-6 text-center"
                                >
                                    <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 border-2 border-emerald-500/30">
                                        <CheckCircle2 className="w-12 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-bold">Transfer Successful!</h3>
                                        <p className="text-gray-400">₹{parseFloat(amount).toLocaleString()} has been sent to {recipientEmail}.</p>
                                    </div>
                                    <p className="text-xs text-gray-600">Redirecting to dashboard...</p>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="error"
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-10 space-y-6 text-center"
                                >
                                    <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center text-red-500 border-2 border-red-500/30">
                                        <XCircle className="w-12 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-bold">Transfer Failed</h3>
                                        <p className="text-gray-400">{error}</p>
                                    </div>
                                    <button 
                                        onClick={() => setStatus('idle')}
                                        className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all border border-white/10"
                                    >
                                        Try Again
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default SendMoney;
