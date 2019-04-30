//路由栈
window.route = [];
//每次进入页面后更新路由栈
(function pageRouter(){
// 	var a = location.pathname.split('.')[0].split('\/');
// 	console.log(location.pathname);
	var b = location.pathname;
	var obj = {
		page:b
	};
	if(localStorage.getItem('routePage')){
		if(b.indexOf('home.html') != -1){
			route = [];
			route.push(obj);
			localStorage.setItem('routePage',JSON.stringify(route));
		}else{
			route = JSON.parse(localStorage.getItem('routePage'));
		}
	}else{
		if(b.indexOf('home.html') == -1){
			location.href='/PQ/pages/home/home.html';
			return;
		}
		route.push(obj);
		localStorage.setItem('routePage',JSON.stringify(route));
	}
	if(route.length>0&&route[route.length-1].page == b){
		return;
	}
	route.push(obj);
	if(b.indexOf('home.html') != -1||b.indexOf('quato.html') != -1||b.indexOf('trade.html') != -1||b.indexOf('discover.html') != -1||b.indexOf('my.html') != -1){
		for(var i=0;i<route.length;i++){
			if(route[i].page.indexOf('home.html')==-1&&route[i].page.indexOf('quato.html')==-1&&route[i].page.indexOf('trade.html')==-1&&route[i].page.indexOf('discover.html')==-1&&route[i].page.indexOf('my.html')==-1){
				console.log(route[i].page);
				route.splice(i,1);
				i--;
			}
		}
	}
	localStorage.setItem('routePage',JSON.stringify(route));
})();
//路由方法
window.pushRoute = function pushRoute(obj){
	var isExist = false;
	var page = obj.page.split('/')[obj.page.split('/').length - 1];
	for(var i=route.length-1;i>=0;i--){
		if(route[i].page.indexOf(page) != -1){
			isExist = true;
			route = route.slice(0,i+1);
			break;
		}
	}
	if(isExist){
		localStorage.setItem('routePage',JSON.stringify(route));
		var url = route[route.length-1].page;
	}else{
		var url = obj.page;
	}
	if(obj.params){
		var params = '?';
		for(var i in obj.params){
			params += (i+'='+obj.params[i]+'&');
		}
		params = params.slice(0,params.length-1);
		url += params;
	}
	location.href=url;
};
//替换
window.replaceRoute = function replaceRoute(obj){
	route.splice(route.length-1,1);
	localStorage.setItem('routePage',JSON.stringify(route));
	var url=obj.page;
	if(obj.params){
		console.log(obj.params);
		var params = '?';
		for(var i in obj.params){
			params += (i+'='+obj.params[i]+'&');
		}
		params = params.slice(0,params.length-1);
		console.log(params);
		url += params;
	}
	location.href = url;
};
//返回上一页
window.backRoute = function backRoute(){
	if(arguments.length>0){
		var obj = arguments[0];
		if(obj.backPage){
			//指定返回页面
			var isExist = false;
			var page = obj.backPage.split('/')[obj.backPage.split('/').length - 1];
			for(var i=route.length-1;i>0;i--){
				if(route[i].page.indexOf(page) != -1){
					isExist = true;
					route = route.slice(0,i+1);
					break;
				}
			}
			if(isExist){
				localStorage.setItem('routePage',JSON.stringify(route));
				var url = route[route.length-1].page;
			}else{
				var url = obj.backPage;
			}
		}else{
			//带参数普通返回
			var page=route[route.length-2];
			route.splice(route.length-1,1);
			localStorage.setItem('routePage',JSON.stringify(route));
			var url=page.page;
		}
		if(obj.params){
			var params = '?';
			for(var i in obj.params){
				params += (i+'='+obj.params[i]+'&');
			}
			params = params.slice(0,params.length-1);
			url += params;
		}
	}else{
		//不带参数普通返回
		var page=route[route.length-2];
		route.splice(route.length-1,1);
		localStorage.setItem('routePage',JSON.stringify(route));
		var url=page.page;
	}
	location.href = url;
};
