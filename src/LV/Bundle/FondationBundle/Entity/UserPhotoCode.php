<?php

namespace LV\Bundle\FondationBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * UserPhotoCode
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="LV\Bundle\FondationBundle\Entity\UserPhotoCodeRepository")
 */
class UserPhotoCode
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
     * @ORM\Column(name="status", type="string", length=255)
     */
    private $status;

    /**
     * @var string
     *
     * @ORM\Column(name="code", type="string", length=255)
     */
    private $code;

    /**
     * @var string
     *
     * @ORM\Column(name="created", type="string", length=255)
     */
    private $created;

    /**
     * @ORM\OneToOne(targetEntity="User", inversedBy="userphotocode")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id")
     */
    private $user;

    /**
     *
     * @ORM\OneToMany(targetEntity="Photos", mappedBy="userphotocode", cascade={"persist", "remove"})
     * @ORM\OrderBy({"id" = "DESC"})
     */
    private $photos;


    /**
     * Constructor
     */
    public function __construct()
    {
        $this->photo = new \Doctrine\Common\Collections\ArrayCollection();
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
     * Set status
     *
     * @param string $status
     * @return UserPhotoCode
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

    /**
     * Set code
     *
     * @param string $code
     * @return UserPhotoCode
     */
    public function setCode($code)
    {
        $this->code = $code;

        return $this;
    }

    /**
     * Get code
     *
     * @return string 
     */
    public function getCode()
    {
        return $this->code;
    }

    /**
     * Set created
     *
     * @param string $created
     * @return UserPhotoCode
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
     * Set user
     *
     * @param \LV\Bundle\FondationBundle\Entity\User $user
     * @return UserPhotoCode
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
     * Add photo
     *
     * @param \LV\Bundle\FondationBundle\Entity\Photo $photo
     * @return UserPhotoCode
     */
    public function addPhoto(\LV\Bundle\FondationBundle\Entity\Photos $photo)
    {
        $this->photo[] = $photo;

        return $this;
    }

    /**
     * Remove photo
     *
     * @param \LV\Bundle\FondationBundle\Entity\Photo $photo
     */
    public function removePhoto(\LV\Bundle\FondationBundle\Entity\Photos $photo)
    {
        $this->photo->removeElement($photo);
    }

    /**
     * Get photo
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getPhoto()
    {
        return $this->photo;
    }

    /**
     * Get photos
     *
     * @return \Doctrine\Common\Collections\Collection 
     */
    public function getPhotos()
    {
        return $this->photos;
    }
}
