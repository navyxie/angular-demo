'use strict';
angular.module('loginApp',[]).controller('LoginCtrl',function($scope,$rootScope){
	var defaultPercent = '50%';
	$rootScope.dialogState = 0;
	$rootScope.currentProcess = $rootScope.leftPercent = defaultPercent;
	$rootScope.showLoginDialog = function(){
		$rootScope.dialogState = 1;
	}	
	$rootScope.closeDialog = function(){
		$rootScope.dialogState = 0;
	}
}).controller('LoginDialogCtrl',function($scope,$rootScope,$http) {
	var isRegistered = false;
	var registerTip = "";
	var isGetUserName = false;
	var ableRegister = true;
	$scope.userNameTip = $scope.pswTip = 1;
	$scope.userName = $scope.userPassword = "";
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
		}
		if(isRegistered){
			registerTip = "账号已存在，请更换";
			ableRegister = false;
		}
		if(!ableRegister){
			alert(registerTip);
			return;
		}
		$http({
			url:'/api/aimibao_users',
			method:'POST',
			data:{username:$scope.userName,password:$scope.userPassword}
		}).success(function(data){
			$scope.resetDialog();
			//todo check username exists @leo; and redirect to person.html
		}).error(function(data){
			console.log(data);
			alert('服务器繁忙，请重试');
		});
	}
	$scope.resetDialog = function(){
		$rootScope.dialogState = 0;
		$scope.userName = $scope.userPassword = "";
		$scope.userNameTip = $scope.pswTip = 1;
	}	
	$scope.cancelBubble = function(e) {
		e.stopPropagation();
	}
});