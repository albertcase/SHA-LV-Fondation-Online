<?php

namespace LV\Bundle\NdsBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use LV\Bundle\NdsBundle\Entity\Ndsinfo;

class DefaultController extends Controller
{
    public function indexAction()
    {
        if (date("mdH") >= 122823 && date("mdH") <= 122901) {
            header("Content-type:text/html;charset=utf-8");
            print '系统正在维护中，请于29日1点后访问该页面';
            exit;
        }
        if (date("mdH") >= 122910 && date("mdH") <= 122912) {
            header("Content-type:text/html;charset=utf-8");
            print '系统正在维护中，请于29日12点后访问该页面';
            exit;
        }
    	$user = $this->get('lv.user.service');
    	$wechat = $this->get('same.wechat');
    	if(!$user->userLoad()) {

	        $url = $this->getRequest()->getRequestUri();

	        $isWechatLogin = $wechat->isLogin($url);
	        if($isWechatLogin instanceof RedirectResponse)
	           return $isWechatLogin;

	       $user->userLogin($isWechatLogin);
	    }
        $openid = $user->userLoad()->getOpenid();

	    $subscribe = $wechat->isSubscribed($openid);
        return $this->render('LVNdsBundle:Default:index.html.twig', array('subscribe' => $subscribe));

    }

    public function testAction()
    {
        header("Content-type:text/html;charset=utf-8");
        print '系统正在维护中，请于29日1点后访问该页面';
        exit;
    }

    public function infoAction()
    {
        $request = $this->getRequest()->request;
        $name = $request->get('name');
        $mobile = $request->get('mobile');
        $sex = $request->get('sex');
        $time = $request->get('time');
        //$idcard = $request->get('idcard');
        $user = $this->container->get('lv.user.service')->userLoad();
        $repository = $this->getDoctrine()->getRepository('LVNdsBundle:Ndsinfo');
        $log = $repository->findByUser($user);
        if(!$log){
            $ndsinfo = new Ndsinfo();
            $ndsinfo->setUser($user);
            $ndsinfo->setName($name);     
            $ndsinfo->setMobile($mobile);
            $ndsinfo->setSex($sex);
            $ndsinfo->setTime($time);
            $ndsinfo->setCreated(date("Y-m-d H:i:s"));
            $doctrine = $this->getDoctrine()->getManager();
            $doctrine->persist($ndsinfo);
            $doctrine->flush();
            $status = array('code' => '1', 'msg' => '提交成功');
            $response = new JsonResponse();
            $response->setData($status);
            return $response;
        }
        $status = array('code' => '2', 'msg' => '您已提交过信息');
        $response = new JsonResponse();
        $response->setData($status);
        return $response;
    }
}
