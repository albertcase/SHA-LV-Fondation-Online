<?php

namespace LV\Bundle\CvdBundle\Command;

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
class SendCvdCommand extends ContainerAwareCommand
{
    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('cvd:send:message')
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
        $wechat = $this->getContainer()->get('same.wechat');
        $repository = $this->getContainer()->get('doctrine')->getRepository('LVCvdBundle:Sharelog');
        $sharelog = $repository->findByStatus(0);
        foreach ($sharelog as $log) {
            $openid = $log->getUser()->getOpenid();
            $data = array();
            $data['first']['value'] = '恭喜您获得参与路易威登浪漫七夕茶歇邀请函';
            $data['first']['color'] = '#000000';
            $data['keyword1']['value'] = '路易威登邀您共度浪漫七夕';
            $data['keyword1']['color'] = '#000000';
            $data['keyword2']['value'] = '2015-08-18至2015-08-20';
            $data['keyword2']['color'] = '#000000';
            $data['remark']['value'] = '点击查看详情，获取您的精美茶歇邀请函';
            $data['remark']['color'] = '#000000';
            $template_id = 'boicCRp5adiZr2AoXgGCX-xV7DE1oVhrqbE0RwEx3UY';
            $url = 'http://www.lvcampaign.com/chinesevday';
            $topcolor = '#000000';          
            $result = $wechat->sendTemplate($template_id, $url, $topcolor, $data, $openid);
            $output->writeln(sprintf('Create Successful <comment>%s</comment>!', $openid));
        }

    }
}
