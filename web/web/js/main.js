
var dis = document.querySelector(".ani_area");
dis.addEventListener('touchmove' , function (ev){
	ev.preventDefault();
	return false;
} , false)


$(".ani_area").css({"height":$(window).height()});


$('.page-out').bind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){
 	$(this).removeClass('page-out');
});

$('.page-in').bind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){
 	$(this).removeClass('page-in');
});


var l = $("#slider"),j = $("#pagecontent");

touch.on(l, 'swipeup', function(event){
	l.removeClass('page-active').addClass('page-prev page-out');
    j.removeClass('page-next').addClass('page-active page-in');
    event.preventDefault();
});



$(".nav_icon").click(function(){
	$("#navLevel").removeClass('page-prev').addClass('page-active page-in');
})

$(".close").click(function(){
	$("#navLevel").removeClass('page-active').addClass('page-prev page-out');
})







