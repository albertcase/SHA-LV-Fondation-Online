;(function($){
    $(function(){

    	function isTel(str){
           var reg = /13[0-9]{9}|14[0-9]{9}|15[0-9]{9}|18[0-9]{9}/; 
           return reg.test(str); 
        }
    	
		$(".sub_btn").on("click",function(){
			var name=$(".form_name").val();
			var tel=$(".form_tel").val();
			if(name==""){
				$(".form_name").attr('placeholder','请输入您的姓名');
				return false;
			}
			if(tel==""){
				$(".form_tel").attr('placeholder','请输入您的手机号码');
				return false;
			}
			if(!isTel(tel)){
				$(".form_tel").val('');
				$(".form_tel").attr('placeholder','请输入正确的手机号码');
        		return false; 
			}
		});
		$(".loc_ps").on("click",function(){
			$(".loc_ps").fadeOut();
			$(".loc_bj").fadeOut();
			$(".mask").animate({"opacity":"0","left":"20px"});
			$(".map_bg").animate({"opacity":"0","left":"20px"},1000,function(){
				$(".map_bg").addClass("bg_paris").animate({"opacity":"1","left":"0"});
				$(".mask1").addClass("ps_green");
				$(".loc_lv").animate({"opacity":"1","z-index":"9999"});

			});
            
		});	


		$("#mask").animate({"width":"10%"});

		/*$(".map_1").animate({"opacity":"0"},3000,function(){
=======

        var animationListener_home = function(){
>>>>>>> 525a55654dba599c20343e9f1a073b05de396834
			$(".dot").fadeOut();
			$(".title_ps").fadeOut();
			$(".title_bj").fadeOut();
			$(".title_ty").fadeOut();
			$(".title_ny").fadeOut();
<<<<<<< HEAD
			$(".map_2").animate({"opacity":"1"});
			
			

		});

			$(".map_1").addClass("add");
			$(".loc_ps").animate({"opacity":"1"},1000);
			$(".loc_bj").animate({"opacity":"1"},1000);

			
			$(".cloud_img").addClass("pulse").animate({"opacity":"1"},2000);
			$(".line_img").addClass("line_animation").animate({"opacity":"1"});
			$(".arrow").addClass("arrow_animation").animate({"opacity":"1"},1000);
		}

		var anim_home = document.getElementById("end");
		anim_home.addEventListener("webkitAnimationEnd", animationListener_home, false);


		var animationListener_home_2 = function(){

			$(".loc_ps").fadeOut("900");
			$(".loc_bj").fadeOut("900");
			$(".line_img").fadeOut("900");
			$(".arrow").fadeOut("900");
			$(".cloud_img").fadeOut("900");
			$(".map_1").removeClass("add").addClass("add2").animate({"opacity":"1"},1000);
			$(".cloud_2_img").addClass("cloud_2_animation").animate({"opacity":"1"},1000);
			$(".dot_lt").addClass("dot_animation").animate({"opacity":"1"},3000,function(){
				$(".lv_home").fadeIn().addClass("show");
				$(".lv_title").addClass("show2").fadeIn("1000");
			});
			
		
		}

		var anim_home2 = document.getElementById("arrow");
		anim_home2.addEventListener("webkitAnimationEnd", animationListener_home_2, false);
*/


 	})

})(jQuery)


function animation1(){
    var animationListener_home = function(){
		$(".dot").fadeOut();
		$(".title_ps").fadeOut();
		$(".title_bj").fadeOut();
		$(".title_ty").fadeOut();
		$(".title_ny").fadeOut();
		$(".map_1").addClass("add");
		$(".loc_ps").animate({"opacity":"1"},1000);
		$(".loc_bj").animate({"opacity":"1"},1000);
		$(".cloud_img").addClass("pulse").animate({"opacity":"1"},2000);
		$(".line_img").addClass("line_animation").animate({"opacity":"1"});
		$(".arrow").addClass("arrow_animation").animate({"opacity":"1"},1000);
	}
	var anim_home = document.getElementById("end");
	anim_home.addEventListener("webkitAnimationEnd", animationListener_home, false);
}

function animation2(){
	var animationListener_home_2 = function(){
		$(".loc_ps").fadeOut();
		$(".loc_bj").fadeOut();
		$(".line_img").fadeOut();
		$(".arrow").fadeOut();
		$(".cloud_img").fadeOut();
		$(".map_1").removeClass("add").addClass("add2").animate({"opacity":"1"},1000);
		$(".cloud_2_img").addClass("cloud_2_animation").animate({"opacity":"1"},1000);
		$(".dot_lt").addClass("dot_animation").animate({"opacity":"1"},6000,function(){
			$(".lv_home").fadeIn().addClass("show");
			$(".lv_title").addClass("show2").fadeIn(3000);
		});
	}
	var anim_home_2 = document.getElementById("arrow");
	anim_home_2.addEventListener("webkitAnimationEnd", animationListener_home_2, false);
}

function animation3(){
    var animationListener_home_3 = function(){
		/*$(".dot").fadeOut();*/
		$(".title_bj").fadeOut();
		$(".title_ty").fadeOut();
		$(".title_ny").fadeOut();
		$(".map_3").addClass("add3").animate({"opacity":"0"});
        
		$(".map_4").addClass("add4").animate({"opacity":"1"},2000);
        $(".cloud_left").addClass("cloud_left_animation");
        $(".cloud_right").addClass("cloud_right_animation");
		$(".cloud_forest").addClass("cloud_2_animation").animate({"opacity":"1"},1000);
		$(".dot_first").addClass("dot_animation").animate({"opacity":"1"},6000,function(){
			
			$(".building").fadeIn().animate({"opacity":"1"},2000);
			$(".park").fadeIn().animate({"opacity":"1"},2000,function(){
				$(".park_name").fadeIn().animate({"opacity":"1"});
			});
		});
		
	}
	var anim_home_3 = document.getElementById("start_ps");
	anim_home_3.addEventListener("webkitAnimationEnd", animationListener_home_3, false);
}







