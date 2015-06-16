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
class SendMessageBatchCommand extends ContainerAwareCommand
{
    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('fondation:send:message')
            ->setDescription('Send Wechat Template Message')
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
        $wechat = $this->getContainer()->get('same.wechat');
        $templates =  $userservice->getTemplates();
        //var_dump($this->getContainer()->get('router'));exit;
        foreach ($templates as $template) {
            $codeid = $template->getUser()->getUserphotocode()->getId();
            $input = array();
            $input['first'] = 'line one';
            $input['second'] = 'line two';
            $input['third'] = 'Code:' . $code;
            $input['url'] = $this->getContainer()->get('router')->generateUrl(
                'lv_fondation_userdream', 
                array('id' => $codeid), 
                true);
            $input['code'] = $code;
            $userservice->setTemplateMessagePhoto($template, $wechat, $input);
            $output->writeln(sprintf('Create Successful <comment>%s</comment>!', $codeid));
        }
        
    }
}
