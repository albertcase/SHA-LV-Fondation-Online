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
     *
     * @ORM\OneToOne(targetEntity="UserInfo", mappedBy="user")
     * @ORM\OrderBy({"id" = "DESC"})
     */
    private $userinfo;

    /**
     *
     * @ORM\OneToOne(targetEntity="UserDream", mappedBy="user")
     * @ORM\OrderBy({"id" = "DESC"})
     */
    private $userdream;

    /**
     *
     * @ORM\OneToMany(targetEntity="DreamLike", mappedBy="user", cascade={"persist", "remove"})
     * @ORM\OrderBy({"id" = "DESC"})
     */
    private $dreamlike;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->dreamlike = new \Doctrine\Common\Collections\ArrayCollection();
    }

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
     * Set userinfo
     *
     * @param \LV\Bundle\FondationBundle\Entity\UserInfo $userinfo
     * @return User
     */
    public function setUserinfo(\LV\Bundle\FondationBundle\Entity\UserInfo $userinfo = null)
    {
        $this->userinfo = $userinfo;

        return $this;
    }

    /**
     * Get userinfo
     *
     * @return \LV\Bundle\FondationBundle\Entity\UserInfo 
     */
    public function getUserinfo()
    {
        return $this->userinfo;
    }

    /**
     * Set userdream
     *
     * @param \LV\Bundle\FondationBundle\Entity\UserDream $userdream
     * @return User
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
     * Add dreamlike
     *
     * @param \LV\Bundle\FondationBundle\Entity\DreamLike $dreamlike
     * @return User
     */
    public function addDreamlike(\LV\Bundle\FondationBundle\Entity\DreamLike $dreamlike)
    {
        $this->dreamlike[] = $dreamlike;

        return $this;
    }

    /**
     * Remove dreamlike
     *
     * @param \LV\Bundle\FondationBundle\Entity\DreamLike $dreamlike
     */
    public function removeDreamlike(\LV\Bundle\FondationBundle\Entity\DreamLike $dreamlike)
    {
        $this->dreamlike->removeElement($dreamlike);
    }

    /**
     * Get dreamlike
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getDreamlike()
    {
        return $this->dreamlike;
    }
}
