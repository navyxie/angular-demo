'use strict';
angular.module('myApp.getProduct',[])
.factory('getProduct',function($http){
	return {
		getProduct:function(options,cbf){
			options = options || {};
			$http({
				url:'/api/aimibao_products',
				method:'GET',
				params:{filter:options}
			}).success(function(data){
				cbf && cbf({code:0,data:data});
			}).error(function(data){
				cbf && cbf({code:-1,data:data});
			});
		}
	}
});