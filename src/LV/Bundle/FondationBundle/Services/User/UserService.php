<?php

namespace LV\Bundle\FondationBundle\Services\User;

use LV\Bundle\FondationBundle\Entity\User;
use LV\Bundle\FondationBundle\Entity\UserInfo;
use LV\Bundle\FondationBundle\Entity\UserDream;
use LV\Bundle\FondationBundle\Entity\UserLike;
//use Symfony\Component\HttpFoundation\Cookie;
//use Symfony\Component\HttpFoundation\Response;

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
        $this->create($user);
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
            $this->create($userinfo);
            return $user;
        }
        return FALSE;
    }

    public function createUserDream($data) 
    {
        if($user = $this->userLoad()) {
            $dream = new UserInfo();
            $dream->setUser($user);
            $dream->setContent($data['content']);
            $dream->setCreated(time());
            $this->create($dream);
            return $dream;
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

    public function create($entity)
    {
        $this->em->persist($entity);
        $this->em->flush($entity);
    }
}