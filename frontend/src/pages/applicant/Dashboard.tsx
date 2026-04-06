import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
    Briefcase, MapPin, CheckCircle, Clock, UploadCloud,
    Sparkles, AlertCircle, ChevronDown, ChevronUp,
    ShieldCheck, ShieldAlert, Shield, Building2
} from 'lucide-react';
import { getMatchColor } from '../../utils/colorUtils';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MatchDetails {
    matchedSkills: string[];
    missingSkills: string[];
    totalRequired: number;
    totalMatched: number;
    matchPercentage: number;
    confidence: 'High' | 'Medium' | 'Low';
    reason: string;
}

interface Match {
    id: number;
    title: string;
    description: string;
    location: string;
    matchScore: number;
    matchedSkills?: { id: number; name: string }[];
    missingSkills?: { id: number; name: string }[];
    matchDetails?: MatchDetails;
    employer: { 
        companyName: string;
        industry?: string | null;
        description?: string | null;
        location?: string | null;
        latitude?: number | null;
        longitude?: number | null;
        user: { name: string };
    };
}

interface Application {
    id: number;
    status: string;
    internship: {
        title: string;
        employer: { user: { name: string } };
    };
}

interface ProfileData {
    resumePath: string | null;
    skills: { id: number; name: string }[];
}

