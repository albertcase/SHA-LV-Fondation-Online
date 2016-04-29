// console.log("%c☺","font-size: 60px; color: #e74c3c");

/* 图片加载 */
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


function prosingelFun(n){

    $(".prolist").hide();
    $(".prosingel").show();
    $(".procon").hide();
    $(".procon").eq(parseInt(n-1, 10)).show();

    $(".menu li").removeClass("active");
    $(".menu li").eq(parseInt(n-1, 10)).addClass("active");

    _hmt.push(['_trackEvent', 'btn', 'click', "Selection"+parseInt(n-1, 10)]);
    
}

function prolistFun(){
    $(".prosingel").hide();
    $(".prolist").show();
    $(".procon").hide();

    $(".menu li").removeClass("active");
    $(".menu li").eq(6).addClass("active");

    _hmt.push(['_trackEvent', 'btn', 'click', "View all"]);
}

/* 错误提示浮层 */
var alertInt;
function formErrorTips(alertNodeContext){

    clearTimeout(alertInt);
    if($(".alertNode").length > 0){
        $(".alertNode").html(alertNodeContext);
    }else{
        var alertNode = document.createElement("div");
        alertNode.setAttribute("class","alertNode");
        alertNode.innerHTML = alertNodeContext;
        document.body.appendChild(alertNode);

    }
    alertInt = setTimeout(function(){
        $(".alertNode").remove();
    },2000);

}




/*

    分享朋友圈:
    标题：路易威登•母亲节温情献礼

    分享好友:
    标题：路易威登•母亲节温情献礼
    描述：无尽感恩，在这个母亲节化为永恒礼赞。 

*/


function shareFunSetDefault(){

    wx.ready(function () {
        // 在这里调用 API
        // 2. 分享接口
        // 2.1 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口

        var _unescape = function(str) {
            return str.replace(/&amp;/g, "&")
                      .replace(/&gt;/g, ">")
                      .replace(/&lt;/g, "<")
                      .replace(/&quot;/g, '"')
                      .replace(/&#39;/g, "'");
        };
        
        wx.onMenuShareAppMessage({
            title: _unescape('路易威登•母亲节温情献礼'),
            desc: _unescape('无尽感恩，在这个母亲节化为永恒礼赞。'),
            link: window.location.host,
            imgUrl: 'http://7vzs67.com1.z0.glb.clouddn.com/3837a392-95a4-49c3-8231-71cf9b44119e?imageView2/1/w/200/h/200/format/jpg/q80/interlace/1', 
            trigger: function (res) {
                //  alert('用户点击发送给朋友');
            },
            success: function (res) {
                _hmt.push(['_trackEvent', 'btn', 'share', 'ShareAppMessage']);
                //  alert('已分享');
            },
            cancel: function (res) {
                //  alert('已取消');
            },
            fail: function (res) {
                //  alert(JSON.stringify(res));
            }
        });


        // 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口

        wx.onMenuShareTimeline({
            title: _unescape('路易威登•母亲节温情献礼'), 
            link: window.location.host,
            imgUrl: 'http://7vzs67.com1.z0.glb.clouddn.com/3837a392-95a4-49c3-8231-71cf9b44119e?imageView2/1/w/200/h/200/format/jpg/q80/interlace/1', 
            trigger: function (res) {
                //   alert('用户点击分享到朋友圈');
            },
            success: function (res) {
                _hmt.push(['_trackEvent', 'btn', 'share', 'ShareTimeline']);
                // alert('已分享');
            },
            cancel: function (res) {
                //  alert('已取消');
            },
            fail: function (res) {
                //   alert(JSON.stringify(res));
            }
        });
    }); //end of wx.ready

}







function shareFunSet(_shareLink){

    wx.ready(function () {

        var _unescape = function(str) {
            return str.replace(/&amp;/g, "&")
                      .replace(/&gt;/g, ">")
                      .replace(/&lt;/g, "<")
                      .replace(/&quot;/g, '"')
                      .replace(/&#39;/g, "'");
        };

        // 在这里调用 API
        // 2. 分享接口
        // 2.1 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口

        window.wechat_setting.friend  = {
                title: _unescape('路易威登•母亲节温情献礼'),
                desc: _unescape('无尽感恩，在这个母亲节化为永恒礼赞。'),
                link: 'http://' + window.location.host + _shareLink,
                imgUrl: 'http://7vzs67.com1.z0.glb.clouddn.com/3837a392-95a4-49c3-8231-71cf9b44119e?imageView2/1/w/200/h/200/format/jpg/q80/interlace/1', 
        };

        wx.onMenuShareAppMessage({
            title: _unescape('路易威登•母亲节温情献礼'),
            desc: _unescape('无尽感恩，在这个母亲节化为永恒礼赞。'),
            link: 'http://' + window.location.host + _shareLink,
            imgUrl: 'http://7vzs67.com1.z0.glb.clouddn.com/3837a392-95a4-49c3-8231-71cf9b44119e?imageView2/1/w/200/h/200/format/jpg/q80/interlace/1', 
            trigger: function (res) {
                //  alert('用户点击发送给朋友');
            },
            success: function (res) {
                window.location.href = 'http://' + window.location.host + _shareLink;
                _hmt.push(['_trackEvent', 'btn', 'share', 'ShareAppMessage']);
                //  alert('已分享');
            },
            cancel: function (res) {
                //  alert('已取消');
            },
            fail: function (res) {
                //  alert(JSON.stringify(res));
            }
        });


        // 2.2 监听“分享到朋友圈”按钮点击、自定义分享内容及分享结果接口
        window.wechat_setting.timeline = {
            title: '路易威登•母亲节温情献礼',
            link: 'http://' + window.location.host + _shareLink,
            imgUrl: 'http://7vzs67.com1.z0.glb.clouddn.com/3837a392-95a4-49c3-8231-71cf9b44119e?imageView2/1/w/200/h/200/format/jpg/q80/interlace/1', 
       };

        wx.onMenuShareTimeline({
            title: '路易威登•母亲节温情献礼', 
            link: 'http://' + window.location.host + _shareLink,
            imgUrl: 'http://7vzs67.com1.z0.glb.clouddn.com/3837a392-95a4-49c3-8231-71cf9b44119e?imageView2/1/w/200/h/200/format/jpg/q80/interlace/1', 
            trigger: function (res) {
                //   alert('用户点击分享到朋友圈');
            },
            success: function (res) {
                window.location.href = 'http://' + window.location.host + _shareLink;
                _hmt.push(['_trackEvent', 'btn', 'share', 'ShareTimeline']);
                // alert('已分享');
            },
            cancel: function (res) {
                //  alert('已取消');
            },
            fail: function (res) {
                //   alert(JSON.stringify(res));
            }
        });
    }); //end of wx.ready


}













