var home = new Vue({
	el:'#home',
	data:{
		quatoList:[], //行情列表
		bannerList:[],
		bannerIndex:0, //banner索引
		notice:{
			title:'',
			content:'',
		}, //公告数据
		isShowNoticLayer:false,//是否显示首页弹窗
		addressStatus:false, //地址是否获取成功
		isLogin:isLogin, //是否登录
		imgHttp:imgHttp, //图片地址
		customerList:[],//客服数据
		isNetworkConnect:false,//网络连接状态,
		currencyRate:{},//汇率
		wxUrl:"", //微信客服地址
		wxPic:"", //微信客服图片
		quatoType:1, //行情类型 1国际 2国内
		_internationalCommodity:[],
		_domesticCommodity:[],
	},
	mounted(){
		//初始化mui
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
		layui.use('layer',function(){
			var layer = layui.layer;
		})
		this.getRate();
		this.networkChange();
		this.initScroll(1);
		this.getHomeData();
		this.getCustomerData();
		this.getAddress();
		marketStore.state.currentQuato = '';
		marketStore.state.subscribeContract = [];
	},
	computed:{
		internationalCommodity:function(){
			return marketStore.state.internationalCommodity;
		},
		domesticCommodity:function(){
			return marketStore.state.domesticCommodity;
		}
	},
	watch:{
		internationalCommodity:function(){
			var list = this.internationalCommodity;
			var _list = [];
			for(var i=0,len=list.length;i<len;i++){
				list[i].isOnTrade = this.checkTradeTime(list[i].tradingTime,list[i].notTradingTime);
				var timeList = list[i].tradingTime.split('，');
				var a = timeList[0].split('-')[0];
				var b = timeList[timeList.length - 1].split('-')[1];
				list[i].handleTime = a + '-' + b;
				_list.push(list[i]);
			}
			if(!localStorage.getItem('chooseContract')){
				localStorage.setItem('chooseContract',JSON.stringify(_list[0]));
			}
			this._internationalCommodity = _list.slice(0,5);
			// for(var i=0;i<this._internationalCommodity.length;i++){
			// 	if(this.currencyRate[this._internationalCommodity[i].currencyNo]){
			// 		this._internationalCommodity[i].usdDeposit = (this._internationalCommodity[i].deposit*this.currencyRate[this._internationalCommodity[i].currencyNo]).toFixed(this._internationalCommodity[i].dotSize);
			// 	}
			// }
			if(this.quatoType == 1){
				this.quatoList = this._internationalCommodity;
			}
		},
		domesticCommodity:function(){
			var list = this.domesticCommodity;
			var _list = [];
			for(var i=0,len=list.length;i<len;i++){
				list[i].isOnTrade = this.checkTradeTime(list[i].tradingTime,list[i].notTradingTime);
				var timeList = list[i].tradingTime.split('，');
				var a = timeList[0].split('-')[0];
				var b = timeList[timeList.length - 1].split('-')[1];
				list[i].handleTime = a + '-' + b;
				_list.push(list[i]);
			}
			if(!localStorage.getItem('chooseContract')){
				localStorage.setItem('chooseContract',JSON.stringify(_list[0]));
			}
			this._domesticCommodity = _list.slice(0,5);
			// for(var i=0;i<this._domesticCommodity.length;i++){
			// 	if(this.currencyRate[this._domesticCommodity[i].currencyNo]){
			// 		this._domesticCommodity[i].usdDeposit = (this._domesticCommodity[i].deposit*this.currencyRate[this._domesticCommodity[i].currencyNo]).toFixed(this._domesticCommodity[i].dotSize);
			// 	}
			// }
			if(this.quatoType == 2){
				this.quatoList = this._domesticCommodity.slice(0);
			}
		},
		addressStatus:function(){
			if(this.addressStatus&&this.isNetworkConnect){
				marketStore.dispatch('connectQuato');
			}
		},
		isNetworkConnect:function(){
			if(this.isNetworkConnect){
				marketStore.dispatch('connectQuato');
			}
		}
	},
	methods:{
		openWX(){
			if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) { //区分iPhone设备
				var input = document.createElement("input");
				input.value = this.wxUrl;
				document.body.appendChild(input);
				input.select();
				input.setSelectionRange(0, input.value.length);
				document.execCommand('Copy');
				document.body.removeChild(input);
				layer.msg("复制成功");
			} else {
				var ele = document.getElementById("wxUrl");
				ele.select();
				document.execCommand("Copy");
				layer.msg("复制成功");
			}
			window.location.href = "weixin://";
		},
		hideWX(){
			layer.close(this.wx);
		},
		//选择客服
		chooseCustomer(item){
			if(item.customerName == '电话客服') {
				window.location.href = 'tel://' + item.contactWay
			} else if(item.customerName == '微信客服'){
				this.wx = layer.open({
					type: 1,
					content: $('#wxLayer'),
					area: ['8rem', '9rem'],
					shadeClose: true,
					shade: 0.5,
					title: false,
					closeBtn: 0
				});
			} else{
				window.location.href = item.contactWay;

				// pushRoute({
				// 	page:'/PQ/pages/webview/webview.html',
				// 	params:{
				// 		title:item.customerName,
				// 		url:item.contactWay
				// 	}
				// })
			}
		},
		//获取客服地址
		getCustomerData(){
			request.post('/customerContacts')
			.then((res)=>{
				console.log(res);
				if(res.success&&res.code=='010'){
					this.customerList = res.data;
					this.customerList.forEach(item=>{
						if(item.customerName == '微信客服'){
							this.wxUrl = item.contactWay.split(",")[1];
							this.wxPic = item.contactWay.split(",")[0];
						}
					});
				}else{
					layer.msg(res.message,{
						time:1500
					});
				}
			}).catch((err)=>{
				console.log(err);
			})
		},
		//图片跳转
		imgPath(item){
			if(item.imgLinkUrl == ''){
				return;
			}
			if(item.imgLinkUrl.indexOf('http') != -1){
				pushRoute({
					page:'/PQ/pages/webview/webview.html',
					params:{
						title:item.title,
						url:item.imgLinkUrl
					}
				})
			}else{
				pushRoute({
					page:item.imgLinkUrl
				})
			}
		},
		//获取行情交易地址
		getAddress(){
			request.post('/urlConfig',{'version':'','urlType':''})
			.then((res)=>{
				if(res.success&&res.code == '010'){
					sessionStorage.setItem('address',JSON.stringify(res.data));
					for(var i=0;i<res.data.length;i++){
						if(res.data[i].urlType == '010'){
							address1 = res.data[i].url;
						}else if(res.data[i].urlType == '020'){
							address2 = res.data[i].url;
						}else if(res.data[i].urlType == '030'){
							address3 = res.data[i].url;
						}else if(res.data[i].urlType == '040'){
							address4 = res.data[i].url;
						}else if(res.data[i].urlType == '050'){
							address5 = res.data[i].url;
						}
					};
					this.addressStatus = true;
				}else{
					if(sessionStorage.getItem('address')){
						var list = JSON.parse(sessionStorage.getItem('address'));
						for(var i=0;i<list.length;i++){
							if(list[i].urlType == '010'){
								address1 = list[i].url;
							}else if(list[i].urlType == '020'){
								address2 = list[i].url;
							}else if(list[i].urlType == '030'){
								address3 = list[i].url;
							}else if(list[i].urlType == '040'){
								address4 = list[i].url;
							}else if(list[i].urlType == '050'){
								address5 = list[i].url;
							}
						};
						this.addressStatus = true;
					}else{
						layer.msg(res.message,{
							time:1500
						})
					}
				}
			}).catch(function(err){
				console.log(err);
			})
		},
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
		//判断是否交易中
		checkTradeTime(tradeTime,notTradeTime){
			var week = new Date().getDay();
			if(week==0||week==6){
				return false;
			}
			var currentYMD = getFormalDate(new Date().getTime(),'yyyy/mm/dd');
			var currentTime = new Date().getTime();
			if(notTradeTime != ''){
				notTradeTime = notTradeTime.split('，');
				for(var i=0;i<notTradeTime.length;i++){
					var time = notTradeTime[i].split('-');
					if(time[0]<time[1]){
						//开始时间小于结束时间说明开始和结束是同一天
						if(currentTime>new Date(currentYMD+' '+time[0]).getTime()&&currentTime<new Date(currentYMD+' '+time[1]).getTime()){
							//不在交易是时间中
							return false;
						}else{
						}
					}else if(time[0]>time[1]){
						//说明结束是第二天
						if(currentTime>new Date(currentYMD+' '+time[0]).getTime()||currentTime<new Date(currentYMD+' '+time[1]).getTime()){
							//不在交易是时间中
							return false;
						}else{
							
						}
					}else{
						if(currentTime==new Date(currentYMD+' '+time[0]).getTime()){
							return false;
						}
					}
				}
			}
			if(tradeTime){
				tradeTime = tradeTime.split('，');
			}
			for(var i=0;i<tradeTime.length;i++){
				var time = tradeTime[i].split('-');
				if(time[0]<time[1]){
					//开始时间小于结束时间说明开始和结束是同一天
					if(currentTime>new Date(currentYMD+' '+time[0]).getTime()&&currentTime<new Date(currentYMD+' '+time[1]).getTime()){
						//在交易是时间中
						return true;
					}else{
					}
				}else if(time[0]>time[1]){
					//说明结束是第二天
					if(currentTime>new Date(currentYMD+' '+time[0]).getTime()||currentTime<new Date(currentYMD+' '+time[1]).getTime()){
						//在交易是时间中
						return true;
					}else{
						
					}
				}else{
					if(currentTime==new Date(currentYMD+' '+time[0]).getTime()){
						return true;
					}
				}
			}
			return false;
		},
		//打开通知弹出框
		openNoticeLayer(){
			var index = layer.open({
				type:1,
				content:$('#confirmOrderLayer'),
				area:['8rem','5.33rem'],
				shadeClose:true,
				title:false,
				closeBtn:0
			});
		},
		//关闭通知弹出框
		closeLayer(){
			layer.closeAll();
		},
		//初始化滚动
		initScroll(i){
			var tabList = mui('#scroll'+i).scroll({
				scrollY:true,
				scrollX:false,
				indicators:true,
				bounce:true,
			});
		},
		//页面跳转
		goToPage(path){
			pushRoute({
				page:path,
				params:{
					quatoType:this.quatoType
				}
			})
		},
		//获取系统公告
		getHomeData(){
			request.post('/noticeList',{'typeCode':'010','pageNo':1,'pageSize':1})
			.then((res)=>{
				if(res.success&&res.code == '010'){
					this.notice = res.data[0].noticeList[0];
					if(this.notice.popup == '020'){
						if(localStorage.getItem('homeNoticeTime')){
							var preTime = localStorage.getItem('homeNoticeTime');
							if(this.notice.noticeTime>preTime){
								localStorage.setItem('homeNoticeTime',this.notice.noticeTime);
								this.openNoticeLayer();
							}
						}else{
							localStorage.setItem('homeNoticeTime',this.notice.noticeTime);
							this.openNoticeLayer();
						}
					}
				}else{
					layer.msg(res.message,{
						time:1500
					});
				}
			}).catch(function(err){
				console.log(err);
;			});
			//banner数据
			request.post('/banner',{'type':'010'})
			.then((res)=>{
				if(res.success&&res.code == '010'){
					// banner
					var list = res.data;
					list.sort(function(a,b){
						return a.orderNo-b.orderNo;
					})
					this.bannerList = list;
					this.$nextTick(function(){
						var slider = mui("#slide");
						slider.slider({
							interval: list[0].carouselTime?list[0].carouselTime:2000
						});
					})
				}else{
					layer.msg(res.message,{
						time:1500
					})
				}
			}).catch(function(err){
				console.log(err);
;			})
		},
		//选择行情
		chooseQuato(item){
			localStorage.setItem('chooseContract',JSON.stringify(item));
			localStorage.setItem('tradeType',1);
			if(!mui.os.plus) {
				pushRoute({
					page:'/PQ/pages/quato/quatoDetail/quatoDetail.html'
				})
				return;
			}else{
				mui.openWindow({
					url:'/PQ/pages/quato/quatoDetail/quatoDetail.html',
					id:'quatoDetail.html'
				})
			}
		},
		goToPageTop(index){
			if(index == 1){
				//模拟盘
				// if(isLogin){
				localStorage.setItem('tradeType',0);
				pushRoute({
					page:'/PQ/pages/quato/moniQuato/moniQuato.html',
				});
				// }else{
				// 	localStorage.setItem('tradeType',0);
				// 	pushRoute({
				// 		page:'/PQ/pages/trade/trade.html',
				// 		params:{
				// 			type:0
				// 		}
				// 	});
				// }
			}else if(index == 2){
				//新手指引
				pushRoute({
					page:'/PQ/pages/trade/guide/guide.html'
				});
			}else if(index == 3){
				//极速开户
				pushRoute({
					page:'/PQ/pages/my/register/register.html'
				});
			}else if(index == 4){
				//领红包
				pushRoute({
					page:'/PQ/pages/discover/new/new.html'
				});
			}else if(index == 5){
				//充值入金
				pushRoute({
					page:'/PQ/pages/my/recharge/recharge.html'
				});
			}
		},
		networkChange(){
			var _this = this;
			if(window.navigator.onLine==true) {
				this.isNetworkConnect = true;
		　　}else {
				layer.msg('未连接网络',{
					time:1500
				})
				this.isNetworkConnect = false;
		　　}
		　　window.addEventListener("online", online, false);
		　　window.addEventListener("offline", offline, false);
		　　function online(){
				_this.isNetworkConnect = true;
				layer.msg('网络连接',{
					time:1500
				})
			}
		　　function offline() {
				_this.isNetworkConnect = false;
				layer.msg('网络断开，请检查网络',{
					time:1500
				})
			}
		},
		switchQuatoType(index){
			this.quatoType = index;
			marketStore.state.quatoType = index;
			switch(index){
				case 1:this.quatoList = this._internationalCommodity;
				break;
				case 2:this.quatoList = this._domesticCommodity;break;
			}
			console.log(this.quatoList);
		},
		getRate(){
			request.post('/qryRates')
			.then((perms)=>{
				if(perms.success&&perms.code=='010'){
					//成功获取汇率
					localStorage.setItem('currencyRate',JSON.stringify(perms.data));
					for(var i=0;i<perms.data.length;i++){
						this.currencyRate[perms.data[i].currencyNo] = perms.data[i].exchangeRate;
					}
				}else{
					//失败则取缓存数据
					if(localStorage.getItem('currencyRate')){
						var currencyRate = JSON.parse(localStorage.getItem('currencyRate'));
						for(var i=0;i<currencyRate.length;i++){
							this.currencyRate[currencyRate[i].currencyNo] = currencyRate[i].exchangeRate;
						}
					}else{
						layer.msg('汇率获取失败',{
							time:1500
						})
					}
				}
			});
		}
	}
})