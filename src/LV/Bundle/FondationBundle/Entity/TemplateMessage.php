<?php

namespace LV\Bundle\FondationBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TemplateMessage
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="LV\Bundle\FondationBundle\Entity\TemplateMessageRepository")
 */
class TemplateMessage
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
     * @var integer
     *
     * @ORM\Column(name="issend_photo", type="integer")
     */
    private $issend_photo;

    /**
     * @var string
     *
     * @ORM\Column(name="created", type="string", length=255)
     */
    private $created;

    /**
     * @ORM\OneToOne(targetEntity="User", inversedBy="templatemessage")
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
     * Set created
     *
     * @param string $created
     * @return TemplateMessage
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
     * @return TemplateMessage
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
     * Set issend_photo
     *
     * @param integer $issendPhoto
     * @return TemplateMessage
     */
    public function setIssendPhoto($issendPhoto)
    {
        $this->issend_photo = $issendPhoto;

        return $this;
    }

    /**
     * Get issend_photo
     *
     * @return integer 
     */
    public function getIssendPhoto()
    {
        return $this->issend_photo;
    }
}