// ── Confidence Badge ──────────────────────────────────────────────────────────
function ConfidenceBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
    const config = {
        High:   { icon: ShieldCheck,  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'High Confidence' },
        Medium: { icon: ShieldAlert,  cls: 'bg-amber-50 text-amber-700 border-amber-200',       label: 'Medium Confidence' },
        Low:    { icon: Shield,       cls: 'bg-red-50 text-red-700 border-red-200',             label: 'Low Confidence' },
    }[level];
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.cls}`}>
            <Icon className="h-3 w-3" /> {config.label}
        </span>
    );
}

// ── Match Analysis Panel ──────────────────────────────────────────────────────
function MatchAnalysisPanel({ details, matchScore }: { details: MatchDetails; matchScore: number }) {
    return (
        <div className="mt-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-violet-50/40 p-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wide">
                    <Sparkles className="h-3.5 w-3.5" /> AI Match Analysis
                </span>
                <ConfidenceBadge level={details.confidence} />
            </div>

            {/* Breakdown bar */}
            <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Skill Match</span>
                    <span className="font-semibold text-gray-700">
                        {details.totalMatched}/{details.totalRequired} skills ({matchScore}%)
                    </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${
                            matchScore >= 70 ? 'bg-emerald-500' :
                            matchScore >= 40 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${matchScore}%` }}
                    />
                </div>
            </div>

            {/* Skills grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Matched */}
                <div>
                    <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Matched Skills
                    </p>
                    {details.matchedSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {details.matchedSkills.map(skill => (
                                <span key={skill} className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400 italic">None matched</span>
                    )}
                </div>

                {/* Missing */}
                <div>
                    <p className="text-[11px] font-bold text-red-600 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Missing Skills
                    </p>
                    {details.missingSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {details.missingSkills.map(skill => (
                                <span key={skill} className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-xs text-emerald-600 font-medium">None — you meet all requirements!</span>
                    )}
                </div>
            </div>

            {/* AI Reason */}
            {details.reason && (
                <div className="rounded-lg bg-white/70 border border-indigo-100 px-3 py-2.5">
                    <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> AI Explanation
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">{details.reason}</p>
                </div>
            )}
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ApplicantDashboard() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Expanded analysis panel per card
    const [expandedId, setExpandedId] = useState<number | null>(null);

    // Apply modal
    const [selectedInternshipId, setSelectedInternshipId] = useState<number | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [coverMessage, setCoverMessage] = useState('');
    const [applying, setApplying] = useState(false);

    // Employer Modal
    const [selectedEmployer, setSelectedEmployer] = useState<Match['employer'] | null>(null);

    // Gate upload
    const [gateResumeFile, setGateResumeFile] = useState<File | null>(null);
    const [gateUploading, setGateUploading] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [profileRes, appsRes] = await Promise.all([
                api.get('/applicant/profile'),
                api.get('/applicant/applications'),
            ]);

            const profileData: ProfileData = {
                resumePath: profileRes.data.resumePath || null,
                skills: profileRes.data.skills || [],
            };
            setProfile(profileData);
            setApplications(appsRes.data);

            if (profileData.resumePath) {
                const matchesRes = await api.get('/matches');
                setMatches(matchesRes.data);
            }
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleGateResumeUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gateResumeFile) return;
        setGateUploading(true);
        try {
            const formData = new FormData();
            formData.append('resume', gateResumeFile);
            const res = await api.post('/applicant/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { skills, usedFallback } = res.data;
            if (skills?.length === 0) {
                toast('Resume saved, but no skills detected. Try a text-based PDF.', { icon: '⚠️' });
            } else if (usedFallback) {
                toast.success(`${skills.length} skills detected via keyword scan!`);
            } else {
                toast.success(`${skills.length} skills extracted by AI — loading matches!`);
            }
            setGateResumeFile(null);
            setLoading(true);
            await fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.response?.data?.error || 'Failed to upload resume.');
        } finally {
            setGateUploading(false);
        }
    };

    const handleApplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInternshipId || !resumeFile) return;
        setApplying(true);
        try {
            const formData = new FormData();
            formData.append('internshipId', selectedInternshipId.toString());
            formData.append('resume', resumeFile);
            if (coverMessage) formData.append('coverMessage', coverMessage);
            await api.post('/applicant/apply', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Application submitted successfully!');
            setSelectedInternshipId(null);
            setResumeFile(null);
            setCoverMessage('');
            await fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to apply');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
        );
    }

    if (error) return <div className="text-red-500 p-4">{error}</div>;

    // ── RESUME GATE ──────────────────────────────────────────────────────────
    if (profile && !profile.resumePath) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-indigo-500 to-violet-500" />
                        <div className="p-8 text-center space-y-4">
                            <div className="mx-auto h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner">
                                <Sparkles className="h-8 w-8 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Your account has been approved! 🎉</h1>
                                <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                                    Upload your resume so <span className="font-semibold text-indigo-600">SkillMatch</span> can analyze your skills and match you with relevant internships.
                                </p>
                            </div>
                            <div className="bg-indigo-50 rounded-xl p-4 text-left space-y-2 text-sm text-indigo-800">
                                <p className="font-semibold text-indigo-900 mb-2">How it works:</p>
                                {['Upload a text-based PDF resume', 'Gemini AI extracts your technical skills', 'SkillMatch scores each internship against your skills', 'See match %, matched skills, missing skills & AI explanation'].map((s, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <span className="mt-0.5 text-indigo-500 font-bold">{i + 1}.</span>
                                        <span>{s}</span>
                                    </div>
                                ))}
                            </div>
                            <form onSubmit={handleGateResumeUpload} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Resume (PDF only) <span className="text-red-500">*</span></label>
                                    <input required type="file" accept=".pdf" onChange={e => setGateResumeFile(e.target.files?.[0] || null)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 text-sm focus:ring-2 focus:ring-indigo-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                    <p className="text-xs text-gray-400 mt-1">Use a text-based PDF (not a scanned image). Clearly list your technical skills.</p>
                                </div>
                                <button type="submit" disabled={gateUploading || !gateResumeFile}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed">
                                    <UploadCloud className="h-5 w-5" />
                                    {gateUploading ? 'Uploading & Analyzing...' : 'Upload Resume & Get Matches'}
                                </button>
                            </form>
                        </div>
                    </div>
                    <p className="mt-4 text-center text-xs text-gray-400">You can re-upload your resume at any time from the Profile page.</p>
                </div>
            </div>
        );
    }

    // ── MAIN DASHBOARD ───────────────────────────────────────────────────────
    return (
        <div className="space-y-6 relative">
            {/* Apply Modal */}
            {selectedInternshipId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Apply for Internship</h2>
                            <button onClick={() => setSelectedInternshipId(null)} className="text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>
                        </div>
                        <form onSubmit={handleApplySubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF) <span className="text-red-500">*</span></label>
                                <input required type="file" accept=".pdf" onChange={e => setResumeFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Message (Optional)</label>
                                <textarea rows={4} value={coverMessage} onChange={e => setCoverMessage(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Introduce yourself..." />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setSelectedInternshipId(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">Cancel</button>
                                <button type="submit" disabled={applying || !resumeFile} className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm disabled:opacity-50">
                                    {applying ? 'Submitting...' : 'Submit Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedEmployer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-indigo-600" />
                                {selectedEmployer.companyName || selectedEmployer.user.name}'s Profile
                            </h2>
                            <button onClick={() => setSelectedEmployer(null)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">&times;</button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Industry</p>
                                    <p className="text-gray-900 font-medium">{selectedEmployer.industry || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Location</p>
                                    <p className="text-gray-900 font-medium">{selectedEmployer.location || 'Not specified'}</p>
                                </div>
                            </div>

                            {selectedEmployer.description && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">About the Company</p>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 border border-gray-100 rounded-xl">{selectedEmployer.description}</p>
                                </div>
                            )}

                            {selectedEmployer.latitude && selectedEmployer.longitude && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                        <MapPin className="w-4 h-4" /> Company Location Map
                                    </p>
                                    <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200">
                                        <MapContainer center={[selectedEmployer.latitude, selectedEmployer.longitude]} zoom={15} className="h-full w-full">
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <Marker position={[selectedEmployer.latitude, selectedEmployer.longitude]} />
                                        </MapContainer>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end mt-6 border-t border-gray-100 pt-4">
                                <button onClick={() => setSelectedEmployer(null)} className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-offset-2">Close Profile</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-2xl font-bold text-gray-900">Recommended Internships</h1>
                {profile && profile.skills.length > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        Matched using {profile.skills.length} skills from your resume
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Match cards */}
                <div className="lg:col-span-2 space-y-4">
                    {matches.map(match => {
                        const hasApplied = applications.some(
                            a => a.internship.title === match.title &&
                                 a.internship.employer.user.name === match.employer.user.name
                        );
                        const isExpanded = expandedId === match.id;
                        const details = match.matchDetails;

                        return (
                            <div key={match.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                                {/* Top row */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-lg font-semibold text-gray-900">{match.title}</h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getMatchColor(match.matchScore)}`}>
                                                {match.matchScore}% Match
                                            </span>
                                            {details && <ConfidenceBadge level={details.confidence} />}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-4 flex-wrap">
                                            <button 
                                                onClick={() => setSelectedEmployer(match.employer)}
                                                className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition"
                                            >
                                                <Briefcase className="w-4 h-4" /> {match.employer.companyName || match.employer.user.name}
                                            </button>
                                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {match.location || 'Remote'}</span>
                                        </p>
                                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{match.description}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 shrink-0">
                                        <button onClick={() => setSelectedInternshipId(match.id)} disabled={hasApplied}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium ${hasApplied
                                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:scale-[1.02] transition-transform'}`}>
                                            {hasApplied ? 'Applied ✓' : 'Apply Now'}
                                        </button>
                                    </div>
                                </div>

                                {/* Quick skill preview (collapsed) */}
                                {!isExpanded && details && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {details.matchedSkills.slice(0, 4).map(s => (
                                            <span key={s} className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{s}</span>
                                        ))}
                                        {details.missingSkills.slice(0, 3).map(s => (
                                            <span key={s} className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-red-50 text-red-600 border border-red-200">{s}</span>
                                        ))}
                                        {(details.matchedSkills.length + details.missingSkills.length) > 7 && (
                                            <span className="px-2 py-0.5 text-[11px] text-gray-400">+{(details.matchedSkills.length + details.missingSkills.length) - 7} more</span>
                                        )}
                                    </div>
                                )}

                                {/* Expand / collapse toggle */}
                                {details && (
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : match.id)}
                                        className="mt-3 flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                                    >
                                        {isExpanded ? <><ChevronUp className="h-3.5 w-3.5" /> Hide Analysis</> : <><ChevronDown className="h-3.5 w-3.5" /> View AI Match Analysis</>}
                                    </button>
                                )}

                                {/* Expanded analysis panel */}
                                {isExpanded && details && (
                                    <MatchAnalysisPanel details={details} matchScore={match.matchScore} />
                                )}
                            </div>
                        );
                    })}

                    {matches.length === 0 && (
                        <div className="bg-white p-8 text-center rounded-xl border border-gray-100">
                            <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No matches found yet.</p>
                            <p className="text-gray-400 text-sm mt-1">Your resume has been uploaded — check back soon, or upload a more detailed resume to improve matching.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar — Recent Applications */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        {applications.slice(0, 5).map(app => (
                            <div key={app.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                <h4 className="font-medium text-sm text-gray-900">{app.internship.title}</h4>
                                <p className="text-xs text-gray-500">{app.internship.employer.user.name}</p>
                                <div className="mt-2 flex items-center">
                                    {app.status === 'PENDING' ? (
                                        <span className="flex items-center text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                            <Clock className="w-3 h-3 mr-1" /> Pending Review
                                        </span>
                                    ) : app.status === 'ACCEPTED' ? (
                                        <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Accepted
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {app.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {applications.length > 5 && (
                            <Link
                                to="/applicant/applications"
                                className="block w-full text-center py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100/50"
                            >
                                View All Applications
                            </Link>
                        )}
                        {applications.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No applications sent yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
