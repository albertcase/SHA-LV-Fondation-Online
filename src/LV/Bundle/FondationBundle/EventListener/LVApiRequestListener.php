<?php

namespace LV\Bundle\FondationBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

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

    	$current_route = $event->getRequest()->get('_route');
        
    	if($current_route && preg_match('/^api_fondation_*/', $current_route)) {

            $user = $this->container->get('lv.user.service');

            if(!$event->getRequest()->isXmlHttpRequest()) 
                $event->setResponse($this->getResponseCode('001'));   
            
            if(!$user->userIsLogin())
                $event->setResponse($this->getResponseCode('002'));  

    	}
    }

    private function getResponseCode($code) {
        $status = array('status' => $code);
        return new Response(json_encode($status));   
    }
    
}