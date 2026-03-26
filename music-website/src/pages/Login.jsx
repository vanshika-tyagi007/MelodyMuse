import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const Login = () => {
    const { signInWithGoogle, signUpWithEmail, signInWithEmail, mockSendPasswordResetCode, mockConfirmPasswordReset, user } = useAuth();
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [resetStep, setResetStep] = useState('email'); // 'email', 'otp', 'password'
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isSignUp) {
            const allowedDomains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@icloud.com'];
            const isValidDomain = allowedDomains.some(domain => email.endsWith(domain));

            if (!isValidDomain) {
                setError('Please use a valid email address (@gmail.com, @yahoo.com, @outlook.com, @icloud.com)');
                return;
            }
        }

        try {
            if (isResetting) {
                if (resetStep === 'email') {
                    await mockSendPasswordResetCode(email);
                    setResetStep('otp');
                    alert('Verification code sent to your email (Check Console for Demo: 123456)');
                } else if (resetStep === 'otp') {
                    if (resetCode === '123456') {
                        setResetStep('password');
                    } else {
                        throw new Error('Invalid verification code');
                    }
                } else if (resetStep === 'password') {
                    await mockConfirmPasswordReset(resetCode, newPassword);
                    alert('Password Reset Successfully (Simulated)');
                    setIsResetting(false);
                    setResetStep('email');
                    setResetCode('');
                    setNewPassword('');
                }
                setError('');
            } else if (isSignUp) {
                await signUpWithEmail(email, password, name);
            } else {
                await signInWithEmail(email, password);
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error(error);
            setError('Failed to sign in with Google');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-yt-dark p-8 rounded-2xl shadow-2xl border border-white/10">
                <div className="text-center flex flex-col items-center">
                    <Logo size="large" />
                    <h2 className="mt-6 text-3xl font-extrabold text-white">
                        {isResetting ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Welcome Back')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Access your personalized music library
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isResetting && (
                            <>
                                {isSignUp && (
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                                            required
                                        />
                                    </div>
                                )}
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {isResetting && resetStep === 'email' && (
                            <div>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                                    required
                                />
                            </div>
                        )}

                        {isResetting && resetStep === 'otp' && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Verification Code (123456)"
                                    value={resetCode}
                                    onChange={(e) => setResetCode(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                                    required
                                />
                            </div>
                        )}

                        {isResetting && resetStep === 'password' && (
                            <div>
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity mt-2 shadow-lg shadow-red-600/20"
                        >
                            {isResetting
                                ? (resetStep === 'email' ? 'Send Code' : resetStep === 'otp' ? 'Verify Code' : 'Reset Password')
                                : (isSignUp ? 'Sign Up' : 'Sign In')
                            }
                        </button>
                    </form>

                    {!isResetting && (
                        <>
                            <div className="flex items-center justify-between text-sm">
                                <div className="text-gray-400">
                                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                                    className="font-medium text-red-500 hover:text-red-400"
                                >
                                    {isSignUp ? 'Sign In' : 'Sign Up'}
                                </button>
                            </div>

                            <div className="flex justify-center text-sm">
                                <button
                                    onClick={() => { setIsResetting(true); setError(''); }}
                                    className="text-gray-400 hover:text-white"
                                >
                                    Forgot your password?
                                </button>
                            </div>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-yt-dark text-gray-400">Or continue with</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleSignIn}
                                className="w-full flex justify-center items-center py-3 px-4 border border-white/10 rounded-lg shadow-sm text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:scale-[1.02]"
                            >
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.0003 4.75C14.0503 4.75 15.8303 5.45 17.2403 6.86L20.0703 4.03C18.0003 2.07 15.1203 1 12.0003 1C7.72031 1 3.92031 3.47 2.09031 7.01L5.94031 9.01C6.95031 6.83 9.21031 4.75 12.0003 4.75Z" fill="#EA4335" />
                                    <path d="M23.0003 12.00C23.0003 11.34 22.9403 10.68 22.8203 10.03H12.0003V14.69H18.4003C18.1803 15.89 17.5403 16.89 16.6103 17.59L20.4603 20.04C21.6903 18.81 22.4603 17.19 22.8203 15.3L23.0003 12.00Z" fill="#4285F4" />
                                    <path d="M5.94032 14.99C5.48032 13.89 5.22032 12.97 5.22032 12C5.22032 11.03 5.48032 10.11 5.94032 9.01L2.09031 7.01C0.760312 9.65 0.760312 14.35 2.09031 16.99L5.94032 14.99Z" fill="#FBBC04" />
                                    <path d="M12.0003 23C15.1203 23 17.9903 21.93 20.0703 19.97L16.6103 17.59C15.8303 18.18 14.9003 18.58 13.8703 18.84C12.8403 19.1 11.7703 19.16 10.7103 19.02C8.09031 18.68 5.89031 17.07 4.72031 14.71L0.870312 17.16C2.69031 20.53 7.00031 23 12.0003 23Z" fill="#34A853" />
                                </svg>
                                Sign in with Google
                            </button>
                        </>
                    )}

                    {isResetting && (
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={() => { setIsResetting(false); setResetStep('email'); setError(''); }}
                                className="text-sm text-gray-400 hover:text-white"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
