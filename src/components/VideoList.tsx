import React, { useState } from 'react';
import { Video } from '../types';

interface VideoListProps {
  videos: Video[];
  isLoading: boolean;
}

const VideoList: React.FC<VideoListProps> = ({ videos, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 6; // Nombre de vidéos par page
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
        <p className="mt-2 text-gray-500">Aucune vidéo trouvée.</p>
      </div>
    );
  }

  // Calculer les vidéos à afficher pour la page actuelle
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(videos.length / videosPerPage);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentVideos.map((video) => (
          <div key={video.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
            <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="block relative">
              <div className="relative overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-44 object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-red-600 rounded-full p-3 transform hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>

            <div className="p-4">
              <a 
                href={`https://www.youtube.com/watch?v=${video.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <h4 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">{video.title}</h4>
              </a>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                  {new Date(video.publishedAt).toLocaleDateString('fr-FR', { 
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
                <a 
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 font-medium hover:underline flex items-center"
                >
                  Voir sur YouTube
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-l-md"
        >
          Précédent
        </button>
        {[...Array(totalPages).keys()].map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page + 1)}
            className={`px-4 py-2 ${currentPage === page + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-md mx-1`}
          >
            {page + 1}
          </button>
        ))}
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default VideoList;
