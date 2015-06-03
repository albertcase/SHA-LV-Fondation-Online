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
		$this->_memcache = $this->_container->get('same.memcached');
		//echo $this->_container->get('session')->get('aaa');exit;
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

		$http_data = array();
		$http_data['grant_type'] = 'client_credential';
		$http_data['appid'] = $this->_container->getParameter('appid');
		$http_data['secret'] = $this->_container->getParameter('appsecret');
		$rs = file_get_contents($this->_container->getParameter('tokenApiUrl') . http_build_query($http_data));
		$rs = json_decode($rs,true);
		if(isset($rs['access_token'])){
			return $rs['access_token'];
		}
		return $rs['errcode'];
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
		if(time() - $time >= 1800){
			$access_token = $this->getAccessToken();
			$http_data = array();
			$http_data['access_token'] = $access_token;
			$http_data['type'] = 'jsapi';
			$ticketfile = file_get_contents($this->_container->getParameter('ticketApiUrl') . http_build_query($http_data));
			$ticketfile = json_decode($ticketfile, true);
			$ticket = $ticketfile['ticket'];
			$time = time();
			$this->_memcache->set('wechat_server_time', $time);
			$this->_memcache->set('wechat_server_ticket', $ticket);
			
		}
		$str = '1234567890abcdefghijklmnopqrstuvwxyz';
		$noncestr = '';
		for($i=0;$i<8;$i++){
			$randval = mt_rand(0,35);
			$noncestr .= $str[$randval];
		}
		$ticket_data = array();
		$ticket_data['jsapi_ticket'] = $ticket;
		$ticket_data['noncestr'] = $noncestr;
		$ticket_data['timestamp'] = $time;
		$ticket_data['url'] = $url;
		$sign = sha1(http_build_query($ticket_data));
		$response = new JsonResponse();
		$data = array();
		$data['appid'] = $appid;
		$data['time'] = $time;
		$data['noncestr'] = $noncestr;
		$data['sign'] = $sign;
        $response->setData($data);
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
	public function isLogin($redirecturl) {
		if($access_token = $this->_session->get('wechat_user_access_token')){
			$info = array();
			$info['access_token'] = $access_token;
			$info['openid'] = $this->_session->get('wechat_user_openid');
			$info['scope'] = $this->_session->get('wechat_user_scope');
			$response = new JsonResponse();
	        $response->setData($info);
	        return $response;
		}
		return $this->oauthUserInfo($redirecturl);
		
	}


}
?>