<?php

namespace LV\Bundle\CvdBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class PageController extends Controller
{
    public function indexAction()
    {
        return $this->render('LVCvdBundle:Default:index.html.twig');
    }

    public function productAction($gender)
    {
        return $this->render('LVCvdBundle:Default:product.html.twig', array('gender' => $gender));
    }

    public function createAction()
    {
        return $this->render('LVCvdBundle:Default:create.html.twig');
    }

    public function shareAction($id)
    {
        return $this->render('LVCvdBundle:Default:share.html.twig', array('id' => $id));
    }
}
