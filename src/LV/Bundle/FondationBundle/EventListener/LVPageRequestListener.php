<?php

namespace LV\Bundle\FondationBundle\EventListener;

use LV\Bundle\FondationBundle\Controller\PageController;
use Symfony\Component\HttpKernel\Event\FilterControllerEvent;
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
        
    	//$a = $this->container->get('security.context')->isGranted('IS_AUTHENTICATED_FULLY');
    	$routes = array(
    		'lv_fondation_homepage',
    		);
    	$current_route = $event->getRequest()->get('_route');

    	if(in_array($current_route, $routes)) {
            $current_url = $this->router->generate($current_route);

            $us = $this->container->get('lv.user.service');
            //if(!$us->userIsLogin())

	    	//$em = $this->container->get('doctrine');
            //$user = $em->getRepository('LVFondationBundle:User');
                //var_dump($user->aaaa());exit;
            //var_dump($user->aaaa()->getUserinfo()[0]->getCellphone());exit;
	    	$route = '';
	    	$url = $this->router->generate($route, array('destination' => $current_url));
            var_dump($url);exit;
	    	$event->setResponse(new RedirectResponse($url));
    	}



    	//var_dump(get_class_methods($em));exit;
    	//var_dump(333);
        //$controller = $event->getController();

        // if (!is_array($controller)) {
        //     return;
        // }
		//$event->setResponse(new RedirectResponse('http://www.baidu.com'));
        // if ($controller[0] instanceof PageController) {
        // 	// $route = '';
        // 	// $redirectUrl = $this->router->generate($route);

        //  //    $event->setResponse(new RedirectResponse($redirectUrl));
        // 	//var_dump(get_class_methods($event));exit;
        // 	$event->setResponse(new RedirectResponse('
        // 		http://www.baidu.com'));
        //     //$token = $event->getRequest()->query->get('token');
        //     //var_dump(3);
        // }
    }
}