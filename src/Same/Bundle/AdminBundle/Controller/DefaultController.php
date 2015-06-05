<?php

namespace Same\Bundle\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('SameAdminBundle:Default:index.html.twig');
    }

    public function loginAction()
    {
        session_unset();
        session_destroy();exit;
        //return $this->render('SameAdminBundle:Default:login.html.twig');
    }

    public function fileAction()
    {
        return $this->render('SameAdminBundle:Default:file.html.twig');
    }

    public function loadAction($code)
    {
        return $this->render('SameAdminBundle:Default:file.html.twig');
    }
}
