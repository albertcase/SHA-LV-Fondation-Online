<?php

namespace LV\Bundle\FondationBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;

class LVPageRequestListener
{

    private $router;
    private $container;
    private $userservice;
    private $wechatservice;

    public function __construct($router, $container, $userservice, $wechatservice)
    {
        $this->router = $router;
        $this->container = $container;
        $this->userservicve = $userservice;
        $this->wechatservice = $wechatservice;
    }

    public function onKernelRequest(GetResponseEvent $event)
    {

    	$current_route = $event->getRequest()->get('_route');

    	if($current_route && in_array($current_route, $this->container->getParameter('access_need_router'))) {

            if(!$this->userservicve->userIsLogin()) {

                $url = $event->getRequest()->getRequestUri();

                $isWechatLogin = $this->wechatservice->isLogin($url);

                if($isWechatLogin instanceof RedirectResponse)
                   return $event->setResponse($isWechatLogin);

                $this->userservicve->userLogin($isWechatLogin);

            }
    	}
    }

}