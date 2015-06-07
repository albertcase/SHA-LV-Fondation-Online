<?php

namespace LV\Bundle\FondationBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use LV\Bundle\FondationBundle\Entity\User;
use LV\Bundle\FondationBundle\Entity\UserInfo;
use Symfony\Component\HttpFoundation\Response;
use LV\Bundle\FondationBundle\Event\FilterTestOneEvent;
use LV\Bundle\FondationBundle\Services\User\TestEvent;

class PageController extends Controller
{

    public function indexAction()
    {
        return $this->render('LVFondationBundle:Default:index.html.twig');
    }

    public function ugcAction()
    {
    	//return new Response(json_encode(array(3)), 200);
        return $this->render('LVFondationBundle:Default:ugc.html.twig', array('name' => 32));
    }

    public function dreamAction()
    {
        return $this->render('LVFondationBundle:Default:dream.html.twig', array('name' => 32));
    }

    public function userDreamAction($id)
    {
        $user_dream = $this->getDoctrine()
            ->getRepository('LVFondationBundle:UserDream')
            ->findOneBy(array('id' => $id));
        $user = $this->container->get('lv.user.service')->userLoad();    
        return $this->render('LVFondationBundle:Default:user_dream.html.twig', array('userdream' => $user_dream, 'user' => $user));
    }

    public function chapterOneAction()
    {
        return $this->render('LVFondationBundle:Default:chapter1.html.twig');
    }

    public function chapterTwoAction()
    {
        return $this->render('LVFondationBundle:Default:chapter2.html.twig');
    }

    public function chapterThreeAction()
    {
        return $this->render('LVFondationBundle:Default:chapter3.html.twig');
    }

    public function chapterFourAction()
    {
        return $this->render('LVFondationBundle:Default:chapter4.html.twig');
    }

    public function invitationAction()
    {
        return $this->render('LVFondationBundle:Default:invitation.html.twig');
    }

    public function invitationShowAction($id)
    {
        $invitation = $this->getDoctrine()
            ->getRepository('LVFondationBundle:InvitationLetter')
            ->findOneBy(array('id' => $id));
        $user = $this->container->get('lv.user.service')->userLoad();   
        return $this->render('LVFondationBundle:Default:show_invitation.html.twig', array('invitation' => $invitation, 'user' => $user));
    }

}
