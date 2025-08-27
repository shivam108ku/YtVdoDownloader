import React, { useState } from 'react';
import axios from 'axios';  

 
const App = () => {
   
    const [url, setUrl] = useState('');  
    const [videoInfo, setVideoInfo] = useState(null);  
    const [loading, setLoading] = useState(false);  
    const [error, setError] = useState(null);  

   
    const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
    const apiHost = 'ytstream-download-youtube-videos.p.rapidapi.com';

    const extractVideoId = (url) => {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const matches = url.match(regex);
        return matches ? matches[1] : null;
    };

   
    const fetchVideoInfo = async () => {
        // Reset previous state before a new request
        setVideoInfo(null);
        setError(null);

        const videoId = extractVideoId(url);

        if (!videoId) {
            setError('Could not extract a valid YouTube video ID from the URL.');
            return;
        }

        setLoading(true);

        const options = {
            method: 'GET',
            url: 'https://ytstream-download-youtube-videos.p.rapidapi.com/dl',
            params: { id: videoId },  
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost
            }
        };

        try {
            const response = await axios.request(options);
            
            if (response.data && response.data.title) {
                setVideoInfo(response.data);
            } else {
                setError('Could not fetch video details. The API response was not in the expected format.');
            }

        } catch (err) {
            console.error("API Fetch Error:", err);
            const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred. Please check the console.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
     
    const handleSubmit = (e) => {
        e.preventDefault(); 
        fetchVideoInfo();
    };

 

    const renderForm = () => (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube video URL here..."
                    className="flex-grow w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    aria-label="YouTube Video URL"
                />
                <button
                    type="submit"
                    disabled={loading || !url}
                    className="w-full sm:w-auto px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 shadow-md"
                >
                    {loading ? 'Fetching...' : 'Fetch Video'}
                </button>
            </div>
        </form>
    );

    const renderError = () => (
        error && (
            <div className="mt-6 w-full max-w-2xl p-4 text-center text-red-700 bg-red-100 border border-red-400 rounded-lg" role="alert">
                <p><strong>Error:</strong> {error}</p>
            </div>
        )
    );

    const renderVideoInfo = () => {
        if (!videoInfo) return null;

        const videoFormats = videoInfo.formats.filter(f => f.qualityLabel && f.url);
        const audioFormats = videoInfo.adaptiveFormats.filter(f => f.mimeType.includes('audio') && f.url);

        return (
            <div className="mt-8 w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <h2 className="text-xl font-bold mb-2 text-gray-800">{videoInfo.title}</h2>
                        <img 
                            src={videoInfo.thumbnail[0]?.url} 
                            alt={videoInfo.title} 
                            className="w-full h-auto rounded-lg shadow-md"
                            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/e2e8f0/4a5568?text=Thumbnail'; }}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Video Formats</h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {videoFormats.map((format, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <span className="font-medium text-gray-800">{format.qualityLabel}</span>
                                            <a href={format.url} target="_blank" rel="noopener noreferrer" download className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 shadow">
                                                Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-2">Audio Only</h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {audioFormats.map((format, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <span className="font-medium text-gray-800">{format.audioQuality}</span>
                                            <a href={format.url} target="_blank" rel="noopener noreferrer" download className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 shadow">
                                                Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans flex flex-col items-center justify-center p-4">
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
                        YouTube Video Downloader
                    </h1>
                    <p className="text-lg text-gray-600 mt-2">
                        Paste a video link to get download options.
                    </p>
                </header>

                {renderForm()}
                {renderError()}
                
                {loading && (
                    <div className="mt-8 text-center">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
                        <p className="mt-3 text-gray-600">Fetching video details, please wait...</p>
                    </div>
                )}

                {renderVideoInfo()}

            </div>
            <footer className="text-center mt-10 text-gray-500 text-sm">
                <p>Built with React & Tailwind CSS. Project for Anslation Internship.</p>
            </footer>
        </div>
    );
};

export default App;
