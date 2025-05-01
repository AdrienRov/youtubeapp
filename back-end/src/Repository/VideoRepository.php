<?php

namespace App\Repository;

use App\Entity\Video;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use App\Entity\YoutubeChannel;
use Doctrine\ORM\QueryBuilder;
use Doctrine\ORM\Query;
/**
 * @extends ServiceEntityRepository<Video>
 */
class VideoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Video::class);
    }

    public function findByChannelAndKeyword(YoutubeChannel $channel, string $keyword)
    {
        return $this->createQueryBuilder('v')
            ->andWhere('v.channel = :channel')
            ->andWhere('(v.title LIKE :keyword OR v.description LIKE :keyword)')
            ->setParameter('channel', $channel)
            ->setParameter('keyword', '%' . $keyword . '%')
            ->orderBy('v.publishedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
    

    //    /**
    //     * @return Video[] Returns an array of Video objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('v')
    //            ->andWhere('v.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('v.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Video
    //    {
    //        return $this->createQueryBuilder('v')
    //            ->andWhere('v.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
