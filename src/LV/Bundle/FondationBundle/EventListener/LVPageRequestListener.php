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

    public function __construct($router, $container, $userservice, $wechatservice, $mobiledetect)
    {
        $this->router = $router;
        $this->container = $container;
        $this->userservicve = $userservice;
        $this->wechatservice = $wechatservice;
        $this->mobiledetect = $mobiledetect;
    }

    /** 
    * listener
    *
    * listener before visite lv_page
    *
    * @access public
    * @param mixed event 
    * @since 1.0 
    * @return Response
    */
    public function onKernelRequest(GetResponseEvent $event)
    {

    	$current_route = $event->getRequest()->get('_route');

        if(!$this->mobiledetect->isMobile() && $current_route != 'lv_fondation_desktop' && !preg_match('/^api_fondation_*/', $current_route)){
            $url = $this->router->generate('lv_fondation_desktop');
            return $event->setResponse(new RedirectResponse($url));
        }
            
    	if($current_route && in_array($current_route, $this->container->getParameter('access_need_router'))) {

            if(!$this->userservicve->userLoad()) {

                $url = $event->getRequest()->getRequestUri();

                $isWechatLogin = $this->wechatservice->isLogin($url);
                
                // $isWechatLogin = md5(microtime(true));
                
                if($isWechatLogin instanceof RedirectResponse)
                   return $event->setResponse($isWechatLogin);

                $this->userservicve->userLogin($isWechatLogin);

            }

            if($current_route == 'lv_fondation_journey' && !$this->userservicve->userLoad()->getUserdream()) {
                $url = $this->router->generate('lv_fondation_ugc');
                return $event->setResponse(new RedirectResponse($url));
            }
            
    	}
    }

}