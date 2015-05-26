<?php

namespace LV\Bundle\FondationBundle\Event;

use Symfony\Component\EventDispatcher\Event;

class FilterTestOneEvent extends Event
{
	protected $testone;

	public function __construct($testone)
	{
		$this->testone = $testone;
	}

	public function getTestOne()
	{
		return $this->testone;
	}
}