import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { uploadProfileImage, getHistory } from '../services/db';
import { updateProfile } from 'firebase/auth';
import { User, Lock, History, ShieldCheck, Camera, Loader } from 'lucide-react';

const Settings = () => {
    const { user, updateUserPassword, verifyEmailWithCode } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Profile State
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // History State
    const [history, setHistory] = useState([]);

    // Verification State
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        if (user) {
            if (activeTab === 'history') {
                loadHistory();
            }
        }
    }, [user, activeTab]);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await getHistory(user.uid);
            setHistory(data);
        } catch (error) {
            console.error("Error loading history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await updateProfile(user, { displayName });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        try {
            const url = await uploadProfileImage(user.uid, file);
            await updateProfile(user, { photoURL: url });
            setPhotoURL(url);
            setMessage({ type: 'success', text: 'Profile photo updated!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload image.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        setLoading(true);
        try {
            await updateUserPassword(newPassword);
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update password. You may need to re-login.' });
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async (e) => {
        e.preventDefault();
        setIsVerifying(true);
        setMessage({ type: '', text: '' });
        try {
            await verifyEmailWithCode(verificationCode);
            setMessage({ type: 'success', text: 'Email verified successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Invalid verification code.' });
        } finally {
            setIsVerifying(false);
        }
    };

    const generateCode = () => {
        console.log("VERIFICATION CODE: 123456");
        alert("A verification code has been sent to your 'email' (Console Log).");
    };

    if (!user) return <div className="text-white p-8">Please sign in to view settings.</div>;

    return (
        <div className="min-h-screen bg-yt-black text-white p-8 pl-64 pt-24">
            <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

            <div className="flex gap-8">
                {/* Sidebar */}
                <div className="w-64 flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`p-3 rounded-lg text-left flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-white/20 font-medium' : 'hover:bg-white/5 text-yt-gray'}`}
                    >
                        <User className="w-5 h-5" /> Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`p-3 rounded-lg text-left flex items-center gap-3 transition-colors ${activeTab === 'account' ? 'bg-white/20 font-medium' : 'hover:bg-white/5 text-yt-gray'}`}
                    >
                        <Lock className="w-5 h-5" /> Account & Security
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`p-3 rounded-lg text-left flex items-center gap-3 transition-colors ${activeTab === 'history' ? 'bg-white/20 font-medium' : 'hover:bg-white/5 text-yt-gray'}`}
                    >
                        <History className="w-5 h-5" /> Listening History
                    </button>
                    <button
                        onClick={() => setActiveTab('verification')}
                        className={`p-3 rounded-lg text-left flex items-center gap-3 transition-colors ${activeTab === 'verification' ? 'bg-white/20 font-medium' : 'hover:bg-white/5 text-yt-gray'}`}
                    >
                        <ShieldCheck className="w-5 h-5" /> Verification
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-yt-dark rounded-xl p-8 border border-white/10 max-w-2xl">
                    {message.text && (
                        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Profile Details</h2>
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700">
                                        {photoURL ? (
                                            <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                                                {displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                        <Camera className="w-8 h-8 text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                                <div>
                                    <p className="text-sm text-yt-gray mb-1">Profile Photo</p>
                                    <p className="text-xs text-gray-500">Click to upload. JPG or PNG.</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-yt-gray mb-2">Display Name</label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-yt-gray mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full bg-black/40 border border-white/5 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Change Password</h2>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-yt-gray mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-yt-gray mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Listening History</h2>
                                <button onClick={loadHistory} className="text-sm text-yt-gray hover:text-white">Refresh</button>
                            </div>

                            {loading && <div className="text-center py-8"><Loader className="w-8 h-8 animate-spin mx-auto text-yt-gray" /></div>}

                            {!loading && history.length === 0 && <p className="text-yt-gray text-center py-8">No history found.</p>}

                            <div className="space-y-2">
                                {history.map((song) => (
                                    <div key={song.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg group">
                                        <img src={song.snippet?.thumbnails?.default?.url} alt={song.snippet?.title} className="w-10 h-10 rounded object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{song.snippet?.title}</h4>
                                            <p className="text-sm text-yt-gray truncate">{song.snippet?.channelTitle}</p>
                                        </div>
                                        <div className="text-xs text-yt-gray">
                                            {song.playedAt?.toDate().toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'verification' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Email Verification</h2>
                            <p className="text-yt-gray">Verify your email address to secure your account.</p>

                            <button
                                onClick={generateCode}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                                Send Verification Code
                            </button>

                            <form onSubmit={handleVerification} className="space-y-4 mt-4">
                                <div>
                                    <label className="block text-sm text-yt-gray mb-2">Enter OTP Code</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            placeholder="XXXXXX"
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-center tracking-widest text-xl focus:outline-none focus:border-green-500"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isVerifying}
                                    className="w-full bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {isVerifying ? 'Verifying...' : 'Verify Email'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
