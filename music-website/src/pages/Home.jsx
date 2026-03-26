import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import SongCard from '../components/SongCard';
import { searchVideos } from '../services/youtube';
import { useAuth } from '../hooks/useAuth';
import { getSearchHistory } from '../services/db';
import { Play } from 'lucide-react';

const Home = ({ onPlay }) => {
    const { user } = useAuth();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHomeData();
    }, [user]);

    const loadHomeData = async () => {
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

            // 1. Trending Now
            const trending = await searchVideos('Trending Music 2025');
            addSection('Trending Now', trending.slice(0, 8));

            // 2. Based on Search History (if user)
            if (user) {
                const history = await getSearchHistory(user.uid);
                if (history.length > 0) {
                    const lastQuery = history[0].query;
                    const historyRes = await searchVideos(`Best ${lastQuery} songs`);
                    addSection(`Because you searched "${lastQuery}"`, historyRes.slice(0, 8));
                }
            }

            // 3. Quick Picks (Random Curated)
            const themes = ['Lo-Fi Chill', 'Workout Motivation', 'Focus Music', 'Party Hits', 'Acoustic Covers', 'Jazz Vibes', 'Indie Pop'];
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];
            const quickPicks = await searchVideos(`${randomTheme} music`);
            addSection(`Quick Picks: ${randomTheme}`, quickPicks.slice(0, 8));

            // 4. Global Top 50
            const globalTop = await searchVideos('Global Top 50 Songs 2024');
            addSection('Global Top Hits', globalTop.slice(0, 8));

            // 5. Hidden Gems
            const hiddenGems = await searchVideos('Underrated songs 2024');
            addSection('Hidden Gems', hiddenGems.slice(0, 8));

            setSections(newSections);

        } catch (err) {
            console.error("Error loading home:", err);
        } finally {
            setLoading(false);
        }
    };



    const Section = ({ title, videos }) => (
        <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos.map((video) => (
                    <SongCard
                        key={video.id.videoId || video.id}
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
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold mb-4">Discover Music</h1>
                    <SearchBar />
                </div>

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

export default Home;
