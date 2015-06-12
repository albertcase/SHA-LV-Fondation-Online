<?php

namespace LV\Bundle\FondationBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;

class ApiController extends Controller
{

    /** 
    * fondation_invite
    *
    * Create a invitation
    *
    * @access public
    * @param mixed name 
    * @param mixed cellphone
    * @since 1.0 
    * @return json  inviteImage
    */ 
    public function inviteAction()
    {
        $request = $this->getRequest()->request;
        $status = array('status' => 0);
        $image = $this->container->get('lv.image.service');
        $data = array(
            'name' => $request->get('name'),
            'cellphone' => $request->get('cellphone'),
            'imgurl' => $image->ImageCreateForOnline($request->get('name')),
            );
        $user = $this->container->get('lv.user.service');

        if($invitation = $user->createInvitationLetter($data)) {
            $url = $this->generateUrl(
                    'lv_fondation_showinvitation',
                    array('id' => $invitation->getId()),
                    true
                );
            $status = array('status' => 1, 'url' => $url);
        }
        $response = new JsonResponse();
        $response->setData($status);
        return $response;
    }

    /** 
    * fondation_userinfo
    *
    * Get userinfo
    *
    * @access public
    * @since 1.0 
    * @return json 
    */ 
    public function userInfoAction()
    {
        $request = $this->getRequest()->request;
        $status = array('status' => 0);
        $data = array(
            'name' => $request->get('name'),
            'email' => $request->get('email'),
            'cellphone' => $request->get('cellphone'),
            );
        $user = $this->container->get('lv.user.service');

        if($user->createUserInfo($data)) {
            $status = 1;
        }
        $response = new JsonResponse();
        $response->setData(array('status' => $status));
        return $response;
    }

    /** 
    * fondation_userdream
    *
    * Create a userdream
    *
    * @access public
    * @param mixed nickname 
    * @param mixed content
    * @since 1.0 
    * @return json 
    */ 
    public function userDreamAction()
    {
        $request = $this->getRequest()->request;
        $status = array('status' => 0);
        $data = array(
            'nickname' => $request->get('nickname'),
            'content' => $request->get('content'),
            );
        $user = $this->container->get('lv.user.service');

        if($dream = $user->createUserDream($data)) {
            $url = $this->generateUrl(
                    'lv_fondation_userdream',
                    array('id' => $dream->getId()),
                    true
                );
            $status = array('status' => 1, 'url' => $url);
        }
        $response = new JsonResponse();
        $response->setData($status);
        return $response;
    }

    /** 
    * fondation_userdream
    *
    * Update a userdream
    *
    * @access public
    * @param mixed nickname 
    * @param mixed content
    * @since 1.0 
    * @return json 
    */ 
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

    /** 
    * fondation_userdream_ballot
    *
    * Ballot a userdream by id
    *
    * @access public
    * @param mixed dream_id 
    * @since 1.0 
    * @return json 
    */ 
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
