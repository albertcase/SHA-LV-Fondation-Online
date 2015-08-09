<?php

namespace LV\Bundle\CvdBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use LV\Bundle\CvdBundle\Entity\Locks;

class ApiController extends Controller
{
    public function saveAction()
    {      
        $request = $this->getRequest()->query;
        $status = array('status' => 0);
        $imgurl = $request->get('imgurl');
        $sex = $request->get('sex');

		$locks = new Locks();
        $locks->setImgurl($imgurl);
        $locks->setSex($sex);
        $locks->setCreated(time());

        $doctrine = $this->getDoctrine()->getManager();
        $doctrine->persist($locks);
        $doctrine->flush();
        $status = array('status' => $locks->getId());
        $response = new JsonResponse();
        $response->setData($status);
        return $response;
    }
}