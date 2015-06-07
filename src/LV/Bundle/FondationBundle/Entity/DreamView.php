<?php

namespace LV\Bundle\FondationBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * DreamView
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="LV\Bundle\FondationBundle\Entity\DreamViewRepository")
 */
class DreamView
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="created", type="string", length=255)
     */
    private $created;
    
    /**
     * @ORM\ManyToOne(targetEntity="UserDream")
     * @ORM\JoinColumn(name="dream_id", referencedColumnName="id")
     */
    private $userdream;

    /**
     * @ORM\ManyToOne(targetEntity="User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id")
     */
    private $user;

    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set user
     *
     * @param \LV\Bundle\FondationBundle\Entity\User $user
     * @return DreamView
     */
    public function setUser(\LV\Bundle\FondationBundle\Entity\User $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \LV\Bundle\FondationBundle\Entity\UserDream 
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Set userdream
     *
     * @param \LV\Bundle\FondationBundle\Entity\UserDream $userdream
     * @return DreamView
     */
    public function setUserdream(\LV\Bundle\FondationBundle\Entity\UserDream $userdream = null)
    {
        $this->userdream = $userdream;

        return $this;
    }

    /**
     * Get userdream
     *
     * @return \LV\Bundle\FondationBundle\Entity\UserDream 
     */
    public function getUserdream()
    {
        return $this->userdream;
    }

    /**
     * Set created
     *
     * @param string $created
     * @return DreamView
     */
    public function setCreated($created)
    {
        $this->created = $created;

        return $this;
    }

    /**
     * Get created
     *
     * @return string 
     */
    public function getCreated()
    {
        return $this->created;
    }
}
