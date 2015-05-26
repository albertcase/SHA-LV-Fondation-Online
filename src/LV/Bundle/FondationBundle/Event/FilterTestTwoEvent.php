<?php

namespace LV\Bundle\FondationBundle\Event;

use Symfony\Component\EventDispatcher\Event;
use LV\Bundle\FondationBundle\Event\TestTwoEvent;

class FilterTestTwoEvent extends Event
{
	protected $testtwo;

	public function __construct($testtwo)
	{
		$this->testtwo = $testtwo;
	}

	public function getTestTwo()
	{
		return $this->testtwo;
	}
}