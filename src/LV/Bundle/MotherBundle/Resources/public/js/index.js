
var LoadingImg = [
    // "/motherdayImg/new-one-box.gif",
    // "/motherdayImg/new-one-flower.gif",
    "/motherdayImg/new-one-box.jpg",
    "/motherdayImg/arr_l.png",
    "/motherdayImg/arr_r.png",
    "/motherdayImg/backmore_btn.jpg",
    "/motherdayImg/bg.jpg",
    "/motherdayImg/blessing.jpg",
    "/motherdayImg/close.png",
    "/motherdayImg/cs_more_btn.jpg",
    "/motherdayImg/getinfo_btn.jpg",

    "/motherdayImg/kv-1.jpg",
    "/motherdayImg/kv-2.jpg",
    "/motherdayImg/kv-3.jpg",
    "/motherdayImg/kv-4.jpg",
    "/motherdayImg/kv-5.jpg",
    "/motherdayImg/kv-6.jpg",
    "/motherdayImg/list-1.jpg",
    "/motherdayImg/list-2.jpg",
    "/motherdayImg/list-3.jpg",
    "/motherdayImg/list-4.jpg",
    "/motherdayImg/list-5.jpg",
    "/motherdayImg/list-6.jpg",

    "/motherdayImg/listbg.png",
    "/motherdayImg/loading_logo.png",
    "/motherdayImg/logo.png",
    "/motherdayImg/more.png",
    "/motherdayImg/nav_bg_b.png",
    "/motherdayImg/nav_bg_c.png",
    "/motherdayImg/nav_bg_h.png",
    "/motherdayImg/nav_hover.png",
    "/motherdayImg/nav.png",
    
    "/motherdayImg/order_slogan.png",
    "/motherdayImg/placeholder.png",
    "/motherdayImg/price_btn.jpg",
    "/motherdayImg/pro_light.png",
    "/motherdayImg/qrcode.jpg",
    "/motherdayImg/send_btn.jpg",
    "/motherdayImg/shake.png",
    "/motherdayImg/sharebtn.jpg",

    "/motherdayImg/slideArr.png",
    "/motherdayImg/slogan.png",
    "/motherdayImg/tel_btn.jpg",

];








var myslider, shakeId, shakeArr = ["1", "2", "3", "fulllist", "4", "5", "6", "fulllist"];

    if(cid <= 0){
        shakeId = 0;
    }else{
        cid >= 3 ? shakeId = cid : shakeId = parseInt(cid-1, 10);
    }
    
    
    function shareFun(){
        $("#sharePup").css({"height": "100%"}).css({"opacity": 1});

        if($(".sharebtn").attr("data-greeting") != "66"){
            $(".messageTextarea").focus();
        }

        _hmt.push(['_trackEvent', 'btn', 'click', "点击事件：share"]);
    }


    /* shake 执行代码 */

    window.onload = function() {

        //create a new instance of shake.js.
        var myShakeEvent = new Shake({
            threshold: 6
        });
        // start listening to device motion
        myShakeEvent.start();
        // register a shake event
        window.addEventListener('shake', shakeEventDidOccur, false);
        //shake event callback
        function shakeEventDidOccur () {
            
            var shakeVal = $("#shake").attr("data-variable");

            if(shakeVal<=0 || shakeVal>7)return false;
            //shakeId = $(".menu li.active").index();           

            shakeId++;

            if(shakeId > 7){
                shakeId=0;
            }

            //put your own code here etc.
            if(shakeArr[shakeId] == "fulllist"){
                prolistFun();
            }else{
                prosingelFun(shakeArr[shakeId]);    
            }
            
  
            //alert('Shake!');
        }
    };



    
    

    $(".menu li").click(function(e){
        
        if($(this).hasClass("active")) return false;
        var ci = $(this).index();

        if(ci == 6){
            shakeId = ci;
            prolistFun();
        }else if(ci == 7){
            $(".puplayer").css({"height": "100%"}).animate({"opacity": 1});
            _hmt.push(['_trackEvent', 'btn', 'click', "Customized card"]);
        }else{
            if(ci>=3){
                shakeId = parseInt(ci+1, 10);
            }else{
                shakeId = ci;
            }
            
            prosingelFun(parseInt(ci+1, 10));
        }

        $(".nav-icon").removeClass("active");
        $(".mask").hide();
        $(".menu").slideToggle();
        e.stopPropagation();

    })



    myslider = new iSlider({
        wrap:'#islider',
        item:'.iSlidercon',
        fullScr: 'false',
        onslide:function (index) {
            if (index == 1) {
                $(".nav-icon").show();
                $("#shake").attr("data-variable", "1");
                $("#newonebox").attr("src", "/motherdayImg/new-one-box.jpg").hide();
            }else{
                $(".nav-icon").hide();
                $("#shake").attr("data-variable", "0");
                $("#newonebox").show().attr("src", "/motherdayImg/new-one-box.gif");
            }

            //loaded();
        }
    });


    

function mysliderLoader(){
    if(cid > 0 && cid < 8){

        myslider.slideTo(1);

        if(cid == 7){
            prolistFun();
        }else{
            prosingelFun(cid);
        }
        
    }else{
        myslider.slideTo(0);
        $(".nav-icon").hide();
        $("#newonebox").attr("src", "/motherdayImg/new-one-box.gif");
    }
}





function loading(allAmg){

    LoadFn(allAmg , function (){

        $("img").each(function(){ 
            $(this).attr("src",$(this).attr("sourcesrc"));
        })

        $(".loading").fadeOut();

        mysliderLoader();

        //$("#shake").css({"opacity": 1});
        // $("#shake").animate({"opacity": 1}, function(){
        //     mysliderLoader();
        // });
        

        
    } , function (p){
        $(".loadingImg em").html(p+"%");
        //console.log(p);
    });
}



loading(LoadingImg);

