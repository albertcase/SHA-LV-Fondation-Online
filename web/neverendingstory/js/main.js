/*! main.js */




document.addEventListener('touchmove' , function (ev){
  ev.preventDefault();
  return false;
} , false)



;(function($){
    $(function(){

        var basePath= '../';    //'http://wximg.qq.com/wxp/moment/4ySCn1mfl/';
		// var wa = new WxMoment.Analytics({
		//     //projectName 请与微信商务团队确认
		//     projectName: "20151207LV"
		// }); 
		// new WxMoment.Share({
		//     //分享到朋友圈
		//     'moment': {
		//         'title': "路易威登旅程永无止境……"
		//     },
		//     //分享给好友
		//     'friend': {
		//         'title': "路易威登旅程永无止境……",
		//         'desc': "14岁的少年远赴巴黎，路易威登旅程就此开启。"
		//     },
		//     'global': {
		//         'img_url': basePath + "/imgs/share.jpg",
		//         'link': window.location.href.split("?")[0].replace(/([&|\?]{1})ticket=[\w\-]+(&?)/, '$1').replace(/\?$/, '')
		//     }
		// });


        var vidArr = ["m00188tkwcb"];
        var vPic = [basePath + "imgs/poster.jpg"];
		var player;
		var videoWidth = document.body.clientWidth;
		var videoHeight = videoWidth * (1080 / 1920);

		$(".video").css({"height":videoHeight});

		var videoFun = function(n){
			var video = new tvp.VideoInfo(); 
			video.setVid(vidArr[n]);
			player = new tvp.Player(); 
			player.create({
				width: videoWidth + 'px',
				height: videoHeight + 'px',
				video: video,
				pic: vPic[n],
				modId:"mod_player", //mod_player是刚刚在页面添加的div容器 autoplay:true
				onallended: function(){
					$(".poster").show();
					videoFun(0);

					pageAnimate_out("video");
					pageAnimate_in("qrcode");
				},
				onpause: function(){
					$(".poster").show();
					videoFun(0);
				},
				onplaying: function(){
					$(".poster").hide();
				}
			});
		}

		touch.on('.poster', 'touchstart', function(ev){
		    player.enterFullScreen();
		    player.play();
		});
		
		videoFun(0);
		/* 戒指动画 */

		touch.on(".swipeArea", 'swipeup', function(event){
			pageAnimate_out("video");
			pageAnimate_in("qrcode");
		    event.preventDefault();
		});

		touch.on("#qrcode", 'swipedown', function(event){
			pageAnimate_out("qrcode");
			pageAnimate_in("video");
		    event.preventDefault();
		});


		



		function _loading(){
			var loader = new WxMoment.Loader();
			
			    //添加一个资源
			    loader.addImage(basePath + 'imgs/arr.png');
			    loader.addImage(basePath + 'imgs/bg.jpg');
			    loader.addImage(basePath + 'imgs/change_tips.png');
			    loader.addImage(basePath + 'imgs/ewmtips.png');
			    loader.addImage(basePath + 'imgs/flower.png');
			    loader.addImage(basePath + 'imgs/logo.png');

			    loader.addImage(basePath + 'imgs/play.png');
			    loader.addImage(basePath + 'imgs/poster.jpg');

			    loader.addImage(basePath + 'imgs/qrcode_bg.jpg');
			    loader.addImage(basePath + 'imgs/qrcode.png');
			    loader.addImage(basePath + 'imgs/share.jpg');
			    loader.addImage(basePath + 'imgs/slogan.png');

			    //监听资源加载完成事件
			    loader.addCompletionListener(function () {
			    	
			    	$("#loading").hide();
			    	pageAnimate_in("video")

			        console.log('加载完成');
			    });

				loader.addProgressListener(function(e) {
						var percent = Math.round( e.completedCount / e.totalCount * 100 );
						//$(".loading").css({"width":percent+"%"});
						$(".process").css({"width": percent+"%"});
				});
				
			    //启动资源加载管理器
			    loader.start();
		}

		_loading();

 	})

})(jQuery)





function pageAnimate_out(pageNode){
	TweenMax.staggerFromTo("#"+pageNode,0.6,{
		scale:1,
		autoAlpha:1,
		opacity:1
	},{
		scale:1,
		autoAlpha:0,
		opacity:0,
		onComplete:function(){
			$("#"+pageNode).hide();
		}
	},0.3)

}


function pageAnimate_in(pageNode){
	$("#"+pageNode).show();
	TweenMax.staggerFromTo("#"+pageNode,0.6,{
		scale:1,
		autoAlpha:0,
		opacity:0
	},{
		scale:1,
		autoAlpha:1,
		opacity:1,
	},0.3)

}











