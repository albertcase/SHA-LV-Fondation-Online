
var loadingFun = function(imgSrcArr,finshReturnFun){

		$("#dreambox img").each(function(){ 
			imgSrcArr.push($(this).attr("sourcesrc")) 
		})

		function LoadFn ( arr , fn , fn2){
				var loader = new PxLoader();
				for( var i = 0 ; i < arr.length; i ++)
				{
					loader.addImage(arr[i]);
				};
				
				loader.addProgressListener(function(e) {
						var percent = Math.round( e.completedCount / e.totalCount * 100 );
						if(fn2) fn2(percent)
				});	
				
				
				loader.addCompletionListener( function(){
					if(fn) fn();	
				});
				loader.start();	
		}


		LoadFn(imgSrcArr , function (){
			$("#dreambox img").each(function(){ 
				$(this).attr("src",$(this).attr("sourcesrc"));
			})
			$(".loading").hide();
			$("#dreambox").animate({"opacity" : 1});	
			wechatFun();
			if(finshReturnFun){
				finshReturnFun();
			}
		    console.log("加载完成!");
		} , function ( p ){
			$('.loading_con p').html(p+"%");
		});

};
