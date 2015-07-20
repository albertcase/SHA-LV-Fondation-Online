<?php
/** 
* Wechat Model 
* 
* Wechat Login
* @author      demon.zhang@samesamechina.com
* @version     1.0.1
* @since       1.0
*/
namespace Same\Bundle\WechatBundle\Model;

use Doctrine\ORM\EntityRepository;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Filesystem\Filesystem;

class Wechat
{

	private $_container;

	private $_router;

	private $_session;

	private $_memcache;
	
	/** 
	* wechat_construct
	* 
	* @construct
	* @param mixed $container 
	* @since 1.0 
	*/  
	public function __construct($container, $memcached) {
		$this->_container = $container;
		$this->_router = $this->_container->get('router');
		$this->_session = $this->_container->get('session');
		$this->_memcache = $memcached;
	}

	/** 
	* wechat_oauth
	* 
	* @access public
	* @param mixed $redirecturl  callBackUrl 
	* @since 1.0 
	* @return RedirectResponse
	*/ 
	public function oauth($redirecturl, $scope = 'snsapi_userinfo', $state = 'STATE', $type = 'code') {
		$callback = $this->_router
				  		 ->generate('same_wechat_callback', 
						  	          array(
						  	          	'redirecturl'=> $redirecturl
						  	          ), 
						  	          true);
		$http_data = array();
		$http_data['appid'] = $this->_container->getParameter('appid');
		$http_data['redirect_uri'] = $callback;
		$http_data['response_type'] = $type;
		$http_data['scope'] = $scope;
		$http_data['state'] = $state;
		return new RedirectResponse($this->_container->getParameter('oauthApiUrl') . http_build_query($http_data) . '#wechat_redirect', 302);
	}

	/** 
	* wechat_access_token
	* get access_token
	* @access private
	* @since 1.0 
	* @return string $access_token
	*/ 
	private function getAccessToken() {
		$time = $this->_memcache->get('wechat_server_time');
		$access_token = $this->_memcache->get('wechat_server_access_token');
		if((!$access_token) || (strtotime($time) - time() <= 0)){
			$result = file_get_contents("http://vuitton.cynocloud.com/Interface/getSignPackage");

			$fs = new Filesystem();
			$filedir = $this->_container->getParameter('files_base_dir');
			if(!$fs->exists($filedir. '/Log'))
	            $fs->mkdir($filedir. '/Log', 0700);
	        $fileName = '/Log/' . date('Ymd') . '-auto.txt';
	        $file = $filedir . $fileName;
	        $content = "请求时间--". date('Y-m-d H:i:s'). "\n";
	        $content .= "请求地址--http://vuitton.cynocloud.com/interface/getsignpackage\n";
	        if(!$access_token)
	        	$content .= "请求原因--memcache取不到token\n";
	        else
	        	$content .= "请求原因--token到期\n";
	        $content .= "返回结果--". $result. "\n----------------------\n\n";
	        if(!$fs->exists($file))
	        	$fs->dumpFile($file, $content, 0700);
	        else
	        	file_put_contents($file, $content, FILE_APPEND);

	        $result = json_decode($result, true);
			$this->_memcache->set('wechat_server_time', $result['access_token_expiretime']);
			$this->_memcache->set('wechat_server_ticket', $result['js_api_ticket']);
			$this->_memcache->set('wechat_server_access_token', $result['access_token']);
		}
		return $this->_memcache->get('wechat_server_access_token');
		
	}

	/** 
	* wechat_access_token
	* get access_token
	* @access private
	* @since 1.0 
	* @return string $access_token
	*/ 
	public function refrenceAccessToken() {
		$result = file_get_contents("http://vuitton.cynocloud.com/interface/getsignpackage/?refresh=true");
		
		$fs = new Filesystem();
		$filedir = $this->_container->getParameter('files_base_dir');
		if(!$fs->exists($filedir. '/Log'))
            $fs->mkdir($filedir. '/Log', 0700);
        $fileName = '/Log/' . date('Ymd') . '-hand.txt';
        $file = $filedir . $fileName;
        $content = "请求时间--". date('Y-m-d H:i:s'). "\n";
        $content .= "请求地址--http://vuitton.cynocloud.com/interface/getsignpackage/?refresh=true\n";
        $content .= "请求原因--手动刷新\n";
        $content .= "返回结果--". $result. "\n----------------------\n\n";
        if(!$fs->exists($file))
        	$fs->dumpFile($file, $content, 0700);
        else
        	file_put_contents($file, $content, FILE_APPEND);

        $result = json_decode($result, true);
		$this->_memcache->set('wechat_server_time', $result['access_token_expiretime']);
		$this->_memcache->set('wechat_server_ticket', $result['js_api_ticket']);
		$this->_memcache->set('wechat_server_access_token', $result['access_token']);
		$returnMsg = array();
		$returnMsg['wechat_server_time'] = $this->_memcache->get('wechat_server_time');
		$returnMsg['wechat_server_ticket'] = $this->_memcache->get('wechat_server_ticket');
		$returnMsg['wechat_server_access_token'] = $this->_memcache->get('wechat_server_access_token');
        return $returnMsg;

	}

