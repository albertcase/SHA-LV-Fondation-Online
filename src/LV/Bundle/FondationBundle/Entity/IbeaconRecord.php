<?php

namespace LV\Bundle\FondationBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * IbeaconRecord
 *
 * @ORM\Table()
 * @ORM\Entity()
 */
class IbeaconRecord
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var string
     *
     * @ORM\Column(name="ibeacon_id", type="integer")
     */
    private $ibeacon_id;

    /**
     * @var string
     *
     * @ORM\Column(name="created", type="string", length=255)
     */
    private $created;


    /**
     * Get id
     *
     * @return integer 
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set ibeacon_id
     *
     * @param integer $ibeaconId
     * @return IbeaconRecord
     */
    public function setIbeaconId($ibeaconId)
    {
        $this->ibeacon_id = $ibeaconId;
    
        return $this;
    }

    /**
     * Get ibeacon_id
     *
     * @return integer 
     */
    public function getIbeaconId()
    {
        return $this->ibeacon_id;
    }

    /**
     * Set created
     *
     * @param string $created
     * @return IbeaconRecord
     */
    public function setCreated($created)
    {
        $this->created = $created;
    
        return $this;
    }

    /**
     * Get created
     *
     * @return string 
     */
    public function getCreated()
    {
        return $this->created;
    }
}
