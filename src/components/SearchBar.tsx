import React, { useState, useEffect, useRef } from 'react';
import { searchChannels } from '../api/youtubeApi';
import { Channel } from '../types';

interface SearchBarProps {
    channelId: string;
    setChannelId: React.Dispatch<React.SetStateAction<string>>;
    onSearch: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ channelId, setChannelId, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [channelName, setChannelName] = useState('');
    const [channelResults, setChannelResults] = useState<Channel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fermer le dropdown si on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Recherche de chaînes à partir du nom
    const handleChannelSearch = async (query: string) => {
        setChannelName(query);

        if (query.trim() === '') {
            setChannelResults([]);
            setShowDropdown(false);
            return;
        }

        setIsLoading(true);
        try {
            const results = await searchChannels(query);
            setChannelResults(results);
            setShowDropdown(results.length > 0);
        } catch (error) {
            console.error('Erreur lors de la recherche de chaînes:', error);
            setChannelResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Sélection d'une chaîne dans les résultats
    const selectChannel = (channel: Channel) => {
        setSelectedChannel(channel);
        setChannelId(channel.id);
        setChannelName(channel.title);
        setShowDropdown(false);
    };

    // Gestion du délai de recherche (debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (channelName) {
                handleChannelSearch(channelName);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [channelName]);

    const handleSearch = () => {
        onSearch(searchTerm);
    };

    const handleIndex = () => {
        if (channelId) {
            onSearch('');
        }
    };

    return (
        <div className="flex justify-center items-center">
            <div className="w-full max-w-md">
                <div className="mb-4 relative" ref={dropdownRef}>
                    <label htmlFor="channelName" className="block text-sm font-medium mb-1">
                        Nom de la chaîne YouTube
                    </label>
                    <div className="flex">
                        <input
                            type="text"
                            id="channelName"
                            className="w-80 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Entrez le nom d'une chaîne..."
                            value={channelName}
                            onChange={(e) => handleChannelSearch(e.target.value)}
                            autoComplete="off"
                        />
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-r flex items-center justify-center"
                            onClick={handleIndex}
                            disabled={!channelId}
                        >
                            {isLoading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                                "Indexer"
                            )}
                        </button>
                    </div>

                    {showDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                            {channelResults.map((channel) => (
                                <div
                                    key={channel.id}
                                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => selectChannel(channel)}
                                >
                                    {channel.thumbnail && channel.thumbnail.startsWith('http') && (
                                        <img src={channel.thumbnail} alt={channel.title} className="w-8 h-8 rounded-full mr-3 object-cover" />
                                    )}
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{channel.title}</div>
                                        <div className="text-xs text-gray-500 truncate">{channel.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Afficher l'ID de chaîne si sélectionné */}
                    {channelId && (
                        <div className="mt-1 text-xs text-gray-500">
                            ID de chaîne: {channelId}
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="searchTerm" className="block text-sm font-medium mb-1">
                        Rechercher par mots-clés
                    </label>
                    <div className="flex">
                        <input
                            type="text"
                            id="searchTerm"
                            className="w-80 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Entrez vos mots-clés..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            disabled={!channelId}
                        />
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r"
                            onClick={handleSearch}
                            disabled={!channelId}
                        >
                            Rechercher
                        </button>
                    </div>
                </div>

                {selectedChannel && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center">
                        <img src={selectedChannel.thumbnail} alt={selectedChannel.title} className="w-10 h-10 rounded-full mr-3" />
                        <div>
                            <h3 className="font-medium">{selectedChannel.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-1">{selectedChannel.description}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
