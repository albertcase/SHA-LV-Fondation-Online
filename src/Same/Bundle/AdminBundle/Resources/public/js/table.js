function review(id){
    $.ajax({
        url:BASEURL+"/same/admin/review",
        type:"get",
        data:{"id":id},
        dataType:"json",
        success:function(data){
            if(data.msg==1){
                $("#review_"+id).attr("class","statusOn");
            }else{
                $("#review_"+id).attr("class","statusOff");
            }
        }
    })
}

