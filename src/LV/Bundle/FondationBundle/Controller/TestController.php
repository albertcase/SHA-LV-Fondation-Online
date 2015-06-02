<?php

namespace LV\Bundle\FondationBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class TestController extends Controller
{
    public function indexAction($name)
    {
    	//return new Response(json_encode(array(3)), 200);
        return $this->render('LVFondationBundle:Default:index.html.twig', array('name' => 33));
    }


}
