<?php

namespace LV\Bundle\CvdBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Locks
 */
class Locks
{
    /**
     * @var integer
     */
    private $id;

    /**
     * @var string
     */
    private $imgurl;

    /**
     * @var string
     */
    private $sex;

    /**
     * @var integer
     */
    private $created;


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
     * Set imgurl
     *
     * @param string $imgurl
     * @return Locks
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
     * Set sex
     *
     * @param string $sex
     * @return Locks
     */
    public function setSex($sex)
    {
        $this->sex = $sex;

        return $this;
    }

    /**
     * Get sex
     *
     * @return string 
     */
    public function getSex()
    {
        return $this->sex;
    }

    /**
     * Set created
     *
     * @param integer $created
     * @return Locks
     */
    public function setCreated($created)
    {
        $this->created = $created;

        return $this;
    }

    /**
     * Get created
     *
     * @return integer 
     */
    public function getCreated()
    {
        return $this->created;
    }
}
