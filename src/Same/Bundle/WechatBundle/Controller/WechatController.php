<?php

namespace Same\Bundle\WechatBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Same\Bundle\WechatBundle\Entity\Info;

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
        //$redirecturl = $this->getRequest()->query->get('redirecturl');
        //$code = $this->getRequest()->query->get('code');
        $redirecturl = $this->container->get('session')->get('wechat_callback');
        $openid = $this->getRequest()->query->get('openid');
        $wechat = $this->get('same.wechat');
        //$result = $wechat->getOauthAccessToken($code);
        $result = $wechat->getOauthAccessToken($openid);
        if($result){
            return new RedirectResponse($redirecturl, 302);
        }
    }

    public function saveAction()
    {
        $data = $GLOBALS['HTTP_RAW_POST_DATA'];
        //$data = json_encode(array('data'=>array('openid'=>'123','nickname'=>'456','headimgurl'=>'789')));
        $doctrine = $this->getDoctrine()->getManager();
        $data = json_decode($data, true);
        $repository = $this->getDoctrine()->getRepository('SameWechatBundle:Info');
        $userinfo = $repository->findOneByOpenid($data['data']['openid']);
        if (!$userinfo) {
            $info = new Info();
            $info->setOpenid($data['data']['openid']);
            $info->setNickname($data['data']['nickname']);
            $info->setHeadimgurl($data['data']['headimgurl']);
            $info->setCreatetime(date("Y-m-d H:i:s"));
            $doctrine->persist($info);
            $doctrine->flush();
        }
        $response = new JsonResponse();
        $response->setData(array('code'=> 1, 'msg'=> '提交成功'));
        return $response;
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

    public function refrenceAction()
    {   
        $wechat = $this->get('same.wechat');
        var_dump($wechat->refrenceAccessToken());
        exit;
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
