
var LoadingImg = [
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



function loading(allAmg){
    LoadFn(allAmg , function (){

        $("img").each(function(){ 
            $(this).attr("src",$(this).attr("sourcesrc"));
        })

        $(".loading").fadeOut();

        $("#dreambox").show();

        
    } , function (p){
        $(".loadingImg em").html(p+"%");
        //console.log(p);
    });
}



loading(LoadingImg);