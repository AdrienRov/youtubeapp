<?php

namespace App\Repository;

use App\Entity\YoutubeChannel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<YoutubeChannel>
 */
class YoutubeChannelRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, YoutubeChannel::class);
    }

    public function searchByKeyword(string $keyword): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.title LIKE :kw')
            ->setParameter('kw', '%' . $keyword . '%')
            ->orderBy('c.title', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findByChannelId(string $channelId): ?YoutubeChannel
    {
        return $this->findOneBy(['channelId' => $channelId]);
    }
    
    public function findChannelsWithoutVideos()
    {
        return $this->createQueryBuilder('c')
            ->leftJoin('c.videos', 'v')
            ->groupBy('c.id')
            ->having('COUNT(v.id) = 0')
            ->getQuery()
            ->getResult();
    }

    //    /**
    //     * @return YoutubeChannel[] Returns an array of YoutubeChannel objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('y')
    //            ->andWhere('y.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('y.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?YoutubeChannel
    //    {
    //        return $this->createQueryBuilder('y')
    //            ->andWhere('y.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
