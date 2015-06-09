<?php
namespace LV\Bundle\FondationBundle\Services\Image;

use Doctrine\ORM\EntityRepository;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class ImageService
{
    private $_container;
    private $_filedir;

    function __construct($container) {
        $this->_container = $container;
        $this->_filedir = $this->_container->getParameter('files_base_dir');
        //echo $this->_container->get('session')->get('aaa');exit;
    }
 
    public function ImageCreateForOnline($name)
    {
        list($width,$height)=getimagesize("images/imagesevice/createImg.png");
        $authimg = imagecreate($width,$height);
        $bg_color = ImageColorAllocate($authimg,0,0,0);

        $bg = ImageCreateFromPng("images/imagesevice/createImg.png");
        imagecopyresized($authimg,$bg,0,0,0,0,$width,$height,$width,$height); 
        
        $fontfile ="images/imagesevice/heiti.ttf";
        $font_color = ImageColorAllocate($authimg,0,0,0);
        ImageTTFText($authimg, 25, 0, 250, 780, $font_color, $fontfile, $name);
        //header("Content-type: image/PNG");
        $fileName = '/online/' . time() . rand(100,999) . '.jpg';
        $hechengImg = $this->_filedir . $fileName;
        
        ImagePNG($authimg,$hechengImg);
        return $fileName;
    }

    public function ImageCreateForOffline($img)
    {
        list($width,$height)=getimagesize($img);
        $img1 = ImageCreateFromJpeg($img); 
        $bg = ImageCreateFromJpeg( "images/imagesevice/bg.jpg"); 
        $logo = ImageCreateFromPng("images/imagesevice/logo.png"); 
        imagecopyresized($bg,$logo,13,10,0,0,641,29,641,29); 
        imagecopyresized($bg,$img1,13,50,0,0,641,959,$width,$height); 
        //header("content-type: image/jpeg");
        $fileName = '/offline/' . time() . rand(100,999) . '.jpg';
        $hechengImg = $this->_filedir . $fileName;
        ImageJpeg($bg,$hechengImg);
        return $fileName;
    }

}