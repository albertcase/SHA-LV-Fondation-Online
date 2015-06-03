
var dis = document.querySelector(".ani_area");
if(dis!=null){
	dis.addEventListener('touchmove' , function (ev){
		ev.preventDefault();
		return false;
	} , false)
}



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

touch.on(j, 'swipedown', function(event){
	j.removeClass('page-active').addClass('page-prev page-out');
    l.removeClass('page-next').addClass('page-active page-in');
    event.preventDefault();
});







