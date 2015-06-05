<?php


header("Content-Type:text/html;charset=utf-8");
session_start(); // Starting Session

// Define $name and $password
$account=$_GET['account'];
$password=$_GET['password'];


/* json */
$json ="";
$data =array(); 
class Member 
{
public $success;
}
$Member = new Member();


if ($account=='admin'&&$password=='lv2015') {
	$_SESSION['login_user']=$account; // Initializing Session
	$Member->success = 1;
	//header("location: report.php"); // Redirecting To Other Page
} else {
	$Member->success = 0;
}


$data[]=$Member;
$json = json_encode($data);
echo "{".'"Member"'.":".$json."}";

?>