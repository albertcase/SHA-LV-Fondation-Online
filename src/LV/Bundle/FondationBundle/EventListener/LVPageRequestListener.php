<?php

namespace LV\Bundle\FondationBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;

class LVPageRequestListener
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
        
    	if($current_route && !preg_match('/^api_fondation_*/', $current_route) &&!preg_match('/^same_wechat_*/', $current_route)&&!preg_match('/^same_admin_*/', $current_route)) {

            $user = $this->container->get('lv.user.service');
            if(!$user->userIsLogin()) {
                
                $wechat = $this->container->get('same.wechat');

                $url = $this->router->generate($current_route);

                $isWechatLogin = $wechat->isLogin($url);

                if($isWechatLogin instanceof RedirectResponse)
                    $event->setResponse($isWechatLogin);
                else
                    $user->userLogin($isWechatLogin);
                
                    
                

            }
    	}
    }

}