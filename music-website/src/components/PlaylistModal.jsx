import React, { useState, useEffect } from 'react';
import { X, Plus, Music } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { createPlaylist, getPlaylists, addToPlaylist } from '../services/db';

const PlaylistModal = ({ video, onClose }) => {
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (user) {
            loadPlaylists();
        }
    }, [user]);

    const loadPlaylists = async () => {
        const lists = await getPlaylists(user.uid);
        setPlaylists(lists);
    };

    const handleCreate = async () => {
        if (!newPlaylistName.trim()) return;
        await createPlaylist(user.uid, newPlaylistName);
        setNewPlaylistName('');
        setIsCreating(false);
        loadPlaylists();
    };

    const handleAddToPlaylist = async (playlistId) => {
        await addToPlaylist(user.uid, playlistId, video);
        onClose();
        alert('Added to playlist!');
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-yt-dark w-full max-w-md rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white">Save to playlist</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 max-h-96 overflow-y-auto">
                    {playlists.map((playlist) => (
                        <button
                            key={playlist.id}
                            onClick={() => handleAddToPlaylist(playlist.id)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg group text-left"
                        >
                            <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                                <Music className="w-6 h-6 text-gray-400 group-hover:text-white" />
                            </div>
                            <div>
                                <h4 className="font-medium text-white">{playlist.name}</h4>
                                <p className="text-sm text-gray-400">{playlist.songs?.length || 0} songs</p>
                            </div>
                        </button>
                    ))}

                    {!isCreating ? (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full flex items-center gap-4 p-3 hover:bg-white/10 rounded-lg text-left mt-2"
                        >
                            <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                                <Plus className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-medium text-white">Create new playlist</span>
                        </button>
                    ) : (
                        <div className="mt-4 bg-gray-900 rounded-lg p-3">
                            <label className="text-xs text-gray-400 block mb-1">Playlist Name</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    className="flex-1 bg-transparent border-b-2 border-primary outline-none text-white py-1"
                                    placeholder="Enter name..."
                                    autoFocus
                                />
                                <button
                                    onClick={handleCreate}
                                    className="px-4 py-1.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaylistModal;
