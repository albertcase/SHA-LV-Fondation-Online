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

    /** 
    * ImageCreateForOnline
    *
    * create a picture for online
    *
    * @access public
    * @param mixed $name
    * @since 1.0 
    * @return $filename
    */
    public function ImageCreateForOnline($name)
    {
        list($width,$height)=getimagesize("images/imagesevice/createImg.png");
        $authimg = imagecreate($width,$height);
        $bg_color = ImageColorAllocate($authimg,0,0,0);

        $bg = ImageCreateFromPng("images/imagesevice/createImg.png");
        imagecopyresized($authimg,$bg,0,0,0,0,$width,$height,$width,$height); 

        $fontfile ="images/imagesevice/AdobeFanHeitiStd-Bold.otf";
        putenv('GDFONTPATH=' . realpath($fontfile));
        $font_color = ImageColorAllocate($authimg,0,0,0);
        ImageTTFText($authimg, 25, 0, 430, 430, $font_color, $fontfile, date("Y年m月d日"));
        ImageTTFText($authimg, 25, 0, ceil(($width-15*strlen($name))/2), 730, $font_color, $fontfile, $name);
        //imagestring($authimg, 5, 430, 430, date("Y年m月d日"), $font_color);
        //imagestring($authimg, 5, 230, 730, $name, $font_color);
        $fileName = '/online/' . time() . rand(100,999) . '.png';
        $hechengImg = $this->_filedir . $fileName;
        ImagePNG($authimg,$hechengImg);
        return $fileName;
    }

     /** 
    * ImageCreateForOffline
    *
    * create a picture for offline
    *
    * @access public
    * @param mixed $img
    * @since 1.0 
    * @return $filename
    */
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