import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SongCard from '../components/SongCard';
import { useAuth } from '../hooks/useAuth';
import { getLikedSongs, getPlaylists } from '../services/db';
import { PlayCircle, Music } from 'lucide-react';

const Library = ({ onPlay }) => {
    const { user } = useAuth();
    const [likedSongs, setLikedSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [expandedPlaylist, setExpandedPlaylist] = useState(null);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        const liked = await getLikedSongs(user.uid);
        setLikedSongs(liked);
        const lists = await getPlaylists(user.uid);
        setPlaylists(lists);
    };

    if (!user) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-full text-yt-gray">
                    <p className="text-xl">Please sign in to view your library.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">My Library</h1>

                {/* Playlists Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Music className="w-6 h-6" /> Playlists
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {playlists.map(playlist => (
                            <div
                                key={playlist.id}
                                className="bg-yt-dark p-4 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                                onClick={() => setExpandedPlaylist(expandedPlaylist === playlist.id ? null : playlist.id)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-lg">{playlist.name}</h3>
                                    <span className="text-xs text-yt-gray bg-white/10 px-2 py-1 rounded-full">
                                        {playlist.songs?.length || 0} songs
                                    </span>
                                </div>
                                {expandedPlaylist === playlist.id && (
                                    <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
                                        {playlist.songs && playlist.songs.map((song, idx) => (
                                            <div
                                                key={`${song.id.videoId}-${idx}`}
                                                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded group"
                                                onClick={(e) => { e.stopPropagation(); onPlay(song); }}
                                            >
                                                <img src={song.snippet.thumbnails.default.url} className="w-8 h-8 rounded" alt="" />
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm font-medium truncate text-white">{song.snippet.title}</p>
                                                </div>
                                                <PlayCircle className="w-5 h-5 opacity-0 group-hover:opacity-100 text-white" />
                                            </div>
                                        ))}
                                        {(!playlist.songs || playlist.songs.length === 0) && (
                                            <p className="text-sm text-yt-gray italic">No songs yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {playlists.length === 0 && <p className="text-yt-gray">No playlists yet.</p>}
                    </div>
                </div>

                {/* Liked Songs Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Liked Songs</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {likedSongs.map((video) => (
                            <SongCard
                                key={video.id.videoId}
                                video={video}
                                onPlay={onPlay}
                            />
                        ))}
                        {likedSongs.length === 0 && <p className="text-yt-gray">No liked songs yet.</p>}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Library;
