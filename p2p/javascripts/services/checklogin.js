'use strict';
angular.module('myApp.checkLogin',[])
.factory('checkLogin',function($http){
	return {
		checkLogin:function(userName,password,cbf){
			if(!userName || !password){
				cbf && cbf({code:-1,msg:'no login'});
				return;
			}
			$http({
				url:'/api/aimibao_users',
				method:'GET',
				params:{filter:{where:{username:userName,password:password}}}
			}).success(function(data){
				if(data.length){
					cbf && cbf({code:0,msg:'login'});
				}else{
					cbf && cbf({code:-1,msg:'no login'});
				}
			}).error(function(data){
				cbf && cbf({code:-1,msg:'netword error or server error'});
			});
		}
	}
	
});