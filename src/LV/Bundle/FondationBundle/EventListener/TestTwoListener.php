<?php

namespace LV\Bundle\FondationBundle\EventListener;

use LV\Bundle\FondationBundle\Event\FilterTestOneEvent;

class TestTwoListener
{  

    public function onTestTwo(FilterTestOneEvent $event)
    {
        var_dump('two');
    }

}