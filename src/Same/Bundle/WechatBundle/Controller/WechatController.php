<?php

namespace Same\Bundle\WechatBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpFoundation\Response;

//use Symfony\Component\HttpFoundation\Request;

class WechatController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('SameWechatBundle:Default:index.html.twig', array('name' => $name));
    }

    public function oauthAction($type)
    {
        //$appid = $this->container->getParameter('appid');
       // $appsecret = $this->container->getParameter('appsecret');
        //$request = Request::createFromGlobals();
        $redirecturl = $this->getRequest()->get('redirecturl');
    	$wechat = $this->get('same.wechat');
    	switch ($type) {
    		case '1':
    			// user_info
    			return $wechat->oauthUserInfo($redirecturl);
    			break;

    		case '2':
    			// base
    			return $wechat->oauthBase($redirecturl);
    			break;

    		default:
    			
    			break;
    	}
        //return new Response('aaa'.$type);
    }

    public function callback_userinfoAction()
    {
        $redirecturl = $this->getRequest()->get('redirecturl');
        $code = $this->getRequest()->get('code');
        $wechat = $this->get('same.wechat');
        $result = $wechat->getOauthAccessToken($code);
        if(isset($result['access_token'])){
            return ;
        }
        exit;
    }

    public function callback_baseAction()
    {
        $redirecturl = $this->getRequest()->get('redirecturl');
        $code = $this->getRequest()->get('code');
        $wechat = $this->get('same.wechat');
        $result = $wechat->getOauthAccessToken($code);
        if(isset($result['access_token'])){
            
        }
    }

    public function isloginAction()
    {
        $wechat = $this->get('same.wechat');
        return $rs = $wechat->isLoginUserInfo();
    }
}
