<?php

namespace LV\Bundle\FondationBundle\Services\User;

class TestEvent
{
	public $id;
	public $name;

	public function __construct()
	{
		$this->id = '1';
		$this->name = 'albertshen';
		return $this;
	}
}