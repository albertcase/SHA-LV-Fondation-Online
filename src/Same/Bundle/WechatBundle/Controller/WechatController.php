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
        $data = array();
        $data['first']['value'] = '现场拍摄您的定制照片，请告知摄影师您的专属Code';
        $data['first']['color'] = '#000000';
        $data['keyword1']['value'] = '路易威登基金会建筑展';
        $data['keyword1']['color'] = '#000000';
        $data['keyword2']['value'] = date("Y-m-d");
        $data['keyword2']['color'] = '#000000';
        $data['remark']['value'] = '您的专属Code为xxxxxx';
        $data['remark']['color'] = '#000000';
        $wechat = $this->get('same.wechat');
        $template_id = 'boicCRp5adiZr2AoXgGCX-xV7DE1oVhrqbE0RwEx3UY';
        $url = '';
        $topcolor = '#000000';
        return $wechat->sendTemplate($template_id, $url, $topcolor, $data, $openid);
    }

    public function subscribedAction($openid)
    {   
        $wechat = $this->get('same.wechat');
        return new Response($wechat->isSubscribed($openid));
    }


    public function testAction()
    {   
        $image = $this->container->get('lv.image.service');
        //return new Response($image->ImageCreateForOnline('大三大四的'));
        return new Response('<img src="/files'. $image->ImageCreateForOffline('images/imagesevice/test.jpg'). '">');
    }

}
