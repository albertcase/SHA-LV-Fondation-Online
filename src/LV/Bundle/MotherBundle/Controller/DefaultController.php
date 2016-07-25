<?php

namespace LV\Bundle\MotherBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use LV\Bundle\MotherBundle\Entity\Greeting;

class DefaultController extends Controller
{
    public function indexAction($id = 0)
    { 
        if (!strpos($_SERVER['HTTP_USER_AGENT'],"Mobile")) {
             $url = $this->generateUrl('lv_mother_desktop');
             return new RedirectResponse($url);
        }
        $user = $this->get('lv.user.service');
        $wechat = $this->get('same.wechat');
        if(!$user->userLoad()) {

            $url = $this->getRequest()->getRequestUri();

            $isWechatLogin = $wechat->isLogin($url, 'snsapi_userinfo');
            if($isWechatLogin instanceof RedirectResponse)
               return $isWechatLogin;

           $user->userLogin($isWechatLogin);
        }
        //echo $openid = $user->userLoad()->getOpenid();exit;
        $repository = $this->getDoctrine()->getRepository('LVMotherBundle:Greeting');
        $log = $repository->findOneByUser($user->userLoad());
        $greeting = 0; 
        if ($log) {
            $greeting = $log->getId();
        }
        return $this->render('LVMotherBundle:Default:index.html.twig', array('id' => $id, 'greeting' => $greeting));
    }

    public function logoutAction()
    {
        $this->container->get('session')->clear();
        exit;
    }

    

    public function saveAction()
    {
        $user = $this->container->get('lv.user.service')->userLoad();
        if (!$user) {
            $status = array('code' => '0', 'msg' => '未登录');
            $response = new JsonResponse();
            $response->setData($status);
            return $response;
        }
        $request = $this->getRequest()->request;
        $message = $request->get('message');
        $repository = $this->getDoctrine()->getRepository('LVMotherBundle:Greeting');
        $log = $repository->findByUser($user);
        if (!$log) {
            $greeting = new Greeting();
            $greeting->setUser($user);
            $repository2 = $this->getDoctrine()->getRepository('SameWechatBundle:Info');
            $info = $repository2->findOneByOpenid($user->getOpenid());
            $greeting->setNickname($info->getNickname());
            $greeting->setMessage($message);     
            $greeting->setCreatetime(date("Y-m-d H:i:s"));
            $doctrine = $this->getDoctrine()->getManager();
            $doctrine->persist($greeting);
            $doctrine->flush();
            $status = array('code' => '1', 'msg' => $greeting->getId());
            $response = new JsonResponse();
            $response->setData($status);
            return $response;
        }
        $status = array('code' => '2', 'msg' => '您已提交过信息');
        $response = new JsonResponse();
        $response->setData($status);
        return $response;
    }

    public function cardAction($id = 1){
        // $repository = $this->getDoctrine()->getRepository('LVMotherBundle:Greeting');
        // $greeting = $repository->findById($id);
        // if (!$greeting) {
        //     $url = $this->generateUrl('lv_mother_homepage');
        //     return new RedirectResponse($url, 302);
        // }
        return $this->render('LVMotherBundle:Default:card.html.twig', array('id' => $id));
    }

    public function proAction($id = 0){
        // $repository = $this->getDoctrine()->getRepository('LVMotherBundle:Greeting');
        // $greeting = $repository->findById($id);
        // if (!$greeting) {
        //     $url = $this->generateUrl('lv_mother_homepage');
        //     return new RedirectResponse($url, 302);
        // }
        return $this->render('LVMotherBundle:Default:pro.html.twig', array('id' => $id));
    }

    public function homeAction($id = 0){
        $repository = $this->getDoctrine()->getRepository('LVMotherBundle:Greeting');
        $greeting = $repository->findOneById($id);
        if (!$greeting) {
            $url = $this->generateUrl('lv_mother_homepage');
            return new RedirectResponse($url, 302);
        }
        return $this->render('LVMotherBundle:Default:home.html.twig', array('id' => $id, 'greeting' => $greeting, 'isplay'=> 1));
    }

    public function desktopAction(){
        // $repository = $this->getDoctrine()->getRepository('LVMotherBundle:Greeting');
        // $greeting = $repository->findById($id);
        // if (!$greeting) {
        //     $url = $this->generateUrl('lv_mother_homepage');
        //     return new RedirectResponse($url, 302);
        // }
        return $this->render('LVMotherBundle:Default:desktop.html.twig');
    }
}
