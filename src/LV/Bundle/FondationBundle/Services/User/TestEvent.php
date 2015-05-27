<?php

namespace LV\Bundle\FondationBundle\Services\User;

class TestEvent
{
	public function __construct()
	{
		$test = new \stdClass();
		$test->id = '1';
		$test->name = 'albertshen';
		return $test;
	}
}