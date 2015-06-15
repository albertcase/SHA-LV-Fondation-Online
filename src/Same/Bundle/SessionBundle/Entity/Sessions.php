<?php

namespace Same\Bundle\SessionBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Sessions
 *
 * @ORM\Table("sessions")
 * @ORM\Entity
 */
class Sessions
{
    /**
     * @var integer
     *
     * @ORM\Column(name="sess_id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $sess_id;

    /**
     * @var string
     *
     * @ORM\Column(name="sess_data", type="text")
     */
    private $sess_data;
    
    /**
     * @var string
     *
     * @ORM\Column(name="sess_time", type="string", length=255)
     */
    private $sess_time;

    /**
     * @var string
     *
     * @ORM\Column(name="sess_lifetime", type="string", length=255)
     */
    private $sess_lifetime;

}
