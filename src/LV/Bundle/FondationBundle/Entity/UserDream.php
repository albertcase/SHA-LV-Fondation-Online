<?php

namespace LV\Bundle\FondationBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * UserDream
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="LV\Bundle\FondationBundle\Entity\UserDreamRepository")
 */
class UserDream
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
     * @ORM\Column(name="nickname", type="string", length=255)
     */
    private $nickname;

    /**
     * @var string
     *
     * @ORM\Column(name="content", type="text")
     */
    private $content;

    /**
     * @var string
     *
     * @ORM\Column(name="status", type="string", length=255)
     */
    private $status;

    /**
     * @var string
     *
     * @ORM\Column(name="created", type="string", length=255)
     */
    private $created;

    /**
     * @var string
     *
     * @ORM\Column(name="updated", type="string", length=255)
     */
    private $updated;

    /**
     * @ORM\OneToOne(targetEntity="User", inversedBy="userdream")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id")
     */
    private $user;

    /**
     *
     * @ORM\OneToMany(targetEntity="DreamLike", mappedBy="userdream", cascade={"persist", "remove"})
     * @ORM\OrderBy({"id" = "DESC"})
     */
    private $dreamlike;

    /**
     *
     * @ORM\OneToMany(targetEntity="DreamView", mappedBy="userdream", cascade={"persist", "remove"})
     * @ORM\OrderBy({"id" = "DESC"})
     */
    private $dreamView;

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
     * Set content
     *
     * @param string $content
     * @return UserDream
     */
    public function setContent($content)
    {
        $this->content = $content;

        return $this;
    }

    /**
     * Get content
     *
     * @return string 
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * Set user
     *
     * @param \LV\Bundle\FondationBundle\Entity\User $user
     * @return UserDream
     */
    public function setUser(\LV\Bundle\FondationBundle\Entity\User $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \LV\Bundle\FondationBundle\Entity\User 
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Set created
     *
     * @param string $created
     * @return UserDreams
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
        $this->dreamlike = new \Doctrine\Common\Collections\ArrayCollection();
    }

    /**
     * Add dreamlike
     *
     * @param \LV\Bundle\FondationBundle\Entity\Dreamlike $dreamlike
     * @return UserDream
     */
    public function addDreamlike(\LV\Bundle\FondationBundle\Entity\Dreamlike $dreamlike)
    {
        $this->dreamlike[] = $dreamlike;

        return $this;
    }

    /**
     * Remove dreamlike
     *
     * @param \LV\Bundle\FondationBundle\Entity\Dreamlike $dreamlike
     */
    public function removeDreamlike(\LV\Bundle\FondationBundle\Entity\Dreamlike $dreamlike)
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
     * Set nickname
     *
     * @param string $nickname
     * @return UserDream
     */
    public function setNickname($nickname)
    {
        $this->nickname = $nickname;

        return $this;
    }

    /**
     * Get nickname
     *
     * @return string 
     */
    public function getNickname()
    {
        return $this->nickname;
    }

    /**
     * Set updated
     *
     * @param string $updated
     * @return UserDream
     */
    public function setUpdated($updated)
    {
        $this->updated = $updated;

        return $this;
    }

    /**
     * Get updated
     *
     * @return string 
     */
    public function getUpdated()
    {
        return $this->updated;
    }

    /**
     * Add dreamView
     *
     * @param \LV\Bundle\FondationBundle\Entity\DreamView $dreamView
     * @return UserDream
     */
    public function addDreamView(\LV\Bundle\FondationBundle\Entity\DreamView $dreamView)
    {
        $this->dreamView[] = $dreamView;

        return $this;
    }

    /**
     * Remove dreamView
     *
     * @param \LV\Bundle\FondationBundle\Entity\DreamView $dreamView
     */
    public function removeDreamView(\LV\Bundle\FondationBundle\Entity\DreamView $dreamView)
    {
        $this->dreamView->removeElement($dreamView);
    }

    /**
     * Get dreamView
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getDreamView()
    {
        return $this->dreamView;
    }

    /**
     * Set status
     *
     * @param string $status
     * @return UserDream
     */
    public function setStatus($status)
    {
        $this->status = $status;

        return $this;
    }

    /**
     * Get status
     *
     * @return string 
     */
    public function getStatus()
    {
        return $this->status;
    }
}
