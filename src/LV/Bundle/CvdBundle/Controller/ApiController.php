<?php

namespace LV\Bundle\CvdBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use LV\Bundle\CvdBundle\Entity\Locks;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class ApiController extends Controller
{
    public function saveAction()
    {      
        $request = $this->getRequest()->request;
        $status = array('status' => 0);
        $imgurl = $request->get('imgurl');
        $imgurl = str_replace('data:image/png;base64,', '', $imgurl);
        $imgurl = str_replace(' ', '+', $imgurl);
        $img = base64_decode($imgurl);

        $fs = new Filesystem();
        if(!$fs->exists($this->container->getParameter('files_base_dir') . '/Cvd'))
           $fs->mkdir($this->container->getParameter('files_base_dir') . '/Cvd', 0700);
        $fileName = '/Cvd/' . time() . rand(100,999) . '.jpg';
        $file = $this->container->getParameter('files_base_dir') . $fileName;
        $success = file_put_contents($file, $img);

        $sex = $request->get('sex');
        $user = $this->container->get('lv.user.service')->userLoad();

		$locks = new Locks();
        $locks->setImgurl($file);
        $locks->setSex($sex);
        $locks->setUser($user);
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