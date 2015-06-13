<?php

namespace LV\Bundle\FondationBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Photos
 *
 * @ORM\Table()
 * @ORM\Entity(repositoryClass="LV\Bundle\FondationBundle\Entity\PhotosRepository")
 */
class Photos
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
     * @ORM\Column(name="url", type="string", length=255)
     */
    private $url;

    /**
     * @var string
     *
     * @ORM\Column(name="created", type="string", length=255)
     */
    private $created;

    /**
     * @ORM\ManyToOne(targetEntity="UserPhotoCode")
     * @ORM\JoinColumn(name="code_id", referencedColumnName="id")
     */
    private $userphotocode;



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
     * Set url
     *
     * @param string $url
     * @return Photo
     */
    public function setUrl($url)
    {
        $this->url = $url;

        return $this;
    }

    /**
     * Get url
     *
     * @return string 
     */
    public function getUrl()
    {
        return $this->url;
    }

    /**
     * Set created
     *
     * @param string $created
     * @return Photo
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
     * Set userphotocode
     *
     * @param \LV\Bundle\FondationBundle\Entity\UserPhotoCode $userphotocode
     * @return Photo
     */
    public function setUserphotocode(\LV\Bundle\FondationBundle\Entity\UserPhotoCode $userphotocode = null)
    {
        $this->userphotocode = $userphotocode;

        return $this;
    }

    /**
     * Get userphotocode
     *
     * @return \LV\Bundle\FondationBundle\Entity\UserPhotoCode 
     */
    public function getUserphotocode()
    {
        return $this->userphotocode;
    }
}
