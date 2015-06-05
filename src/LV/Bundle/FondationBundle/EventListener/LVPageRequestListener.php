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

    	if($current_route && in_array($current_route, $this->container->getParameter('access_need_router'))) {

            $user = $this->container->get('lv.user.service');

            if(!$user->userIsLogin()) {
                
                $wechat = $this->container->get('same.wechat');

                $url = $this->router->generate($current_route);

                $isWechatLogin = $wechat->isLogin($url);

                if($isWechatLogin instanceof RedirectResponse)
                   return $event->setResponse($isWechatLogin);

                $user->userLogin($isWechatLogin);

            }
    	}
    }

}