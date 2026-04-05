import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, UserCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { getMatchColor } from '../../utils/colorUtils';

interface Skill {
    id: number;
    name: string;
}

interface ApplicantProfile {
    course: string | null;
    yearLevel: string | null;
    resumePath: string | null;
    skills: Skill[];
}

interface Applicant {
    name: string;
    email: string;
    applicantProfile: ApplicantProfile | null;
}

interface Application {
    id: number;
    status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
    appliedAt: string;
    resumePath?: string | null;
    coverMessage?: string | null;
    matchScore?: number | null;
    matchDetails?: { matchedSkills: Skill[], missingSkills: Skill[], reason?: string } | null;
    applicant: Applicant;
}

export default function InternshipApplicants() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; appId: number | null; newStatus: string }>({ isOpen: false, appId: null, newStatus: '' });

    const fetchApplicants = () => {
        setLoading(true);
        api.get(`/employer/internships/${id}/applicants`)
            .then(res => {
                setApplications(res.data);
                setError(null);
            })
            .catch(err => {
                console.error(err);
                if (err.response?.status === 403) {
                    setError('Access denied: You do not own this internship.');
                } else {
                    setError('Failed to fetch applicants.');
                }
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (id) {
            fetchApplicants();
        }
    }, [id]);

    const updateStatusAPI = async (applicationId: number, newStatus: string) => {
        try {
            await api.put(`/employer/applications/${applicationId}/status`, { status: newStatus });

            // Update local state without reload
            setApplications(prev => prev.map(app =>
                app.id === applicationId ? { ...app, status: newStatus as any } : app
            ));

            toast.success(`Applicant status updated successfully`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
        }
    };

    const handleStatusUpdate = (applicationId: number, newStatus: string) => {
        if (newStatus === 'ACCEPTED' || newStatus === 'REJECTED') {
            setConfirmModal({ isOpen: true, appId: applicationId, newStatus });
            return;
        }
        updateStatusAPI(applicationId, newStatus);
    };

    const confirmStatusChange = () => {
        if (confirmModal.appId && confirmModal.newStatus) {
            updateStatusAPI(confirmModal.appId, confirmModal.newStatus);
        }
        setConfirmModal({ isOpen: false, appId: null, newStatus: '' });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'REJECTED': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'REVIEWED': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            default: return 'bg-amber-100 text-amber-800 border-amber-200';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center">
                <div className="text-red-500 mb-4 mx-auto w-12 h-12 flex items-center justify-center bg-red-50 rounded-full">
                    <UserCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={() => navigate('/employer')}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative max-w-7xl mx-auto">
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Action</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to mark this applicant as <strong className={confirmModal.newStatus === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'}>{confirmModal.newStatus}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setConfirmModal({ isOpen: false, appId: null, newStatus: '' })} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
                            <button onClick={confirmStatusChange} className={`px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-all ${confirmModal.newStatus === 'ACCEPTED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/employer')}
                        className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-600 hover:text-indigo-600 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Internship Applicants</h1>
                        <p className="text-sm text-gray-500">Manage and review candidates for this role</p>
                    </div>
                </div>
                <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                    Total: <span className="text-indigo-600 font-bold">{applications.length}</span>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <UserCircle2 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No applicants yet</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Once students start applying for this role, their profiles, match details, and resumes will appear here.
                    </p>
                    <button
                        onClick={() => navigate('/employer')}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg hover:text-indigo-600 transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {applications.map(app => (
                        <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center">

                            <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 relative">
                                <span className="text-xl font-bold text-indigo-700">{app.applicant.name.charAt(0).toUpperCase()}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">
                                        {app.applicant.name}
                                        {app.matchScore !== undefined && app.matchScore !== null && (
                                              <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchColor(app.matchScore)}`}>
                                                  {app.matchScore}% AI Match
                                              </span>
                                        )}
                                    </h3>

                                    <div className="flex items-center gap-3 whitespace-nowrap">
                                        <select
                                            value={app.status}
                                            onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                                            className={`text-sm font-medium border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors ${getStatusStyle(app.status)}`}
                                        >
                                            <option value="PENDING">Pending Update</option>
                                            <option value="REVIEWED">Mark entry as Reviewed</option>
                                            <option value="ACCEPTED">Make Offer / Accept</option>
                                            <option value="REJECTED">Reject Candidate</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                                    <span className="text-sm text-gray-600 font-medium">{app.applicant.email}</span>
                                    {app.applicant.applicantProfile?.course && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-sm text-gray-600">{app.applicant.applicantProfile.course}</span>
                                        </>
                                    )}
                                    {app.applicant.applicantProfile?.yearLevel && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-sm text-gray-600">{app.applicant.applicantProfile.yearLevel}</span>
                                        </>
                                    )}
                                    {(app.resumePath || app.applicant.applicantProfile?.resumePath) && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <a
                                                href={app.resumePath ? `http://localhost:5000${app.resumePath}` : `http://localhost:5000${app.applicant.applicantProfile?.resumePath}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
                                            >
                                                View Resume
                                                <ExternalLink className="w-3.5 h-3.5 ml-1" />
                                            </a>
                                        </>
                                    )}
                                </div>

                                {app.coverMessage && (
                                    <div className="mb-3 p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 italic">
                                        "{app.coverMessage}"
                                    </div>
                                )}

                                {app.applicant.applicantProfile?.skills && app.applicant.applicantProfile.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {app.applicant.applicantProfile.skills.map(skill => (
                                            <span key={skill.id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {app.matchDetails && (
                                    <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/50">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">AI Match Analysis</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="block text-green-700 font-bold mb-1">Matched Skills:</span>
                                                <div className="flex flex-wrap gap-1">
                                                     {app.matchDetails.matchedSkills.map((s:any) => <span key={s.id} className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded">{s.name}</span>)}
                                                     {app.matchDetails.matchedSkills.length === 0 && <span className="text-gray-400 italic">None required or matched</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="block text-red-700 font-bold mb-1">Missing Skills:</span>
                                                <div className="flex flex-wrap gap-1">
                                                     {app.matchDetails.missingSkills.map((s:any) => <span key={s.id} className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded">{s.name}</span>)}
                                                     {app.matchDetails.missingSkills.length === 0 && <span className="text-gray-400 italic">None</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
