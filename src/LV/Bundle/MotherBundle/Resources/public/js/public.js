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
        imgUrl: 'http://' + window.location.host + '/images/motherdayImg/share.jpg', 
        type: '', 
        dataUrl: '', 
        success: function () { 
            alert(6);
            _hmt.push(['_trackEvent', 'btn', 'share', 'ShareAppMessage']);
        },
        cancel: function () { 
        }
    });

    wx.onMenuShareTimeline({
        title: _unescape('路易威登•母亲节温情献礼'), 
        link: window.location.host,
        imgUrl: 'http://' + window.location.host + '/images/motherdayImg/share.jpg', 
        success: function () { 
            alert(6);
            _hmt.push(['_trackEvent', 'btn', 'share', 'ShareTimeline']);
        },
        cancel: function () {
        }
    });
}







function shareFunSet(_shareLink){
    alert('http://' + window.location.host + _shareLink);
    var _unescape = function(str) {
        return str.replace(/&amp;/g, "&")
                  .replace(/&gt;/g, ">")
                  .replace(/&lt;/g, "<")
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'");
    };


    wx.onMenuShareAppMessage({
        title: _unescape('-----路易威登•母亲节温情献礼'),
        desc: _unescape('无尽感恩，在这个母亲节化为永恒礼赞。'),
        link: 'http://' + window.location.host + _shareLink,
        imgUrl: 'http://' + window.location.host + '/images/motherdayImg/share.jpg', 
        type: '', 
        dataUrl: '', 
        success: function () { 
            alert('http://' + window.location.host + _shareLink);
            window.location.href = 'http://' + window.location.host + _shareLink;
            _hmt.push(['_trackEvent', 'btn', 'share', 'ShareAppMessage']);
        },
        cancel: function () { 
        }
    });

    wx.onMenuShareTimeline({
        title: _unescape('-----路易威登•母亲节温情献礼'), 
        link: 'http://' + window.location.host + _shareLink,
        imgUrl: 'http://' + window.location.host + '/images/motherdayImg/share.jpg', 
        success: function () { 
            alert('http://' + window.location.host + _shareLink);
            window.location.href = 'http://' + window.location.host + _shareLink;
            _hmt.push(['_trackEvent', 'btn', 'share', 'ShareTimeline']);
        },
        cancel: function () {
        }
    });
}













