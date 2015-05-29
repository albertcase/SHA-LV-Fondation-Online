<?php

namespace LV\Bundle\FondationBundle\Services\User;

use LV\Bundle\FondationBundle\Entity\User;
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
        $openid = $session->get('user');
        if($openid) {
            return $openid;
        }
        
        return NULL;
        
    }

    public function userLogin($openid) 
    {
        $user = $this->findUserByOpenId($openid);
        $user = $user ? $user : $this->userRegister($openid);
        $session = $this->requestStack->getCurrentRequest()->getSession();
        $openid = $user->getOpenId();
        $session->set('user', $openid);
        return $openid;
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

    public function create(User $user)
    {
        $this->em->persist($user);
        $this->em->flush($user);
    }
}