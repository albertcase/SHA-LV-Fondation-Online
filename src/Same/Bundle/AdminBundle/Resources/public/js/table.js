;(function($){
    $(function(){

        function dataList(page){
            $.get(BASEURL+"/same/admin/list",{"page": page},function(result){
                    var htm = '';
                    for(var i = 0; i < result.length; i++){
                        htm += '<tr  role="row">';
                        htm += '<td align="center">'+result[i].id+'</td>';
                        htm += '<td align="center">'+result[i].nickname+'</td>';
                        htm += '<td align="center">'+result[i].content+'</td>';
                        htm += '<td align="center">'+result[i].created+'</td>';
                        htm += '<td align="center">'+result[i].status+'</td>';
                        htm += '</tr>';
                    }   
                    $('#table').val(htm);           
                }
            ),'json'
        }
        dataList(1)

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


