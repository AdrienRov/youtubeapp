<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\YoutubeChannel;
use App\Entity\Video;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use App\Service\YoutubeApiService;

final class YoutubeChannelController extends AbstractController
{
    #[Route('/youtube/channel', name: 'app_youtube_channel')]
    public function index(): Response
    {
        return $this->render('youtube_channel/index.html.twig', [
            'controller_name' => 'YoutubeChannelController',
        ]);
    }

    #[Route('/fetch-channel/{channelId}', name: 'fetch_youtube_channel')]
    public function fetchChannel(
        string $channelId,
        EntityManagerInterface $em
    ): Response {
        $channel = $em->getRepository(YoutubeChannel::class)->findOneBy(['channelId' => $channelId]);
        
        if (!$channel) {
            return new Response('Chaîne non trouvée', 404);
        }

        return $this->json([
            'id' => $channel->getChannelId(),
            'title' => $channel->getTitle(),
            'description' => $channel->getDescription(),
            'thumbnail' => $channel->getThumbnailUrl(),
            'publishedAt' => $channel->getPublishedAt()->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/search-youtube', name: 'search_youtube')]
    public function searchYouTube(
        Request $request,
        EntityManagerInterface $em
    ): Response {
        $keyword = $request->query->get('q');
        if (!$keyword) {
            return new Response('Aucun mot-clé fourni', 400);
        }

        $channels = $em->getRepository(YoutubeChannel::class)->searchByKeyword($keyword);
        $videos = $em->getRepository(Video::class)->searchByKeyword($keyword);

        return $this->json([
            'channels' => $channels,
            'videos' => $videos,
        ]);
    }

    #[Route('/fetch-channels/{keyword}', name: 'fetch_youtube_channels')]
    public function fetchChannelsByKeyword(
        string $keyword,
        YoutubeApiService $youtubeApiService,
        EntityManagerInterface $em
    ): Response {
        // Recherche des chaînes via l'API YouTube
        $apiChannels = $youtubeApiService->searchChannelsByKeyword($keyword);
        
        $newChannelsCount = 0;
        
        // Traitement et sauvegarde des chaînes
        foreach ($apiChannels as $channel) {
            // Vérification si la chaîne existe déjà
            $existingChannel = $em->getRepository(YoutubeChannel::class)->findByChannelId($channel->getChannelId());
            
            if (!$existingChannel) {
                $em->persist($channel);
                $newChannelsCount++;
            }
        }
        
        $em->flush();
        
        return new Response(sprintf(
            'Recherche terminée pour le mot-clé "%s". %d nouvelles chaînes trouvées et sauvegardées.',
            $keyword,
            $newChannelsCount
        ));
    }

    #[Route('/fetch-videos', name: 'fetch_youtube_videos')]
    public function fetchVideos(
        EntityManagerInterface $em,
        YoutubeApiService $youtubeApiService
    ): Response {
        
        $channelRepository = $em->getRepository(YoutubeChannel::class);
        $videoRepository = $em->getRepository(Video::class);
        
        $channelsWithoutVideos = $channelRepository->findChannelsWithoutVideos();
        
        $totalVideos = 0;
        $processedChannels = 0;
        
        foreach ($channelsWithoutVideos as $channel) {
            try {
                // Récupération des vidéos de la chaîne via l'API YouTube
                $videos = $youtubeApiService->getChannelVideos($channel->getChannelId());
                
                $newVideosCount = 0;
                
                foreach ($videos as $video) {
                    // Vérification si la vidéo existe déjà
                    $existingVideo = $videoRepository->findOneBy(['youtubeId' => $video->getYoutubeId()]);
                    
                    if (!$existingVideo) {
                        // Association de la vidéo à la chaîne
                        $video->setChannel($channel);
                        $em->persist($video);
                        $newVideosCount++;
                    }
                }
                
                $totalVideos += $newVideosCount;
                $processedChannels++;
                
                $em->flush();
                
            } catch (\Exception $e) {
                $this->addFlash('error', sprintf(
                    'Erreur lors de la récupération des vidéos pour la chaîne %s: %s',
                    $channel->getTitle(),
                    $e->getMessage()
                ));
            }
        }
        
        return new Response(sprintf(
            'Traitement terminé. %d vidéos récupérées pour %d chaînes.',
            $totalVideos,
            $processedChannels
        ));
    }

    #[Route('/youtube/search-channels', name: 'search_youtube_channels')]
    public function searchChannelsByKeyword(
        Request $request,
        EntityManagerInterface $em,
        HttpClientInterface $httpClient
    ): Response {
        $keyword = $request->query->get('query');
        if (!$keyword) {
            return new Response('Aucun mot-clé fourni', 400);
        }

        $channels = $em->getRepository(YoutubeChannel::class)->searchByKeyword($keyword);
        
        $items = [];
        foreach ($channels as $channel) {
            $videoCount = $em->getRepository(Video::class)->count(['channel' => $channel]);
            
            if ($videoCount === 0) {
                $this->fetchVideosForChannel($channel, $em, $httpClient);
            }
            
            $items[] = [
                'id' => $channel->getChannelId(),
                'title' => $channel->getTitle(),
                'description' => $channel->getDescription(),
                'thumbnail' => $channel->getThumbnailUrl(),
            ];
        }
        
        return $this->json(['items' => $items]);
    }
    
    #[Route('/youtube/fetch-videos', name: 'fetch_videos_by_channel')]
    public function fetchVideosByChannel(
        Request $request,
        EntityManagerInterface $em,
        HttpClientInterface $httpClient
    ): Response {
        $channelId = $request->query->get('channelId');
        $searchTerm = $request->query->get('searchTerm', '');
        
        if (!$channelId) {
            return new Response('ID de chaîne requis', 400);
        }
        
        // Récupérer la chaîne
        $channel = $em->getRepository(YoutubeChannel::class)->findOneBy(['channelId' => $channelId]);
        
        if (!$channel) {
            return new Response('Chaîne non trouvée', 404);
        }
        
        // Vérifier si nous avons des vidéos pour cette chaîne
        $videoCount = $em->getRepository(Video::class)->count(['channel' => $channel]);
        
        // Si aucune vidéo n'existe pour cette chaîne, récupérer les vidéos
        if ($videoCount === 0) {
            $this->fetchVideosForChannel($channel, $em, $httpClient);
        }
        
        // Récupérer les vidéos de cette chaîne
        $videoRepository = $em->getRepository(Video::class);
        
        // Si un terme de recherche est fourni, filtrer les vidéos
        if (!empty($searchTerm)) {
            $videos = $videoRepository->findByChannelAndKeyword($channel, $searchTerm);
        } else {
            $videos = $videoRepository->findBy(['channel' => $channel]);
        }
        
        $items = [];
        foreach ($videos as $video) {
            $items[] = [
                'id' => $video->getYoutubeId(),
                'title' => $video->getTitle(),
                'description' => $video->getDescription(),
                'thumbnail' => $video->getThumbnailUrl(),
                'publishedAt' => $video->getPublishedAt()->format('Y-m-d H:i:s'),
            ];
        }
        
        return $this->json(['items' => $items]);
    }
    
    private function fetchVideosForChannel(
        YoutubeChannel $channel,
        EntityManagerInterface $em,
        HttpClientInterface $httpClient
    ): void {
        $videoRepo = $em->getRepository(Video::class);
        
        // Appel à l'API pour récupérer les vidéos de la chaîne
        $url = "/api/videos/{$channel->getChannelId()}"; 
        
        try {
            $response = $httpClient->request('GET', $url);
            $data = $response->toArray();
            
            foreach ($data as $item) {
                $videoId = $item['id'];
                
                $existing = $videoRepo->findOneBy(['youtubeId' => $videoId]);
                if ($existing) continue;
                
                $video = new Video();
                $video->setYoutubeId($videoId);
                $video->setTitle($item['title']);
                $video->setDescription($item['description']);
                $video->setPublishedAt(new \DateTime($item['publishedAt']));
                $video->setThumbnailUrl($item['thumbnail']);
                $video->setChannel($channel);
                
                $em->persist($video);
            }
            
            $em->flush();
        } catch (\Exception $e) {
            error_log('Erreur lors de la récupération des vidéos pour la chaîne ' . $channel->getChannelId() . ': ' . $e->getMessage());
        }
    }
}