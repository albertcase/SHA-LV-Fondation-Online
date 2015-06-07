<?php

namespace LV\Bundle\FondationBundle\Services\User;

use LV\Bundle\FondationBundle\Entity\User;
use LV\Bundle\FondationBundle\Entity\UserInfo;
use LV\Bundle\FondationBundle\Entity\UserDream;
use LV\Bundle\FondationBundle\Entity\DreamLike;
use LV\Bundle\FondationBundle\Entity\DreamView;
use LV\Bundle\FondationBundle\Entity\InvitationLetter;

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

    public function createInvitationLetter($data)
    {
        if($user = $this->userLoad()) {
            $invitation = new InvitationLetter();
            $invitation->setName($data['name']);
            $invitation->setCellphone($data['cellphone']);
            $invitation->setImgurl($data['imgurl']);
            $invitation->setCreated(time());
            $invitation->setUser($user);
            $this->save($invitation);
            return $invitation;
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

    public function dreamView(UserDream $userdream)
    {
        if($user = $this->userLoad()) {
            if($user->getId() != $userdream->getUser()->getId()) {
                $dreamview = new DreamView();
                $dreamview->setUser($user);
                $dreamview->setUserdream($userdream);
                $dreamview->setCreated(time());
                $this->save($dreamview);
                return $dreamview;        
            }

        }
        return FALSE;
    }

    public function retrieveDreamInfoByDreamId($dream_id)
    {
        if($user = $this->userLoad()) {

            $dream = $this->em->getRepository('LVFondationBundle:UserDream')->findOneBy(array('id' => $dream_id));

            $this->dreamView($dream);

            $dreamcount = $this->em->getRepository('LVFondationBundle:UserDream')->retrieveDreamCount();
            $nickname = $dream->getNickname();
            $content = $dream->getContent();
            $days = ceil((time() - $dream->getCreated()) / (3600 * 24));
            $views = $this->em->getRepository('LVFondationBundle:DreamView')->retrieveViewCount($dream_id);
            $liked = $this->em->getRepository('LVFondationBundle:DreamLike')->retrieveLikedCount($dream_id);

            if($dream->getUser()->getId() == $user->getId()){
                $call = '您';
                $who = 'myself';
            } else {
                $call = '他(她)';
                $who = 'others';
            }

            $dreaminfo = array(
                'dreamcount' => $dreamcount,
                'nickname' => $nickname,
                'content' => $content,
                'call' => $call,
                'days' => $days,
                'views' => $views,
                'liked' => $liked,
                'who' => $who,
                );
            return $dreaminfo;
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