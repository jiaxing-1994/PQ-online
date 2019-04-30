window.httpRquest = sessionStorage.getItem('httpRquest'); //请求域名 api地址
window.imgHttp = ''; //图片 web地址
window.payHttp = ''; //支付 pay地址
window.environment = 'build'; //test测试环境  build正式环境

if(sessionStorage.getItem('httpRquest')&&sessionStorage.getItem('imgHttp')&&sessionStorage.getItem('payHttp')){
	httpRquest = sessionStorage.getItem('httpRquest');
	imgHttp = sessionStorage.getItem('imgHttp');
	payHttp = sessionStorage.getItem('payHttp');
}else{
	$.ajax({
		method:'get',
		url:'https://t9yxn3sp.api.lncld.net/1.1/classes/domain',
		headers:{
			'X-LC-Id':'t9yxn3sPQlDjkjEip2C2njdz-gzGzoHsz',
			'X-LC-Key':'fPMiAwI5MiUytaCwcDDlvxE2',
		},
		timeout:5000,
		async:false,
		success:function(res){
			console.log(res);
			for(var i=0;i<res.results.length;i++){
				if(environment == res.results[i].type){
					if(res.results[i].domainType == 'api'){
						httpRquest = res.results[i].domain;
						sessionStorage.setItem('httpRquest',httpRquest);
					}else if(res.results[i].domainType == 'web'){
						imgHttp = res.results[i].domain;
						sessionStorage.setItem('imgHttp',imgHttp);
					}else if(res.results[i].domainType == 'pay'){
						payHttp = res.results[i].domain;
						sessionStorage.setItem('payHttp',payHttp);
					}
				}
			}
			console.log(imgHttp);
		},
		error:function(){
			$.ajax({
				method:'get',
				url:'https://api2.bmob.cn/1/classes/domain',
				headers:{
					'X-Bmob-Application-Id':'0cdd6ae842b7ba6a1d01943abafbc4af',
					'X-Bmob-REST-API-Key':'8c745e5a4e22b00daa2820ad851a2d80',
					'Content-Type':'application/json'
				},
				timeout:5000,
				async:false,
				success:function(res){
					console.log(res);
					for(var i=0;i<res.results.length;i++){
						if(environment == res.results[i].type){
							if(res.results[i].domainType == 'api'){
								httpRquest = res.results[i].domain;
								sessionStorage.setItem('httpRquest',httpRquest);
							}else if(res.results[i].domainType == 'web'){
								imgHttp = res.results[i].domain;
								sessionStorage.setItem('imgHttp',imgHttp);
							}else if(res.results[i].domainType == 'pay'){
								payHttp = res.results[i].domain;
								sessionStorage.setItem('payHttp',payHttp);
							}
						}
					}
					console.log(imgHttp);
				},
				error:function(){
					httpRquest = 'https://apipt.dktai.cn';
					sessionStorage.setItem('httpRquest',httpRquest);
					imgHttp = 'https://webpt.dktai.cn';
					sessionStorage.setItem('imgHttp',imgHttp);
					payHttp = 'https://paypt.dktai.cn';
					sessionStorage.setItem('payHttp',payHttp);
				}
			})
		}
	})
}

window.request = {
	get:'',
	post:'',
	all:'',
}
request.get = function(){
	var url = '';//请求地址
	var params = {};//请求参数
	var headers = {};//请求头
	var timeOut = '';//请求超时
	for(var i=0,len=arguments.length;i<len;i++){
		if(typeof(arguments[i]) == 'string'&&arguments[i].indexOf('/')!=-1){
			//请求时地址
			url = arguments[i];
		}
		if(i==1&&typeof(arguments[i]) == 'object'){
			//参数
			params = arguments[i];
		}
		if(i==2&&typeof(arguments[i]) == 'object'){
			//参数
			headers = arguments[i];
		}
		if(typeof(arguments[i]) == 'number'){
			//超时
			timeOut = arguments[i];
		}
	}
	if(url == ''){
		console.log('请传入接口地址');
		return;
	}
	var api = httpRquest+url;
	if(JSON.stringify(params) != '{}'){
		api = api+'?'
		for(var i in params){
			api+= i+'='+params[i]+'&';
		}
		api = api.substr(0,api.length-1);
	}
	return new Promise((resolve,reject) => {
		axios.get(api,params,{
			headers:headers
		}).then(response => {
			resolve(response.data);
		}).catch(err => {
			reject(err);
		})
	})
}
request.post = function(){
	var url = '';//请求地址
	var params = {};//请求参数
	var headers = {};//请求头
	var timeOut = 5000;//请求超时
	for(var i=0,len=arguments.length;i<len;i++){
		if(typeof(arguments[i]) == 'string'&&arguments[i].indexOf('/')!=-1){
			//请求时地址
			url = arguments[i];
		}
		if(i==1&&typeof(arguments[i]) == 'object'){
			//参数
			params = arguments[i];
		}
		if(i==2&&typeof(arguments[i]) == 'object'){
			//参数
			headers = arguments[i];
		}
		if(typeof(arguments[i]) == 'number'){
			//超时
			timeOut = arguments[i];
		}
	}
	if(url == ''){
		console.log('请传入接口地址');
		return;
	}
	params = jsonToFrom(params);
	var api = httpRquest+url;
	return new Promise((resolve,reject) => {
		axios.post(api,params,{
			headers:headers,
			timeout:timeOut
		}).then(response => {
			resolve(response.data);
			if(response.data.code == '401'){
				setTimeout(function(){
					localStorage.removeItem("secret");
					localStorage.removeItem("token");
					localStorage.removeItem('userInfo');
					var urlParams = {};
					if(GetURLParam()){
						urlParams = GetURLParam();
					}
					urlParams.backPage = '/PQ/pages/my/my.html';
					console.log(urlParams);
					pushRoute({
						page:'/PQ/pages/my/login/login.html',
						params:urlParams
					})
				},1000);
			}
		}).catch(err => {
// 			layer.msg('系统异常',{
// 				time:1500,
// 			})
			reject(err);
		})
	})
}
function jsonToFrom(data) {
	let res = new FormData();
	for (let i in data)
		res.append(i, data[i]);
	return res;
}