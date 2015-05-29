<?php

namespace Same\Bundle\SessionBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('SameSessionBundle:Default:index.html.twig', array('name' => $name));
    }
}
