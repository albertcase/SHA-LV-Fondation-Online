<?php

namespace LV\Bundle\FondationBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\JsonResponse;

class LVApiRequestListener
{

    private $router;
    private $container;

    public function __construct($router, $container)
    {
        $this->router = $router;
        $this->container = $container;
    }    

    public function onKernelRequest(GetResponseEvent $event)
    {

        $request = $event->getRequest();
    	$current_route = $request->get('_route');
        
    	if($current_route && preg_match('/^api_fondation_*/', $current_route)) {

            $user = $this->container->get('lv.user.service');

            if($event->getRequest()->isXmlHttpRequest()) 
                $event->setResponse($this->getResponseCode('002')); //is not XmlHttpRequest
            
            if(!$user->userIsLogin())
                $event->setResponse($this->getResponseCode('001')); //user is not login

            if($current_route == 'api_fondation_invite' && $code = $this->inviteValidate($request))
                $event->setResponse($this->getResponseCode($code)); 

            if($current_route == 'api_fondation_userinfo' && $code = $this->userInfoValidate($request))
                $event->setResponse($this->getResponseCode($code));

            if($current_route == 'api_fondation_userdream' && $code = $this->userDreamValidate($request))
                $event->setResponse($this->getResponseCode($code));  

    	}
    }

    private function getResponseCode($code) 
    {
        $response = new JsonResponse();
        $status = array('status' => $code);
        $response->setData($status);
        return $response;   
    }
    
    private function inviteValidate($request) 
    {
        $name = $request->request->get('name');
        $cellphone = $request->request->get('cellphone');
        if(!$name)
            return '010'; //The name is empty
        if(!preg_match('/^\d{11}$/', $cellphone))
            return '011'; //The cellphone number is wrong
        $is_cellphone = $this->container->get('doctrine')
            ->getRepository('LVFondationBundle:IvitationLetter')
            ->findOneBy(array('cellphone' => $cellphone));
        if($is_cellphone)
            return '012'; //The cellphone is already exist
        return FALSE;
    }

    private function userInfoValidate($request) 
    {
        $user = $this->container->get('lv.user.service')->userLoad();        
        if($user->getUinfo())
            return '015'; //The user info is already submitted

        $name = $request->request->get('name');
        $email = $request->request->get('email');
        $cellphone = $request->request->get('cellphone');
        $address = $request->request->get('address');

        if(!$name)
            return '010'; //The name is empty
        if(!preg_match('/.+\@.+\..+/', $email))
            return '013'; //The email is wrong
        if(!preg_match('/^\d{11}$/', $cellphone))
            return '011'; //The cellphone number is wrong
        if(!$address)
            return '014'; //The address is empty

        $userinfo = $this->container->get('doctrine')->getRepository('LVFondationBundle:UserInfo');

        if($userinfo->findOneBy(array('cellphone' => $cellphone))) 
            return '016'; //The cellphone is already token
        
        if($userinfo->findOneBy(array('email' => $email))) 
            return '017'; //The email is already token

        return FALSE;
    }

    private function userDreamValidate($request) 
    {
        $content = $request->request->get('content');

        $user = $this->container->get('lv.user.service')->userLoad();        
        if($user->getUinfo())
            return '015'; //The user info is already submitted
        if(!$name)
            return '010'; //The name is empty
        if(!preg_match('/.+\@.+\..+/', $email))
            return '013'; //The email is wrong
        if(!preg_match('/^\d{11}$/', $cellphone))
            return '011'; //The cellphone number is wrong
        if(!$address)
            return '014'; //The address is empty


        return FALSE;
    }
}