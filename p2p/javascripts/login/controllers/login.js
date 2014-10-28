'use strict';
var personPage = '/p2p/person.html';
function redirectToPersonPage(){
	window.location.href = personPage;
}
angular.module('loginApp',['myApp.checkLogin']).controller('LoginCtrl',function($scope,$rootScope,checkLogin){
	var defaultPercent = '50%';
	$rootScope.dialogState = 0;
	$rootScope.currentProcess = $rootScope.leftPercent = defaultPercent;
	$rootScope.showLoginDialog = function(){
		$rootScope.dialogState = 1;
	}	
	$rootScope.closeDialog = function(){
		$rootScope.dialogState = 0;
	}
	checkLogin.checkLogin(store.get('username'),store.get('password'),function(data){
		if(data.code === 0){
			redirectToPersonPage();
		}
	});
}).controller('LoginDialogCtrl',function($scope,$rootScope,$http,checkLogin) {
	var text1 = '登录',text2 = '注册';
	var isRegistered = false;
	var registerTip = "";
	var isGetUserName = false;
	var ableRegister = true;
	$scope.userNameTip = $scope.pswTip = 1;
	$scope.userName = $scope.userPassword = "";
	$scope.showRegisterTip = 1;
	$scope.showSignTip = 0;
	$scope.showName = text1;
	$scope.checkName = function(){
		$http({
			url:'/api/aimibao_users',
			method:'GET',
			params:{filter:{where:{username:$scope.userName}}}
		}).success(function(data){
			if(data.length){
				isRegistered = true;
				$scope.userNameTip = 0;
			}else{
				isRegistered = false;
				$scope.userNameTip = 1;
			}
		}).error(function(data){
			console.log(data);
			alert('网络不好，请重试');
		});
	}
	$scope.register = function(){
		if(!$scope.userPassword){
			registerTip = "密码不能为空";
			ableRegister = false;
		}
		if($scope.userPassword.length < 6 || $scope.userPassword.length > 12){
			registerTip = "密码长度在6-12之间";
			ableRegister = false;
			$scope.pswTip = 0;
		}else{
			$scope.pswTip = 1;
			ableRegister = true;
		}
		if(isRegistered){
			registerTip = "账号已存在，请更换";
			ableRegister = false;
		}
		if(!ableRegister){
			alert(registerTip);
			return;
		}
		if($scope.showName === text1){
			$http({
				url:'/api/aimibao_users',
				method:'POST',
				data:{username:$scope.userName,password:md5($scope.userPassword)}
			}).success(function(data){			
				store.set('username',$scope.userName);
				store.set('password',md5($scope.userPassword));
				$scope.resetDialog();
				redirectToPersonPage();
				//todo check username exists @leo; and redirect to person.html
			}).error(function(data){
				console.log(data);
				if(data.error.code === 11000 && data.error.err.indexOf('insertDocument :: caused by :: 11000 E11000 duplicate key error index') !== -1){
					alert('账号已存在，请更换');
				}else{
					alert('服务器繁忙，请重试');
				}		
			});
		}else if($scope.showName === text2){
			checkLogin.checkLogin($scope.userName,md5($scope.userPassword),function(data){
				if(data.code === 0){
					redirectToPersonPage();
				}else{
					console.log('login error:',data);
					alert(data.msg);
				}
			})
		}	
	}
	$scope.resetDialog = function(){
		$rootScope.dialogState = 0;
		$scope.userName = $scope.userPassword = "";
		$scope.userNameTip = $scope.pswTip = 1;
	}	
	$scope.cancelBubble = function(e) {
		e.stopPropagation();
	}
	$scope.changeLogin = function(){
		if($scope.showName === text1){
			$scope.showName = text2;
			$scope.showRegisterTip = 0;
			$scope.showSignTip = 1;
		}else{
			$scope.showName = text1;
			$scope.showRegisterTip = 1;
			$scope.showSignTip = 0;
		}	
	}
});