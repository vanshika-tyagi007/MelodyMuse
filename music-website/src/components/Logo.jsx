import React from 'react';
import { Music } from 'lucide-react';

const Logo = ({ size = "medium", className = "" }) => {
    const isLarge = size === "large";
    const iconSize = isLarge ? "w-10 h-10" : "w-8 h-8";
    const textSize = isLarge ? "text-3xl" : "text-xl";

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="bg-gradient-to-br from-red-600 to-red-800 p-2 rounded-lg shadow-lg shadow-red-500/20">
                <Music className={`${iconSize} text-white`} />
            </div>
            <span className={`${textSize} font-bold bg-gradient-to-r from-white via-red-100 to-red-500 bg-clip-text text-transparent tracking-tight`}>
                MelodyMuse
            </span>
        </div>
    );
};

export default Logo;
