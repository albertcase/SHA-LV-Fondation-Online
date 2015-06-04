<?php

namespace LV\Bundle\FondationBundle\Services\User;

use LV\Bundle\FondationBundle\Entity\User;
use LV\Bundle\FondationBundle\Entity\UserInfo;
use LV\Bundle\FondationBundle\Entity\UserDream;
use LV\Bundle\FondationBundle\Entity\DreamLike;

class UserService
{
    const ENTITY_NAME = 'LVFondationBundle:User';

    private $em;
    private $requestStack;

    public function __construct($em, $requestStack)
    {
        $this->em = $em;
        $this->requestStack = $requestStack;
    }

    public function userIsLogin()
    {
        $session = $this->requestStack->getCurrentRequest()->getSession();
        $uid = $session->get('user');
        if($uid) {
            return $uid;
        }
        
        return NULL;
        
    }

    public function userLoad()
    {
        if($login = $this->userIsLogin()) {
            $user = $this->em->getRepository(self::ENTITY_NAME)
                ->findOneBy(array('id' => $login));
            return $user;
        }
        return NULL;
    }

    public function userLogin($openid)
    {
        $user = $this->findUserByOpenId($openid);
        $user = $user ? $user : $this->userRegister($openid);
        $session = $this->requestStack->getCurrentRequest()->getSession();
        $session->set('user', $user->getId());
        return $user;
        // $this->requestStack->getCurrentRequest()->cookies;
        // $cookie = new Cookie('openid', $openid, time() + 3600 * 24 * 7);
        // $response = new Response();
        // $response->headers->setCookie($cookie);
        // $response->send();
    }

    public function userRegister($openid)
    {
        $user = new User();
        $user->setOpenid($openid);
        $user->setCreated(time());
        $this->save($user);
        return $user;
    }

    public function createUserInfo($data)
    {
        if($user = $this->userLoad()) {
            $userinfo = new UserInfo();
            $userinfo->setUser($user);
            $userinfo->setName($data['name']);
            $userinfo->setEmail($data['email']);
            $userinfo->setCellphone($data['cellphone']);
            $userinfo->setAddress($data['address']);
            $userinfo->setCreated(time());
            $this->save($userinfo);
            return $user;
        }
        return FALSE;
    }

    public function createUserDream($data) 
    {
        if($user = $this->userLoad()) {
            $dream = new UserDream();
            $dream->setUser($user);
            $dream->setNickname($data['nickname']);
            $dream->setContent($data['content']);
            $dream->setCreated(time());
            $dream->setUpdated(time());
            $this->save($dream);
            return $dream;
        }
        return FALSE;
    }

    public function updateUserDream($data) 
    {
        if($user = $this->userLoad()) {
            $dream = $user->getUserdream();
            $dream->setUser($user);
            $dream->setNickname($data['nickname']);
            $dream->setContent($data['content']);
            $dream->setUpdated(time());
            $this->save($dream);
            return $dream;
        }
        return FALSE;
    }

    public function dreamLike(UserDream $userdream)
    {
        if($user = $this->userLoad()) {
            $dreamlike = new DreamLike();
            $dreamlike->setUser($user);
            $dreamlike->setUserdream($userdream);
            $dreamlike->setCreated(time());
            $this->save($dreamlike);
            return $dreamlike;
        }
        return FALSE;
    }

    public function findUserByOpenId($openid)
    {
        $user = $this->em->getRepository(self::ENTITY_NAME)->findOneBy(array('openid' => $openid));
        if($user)
            return $user;
        return NULL;
    }

    public function findAll()
    {
        return $this->em->getRepository(self::ENTITY_NAME)->findAll();
    }

    public function save($entity)
    {
        $this->em->persist($entity);
        $this->em->flush($entity);
    }
}