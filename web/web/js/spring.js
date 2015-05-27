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

 	})

})(jQuery)


	











