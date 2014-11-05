'use strict';
var personPage = '/p2p/person.html';
var totalAmount = 100000;
function redirectToPersonPage(){
	window.location.href = personPage;
}
angular.module('loginApp').controller('LoginCtrl',function($scope,$rootScope,checkLogin,getProduct){
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
	getProduct.getProduct({limit:1},function(data){
		if(data.code === 0){
			var amountData = data.data[0];
			if(amountData.amount_total <= 0){
				$rootScope.currentProcess = $rootScope.leftPercent = "0%";
			}else{
				var floatLeft = amountData.amount_total/totalAmount;
				floatLeft = floatLeft/2 + 0.5;
				floatLeft = (floatLeft.toFixed(3))*100;
				floatLeft = floatLeft.toFixed(1);
				$rootScope.currentProcess = $rootScope.leftPercent = ''+floatLeft+'%';
			}		
		}else{
			console.log(data);
			alert('获取产品信息失败');
		}
	})
}).controller('LoginDialogCtrl',function($scope,$rootScope,$http,checkLogin) {
	var text1 = '登录',text2 = '注册',text3 = '已',text4 = '没';
	var isRegistered = false;
	var registerTip = "";
	var isGetUserName = false;
	var ableRegister = true;
	$scope.userNameTip = $scope.pswTip = 1;
	$scope.userName = $scope.userPassword = "";
	$scope.showRegisterTip = 1;
	$scope.showSignTip = 0;
	$scope.showName = text1;
	$scope.hasAccountText = text3;
	$scope.checkName = function(){
		if($scope.showName === text2){
			return;
		}
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
				url:'/api/aimibao_users/create_user',
				method:'POST',
				data:{username:$scope.userName,password:md5($scope.userPassword)}
			}).success(function(data){
				setUserInfoToLocal($scope.userName,md5($scope.userPassword));			
				$scope.resetDialog();
				redirectToPersonPage();
				//todo check username exists @leo; and redirect to person.html
			}).error(function(data){
				console.log(data);
				if((data.error.code === 11000 && data.error.err.indexOf('insertDocument :: caused by :: 11000 E11000 duplicate key error index') !== -1) || data.error.status === 422){
					alert('账号已存在，请更换');
				}else{
					alert('服务器繁忙，请重试');
				}		
			});
		}else if($scope.showName === text2){
			checkLogin.checkLogin($scope.userName,md5($scope.userPassword),function(data){
				if(data.code === 0){
					setUserInfoToLocal($scope.userName,md5($scope.userPassword));
					redirectToPersonPage();
				}else{
					console.log('login error:',data);
					alert('请确认账号和密码是否正确');
					// alert(data.msg);
				}
			})
		}	
	}
	function setUserInfoToLocal(username,password){
		store.set('username',username);
		store.set('password',password);
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
			$scope.hasAccountText = text4;
		}else{
			$scope.showName = text1;
			$scope.showRegisterTip = 1;
			$scope.showSignTip = 0;
			$scope.hasAccountText = text3;
		}	
		$scope.userNameTip = $scope.pswTip = 1;
		ableRegister = true;
		isRegistered = false;
	}
}).controller('CashFlowCtrl',function($scope,getCashFlow){
	$scope.cashFlowLists = [];
	getCashFlow.getCashFlow({limit:5,order:'create_time DESC',},function(data){
		if(data.code === 0){
			//todo
			$scope.cashFlowLists = _.each(data.data,function(data){
				var date = new Date(data.create_time);
				data.showTime = date.getFullYear() + '-' + (1+date.getMonth()) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
			 	return data;
			});
		}else{
			console.log(data);
			alert('获取现金流数据不成功');
		}
	})
});