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
                //$isWechatLogin = md5('dfsfsdfd232342343666x');
                if($isWechatLogin instanceof RedirectResponse)
                   return $event->setResponse($isWechatLogin);

                $this->userservicve->userLogin($isWechatLogin);

            }

            if($current_route == 'lv_fondation_dream' && !$this->userservicve->userLoad()->getUserdream()) {
                $url = $this->router->generate('lv_fondation_ugc');
                return $event->setResponse(new RedirectResponse($url));
            }
            
    	}
    }

}