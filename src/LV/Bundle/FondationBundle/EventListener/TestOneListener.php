<?php

namespace LV\Bundle\FondationBundle\EventListener;

use LV\Bundle\FondationBundle\Event\FilterTestOneEvent;

class TestOneListener
{

    public function onTestOne(FilterTestOneEvent $event)
    {
        var_dump('one');
    }

}