	/** 
	* wechat_js_sdk
	* get js ticket
	* @access private
	* @since 1.0 
	* @return json $access_token
	*/ 
	public function getJsTicket($url) {
		$appid = $this->_container->getParameter('appid');
		$time = $this->_memcache->get('wechat_server_time');
		$ticket = $this->_memcache->get('wechat_server_ticket');
		if((!$ticket) || (strtotime($time) - time() <= 7200)){
			$result = file_get_contents("http://vuitton.cynocloud.com/Interface/getSignPackage");

			$fs = new Filesystem();
			$filedir = $this->_container->getParameter('files_base_dir');
			if(!$fs->exists($filedir. '/Log'))
	            $fs->mkdir($filedir. '/Log', 0700);
	        $fileName = '/Log/' . date('Ymd') . '-auto.txt';
	        $file = $filedir . $fileName;
	        $content = "请求时间--". date('Y-m-d H:i:s'). "\n";
	        $content .= "请求地址--http://vuitton.cynocloud.com/interface/getsignpackage\n";
	        if(!$access_token)
	        	$content .= "请求原因--memcache取不到token\n";
	        else
	        	$content .= "请求原因--token到期\n";
	        $content .= "返回结果--". $result. "\n----------------------\n\n";
	        if(!$fs->exists($file))
	        	$fs->dumpFile($file, $content, 0700);
	        else
	        	file_put_contents($file, $content, FILE_APPEND);
	        
	        $result = json_decode($result, true);
			$this->_memcache->set('wechat_server_time', $result['access_token_expiretime']);
			$this->_memcache->set('wechat_server_ticket', $result['js_api_ticket']);
			$this->_memcache->set('wechat_server_access_token', $result['access_token']);	
		}
		$ticket = $this->_memcache->get('wechat_server_ticket');
		$str = '1234567890abcdefghijklmnopqrstuvwxyz';
		$noncestr = '';
		for($i=0;$i<8;$i++){
			$randval = mt_rand(0,35);
			$noncestr .= $str[$randval];
		}
		$ticket_data = array();
		$ticket_data['jsapi_ticket'] = $ticket;
		$ticket_data['noncestr'] = $noncestr;
		$ticket_data['timestamp'] = time();
		$ticket_data['url'] = $url;
		//$sign = sha1(http_build_query($ticket_data));
		$sign = sha1("jsapi_ticket=".$ticket."&noncestr=".$noncestr."&timestamp=".$ticket_data['timestamp']."&url=".urldecode($url));
		$ticket_data['sign'] = $sign;
		$ticket_data['appid'] = $appid;
		$response = new JsonResponse();
        $response->setData($ticket_data);
        return $response;
	}

	/** 
	* user_access_token
	* get user's access_token
	* @access public
	* @since 1.0 
	* @return array access_token&openid
	*/ 
	public function getOauthAccessToken($code) {
		$http_data = array();
		$http_data['code'] = $code;
		$http_data['grant_type'] = 'authorization_code';
		$http_data['appid'] = $this->_container->getParameter('appid');
		$http_data['secret'] = $this->_container->getParameter('appsecret');
		$result = file_get_contents($this->_container->getParameter('accessTokenApiUrl') . http_build_query($http_data));
		$result = json_decode($result, true);
		if(isset($result['access_token'])){
			$this->_session->set('wechat_user_access_token', $result['access_token']);
			$this->_session->set('wechat_user_openid', $result['openid']);
			$this->_session->set('wechat_user_scope', $result['scope']);
		}
		return $result;
	}

	/** 
	* wechat_islogin
	* get user's login status
	* @access public
	* @since 1.0 
	* @return json access_token&openid or RedirectResponse
	*/ 
	public function isLogin($redirecturl, $scope ='snsapi_base') {
		if($access_token = $this->_session->get('wechat_user_access_token')){
			//$info = array();
			//$info['access_token'] = $access_token;
			//$info['openid'] = $this->_session->get('wechat_user_openid');
			//$info['scope'] = $this->_session->get('wechat_user_scope');
			//$response = new JsonResponse();
	        //$response->setData($info);
	        return $this->_session->get('wechat_user_openid');
		}
		return $this->oauth($redirecturl, $scope);
		
	}

	public function sendTemplate($template_id, $url, $topcolor, $data, $openid){
		$access_token = $this->getAccessToken();
	    $http_data = array();
	    $http_data['touser'] = $openid;
	    $http_data['template_id'] = $template_id;
	    $http_data['url'] = $url;
	    $http_data['topcolor'] = $topcolor;
	    $http_data['data'] = $data;
	    $http_data = json_encode($http_data);
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=" . $access_token);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_POST, 1);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $http_data);
		$result = curl_exec($curl);
		curl_close($curl);
		$result = json_decode($result,true);
		if($result['errcode']==0){
			return 1;
		}
		return 0;
	}

	public function isSubscribed($openid, $lang = 'zh_CN'){
		$access_token = $this->getAccessToken();
		$http_data = array();
	    $http_data['access_token'] = $access_token;
	    $http_data['openid'] = $openid;
	 	$http_data['lang'] = $lang;
		$result = file_get_contents($this->_container->getParameter('userInfoApiUrl') . http_build_query($http_data));
		$result = json_decode($result, true);
		return $result['subscribe'];
	}


}
?>