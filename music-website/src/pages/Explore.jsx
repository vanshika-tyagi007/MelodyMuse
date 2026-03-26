import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import SongCard from '../components/SongCard';
import { searchVideos } from '../services/youtube';
import { useAuth } from '../hooks/useAuth';
import { getHistory, getSearchHistory } from '../services/db';
import { useNavigate } from 'react-router-dom';

const Explore = ({ onPlay }) => {
    const { user } = useAuth();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const genres = [
        "Pop", "Hip Hop", "R&B", "Rock", "Electronic", "Indie",
        "K-Pop", "Latin", "Classical", "Jazz", "Metal", "Country"
    ];

    useEffect(() => {
        const fetchExploreData = async () => {
            setLoading(true);
            try {
                const newSections = [];
                const seenVideoIds = new Set();

                // Helper to add unique videos
                const addSection = (title, videos) => {
                    const uniqueVideos = videos.filter(v => {
                        const id = v.id.videoId || v.id;
                        if (seenVideoIds.has(id)) return false;
                        seenVideoIds.add(id);
                        return true;
                    });

                    if (uniqueVideos.length > 0) {
                        newSections.push({ title, videos: uniqueVideos });
                    }
                };

                // 1. New Releases
                const newReleases = await searchVideos('New Music Releases 2025');
                addSection('New Releases', newReleases.slice(0, 8));

                // 2. Based on Listening History (if user)
                if (user) {
                    const history = await getHistory(user.uid);
                    if (history.length > 0) {
                        try {
                            const lastPlayed = history[0];
                            // Check if snippet exists, otherwise use title
                            const queryTerm = lastPlayed.snippet
                                ? lastPlayed.snippet.title
                                : (lastPlayed.title || 'Music'); // Fallback

                            const recommendations = await searchVideos(`Songs similar to ${queryTerm}`);
                            addSection('Because you listened to ' + queryTerm, recommendations.slice(0, 8));
                        } catch (e) {
                            console.error("Error getting recommendations based on history", e);
                        }
                    }
                }

                // 3. Genre Spotlights (Randomly pick 2 genres)
                const shuffledGenres = [...genres].sort(() => 0.5 - Math.random());
                const selectedGenres = shuffledGenres.slice(0, 2);

                for (const genre of selectedGenres) {
                    const genreSongs = await searchVideos(`Best ${genre} songs 2024`);
                    addSection(`${genre} Essentials`, genreSongs.slice(0, 8));
                }

                // 4. Undiscovered / Viral
                const viral = await searchVideos('Viral TikTok Songs 2025');
                addSection('Viral Hits', viral.slice(0, 8));

                setSections(newSections);
            } catch (error) {
                console.error("Error fetching explore data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExploreData();
    }, [user]);

    const handleGenreClick = async (genre) => {
        // Navigate or search? Let's search in place or navigate to home with query?
        // For Explore, let's show a specific results section or maybe redirect to Home with search?
        // Let's redirect to Home for full search experience, OR just show results here.
        // Simple approach: Redirect to Home with query
        // But Home handles search. Let's just use window location for now as a quick link
        // OR better: navigate('/') with state? 
        // Let's stick to Home handles search.
    };

    const Section = ({ title, videos }) => (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos.map((video) => (
                    <SongCard
                        key={video.id.videoId}
                        video={video}
                        onPlay={onPlay}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="max-w-6xl mx-auto pb-24">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold mb-8">Explore</h1>

                    {/* Genres / Moods */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Browse Genres & Moods</h2>
                        <div className="flex flex-wrap gap-3">
                            {genres.map(genre => (
                                <button
                                    key={genre}
                                    onClick={() => window.location.href = `/?q=${encodeURIComponent(genre)}`}
                                    className="bg-yt-dark hover:bg-white/10 border border-white/10 px-6 py-3 rounded-full font-medium transition-colors"
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="text-center text-yt-gray py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        Exploring...
                    </div>
                )}

                {!loading && (
                    <>
                        {sections.map((section, index) => (
                            <Section key={index} title={section.title} videos={section.videos} />
                        ))}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default Explore;
