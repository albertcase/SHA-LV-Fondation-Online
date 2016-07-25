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

        foreach ($userservice->getTemplates() as $template) {
            if(count($template->getUser()->getUserphotocode()->getPhotos()) != 0){
                $router = $this->getContainer()->get('router');
                $codeid = $template->getUser()->getUserphotocode()->getId();
                $context = $router->getContext();
                $context->setHost('www.lvcampaign.com');

                $message = array();
                $message['first'] = '查看您的现场定制专属照片';
                $message['second'] = '路易威登基金会建筑展';
                $message['third'] = '点击查看详情，获取您的现场定制专属照片';
                $message['url'] = $router->generate(
                    'lv_fondation_photoshow', 
                    array('id' => $codeid), 
                    true);
                $userservice->setTemplateMessagePhoto($template, $wechat, $message);
                $output->writeln(sprintf('Create Successful <comment>%s</comment>!', $codeid));
            }
        }

    }
}
