import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Briefcase, MapPin, Users, Plus, Search, ChevronRight,
    Pencil, Trash2, X, ClipboardList, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import LocationPicker from '../../components/LocationPicker';

interface Skill {
    id: number;
    name: string;
}

interface Internship {
    id: number;
    title: string;
    location: string;
    description: string;
    createdAt: string;
    skills: Skill[];
    _count: { applications: number };
}

const EMPTY_FORM = {
    title: '',
    location: '',
    description: '',
    skills: '',
    latitude: 14.5995,
    longitude: 120.9842,
};

export default function EmployerInternships() {
    const [internships, setInternships] = useState<Internship[]>([]);
    const [filtered, setFiltered] = useState<Internship[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Create modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    // Edit modal
    const [editTarget, setEditTarget] = useState<Internship | null>(null);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
    const [editSubmitting, setEditSubmitting] = useState(false);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<Internship | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchInternships = async () => {
        setLoading(true);
        try {
            const res = await api.get('/employer/internships');
            setInternships(res.data);
            setFiltered(res.data);
        } catch {
            toast.error('Failed to load internships');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInternships(); }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(
            q
                ? internships.filter(i =>
                    i.title.toLowerCase().includes(q) ||
                    i.location?.toLowerCase().includes(q) ||
                    i.skills.some(s => s.name.toLowerCase().includes(q))
                )
                : internships
        );
    }, [search, internships]);

    // ── Create ──────────────────────────────────────────────────────────────
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const skillsArray = form.skills.split(',').map(s => s.trim()).filter(Boolean);
            await api.post('/employer/internships', { ...form, skills: skillsArray });
            toast.success('Internship posted!');
            setIsCreateOpen(false);
            setForm(EMPTY_FORM);
            fetchInternships();
        } catch {
            toast.error('Failed to post internship');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Edit ─────────────────────────────────────────────────────────────────
    const openEdit = (internship: Internship) => {
        setEditTarget(internship);
        setEditForm({
            title: internship.title,
            location: internship.location || '',
            description: internship.description,
            skills: internship.skills.map(s => s.name).join(', '),
            latitude: (internship as any).latitude || 14.5995,
            longitude: (internship as any).longitude || 120.9842,
        });
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;
        setEditSubmitting(true);
        try {
            const skillsArray = editForm.skills.split(',').map(s => s.trim()).filter(Boolean);
            await api.put(`/employer/internships/${editTarget.id}`, { ...editForm, skills: skillsArray });
            toast.success('Internship updated!');
            setEditTarget(null);
            fetchInternships();
        } catch {
            toast.error('Failed to update internship');
        } finally {
            setEditSubmitting(false);
        }
    };

    // ── Delete ───────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/employer/internships/${deleteTarget.id}`);
            toast.success('Internship deleted');
            setDeleteTarget(null);
            fetchInternships();
        } catch {
            toast.error('Failed to delete internship');
        } finally {
            setDeleting(false);
        }
    };

    const totalApplicants = internships.reduce((acc, i) => acc + i._count.applications, 0);

    return (
        <div className="space-y-6 relative">
            {/* ── Create Modal ── */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-indigo-600" /> Post New Internship
                            </h2>
                            <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="overflow-y-auto p-6 bg-gray-50/40">
                            <form onSubmit={handleCreate} className="space-y-5">
                                <InternshipFormFields form={form} onChange={setForm} />
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                    <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors">Cancel</button>
                                    <button type="submit" disabled={submitting} className="px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium shadow-sm transition-all disabled:opacity-50">
                                        {submitting ? 'Posting...' : 'Post Internship'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Modal ── */}
            {editTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-indigo-600" /> Edit Internship
                            </h2>
                            <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="overflow-y-auto p-6 bg-gray-50/40">
                            <form onSubmit={handleEdit} className="space-y-5">
                                <InternshipFormFields form={editForm} onChange={setEditForm} />
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                    <button type="button" onClick={() => setEditTarget(null)} className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors">Cancel</button>
                                    <button type="submit" disabled={editSubmitting} className="px-5 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium shadow-sm transition-all disabled:opacity-50">
                                        {editSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ── */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-7 h-7 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Internship?</h2>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            "<strong>{deleteTarget.title}</strong>" will be permanently removed along with all {deleteTarget._count.applications} application(s).
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition">Cancel</button>
                            <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium shadow-sm transition disabled:opacity-50">
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Internship Listings</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your posted internship positions</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                    <Plus className="w-4 h-4" /> Post Internship
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={<Briefcase className="w-5 h-5 text-indigo-600" />} label="Active Listings" value={internships.length} color="bg-indigo-50" />
                <StatCard icon={<Users className="w-5 h-5 text-violet-600" />} label="Total Applicants" value={totalApplicants} color="bg-violet-50" />
                <StatCard icon={<ClipboardList className="w-5 h-5 text-emerald-600" />} label="Avg. Applicants" value={internships.length > 0 ? (totalApplicants / internships.length).toFixed(1) : '0'} color="bg-emerald-50" />
            </div>

            {/* ── Search ── */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by title, location, or skill..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
            </div>

            {/* ── Listings ── */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No internships found</h3>
                    <p className="text-gray-500 text-sm mb-6">{search ? 'Try a different search term.' : 'Post your first internship to start receiving applications.'}</p>
                    {!search && (
                        <button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl text-sm hover:bg-indigo-700 transition shadow-sm">
                            <Plus className="w-4 h-4" /> Post Now
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map(job => (
                        <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6">
                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                {/* Icon */}
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                    <Briefcase className="w-6 h-6 text-indigo-600" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{job.title}</h3>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                                            <Users className="w-3 h-3" /> {job._count.applications} Applicant{job._count.applications !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                                        {job.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3.5 h-3.5" /> {job.location}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" /> Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>

                                    {job.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
                                    )}

                                    {job.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {job.skills.map(s => (
                                                <span key={s.id} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex md:flex-col gap-2 shrink-0">
                                    <Link
                                        to={`/employer/internships/${job.id}/applicants`}
                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm"
                                    >
                                        View Applicants <ChevronRight className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => openEdit(job)}
                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded-xl transition"
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                        onClick={() => setDeleteTarget(job)}
                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-medium rounded-xl transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Shared form fields ───────────────────────────────────────────────────────
function InternshipFormFields({ form, onChange }: {
    form: typeof EMPTY_FORM;
    onChange: (f: typeof EMPTY_FORM) => void;
}) {
    return (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input required type="text" value={form.title}
                    onChange={e => onChange({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition text-sm"
                    placeholder="e.g. Frontend Developer Intern" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills Required <span className="text-gray-400 font-normal">(comma separated)</span></label>
                <input type="text" value={form.skills}
                    onChange={e => onChange({ ...form, skills: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition text-sm"
                    placeholder="e.g. React, TypeScript, Communication" />
            </div>
            <LocationPicker
                address={form.location}
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={(loc) => onChange({ ...form, location: loc.address, latitude: loc.latitude, longitude: loc.longitude })}
            />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea required rows={4} value={form.description}
                    onChange={e => onChange({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition resize-y text-sm"
                    placeholder="Describe the internship duties and requirements..." />
            </div>
        </>
    );
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
