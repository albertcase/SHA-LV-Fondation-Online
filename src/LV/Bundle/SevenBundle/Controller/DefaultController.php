<?php

namespace LV\Bundle\SevenBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('LVSevenBundle:Default:index.html.twig');
    }
}
