'use strict';
var loginPage = '/p2p/login.html';
var maxAsset = 1600;
var onceGetCashValue = 10;
function redirectToLoginPage(){
	window.location.href = loginPage;
}
function formatTime(timestamp){
	var date = new Date(timestamp); 
	var showTime = date.getFullYear() + '-' + (1+date.getMonth()) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
	return showTime;
}
function checkMobile(mobile){
	var mobileReg = new RegExp(/^0?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
	return mobileReg.test(mobile);
}
function isEmail(email){
	var reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
	return reg.test(email);
}
function is_weixin(){
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        return true;
    } else {
        return false;
    }
}
angular.module('personApp')
.controller('PersonCtrl',function($scope,checkLogin,$rootScope,$http,getUserAsset,getCashFlow){
	$rootScope.dialogShow = 0;
	$rootScope.isActiveGetCash = false;
	$rootScope.isActiveShare = false;
	$rootScope.isActiveSign = false;
	$rootScope.showShareTip = false;
	$rootScope.cashVal = 0;
	$rootScope.dateList = [];
	$rootScope.showTaskList = false;
	$rootScope.recordLists = [];// todo ,change
	$rootScope.totalAsset = 0;// todo ,change
	$rootScope.showGetCashDialog = 0;
	$scope.getCashInput = 0;
	$scope.mobileTip = 0;
	$scope.alipayAcountTip = 0;
	$scope.getCashTip = 0;
	var dateList = [
		{
			date:'第一天',
			money:'100',
			showSignImg:false
		},
		{
			date:'第二天',
			money:'150',
			showSignImg:false
		},
		{
			date:'第三天',
			money:'200',
			showSignImg:false
		},
		{
			date:'第四天',
			money:'250',
			showSignImg:false
		},
		{
			date:'第五天',
			money:'300',
			showSignImg:false
		}
	];
	var userData = {};
	$scope.personData = {};
	var username = store.get('username');
	checkLogin.checkLogin(username,store.get('password'),function(data){
		if(data.code !== 0){
			redirectToLoginPage();
		}else{
			userData['username'] = username;
			data = data.data[0];
			getCashFlow.getCashFlow({limit:5,order:'create_time DESC',where:{user_id:data.id}},function(data){ 
				if(data.code !== 0){ 
					alert('获取现金流不成功'); 
				}else{ 
					$rootScope.recordLists = _.each(data.data,function(data){ 
						data.showTime = formatTime(data.create_time);
						return data; 
					}); 
				} 
			});
			if(!data.shared){
				if(store.get('uploadshare')){			
					$http({
						url:'/api/aimibao_users/user_share',
						method:'POST',
						data:{username:store.get('username')}
					}).success(function(data){
						//todo,update 总资产和现金流
						var assetAll = $rootScope.totalAsset;
						assetAll += 100;
						$rootScope.totalAsset = assetAll;
						var cashFlowList = $rootScope.recordLists;
						data.rData.data.cashflow.showTime = formatTime(data.rData.data.cashflow.create_time);
						cashFlowList.splice(0,0,data.rData.data.cashflow);
						$rootScope.recordLists = cashFlowList;
					}).error(function(data){
						$rootScope.isActiveShare = true;
						console.log(data);
					});	
				}else{
					$rootScope.isActiveShare = true;
				}		
			}
			if(!data.sign_day){
				$rootScope.isActiveSign = true;
				data.sign_day = 0;
			}
			//展示dateList
			for(var i = 0 ; i < data.sign_day ; i++){
				dateList[i]['showSignImg'] = true;
			}
			$rootScope.dateList = dateList;

			$rootScope.showTaskList = true;
			$rootScope.userInfo = data;
			getUserAsset.getUserAsset({where:{"user_id":data.id}},function(data){
				if(data.code !== 0){
					alert('获取用户个人资产数据不成功');
				}else{
					data = data.data[0];
					$rootScope.totalAsset = userData['totalAsset'] = data.principal + data.sum_earnings;
					userData['sumEarning'] = data.sum_earnings;
					userData['yesterdayEaring'] = data.yesterday_income;
					$rootScope.cashVal = data.sum_earnings;
					if(data.sum_earnings >= 3){
						$rootScope.isActiveGetCash = true;
					}				
				}
				$scope.personData = userData;
			})
		}
	});
	$scope.closeGetCashDialog = function(){
		$rootScope.showGetCashDialog = 0;
		$rootScope.dialogShow = 0;
	}
	$scope.getAllEarn = function(){
		$scope.getCashInput = userData['sumEarning'];
	}
	$scope.checkMobile = function(){
		var mobile = $scope.getUserMobile;
		if(checkMobile(mobile)){
			$scope.mobileTip = 0;
		}else{
			$scope.mobileTip = 1;
		}
	}
	$scope.checkEmail = function(){
		var email = $scope.getAlipayAcount;
		if(isEmail(email) || checkMobile(email)){
			$scope.alipayAcountTip = 0;
		}else{
			$scope.alipayAcountTip = 1;
		}
	}
	$scope.checkGetCash = function(){
		if(isNaN($scope.getCashInput)){
			$scope.getCashTip = 1;
		}else{
			$scope.getCashTip = 0;
		}		
	}
	$scope.$watch('getCashInput',function(){
		var currentVal = $scope.getCashInput;		
		if(currentVal < 0){
			currentVal = 0
		}else if(currentVal >= userData['sumEarning']){
			currentVal = userData['sumEarning']
		}else if(currentVal >= onceGetCashValue){
			currentVal = onceGetCashValue;
		}
		$scope.getCashInput = currentVal;
	})
	$scope.updateGetCash = function(){
		if($scope.alipayAcountTip === 1 || $scope.mobileTip === 1 || $scope.getCashTip === 1){
			return;
		}
		$http({
			url:'/api/aimibao_users/withdraw_cash',
			method:'POST',
			data:{username:store.get('username'),password:store.get('password'),userearn:$scope.getCashInput,alipayacount:$scope.getAlipayAcount,mobile:$scope.getUserMobile}
		}).success(function(data){
			console.log(data);
			//更新现金流
			$rootScope.totalAsset -= data.rData.data.asset.factCash;
			$scope.personData.sumEarning -= data.rData.data.asset.factCash;
			var cashFlowList = $rootScope.recordLists;
			data.rData.data.cashflow.showTime = formatTime(data.rData.data.cashflow.create_time);
			cashFlowList.splice(0,0,data.rData.data.cashflow);
			$rootScope.recordLists = cashFlowList;
			$scope.closeGetCashDialog();
		}).error(function(data){
			console.log(data);
			alert("更新提现信息失败了，请重试");
		})
		// console.log({userearn:$scope.getCashInput,alipayacount:$scope.getAlipayAcount,mobile:$scope.getUserMobile})
	}
})
.controller('TaskListCtrl',function($scope,$http,$rootScope) {
	$scope.signDialog = 0;
	var signing = false;
	$scope.signHander = function(){
		if($rootScope.userInfo.sign){
			if($rootScope.userInfo.sign_day >=5){
				alert('已签到满五天了');
				return;
			}
			if(new Date($rootScope.userInfo.sign).isToday()){			
				$scope.todayCash = $rootScope.dateList[$rootScope.userInfo.sign_day - 1].money;
				$scope.tomorrowCash = $rootScope.dateList[$rootScope.userInfo.sign_day].money;
				$scope.signDialog = 1;
				$rootScope.dialogShow = 1;
			}else{
				doSign();
			}					
		}else{
			doSign();
		}	
	}
	function doSign(){
		if(signing){
			return;
		}
		signing = true;
		$http({
			url:'/api/aimibao_users/user_sign',
			method:'POST',
			data:{username:store.get('username')}
		}).success(function(data){
			signing = false;
			//计算已领本金
			var currentSignDate = $rootScope.userInfo.sign_day ? $rootScope.userInfo.sign_day+1 : 1;
			$scope.todayCash = $rootScope.dateList[currentSignDate - 1].money;
			$scope.tomorrowCash = $rootScope.dateList[currentSignDate].money;			
			$rootScope.dateList[currentSignDate-1]['showSignImg'] = true;
			//todo,update 总资产和现金流,给当天贴上已签到标签
			var assetAll = $rootScope.totalAsset;
			assetAll += parseInt($scope.todayCash);
			$rootScope.totalAsset = assetAll;
			var cashFlowList = $rootScope.recordLists;
			data.rData.data.cashflow.showTime = formatTime(data.rData.data.cashflow.create_time);
			cashFlowList.splice(0,0,data.rData.data.cashflow);
			$rootScope.recordLists = cashFlowList;
			$rootScope.isActiveSign = false;
			//show dialog
			$scope.signDialog = 1;
			$rootScope.dialogShow = 1;
		}).error(function(data){
			console.log(data);
			signing = false;
			if(data.error && (data.error.code === -2)){
				alert(data.error.msg);
			}else{
				alert('服务器繁忙，请重试');
			}	
		});
	}
	$scope.closeSignDialog = function(){
		$scope.signDialog = 0;
		$rootScope.dialogShow = 0;
	}
	$scope.getCashBtn = function(){
		if($rootScope.isActiveGetCash){
			//todo 提现popup
			$rootScope.showGetCashDialog = 1;
			$rootScope.dialogShow = 1;
		}else{			
			alert('收益必须满3元才能提现');
		}
		
	}
	$scope.getSignCoin = function(){
		if($rootScope.isActiveSign){
			//todo 提示新手签到
			$scope.signHander();
		}else{
			alert('你已经做了新手签到零钱任务');
		}		
	}
	$scope.getShareCoin = function(){
		if(!is_weixin()){
			return alert('请通过微信打开使用分享功能');
		}
		if($rootScope.isActiveShare){
			$rootScope.showShareTip = true;
			store.set('userClickShareBtn',1);
			//todo 提示分享
		}else{
			alert('你已经领过分享奖励了');
		}
	}
});