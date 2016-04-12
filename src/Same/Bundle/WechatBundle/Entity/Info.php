<?php

namespace Same\Bundle\WechatBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Info
 */
class Info
{
    /**
     * @var integer
     */
    private $id;

    /**
     * @var string
     */
    private $openid;

    /**
     * @var string
     */
    private $nickname;

    /**
     * @var string
     */
    private $headimgurl;

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
