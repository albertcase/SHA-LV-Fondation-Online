<?php

namespace LV\Bundle\CvdBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class PageController extends Controller
{
    public function indexAction()
    {
        return $this->render('LVCvdBundle:Default:index.html.twig');
    }
}
