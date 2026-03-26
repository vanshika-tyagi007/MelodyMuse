import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import SongCard from '../components/SongCard';
import { searchVideos } from '../services/youtube';

const SearchResults = ({ onPlay }) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            performSearch(query);
        }
    }, [query]);

    const performSearch = async (searchQuery) => {
        setLoading(true);
        try {
            const results = await searchVideos(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (newQuery) => {
        // SearchBar will handle navigation, but if we are already here,
        // we might strictly rely on the URL change to trigger the effect above.
        // However, SearchBar implementation plan says it will navigate.
        // So we might not strictly need this handler if SearchBar navigates.
        // But for compatibility with the current SearchBar prop signature:
        // We'll pass a dummy or simple handler, or rely on SearchBar's internal navigation.
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto pb-24">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold mb-4">Search Results</h1>
                    <SearchBar />
                </div>

                {searchResults.source === 'mock' && (
                    <div className="bg-yellow-600/20 border border-yellow-600/50 text-yellow-200 p-4 rounded-lg mb-8 text-center">
                        <p className="font-bold">⚠️ API Limit Reached or Key Invalid</p>
                        <p className="text-sm">Showing limited local results. The live YouTube API search failed.</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center text-yt-gray py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        Loading...
                    </div>
                )}

                {!loading && searchResults.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Results for "{query}"</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {searchResults.map((video) => (
                                <SongCard
                                    key={video.id.videoId || video.id}
                                    video={video}
                                    onPlay={onPlay}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {!loading && searchResults.length === 0 && query && (
                    <div className="text-center text-yt-gray py-10">
                        <p>No results found for "{query}"</p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SearchResults;
