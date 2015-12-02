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

    	$user = $this->get('lv.user.service');
    	$wechat = $this->get('same.wechat');
    	if(!$user->userLoad()) {

	        $url = $this->getRequest()->getRequestUri();

	        $isWechatLogin = $wechat->isLogin($url);
	        if($isWechatLogin instanceof RedirectResponse)
	           return $isWechatLogin;

	        $user->userLogin($isWechatLogin);
	    }
	    $subscribe = 0;
        return $this->render('LVNdsBundle:Default:index.html.twig', array('subscribe' => $subscribe));
    }

    public function infoAction()
    {
        $request = $this->getRequest()->request;
        $name = $request->get('name');
        $mobile = $request->get('mobile');
        $sex = $request->get('sex');
        $city = $request->get('city');
        $idcard = $request->get('idcard');
        $user = $this->container->get('lv.user.service')->userLoad();
        $repository = $this->getDoctrine()->getRepository('LVNdsBundle:Ndsinfo');
        $log = $repository->findByUser($user);
        if(!$log){
            $ndsinfo = new Ndsinfo();
            $ndsinfo->setUser($user);
            $ndsinfo->setName($name);     
            $ndsinfo->setMobile($mobile);
            $ndsinfo->setSex($sex);
            $ndsinfo->setCity($city);
            $ndsinfo->setIdcard($idcard);
            $doctrine = $this->getDoctrine()->getManager();
            $doctrine->persist($ndsinfo);
            $doctrine->flush();
        }
        $status = array('data' => '1', 'msg' => '提交成功');
        $response = new JsonResponse();
        $response->setData($status);
        return $response;
    }
}
