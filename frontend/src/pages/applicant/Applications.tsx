import { useEffect, useState } from 'react';
import api, { BASE_URL } from '../../services/api';
import {
    CheckCircle, Clock, XCircle, FileText, Briefcase,
    Building2, CalendarDays, Search, Eye, SlidersHorizontal
} from 'lucide-react';

interface Application {
    id: number;
    status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
    appliedAt: string;
    coverMessage?: string | null;
    resumePath?: string | null;
    internship: {
        id: number;
        title: string;
        location?: string;
        employer: { user: { name: string } };
    };
}

const STATUS_CONFIG = {
    PENDING: {
        label: 'Pending Review',
        icon: Clock,
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-400',
    },
    REVIEWED: {
        label: 'Under Review',
        icon: Eye,
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        dot: 'bg-sky-400',
    },
    ACCEPTED: {
        label: 'Accepted 🎉',
        icon: CheckCircle,
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
    },
    REJECTED: {
        label: 'Not Selected',
        icon: XCircle,
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-400',
    },
};

const ALL_STATUSES = ['ALL', 'PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'] as const;
type FilterStatus = typeof ALL_STATUSES[number];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'status', label: 'By Status' },
];

export default function ApplicantApplications() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        api.get('/applicant/applications')
            .then(res => setApplications(res.data))
            .catch(() => setError('Failed to load your applications. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    const counts = {
        ALL: applications.length,
        PENDING: applications.filter(a => a.status === 'PENDING').length,
        REVIEWED: applications.filter(a => a.status === 'REVIEWED').length,
        ACCEPTED: applications.filter(a => a.status === 'ACCEPTED').length,
        REJECTED: applications.filter(a => a.status === 'REJECTED').length,
    };

    const filtered = applications
        .filter(a => filterStatus === 'ALL' || a.status === filterStatus)
        .filter(a => {
            const q = search.toLowerCase();
            return (
                !q ||
                a.internship.title.toLowerCase().includes(q) ||
                a.internship.employer.user.name.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'oldest') return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
            if (sortBy === 'status') return a.status.localeCompare(b.status);
            return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(); // newest
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
                <XCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
                <p className="text-rose-700 font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
                <p className="text-sm text-gray-500 mt-0.5">Track all your internship application statuses</p>
            </div>

            {/* ── Summary Stats ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <SummaryCard label="Total Sent" value={counts.ALL} colorClass="text-indigo-600" bgClass="bg-indigo-50" />
                <SummaryCard label="Pending" value={counts.PENDING} colorClass="text-amber-600" bgClass="bg-amber-50" />
                <SummaryCard label="Accepted" value={counts.ACCEPTED} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
                <SummaryCard label="Rejected" value={counts.REJECTED} colorClass="text-rose-600" bgClass="bg-rose-50" />
            </div>

            {/* ── Filters ── */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by company or position..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Sort */}
                <div className="relative">
                    <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Status Tabs ── */}
            <div className="flex gap-2 flex-wrap">
                {ALL_STATUSES.map(status => {
                    const isActive = filterStatus === status;
                    const count = counts[status];
                    return (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${isActive
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                                }`}
                        >
                            {status === 'ALL' ? 'All' : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label ?? status}
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Application Cards ── */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                    <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No applications found</h3>
                    <p className="text-sm text-gray-500">
                        {applications.length === 0
                            ? 'You haven\'t applied to any internships yet. Head to the Dashboard to find matching positions!'
                            : 'No applications match your current filters.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(app => {
                        const cfg = STATUS_CONFIG[app.status];
                        const Icon = cfg.icon;
                        const date = new Date(app.appliedAt);
                        const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                        const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                        return (
                            <div key={app.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${cfg.border} border-l-4`}>
                                <div className="p-5 flex flex-col sm:flex-row gap-4 items-start">
                                    {/* Company Avatar */}
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-6 h-6 text-indigo-600" />
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                            <h3 className="text-base font-bold text-gray-900 truncate">{app.internship.title}</h3>
                                            {/* Status Badge */}
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-${app.status === 'PENDING' ? 'pulse' : 'none'}`} />
                                                <Icon className="w-3 h-3" />
                                                {cfg.label}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            {app.internship.employer.user.name}
                                            {app.internship.location && (
                                                <span className="text-gray-300 mx-1">·</span>
                                            )}
                                            {app.internship.location && (
                                                <span>{app.internship.location}</span>
                                            )}
                                        </p>

                                        {/* Cover Message Preview */}
                                        {app.coverMessage && (
                                            <div className="mb-3 px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600 italic line-clamp-2">
                                                "{app.coverMessage}"
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="w-3.5 h-3.5" /> Applied {dateStr} at {timeStr}
                                            </span>
                                            {app.resumePath && (
                                                <a
                                                    href={`${BASE_URL}${app.resumePath}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 font-medium transition"
                                                >
                                                    <FileText className="w-3.5 h-3.5" /> View Resume
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress bar for pending/reviewed */}
                                {(app.status === 'PENDING' || app.status === 'REVIEWED') && (
                                    <div className="px-5 pb-4">
                                        <div className="flex items-center gap-2">
                                            {(['PENDING', 'REVIEWED', 'ACCEPTED'] as const).map((step, i) => {
                                                const stepOrder = { PENDING: 0, REVIEWED: 1, ACCEPTED: 2 };
                                                const currentOrder = stepOrder[app.status as 'PENDING' | 'REVIEWED'] ?? 0;
                                                const stepO = stepOrder[step];
                                                const isDone = stepO <= currentOrder;
                                                const isNext = stepO === currentOrder + 1;
                                                return (
                                                    <div key={step} className="flex items-center gap-2 flex-1">
                                                        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${isDone ? 'bg-indigo-500 border-indigo-500' : isNext ? 'border-gray-300 bg-white' : 'border-gray-200 bg-gray-50'}`} />
                                                        {i < 2 && <div className={`flex-1 h-0.5 ${isDone && stepO < currentOrder ? 'bg-indigo-500' : 'bg-gray-100'}`} />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                            <span>Submitted</span>
                                            <span>In Review</span>
                                            <span>Decision</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, colorClass, bgClass }: {
    label: string; value: number; colorClass: string; bgClass: string;
}) {
    return (
        <div className={`${bgClass} rounded-2xl p-4 border border-white/60`}>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className={`text-3xl font-extrabold mt-1 ${colorClass}`}>{value}</p>
        </div>
    );
}
