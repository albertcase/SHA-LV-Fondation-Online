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
        $start_date = $this->container->getParameter('start_date');
        $end_date = $this->container->getParameter('end_date');
        $now = strtotime(date("Y-m-d H:i:s"));
        $percentage = ceil((($now - $start_date) / ($end_date - $start_date)) * 100);
        if($percentage >= 100)
            $percentage = 100;

        if($percentage <= 20)
            $imagename = '20';
        if($percentage > 20 && $percentage <= 50)
            $imagename = '50';
        if($percentage > 50 && $percentage <= 80)
            $imagename = '80';
        if($percentage > 80 && $percentage <= 100)
            $imagename = '100';

        // $default_dreams_home = $this->getDoctrine()
        //     ->getRepository('LVFondationBundle:UserDream')
        //     ->retrieveDefaultDreams($user, 15);
        $default_dreams_in = $this->getDoctrine()
            ->getRepository('LVFondationBundle:UserDream')
            ->retrieveDefaultDreams($user, 16);
        $dreamcount = $this->getDoctrine()
            ->getRepository('LVFondationBundle:UserDream')
            ->retrieveDreamCount();

        $userdream = 0;
        if($dream = $user->getUserdream()) {
            $userdream = $this->generateUrl(
                    'lv_fondation_userdream',
                    array('id' => $dream->getId()),
                    true
                );
        }

        return $this->render('LVFondationBundle:Default:ugc.html.twig', array(
            // 'default_dreams_home' => $default_dreams_home, 
            'default_dreams_in' => $default_dreams_in, 
            'percentage' => $percentage,
            'userdream' => $userdream,
            'dreamcount' => $dreamcount,
            'imagename' => $imagename,
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
        if($dream->getUser()->getId() == $user->getId()){
            $who = 'myself';
        } else {
            $who = 'others';
        }
        return $this->render('LVFondationBundle:Default:show_invitation.html.twig', array('invitation' => $invitation, 'user' => $user, 'who' => $who));
    }

    /** 
    *
    * Page for Guide Tour
    *
    * @access public
    * @since 1.0 
    * @return view
    */
    public function guideTourAction()
    {
        $userservice = $this->container->get('lv.user.service');
        $wechat = $this->container->get('same.wechat');
        $userservice->setTemplateMessageStatus($wechat);
        return $this->render('LVFondationBundle:Default:guidetour.html.twig');
    }

    /** 
    *
    * Page for wechat entrance
    *
    * @access public
    * @since 1.0 
    * @return view
    */
    public function wechatEntranceAction()
    {
        $userservice = $this->container->get('lv.user.service');
        if($userservice->userLoad()->getRole() == 'offline') 
            return $this->forward('LVFondationBundle:Page:guideTour');
        else
            return $this->redirect($this->generateUrl('lv_fondation_index'));
    }

    /** 
    *
    * Page for ibeacon entrance
    *
    * @access public
    * @since 1.0 
    * @return view
    */
    public function ibeaconEntranceAction()
    {
        $wechat = $this->container->get('same.wechat');
        $userservice = $this->container->get('lv.user.service');
        $issubscribed = $wechat->isSubscribed($userservice->userLoad()->getOpenid());
        if($issubscribed)
            return $this->forward('LVFondationBundle:Page:guideTour');
        return $this->render('LVFondationBundle:Default:qrcodepage.html.twig');
    }

}
