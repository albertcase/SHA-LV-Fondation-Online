<?php

namespace LV\Bundle\CvdBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use LV\Bundle\CvdBundle\Entity\Locks;

class ApiController extends Controller
{
    public function saveAction()
    {      
        $request = $this->getRequest()->request;
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
        $url = $this->generateUrl(
                    'lv_cvd_share',
                    array('id' => $locks->getId()),
                    true
                );
        $status = array('status' => '1', 'url' => $url);
        $response = new JsonResponse();
        $response->setData($status);
        return $response;
    }
}