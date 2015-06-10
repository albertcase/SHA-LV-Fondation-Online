<?php

namespace Same\Bundle\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('SameAdminBundle:Default:index.html.twig');
    }

    public function loginAction()
    {
        $username = $_POST['account'];
        $password = $_POST['password'];
        if($username == 'admin' && $password == 'lv2015'){
            return $this->redirect('file');
        }else{
            return $this->redirect('index');
        }

        //return $this->render('SameAdminBundle:Default:login.html.twig');
    }

    public function fileAction()
    {
        return $this->render('SameAdminBundle:Default:file.html.twig');
    }

    public function uploadAction()
    {
        $files = $this->getRequest()->files->get('file');
        $fs = new Filesystem();
        //var_dump($fs->exists($rs[0]));exit;
        $rs=$fs->rename($files[0],"files/ceshi.jpg");
        var_dump($rs);exit;
        return $this->render('SameAdminBundle:Default:file.html.twig');
    }
}
