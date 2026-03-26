import React from 'react';
import Logo from './Logo';

const SplashScreen = () => {
    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100] animate-fade-out">
            <div className="flex flex-col items-center">
                <div className="relative mb-6 animate-float">
                    <div className="absolute inset-0 bg-red-600 blur-3xl opacity-20 animate-pulse-glow rounded-full"></div>
                    <Logo size="large" />
                </div>
                <p className="text-yt-gray mt-4 text-sm animate-title-slide-up" style={{ animationDelay: '0.2s' }}>
                    Your world of music
                </p>
            </div>
        </div>
    );
};

export default SplashScreen;
