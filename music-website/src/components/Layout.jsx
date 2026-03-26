import React, { useState } from 'react';
import { Menu, Search, Home, Library, Music, X, Compass, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from './Logo';

const Layout = ({ children }) => {
    const { user, signIn, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const NavButton = ({ icon, label, path, onClick }) => (
        <button
            onClick={() => {
                navigate(path);
                if (onClick) onClick();
            }}
            className={`flex items-center gap-4 p-3 rounded-lg w-full transition-colors ${location.pathname === path ? 'bg-yt-dark text-white' : 'text-yt-gray hover:text-white hover:bg-yt-dark'}`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-screen bg-yt-black text-white overflow-hidden relative">
            {/* Top Navigation */}
            <nav className="h-16 flex items-center justify-between px-4 md:px-6 bg-yt-black border-b border-yt-dark z-20">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="p-2 hover:bg-yt-dark rounded-full transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate('/')}>
                        <Logo />
                    </div>
                </div>

                {/* Placeholder for center content if needed */}
                <div className="hidden md:flex w-1/3"></div>

                <div className="flex items-center gap-4 relative">
                    {user ? (
                        <>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-2 focus:outline-none"
                            >
                                {user.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        className="w-8 h-8 rounded-full border border-yt-gray cursor-pointer"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full border border-yt-gray bg-red-600 flex items-center justify-center text-white font-bold text-sm">
                                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileMenuOpen && (
                                <div className="absolute top-12 right-0 bg-yt-black border border-yt-dark rounded-lg shadow-xl w-48 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-yt-dark mb-2">
                                        <p className="text-sm font-bold text-white truncate">{user.displayName || 'User'}</p>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigate('/settings');
                                            setIsProfileMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:bg-yt-dark hover:text-white transition-colors text-left"
                                    >
                                        <SettingsIcon className="w-4 h-4" />
                                        Settings
                                    </button>
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setIsProfileMenuOpen(false);
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-yt-dark hover:text-red-300 transition-colors text-left"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Backdrop */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Drawer */}
                <aside
                    className={`
                        fixed md:static inset-y-0 left-0 z-40
                        w-64 bg-yt-black border-r border-yt-dark
                        transform transition-transform duration-300 ease-in-out
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                        flex flex-col p-4 gap-2 pt-20 md:pt-4
                    `}
                >
                    <div className="md:hidden absolute top-4 right-4">
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-yt-gray hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <NavButton icon={<Home />} label="Home" path="/" onClick={() => setIsSidebarOpen(false)} />
                    <NavButton icon={<Search />} label="Explore" path="/explore" onClick={() => setIsSidebarOpen(false)} />
                    <NavButton icon={<Library />} label="Library" path="/library" onClick={() => setIsSidebarOpen(false)} />

                    {user && (
                        <div className="mt-auto pt-4 border-t border-yt-dark">
                            <NavButton icon={<div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs">S</div>} label="Settings" path="/settings" onClick={() => setIsSidebarOpen(false)} />
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-yt-black p-4 md:p-8 scroll-smooth pb-32 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
