'use strict';
angular.module('myApp.getCashFlow',[])
.factory('getCashFlow',function($http){
	return {
		getCashFlow:function(options,cbf){
			options = options || {};
			$http({
				url:'/api/aimibao_cashflows',
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