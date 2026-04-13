import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Briefcase, FileText, Settings, Shield, Menu, X } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = {
        APPLICANT: [
            { name: 'Dashboard', href: '/applicant', icon: LayoutDashboard },
            { name: 'My Applications', href: '/applicant/applications', icon: FileText },
            { name: 'Profile', href: '/applicant/profile', icon: Settings },
        ],
        EMPLOYER: [
            { name: 'Dashboard', href: '/employer', icon: LayoutDashboard },
            { name: 'Internships', href: '/employer/internships', icon: Briefcase },
            { name: 'Company Profile', href: '/employer/profile', icon: Settings },
        ],
        ADMIN: [
            { name: 'Dashboard', href: '/admin', icon: Shield },
        ],
    };

    const currentNavItems = user ? navItems[user.role] : [];

    return (
        <div className="min-h-screen bg-gray-50 flex">

            {/* ── DESKTOP Sidebar (md+) ──────────────────────────────────── */}
            <div className="hidden md:flex w-64 bg-white shadow-lg flex-col flex-shrink-0">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <Briefcase className="h-8 w-8 text-primary-600 mr-3" />
                    <span className="text-xl font-bold text-gray-900">SkillMatch</span>
                </div>

                <div className="px-6 py-4 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {currentNavItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-700' : 'text-gray-400'}`}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-red-500" />
                        Logout
                    </button>
                </div>
            </div>

            {/* ── MOBILE Drawer overlay ─────────────────────────────────── */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            {/* ── MOBILE Slide-in Drawer ────────────────────────────────── */}
            <div className={`fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 md:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Drawer header */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-7 w-7 text-indigo-600" />
                        <span className="text-lg font-bold text-gray-900">SkillMatch</span>
                    </div>
                    <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User info */}
                <div className="px-5 py-4 border-b border-gray-100 bg-indigo-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-700 font-bold text-sm">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                            <p className="text-xs text-indigo-600 capitalize font-medium">{user?.role.toLowerCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {currentNavItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setDrawerOpen(false)}
                                className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${isActive
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-all"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-red-500" />
                        Logout
                    </button>
                </div>
            </div>

            {/* ── Main content area ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                {/* ── MOBILE Top bar ── */}
                <header className="md:hidden h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-6 w-6 text-indigo-600" />
                        <span className="text-base font-bold text-gray-900">SkillMatch</span>
                    </div>
                    <NotificationsDropdown />
                </header>

                {/* ── DESKTOP Top bar ── */}
                <header className="hidden md:flex h-16 bg-white border-b border-gray-100 items-center justify-end px-8 flex-shrink-0">
                    <NotificationsDropdown />
                </header>

                {/* ── Page content ── */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 pb-24 md:pb-8">
                    <Outlet />
                </main>

                {/* ── MOBILE Bottom Tab Bar ────────────────────────────── */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-around py-2">
                        {currentNavItems.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <span className={`text-[10px] font-semibold ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                                        {item.name.split(' ')[0]}
                                    </span>
                                    {isActive && <span className="w-1 h-1 rounded-full bg-indigo-600" />}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </div>
    );
}
