<?php

namespace Same\Bundle\WechatBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Info
 *
 * @ORM\Table()
 * @ORM\Entity
 */
class Info
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
     * @ORM\Column(name="nickname", type="blob")
     */
    private $nickname;

    /**
     * @var string
     *
     * @ORM\Column(name="headimgurl", type="string", length=255)
     */
    private $headimgurl;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="createtime", type="datetime")
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
     * Set openid
     *
     * @param string $openid
     * @return Info
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
     * Set nickname
     *
     * @param string $nickname
     * @return Info
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
     * Set headimgurl
     *
     * @param string $headimgurl
     * @return Info
     */
    public function setHeadimgurl($headimgurl)
    {
        $this->headimgurl = $headimgurl;

        return $this;
    }

    /**
     * Get headimgurl
     *
     * @return string 
     */
    public function getHeadimgurl()
    {
        return $this->headimgurl;
    }

    /**
     * Set createtime
     *
     * @param \DateTime $createtime
     * @return Info
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
