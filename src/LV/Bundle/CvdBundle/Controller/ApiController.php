<?php

namespace LV\Bundle\CvdBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use LV\Bundle\CvdBundle\Entity\Locks;
use LV\Bundle\CvdBundle\Entity\Sharelog;
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

    public function shareAction()
    {
        $request = $this->getRequest()->request;
        $type = $request->get('type');
        $user = $this->container->get('lv.user.service')->userLoad();
        $sharelog = new Sharelog();
        $sharelog->setType($type);
        $sharelog->setUser($user);
        $sharelog->setCreated(time());
        $doctrine = $this->getDoctrine()->getManager();
        $doctrine->persist($locks);
        $doctrine->flush();
        $status = array('status' => '1', 'type' => $type);
        $response = new JsonResponse();
        $response->setData($status);
        return $response;
    }

    public function testAction()
    {
        $openid = 'oKK-FjjesKwlG4K2xEtLEg4qPKYc';
        $data = array();
        $data['first']['value'] = '恭喜您获得参与路易威登浪漫七夕茶歇邀请函';
        $data['first']['color'] = '#000000';
        $data['keyword1']['value'] = '路易威登邀您共度浪漫七夕';
        $data['keyword1']['color'] = '#000000';
        $data['keyword2']['value'] = date("Y-m-d");
        $data['keyword2']['color'] = '#000000';
        $data['remark']['value'] = '点击查看详情，获取您的精美茶歇邀请函';
        $data['remark']['color'] = '#000000';
        $wechat = $this->get('same.wechat');
        $template_id = 'boicCRp5adiZr2AoXgGCX-xV7DE1oVhrqbE0RwEx3UY';
        $url = '';
        $topcolor = '#000000';
        return $wechat->sendTemplate($template_id, $url, $topcolor, $data, $openid);
    }
}