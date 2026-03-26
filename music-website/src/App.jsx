import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Still used for Layout based routes if any, but Home uses it internally now
import Player from './components/Player';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Library from './pages/Library';
import Explore from './pages/Explore';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Settings from './components/Settings';
import SplashScreen from './components/SplashScreen';

function App() {
    const [currentSong, setCurrentSong] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Show splash screen for 2.5 seconds
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    const handlePlay = (video) => {
        setCurrentSong(video);
        setIsPlaying(true);
    };

    if (showSplash) {
        return <SplashScreen />;
    }

    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home onPlay={handlePlay} />} />
                <Route path="/search" element={<SearchResults onPlay={handlePlay} />} />
                <Route path="/explore" element={<Explore onPlay={handlePlay} />} />
                <Route path="/library" element={<Library onPlay={handlePlay} />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
            {/* ... Player ... */}

            {currentSong && (
                <ErrorBoundary>
                    <Player
                        currentVideo={currentSong}
                        isPlaying={isPlaying}
                        onTogglePlay={() => setIsPlaying(!isPlaying)}
                        onPrev={() => console.log("Prev clicked")}
                        onNext={() => console.log("Next clicked")}
                    />
                </ErrorBoundary>
            )}
        </>
    );
}

export default App;
