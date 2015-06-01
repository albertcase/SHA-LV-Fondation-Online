<?php

namespace LV\Bundle\FondationBundle\EventListener;

use LV\Bundle\FondationBundle\Event\FilterTestOneEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class TestTwoListener extends Controller
{  

    public function onTestTwo(FilterTestOneEvent $event)
    {
        

        // $response = new Response(json_encode(array('name' => 333)));
        // return $response;
        // var_dump($this->get('_route'));exit;
        // //$url = '/app_dev.php/demo';
        // //$event->setResponse(new RedirectResponse($url));
        // var_dump($event->getTestOne()->name);
    }

}