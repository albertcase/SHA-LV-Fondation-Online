<?php

namespace LV\Bundle\CvdBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

class CvdPageRequestListener
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

        // $current_route = $event->getRequest()->get('_route');

        // if(!$this->mobiledetect->isMobile() && $current_route != 'lv_cvd_desktop'){
        //     $url = $this->router->generate('lv_cvd_desktop');
        //     return $event->setResponse(new RedirectResponse($url));
        // }
        // if (!preg_match('/MicroMessenger/', $event->getRequest()->headers->get('User-Agent'))) {
        //     if(in_array($current_route, $this->container->getParameter('cvd_access_error_router'))) {
        //         //$rendered = $this->container->get('templating')->render('LVCvdBundle:Default:error.html.twig');
        //         //return $event->setResponse(new Response($rendered));
        //         $url = $this->router->generate('lv_cvd_error');
        //         return $event->setResponse(new RedirectResponse($url));
        //     }
        // } else {
        //     if($current_route && in_array($current_route, $this->container->getParameter('cvd_access_need_router'))) {

        //         if(!$this->userservicve->userLoad()) {

        //             $url = $event->getRequest()->getRequestUri();

        //             $isWechatLogin = $this->wechatservice->isLogin($url);

        //             if($isWechatLogin instanceof RedirectResponse)
        //                return $event->setResponse($isWechatLogin);

        //             $this->userservicve->userLogin($isWechatLogin);
        //         } 
        //     }
        // }
        
    }

}