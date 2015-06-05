<?php
include_once('./config/database.php');
include_once('./config/Pdb.php');
$_POST=$_REQUEST;
$db=Pdb::getDb();
$code = isset($_POST['code']) ? $_POST['code'] : "";
if(!$code){
	exit;
}
$rs=$db->getRow("select photo from same_photo where code =".$db->quote($code),true);
if($rs){
	$list=json_decode($rs['photo'],true);
	foreach($list as $img){
		echo "<img src='".$img."'>";
	}
}
?>