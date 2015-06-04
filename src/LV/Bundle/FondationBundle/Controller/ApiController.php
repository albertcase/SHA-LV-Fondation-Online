<?php

namespace LV\Bundle\FondationBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use LV\Bundle\FondationBundle\Entity\IvitationLetter;
use LV\Bundle\FondationBundle\Valid\LVApiValidator;

class ApiController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('LVFondationBundle:Default:index.html.twig', array('name' => $name));
    }


    public function jssdkAction()
    {
        $http_data = array();
        $http_data['url'] = $this->getRequest()->request->get('url');
        $result = file_get_contents("http://vuitton.cynocloud.com/Interface/getSignPackage?" . http_build_query($http_data));
        $response = new JsonResponse();
        $response->setData(json_decode($result));
        return $response;
    }
    
    public function inviteAction()
    {
        $request = $this->getRequest()->request;
        $ivitate = new IvitationLetter();
        $ivitate->setName($request->get('name'));
        $ivitate->setCellphone($request->get('cellphone'));
        $ivitate->setCreated(time());

        $em = $this->getDoctrine()->getManager();
        $em->persist($ivitate);
        $em->flush();

        $response = new JsonResponse();
        $response->setData(array('status' => 1));
        return $response;
    }

    public function userInfoAction()
    {
        $request = $this->getRequest()->request;
        $status = 0;
        $data = array(
            'name' => $request->get('name'),
            'email' => $request->get('email'),
            'cellphone' => $request->get('cellphone'),
            'address' => $request->get('address'),
            );
        $user = $this->container->get('lv.user.service');

        if($user->createUserInfo($data)) {
            $status = 1;
        }
        $response = new JsonResponse();
        $response->setData(array('status' => $status));
        return $response;
    }

    public function userDreamAction()
    {
        $request = $this->getRequest()->request;
        $status = 0;
        $data = array(
            'nickname' => $request->get('nickname'),
            'content' => $request->get('content'),
            );
        $user = $this->container->get('lv.user.service');

        if($user->createUserDream($data)) {
            $status = 1;
        }
        $response = new JsonResponse();
        $response->setData(array('status' => $status));
        return $response;
    }

    public function userDreamUpdateAction()
    {
        $request = $this->getRequest()->request;
        $status = 0;
        $data = array(
            'nickname' => $request->get('nickname'),
            'content' => $request->get('content'),
            );
        $user = $this->container->get('lv.user.service');

        if($user->updateUserDream($data)) {
            $status = 1;
        }
        $response = new JsonResponse();
        $response->setData(array('status' => $status));
        return $response;
    }

    public function dreamLikeAction()
    {
        $request = $this->getRequest()->request;
        $status = 0;

        $user = $this->container->get('lv.user.service');

        $userdream = $this->getDoctrine()
            ->getRepository('LVFondationBundle:UserDream')
            ->findOneBy(array('id' => $request->get('dream_id')));

        if($user->dreamLike($userdream)) {
            $status = 1;
        }
        $response = new JsonResponse();
        $response->setData(array('status' => $status));
        return $response;
    }
}