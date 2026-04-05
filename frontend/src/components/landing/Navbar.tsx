import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const element = document.getElementById(href.substring(1));
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
            setIsOpen(false);
        }
    };

    const links = [
        { name: 'Home', href: '#home' },
        { name: 'The Problem', href: '#problem' },
        { name: 'Solution', href: '#solution' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Features', href: '#features' },
        { name: 'Testimonials', href: '#testimonials' },
    ];

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-white shadow-sm h-16 flex items-center justify-between px-8">
            <div className="flex-shrink-0 flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2">
                    <BriefcaseBusiness className="w-6 h-6 text-indigo-600" />
                    <span className="text-xl font-bold text-gray-900">SkillMatch</span>
                </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex flex-1 justify-center space-x-8">
                {links.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        onClick={(e) => handleScroll(e, link.href)}
                        className="text-gray-600 hover:text-indigo-600 font-medium transition-colors hover:border-b-2 hover:border-indigo-600 pb-1"
                    >
                        {link.name}
                    </a>
                ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
                <Link
                    to="/login"
                    className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                    Login
                </Link>
                <Link
                    to="/register?role=applicant"
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    Register
                </Link>
            </div>

            {/* Mobile Actions */}
            <div className="md:hidden flex items-center">
                <button
                    onClick={toggleMenu}
                    className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 p-2"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden absolute top-16 inset-x-0 bg-white border-b border-gray-100 shadow-lg"
                    >
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            {links.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => handleScroll(e, link.href)}
                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="border-t border-gray-100 my-2 pt-2"></div>
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register?role=applicant"
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 mt-1 rounded-md text-base font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                            >
                                Sign Up as Student
                            </Link>
                            <Link
                                to="/register?role=employer"
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 mt-1 rounded-md text-base font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                            >
                                Sign Up as Employer
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
