<?php

namespace LV\Bundle\NdsBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('LVNdsBundle:Default:index.html.twig');
    }
}
