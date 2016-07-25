;(function($){

document.addEventListener('touchmove' , function (ev){
  ev.preventDefault();
  return false;
} , false)

$("#main").animate({"opacity":1},600);
var curFinish = $('body').data("finish");
var curId = $('body').data("id");




if(curFinish==1){
  var pageArr = ["introduction","home"];
}else{
  var pageArr = ["introduction","form"];
}
var pageArr2 = ["introduction","form","home"];
var $page = $('.page'),
    $menu = $('.menu li');

function pageSlideOver(){
  $('.page-out').live('transitionend', function(){
      $(this).removeClass('page-out');
  });
  $('.page-in').live('transitionend', function(){
      $(this).removeClass('page-in');
  });
}




var curmoveval = false;
function pageChange(){
    this.GetQueryString = function(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return unescape(r[2]); return null;
    },
    this.hashfun = function(){
        var curpageIndex = this.GetQueryString("page"); 
        var curshow = $(".page-active").data("page");
        if(curpageIndex){
            pagechange.moveClick(curshow,curpageIndex);
        }
    },
    this.movePrev = function(a){
        var curArrIndex = pageArr.indexOf(a.data("page"));
        curArrIndex++;
        if(curArrIndex>=pageArr.length||curmoveval)return false;

        if(curArrIndex>=pageArr.length-1){
            $(".arr").hide();
        }else{
            $(".arr").show();
        }

        a.removeClass('page-active').addClass('page-prev page-out');
        $('.'+pageArr[curArrIndex]).removeClass('page-next').addClass('page-active page-in');

        pageSlideOver();
        history.pushState({"page": pageArr[curArrIndex]}, "" , "?page="+pageArr[curArrIndex]);
    },
    this.moveNext = function(a){
        var curArrIndex = pageArr.indexOf(a.data("page"));
        curArrIndex--;
        if(curArrIndex<0||curmoveval)return false;
        $(".arr").show();

        a.removeClass('page-active').addClass('page-next page-out');
        $('.'+pageArr[curArrIndex]).removeClass('page-prev').addClass('page-active page-in');

        pageSlideOver();
        history.pushState({"page": pageArr[curArrIndex]}, "" , "?page="+pageArr[curArrIndex]);
    },
    this.moveClick = function(curshow,curclick){
        curmoveval=true;
        var curShowIndex = pageArr2.indexOf(curshow);
        var curClickIndex = pageArr2.indexOf(curclick);
        if(curShowIndex === curClickIndex)return false;

        if(curShowIndex > curClickIndex){
          $("."+curshow).removeClass('page-active').addClass('page-next page-out');
          $('.'+curclick).removeClass('page-prev').addClass('page-active page-in');
        }else{
          $("."+curshow).removeClass('page-active').addClass('page-prev page-out');
          $('.'+curclick).removeClass('page-next').addClass('page-active page-in');
        }

        pageSlideOver();
        history.pushState({"page": curclick}, "" , "?page="+curclick);
    }

}

var pagechange = new pageChange();

pagechange.hashfun()


$page.swipeUp(function(ev){
    pagechange.movePrev($(this));
    ev.preventDefault();
})

$page.swipeDown(function(ev){
    pagechange.moveNext($(this));
    ev.preventDefault();
})

$menu.tap(function(event){
    var curshow = $(".page-active").data("page");
    var curclick = $(this).data("page");
    pagechange.moveClick(curshow,curclick);
    return false;
});




/* ------------- objScript ------------- */

var objScript = {
       isPhoneNum : function(value){
            return /^0?(13[0-9]|15[012356789]|18[012356789]|14[57])[0-9]{8}$/.test(value);
       },
　　　　checkform : function (_name,_tel){
　　　　　　 if(_name == ""){
                alert("名字不能为空！");
                return false;
           }
           if(_tel!=="" && !this.isPhoneNum(_tel)){
                alert("手机号码填写有误！");
                return false;
           }

          // var curshow = $(".page-active").data("page");
          // pagechange.moveClick(curshow,'home');
          this.submitform(_name,_tel);
　　　　},
       maplink : function(){
          window.location.href="/map-"+curId+".html"
          // var curshow = $(".page-active").data("page");
          // pagechange.moveClick(curshow,'map');
       },
       qrcodelink : function(){
          window.location.href="/qrcode.html"
       },
       submitform : function(usename,usemobile){
          $.ajax({
              type: "POST",
              url: "/Request.php?model=finish",
              data: {
                   "name": usename,"mobile":usemobile
              },
              dataType:"json",
              success: function(data){
                 if(data.code==1){
                    var curshow = $(".page-active").data("page");
                    pagechange.moveClick(curshow,'home');
                 }else if(data.code==0){
                    alert(data.msg);
                 }
              }
          })
       }
};


$(".formsubmit").click(function(){
    objScript.checkform($('#name').val(),$('#mobile').val());
})

$(".immediately").click(function(){
    objScript.maplink();
})

$(".attention").click(function(){
    objScript.qrcodelink();
})







})(Zepto);


