<?php

namespace AppBundle\Twig;

class AppExtension extends \Twig_Extension
{
    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('resouce', array($this, 'resouceFilter')),
        );
    }

    public function resouceFilter($resouce_id)
    {
        return stream_get_contents($resouce_id);
    }

    public function getName()
    {
        return 'app_extension';
    }
}