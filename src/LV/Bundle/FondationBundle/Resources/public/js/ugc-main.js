var _doing;


;(function($){
	$(function(){

		_doing = {
			emailReg : /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
			telReg : /^1[3|4|5|7|8][0-9]\d{8}$/,
			basedata : ["1","2","3","4","5","6"],
			dreamListData : function(){     //index
				$("#dreamListCon").html(
					$.map(this.basedata,function(k){
						return '<div class="swiper-slide"><div class="listmodel m-1"><div class="d_content"><p class="d-to">234'+k+'<sup>th</sup></p><p class="d-text">辛苦努力创作的作品终于被大家认可。下一步要在美术馆里开个人展</p><p class="d-from">Michel</p></div><img src="/images/ugc/listmodel.png" width="100%" /></div></div> '
					}).join("")
				);

				var dreamSwiper = $('.dream-swiper').swiper({
					nextButton: '.listPrev',
			        prevButton: '.listNext',
			        paginationClickable: true,
			        loop: false
				});
			},
			getGlassData : function(){  //chose

				$("#glassListCon").html($.map(glassList,function(v,k){
					return '<div class="swiper-slide"><div class="gl g-'+parseInt(k+1)+'""><a href="javascript:;"><img src="/images/ugc/g-'+parseInt(k+1)+'.png" width="100%" /></a></div><img src="'+v.pic_thumbnail+'" width="100%" /></div>'
				}).join(""));


				var glassSwiper = $('.glass-swiper').swiper({
						nextButton: '.glassArr-prev',
				        prevButton: '.glassArr-next',
				        paginationClickable: true,
				        loop: false,
				        onSlideChangeEnd: function(swiper){
					      	$("#cur-glass").attr("src","/images/ugc/glass-bg-"+parseInt(swiper.activeIndex+1)+".jpg")
					    }
				});

				$(".gl a").click(function(){
					pagechange.moveClick('selected')
				})
				
			},
			getSelectedData : function(){    //selected
				$("#selectedContent").html(
					'<div class="selectedModel_con"><div class="selectedNum">2034<sup>th</sup></div><div class="selectedCon">辛苦努力创作的作品终于被大家认可。下一步要在美术馆里开个人展</div><div class="selectedName">Michel</div></div><img src="/images/ugc/d-m-bg.png" width="100%" />'
				);
			},
			getCreateData : function(){   //跳转到创建页面
				$(".creatBtn").css("display","none");
                $(".finshBtn").css("display","inline-block");
				pagechange.moveClick('create');
				$(".create-num span").html("2340<sup>th</sup>");
			},
			faActive : function(){    
				$(".dream_footer").hide();
			},
			formData : function(){    //检测表单函数
				var fname = $("input[name='fname']"),
				    femail = $("input[name='femail']"); 
				    ftel = $("input[name='ftel']"); 
				    faddress = $("input[name='faddress']"); 
				console.log(!this.emailReg.test(femail.val()));

				if(fname.val() == ""){
					fname.addClass(".error").val("").attr("placeholder","姓名不能为空！");
					return false;
				}else if(!this.emailReg.test(femail.val())){
					femail.addClass(".error").val("").attr("placeholder","邮箱输入有误！");
					return false;
				}else if (!this.telReg.test(ftel.val())){
					ftel.addClass(".error").val("").attr("placeholder","手机号码输入有误！");
					return false;
				}else if(faddress.val()==""){
					faddress.addClass(".error").val("").attr("placeholder","地址不能为空！");
					return false;
				}else{
					alert("提交成功！");
				}


			}
			
		}



		_doing.dreamListData();
		_doing.getGlassData();
		_doing.getSelectedData();

		if(GetQueryString()=="create"){
			_doing.getCreateData();
		}else if(GetQueryString()=="form"||GetQueryString()=="attention"){
			_doing.faActive();
		}
		

	})
})(jQuery);