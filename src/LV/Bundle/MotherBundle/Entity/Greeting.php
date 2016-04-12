<?php

namespace LV\Bundle\MotherBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Greeting
 */
class Greeting
{
    /**
     * @var integer
     */
    private $id;

    /**
     * @ORM\OneToOne(targetEntity="LV\Bundle\FondationBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id")
     */
    private $user;

    /**
     * @var string
     */
    private $message;

    /**
     * @var \DateTime
     */
    private $createtime;


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
     * @param string $user
     * @return Greeting
     */
    public function setUser($user)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return string 
     */
    public function getUser()
    {
        return $this->user;
    }

    /**
     * Set message
     *
     * @param string $message
     * @return Greeting
     */
    public function setMessage($message)
    {
        $this->message = $message;

        return $this;
    }

    /**
     * Get message
     *
     * @return string 
     */
    public function getMessage()
    {
        return $this->message;
    }

    /**
     * Set createtime
     *
     * @param \DateTime $createtime
     * @return Greeting
     */
    public function setCreatetime($createtime)
    {
        $this->createtime = $createtime;

        return $this;
    }

    /**
     * Get createtime
     *
     * @return \DateTime 
     */
    public function getCreatetime()
    {
        return $this->createtime;
    }
}
