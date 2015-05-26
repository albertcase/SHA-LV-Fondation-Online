<?php

namespace LV\Bundle\FondationBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * User
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="LV\Bundle\FondationBundle\Entity\UserRepository")
 */
class User
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
     * @ORM\Column(name="openid", type="string", length=255)
     */
    private $openid;

    /**
     * @var string
     *
     * @ORM\Column(name="created", type="string", length=255)
     */
    private $created;

    /**
     * Bidirectional - One-To-Many (INVERSE SIDE)
     *
     * @ORM\OneToMany(targetEntity="UserInfo", mappedBy="user", cascade={"persist", "remove"})
     * @ORM\OrderBy({"id" = "DESC"})
     */
    private $userinfo;

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
     * Set openid
     *
     * @param string $openid
     * @return User
     */
    public function setOpenid($openid)
    {
        $this->openid = $openid;

        return $this;
    }

    /**
     * Get openid
     *
     * @return string 
     */
    public function getOpenid()
    {
        return $this->openid;
    }

    /**
     * Set created
     *
     * @param string $created
     * @return User
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
    /**
     * Constructor
     */
    public function __construct()
    {
        $this->userinfo = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Add userinfo
     *
     * @param \LV\Bundle\FondationBundle\Entity\UserInfo $userinfo
     * @return User
     */
    public function addUserinfo(\LV\Bundle\FondationBundle\Entity\UserInfo $userinfo)
    {
        $this->userinfo[] = $userinfo;

        return $this;
    }

    /**
     * Remove userinfo
     *
     * @param \LV\Bundle\FondationBundle\Entity\UserInfo $userinfo
     */
    public function removeUserinfo(\LV\Bundle\FondationBundle\Entity\UserInfo $userinfo)
    {
        $this->userinfo->removeElement($userinfo);
    }

    /**
     * Get userinfo
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getUserinfo()
    {
        return $this->userinfo;
    }
}
