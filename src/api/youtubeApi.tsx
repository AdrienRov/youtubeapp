// src/api/youtubeApi.ts
import axios from 'axios';
import { Video, Channel } from '../types';

const API_KEY = import.meta.env.VITE_API_YT;

// Recherche des chaînes YouTube par nom
export const searchChannels = async (query: string): Promise<Channel[]> => {
  try {
    if (!API_KEY) {
      throw new Error('Clé API YouTube manquante.');
    }

    if (!query || query.trim() === '') {
      return [];
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'channel',
        maxResults: 5,
        key: API_KEY,
      },
    });

    return response.data.items.map((item: any) => ({
      id: item.id.channelId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default?.url || '',
    }));
  } catch (error: any) {
    console.error('Erreur lors de la recherche de chaînes:', error.message);
    throw error;
  }
};

// Récupération des vidéos par ID de chaîne
export const fetchVideosByChannelId = async (channelId: string, searchTerm: string): Promise<Video[]> => {
  try {
    if (!API_KEY) {
      throw new Error('Clé API YouTube manquante. Veuillez configurer VITE_API_YT dans votre fichier .env');
    }

    const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'contentDetails',
        id: channelId,
        key: API_KEY,
      },
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      throw new Error('Chaîne YouTube non trouvée.');
    }

    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    const response = await axios.get('https://www.googleapis.com/youtube/v3/playlistItems', {
      params: {
        part: 'snippet',
        playlistId: uploadsPlaylistId,
        maxResults: 50,
        key: API_KEY,
      },
    });

    const filteredVideos = searchTerm 
      ? response.data.items.filter((item: any) =>
          item.snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.snippet.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : response.data.items;

    return filteredVideos.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '',
      publishedAt: item.snippet.publishedAt,
    }));
  } catch (error: any) {
    console.error('Erreur lors de la récupération des vidéos:', error.message);
    throw error;
  }
};