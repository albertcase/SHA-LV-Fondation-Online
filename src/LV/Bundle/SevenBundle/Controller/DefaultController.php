<?php

namespace LV\Bundle\SevenBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;

class DefaultController extends Controller
{
    public function indexAction()
    {
        if (!strpos($_SERVER['HTTP_USER_AGENT'],"Mobile")) {
             $url = $this->generateUrl('lv_seven_desktop');
             return new RedirectResponse($url);
        }
        return $this->render('LVSevenBundle:Default:index.html.twig');
    }

    public function proAction($type, $id = 0)
    {
        return $this->render('LVSevenBundle:Default:pro.html.twig', 
        	array(
        		'type' => $type, 
        		'id' => $id, 
        		'title' => array(
        			'm1'=>array(
        				"LEAGUE 系带鞋",
        				"罗马城市指南\n中文版",
        				"VOYAGER GMT 腕表\n41.5毫米",
        				"LV FLAGS 长围巾",
        				"BRAZZA 钱夹",
        				"AMAN 太阳眼镜",
        				"JOSH 双肩包",
        				"MONOGRAM SQUARE 袖扣",
        				"OMBRE KEEPALL 50"
        			), 
        			'm2' => array(
        				"Zippy XL 钱夹",
        				"Explorer 背包",
        				"FRONTROW 运动鞋",
        				"HOCKENHEIM 车鞋",
        				"LV City 靠垫",
        				"ZIPPY 拉链竖款钱夹",
        				"LOUIS VUITTON 4MOTION ™ \n太阳眼镜 AIR款",
        				"Explorer 公文包",
        				"ESCALE TIME ZONE 腕表\n39毫米"
        			),
        			'f1'=>array(
        				"TWIST 中号手袋",
        				"JUNGLE 休闲鞋",
        				"ALMAZING 方巾",
        				"COLOR BLOSSOM STAR 吊坠\n玫瑰金色与白色珍珠母贝",
        				"ESSENTIAL V 耳环",
        				"LV FIFTY FIVE 腕表\n31毫米",
        				"CAPUCINES BB 手袋",
        				"GARANCE 太阳眼镜",
        				"东京城市指南\n中文版"
        			), 
        			'f2' => array(
        				"MONOGRAM JUNGLE 小号双肩包",
        				"PYTHON 肩带",
        				"TWIST 中号手袋",
        				"BAROQUE 方巾",
        				"V HEART 大号吊坠\n玫瑰金与钻石",
        				"LV & ME 项链\n字母 A",
        				"STELLAR 运动鞋",
        				"RUN AWAY 休闲鞋",
        				"PETITE MALLE 包饰与钥匙扣"
        			)
        		)
        	)
        );
    }

    public function desktopAction()
    {

  		return $this->render('LVSevenBundle:Default:desktop.html.twig');
    }
}
