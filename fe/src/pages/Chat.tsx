import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { Send, MessageSquare, Phone, Video, MoreVertical, Paperclip, Smile, ChevronLeft, ArrowLeft, UserPlus, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const socket = useRef<any>(null);
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConv, setActiveConv] = useState<any>(null);
    const [newEmail, setNewEmail] = useState('');
    const [addMsg, setAddMsg] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [fileData, setFileData] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Fetch friends
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get('http://localhost:5002/api/chat/users', config);
                const mapped = res.data.map((u: any) => ({
                    _id: u._id,
                    name: u.name,
                    email: u.email,
                    lastMsg: 'Ready to chat',
                    time: '',
                    status: 'online'
                }));
                setConversations(mapped);
                if (mapped.length > 0 && !activeConv) setActiveConv(mapped[0]);
            } catch (err) { console.error(err); }
        };
        fetchUsers();
    }, [navigate]);

    if (!socket.current) {
        socket.current = io('http://localhost:5002');
    }

    useEffect(() => {
        if (!user?._id) return;
        socket.current.emit("register", user._id);
        console.log("Registered:", user._id);
    }, [user]);

    useEffect(() => {
        if (!socket.current) return;

        const handleReceive = (data: any) => {
            console.log("Message received:", data);
            setMessages(prev => [...prev, data]);
        };

        socket.current.on('receive_message', handleReceive);

        return () => {
            socket.current.off('receive_message', handleReceive);
            socket.current.disconnect();
            socket.current = null;
        };
    }, []);

    useEffect(() => {
        if (!activeConv) return;
        
        let isMounted = true;
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`http://localhost:5002/api/chat/messages/${activeConv._id}`, config);
                if (isMounted) {
                    setMessages(res.data);
                }
            } catch (err) {
                console.error('Failed to load messages', err);
            }
        };
        fetchMessages();

        return () => { isMounted = false; };
    }, [activeConv]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !fileData) || !socket.current || !activeConv) return;

        const msgData = {
            senderId: user._id,
            receiverId: activeConv._id,
            message: input,
            file: fileData,
            fileName: fileName,
            timestamp: new Date().toISOString()
        };

        console.log("Sender:", user._id);
        console.log("Receiver:", activeConv._id);
        console.log("Sending:", msgData);
        
        socket.current.emit('send_message', msgData);
        
        // instant UI update
        setMessages(prev => [...prev, msgData]);
        
        setInput('');
        setFileData(null);
        setFileName(null);
        setShowEmojiPicker(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFileData(event.target?.result as string);
                setFileName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const onEmojiClick = (emojiObject: any) => {
        setInput(prev => prev + emojiObject.emoji);
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddMsg('');
        if (!newEmail.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5002/api/chat/request', { email: newEmail }, config);
            setAddMsg('Friend request sent!');
            setNewEmail('');
        } catch (err: any) {
            setAddMsg(err.response?.data?.message || 'Failed to send request');
        }
    };

    return (
        <div className="bg-[#0f172a] h-screen flex flex-col text-white overflow-hidden">
            <Navbar />
            
            <main className="flex-1 flex max-w-7xl mx-auto w-full pt-20 px-4 md:px-6 pb-6 overflow-hidden mt-4 gap-6">
                
                {/* Conversations Sidebar */}
                <aside className="w-full md:w-80 flex flex-col glass-card border border-white/10 rounded-3xl overflow-hidden hidden md:flex">
                    <div className="p-6 border-b border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">Chats</h3>
                        </div>
                        <form onSubmit={handleAddUser} className="space-y-2">
                            <div className="relative group">
                                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                                <input 
                                    type="email" 
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="Add user by email..." 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all font-medium"
                                />
                            </div>
                            {addMsg && <p className="text-xs font-bold text-primary-400 pl-1">{addMsg}</p>}
                        </form>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-white/5 scroll-thin">
                        {conversations.map((conv) => (
                            <div 
                                key={conv._id} 
                                onClick={() => setActiveConv(conv)}
                                className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all relative ${activeConv && activeConv._id === conv._id ? 'bg-white/5 border-l-4 border-primary-500' : ''}`}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center font-bold text-white uppercase">
                                        {conv.name.substring(0, 2)}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#1e293b] ${conv.status === 'online' ? 'bg-emerald-500' : conv.status === 'away' ? 'bg-amber-500' : 'bg-gray-500'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-sm text-white truncate">{conv.name}</h4>
                                        <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">{conv.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate mt-1">{conv.lastMsg}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Chat Area */}
                {activeConv ? (
                    <section className="flex-1 flex flex-col glass-card border border-white/10 rounded-3xl overflow-hidden relative">
                        {/* Chat Header */}
                        <header className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between glass z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => navigate('/dashboard')} className="md:hidden p-2 text-gray-400 hover:text-white">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center font-bold text-white uppercase">
                                        {activeConv.name.substring(0, 2)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#1e293b] bg-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{activeConv.name}</h4>
                                    <p className="text-xs text-emerald-500 font-medium">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2">
                                    <button className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                                        <Phone className="w-5 h-5" />
                                    </button>
                                    <button className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                                        <Video className="w-5 h-5" />
                                    </button>
                                </div>
                                <button className="p-2.5 rounded-xl text-gray-400 hover:text-white transition-all">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </header>

                        {/* Messages Body */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-thin">
                            <div className="text-center py-4">
                                <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] uppercase font-bold text-gray-500 tracking-widest border border-white/5">Today</span>
                            </div>
                            {messages.filter(msg => 
                                (msg.senderId === user._id && msg.receiverId === activeConv._id) || 
                                (msg.receiverId === user._id && msg.senderId === activeConv._id)
                            ).map((msg, idx) => {
                                const isSelf = msg.senderId === user._id;
                                return (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className={`flex gap-4 max-w-[85%] ${isSelf ? 'ml-auto flex-row-reverse' : ''}`}
                                >
                                    <div className="space-y-1">
                                        <div className={`p-4 rounded-2xl text-sm shadow-lg ${isSelf ? 'bg-primary-600 text-white rounded-br-none border border-primary-500' : 'bg-[#1e293b] text-gray-300 rounded-bl-none border border-white/5'}`}>
                                            {msg.file && (
                                                <div className="mb-2">
                                                    {msg.file.startsWith('data:image') ? (
                                                        <img src={msg.file} alt="attachment" className="max-w-xs rounded-xl border border-white/10" />
                                                    ) : (
                                                        <a href={msg.file} download={msg.fileName} className="flex items-center gap-2 underline text-primary-200">
                                                            <Paperclip className="w-4 h-4" />
                                                            {msg.fileName || 'Attachment'}
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            {msg.message}
                                        </div>
                                        <div className={`flex items-center gap-1 ${isSelf ? 'justify-end pr-1' : 'pl-1'}`}>
                                            <span className="text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )})}
                            <div ref={scrollRef} />
                        </div>

                        {/* Chat Input */}
                        <footer className="p-4 md:p-6 glass-card border-t border-white/10 z-10 relative">
                            {showEmojiPicker && (
                                <div className="absolute bottom-[calc(100%+8px)] right-6 z-50">
                                    <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
                                </div>
                            )}
                            {fileData && (
                                <div className="absolute bottom-[calc(100%+8px)] left-6 z-50 bg-[#1e293b] p-3 rounded-xl border border-white/10 flex items-center gap-3">
                                    {fileData.startsWith('data:image') ? (
                                        <img src={fileData} alt="preview" className="h-12 w-12 object-cover rounded-md" />
                                    ) : (
                                        <div className="flex items-center gap-2"><Paperclip className="w-4 h-4 text-primary-400" /><span className="text-xs text-white max-w-[150px] truncate">{fileName}</span></div>
                                    )}
                                    <button type="button" onClick={() => {setFileData(null); setFileName(null);}} className="text-gray-400 hover:text-red-400"><X className="w-4 h-4"/></button>
                                </div>
                            )}
                            <input type="file" className="hidden" ref={fileRef} onChange={handleFileChange} />
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                 <button type="button" onClick={() => fileRef.current?.click()} className="p-3 text-gray-500 hover:text-white transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <div className="flex-1 relative group">
                                    <input 
                                        type="text" 
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type your message..." 
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all font-medium"
                                    />
                                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-white transition-colors">
                                        <Smile className="w-5 h-5" />
                                    </button>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!input.trim() && !fileData}
                                    className="bg-primary-600 p-4 rounded-2xl text-white shadow-xl shadow-primary-600/30 hover:bg-primary-700 disabled:bg-gray-800 disabled:text-gray-600 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
                                >
                                    <Send className="w-6 h-6" />
                                </button>
                            </form>
                        </footer>
                    </section>
                ) : (
                    <section className="flex-1 flex flex-col glass-card border border-white/10 rounded-3xl overflow-hidden justify-center items-center text-center p-6 glass opacity-80">
                        <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-300">No active chat</h2>
                        <p className="text-gray-500 max-w-sm mt-2">Select a user from the sidebar or add a new friend by email to start chatting!</p>
                    </section>
                )}
            </main>
        </div>
    );
};

export default Chat;
