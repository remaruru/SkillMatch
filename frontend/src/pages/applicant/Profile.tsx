import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LocationPicker from '../../components/LocationPicker';
import { UploadCloud, CheckCircle2, FileText, X } from 'lucide-react';

const COURSE_OPTIONS = ['BSIT', 'BSCS', 'BSIS', 'BSECE', 'BSCE', 'BSEE', 'Other'];

interface Skill {
    id: number;
    name: string;
}

interface ProfileData {
    course: string;
    yearLevel: string;
    locationPreference: string;
    latitude: number;
    longitude: number;
    resumePath: string | null;
    skills: Skill[];
}

export default function ApplicantProfile() {
    const [profile, setProfile] = useState<ProfileData>({
        course: '',
        yearLevel: '',
        locationPreference: '',
        latitude: 14.5995,
        longitude: 120.9842,
        resumePath: null,
        skills: []
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/applicant/profile');
            const data = res.data;
            setProfile({
                course: data.course || '',
                yearLevel: data.yearLevel || '',
                locationPreference: data.locationPreference || '',
                latitude: data.latitude || 14.5995,
                longitude: data.longitude || 120.9842,
                resumePath: data.resumePath || null,
                skills: data.skills || []
            });
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleBasicInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/applicant/profile', {
                course: profile.course,
                yearLevel: profile.yearLevel,
                locationPreference: profile.locationPreference,
                latitude: profile.latitude,
                longitude: profile.longitude,
            });
            toast.success('Academic details updated successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleResumeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resumeFile) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);

            const res = await api.post('/applicant/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { skills, usedFallback, message } = res.data;

            if (skills?.length === 0) {
                toast('No technical skills detected. Try a clearer text-based PDF.', { icon: '⚠️' });
            } else if (usedFallback) {
                toast.success(`${skills.length} skills detected via keyword scan. Upload again for AI analysis when available.`);
            } else {
                toast.success(message || `${skills.length} skills extracted successfully!`);
            }

            setResumeFile(null);
            await fetchProfile();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to upload resume.');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in duration-300">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
                <p className="text-gray-500 mt-1">Keep your academic info up to date and upload your resume to let AI match you with internships.</p>
            </div>

            <div className="space-y-8">
                {/* Academic Info Module */}
                <form onSubmit={handleBasicInfoSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Academic & Location Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course <span className="text-red-500">*</span></label>
                            <select required value={profile.course} onChange={e => setProfile({ ...profile, course: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select Course</option>
                                {COURSE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                            <select value={profile.yearLevel} onChange={e => setProfile({ ...profile, yearLevel: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                                <option value="">Select Year</option>
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                                <option value="5">5th Year+</option>
                            </select>
                        </div>
                    </div>
                    <LocationPicker
                        address={profile.locationPreference}
                        latitude={profile.latitude}
                        longitude={profile.longitude}
                        onChange={(loc) => setProfile(prev => ({ ...prev, locationPreference: loc.address, latitude: loc.latitude, longitude: loc.longitude }))}
                    />
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="submit" disabled={saving} className="px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Academic Details'}
                        </button>
                    </div>
                </form>

                {/* Resume Upload + AI Skills Module */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-2">Resume & AI Skill Extraction</h2>

                    {/* Current resume status */}
                    {profile.resumePath ? (
                        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-green-700">Resume on file</p>
                                <p className="text-xs text-green-600">Upload a new PDF below to update your skills.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <FileText className="h-5 w-5 text-amber-600 shrink-0" />
                            <p className="text-sm font-medium text-amber-700">No resume uploaded yet. Upload a PDF to enable internship matching.</p>
                        </div>
                    )}

                    {/* Upload form */}
                    <form onSubmit={handleResumeSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {profile.resumePath ? 'Replace Resume (PDF only)' : 'Upload Resume (PDF only)'} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    required
                                    type="file"
                                    accept=".pdf"
                                    onChange={e => setResumeFile(e.target.files?.[0] || null)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Gemini AI will automatically extract your technical skills from the resume to power internship matching.
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={uploading || !resumeFile}
                                className="flex items-center gap-2 px-5 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50"
                            >
                                <UploadCloud className="h-4 w-4" />
                                {uploading ? 'Uploading & Analyzing...' : 'Upload & Extract Skills'}
                            </button>
                        </div>
                    </form>

                    {/* Extracted skills display (read-only) */}
                    {profile.skills && profile.skills.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-sm font-semibold text-gray-700 mb-3">
                                AI-Extracted Skills <span className="text-gray-400 font-normal">({profile.skills.length} skills from your resume)</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map(skill => (
                                    <span
                                        key={skill.id}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-3">
                                These skills are automatically updated each time you upload a new resume. They cannot be edited manually.
                            </p>
                        </div>
                    )}

                    {profile.resumePath && profile.skills && profile.skills.length === 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-sm text-gray-400 italic">No skills were extracted from your resume. Try uploading a text-based PDF with clearly listed technical skills.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
