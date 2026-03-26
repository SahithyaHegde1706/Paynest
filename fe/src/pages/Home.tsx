import React from 'react';
import { motion } from 'framer-motion';
import { Send, Wallet, MessageSquare, ShieldCheck, Star, Clock, Globe, Zap } from 'lucide-react';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';

const Home: React.FC = () => {
    return (
        <div className="bg-[#0f172a] min-h-screen text-white">
            <Navbar />
            <Hero />

            {/* Features Categories */}
            <section id="features" className="py-24 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Our <span className="gradient-text">Features</span></h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">Experience the most versatile and advanced digital payment features.</p>
                </div>
                
                <div className="grid md:grid-cols-4 gap-8">
                    {[
                        { icon: <Send className="w-8 h-8"/>, title: "Send Money", desc: "Instant transfers anytime, anywhere.", color: "bg-blue-500/10 text-blue-400" },
                        { icon: <Wallet className="w-8 h-8"/>, title: "Smart Wallet", desc: "Manage your funds with real-time tracking.", color: "bg-emerald-500/10 text-emerald-400" },
                        { icon: <MessageSquare className="w-8 h-8"/>, title: "Chat & Pay", desc: "Real-time communication with payment context.", color: "bg-purple-500/10 text-purple-400" },
                        { icon: <ShieldCheck className="w-8 h-8"/>, title: "Secure Vault", desc: "State-of-the-art encryption for your peace of mind.", color: "bg-red-500/10 text-red-400" }
                    ].map((feature, i) => (
                        <motion.div 
                            key={i} 
                            whileHover={{ y: -10 }}
                            className="glass-card p-8 rounded-3xl text-center space-y-4 border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                        >
                            <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 bg-white/5 relative overflow-hidden">
                 <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-white">How it <span className="gradient-text">Works</span></h2>
                            <p className="text-gray-400 text-lg">Follow these simple steps to start your journey with PayNest.</p>
                        </div>
                        
                        <div className="space-y-8 relative">
                            {[
                                { step: "01", title: "Create an Account", desc: "Sign up in seconds with your email and basic details." },
                                { step: "02", title: "Add Funds to Wallet", desc: "Deposit money securely using your bank or other sources." },
                                { step: "03", title: "Start Paying", desc: "Transfer money to anyone or pay merchants globally." }
                            ].map((s, i) => (
                                <motion.div key={i} className="flex gap-6 items-start">
                                    <div className="text-4xl font-black text-primary-500/30">
                                        {s.step}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-bold text-white">{s.title}</h4>
                                        <p className="text-gray-400">{s.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="relative p-8 glass-card rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center min-h-[500px] text-center overflow-hidden">
                        <div className="z-10 space-y-6">
                            <div className="relative w-40 h-40 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto border-4 border-primary-500 shadow-2xl shadow-primary-500/40">
                                <Zap className="w-20 h-20 text-primary-400 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-bold">Lightning Fast Transfers</h3>
                            <p className="text-gray-400 max-w-sm">Experience the speed of transactions that happen faster than a blink of an eye.</p>
                        </div>
                    </div>
                 </div>
            </section>

            {/* About / Testimonials Section */}
            <section id="about" className="py-24 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold">What Our <span className="gradient-text">Users Say</span></h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { name: "Rahul S.", role: "Freelancer", text: "The best fintech app I've used. The chat feature makes payments so much more interactive!", stars: 5 },
                        { name: "Priya V.", role: "UI Designer", text: "Stunning design and smooth UI. Sending money is now actually fun!", stars: 5 },
                        { name: "Amit K.", role: "Entrepreneur", text: "Security is my priority, and PayNest delivers it perfectly. Highly recommended.", stars: 4 }
                    ].map((t, i) => (
                        <motion.div key={i} whileHover={{ scale: 1.02 }} className="glass-card p-8 rounded-3xl space-y-4 border border-white/5 hover:border-white/10 transition-all">
                            <div className="flex gap-1 text-yellow-500">
                                {[...Array(t.stars)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current"/>)}
                            </div>
                            <p className="text-gray-300 italic">"{t.text}"</p>
                            <div>
                                <h4 className="font-bold text-white">{t.name}</h4>
                                <p className="text-xs text-gray-500">{t.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
                    <div className="col-span-2 space-y-4">
                        <div className="text-2xl font-black text-white flex items-center gap-2">
                             <div className="bg-primary-600 p-1 rounded-lg">
                                <Wallet className="w-5 h-5" />
                            </div>
                            Pay<span className="text-primary-500">Nest</span>
                        </div>
                        <p className="text-gray-400 max-w-md">The most secure and flexible digital payment system for modern users. Join the revolution of finance.</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold">Quick Links</h4>
                        <ul className="space-y-2 text-gray-500 text-sm">
                            <li><a href="#how-it-works" className="hover:text-primary-400 transition-colors">How it works</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Security</a></li>
                            <li><a href="#about" className="hover:text-primary-400 transition-colors">About Us</a></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold">Support</h4>
                        <ul className="space-y-2 text-gray-500 text-sm">
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 flex flex-col items-center justify-center text-gray-500 gap-4">
                    <p className="text-lg font-medium text-white">Built by <span className="text-primary-500">Sahithya ❤️</span></p>
                    <p className="text-xs">© 2026 PayNest. All rights reserved.</p>
                    <div className="flex gap-6 mt-2 opacity-50">
                        <Globe className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                        <Clock className="w-4 h-4 hover:text-white cursor-pointer transition-colors" />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
