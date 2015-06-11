<?php

namespace Same\Bundle\WechatBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\JsonResponse;

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
        $redirecturl = $this->getRequest()->query->get('redirecturl');
    	$wechat = $this->get('same.wechat');
    	switch ($type) {
    		case '1':
    			// userinfo
    			return $wechat->oauth($redirecturl,'snsapi_userinfo');
    			break;

    		case '2':
    			// base
    			return $wechat->oauth($redirecturl,'snsapi_base');
    			break;

    		default:
    			
    			break;
    	}
        //return new Response('aaa'.$type);
    }

    public function callbackAction()
    {
        $redirecturl = $this->getRequest()->query->get('redirecturl');
        $code = $this->getRequest()->query->get('code');
        $wechat = $this->get('same.wechat');
        $result = $wechat->getOauthAccessToken($code);
        if(isset($result['access_token'])){
            return new RedirectResponse($redirecturl, 302);
        }
    }

    public function isloginAction()
    {
        $redirecturl = $this->getRequest()->query->get('redirecturl');
        $wechat = $this->get('same.wechat');
        return $wechat->isLogin('islogin');
    }

    public function jssdkAction()
    {   
        $url = $this->getRequest()->query->get('url');
        $wechat = $this->get('same.wechat');
        return $wechat->getJsTicket($url);
    }

    public function tempalteAction($openid)
    {   
        $wechat = $this->get('same.wechat');
        return $wechat->sendTemplate($openid);
    }

    public function subscribedAction($openid)
    {   
        $wechat = $this->get('same.wechat');
        return new Response($wechat->isSubscribed($openid));
    }


    public function testAction()
    {   
        $image = $this->container->get('lv.image.service');
        return new Response($image->ImageCreateForOnline('周春天'));
        return new Response($image->ImageCreateForOffline('images/imagesevice/test.jpg'));
    }

}
