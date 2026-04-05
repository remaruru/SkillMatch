import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Briefcase, FileText, Settings, Shield } from 'lucide-react';
import NotificationsDropdown from './NotificationsDropdown';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

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
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg flex flex-col">
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
                                    className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-primary-700' : 'text-gray-400'
                                        }`}
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

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header with Notifications */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-8 flex-shrink-0">
                    <NotificationsDropdown />
                </header>

                <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
