import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, X, Trash2, Zap, Mic } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { addToSearchHistory, getSearchHistory, deleteSearchHistoryItem, clearSearchHistory } from '../services/db';
import { getSuggestions } from '../services/youtube';

const SearchBar = ({ onSearch }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const { user } = useAuth();
    const { isListening, transcript, error, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();
    const wrapperRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, [showHistory, user]);

    useEffect(() => {
        if (transcript) {
            setQuery(transcript);
            // Optionally auto-search or just show suggestions
            if (!isListening && transcript.trim()) {
                navigate(`/search?q=${encodeURIComponent(transcript.trim())}`);
                setShowHistory(false);
            }
        }
    }, [transcript, isListening]);

    // Show error alert if speech recognition fails
    useEffect(() => {
        if (error) {
            alert(error); // Simple alert for now, could be a toast
        }
    }, [error]);

    useEffect(() => {
        // Debounce suggestion fetching
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (query.trim().length > 1) {
            timeoutRef.current = setTimeout(async () => {
                const results = await getSuggestions(query);
                // Filter out suggestions that are already in history (to avoid duplicates if we merge)
                // For now, let's keep them separate or just show suggestions
                setSuggestions(results.slice(0, 5));
            }, 300);
        } else {
            setSuggestions([]);
        }
    }, [query]);

    const fetchHistory = async () => {
        if (user && showHistory) {
            const hist = await getSearchHistory(user.uid);
            setHistory(hist);
        }
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowHistory(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setShowHistory(false);
            if (user) {
                await addToSearchHistory(user.uid, query.trim());
                fetchHistory(); // Refresh history
            }
        }
    };

    const handleMicClick = () => {
        if (!hasRecognitionSupport) {
            alert("Voice search is not supported in this browser. Please use Chrome, Edge, or Safari.");
            return;
        }
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    // ... rest of handlers ...

    const handleHistoryClick = (term) => {
        setQuery(term);
        navigate(`/search?q=${encodeURIComponent(term)}`);
        setShowHistory(false);
    };

    const handleDeleteItem = async (e, itemId) => {
        e.stopPropagation(); // Prevent triggering search
        if (user) {
            await deleteSearchHistoryItem(user.uid, itemId);
            // Optimistic update
            setHistory(history.filter(item => item.id !== itemId));
        }
    };

    const handleClearAll = async () => {
        if (user) {
            if (window.confirm("Are you sure you want to clear your search history?")) {
                await clearSearchHistory(user.uid);
                setHistory([]);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8 relative group" ref={wrapperRef}>
            <div className={`relative flex items-center z-20 transition-all duration-300 ${isListening ? 'ring-2 ring-red-500 rounded-full shadow-lg shadow-red-500/20' : ''}`}>
                <Search className="absolute left-4 w-5 h-5 text-yt-gray group-focus-within:text-white transition-colors" />
                <input
                    type="text"
                    placeholder={isListening ? "Listening... Speak now" : "Search songs, albums, artists..."}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowHistory(true)}
                    className="w-full bg-yt-dark text-white pl-12 pr-12 py-3 rounded-full border border-transparent focus:border-white/20 focus:bg-black transition-all outline-none placeholder-yt-gray"
                />

                <div className="absolute right-3 flex items-center gap-2 z-50">
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="text-gray-400 hover:text-white p-2"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleMicClick}
                        className={`p-2 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-500/10 animate-pulse scale-110' : 'text-gray-400 hover:text-white'}`}
                        title="Search with voice"
                    >
                        <Mic className="w-5 h-5" />
                    </button>

                    <button
                        type="submit"
                        className="bg-yt-dark hover:bg-gray-700 p-2 rounded-full transition-colors"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* History & Suggestions Dropdown */}
            {showHistory && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-yt-dark border border-white/10 rounded-xl shadow-xl overflow-hidden z-30">
                    <div className="p-2">
                        {/* Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="mb-2">
                                <div className="text-xs text-yt-gray px-3 py-2 uppercase font-semibold tracking-wider flex items-center gap-2">
                                    <Zap className="w-3 h-3 text-yellow-500" />
                                    Suggestions
                                </div>
                                {suggestions.map((term, index) => (
                                    <button
                                        key={`s-${index}`}
                                        type="button"
                                        onClick={() => handleHistoryClick(term)}
                                        className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg flex items-center gap-3 transition-colors group"
                                    >
                                        <Search className="w-4 h-4 text-yt-gray group-hover:text-white transition-colors" />
                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{term}</span>
                                    </button>
                                ))}
                                {history.length > 0 && <div className="h-px bg-white/10 my-2 mx-2"></div>}
                            </div>
                        )}

                        {/* Recent History */}
                        {history.length > 0 && (
                            <>
                                <div className="flex items-center justify-between px-3 py-2">
                                    <div className="text-xs text-yt-gray uppercase font-semibold tracking-wider">Recent Searches</div>
                                    <button
                                        type="button"
                                        onClick={handleClearAll}
                                        className="text-xs text-yt-gray hover:text-red-500 flex items-center gap-1 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Clear All
                                    </button>
                                </div>

                                {history.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleHistoryClick(item.query)}
                                        className="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-yt-gray group-hover:text-white transition-colors" />
                                            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{item.query}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDeleteItem(e, item.id)}
                                            className="p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Remove from history"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </form>
    );
};

export default SearchBar;
