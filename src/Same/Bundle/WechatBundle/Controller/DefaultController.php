<?php

namespace Same\Bundle\WechatBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('SameWechatBundle:Default:index.html.twig', array('name' => $name));
    }

    public function oauthAction()
    {
    	echo 1;
        exit;
    }
}
