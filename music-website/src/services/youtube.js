import axios from 'axios';
import { mockVideos } from './mockData';

// ⚠️ REPLACE THIS WITH YOUR OWN API KEY
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export const searchVideos = async (query) => {
    try {
        const response = await axios.get(`${BASE_URL}/search`, {
            params: {
                part: 'snippet',
                maxResults: 25,
                q: query,
                key: API_KEY,
                type: 'video',
                // videoCategoryId: '10', // REMOVED: restricting to Music category was filtering out relevant results
            },
        });
        const items = response.data.items;
        console.log("YouTube Search Results for:", query, items);

        if (!items || items.length === 0) {
            console.warn("YouTube API returned 0 results. Checking quota or key issues.");
        }

        items.source = 'api';
        return items;
    } catch (error) {
        console.error("Error fetching data from YouTube API, using mock data:", error);

        // 1. Try to find exact/partial matches in mock data
        const lowerQuery = query.toLowerCase();
        const matches = mockVideos.filter(video =>
            video.snippet.title.toLowerCase().includes(lowerQuery) ||
            video.snippet.channelTitle.toLowerCase().includes(lowerQuery)
        );

        if (matches.length > 0) {
            matches.source = 'mock';
            return matches;
        }

        // 2. Fallback: If no matches, return random shuffle (discovery mode)
        const shuffled = [...mockVideos].sort(() => 0.5 - Math.random());
        const result = shuffled.slice(0, 12);
        result.source = 'mock';
        return result;
    }
};

export const getSuggestions = async (query) => {
    if (!query) return [];

    // Using JSONP to avoid CORS issues with the suggestion API
    return new Promise((resolve) => {
        const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
        window[callbackName] = (data) => {
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(data[1].map(item => item[0]));
        };

        const script = document.createElement('script');
        script.src = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}&callback=${callbackName}`;
        document.body.appendChild(script);
    });
};
