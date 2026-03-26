import React from 'react';
import { Play } from 'lucide-react';

const SongCard = ({ video, onPlay }) => {
    return (
        <div
            onClick={() => onPlay(video)}
            className="group flex flex-col gap-3 p-4 rounded-md hover:bg-yt-dark cursor-pointer transition-colors duration-200"
        >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                <img
                    src={video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url}
                    alt={video.snippet.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-10 h-10 text-white fill-current" />
                </div>
            </div>
            <div>
                <h3 className="font-bold text-white line-clamp-2 leading-tight mb-1" title={video.snippet.title}>
                    {video.snippet.title}
                </h3>
                <p className="text-sm text-yt-gray line-clamp-1">
                    {video.snippet.channelTitle} • Video
                </p>
            </div>
        </div>
    );
};

export default SongCard;
