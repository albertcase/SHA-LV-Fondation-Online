var pagechange;

var LoadingImg = [];

function GetQueryString(){
    var r = unescape(location.hash);
    r=r.replace("#","");
    if(r!=null)return r; return null;
}

function GetQueryString_q(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return unescape(r[2]); return null;
}

;(function($){
    $(function(){
        
        // document.addEventListener('touchmove' , function (ev){
        //   ev.preventDefault();
        //   return false;
        // } , false)

        var pageArr = ["index","chose","selected","create","form","attention","share","poster","edit","view","friendEnter"];
        var $page = $('.page');

        function pageSlideOver(){
            $('.page-out').bind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){
                $(this).removeClass('page-out');
            });

            $('.page-in').bind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",function(){
                $(this).removeClass('page-in');
            });
        }


        var curmoveval = false;
        function pageChange(){
            this.hashfun = function(){

                var curpageIndex = GetQueryString(); 
                if(curpageIndex){
                    pagechange.moveClick(curpageIndex);
                }else{
                    pagechange.moveClick("index");
                }

                if(curpageIndex=="create"||curpageIndex=="form"){
                    $("#dreambox").css({"height":$(window).height()});
                }
            },
            this.movePrev = function(a){
                var curArrIndex = pageArr.indexOf(a.attr("data-page"));
                if(curArrIndex>=pageArr.length-1)return false;
                curArrIndex++;

                a.removeClass('page-active').addClass('page-out');
                $('#'+pageArr[curArrIndex]).addClass('page-active page-in');

                pageSlideOver();
                history.pushState({"page": pageArr[curArrIndex]}, "" , "#"+pageArr[curArrIndex]);
            },
            this.moveNext = function(a){
                var curArrIndex = pageArr.indexOf(a.attr("data-page"));
                if(curArrIndex<=0)return false;
                curArrIndex--;

                a.removeClass('page-active').addClass('page-out');
                $('#'+pageArr[curArrIndex]).addClass('page-active page-in');

                pageSlideOver();
                history.pushState({"page": pageArr[curArrIndex]}, "" , "#"+pageArr[curArrIndex]);
            },
            this.moveClick = function(curclick,callbackFun){

                var curshow = $('.page-active').attr("data-page");
                var curShowIndex = pageArr.indexOf(curshow);
                var curClickIndex = pageArr.indexOf(curclick);
                if(curShowIndex === curClickIndex)return false;


                if(curShowIndex > curClickIndex){
                  $("#"+curshow).removeClass('page-active').addClass('page-out');
                  $('#'+curclick).addClass('page-active page-in');
                }else{
                  $("#"+curshow).removeClass('page-active').addClass('page-out');
                  $('#'+curclick).addClass('page-active page-in');
                }

                pageSlideOver();
                history.pushState({"page": curclick}, "" , "#"+curclick);

                if(curclick=="create"||curclick=="form"){
                    $("#dreambox").css({"height":$(window).height()});
                    // $(".creatBtn").css("display","none");
                    // $(".finshBtn").css("display","inline-block");
                    
                }else{
                    // $(".finshBtn").css("display","none");
                    // $(".creatBtn").css("display","inline-block");
                }


                // if(curclick=="create"||curclick=="form"||curclick=="attention"||curclick=="selected"){
                //     $(".head").css({"height":"56px"});
                // }

            }

            

        }




        pagechange = new pageChange();

        pagechange.hashfun();   



    })
})(jQuery);
















