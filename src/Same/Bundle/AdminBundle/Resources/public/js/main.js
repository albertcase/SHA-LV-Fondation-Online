;(function($){
    $(function(){

        function usrLoginFun(account,password){
            var account=$(".account").val();
            var password=$(".password").val();
            if(account==""){
                alert("请输入您的帐号！");
                return false;
            }
            if(password==""){
                alert("请输入您的密码！");           
                return false;
            }
            
            $.get(BASEURL+"/same/admin/login",{"account": account,"password":password},function(result){
                    if(result.code==1){
                        window.location.href=BASEURL+"/same/admin/file";
                    }else{
                        alert("账号或密码有误，请重新填写！");
                        $(".account").val("");
                        $(".password").val("");
                    }
                    
                },'json'
            )
        }


        $(".sub_btn").on("click",function(){
            var account=$(".account").val();
            var password=$(".password").val();
            usrLoginFun(account,password);


        });
        $(".upload_btn").on("click",function(){
            var code=$("#code").val();
            if(code==""){
                alert("请输入您的编号！");
                return false;
            }

        });
        
  
    })
})(jQuery)


