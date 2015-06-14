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
        $fake = array(
            'Jack' => '希望能有一天去看Stone Roses和The Jesus and Mary Chain的现场演出。', 
            '马克' => '希望学会调酒，开一家有风格的酒吧。', 
            '子君' => '早日实现财务自由，去环游世界。', 
            '蕾' => '正努力学习水彩画，希望有一天能出自己的水彩书。', 
            '艾文' => '想要做自己的产品，无用的设计成就有趣的生活情境。', 
            'Allen' => '正在学习法语，希望能去法国读书。', 
            '雪菲' => '希望能有一天去看Stone Roses和The Jesus and Mary Chain的现场演出。', 
            '季杰' => '热爱茶文化的我，希望能开一间茶室，将日本的抹茶与中国茶融合。', 
            '汉斯' => '喜欢搏击运动！希望能打造一款App吸引更多同道中人。', 
            'King' => '热爱电影，希望能和朋友们一块拍一部电影，剧本正在写：）', 
            'Alex' => '希望能作出自己的服装品牌，正在为此努力中……', 
            '董艾玛' => '希望通过自己的研究制造出时间机器！', 
            '可可' => '想在重庆山中隐居……和爱人一起打造竹屋！', 
            'Hanks' => '明年就要高考了，每天都在苦练画画，希望日后能成为一名真正的艺术家！', 
            'Susan' => '希望家人幸福，孩子们都能过上理想的生活。', 
            '李淑贤' => '虽然每天都在做着大人眼中无意义的事，但我相信自己能组一个全世界第一的乐队，加油！', 
            '圆圆' => '吃货也有梦想，希望能研制出最好吃的鸡腿烹饪方式。', 
            'Kung' => '在自己的行业成为领军人物！', 
            'Moss Zhang' => '正在撰写小说故事，相信年内就可以出版了。', 
            '婕' => '希望能去中央圣马丁学习女装设计，即使工作与此无关我也不会放弃这个梦想。', 
            'Ben' => '我是一个室内设计师，希望每一个我设计的房子里住的家庭都能幸福快乐', 
            '萱芸' => '我是一个服装买手，希望来我买手店光顾的每一位顾客都能买到与自己灵魂契合的单品', 
            '乐双' => '我是一个婚礼策划人，希望我精心策划的婚礼能让每一对新人永生难忘', 
            'Daisy' => '我是一个空乘，希望每一次我服务的航班都能成就人们的思念', 
            'Dove' => '我是一个环球小姐，我希望世界和平', 
            '寄凡' => '我是一个文案，希望我的文字能出现在品牌海报上', 
            '天筠' => '我是一个景观设计师，希望有可爱的孩子，在我设计的景观绿地中嬉戏', 
            '白易' => '我是一个记者，希望我撰写的专题能够深度解构一个社会问题', 
            'Derek' => '我是一个摄影师，希望我也能牵起女朋友的手，留影在全世界', 
            'Sally' => '我是一个NGO成员，我希望自己的努力，真的能给这个社会带来一点点进步', 
            'Rico' => '我是一个主持人，希望我能像电视里的人那样，风趣幽默，掌控全场', 
            '南风' => '我是一个厨师，希望客人能像我一样，细心体味食物的美妙', 
            '忆山' => '我是一个地理老师，希望我的学生能走过很多我没去过的地方', 
            'Johnson' => '我是一个马拉松运动员，希望我能在60岁的时候，还能跑完全程', 
            'Tory' => '我是一个博物馆工作人员，我希望能有更多的现代人，能欣赏这些沉淀百年的美好。',             
            );
        foreach ($fake as $nickname => $content) {
            $userservice->createFakeUserDream($nickname, $content);
            $output->writeln(sprintf('Create Successful <comment>%s</comment>!', $nickname));
        }
        
    }
}
