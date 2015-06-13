<?php

namespace Same\Bundle\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Same\Bundle\AdminBundle\Entity\Photo;
use LV\Bundle\FondationBundle\Entity\UserDream;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('SameAdminBundle:Default:index.html.twig');
    }

    public function loginAction()
    {
        $username = $this->getRequest()->query->get('account');
        $password = $this->getRequest()->query->get('password');
        $msg = array();
        if($username == 'admin' && $password == 'lv2015'){
            $this->container->get('session')->set('same_admin_name',$username);
            $msg = array('code'=> 1, "msg"=>'file');
        }else if($username == 'admin' && $password == '1qazxsw2'){
            $this->container->get('session')->set('same_admin_name',$username);
            $msg = array('code'=> 1, "msg"=>'list');
        }else{
            $msg = array('code'=> 0, "msg"=>'登录失败');
        }
        $response = new JsonResponse();
        $response->setData($msg);
        return $response;
    }

    public function fileAction()
    {
        return $this->render('SameAdminBundle:Default:file.html.twig');
    }

    public function tableAction()
    {   
        $page = $this->getRequest()->query->get('page');
        $row  = $this->getRequest()->query->get('row') ? $this->getRequest()->query->get('row') : 10;
        $repository = $this->getDoctrine()->getRepository('LVFondationBundle:UserDream');
        $list = $repository->findBy(array(), null, $row, ($page-1)*$row);
        return $this->render('SameAdminBundle:Default:table.html.twig', array('list' => $list));
    }

    public function reviewAction()
    {
        $id = $this->getRequest()->query->get('id');
        $repository = $this->getDoctrine()->getRepository('LVFondationBundle:UserDream');
        $userDream = $repository->findOneById($id);
        $status = $userDream->getStatus();
        $newStatus = abs($status - 1);
        $em = $this->getDoctrine()->getManager();
        $userDream->setStatus($newStatus);
        $em->flush();
        $returnMsg = array('code'=>1, 'msg'=>$newStatus);
        $response = new JsonResponse();
        $response->setData($returnMsg);
        return $response;
    }

    public function dbtocsvAction()
    {
        return $this->render('SameAdminBundle:Default:upload.html.twig');
    }

    public function clearAction()
    {
        session_unset();
        session_destroy();
        print '清除成功';
        exit;
    }

    public function lookAction()
    {
        $code = $this->getRequest()->get('code');
        $repository = $this->getDoctrine()->getRepository('SameAdminBundle:Photo');
        $rs = $repository->findOneByCode($code);
        $photo = $rs->getPhoto();
        $photo = json_decode($photo, true);
        return $this->render('SameAdminBundle:Default:look.html.twig',array('photo'=> $photo));
    }

    public function uploadAction()
    {
        $files = $this->getRequest()->files->get('file');
        $fs = new Filesystem();
        $imageurl = array();
        for($i = 0; $i < count($files); $i++) {
            $filename = time() . rand(100,999) . '.jpg';
            $fs->rename($files[$i], $this->container->getParameter('files_base_dir') . '/' .$filename);
            $image = $this->container->get('lv.image.service');
            $imageurl[]= $image->ImageCreateForOffline($this->container->getParameter('files_base_dir') . '/' .$filename);
        }
        $response = new JsonResponse();
        $response->setData($imageurl);
        return $response;
    }

    public function submitAction()
    {
        $code = $this->getRequest()->get('code');
        $files = $this->getRequest()->get('files');
        $repository = $this->getDoctrine()->getRepository('SameAdminBundle:Photo');
        $rs = $repository->findOneByCode($code);
        if($rs){
            $response = new JsonResponse();
            $response->setData(array('code'=> 0, 'msg'=> '该code已经被使用了'));
            return $response;
        }
        $photo = new Photo();
        $photo->setCode($code);
        $photo->setPhoto($files);
        $doctrine = $this->getDoctrine()->getManager();
        $doctrine->persist($photo);
        $doctrine->flush();
        $response = new JsonResponse();
        $response->setData(array('code'=> 1, 'msg'=> '提交成功'));
        return $response;
    }
}
