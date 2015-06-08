<?php

namespace LV\Bundle\FondationBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * InvitationLetter
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="LV\Bundle\FondationBundle\Entity\InvitationLetterRepository")
 */
class InvitationLetter
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
     * @Assert\NotNull()
     * @ORM\Column(name="name", type="string", length=255)
     */
    private $name;

    /**
     * @var string
     *
     * @ORM\Column(name="cellphone", type="string", length=255)
     */
    private $cellphone;
    
    /**
     * @var string
     *
     * @ORM\Column(name="imgurl", type="string", length=255)
     */
    private $imgurl;


    /**
     * @var string
     *
     * @ORM\Column(name="created", type="string", length=255)
     */
    private $created;

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
     * Set name
     *
     * @param string $name
     * @return InvitationLetter
     */
    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }

    /**
     * Get name
     *
     * @return string 
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set cellphone
     *
     * @param string $cellphone
     * @return InvitationLetter
     */
    public function setCellphone($cellphone)
    {
        $this->cellphone = $cellphone;

        return $this;
    }

    /**
     * Get cellphone
     *
     * @return string 
     */
    public function getCellphone()
    {
        return $this->cellphone;
    }

    /**
     * Set created
     *
     * @param string $created
     * @return InvitationLetter
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
     * Set imgurl
     *
     * @param string $imgurl
     * @return InvitationLetter
     */
    public function setImgurl($imgurl)
    {
        $this->imgurl = $imgurl;

        return $this;
    }

    /**
     * Get imgurl
     *
     * @return string 
     */
    public function getImgurl()
    {
        return $this->imgurl;
    }

    /**
     * Set user
     *
     * @param \LV\Bundle\FondationBundle\Entity\User $user
     * @return InvitationLetter
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
}
