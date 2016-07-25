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

    public function errorAction()
    {
        return $this->render('LVCvdBundle:Default:error.html.twig');
    }

    public function desktopAction()
    {
        return $this->render('LVCvdBundle:Default:desktop.html.twig');
    }

    public function shareAction($id)
    {
        $repository = $this->getDoctrine()->getRepository('LVCvdBundle:Locks');
        $locks = $repository->findOneById($id);
        $user = $this->container->get('lv.user.service')->userLoad();
        if($user && $user->getId() == $locks->getUser()->getId()) {
            $ismylocks = 1;
        }else{
            $ismylocks = 0;
        }
        return $this->render('LVCvdBundle:Default:share.html.twig', array('locks' => $locks, 'ismylocks' => $ismylocks));
    }
}
