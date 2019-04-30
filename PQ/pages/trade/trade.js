var trade = new Vue({
	el:'#trade',
	data:{
		urlParams:{},
		phoneCustomer:'',
		onlineCustomer:'',
		qqCustomer:'',
		wechatCustomer:'',
	},
	mounted() {
		mui.init();
		mui('.mui-scroll-wrapper').scroll();
		mui('body').on('tap','.mui-tab-item',function(){
			if(this.href){
				if(this.href.indexOf('trade.html') != -1){
					if(localStorage.getItem('userInfo')&&localStorage.getItem('chooseContract')){
						localStorage.setItem('tradeType',1);
						pushRoute({
							page:'/PQ/pages/quato/quatoDetail/quatoDetail.html',
							params:{
								tradeTabIndex:5
							}
						});
					}else{
						localStorage.setItem('tradeType',1);
						pushRoute({
							page:this.href
						});
					}
				}else{
					localStorage.setItem('tradeType',1);
					pushRoute({
						page:this.href
					});
				}
			}
		});
		this.getCustomerData();
		mui('.mui-scroll-wrapper').scroll();
		layui.use('layer',function(){
			var layer = layui.layer;
		});
		this.urlParams = GetURLParam()&&GetURLParam();
		console.log(this.urlParams)
	},
	methods:{
		//客服弹窗
		customLayer(){
			var index = layer.open({
				type:1,
				content:$('#customLayer'),
				area:['8rem','5.33rem'],
				shadeClose:true,
				title:false,
				closeBtn:0
			});
		},
		goToPage(path){
			var params = {};
			params.loginBackPage = '/PQ/pages/quato/quatoDetail/quatoDetail.html';
			params.tradeTabIndex = 5;
			if(this.urlParams.type==0){
				localStorage.setItem('tradeType',0);
			}else{
				localStorage.setItem('tradeType',1);
			}
			pushRoute({
				page:path,
				params:params,
			})
		},
		//获取客服地址
		getCustomerData(){
			request.post('/customerContacts')
			.then((res)=>{
				console.log(res);
				if(res.success&&res.code=='010'){
					for(var i=0;i<res.data.length;i++){
						if(res.data[i].customerName == '电话客服'){
							this.phoneCustomer = res.data[i].contactWay;
						}else if(res.data[i].customerName == '在线客服'){
							this.onlineCustomer = res.data[i].contactWay;
						}else if(res.data[i].customerName == 'qq客服'){
							this.qqCustomer = res.data[i].contactWay;
						}else if(res.data[i].customerName == '微信客服'){
							this.wechatCustomer = res.data[i].contactWay;
						}
					}
				}else{
					layer.msg(res.message,{
						time:1500
					});
				}
			}).catch((err)=>{
				console.log(err);
			})
		},
		chooseCustomer(text){
			if(text=='电话客服'){
				if(this.phoneCustomer==''){
					layer.msg('暂无电话客服',{
						time:1500
					});
					return;
				}
				window.location.href = 'tel://' + this.phoneCustomer;
			}else{
				var webviewUrl='';
				if(text=='在线客服'){
					if(this.phoneCustomer==''){
						layer.msg('暂无在线客服',{
							time:1500
						});
						return;
					}
					webviewUrl = this.onlineCustomer;
				}else if(text=='qq客服'){
					if(this.phoneCustomer==''){
						layer.msg('暂无qq客服',{
							time:1500
						});
						return;
					}
					webviewUrl = this.qqCustomer;
				}else if(text=='微信客服'){
					if(this.phoneCustomer==''){
						layer.msg('暂无微信客服',{
							time:1500
						});
						return;
					}
					webviewUrl = this.wechatCustomer;
				}
				pushRoute({
					page:'/PQ/pages/webview/webview.html',
					params:{
						title:text,
						url:webviewUrl
					}
				})
			}
		}
	}
})