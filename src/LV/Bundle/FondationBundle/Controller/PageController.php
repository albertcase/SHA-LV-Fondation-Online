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

    public function invitationMmsAction()
    {
        return $this->render('LVFondationBundle:Default:invitation_mms.html.twig');
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
        $guidetour = $this->container->getParameter('guide_start_date');
        $now = strtotime(date("Y-m-d H:i:s"));

        if($now > $guidetour) {
            $userservice = $this->container->get('lv.user.service');
            $wechat = $this->container->get('same.wechat');
            $str = '1234567890';
            $code = '';
            for($i=0;$i<6;$i++){
                $randval = mt_rand(0,35);
                $code .= $str[$randval];
            }
            $input = array();
            $input['first'] = '现场拍摄您的定制照片，请告知摄影师您的专属Code';
            $input['second'] = '路易威登基金会建筑展';
            $input['third'] = '您的专属Code为:' . $code;
            $input['url'] = '';
            $input['code'] = $code;
            $userservice->setTemplateMessageStatus($wechat, $input);
        }

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
        return $this->forward('LVFondationBundle:Page:guideTour');
        // $wechat = $this->container->get('same.wechat');
        // $userservice = $this->container->get('lv.user.service');
        // $issubscribed = $wechat->isSubscribed($userservice->userLoad()->getOpenid());
        // if($issubscribed)
        //     return $this->forward('LVFondationBundle:Page:guideTour');
        // return $this->render('LVFondationBundle:Default:qrcodepage.html.twig');
    }

    /** 
    *
    * Page for Desktop
    *
    * @access public
    * @since 1.0 
    * @return view
    */
    public function desktopAction()
    {
        return $this->render('LVFondationBundle:Default:desktop.html.twig');
    }

    /** 
    *
    * Page for ibeacon
    *
    * @access public
    * @since 1.0 
    * @return view
    */
    public function ibeaconAction($id)
    {
        $userservice = $this->container->get('lv.user.service');
        $userservice->setIbeaconRecord($id);
        $shoppingmall = array('1', '2', '3', '4', '5', '6', '7', '8', '9');
        $show = array('10', '11', '12', '13', '14', '15');
        if(in_array($id, $shoppingmall)) {
            return $this->redirect('/fondation/ibeacon/map-' . $id . '.html');
        }
        if(in_array($id, $show)) {
            return $this->redirect($this->generateUrl('lv_fondation_ibeacon_entrance'));
        }
    }

    /** 
    *
    * Page photo Show
    *
    * @access public
    * @since 1.0 
    * @return view
    */
    public function photoShowAction($id)
    {
        $repository = $this->getDoctrine()->getRepository('LVFondationBundle:UserPhotoCode');
        $userPhotoCode = $repository->findOneBy(array('id' => $id));
        if(!$userPhotoCode){
            return $this->redirect('/fondation');
        }
        $photos = $userPhotoCode->getPhotos();
        return $this->render('LVFondationBundle:Default:photo_show.html.twig',array('photos'=> $photos));
    }

}
