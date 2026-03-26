import React from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowDownLeft, Wallet, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
    return (
        <section id="home" className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center justify-center">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 blur-[100px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col gap-6"
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-white drop-shadow-xl">
                        Smart <span className="gradient-text">Digital Payment</span> Platform for You.
                    </h1>
                    <p className="text-xl text-gray-400 max-w-lg leading-relaxed font-light">
                        Seamlessly send, receive, and manage your money with unparalleled security and speed. Connect and chat while you pay.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-4">
                        <Link to="/signup" className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-primary-600/30">
                            Get Started Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#how-it-works" className="px-8 py-4 glass text-white rounded-2xl font-bold hover:bg-white/10 transition-all border border-white/5">
                            Learn More
                        </a>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1 }}
                    className="relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                    <div className="relative glass-card p-4 rounded-[2rem] border border-white/10">
                         {/* Card Mockup */}
                         <div className="bg-[#1e293b] rounded-2xl p-6 min-h-[400px]">
                            <div className="flex justify-between items-start mb-8">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400 font-medium">Wallet Balance</p>
                                    <h3 className="text-3xl font-bold text-white">₹10,000.00</h3>
                                </div>
                                <div className="bg-primary-500/20 p-2 rounded-xl text-primary-400 border border-primary-500/30">
                                    <Wallet className="w-8 h-8" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="glass p-4 rounded-xl flex items-center gap-3">
                                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                                        <ArrowDownLeft className="w-5 h-5" />
                                    </div>
                                    <span className="text-white font-medium">Income</span>
                                </div>
                                <div className="glass p-4 rounded-xl flex items-center gap-3">
                                    <div className="bg-red-500/20 p-2 rounded-lg text-red-400">
                                        <Send className="w-5 h-5" />
                                    </div>
                                    <span className="text-white font-medium">Expense</span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 glass rounded-xl border-l-4 border-primary-500 hover:translate-x-1 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">JD</div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">John Doe</p>
                                            <p className="text-xs text-gray-500">Sent ₹500.00</p>
                                        </div>
                                    </div>
                                    <span className="text-emerald-400 font-bold">+500</span>
                                </div>
                                <div className="flex items-center justify-between p-4 glass rounded-xl border-l-4 border-red-500 hover:translate-x-1 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">SM</div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">Starbucks Coffee</p>
                                            <p className="text-xs text-gray-500">Payment</p>
                                        </div>
                                    </div>
                                    <span className="text-red-400 font-bold">-210</span>
                                </div>
                            </div>
                         </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
