import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wallet, LogIn, UserPlus, LogOut, Bell } from 'lucide-react';
import axios from 'axios';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = !!localStorage.getItem('token');
    const [activeSection, setActiveSection] = useState('home');
    const [requests, setRequests] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            const fetchRequests = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) return;
                    const config = { headers: { Authorization: `Bearer ${token}` } };
                    const res = await axios.get('http://localhost:5002/api/chat/requests', config);
                    setRequests(res.data);
                } catch (err) { console.error(err); }
            };
            fetchRequests();
            const interval = setInterval(fetchRequests, 10000);
            return () => clearInterval(interval);
        }
    }, [isLoggedIn]);

    const respondRequest = async (requestId: string, status: string) => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5002/api/chat/respond', { requestId, status }, config);
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'features', 'how-it-works', 'about'];
            const scrollPos = window.scrollY + 100;

            sections.forEach(section => {
                const element = document.getElementById(section);
                if (element) {
                    const top = element.offsetTop;
                    const height = element.offsetHeight;
                    if (scrollPos >= top && scrollPos < top + height) {
                        setActiveSection(section);
                    }
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: id } });
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    useEffect(() => {
        if (location.pathname === '/' && location.state && (location.state as any).scrollTo) {
            const id = (location.state as any).scrollTo;
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'features', label: 'Features' },
        { id: 'about', label: 'About' }
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-white tracking-tight">
                    <div className="bg-primary-600 p-2 rounded-xl">
                        <Wallet className="w-6 h-6" />
                    </div>
                    Pay<span className="text-primary-500">Nest</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400 uppercase tracking-widest">
                    {!isLoggedIn && navItems.map(item => (
                        <a 
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={(e) => scrollToSection(e, item.id)}
                            className={`${activeSection === item.id ? 'text-primary-500' : 'hover:text-white'} transition-all cursor-pointer`}
                        >
                            {item.label}
                        </a>
                    ))}
                    {isLoggedIn && (
                        <>
                            <Link to="/dashboard" className={`${location.pathname === '/dashboard' ? 'text-primary-500' : 'hover:text-white'} transition-all`}>Dashboard</Link>
                            <Link to="/chat" className={`${location.pathname === '/chat' ? 'text-primary-500' : 'hover:text-white'} transition-all`}>Chat</Link>
                            <Link to="/receive" className={`${location.pathname === '/receive' ? 'text-primary-500' : 'hover:text-white'} transition-all`}>Transactions</Link>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <>
                            <div className="relative">
                                <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                                    <Bell className="w-5 h-5" />
                                    {requests.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-bold text-white">{requests.length}</span>}
                                </button>
                                {showDropdown && (
                                    <div className="absolute right-0 mt-4 w-72 glass-card rounded-2xl border border-white/10 p-4 shadow-xl shadow-black/50 z-[100]">
                                        <h4 className="font-bold text-white mb-3 text-sm border-b border-white/10 pb-2">Chat Requests</h4>
                                        {requests.length === 0 ? <p className="text-xs text-gray-500">No pending requests</p> : (
                                            <div className="space-y-3 max-h-[60vh] overflow-y-auto scroll-thin">
                                                {requests.map((r: any) => (
                                                    <div key={r._id} className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2">
                                                        <p className="text-sm font-semibold text-white">{r.senderId?.name}</p>
                                                        <p className="text-xs text-gray-400">{r.senderId?.email}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <button onClick={() => respondRequest(r._id, 'accepted')} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-1.5 rounded-lg transition-colors border border-primary-500/50">Accept</button>
                                                            <button onClick={() => respondRequest(r._id, 'rejected')} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold py-1.5 rounded-lg transition-colors border border-red-500/20">Reject</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-semibold"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="flex items-center gap-2 px-6 py-2 rounded-full text-white font-semibold hover:border-white/20 transition-all">
                                <LogIn className="w-4 h-4" />
                                Login
                            </Link>
                            <Link to="/signup" className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20">
                                <UserPlus className="w-4 h-4" />
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
