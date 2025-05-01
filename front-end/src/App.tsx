import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import VideoList from './components/VideoList';
import { fetchVideosByChannelId } from './api/youtubeApi';
import { Video } from './types';

function App() {
  const [channelId, setChannelId] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchVideos = async (term: string) => {
    if (!channelId) {
      setError('Veuillez sélectionner une chaîne YouTube.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideos([]);

    try {
      const result = await fetchVideosByChannelId(channelId, term);
      setVideos(result);

      if (result.length === 0) {
        setError(term ? `Aucune vidéo ne correspond à "${term}"` : 'Cette chaîne ne contient aucune vidéo.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la recherche de vidéos.');
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-500 text-white p-3 md:p-6 shadow-lg">
        <div className="container mx-auto px-2">
          <div className="flex items-center space-x-4">
            <img src="/yt.png" alt="Logo" className="h-10 md:h-16 w-auto" />
            <div>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight">YouTube Indexer</h1>
              <p className="text-sm md:text-md opacity-80">Recherchez des vidéos de votre chaîne YouTube préférée.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-2 py-4">
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4 w-full mx-auto">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-800 mb-3">Configuration de l'indexation</h2>
          <SearchBar channelId={channelId} setChannelId={setChannelId} onSearch={searchVideos} />

        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full mx-auto">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-800 mb-3">
            {videos.length > 0
              ? `Résultats (${videos.length} vidéos)`
              : 'Recherche de vidéos'
            }
          </h2>

          {error && <div className="text-red-600 font-medium mb-3 p-2 bg-red-100 rounded-lg text-sm">{error}</div>}

          <VideoList videos={videos} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}

export default App;