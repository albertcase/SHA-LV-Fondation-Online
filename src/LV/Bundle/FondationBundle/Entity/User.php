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
     * @ORM\Column(name="role", type="string", length=255)
     */
    private $role;

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
     *
     * @ORM\OneToMany(targetEntity="DreamView", mappedBy="user", cascade={"persist", "remove"})
     * @ORM\OrderBy({"id" = "DESC"})
     */
    private $dreamview;

    /**
     *
     * @ORM\OneToMany(targetEntity="InvitationLetter", mappedBy="user", cascade={"persist", "remove"})
     * @ORM\OrderBy({"id" = "DESC"})
     */
    private $invitationletter;

    /**
     *
     * @ORM\OneToOne(targetEntity="TemplateMessage", mappedBy="user")
     * @ORM\OrderBy({"id" = "DESC"})
     */
    private $templatemessage;

    /**
     *
     * @ORM\OneToOne(targetEntity="UserPhotoCode", mappedBy="user")
     * @ORM\OrderBy({"id" = "DESC"})
     */
    private $userphotocode;

    /**
     *
     * @ORM\OneToOne(targetEntity="LV\Bundle\CvdBundle\Entity\Locks", mappedBy="user")
     * @ORM\OrderBy({"id" = "DESC"})
     */
    private $locks;

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

    /**
     * Add invitationletter
     *
     * @param \LV\Bundle\FondationBundle\Entity\InvitationLetter $invitationletter
     * @return User
     */
    public function addInvitationletter(\LV\Bundle\FondationBundle\Entity\InvitationLetter $invitationletter)
    {
        $this->invitationletter[] = $invitationletter;

        return $this;
    }

    /**
     * Remove invitationletter
     *
     * @param \LV\Bundle\FondationBundle\Entity\InvitationLetter $invitationletter
     */
    public function removeInvitationletter(\LV\Bundle\FondationBundle\Entity\InvitationLetter $invitationletter)
    {
        $this->invitationletter->removeElement($invitationletter);
    }

    /**
     * Get invitationletter
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getInvitationletter()
    {
        return $this->invitationletter;
    }

    /**
     * Add dreamview
     *
     * @param \LV\Bundle\FondationBundle\Entity\DreamView $dreamview
     * @return User
     */
    public function addDreamview(\LV\Bundle\FondationBundle\Entity\DreamView $dreamview)
    {
        $this->dreamview[] = $dreamview;

        return $this;
    }

    /**
     * Remove dreamview
     *
     * @param \LV\Bundle\FondationBundle\Entity\DreamView $dreamview
     */
    public function removeDreamview(\LV\Bundle\FondationBundle\Entity\DreamView $dreamview)
    {
        $this->dreamview->removeElement($dreamview);
    }

    /**
     * Get dreamview
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getDreamview()
    {
        return $this->dreamview;
    }

    /**
     * Set role
     *
     * @param string $role
     * @return User
     */
    public function setRole($role)
    {
        $this->role = $role;

        return $this;
    }

    /**
     * Get role
     *
     * @return string 
     */
    public function getRole()
    {
        return $this->role;
    }

    /**
     * Set templatemessage
     *
     * @param \LV\Bundle\FondationBundle\Entity\TemplateMessage $templatemessage
     * @return User
     */
    public function setTemplatemessage(\LV\Bundle\FondationBundle\Entity\TemplateMessage $templatemessage = null)
    {
        $this->templatemessage = $templatemessage;

        return $this;
    }

    /**
     * Get templatemessage
     *
     * @return \LV\Bundle\FondationBundle\Entity\TemplateMessage 
     */
    public function getTemplatemessage()
    {
        return $this->templatemessage;
    }

    /**
     * Set userphotocode
     *
     * @param \LV\Bundle\FondationBundle\Entity\UserPhotocCode $userphotocode
     * @return User
     */
    public function setUserphotocode(\LV\Bundle\FondationBundle\Entity\UserPhotoCode $userphotocode = null)
    {
        $this->userphotocode = $userphotocode;

        return $this;
    }

    /**
     * Get userphotocode
     *
     * @return \LV\Bundle\FondationBundle\Entity\UserPhotocCode 
     */
    public function getUserphotocode()
    {
        return $this->userphotocode;
    }


    /**
     * Set locks
     *
     * @param \LV\Bundle\CvdBundle\Entity\Locks $locks
     * @return User
     */
    public function setLocks(\LV\Bundle\CvdBundle\Entity\Locks $locks = null)
    {
        $this->locks = $locks;

        return $this;
    }

    /**
     * Get locks
     *
     * @return \LV\Bundle\CvdBundle\Entity\Locks 
     */
    public function getLocks()
    {
        return $this->locks;
    }
}
