var shareData = {
    title: '路易威登臻礼相伴爱情旅程，七夕一起见证我们的爱情',
    desc: '将你的名字印记在我的心锁上，愿真挚之爱如影随行。',
    descTimeline: '“锁住爱”- 路易威登与您相伴浪漫七夕',
    link: window.location.host + "/chinesevday",
    imgUrl: 'http://' + window.location.host + '/images/share.jpg',
    sharePageVal: '',
    shareLog:'0',
    returnFun: function(){
        //alert(6);
    }
};



function wechatFun(){
    var wechatUrl;
    if(window.location.href.indexOf('#') < 0){
        wechatUrl = window.location.href;
    }else{
        wechatUrl = window.location.href.substr(0,window.location.href.indexOf('#'));
    }
    
    $.ajax({
        type: "GET",
        url: "/same/wechat/jssdk",
        data: {
            "url": wechatUrl
        },
        dataType:"json"
    }).done(function(data){
            wechatShare(data.appid,data.timestamp,data.noncestr,data.sign);
    }).fail(function() {
        console.log("请求接口失败！");
    });
}

function sharelogFun(_type){
    $.ajax({
        type: "POST",
        url: "{{ url('lv_cvd_sharelog') }}",
        data: {
            "type": _type
        },
        dataType:"json"
    }).done(function(data){

    })
}



function wechatShare(appid,timestamp_val,noncestr,signature_val){

  wx.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: appid, // 必填，公众号的唯一标识
      timestamp: timestamp_val, // 必填，生成签名的时间戳
      nonceStr: noncestr, // 必填，生成签名的随机串
      signature: signature_val,// 必填，签名，见附录1
      jsApiList: [
        'checkJsApi',
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareWeibo',
        'hideMenuItems',
        'showMenuItems',
        'hideAllNonBaseMenuItem',
        'showAllNonBaseMenuItem',
        'translateVoice',
        'startRecord',
        'stopRecord',
        'onRecordEnd',
        'playVoice',
        'pauseVoice',
        'stopVoice',
        'uploadVoice',
        'downloadVoice',
        'chooseImage',
        'previewImage',
        'uploadImage',
        'downloadImage',
        'getNetworkType',
        'openLocation',
        'getLocation',
        'hideOptionMenu',
        'showOptionMenu',
        'closeWindow',
        'scanQRCode',
        'chooseWXPay',
        'openProductSpecificView',
        'addCard',
        'chooseCard',
        'openCard'
      ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
  });

  wx.ready(function(){


    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
    wx.onMenuShareTimeline({
        title: shareData.descTimeline, // 分享标题
        link: shareData.link, // 分享链接
        imgUrl: shareData.imgUrl, // 分享图标
        success: function () {
            // 用户确认分享后执行的回调函数  

            shareData.returnFun();

            sharelogFun("Timeline");

            _hmt.push(['_trackEvent', 'btn', '右上角分享', '分享到朋友圈']);
            //alert('分享成功');
        },
        cancel: function () { 
            // 用户取消分享后执行的回调函数
            // alert("分享失败")
        }
    });
    
    
    wx.onMenuShareAppMessage({
        title: shareData.title, // 分享标题
        link: shareData.link, // 分享链接
        imgUrl: shareData.imgUrl, // 分享图标
        desc: shareData.desc,
        success: function () { 
            // 用户确认分享后执行的回调函数
            
            shareData.returnFun();

            // if(shareData.shareLog == "1"){
            //     sharelogFun("ShareAppMessage");
            // }
            sharelogFun("ShareAppMessage");

            _hmt.push(['_trackEvent', 'btn', '右上角分享', '分享给好友']);
            //alert('分享成功');
        },
        cancel: function () { 
            // 用户取消分享后执行的回调函数
            // alert("分享失败")
        }
    });
      
  });

  wx.error(function(res){
    //alert("无法使用微信JS")
    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。

  });

}











function editShare(){   ///demon
     wx.onMenuShareTimeline({
            title: shareData.descTimeline, // 分享标题
            link: shareData.link, // 分享链接
            imgUrl: shareData.imgUrl, // 分享图标
            success: function () {
                // 用户确认分享后执行的回调函数

                shareData.returnFun();

                sharelogFun("Timeline");
                
                _hmt.push(['_trackEvent', 'btn', '右上角分享', '分享到朋友圈']);
                
                //alert('分享成功');
            },
            cancel: function () { 
                // 用户取消分享后执行的回调函数
                // alert("分享失败")

            }
        });
        
        
        wx.onMenuShareAppMessage({
            title: shareData.title, // 分享标题
            link: shareData.link, // 分享链接
            imgUrl: shareData.imgUrl, // 分享图标
            desc: shareData.desc,
            success: function () { 
                // 用户确认分享后执行的回调函数

                shareData.returnFun();

                sharelogFun("ShareAppMessage");

                _hmt.push(['_trackEvent', 'btn', '右上角分享', '分享给好友']);
                //alert('分享成功');
            },
            cancel: function () { 
                // 用户取消分享后执行的回调函数
               // alert("分享失败")
            }
        });
}




wechatFun();











