<?php

namespace LV\Bundle\FondationBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpFoundation\Response;

class ApiController extends Controller
{
    public function indexAction($name)
    {
        return $this->render('LVFondationBundle:Default:index.html.twig', array('name' => $name));
    }


    public function jssdkAction()
    {
        $http_data = array();
        $http_data['url'] = $this->getRequest()->get('url');
        $result = file_get_contents("http://vuitton.cynocloud.com/Interface/getSignPackage?" . http_build_query($http_data));
        return new Response($result);
    }
    
}
