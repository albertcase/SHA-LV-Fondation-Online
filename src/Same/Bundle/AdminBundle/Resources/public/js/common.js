$(document).ready(function() { 
//elements
var progressbox 		= $('#progressbox'); //progress bar wrapper
var progressbar 		= $('#progressbar'); //progress bar element
var statustxt 			= $('#statustxt'); //status text element
var submitbutton 		= $("#SubmitButton"); //submit button
var myform 				= $("#UploadForm"); //upload form
var output 				= $("#output"); //ajax result output element
var completed 			= '0%'; //initial progressbar value
var FileInputsHolder 	= $('#AddFileInputBox'); //Element where additional file inputs are appended
var MaxFileInputs		= 7; //Maximum number of file input boxs

// adding and removing file input box
var i = $("#AddFileInputBox div").size() + 1;
$("#AddMoreFileBox").click(function () {
		event.returnValue = false;
		if(i < MaxFileInputs)
		{
			$('<span><input type="file" id="fileInputBox" size="20" name="file[]" class="addedInput" value=""/><a href="#" class="removeclass small2"><img src="/images/close_icon.gif" border="0" /></a></span>').appendTo(FileInputsHolder);
			i++;
		}
		return false;
});

$("body").on("click",".removeclass", function(e){
		event.returnValue = false;
		if( i > 1 ) {
				$(this).parents('span').remove();i--;
		}
		
}); 

$("#ShowForm").click(function () {
  $("#uploaderform").slideToggle(); //Slide Toggle upload form on click
});

$("#SubmitButton").click(function () {
	if($("#code").val()==''){
		alert("请填写code")
		return false
	}else{
		$(myform).ajaxForm({
			beforeSend: function() { //brfore sending form
				submitbutton.attr('disabled', ''); // disable upload button
				statustxt.empty();
				progressbox.show(); //show progressbar
				progressbar.width(completed); //initial value 0% of progressbar
				statustxt.html(completed); //set status text
				statustxt.css('color','#000'); //initial color of status text	
			},
			uploadProgress: function(event, position, total, percentComplete) { //on progress
				progressbar.width(percentComplete + '%') //update progressbar percent complete
				statustxt.html(percentComplete + '%'); //update status text
				if(percentComplete>50)
					{
						statustxt.css('color','#fff'); //change status text to white after 50%
					}else{
						statustxt.css('color','#000');
					}
					
				},
			complete: function(response) { // on complete
				$("#aaa").val(response.responseText); //update element with received data
				//myform.resetForm();  // reset form
				 //enable submit button
				 //submitbutton.removeAttr('disabled');
				//progressbox.hide(); // hide progressbar
				/*$("#uploaderform").slideUp();*/ // hide form after upload
				submitForm();
			}
		});
	}
})


}); 

function submitForm(){
	var code=$("#code").val();
	if(code==""){
		alert("Please enter the code!");
		return false;
	}
	$.ajax({
		url:BASEURL+"/same/admin/submit",
		type:"post",
		data:{"code":code,"files":$("#aaa").val()},
		dataType:"json",
		success:function(data){
			$("#SubmitButton").removeAttr('disabled');
			if(data.code==1){
				alert('上传成功')
				window.location.href=BASEURL+"/same/admin/file"
			}else{
				alert(data.msg)
			}
		}
	})
	
}