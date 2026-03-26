import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Calendar, ArrowUpRight, ArrowDownLeft, AlertTriangle, Check, X, Download } from 'lucide-react';
import { format } from 'date-fns';

const TransactionsTable = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTransactions();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [dateFilter, userFilter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            let url = `https://paynest-backend-ie16.onrender.com/api/admin/transactions?`;
            if (dateFilter) url += `date=${dateFilter}&`;
            if (userFilter) url += `userId=${userFilter}&`;
            
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setTransactions(res.data);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        if (!window.confirm(`Mark transaction as ${status}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`https://paynest-backend-ie16.onrender.com/api/admin/transaction/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTransactions();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const exportCSV = () => {
        const headers = ['ID', 'Date', 'Amount', 'Sender', 'Receiver', 'Status', 'Is Suspicious'];
        const rows = transactions.map(tx => [
            tx._id, tx.date, tx.amount, tx.senderId?.email || 'Unknown', tx.receiverId?.email || 'Unknown',
            tx.status, tx.isSuspicious ? 'Yes' : 'No'
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "transactions_export.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="glass-card rounded-3xl border border-white/10 overflow-hidden space-y-4">
            {/* Toolbar */}
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">Transactions & Approvals</h2>
                    <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 text-xs font-bold transition">
                        <Download className="w-3 h-3" /> Export CSV
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500 w-full md:w-40 text-gray-300" />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Filter by User ID..." value={userFilter} onChange={(e) => setUserFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500 w-full md:w-56" />
                    </div>
                    {(dateFilter || userFilter) && (
                        <button onClick={() => { setDateFilter(''); setUserFilter(''); }} className="text-xs text-primary-400 hover:text-primary-300 underline self-center">
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto pb-6">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="p-4 font-semibold text-gray-300 text-sm">Date & Time</th>
                            <th className="p-4 font-semibold text-gray-300 text-sm">Transfer Route</th>
                            <th className="p-4 font-semibold text-gray-300 text-sm">Amount</th>
                            <th className="p-4 font-semibold text-gray-300 text-sm">Status</th>
                            <th className="p-4 font-semibold text-gray-300 text-sm text-right">Approvals</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading transactions...</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">No transactions found.</td></tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx._id} className={`border-b transition-colors ${tx.isSuspicious && tx.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20' : 'border-white/5 hover:bg-white/[0.02]'}`}>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm">{format(new Date(tx.date), 'MMM dd, yyyy')}</span>
                                            <span className="text-xs text-gray-400">{format(new Date(tx.date), 'hh:mm a')}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">From</span>
                                                <span className="text-sm font-medium text-white">{tx.senderId?.email || 'Unknown'}</span>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-gray-600" />
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">To</span>
                                                <span className="text-sm font-medium text-white">{tx.receiverId?.email || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-white text-lg">${tx.amount?.toLocaleString()}</span>
                                            {tx.isSuspicious && (
                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-orange-400 tracking-wider mt-1">
                                                    <AlertTriangle className="w-3 h-3" /> Suspicious
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                                            tx.status === 'approved' || tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                            tx.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-500'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {tx.status === 'pending' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => updateStatus(tx._id, 'approved')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition" title="Approve">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => updateStatus(tx._id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition" title="Reject">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-600 font-mono">ID: {tx._id}</span>
                                        )}
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

export default TransactionsTable;
