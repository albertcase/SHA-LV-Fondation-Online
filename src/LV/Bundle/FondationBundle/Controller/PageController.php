<?php

namespace LV\Bundle\FondationBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class PageController extends Controller
{

    public function indexAction()
    {
        return $this->render('LVFondationBundle:Default:index.html.twig');
    }

    /** 
    * fondation_ugc
    *
    * Page for ugc
    *
    * @access public
    * @since 1.0 
    * @return view
    */ 
    public function ugcAction()
    {
        $user = $this->container->get('lv.user.service')->userLoad();

        date_default_timezone_set('PRC'); 
        $start_date = strtotime($this->container->getParameter('start_date'));
        $end_date = strtotime($this->container->getParameter('end_date'));
        $now = strtotime(date("Y-m-d H:i:s"));
        $percentage = ceil((($now - $start_date) / ($end_date - $start_date)) * 100);
        if($percentage >= 100)
            $percentage = 100;

        $default_dreams_home = $this->getDoctrine()
            ->getRepository('LVFondationBundle:UserDream')
            ->retrieveDefaultDreams($user, 15);
        $default_dreams_in = $this->getDoctrine()
            ->getRepository('LVFondationBundle:UserDream')
            ->retrieveDefaultDreams($user, 16);

        $userdream = 0;
        if($dream = $user->getUserdream()) {
            $userdream = $this->generateUrl(
                    'lv_fondation_userdream',
                    array('id' => $dream->getId()),
                    true
                );
        } 

        return $this->render('LVFondationBundle:Default:ugc.html.twig', array(
            'default_dreams_home' => $default_dreams_home, 
            'default_dreams_in' => $default_dreams_in, 
            'percentage' => $percentage,
            'userdream' => $userdream,
            ));
    }

    /** 
    * fondation_dream
    *
    * Page for dream
    *
    * @access public
    * @since 1.0 
    * @return view
    */ 
    public function journeyAction()
    {   
        $userservice = $this->container->get('lv.user.service');
        $dreaminfo = $userservice->retrieveJourneyDreamInfoByDreamId($userservice->userLoad()->getUserdream()->getId());
        return $this->render('LVFondationBundle:Default:journey.html.twig', array('userdream' => $dreaminfo));
    }

    /** 
    * journeyUserDreamAction
    *
    * Page for journeyuserdream
    *
    * @access public
    * @since 1.0 
    * @return view
    */ 
    public function journeyUserDreamAction($id)
    {   
        $userservice = $this->container->get('lv.user.service');
        $dreaminfo = $userservice->retrieveJourneyDreamInfoByDreamId($id);
        return $this->render('LVFondationBundle:Default:journey_user_dream.html.twig', array('userdream' => $dreaminfo));
    }

    /** 
    * fondation_userdream
    *
    * Page for userdream
    *
    * @access public
    * @since 1.0 
    * @return view
    */ 
    public function userDreamAction($id)
    {   
        $userservice = $this->container->get('lv.user.service');
        $dreaminfo = $userservice->retrieveDreamInfoByDreamId($id);
        return $this->render('LVFondationBundle:Default:user_dream.html.twig', array('userdream' => $dreaminfo));
    }

    /** 
    * fondation_chapterone
    *
    * Page for chapterone
    *
    * @access public
    * @since 1.0 
    * @return view
    */ 
    public function chapterOneAction()
    {
        return $this->render('LVFondationBundle:Default:chapter1.html.twig');
    }

    /** 
    * fondation_chaptertwo
    *
    * Page for chaptertwo
    *
    * @access public
    * @since 1.0 
    * @return view
    */
    public function chapterTwoAction()
    {
        return $this->render('LVFondationBundle:Default:chapter2.html.twig');
    }

    /** 
    * fondation_chapterthree
    *
    * Page for chapterthree
    *
    * @access public
    * @since 1.0 
    * @return view
    */
    public function chapterThreeAction()
    {
        return $this->render('LVFondationBundle:Default:chapter3.html.twig');
    }

    /** 
    * fondation_chapterfour
    *
    * Page for chaptefour
    *
    * @access public
    * @since 1.0 
    * @return view
    */
    public function chapterFourAction()
    {
        return $this->render('LVFondationBundle:Default:chapter4.html.twig');
    }

    /** 
    * fondation_invitation
    *
    * Page for invitation
    *
    * @access public
    * @since 1.0 
    * @return view
    */
    public function invitationAction()
    {
        return $this->render('LVFondationBundle:Default:invitation.html.twig');
    }

    /** 
    * fondation_invitationshow
    *
    * Page for invitationshow
    *
    * @access public
    * @since 1.0 
    * @return view
    */
    public function invitationShowAction($id)
    {
        $invitation = $this->getDoctrine()
            ->getRepository('LVFondationBundle:InvitationLetter')
            ->findOneBy(array('id' => $id));
        $user = $this->container->get('lv.user.service')->userLoad();   
        return $this->render('LVFondationBundle:Default:show_invitation.html.twig', array('invitation' => $invitation, 'user' => $user));
    }

}
