<?php

namespace LV\Bundle\NdsBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('LVNdsBundle:Default:index.html.twig');
    }

    public function infoAction()
    {
        $request = $this->getRequest()->request;
        $name = $request->get('name');
        $mobile = $request->get('mobile');
        $sex = $request->get('sex');
        $city = $request->get('city');
        $idcard = $request->get('idcard');
        $user = $this->container->get('lv.user.service')->userLoad();
        $repository = $this->getDoctrine()->getRepository('LVNdsBundle:Ndsinfo');
        $log = $repository->findByUser($user);
        if(!$log){
            $ndsinfo = new Ndsinfo();
            $ndsinfo->setUser($user);
            $ndsinfo->setName($type);     
            $ndsinfo->setMobile($mobile);
            $ndsinfo->setSex($sex);
            $ndsinfo->setCity($city);
            $ndsinfo->setIdcard($idcard);
            $doctrine = $this->getDoctrine()->getManager();
            $doctrine->persist($ndsinfo);
            $doctrine->flush();
        }
        $status = array('status' => '1', 'type' => $type);
        $response = new JsonResponse();
        $response->setData($status);
        return $response;
    }
}
