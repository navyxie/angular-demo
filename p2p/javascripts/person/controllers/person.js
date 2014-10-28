'use strict';
angular.module('personApp',[])
.controller('PersonCtrl',function($scope){
	var testData = {
		username : 'Navy',
		totalAsset : '653.13',//principal+sum_earnings
		sumEarning:1.3,
		yesterdayEaring:0.5
	};
	$scope.personData = testData;
})
.controller('TaskListCtrl',function($scope,$http) {
	$scope.dateList = [
		{
			date:'第一天',
			money:'100'
		},
		{
			date:'第二天',
			money:'150'
		},
		{
			date:'第三天',
			money:'200'
		},
		{
			date:'第四天',
			money:'250'
		},
		{
			date:'第五天',
			money:'300'
		}
	]
	$scope.signHander = function(){
		alert(1);
	}
})
.controller('RewardCtrl',function($scope,$http) {
	$scope.recordLists = [
		{
			time:'10-20 9:13',
			money:'100',
			text:'本金'
		},
		{
			time:'10-20 9:13',
			money:'0.13',
			text:'收益'
		},
		{
			time:'10-20 9:13',
			money:'0.13',
			text:'收益'
		},
		{
			time:'10-20 9:13',
			money:'0.13',
			text:'收益'
		},
		{
			time:'10-20 9:13',
			money:'200',
			text:'本金'
		}
	];
	$scope.cashVal = '0.31';
	$scope.getCashBtn = function(){
		alert('提现');
	}
	$scope.getSignCoin = function(){
		alert('签到领本金');
	}
	$scope.getShareCoin = function(){
		alert('分享领本金');
	}
});