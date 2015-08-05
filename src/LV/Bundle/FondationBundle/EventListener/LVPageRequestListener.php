<?php

namespace LV\Bundle\FondationBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

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

        if(!preg_match('/^lv_cvd_*/', $current_route)) {

        }
    }

}