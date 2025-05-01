<?php

namespace App\Service;

use App\Entity\YoutubeChannel;
use App\Entity\Video;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use DateTime;

class YoutubeApiService
{
    private $httpClient;
    private $apiKey;

    public function __construct(
        HttpClientInterface $httpClient,
        string $youtubeApiKey
    ) {
        $this->httpClient = $httpClient;
        $this->apiKey = $youtubeApiKey;
    }

    public function searchChannelsByKeyword(string $keyword): array
    {
        $response = $this->httpClient->request('GET', 'https://www.googleapis.com/youtube/v3/search', [
            'query' => [
                'part' => 'snippet',
                'q' => $keyword,
                'type' => 'channel',
                'maxResults' => 50,
                'key' => $this->apiKey
            ]
        ]);

        $data = $response->toArray();
        $channels = [];

        foreach ($data['items'] as $item) {
            if ($item['id']['kind'] === 'youtube#channel') {
                $channelId = $item['id']['channelId'];
                $channelDetails = $this->getChannelDetails($channelId);
                
                $channel = new YoutubeChannel();
                $channel->setChannelId($channelId);
                $channel->setTitle($item['snippet']['title']);
                $channel->setDescription($item['snippet']['description']);
                $channel->setPublishedAt(new DateTime($item['snippet']['publishedAt']));
                $channel->setThumbnailUrl($item['snippet']['thumbnails']['high']['url']);
                
                $channels[] = $channel;
            }
        }

        return $channels;
    }

    private function getChannelDetails(string $channelId): array
    {
        $response = $this->httpClient->request('GET', 'https://www.googleapis.com/youtube/v3/channels', [
            'query' => [
                'part' => 'snippet,statistics',
                'id' => $channelId,
                'key' => $this->apiKey
            ]
        ]);

        return $response->toArray();
    }

    public function getChannelVideos(string $channelId, int $maxResults = 50): array
    {
        $response = $this->httpClient->request('GET', 'https://www.googleapis.com/youtube/v3/search', [
            'query' => [
                'part' => 'snippet',
                'channelId' => $channelId,
                'maxResults' => $maxResults,
                'order' => 'date', 
                'type' => 'video',
                'key' => $this->apiKey
            ]
        ]);

        $data = $response->toArray();
        $videos = [];

        foreach ($data['items'] as $item) {
            if ($item['id']['kind'] === 'youtube#video') {
                $video = new Video();
                $video->setYoutubeId($item['id']['videoId']);
                $video->setTitle($item['snippet']['title']);
                $video->setDescription($item['snippet']['description']);
                $video->setPublishedAt(new DateTime($item['snippet']['publishedAt']));
                
                if (isset($item['snippet']['thumbnails']['high'])) {
                    $video->setThumbnailUrl($item['snippet']['thumbnails']['high']['url']);
                } elseif (isset($item['snippet']['thumbnails']['medium'])) {
                    $video->setThumbnailUrl($item['snippet']['thumbnails']['medium']['url']);
                } else {
                    $video->setThumbnailUrl($item['snippet']['thumbnails']['default']['url']);
                }
                
                $videos[] = $video;
            }
        }

        return $videos;
    }
}