;(function($){
    $(function(){

		$(".nav_icon").click(function(){
			$("#navLevel").removeClass('page-prev').addClass('page-active page-in');
		})

		$(".close").click(function(){
			$("#navLevel").removeClass('page-active').addClass('page-prev page-out');
		})

	})
})(jQuery);