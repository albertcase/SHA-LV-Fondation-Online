

var _doing = {
			curChoseGlassDreamNum : 0,
			emailReg : /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
			telReg : /^1[3|4|5|7|8][0-9]\d{8}$/,
			// dreamListData : function(){     //index
			// 	var dreamIndexData = eval( '(' + $('.default_dreams_home').html() + ')' );
			// 	$("#dreamListCon").html(
			// 		$.map(dreamIndexData,function(k,key){
			// 			return '<div class="swiper-slide"><div class="listmodel m-1" data-id="'+k.dream_id+'"><div class="d_content"><p class="d-to">'+k.dream_num+'<sup>th</sup></p><p class="d-text">'+k.content+'</p><p class="d-from">'+k.nickname+'</p></div><img src="/images/ugc/list-model-'+key%5+'.png" width="100%" /></div></div> '
			// 		}).join("")
			// 	);

			// 	var dreamSwiper = $('.dream-swiper').swiper({
			// 		nextButton: '.listNext',
			//         prevButton: '.listPrev',
			//         paginationClickable: true,
			//         loop: true
			// 	});
			// },
			getGlassData : function(){  //chose
				
				var dreamSelectedData = eval( '(' + $('.default_dreams_in').html() + ')' );

				$("#glassListCon").html($.map(glassList,function(v,k){
					return '<div class="swiper-slide"><div class="gl g-'+k+'""><a href="javascript:;" data-num="'+k+'"><img src="/images/ugc/g-'+k+'.png" width="100%" /></a></div><img src="'+v.pic_thumbnail+'" width="100%" /></div>'
				}).join(""));

				var glassSwiper = $('.glass-swiper').swiper({
						nextButton: '.glassArr-next',
				        prevButton: '.glassArr-prev',
				        paginationClickable: true,
				        loop: true,
				        onTouchEnd: function(swiper){
					    	if(swiper.swipeDirection == "prev"){
				        		_doing.curChoseGlassDreamNum--;
				        		if(_doing.curChoseGlassDreamNum < 0){
				        			_doing.curChoseGlassDreamNum = dreamSelectedData.length-1;
				        		}
				        	}else if(swiper.swipeDirection == "next"){
				        		_doing.curChoseGlassDreamNum++;
				        		if(_doing.curChoseGlassDreamNum > dreamSelectedData.length){
				        			_doing.curChoseGlassDreamNum = 0;
				        		}
				        	}

				        	//console.log(_doing.curChoseGlassDreamNum);
					    }
				});

				$(".gl a").click(function(){

					pagechange.moveClick('selected');
					var curChoseGlass = $(this).attr("data-num");

					//$("#cur-glass").attr("src","/images/ugc/glass-bg-"+curChoseGlass+".jpg");
					_doing.getSelectedData(dreamSelectedData,curChoseGlass);
				})

				_doing.getSelectedData(dreamSelectedData,0);
				
			},
			getSelectedData : function(dreamSelectedData,curChoseGlass){    //selected
				
				var choseGlassnum = _doing.curChoseGlassDreamNum;
				
				var selectedDataInfo = $.map(dreamSelectedData,function(v,k){
						var islikeVal = "",islikecon = "支持";
						
						if(v.isliked == 1){
							islikeVal = "hover";
							islikecon = "已支持";
						}
						 
						return '<div class="swiper-slide"><img src="/images/ugc/glass-bg-'+k%5+'.jpg" width="100%" class="cur-glass" /><div class="hotArea"><div class="supportIcon '+islikeVal+'" data-dream-id="'+v.dream_id+'"><img src="/images/ugc/like'+islikeVal+'.png" width="100%" /><i>'+islikecon+'</i></div><div class="shareIcon"><img src="/images/ugc/shareIcon.png" width="100%" /><i>分享</i></div></div><div class="dreamMode"><div class="selectedModel_con"><div class="selectedNum">'+v.dream_num+'</div><div class="selectedCon">'+v.content+'</div><div class="selectedName">'+v.nickname+'</div></div><img src="/images/ugc/list-model-'+k%5+'.png" width="100%" /></div></div>'
					

				})

				$("#selectedContent .swiper-wrapper").html(selectedDataInfo);
				var mySwiper = new Swiper('.selectedWrapper', {
					nextButton: '.selectedArr-next',
			        prevButton: '.selectedArr-prev',
			        paginationClickable: true,
			        loop: true,
					initialSlide : _doing.curChoseGlassDreamNum,
					onSlideChangeEnd: function(swiper){
				    	if(swiper.swipeDirection == "prev"){
			        		_doing.curChoseGlassDreamNum--;
			        		if(_doing.curChoseGlassDreamNum < 0){
			        			_doing.curChoseGlassDreamNum = dreamSelectedData.length-1;
			        		}
			        	}else if(swiper.swipeDirection == "next"){
			        		_doing.curChoseGlassDreamNum++;
			        		if(_doing.curChoseGlassDreamNum > dreamSelectedData.length){
			        			_doing.curChoseGlassDreamNum = 0;
			        		}
			        	}
			        	//console.log(_doing.curChoseGlassDreamNum);
			        	//$("#cur-glass").attr("src","/images/ugc/glass-bg-"+_doing.curChoseGlassDreamNum%5+".jpg")
				    }


				})


				/* 点击支持当前梦想 */
				$(".supportIcon").click(function(){
					if($(this).hasClass("hover"))return false;

					var dream_id = $(this).attr("data-dream-id");
					$(this).addClass("hover");
					$(this).find("i").html("已支持");
					$(this).find("img").attr("src","/images/ugc/likehover.png")
					_doing.dreamlike(dream_id);
				})


				/* 分享当前梦想 */
				$(".shareIcon").click(function(){
					$("#wechatTips").fadeIn();
				})

	

			},
			getCreateData : function(){   //跳转到创建页面
				pagechange.moveClick('create');
			},
			formData : function(){    //检测表单函数
				var fname = $("input[name='fname']"),
				    femail = $("input[name='femail']"),
				    ftel = $("input[name='ftel']");
				    //faddress = $("input[name='faddress']"); 
				//console.log(!this.emailReg.test(femail.val()));

				if(fname.val() == ""){
					fname.addClass("error").val("").attr("placeholder","姓名不能为空！");
					return false;
				}else if(!this.emailReg.test(femail.val())){
					femail.addClass("error").val("").attr("placeholder","邮箱输入有误！");
					return false;
				}else if (!this.telReg.test(ftel.val())){
					ftel.addClass("error").val("").attr("placeholder","手机号码输入有误！");
					return false;
				}else{
					_doing.userInfoFun(fname.val(),femail.val(),ftel.val());
				}


				// else if(faddress.val()==""){
				// 	faddress.addClass("error").val("").attr("placeholder","地址不能为空！");
				// 	return false;
				// }

			},
			userInfoFun : function(fname,femail,ftel){
				$(".formSubmit_btn").addClass("isdoing_form").val("正在加载...");
				$.ajax({
				    type: "POST",
				    url: "/fondation/api/userinfo",
				    data: {
				    	"name":fname, "email":femail, "cellphone":ftel
				    },
				    dataType:"json" 
			    }).done(function(data){
			    	$(".isdoing_form").removeClass("isdoing_form").val("提交");
			    	if(data.status == 1){
			    		pagechange.moveClick('poster');
			    		//alert("提交成功！");
			    	}
			    }).fail(function(){
			    	$(".isdoing_form").removeClass("isdoing_form").val("提交");
			    })
			},
			submitCreateFun : function(nickname,content){
				$.ajax({
				    type: "POST",
				    url: "/fondation/api/userdream",
				    data: {
				    	"nickname":nickname, "content":content
				    },
				    dataType:"json" 
			    }).done(function(data){
			    	$(".isdoing").removeClass("isdoing").val("完成");
			    	if(data.status == 1){
			    		window.location.href = data.url+"#share";
			    	}else if(data.status == 023){
			    		alert("您已提交过梦想");
			    	}else{
			    		alert("创建失败!");
			    	}
			    }).fail(function(){
			    	$(".isdoing").removeClass("isdoing").val("完成");
			    })
			},
			dreamlike : function(dream_id){
				$.ajax({
				    type: "POST",
				    url: "/fondation/api/dreamlike",
				    data: {
				    	"dream_id":dream_id
				    },
				    dataType:"json" 
			    }).done(function(data){
			    	
			    })
			},
			submitModifyCreateFun : function(nickname,content){
				$.ajax({
				    type: "POST",
				    url: "/fondation/api/dreamupdate",
				    data: {
				    	"nickname":nickname, "content":content
				    },
				    dataType:"json" 
			    }).done(function(data){
			    	$(".isdoing").removeClass("isdoing").val("完成");
			    	if(data.status == 1){
			    		pagechange.moveClick('share');
			    		$("#share .creatTextCon").val(content);
			    		$("#share .creatTextName").val(nickname);
			    	}
			    }).fail(function(){
			    	$(".isdoing").removeClass("isdoing").val("完成");
			    })
			}
			
		}






$(function(){

	document.getElementById('wechatTips').addEventListener('touchstart' , function (ev){
		ev.preventDefault();
		$("#wechatTips").fadeOut();
		return false;
	} , false)

	$(".formSubmit_btn").click(function(){
		if($(this).hasClass("isdoing_form"))return false;

		_doing.formData();
	})


})









