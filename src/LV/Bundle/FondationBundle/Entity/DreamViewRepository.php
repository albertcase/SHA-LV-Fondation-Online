<?php

namespace LV\Bundle\FondationBundle\Entity;

use Doctrine\ORM\EntityRepository;

/**
 * DreamViewRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class DreamViewRepository extends EntityRepository
{
	public function retrieveViewCount($dream_id) {
		$query = $this->getEntityManager()
            ->createQuery(
            	'SELECT COUNT(dv.id) FROM LVFondationBundle:DreamView dv
            	WHERE dv.userdream = :dream_id'
            	)
            ->setParameter(':dream_id', $dream_id);
        $result = $query->getSingleScalarResult();
        return $result;
	}
}