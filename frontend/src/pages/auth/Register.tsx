import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { UserPlus, Lock } from 'lucide-react';
import { BackButton } from '../../components/BackButton';

const COURSE_OPTIONS = ['BSIT', 'BSCS', 'BSIS', 'BSECE', 'BSCE', 'BSEE', 'Other'];

export default function Register() {
    const [searchParams] = useSearchParams();
    const urlRole = searchParams.get('role')?.toUpperCase() === 'EMPLOYER' ? 'EMPLOYER' : 'APPLICANT';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: urlRole,
        // Applicant specific
        course: '',
        yearLevel: '',
        skills: '',
        // Employer specific
        companyName: '',
        industry: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [schoolIdFile, setSchoolIdFile] = useState<File | null>(null);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    // Sync role if URL query changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, role: urlRole }));
    }, [urlRole]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.role === 'APPLICANT' && !formData.course) {
            setError('Course selection is required for students');
            return;
        }

        setLoading(true);

        try {
            const formDataObj = new FormData();
            formDataObj.append('name', formData.name);
            formDataObj.append('email', formData.email);
            formDataObj.append('password', formData.password);
            formDataObj.append('role', formData.role);

            if (formData.role === 'APPLICANT') {
                formDataObj.append('course', formData.course);
                formDataObj.append('yearLevel', formData.yearLevel);
                if (formData.skills) {
                    formData.skills.split(',').map(s => s.trim()).filter(s => s).forEach(skill => {
                        formDataObj.append('skills[]', skill);
                    });
                }
                if (!schoolIdFile) {
                    setError('School ID image is required to register');
                    setLoading(false);
                    return;
                }
                formDataObj.append('schoolId', schoolIdFile);
            } else if (formData.role === 'EMPLOYER') {
                formDataObj.append('companyName', formData.companyName || formData.name);
                formDataObj.append('industry', formData.industry);
            }

            const response = await api.post('/auth/register', formDataObj, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.message && response.data.message.includes('Pending')) {
                setShowPendingModal(true);
                return;
            }

            login(response.data.token, response.data.user);

            const role = response.data.user.role;
            if (role === 'ADMIN') navigate('/admin');
            else if (role === 'EMPLOYER') navigate('/employer');
            else navigate('/applicant');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative">

            {showTermsModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 py-8" onClick={() => setShowTermsModal(false)}>
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 relative flex flex-col max-h-full animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowTermsModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 pb-1 px-2 rounded-full hover:bg-gray-100 transition focus:outline-none text-xl font-bold"
                        >
                            ✕
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 border-b pb-4 mb-4">Terms of Service & Privacy Policy</h2>
                        <div className="overflow-y-auto pr-2 space-y-6 text-gray-600 text-sm">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Data Collection</h3>
                                <p>SkillMatch collects identification documents (such as Student IDs or Company Verification) exclusively for the purpose of identity verification on our platform. We do not use this data for marketing or external profiling.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Data Visibility</h3>
                                <p>Uploaded verification documents are strictly restricted. Student IDs and Employer Registration documents are visible only to platform administrators. They are <strong>never</strong> visible to employers, external candidates, or the public.</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Data Protection & Storage</h3>
                                <p>All personal documents are securely stored inside our internal ecosystem. Your data is never sold, traded, or shared with third parties under any circumstances.</p>
                            </div>
                        </div>
                        <div className="mt-8 pt-4 border-t flex justify-end">
                            <button
                                onClick={() => {
                                    setAcceptedTerms(true);
                                    setShowTermsModal(false);
                                }}
                                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                            >
                                I Accept
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPendingModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-6">
                            <span className="text-yellow-600 text-3xl">⏳</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted!</h2>
                        <p className="text-gray-600 mb-6">
                            Your account has been successfully created. However, for security purposes, it requires <span className="font-semibold text-gray-900">Admin Approval</span> before you can log in.
                            <br /><br />
                            We will review your registration shortly.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
                        >
                            Return to Login
                        </button>
                    </div>
                </div>
            )}

            <div className="absolute top-8 left-8">
                <BackButton label="Back to Home" />
            </div>

            <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-start mt-12 sm:mt-0">
                <div className="flex-1 w-full max-w-xl space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-gray-200 mx-auto">
                    <div>
                    <div className="mx-auto h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner">
                        <UserPlus className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                            Sign in here
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Role Selection Tabs */}
                    <div className="flex rounded-lg shadow-sm p-1 bg-gray-100">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'APPLICANT' })}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.role === 'APPLICANT' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Student Applicant
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'EMPLOYER' })}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.role === 'EMPLOYER' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Company Employer
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {formData.role === 'EMPLOYER' ? 'Contact Name' : 'Full Name'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 placeholder-gray-400"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* APPLICANT SPECIFIC FIELDS */}
                        {formData.role === 'APPLICANT' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Course <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.course}
                                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                                    >
                                        <option value="">Select Course</option>
                                        {COURSE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                                    <select
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.yearLevel}
                                        onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
                                    >
                                        <option value="">Select Year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                        <option value="5">5th Year+</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Skills (comma separated)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g. React, Node.js, Python, Figma"
                                        value={formData.skills}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">School ID Image <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="file"
                                        accept="image/*"
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-500"
                                        onChange={(e) => setSchoolIdFile(e.target.files?.[0] || null)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">This will only be used by Admins to verify your student status.</p>
                                </div>
                            </div>
                        )}

                        {/* EMPLOYER SPECIFIC FIELDS */}
                        {formData.role === 'EMPLOYER' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-cyan-50/50 rounded-xl border border-cyan-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                        placeholder="TechCorp Inc."
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                                        placeholder="e.g. Software, Finance, Healthcare"
                                        value={formData.industry}
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 mt-6 mb-6 pb-2 border-t pt-6 border-gray-100">
                        <div className="flex h-6 items-center">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                            />
                        </div>
                        <div className="text-sm">
                            <label htmlFor="terms" className="font-medium text-gray-700 cursor-pointer">
                                I agree to the SkillMatch{' '}
                                <button type="button" onClick={() => setShowTermsModal(true)} className="text-indigo-600 font-semibold hover:text-indigo-500 underline focus:outline-none">Terms of Service and Data Privacy Policy</button>.
                            </label>
                            <p className="text-gray-500 mt-1">I understand that my uploaded identification will be used only for verification purposes.</p>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading || !acceptedTerms}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-base font-semibold text-white transition-all 
                                ${(loading || !acceptedTerms) ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Privacy Panel */}
            <div className="w-full lg:w-[400px] order-first lg:order-last bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white sticky top-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                        <Lock className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Your Privacy Matters</h3>
                </div>
                <div className="space-y-4 text-sm text-gray-600">
                    <p className="font-medium text-gray-800">To maintain a trusted internship platform, SkillMatch requires student identity verification.</p>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-0.5 font-bold">•</span>
                            <span>Your School ID is used <strong>only</strong> to confirm that you are a legitimate student applicant.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-0.5 font-bold">•</span>
                            <span>This information is reviewed <strong>solely by the platform administrator</strong> for verification purposes.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-0.5 font-bold">•</span>
                            <span>Your ID will <strong>never</strong> be shared with employers or other users.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-indigo-500 mt-0.5 font-bold">•</span>
                            <span>Once verified, your personal documents remain securely stored and are not publicly visible.</span>
                        </li>
                    </ul>
                </div>
            </div>
            </div>
        </div>
    );
}
