<?php

namespace LV\Bundle\MotherBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        $user = $this->get('lv.user.service');
        $wechat = $this->get('same.wechat');
        if(!$user->userLoad()) {

            $url = $this->getRequest()->getRequestUri();

            $isWechatLogin = $wechat->isLogin($url, 'snsapi_userinfo');
            if($isWechatLogin instanceof RedirectResponse)
               return $isWechatLogin;

           $user->userLogin($isWechatLogin);
        }
        echo $openid = $user->userLoad()->getOpenid();exit;
        return $this->render('LVMotherBundle:Default:index.html.twig');
    }

    public function saveAction()
    {

        $status = array('code' => '1', 'msg' => '提交成功');
        $response = new JsonResponse();
        $response->setData($status);
        return $response;
    }
}
