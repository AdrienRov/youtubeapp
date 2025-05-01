// src/api/youtubeApi.ts
import axios from 'axios';
import { Video, Channel } from '../types';

// Remplacez cette URL par l'URL de votre API Symfony
const API_URL = import.meta.env.VITE_API_URL; // L'URL de votre serveur Symfony

// Recherche des chaînes YouTube par nom via votre serveur Symfony
export const searchChannels = async (query: string): Promise<Channel[]> => {
  try {
    if (!query || query.trim() === '') {
      return [];
    }

    const response = await axios.get(`${API_URL}/youtube/search-channels`, {
      params: { query },
    });

    return response.data.items.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail || '',
    }));
  } catch (error: any) {
    console.error('Erreur lors de la recherche de chaînes:', error.message);
    throw error;
  }
};

// Récupération des vidéos par ID de chaîne via votre serveur Symfony
export const fetchVideosByChannelId = async (channelId: string, searchTerm: string): Promise<Video[]> => {
  try {
    const response = await axios.get(`${API_URL}/youtube/fetch-videos`, {
      params: { channelId, searchTerm },
    });

    // Filtrage des vidéos selon le terme de recherche (si nécessaire)
    const filteredVideos = searchTerm
      ? response.data.items.filter((item: any) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : response.data.items;

    return filteredVideos.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail,
      publishedAt: item.publishedAt,
    }));
  } catch (error: any) {
    console.error('Erreur lors de la récupération des vidéos:', error.message);
    throw error;
  }
};
