<?php

namespace LV\Bundle\FondationBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

/**
 * Hello World command for demo purposes.
 *
 * You could also extend from Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand
 * to get access to the container via $this->getContainer().
 *
 * @author Tobias Schultze <http://tobion.de>
 */
class CreateFakeDreamCommand extends ContainerAwareCommand
{
    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('fondation:create:dream')
            ->setDescription('Create Fake User And Dream')
            ->addArgument('who', InputArgument::OPTIONAL, 'Who to greet.', 'World')
            ->setHelp(<<<EOF
The <info>%command.name%</info> command greets somebody or everybody:

<info>php %command.full_name%</info>

The optional argument specifies who to greet:

<info>php %command.full_name%</info> Fabien
EOF
            );
    }

    /**
     * {@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $userservice = $this->getContainer()->get('lv.user.service');
        $fake = array(
            'anderson1' => '1阿双方萨芬，是短发萨芬撒发舒服', 
            'anderson2' => '2阿双方萨芬，是短发萨芬撒发舒服', 
            'anderson3' => '3阿双方萨芬，是短发萨芬撒发舒服', 
            'anderson4' => '4阿双方萨芬，是短发萨芬撒发舒服', 
            'anderson5' => '5阿双方萨芬，是短发萨芬撒发舒服', 
            'anderson6' => '6阿双方萨芬，是短发萨芬撒发舒服', 
            'anderson7' => '7阿双方萨芬，是短发萨芬撒发舒服', 
            'anderson8' => '8阿双方萨芬，是短发萨芬撒发舒服', 
            'anderson9' => '9阿双方萨芬，是短发萨芬撒发舒服', 
            'anderson10' => '10阿双方萨芬，是短发萨芬撒发舒服', 
            'anderson11' => '11阿双方萨芬，是短发萨芬撒发舒服', 
            'anderson12' => '12阿双方萨芬，是短发萨芬撒发舒服', 
            'anderson13' => '13阿双方萨芬，是短发萨芬撒发舒服', 
            );
        foreach ($fake as $nickname => $content) {
            $userservice->createFakeUserDream($nickname, $content);
            $output->writeln(sprintf('Create Successful <comment>%s</comment>!', $nickname));
        }
        
    }
}
