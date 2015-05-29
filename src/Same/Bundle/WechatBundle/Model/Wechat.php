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

use Symfony\Component\HttpFoundation\Request;

use Symfony\Component\HttpFoundation\Response;

class Wechat
{

	private $_container;

	private $_router;

	private $_session;
	
	/** 
	* wechat_construct
	* 
	* @construct
	* @param mixed $container 
	* @since 1.0 
	*/  
	function __construct($container) {
		$this->_container = $container;
		$this->_router = $this->_container->get('router');
		$this->_session = $this->_container->get('session');
		//echo $this->_container->get('session')->get('aaa');exit;
	}

	/** 
	* wechat_oauth userinfo
	* 
	* @access public
	* @param mixed $redirecturl  callBackUrl 
	* @since 1.0 
	* @return RedirectResponse
	*/  
	public function oauthUserinfo($redirecturl) {
		$callback = $this->_router
				  		 ->generate('same_wechat_callback_userinfo', 
						  	          array(
						  	          	'redirecturl'=> $redirecturl
						  	          ), 
				  	         		  true);
		$http_data = array();
		$http_data['appid'] = $this->_container->getParameter('appid');
		$http_data['redirect_uri'] = $callback;
		$http_data['response_type'] = 'code';
		$http_data['scope'] = 'snsapi_userinfo';
		$http_data['state'] = 'STATE';
		return new RedirectResponse('https://open.weixin.qq.com/connect/oauth2/authorize?' . http_build_query($http_data) . '#wechat_redirect', 302);
	}

	/** 
	* wechat_oauth base
	* 
	* @access public
	* @param mixed $redirecturl  callBackUrl 
	* @since 1.0 
	* @return RedirectResponse
	*/ 
	public function oauthBase($redirecturl) {
		$callback = $this->_router
				  		 ->generate('same_wechat_callback_base', 
						  	          array(
						  	          	'redirecturl'=> $redirecturl
						  	          ), 
						  	          true);
		$http_data = array();
		$http_data['appid'] = $this->_container->getParameter('appid');
		$http_data['redirect_uri'] = $callback;
		$http_data['response_type'] = 'code';
		$http_data['scope'] = 'snsapi_base';
		$http_data['state'] = 'STATE';
		return new RedirectResponse('https://open.weixin.qq.com/connect/oauth2/authorize?' . http_build_query($http_data) . '#wechat_redirect', 302);
	}

	/** 
	* wechat_access_token
	* get access_token
	* @access private
	* @since 1.0 
	* @return string $access_token
	*/ 
	private function getAccessToken() {
		$rs = file_get_contents('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='.$this->_container->getParameter('appid').'&secret='.$this->_container->getParameter('appsecret'));
		$rs = json_decode($rs,true);
		if(isset($rs['access_token'])){
			return $rs['access_token'];
		}
		throw new Exception($rs['errcode']);
		return;	
	}

	/** 
	* wechat_js_sdk
	* get js ticket
	* @access private
	* @since 1.0 
	* @return json $access_token
	*/ 
	private function getJsTicket($url) {
		$appid = $this->_container->getParameter('appid');
		$appsecret = $this->_container->getParameter('appsecret');
		$time = $this->_container->getParameter('wechat_server_time');
		$access_token = $this->_container->getParameter('wechat_server_accesstoken');
		$ticket = $this->_container->getParameter('wechat_server_ticket');
		if(time() - $time >= 1800){
			//token过期重新获取
			$access_token = $this->getAccessToken();
			//获取ticket
			$ticketfile = file_get_contents("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" . $access_token . "&type=jsapi");
			$ticketfile = json_decode($ticketfile, true);
			$ticket = $ticketfile['ticket'];
			$time = time();
			$this->_container->setParameter('wechat_server_time', $time);
			$this->_container->setParameter('wechat_server_accesstoken', $access_token);
			$this->_container->setParameter('wechat_server_ticket', $ticket);
			
		}
		$str = '1234567890abcdefghijklmnopqrstuvwxyz';
		$noncestr = '';
		for($i=0;$i<8;$i++){
			$randval = mt_rand(0,35);
			$noncestr .= $str[$randval];
		}
		$ticketstr = "jsapi_ticket=" . $ticket . "&noncestr=" . $noncestr. "&timestamp=" . $time . "&url=" . $url;
		$sign = sha1($ticketstr);
		print json_encode(array("time" => $time . "", "access_token" => $access_token, "sign" => $sign));
		return new Response(json_encode($info));
	}

	/** 
	* user_access_token
	* get user's access_token
	* @access public
	* @since 1.0 
	* @return array access_token&openid
	*/ 
	public function getOauthAccessToken($code) {
		$result = file_get_contents('https://api.weixin.qq.com/sns/oauth2/access_token?code='.$code.'&grant_type=authorization_code&appid='.$this->_container->getParameter('appid').'&secret='.$this->_container->getParameter('appsecret'));
		$result = json_decode($result, true);
		if(isset($result['access_token'])){
			$this->_session->set('wechat_user_access_token', $result['access_token']);
			$this->_session->set('wechat_user_openid', $result['openid']);
		}
		return $result;
	}

	/** 
	* wechat_islogin userinfo
	* get user's login status
	* @access public
	* @since 1.0 
	* @return json access_token&openid or RedirectResponse
	*/ 
	public function isLoginUserInfo($redirecturl) {
		if($access_token = $this->_session->get('wechat_user_access_token')){
			$info = array();
			$info['access_token'] = $access_token;
			$info['openid'] = $this->_session->get('wechat_user_openid');
			return new Response(json_encode($info));
		}
		return $this->oauthUserInfo($redirecturl);
		
	}

	/** 
	* wechat_islogin base
	* get user's login status
	* @access public
	* @since 1.0 
	* @return json access_token&openid or RedirectResponse
	*/ 
	public function isLoginBase($redirecturl) {
		if($access_token = $this->_session->get('wechat_user_access_token')){
			$info = array();
			$info['access_token'] = $access_token;
			$info['openid'] = $this->_session->get('wechat_user_openid');
			return new Response(json_encode($info));		
		}
		return $this->oauthBase($redirecturl);
		
	}

}
?>