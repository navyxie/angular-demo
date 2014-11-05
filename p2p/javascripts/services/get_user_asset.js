'use strict';
angular.module('myApp.getUserAsset',[])
.factory('getUserAsset',function($http){
	return {
		getUserAsset:function(options,cbf){
			options = options || {};
			$http({
				url:'/api/aimibao_user_assets',
				method:'GET',
				params:{filter:options}
			}).success(function(data){
				cbf && cbf({code:0,data:data});
			}).error(function(data){
				cbf && cbf({code:-1,data:data});
			});
		}
	}
})