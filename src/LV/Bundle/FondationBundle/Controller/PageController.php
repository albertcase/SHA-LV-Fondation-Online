<?php

namespace LV\Bundle\FondationBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use LV\Bundle\FondationBundle\Entity\User;
use LV\Bundle\FondationBundle\Entity\UserInfo;
use Symfony\Component\HttpFoundation\Response;
use LV\Bundle\FondationBundle\Event\FilterTestOneEvent;
use LV\Bundle\FondationBundle\Services\User\TestEvent;

class PageController extends Controller
{
    public function indexAction($name)
    {
    	//return new Response(json_encode(array(3)), 200);
        return $this->render('LVFondationBundle:Default:index.html.twig', array('name' => $name));
    }

    public function createUserAction()
    {   
        $user = new User();
        $user->setOpenid('adfadsfassfdsdf');
        $user->setCreated(time());
        $em = $this->getDoctrine()->getManager();
        $em->persist($user);
        $em->flush();
        var_Dump($user->getId());exit;
    }

    public function createUserInfoAction()
    {   
        $us = $this->get('lv.user.service');
        //$us->userLogin('albertshen4fd3');
        var_dump($us->userIsLogin()); exit;
        //$a = '2';
        $response = new Response(json_encode(array('name' => $a->getOpenId())));
        $response->headers->set('Content-Type', 'application/json');

        return $response;

        $user = $this->getDoctrine()
            ->getRepository('LVFondationBundle:User')
            ->find(2);
        $userinfo = new UserInfo();
        $userinfo->setName('沈浩东');
        $userinfo->setEmail('albertshen@126');
        $userinfo->setCellphone('13524703157');
        $userinfo->setAddress('上海市嘉定区宝安公路2888弄153号');
        $userinfo->setUser($user);

        $em = $this->getDoctrine()->getManager();
        $em->persist($userinfo);
        $em->flush();
        var_Dump($userinfo->getId());exit;
    }

    public function testEventAction()
    {


        

exit;

    }
}
