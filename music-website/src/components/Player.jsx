import React, { useRef, useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, Heart, Share2, ListPlus, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toggleLikeSong, checkIsLiked, toggleSubscribe, checkIsSubscribed, addToHistory } from '../services/db';
import PlaylistModal from './PlaylistModal';

const Player = ({ currentVideo, isPlaying, onTogglePlay, onEnded, onNext, onPrev }) => {
    const { user } = useAuth();
    const [player, setPlayer] = useState(null);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [playerError, setPlayerError] = useState(null);
    const [isVideoVisible, setIsVideoVisible] = useState(true); // Default visible
    const [isLiked, setIsLiked] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [hasRecordedHistory, setHasRecordedHistory] = useState(false);

    // Initial check for like/subscribe status
    useEffect(() => {
        const checkStatus = async () => {
            if (user && currentVideo) {
                const liked = await checkIsLiked(user.uid, currentVideo.id.videoId);
                setIsLiked(liked);

                // Assuming channelId is available in snippet
                const subscribed = await checkIsSubscribed(user.uid, currentVideo.snippet.channelId);
                setIsSubscribed(subscribed);
            }
        };
        checkStatus();
        // Reset history flag when video changes
        setHasRecordedHistory(false);
    }, [currentVideo, user]);

    useEffect(() => {
        // Record history if playing, user logged in, and haven't recorded yet for this song
        if (isPlaying && user && currentVideo && !hasRecordedHistory && currentVideo?.snippet) {
            addToHistory(user.uid, currentVideo);
            setHasRecordedHistory(true);
        }
    }, [isPlaying, user, currentVideo, hasRecordedHistory]);

    // Progress bar update interval
    useEffect(() => {
        let interval;
        if (player && isPlaying) {
            interval = setInterval(() => {
                const time = player.getCurrentTime();
                setCurrentTime(time);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [player, isPlaying]);

    // Handle play/pause external control
    useEffect(() => {
        if (player) {
            if (isPlaying) {
                player.playVideo();
            } else {
                player.pauseVideo();
            }
        }
    }, [isPlaying, player]);

    // Helper to get video ID safely
    const getVideoId = (video) => {
        if (!video) return null;
        if (typeof video.id === 'string') return video.id;
        if (video.id?.videoId) return video.id.videoId;
        return null;
    };

    const videoId = getVideoId(currentVideo);

    useEffect(() => {
        console.log("Player currentVideo:", currentVideo);
        console.log("Player resolved videoId:", videoId);
    }, [currentVideo, videoId]);

    if (!videoId) {
        console.error("Invalid video object provided to Player:", currentVideo);
        return <div className="fixed bottom-24 right-4 bg-red-900 text-white p-4 rounded z-50">Error: Could not load video ID</div>;
    }

    // console.log("Player rendering for video:", videoId);

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin,
        },
    };

    const onReady = (event) => {
        setPlayer(event.target);
        setDuration(event.target.getDuration());
        event.target.setVolume(volume);
        if (isPlaying) {
            event.target.playVideo();
        }
    };

    const onStateChange = (event) => {
        console.log("Player State Change:", event.data);
        // PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
        if (event.data === 0) { // Ended
            if (onEnded) onEnded();
        }
    };

    const onPlayerError = (event) => {
        console.error("YouTube Player Error:", event.data);
        setPlayerError(`Error code: ${event.data}`);
        // Error codes:
        // 2 – The request contains an invalid parameter value.
        // 5 – The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.
        // 100 – The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.
        // 101 – The owner of the requested video does not allow it to be played in embedded players.
        // 150 – This error is the same as 101. It's just a different error code for the same issue.
    };

    const formatTime = (time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);
        if (player) {
            player.seekTo(time);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        if (player) {
            player.setVolume(newVolume);
            if (newVolume > 0 && isMuted) {
                setIsMuted(false);
                player.unMute();
            }
        }
    };

    const toggleMute = () => {
        if (player) {
            if (isMuted) {
                player.unMute();
                player.setVolume(volume);
                setIsMuted(false);
            } else {
                player.mute();
                setIsMuted(true);
            }
        }
    };

    const handleLike = async () => {
        if (!user) return alert("Please sign in to like songs");
        const newStatus = !isLiked;
        setIsLiked(newStatus); // Optimistic update
        await toggleLikeSong(user.uid, currentVideo);
    };

    const handleSubscribe = async () => {
        if (!user) return alert("Please sign in to subscribe");
        const newStatus = !isSubscribed;
        setIsSubscribed(newStatus); // Optimistic update
        await toggleSubscribe(user.uid, currentVideo.snippet.channelId, currentVideo.snippet.channelTitle);
    };

    const handleShare = () => {
        const url = `https://youtu.be/${videoId}`;
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
    };

    return (
        <>
            {/* Video Overlay - Draggable/Resizable ideally, but fixed for now */}
            <div className={`fixed bottom-24 right-4 z-40 transition-all duration-300 shadow-2xl rounded-lg overflow-hidden bg-black ${isVideoVisible ? 'w-80 h-48 opacity-100' : 'w-0 h-0 opacity-0'}`}>
                <div className="relative w-full h-full group">
                    <YouTube
                        key={videoId}
                        videoId={videoId}
                        opts={opts}
                        onReady={onReady}
                        onStateChange={onStateChange}
                        onError={onPlayerError}
                        className="w-full h-full"
                    />
                    <button
                        className="absolute top-2 right-2 bg-black/60 p-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setIsVideoVisible(false)}
                    >
                        <Minimize2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 h-24 bg-yt-dark border-t border-white/10 flex items-center justify-between px-4 z-50">

                {/* Song Info */}
                <div className="flex items-center gap-4 w-1/3 min-w-[200px]">
                    {/* Thumbnail acts as video toggle */}
                    <div className="relative group cursor-pointer" onClick={() => setIsVideoVisible(!isVideoVisible)}>
                        {currentVideo?.snippet?.thumbnails?.default?.url ? (
                            <img
                                src={currentVideo.snippet.thumbnails.default.url}
                                alt="Thumbnail"
                                className="w-14 h-14 rounded bg-gray-800 object-cover"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded bg-gray-800 flex items-center justify-center bg-zinc-800">
                                <span className="text-[10px] text-gray-500">No Img</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                            {isVideoVisible ? <Minimize2 className="w-6 h-6 text-white" /> : <Maximize2 className="w-6 h-6 text-white" />}
                        </div>
                    </div>

                    <div className="overflow-hidden hidden sm:block">
                        <h4 className="text-white font-medium text-sm truncate">{currentVideo.snippet.title}</h4>
                        <div className="flex items-center gap-2">
                            <p className="text-yt-gray text-xs truncate">{currentVideo.snippet.channelTitle}</p>
                            <button onClick={handleSubscribe} className={`text-xs font-bold hover:text-white ${isSubscribed ? 'text-yt-gray' : 'text-red-500'}`}>
                                {isSubscribed ? 'SUBSCRIBED' : 'SUBSCRIBE'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <button onClick={handleLike} className="p-2 text-yt-gray hover:text-white" title="Like">
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                        <button onClick={handleShare} className="p-2 text-yt-gray hover:text-white" title="Share">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center w-1/3">
                    <div className="flex items-center gap-6 mb-1">
                        <button onClick={onPrev} className="text-yt-gray hover:text-white transition-colors" title="Previous"><SkipBack className="w-5 h-5 fill-current" /></button>
                        <button
                            onClick={onTogglePlay}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                        >
                            {isPlaying ? <Pause className="w-5 h-5 text-black fill-current" /> : <Play className="w-5 h-5 text-black fill-current ml-1" />}
                        </button>
                        <button onClick={onNext} className="text-yt-gray hover:text-white transition-colors" title="Next"><SkipForward className="w-5 h-5 fill-current" /></button>
                    </div>
                    <div className="w-full max-w-md flex items-center gap-2 text-xs text-yt-gray">
                        <span className="w-10 text-right">{formatTime(currentTime)}</span>
                        <div className="flex-1 h-1 bg-gray-600 rounded-full relative group cursor-pointer">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="h-full bg-red-600 rounded-full relative"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow"></div>
                            </div>
                        </div>
                        <span className="w-10">{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume & Extras */}
                <div className="flex items-center justify-end gap-3 w-1/3">
                    <button
                        onClick={() => user ? setShowPlaylistModal(true) : alert("Please sign in first")}
                        className="text-yt-gray hover:text-white"
                        title="Add to Playlist"
                    >
                        <ListPlus className="w-5 h-5" />
                    </button>
                    <button onClick={handleShare} className="text-yt-gray hover:text-white" title="Share">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2 ml-2">
                        <button onClick={toggleMute} className="text-yt-gray hover:text-white">
                            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <div className="w-20 h-1 bg-gray-600 rounded-full relative group">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div
                                className="h-full bg-white rounded-full"
                                style={{ width: `${isMuted ? 0 : volume}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
            {showPlaylistModal && (
                <PlaylistModal
                    video={currentVideo}
                    onClose={() => setShowPlaylistModal(false)}
                />
            )}
        </>
    );
};

export default Player;
