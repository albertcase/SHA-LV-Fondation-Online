<?php

namespace LV\Bundle\FondationBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;

/**
 * Hello World command for demo purposes.
 *
 * You could also extend from Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand
 * to get access to the container via $this->getContainer().
 *
 * @author Tobias Schultze <http://tobion.de>
 */
class PageCreateCommand extends ContainerAwareCommand
{
    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('fondation:create:page')
            ->setDescription('Create Static Page')
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
        $fs = new Filesystem();
        // if(!$fs->exists('web'))
        //     $fs->mkdir('web', 0700);

        $pages = array(
            'chapter1' => 'chapter1.html',
            'chapter2' => 'chapter2.html',
            'chapter3' => 'chapter3.html',
            'chapter4' => 'chapter4.html',
            'invitation' => 'invitation.html'
            );
        foreach($pages as $name => $pagename) {
            $content = $this->getContainer()->get('templating')->render('LVFondationBundle:Default:' . $name . '.html.twig');
            $fs->dumpFile('web/' . $pagename, $content);
            $output->writeln(sprintf('Create Successful <comment>%s</comment>!', $name));
        }

        // $output->writeln(sprintf('Create Successful <comment>%s</comment>!', $input->getArgument('who')));
    }
}
