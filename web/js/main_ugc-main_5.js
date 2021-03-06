
var _doing = {
			dreamSelectedData : eval( '(' + $('.default_dreams_in').html() + ')' ),
			emailReg : /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
			telReg : /^1[3|4|5|7|8][0-9]\d{8}$/,
			dreamListData : function(){     //index
				var dreamIndexData = eval( '(' + $('.default_dreams_home').html() + ')' );
				$("#dreamListCon").html(
					$.map(dreamIndexData,function(k,key){
						return '<div class="swiper-slide"><div class="listmodel m-1" data-id="'+k.dream_id+'"><div class="d_content"><p class="d-to">'+k.dream_num+'<sup>th</sup></p><p class="d-text">'+k.content+'</p><p class="d-from">'+k.nickname+'</p></div><img src="/images/ugc/list-model-'+key%4+'.png" width="100%" /></div></div> '
					}).join("")
				);

				var dreamSwiper = $('.dream-swiper').swiper({
					nextButton: '.listPrev',
			        prevButton: '.listNext',
			        paginationClickable: true,
			        loop: true
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
				        loop: true,
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
				    femail = $("input[name='femail']"),
				    ftel = $("input[name='ftel']"),
				    faddress = $("input[name='faddress']"); 
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
				}else if(faddress.val()==""){
					faddress.addClass("error").val("").attr("placeholder","地址不能为空！");
					return false;
				}else{
					_doing.userInfoFun(fname.val(),femail.val(),ftel.val(),faddress.val());
				}


			},
			userInfoFun : function(fname,femail,ftel,faddress){
				$.ajax({
				    type: "POST",
				    url: "/fondation/api/userinfo",
				    data: {
				    	"name":fname, "email":femail, "cellphone":ftel, "address":faddress
				    },
				    dataType:"json" 
			    }).done(function(data){
			    	if(data.status == 1){
			    		alert("提交成功！");
			    	}
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
			    		window.location.href="result";
			    	}
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
			    	// if(data.status == 1){
			    	// 	window.location.href="result";
			    	// }
			    })
			}
			
		}



;(function($){
	$(function(){

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








