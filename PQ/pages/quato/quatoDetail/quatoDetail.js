//页面之间传值
var tradePageStore = new Vuex.Store({
	state:{
		headerTextTop:'', //头部上面文字
		headerTextBottom:'', //头部下面文字
		choosePage:0,
		chartUrl:'',//图表url
		tradeTabIndex:2,//导航索引
		isNormalPrice:false,
		period:'', //图表周期
		priceType:1, //图表数据类型 1最新价 2
		apiUrl:'', //图表http地址
		WSUrl:'',  //图表ws地址
		contractLayer:null, //
		tradeType:tradeType, //交易类别
		isOnTrade:true,//是否交易中
		isNetworkConnect:false, //网络是否连接
		chartIframe:null,
		chartLoad:false,
		quatoType:1, //行情类型 1国际 2国内
	}
})

var emitter = new Vue();
//头部
var header = new Vue({
	el:'#trade-header',
	data:{
	},
	computed:{
		headerTextTop:function(){
			return tradePageStore.state.headerTextTop;
		},
		headerTextBottom:function(){
			return tradePageStore.state.headerTextBottom;
		},
		chooseContract:function(){
			return tradeStore.state.chooseContract;
		},
		LastData:function(){
			return marketStore.state.LastData;
		},
		tradeType:function(){
			return tradePageStore.state.tradeType;
		},
		isOnTrade:function(){
			return tradePageStore.state.isOnTrade;
		},
	},
	watch:{
		LastData:function(){
			tradePageStore.state.isOnTrade = this.checkTradeTime(this.chooseContract.tradingTime,this.chooseContract.notTradingTime);
		},
		chooseContract:function(){
			tradePageStore.state.isOnTrade = this.checkTradeTime(this.chooseContract.tradingTime,this.chooseContract.notTradingTime);
		}
	},
	mounted() {
		mui.init();
		layui.use('layer', function(){
			var layer = layui.layer;
		});
		marketStore.state.subscribeContract = [];
		// 禁用侧边菜单栏手滑打开
		var offCanvasWrapper = mui('#trade');
		var offCanvasInner = offCanvasWrapper[0].querySelector('.mui-inner-wrap');  
		offCanvasInner.addEventListener('drag', function(event) {  
			event.stopPropagation();  
		});
	},
	methods:{
		//切换合约
		switchContract(){
			tradePageStore.state.contractLayer = layer.open({
				type:1,
				content:$('#contractSelect'),
				area:['8rem','10.666rem'],
				shadeClose:true,
				title:null,
				closeBtn:0,
			});
			var list = document.getElementById('list');
			//calc hieght
			list.style.height = '10.666rem';
			//create
			window.indexedList = new mui.IndexedList(list);
		},
		backBtn(){
			if(!mui.os.plus){
				backRoute();
				return;
			}
			mui.back();
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
		goToPage(path){
			pushRoute({
				page:path,
				params:{
					contractNo:this.chooseContract.contractCode,
					contractName:this.chooseContract.contractName,
					tradeTabIndex:tradePageStore.state.tradeTabIndex,
				}
			})
		}
	}
});
//导航
var tradeTab = new Vue({
	el:'#tradeTab',
	data:{
		isShowKlineOption:false, //是否显示k线图选择框
		klineOptionTimer:null,//k线图选择框实例
		klineName:'K线',//k线导航栏名称
		tabIndex:-1,
		chartUrl:'../../../common/f2Chart/f2Chart.html',//f2图表
		addressStatus:false,
		isLogin:isLogin,
		isFirst:true,//是否首次
		loginErrorLayer:null,//登录错误弹窗
		scrollTimer:null,//滚动实例
	},
	computed:{
		chooseQuatoType:function(){
			return marketStore.state.chooseQuatoType;
		},
		isTradeLogin:function(){
			return tradeStore.state.isTradeLogin;
		},
		isCanConnectTrade:function(){
			return marketStore.state.isCanConnectTrade;
		},
		chooseContract:function(){
			return tradeStore.state.chooseContract;
		},
		chooseQuatoType:function(){
			return marketStore.state.chooseQuatoType;
		},
		period:function(){
			return tradePageStore.state.period;
		},
		priceType:function(){
			return tradePageStore.state.priceType;
		},
		isMarketLogin:function(){
			return marketStore.state.isMarketLogin;
		},
		tradeType:function(){
			return tradePageStore.state.tradeType;
		},
		isNetworkConnect:function(){
			return tradePageStore.state.isNetworkConnect;
		},
		tradeLoginStatus:function(){
			return tradeStore.state.tradeLoginStatus;
		},
		positionList:function(){
			//持仓列表
			return tradeStore.state.positionList;
		},
		chartLoad:function(){
			return tradePageStore.state.chartLoad;
		},
		chartIframe:function(){
			return tradePageStore.state.chartIframe;
		},
	},
	watch:{
		isCanConnectTrade:function(){
			if(this.isCanConnectTrade&&isLogin){
				tradeStore.dispatch('connectTrade'); //连接交易
			}
		},
		isTradeLogin:function(){
			if(this.isTradeLogin){
				if(urlParams.tradeTabIndex==5&&this.isFirst){
					this.chooseTap(urlParams.tradeTabIndex);
					this.isFirst = false;
				}
				if(this.loginErrorLayer!=null){
					layer.close(this.loginErrorLayer);
				}
			}
		},
		addressStatus:function(){
			if(this.addressStatus&&this.isNetworkConnect){
				marketStore.dispatch('connectQuato');//连接行情
				// if(tradePageStore.state.tradeTabIndex ==1||tradePageStore.state.tradeTabIndex ==2||tradePageStore.state.tradeTabIndex ==6||tradePageStore.state.tradeTabIndex ==7||tradePageStore.state.tradeTabIndex ==8||tradePageStore.state.tradeTabIndex ==9||tradePageStore.state.tradeTabIndex ==10){
				// 	this.initChartUrl();
				// }
				if(isLogin){
					//登录实盘
					tradePageStore.state.WSUrl = address2;
				}else{
					//未登录游客
					tradePageStore.state.WSUrl = address1;
				}
				tradePageStore.state.apiUrl = address3;
				if(GetURLParam()){
					urlParams = GetURLParam();
					if(urlParams.tradeTabIndex!=5){
						this.chooseTap(urlParams.tradeTabIndex);
					}
				}else{
					this.initChartUrl();
				}
			}
		},
		isMarketLogin:function(){
			if(this.MarketLogin&&tradePageStore.state.tradeTabIndex == 4){
				marketStore.dispatch('depthSubscribe');
				marketStore.dispatch('tickerSubscribe');
			}
		},
		isNetworkConnect:function(){
			if(this.isNetworkConnect){
				this.getAddress();
			}
		},
	},
	mounted() {
		this.networkChange();
		this.getChooseContract();
		this.getTradeAccount();
		emitter.$on('openLayer',()=>{
			console.log('暂未登录交易');
			this.loginErrorLayer = layer.open({
				type:1,
				content:$('#tradeLoginLayer2'),
				area:['7.3rem','6rem'],
				shadeClose:true,
				title:null,
				closeBtn:0,
			});
		});
	},
	methods:{
		//网络变化
		networkChange(){
			var _this = this;
			if(window.navigator.onLine==true) {
				tradePageStore.state.isNetworkConnect = true;
		　　}else {
				layer.msg('未连接网络',{
					time:1500
				})
				tradePageStore.state.isNetworkConnect = false;
				_this.addressStatus = false;
		　　}
		　　window.addEventListener("online", online, false);
		　　window.addEventListener("offline", offline, false);
		　　function online(){
				tradePageStore.state.isNetworkConnect = true;
				layer.msg('网络连接',{
					time:1500
				})
			}
		　　function offline() {
				tradePageStore.state.isNetworkConnect = false;
				_this.addressStatus = false;
				layer.msg('网络断开，请检查网络',{
					time:2000
				})
			}
		},
		//查询活动
		checkActivity(){
			var activityType = '020';
			if(this.tradeType == 0){
				//模拟
				activityType = '020';
			}else if(this.tradeType == 1){
				//实盘
				activityType = '022,023';
			}
			request.post('/qryActivites',{
				activityType:activityType
			},{
				token:userInfo.token,
				secret:userInfo.secret,
				'Content-Type': 'application/x-www-form-urlencoded'
			}).then(function(res){
				if(res.success&&res.code == '010'){
					for(var i=0;i<res.data.length;i++){
						tradeStore.state.activityStatus = res.data[i].complatedStatus;
						tradeStore.state.received = res.data[i].received;
						tradeStore.state.activitiesName = res.data[i].activityName;
						var a = res.data[i].id;
						tradeStore.state.activityId = res.data[i].id;
						if(res.data[i].received == '010'){
							request.post('/activitiesCoupon',{
								activityId: a,
							},{
								token:userInfo.token,
								secret:userInfo.secret
							}).then((res2)=>{
								if(res2.success&&res2.code=='010'){
									tradeStore.state.couponId = res2.data.couponId;
									tradeStore.state.faceValue = res2.data.amount;
									tradeStore.state.couponName = res2.data.typeName;
									tradeStore.state.activitiesName = res2.data.activitiesName;
								}else{
									layer.msg(res2.message,{
										time:1500
									})
								}
							}).catch((err)=>{
								
							})
						}
						if(res.data[i].received=='010'){
							break;	
						}
					}
				}else{
					layer.msg(res.message,{
						time:1500,
					})
				}
			}).catch(function(err){
				
			})
		},
		//获取地址
		getAddress(){
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
						layer.msg(res.message,{
							time:1500
						})
					}
				}).catch(function(err){
					console.log(err);
			;	})
			}
		},
		//关闭弹出层
		closeLayer(){
			layer.closeAll();
		},
		//获取选择的合约
		getChooseContract(){
			if(localStorage.getItem('chooseContract')){
				tradeStore.state.chooseContract = JSON.parse(localStorage.getItem('chooseContract'));
				// marketStore.state.subscribeContract.push(this.chooseContract.commodity_no);
				if(this.chooseContract.quatoData){
					marketStore.state.LastData = this.chooseContract.quatoData;
				}
				tradePageStore.state.quatoType = this.chooseContract.security_type == 'FO'?1:this.chooseContract.security_type == 'FI'?2:1;
				marketStore.state.currentQuato = this.chooseContract.security_type+ '_' + this.chooseContract.commodity_no;
				tradePageStore.state.headerTextTop = this.chooseContract.commodity_name;
				tradePageStore.state.headerTextBottom = this.chooseContract.commodity_no+this.chooseContract.main_contract_no;
			}
		},
		//获取本地存储的交易账号
		getTradeAccount(){
			if(localStorage.getItem('tradeAccount')){
				//有账号
				var tradeAccount = JSON.parse(localStorage.getItem('tradeAccount'));
				tradeStore.state.tradeConfig.ClientNo = tradeAccount.tradeUser;
				tradeStore.state.tradeConfig.PassWord = tradeAccount.tradePassWord;
			}else{
				//无账号
				var tradeAccount = {
					tradeUser:'dev001',
					tradePassWord:'MTIz',
				}
				localStorage.setItem('tradeAccount',JSON.stringify(tradeAccount));
				tradeStore.state.tradeConfig.ClientNo = 'dev001';
				tradeStore.state.tradeConfig.PassWord = 'MTIz';
			}
		},
		//初始化图表
		initChartUrl(){
			this.tabIndex = 2;
			tradePageStore.state.chartUrl = this.chartUrl + "?period='KLINE_UNKNOWN'&contractNo='"+this.chooseContract.security_type+'_'+this.chooseContract.commodity_no+'_'+this.chooseContract.main_contract_no+"'&contractName='"+this.chooseContract.commodity_name+"'&priceType='1'&apiUrl=" + tradePageStore.state.apiUrl + "&WSUrl=" + tradePageStore.state.WSUrl;
			tradePageStore.state.chartLoad = true;
			this.chartIframeLoad();
		},
		//iframe加载完毕
		chartIframeLoad(){
			this.$nextTick(()=>{
				tradePageStore.state.chartIframe = document.getElementById('chartURL');
				if (this.chartIframe.attachEvent){
					this.chartIframe.attachEvent("onload", function(){
						tradePageStore.state.chartLoad = false;
						console.log('iframe完毕');
					});
				} else {
					this.chartIframe.onload = function(){
						tradePageStore.state.chartLoad = false;
						console.log('iframe完毕');
					};
				}
			})
		},
		//选择顶部导航栏
		chooseTap(index){
			if(this.tabIndex == index&&index!=3){
				return;
			}
			if(isLogin){
				//登录实盘
				tradePageStore.state.WSUrl = address2;
			}else{
				//未登录游客
				tradePageStore.state.WSUrl = address1;
			}
			var contractNo = this.chooseContract.security_type + '_' + this.chooseContract.commodity_no + '_' + this.chooseContract.main_contract_no;
			var contractName = this.chooseContract.commodity_name;
			tradePageStore.state.tradeTabIndex = index;
			if(index == 4&&marketStore.state.isMarketLogin){
				marketStore.dispatch('depthSubscribe');
				marketStore.dispatch('tickerSubscribe');
			}else if(marketStore.state.isDepth){
				// marketStore.dispatch('cancelDepthSubscribe');
				// marketStore.dispatch('cancelTickerSubscribe');
			}
			if(index == 1){
				clearTimeout(this.scrollTimer);
// 				tradePageStore.state.headerTextTop = this.chooseContract.commodity_name;
// 				tradePageStore.state.headerTextBottom = this.chooseContract.commodity_no;
				tradePageStore.state.choosePage = 1;
				this.tabIndex = index;
				tradePageStore.state.period = 'LIGHT';
				tradePageStore.state.chartUrl = this.chartUrl + "?period='"+this.period+"'&contractNo='"+contractNo+"'&contractName='"+contractName+"'&priceType='"+this.priceType+"'" + "&apiUrl=" + tradePageStore.state.apiUrl + "&WSUrl=" + tradePageStore.state.WSUrl;
				tradePageStore.state.chartLoad = true;
				this.chartIframeLoad();
			}else if(index == 2){
				clearTimeout(this.scrollTimer);
// 				tradePageStore.state.headerTextTop = this.chooseContract.commodity_name;
// 				tradePageStore.state.headerTextBottom = this.chooseContract.commodity_no;
				tradePageStore.state.choosePage = 1;
				this.tabIndex = index;
				tradePageStore.state.period = 'KLINE_UNKNOWN';
				tradePageStore.state.chartUrl = this.chartUrl + "?period='"+this.period+"'&contractNo='"+contractNo+"'&contractName='"+contractName+"'&priceType='"+this.priceType+"'" + "&apiUrl=" + tradePageStore.state.apiUrl + "&WSUrl=" + tradePageStore.state.WSUrl;
				tradePageStore.state.chartLoad = true;
				this.chartIframeLoad();
			}else if(index == 3){
				this.isShowKlineOption = !this.isShowKlineOption;
				this.klineOptionTimer = setTimeout(function(){
					if(this.isShowKlineOption){
						this.isShowKlineOption = false;
					}
				}.bind(this),2000);
			}else if(index == 4){
				clearTimeout(this.scrollTimer);
				tradePageStore.state.choosePage = 2;
				this.tabIndex = index;
				this.scrollTimer = setTimeout(function(){
					if(mui('.detail-list-scroll')){
						mui('.detail-list-scroll').scroll();
					}
				},0);
			}else if(index == 5){
				if(!isLogin){
					this.loginErrorLayer = layer.open({
						type:1,
						content:$('#tradeLoginLayer2'),
						area:['7.3rem','6rem'],
						shadeClose:true,
						title:null,
						closeBtn:0,
					});
					return
				}
				if(this.tradeLoginStatus == 0||this.tradeLoginStatus == 1){
					layer.msg('正在连接交易',{
						time:1500,
					});
					return;
				}
				if(!this.isTradeLogin&&this.tradeLoginStatus == 3){
					console.log('暂未登录交易');
					this.loginErrorLayer = layer.open({
						type:1,
						content:$('#tradeLoginLayer2'),
						area:['7.3rem','6rem'],
						shadeClose:true,
						title:null,
						closeBtn:0,
					});
					return
				}
				if(this.tradeLoginStatus == 2){
					clearTimeout(this.scrollTimer);
					this.checkActivity();
					tradePageStore.state.choosePage = 3;
					this.scrollTimer = setTimeout(function(){
						this.initSroll(1);
						this.initSroll(2);
						this.initSroll(3);
						this.initSroll(4);
					}.bind(this),500);
					this.tabIndex = index;
				}
			}else if(index == 6){
				clearTimeout(this.klineOptionTimer);
				clearTimeout(this.scrollTimer);
				tradePageStore.state.choosePage = 1;
				this.tabIndex = 3;
				this.isShowKlineOption = false;
				this.klineName = '1分K';
				tradePageStore.state.period = 'KLINE_1MIN';
				tradePageStore.state.chartUrl = this.chartUrl + "?period='"+this.period+"'&contractNo='"+contractNo+"'&contractName='"+contractName+"'&priceType='"+this.priceType+"'" + "&apiUrl=" + tradePageStore.state.apiUrl + "&WSUrl=" + tradePageStore.state.WSUrl;
				tradePageStore.state.chartLoad = true;
				this.chartIframeLoad();
			}else if(index == 7){
				clearTimeout(this.klineOptionTimer);
				clearTimeout(this.scrollTimer);
				tradePageStore.state.choosePage = 1;
				this.tabIndex = 3;
				this.isShowKlineOption = false;
				this.klineName = '5分K';
				tradePageStore.state.period = 'KLINE_5MIN';
				tradePageStore.state.chartUrl = this.chartUrl + "?period='"+this.period+"'&contractNo='"+contractNo+"'&contractName='"+contractName+"'&priceType='"+this.priceType+"'" + "&apiUrl=" + tradePageStore.state.apiUrl + "&WSUrl=" + tradePageStore.state.WSUrl;
				tradePageStore.state.chartLoad = true;
				this.chartIframeLoad();
			}else if(index == 8){
				clearTimeout(this.klineOptionTimer);
				clearTimeout(this.scrollTimer);
				tradePageStore.state.choosePage = 1;
				this.tabIndex = 3;
				this.isShowKlineOption = false;
				this.klineName = '15分K';
				tradePageStore.state.period = 'KLINE_15MIN';
				tradePageStore.state.chartUrl = this.chartUrl + "?period='"+this.period+"'&contractNo='"+contractNo+"'&contractName='"+contractName+"'&priceType='"+this.priceType+"'" + "&apiUrl=" + tradePageStore.state.apiUrl + "&WSUrl=" + tradePageStore.state.WSUrl;
				tradePageStore.state.chartLoad = true;
				this.chartIframeLoad();
			}else if(index == 9){
				clearTimeout(this.klineOptionTimer);
				clearTimeout(this.scrollTimer);
				tradePageStore.state.choosePage = 1;
				this.tabIndex = 3;
				this.isShowKlineOption = false;
				this.klineName = '30分K';
				tradePageStore.state.period = 'KLINE_30MIN';
				tradePageStore.state.chartUrl = this.chartUrl + "?period='"+this.period+"'&contractNo='"+contractNo+"'&contractName='"+contractName+"'&priceType='"+this.priceType+"'" + "&apiUrl=" + tradePageStore.state.apiUrl + "&WSUrl=" + tradePageStore.state.WSUrl;
				tradePageStore.state.chartLoad = true;
				this.chartIframeLoad();
			}else if(index == 10){
				clearTimeout(this.klineOptionTimer);
				clearTimeout(this.scrollTimer);
				tradePageStore.state.choosePage = 1;
				this.tabIndex = 3;
				this.isShowKlineOption = false;
				this.klineName = '日K';
				tradePageStore.state.period = 'KLINE_1DAY';
				tradePageStore.state.chartUrl = this.chartUrl + "?period='"+this.period+"'&contractNo='"+contractNo+"'&contractName='"+contractName+"'&priceType='"+this.priceType+"'" + "&apiUrl=" + tradePageStore.state.apiUrl + "&WSUrl=" + tradePageStore.state.WSUrl;
				tradePageStore.state.chartLoad = true;
				this.chartIframeLoad();
			}
		},
		//初始化滚动
		initSroll(i){
			var tabNav = mui('#tab'+i+'-nav').scroll({
				scrollY:false,
				scrollX:false,
				indicators:false,
				bounce:false,
			});
			var tabList = mui('#tab'+i+'-list').scroll({
				scrollY:true,
				scrollX:true,
				indicators:false,
				bounce:false,
			});
			document.querySelector('#tab'+i+'-list' ).addEventListener('scroll', function (e) { 
				mui('#tab'+i+'-nav').scroll().scrollTo(tabList.x,0);
			});
		},
		//提示未登录交易弹窗按钮
		layerInfoBtn(index){
			if(index == 1){
				//取消
				layer.closeAll();
			}else if(index == 2){
				//去登录
				pushRoute({
					page:'/PQ/pages/my/login/login.html',
					params:{
						loginBackPage:'/PQ/pages/quato/quatoDetail/quatoDetail.html',
						tradeTabIndex:tradePageStore.state.tradeTabIndex,
					}
				})
			}else if(index == 3){
				//确认
				tradeStore.dispatch('connectTrade'); //连接交易
				layer.closeAll();
			}
		}
	}
	
})
//图表页面
var chartPage = new Vue({
	el:'#chart-page',
	data:{
		handNum:1,//选择手数
		isFirstHand:true,//是否第一次
		direction:0,//0:买 1:卖
		price:'市价',
		isShowKeyboard:false, //是否显示键盘
		keyboardPriceType:3,//键盘1:排队价 2:对手价 3市价 4限价
		keyboardType:-1,//1手数 2价格
		sellPrice:0, //
		buyPrice:0,
		needMoney:0,
		isLogin:isLogin,
		isSendData:false,//是否正在发送请求，防止抖动
	},
	computed:{
		chooseContract:function(){
			return tradeStore.state.chooseContract;
		},
		LastData:function(){
			return marketStore.state.LastData;
		},
		choosePage:function(){
			return tradePageStore.state.choosePage;
		},
		chartUrl:function(){
			return tradePageStore.state.chartUrl;
		},
		tradeTabIndex:function(){
			return tradePageStore.state.tradeTabIndex;
		},
		todayCanUseBalance:function(){
			//今可用
			return tradeStore.state.todayCanUseBalance;
		},
		totalFloatProfit:function(){
			//总浮动盈亏
			return marketStore.state.totalFloatProfit;
		},
		rateList:function(){
			return tradeStore.state.rateList;
		},
		RMBRate:function(){
			return marketStore.state.RMBRate;
		},
		isTradeLogin:function(){
			return tradeStore.state.isTradeLogin;
		},
		isNetworkConnect:function(){
			return tradePageStore.state.isNetworkConnect;
		},
		tradeType:function(){
			return tradeStore.state.tradeType;
		},
		chartLoad:function(){
			return tradePageStore.state.chartLoad;
		},
		chartIframe:function(){
			return tradePageStore.state.chartIframe;
		}
	},
	watch:{
		LastData:function(){
			if(this.keyboardPriceType == 1){
				//排队价
				this.sellPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
				this.buyPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
			}else if(this.keyboardPriceType == 2){
				//对手价
				this.sellPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
				this.buyPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
			}else if(this.keyboardPriceType == 3){
				//市价
				this.sellPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
				this.buyPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
			}
		},
		tradeTabIndex:function(){
			if(this.tradeTabIndex != 1){
				this.isShowKeyboard = false;
				this.keyboardType = -1;
			}
		},
		chooseContract:function(){
			if(this.keyboardPriceType == 4){
				this.keyboardPriceType = 3;
				this.sellPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
				this.buyPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
				this.price = '市价';
			}
		},
		isTradeLogin:function(){
			if(this.isTradeLogin){
				if(this.loginErrorLayer!=null){
					layer.close(this.loginErrorLayer)
				}
			}
		}
	},
	mounted() {
		urlParams = GetURLParam();
		if(urlParams.tradeTabIndex!=4&&urlParams.tradeTabIndex!=5){
			tradePageStore.state.choosePage = 1;
		}
			//排队价
		if(this.keyboardPriceType == 1){
			this.sellPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
			this.buyPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
		}else if(this.keyboardPriceType == 2){
			//对手价
			this.sellPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
			this.buyPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
		}else if(this.keyboardPriceType == 3){
			//市价
			this.sellPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
			this.buyPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
		}
	},
	methods:{
		//打开键盘
		showKeyboard(type){
			this.isShowKeyboard = true;
			this.keyboardType = type;
			setTimeout(function(){
				var height = document.getElementsByClassName('trade-area')[0].clientHeight;
				document.getElementsByClassName('chart')[0].style.height = 'calc(100% - '+height+'px)';
				document.getElementById('chartURL').style.height = '100%';
				if(!this.isShowKeyboard){
					this.keyboardType = -1;
				}
			}.bind(this),500)
		},
		//关闭键盘
		closeKeyboard(){
			this.isShowKeyboard = false;
			if(this.handNum==''||this.handNum==0){
				this.handNum = 1;
			}
			setTimeout(function(){
				var height = document.getElementsByClassName('trade-area')[0].clientHeight;
				document.getElementsByClassName('chart')[0].style.height = 'calc(100% - '+height+'px)';
				document.getElementById('chartURL').style.height = '100%';
				if(!this.isShowKeyboard){
					this.keyboardType = -1;
				}
			}.bind(this),500)
		},
		//输入数字
		chooseKeyboardNum(num){
			if(num == '市价'||num == '对手价'||num == '排队价'){
				this.price = num;
				this.keyboardPriceType = num=='市价'?3:num=='对手价'?2:num=='排队价'?1:4;
				if(num=='市价'){
					this.sellPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
					this.buyPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
				}else if(num=='对手价'){
					this.sellPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
					this.buyPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
				}else if(num=='排队价'){
					this.sellPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
					this.buyPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
				}
			}if(num == '限价'){
				this.keyboardPriceType = 4;
				this.price = this.LastData[3];
			}else if(typeof(num) == 'number'){
				if(this.keyboardType == 1){
					if(this.isFirstHand){
						this.handNum = num;
						this.isFirstHand = false;
					}else{
						if(this.handNum == 0){
							this.handNum = '';
						}
						this.handNum = this.handNum.toString() + num.toString();
						if(Number(this.handNum)>99){
							this.handNum = 99;
						}
					}
				}else if(this.keyboardType == 2){
					this.keyboardPriceType = 4;
					if(this.price == '市价'||this.price == '限价'||this.price == '对手价'||this.price == '排队价'){
						this.price = num.toString();
					}else{
						if(this.price == 0){
							this.price = '';
						}
						this.price = this.price.toString() + num.toString();
					}
				}
			}else if(num == '.'){
				if(this.keyboardType == 1){
					if(JSON.stringify(this.handNum).indexOf('.') == -1&&(this.handNum !='0'||this.handNum !='')){
						this.handNum = this.handNum.toString() + num.toString();
					}
				}else if(this.keyboardType == 2){
					if(this.price == '市价'||this.price == '限价'||this.price == '对手价'||this.price == '排队价'){
						return;
					}
					if(this.price.indexOf('.') == -1&&(this.price !='0'||this.price !='')){
						this.price = this.price.toString() + num.toString();
					}
				}
			}else if(num == 'back'){
				if(this.keyboardType == 1){
					this.handNum = this.handNum.toString();
					this.handNum = this.handNum.substr(0,this.handNum.length-1);
					if(this.handNum==''){
						this.handNum = 0;
					}
				}else if(this.keyboardType == 2){
					if(this.price==''||this.price==0||this.price == '市价'||this.price == '限价'||this.price == '对手价'||this.price == '排队价'){
						return;
					};
					this.price = this.price.toString();
					this.price = this.price.substr(0,this.price.length-1);
					if(this.price==''){
						this.price = '0';
					}
				}
			}else if(num == '加'){
				if(this.keyboardType == 1){
					this.handNum = Number(this.handNum)+1;
					if(this.handNum>99){
						this.handNum = 99;
					}
				}else if(this.keyboardType == 2){
					if(this.keyboardPriceType == 4){
						this.price = (Number(this.price)+Number(this.chooseContract.mini_ticker_size)).toFixed(this.chooseContract.dotSize);
					}
				}
			}else if(num == '减'){
				if(this.keyboardType == 1){
					this.handNum = Number(this.handNum)-1;
					if(this.handNum<=0){
						this.handNum = 1;
					}
				}else if(this.keyboardType == 2){
					if(this.keyboardPriceType == 4){
						this.price = (Number(this.price)-this.chooseContract.mini_ticker_size).toFixed(this.chooseContract.dotSize);
						if(this.price<=0){
							this.price = 0;
						}
					}
				}
			}
		},
		//选择手数
		chooseNum(index){
			if(index == 1){
				//加
				this.handNum ++;
			}else if(index == 2){
				//减
				if(this.handNum - 1 == 0){
					this.handNum = 1;
					return;
				}
				this.handNum --;
			}
		},
		//买卖
		tradeBtn(index){
			if(!this.isNetworkConnect){
				//未联网
				layer.msg('未连接到网络，请检查网络设置',{
					time:2000
				});
				return;
			}
			if(!tradeStore.state.isTradeLogin){
				this.loginErrorLayer = layer.open({
					type:1,
					content:$('#tradeLoginLayer2'),
					area:['7.3rem','6rem'],
					shadeClose:true,
					title:null,
					closeBtn:0
				});
				return;
			}
			this.closeKeyboard();
			var needMoney = (Number(this.chooseContract.deposit)*Number(this.handNum)+Number(this.chooseContract.fee)*Number(this.handNum))*this.rateList[this.chooseContract.currencyNo];
			var haveMoney = this.todayCanUseBalance+this.totalFloatProfit;
			this.needMoney = ((Number(this.chooseContract.deposit)*Number(this.handNum)+Number(this.chooseContract.fee)*Number(this.handNum))*this.rateList[this.chooseContract.currencyNo]/this.rateList.CNY);
			this.needMoney = Number(this.needMoney.toFixed(2));
			// if(needMoney>haveMoney){
			// 	//余额不足
			// 	if(this.tradeType == 0){
			// 		layer.msg('余额不足，请领取模拟金',{
			// 			time:1500
			// 		});
			// 	}else{
			// 		layer.open({
			// 			type:1,
			// 			content:$('#balanceInfoLayer'),
			// 			area:['7.3rem','6rem'],
			// 			shadeClose:true,
			// 			title:null,
			// 			closeBtn:0,
			// 		})
			// 	}
			// 	return;
			// }
			if(index == 1){
				//买入
				this.direction = 0;
			}else if(index == 2){
				//卖出
				this.direction = 1;
			}
			layer.open({
				type:1,
				content:$('#confirmOrderOpenLayer'),
				area:['7.3rem','6rem'],
				shadeClose:true,
				title:null,
				closeBtn:0
			})   
		},
		layerBtn(index){
			if(index == 1){
				//取消
				layer.closeAll();
			}else if(index == 2){
				if(this.isSendData){
					return;
				}
				this.isSendData = true;
				//确定下单
				var method = 'InsertOrder'; //调用方法
				var params = {
					CommodityType:Number(this.chooseContract.typeCode), //1国际期货
					ExchangeNo:this.chooseContract.exchange_no,// 交易所代码
					CommodityNo:this.chooseContract.commodity_no,//品种代码
					ContractNo:this.chooseContract.main_contract_no,//合约代码
					OrderNum: Number(this.handNum),//订单数量
					Direction:this.direction,//买卖方向 0:买 1:卖
					PriceType:this.keyboardPriceType==3?1:0,//价格类型 0:限价 1:市价
					LimitPrice:this.keyboardPriceType==3?0:this.keyboardPriceType==4?Number(this.price):this.direction==0?Number(this.buyPrice):Number(this.sellPrice),//限价价格
					OrderRef:'',//自定义数据
					OpenCloseType:1,//开平类型 1-开仓 2-平仓 3-平今
				}; //传入参数
				tradeStore.dispatch('sendWS',{method,params});
				layer.closeAll();
				setTimeout(function(){
					this.isSendData = false;
				}.bind(this),500);
			}
		},
		//提示未登录交易弹窗按钮
		layerInfoBtn(index){
			if(index == 1){
				//取消
				layer.closeAll();
			}else if(index == 2){
				//去登录
				pushRoute({
					page:'/PQ/pages/my/login/login.html',
					params:{
						loginBackPage:'/PQ/pages/quato/quatoDetail/quatoDetail.html',
						tradeTabIndex:tradePageStore.state.tradeTabIndex,
					}
				})
			}
		},
		closeLayer(){
			layer.closeAll();
		},
		goToPage(path){
			var isLayer = false;
			if(arguments[1]==1){
				isLayer = true;
			}
			var params = {
				tradeTabIndex:tradePageStore.state.tradeTabIndex,
			}
			if(isLayer){
				params.money = this.needMoney;
			}
			pushRoute({
				page:path,
				params:params
			})
		}
	}
})
//盘口
var positionPage = new Vue({
	el:'#position-page',
	data:{
		handNum:1,//选择手数
		isFirstHand:true, //是否第一次
		direction:0,//0:买 1:卖
		price:'市价',
		isShowKeyboard:false, //是否显示键盘
		keyboardPriceType:3,//键盘1:排队价 2:对手价 3市价 4限价
		keyboardType:-1,//1手数 2价格
		pageIndex:1,//1盘口/五档 2逐笔明细
		sell5:[0,0],
		sell4:[0,0],
		sell3:[0,0],
		sell2:[0,0],
		sell1:[0,0],
		buy1:[0,0],
		buy2:[0,0],
		buy3:[0,0],
		buy4:[0,0],
		buy5:[0,0],
		detailList:[], //逐笔明细数据
		preData:[], //上一条最新数据用于计算成交量
		sellPrice:0,
		buyPrice:0,
		needMoney:0,
		isLogin:isLogin,
		isSendData:false,//是否正在请求数据中
		loginErrorLayer:null,//登录错误弹窗
		scrollTimer:null,//滚动实例
	},
	computed:{
		choosePage:function(){
			return tradePageStore.state.choosePage;
		},
		chooseContract:function(){
			return tradeStore.state.chooseContract;
		},
		LastData:function(){
			return marketStore.state.LastData;
		},
		depthLastData:function(){
			return marketStore.state.depthLastData;
		},
		tradeTabIndex:function(){
			return tradePageStore.state.tradeTabIndex;
		},
		todayCanUseBalance:function(){
			//今可用
			return tradeStore.state.todayCanUseBalance;
		},
		totalFloatProfit:function(){
			//总浮动盈亏
			return marketStore.state.totalFloatProfit;
		},
		rateList:function(){
			return tradeStore.state.rateList;
		},
		RMBRate:function(){
			return marketStore.state.RMBRate;
		},
		tickerList:function(){
			return marketStore.state.tickerList;
		},
		isTradeLogin:function(){
			return tradeStore.state.isTradeLogin;
		},
		isNetworkConnect:function(){
			return tradePageStore.state.isNetworkConnect;
		},
		tradeType:function(){
			return tradeStore.state.tradeType;
		}
	},
	watch:{
		depthLastData:function(){
			if(this.depthLastData[2] == 2){
				this.sell2[0] = this.depthLastData[3].toFixed(this.chooseContract.dotSize);
				this.sell2[1] = this.depthLastData[4];
				this.buy2[0] = this.depthLastData[5].toFixed(this.chooseContract.dotSize);
				this.buy2[1] = this.depthLastData[6];
			}else if(this.depthLastData[2] == 3){
				this.sell3[0] = this.depthLastData[3].toFixed(this.chooseContract.dotSize);
				this.sell3[1] = this.depthLastData[4];
				this.buy3[0] = this.depthLastData[5].toFixed(this.chooseContract.dotSize);
				this.buy3[1] = this.depthLastData[6];
			}else if(this.depthLastData[2] == 4){
				this.sell4[0] = this.depthLastData[3].toFixed(this.chooseContract.dotSize);
				this.sell4[1] = this.depthLastData[4];
				this.buy4[0] = this.depthLastData[5].toFixed(this.chooseContract.dotSize);
				this.buy4[1] = this.depthLastData[6];
			}else if(this.depthLastData[2] == 5){
				this.sell5[0] = this.depthLastData[3].toFixed(this.chooseContract.dotSize);
				this.sell5[1] = this.depthLastData[4];
				this.buy5[0] = this.depthLastData[5].toFixed(this.chooseContract.dotSize);
				this.buy5[1] = this.depthLastData[6];
			}
		},
		chooseContract:function(){
			marketStore.state.tickerList = [];
			this.detailList = [];
			this.preData = [];
			this.sell5 = [0,0];
			this.sell4 = [0,0];
			this.sell3 = [0,0];
			this.sell2 = [0,0];
			this.sell1 = [0,0];
			this.buy1 = [0,0];
			this.buy2 = [0,0];
			this.buy3 = [0,0];
			this.buy4 = [0,0];
			this.buy5 = [0,0];
			if(this.keyboardPriceType == 4){
				this.keyboardPriceType = 3;
				this.sellPrice = this.LastData[3].toFixed(this.chooseContract.dotSize);
				this.buyPrice = this.LastData[3].toFixed(this.chooseContract.dotSize);
				this.price = '市价';
			}
		},
		LastData:function(){
			if(this.keyboardPriceType == 1){
				//排队价
				this.sellPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
				this.buyPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
			}else if(this.keyboardPriceType == 2){
				//对手价
				this.sellPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
				this.buyPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
			}else if(this.keyboardPriceType == 3){
				//市价
				this.sellPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
				this.buyPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
			}
		},
		tradeTabIndex:function(){
			if(this.tradeTabIndex != 1){
				this.isShowKeyboard = false;
				this.keyboardType = -1;
			}
		},
		isTradeLogin:function(){
			if(this.isTradeLogin){
				if(this.loginErrorLayer!=null){
					layer.close(this.loginErrorLayer);
				}
			}
		}
	},
	mounted() {
		
	},
	methods:{
		//切换页面
		switchPage(index){
			if(this.scrollTimer != null){
				clearTimeout(this.scrollTimer); 
			}
			this.pageIndex = index;
			this.scrollTimer = setTimeout(function(){
				mui('.detail-list-scroll').scroll();
			},500);
		},
		//打开键盘
		showKeyboard(type){
			this.isShowKeyboard = true;
			this.keyboardType = type;
			setTimeout(function(){
				if(!this.isShowKeyboard){
					this.keyboardType = -1;
				}
			}.bind(this),500)
		},
		//关闭键盘
		closeKeyboard(){
			this.isShowKeyboard = false;
			if(this.handNum==''||this.handNum==0){
				this.handNum = 1;
			}
			setTimeout(function(){
				if(!this.isShowKeyboard){
					this.keyboardType = -1;
				}
			}.bind(this),500)
		},
		//输入数字
		chooseKeyboardNum(num){
			if(num == '市价'||num == '对手价'||num == '排队价'){
				this.price = num;
				this.keyboardPriceType = num=='市价'?3:num=='对手价'?2:num=='排队价'?1:4;
				if(num=='市价'){
					this.sellPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
					this.buyPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
				}else if(num=='对手价'){
					this.sellPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
					this.buyPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
				}else if(num=='排队价'){
					this.sellPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
					this.buyPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
				}
			}if(num == '限价'){
				this.keyboardPriceType = 4;
				this.price = this.LastData[3];
			}else if(typeof(num) == 'number'){
				if(this.keyboardType == 1){
					if(this.isFirstHand){
						this.handNum = num;
						this.isFirstHand = false;
					}else{
						if(this.handNum == 0){
							this.handNum = '';
						}
						this.handNum = this.handNum.toString() + num.toString();
						if(Number(this.handNum)>99){
							this.handNum = 99;
						}
					}
				}else if(this.keyboardType == 2){
					this.keyboardPriceType = 4;
					if(this.price == '市价'||this.price == '限价'||this.price == '对手价'||this.price == '排队价'){
						this.price = num.toString();
					}else{
						if(this.price == 0){
							this.price = '';
						}
						this.price = this.price.toString() + num.toString();
					}
				}
			}else if(num == '.'){
				if(this.price == '市价'||this.price == '限价'||this.price == '对手价'||this.price == '排队价'){
					return;
				}
				if(this.price.indexOf('.') == -1&&(this.price !='0'||this.price !='')){
					this.price = this.price.toString() + num.toString();
				}
			}else if(num == 'back'){
				if(this.keyboardType == 1){
					this.handNum = this.handNum.toString();
					this.handNum = this.handNum.substr(0,this.handNum.length-1);
					if(this.handNum==''){
						this.handNum = 0;
					}
				}else if(this.keyboardType == 2){
					if(this.price==''||this.price==0||this.price == '市价'||this.price == '限价'||this.price == '对手价'||this.price == '排队价'){
						return;
					};
					this.price = this.price.toString();
					this.price = this.price.substr(0,this.price.length-1);
					if(this.price==''){
						this.price = '0';
					}
				}
			}else if(num == '加'){
				if(this.keyboardType == 1){
					this.handNum = Number(this.handNum)+1;
					if(this.handNum>99){
						this.handNum = 99;
					}
				}else if(this.keyboardType == 2){
					if(this.keyboardPriceType==4){
						this.price = (Number(this.price)+Number(this.chooseContract.mini_ticker_size)).toFixed(this.chooseContract.dotSize);
					}
				}
			}else if(num == '减'){
				if(this.keyboardType == 1){
					this.handNum = Number(this.handNum)-1;
					if(this.handNum<=0){
						this.handNum = 1;
					}
				}else if(this.keyboardType == 2){
					if(this.keyboardPriceType==4){
						this.price = (Number(this.price)-this.chooseContract.mini_ticker_size).toFixed(this.chooseContract.dotSize);
						if(this.price<=0){
							this.price = 0;
						}
					}
				}
			}
		},
		//选择手数
		chooseNum(index){
			if(index == 1){
				//加
				this.handNum ++;
			}else if(index == 2){
				//减
				if(this.handNum - 1 == 0){
					this.handNum = 1;
					return;
				}
				this.handNum --;
			}
		},
		//买卖
		tradeBtn(index){
			if(!this.isNetworkConnect){
				//未联网
				layer.msg('未连接到网络，请检查网络设置',{
					time:2000
				});
				return;
			}
			if(!tradeStore.state.isTradeLogin||!isLogin){
				this.loginErrorLayer = layer.open({
					type:1,
					content:$('#tradeLoginLayer2'),
					area:['7.3rem','6rem'],
					shadeClose:true,
					title:null,
					closeBtn:0
				});
				return;
			}
			this.closeKeyboard();
			var needMoney = (Number(this.chooseContract.deposit)*Number(this.handNum)+Number(this.chooseContract.fee)*Number(this.handNum))*this.rateList[this.chooseContract.currencyNo];
			var haveMoney = this.todayCanUseBalance+this.totalFloatProfit;
			this.needMoney = ((Number(this.chooseContract.deposit)*Number(this.handNum)+Number(this.chooseContract.fee)*Number(this.handNum))*this.rateList[this.chooseContract.currencyNo]/this.rateList.CNY);
			this.needMoney = Number(this.needMoney.toFixed(2));
			// if(needMoney>haveMoney){
			// 	//余额不足
			// 	if(this.tradeType == 0){
			// 		layer.msg('余额不足，请领取模拟金',{
			// 			time:1500
			// 		});
			// 	}else{
			// 		layer.open({
			// 			type:1,
			// 			content:$('#balanceInfoLayer'),
			// 			area:['7.3rem','6rem'],
			// 			shadeClose:true,
			// 			title:null,
			// 			closeBtn:0,
			// 		})
			// 	}
			// 	return;
			// }
			if(index == 1){
				//买入
				this.direction = 0;
			}else if(index == 2){
				//卖出
				this.direction = 1;
			}
			layer.open({
				type:1,
				content:$('#confirmOrderOpenLayer'),
				area:['7.3rem','6rem'],
				shadeClose:true,
				title:null,
				closeBtn:0
			})   
		},
		layerBtn(index){
			if(index == 1){
				//取消
				layer.closeAll();
			}else if(index == 2){
				if(this.isSendData){
					return
				};
				this.isSendData = true;
				//确定下单
				var method = 'InsertOrder'; //调用方法
				var params = {
					CommodityType:Number(this.chooseContract.typeCode), //1国际期货
					ExchangeNo:this.chooseContract.exchange_no,// 交易所代码
					CommodityNo:this.chooseContract.commodity_no,//品种代码
					ContractNo:this.chooseContract.main_contract_no,//合约代码
					OrderNum:Number(this.handNum),//订单数量
					Direction:this.direction,//买卖方向 0:买 1:卖
					PriceType:this.keyboardPriceType==3?1:0,//价格类型 0:限价 1:市价
					LimitPrice:this.keyboardPriceType==3?0:this.keyboardPriceType==4?Number(this.price):this.direction==0?Number(this.buyPrice):Number(this.sellPrice),//限价价格
					OrderRef:'',//自定义数据
					OpenCloseType:1,//开平类型 1-开仓 2-平仓 3-平今
				}; //传入参数
				tradeStore.dispatch('sendWS',{method,params});
				layer.closeAll();
				setTimeout(function(){
					this.isSendData = true;
				}.bind(this),500);
			}
		},
		//提示未登录交易弹窗按钮
		layerInfoBtn(index){
			if(index == 1){
				//取消
				layer.closeAll();
			}else if(index == 2){
				//去登录
				pushRoute({
					page:'/PQ/pages/my/login/login.html',
					params:{
						loginBackPage:'/PQ/pages/quato/quatoDetail/quatoDetail.html',
						tradeTabIndex:tradePageStore.state.tradeTabIndex,
					}
				})
			}
		},
		closeLayer(){
			layer.closeAll();
		},
		goToPage(path){
			var isLayer = false;
			if(arguments[1]==1){
				isLayer = true;
			}
			var params = {
				tradeTabIndex:tradePageStore.state.tradeTabIndex,
			}
			if(isLayer){
				params.money = this.needMoney;
			}
			pushRoute({
				page:path,
				params:params
			})
		}
	}
})
//交易中心
var tradeCenterPage = new Vue({
	el:'#trade-center-page',
	data:{
		isNormalPrice:false,//是否市价
		handNum:1, //手数
		isFirstHand:true,//是否首次
		stopHandNum:1,//止损手数
		limitPrice:'市价' ,//限价价格
		tabIndex:1, //导航索引
		contractIndex:-1,//选择合约
		layerTabIndex:0,//止损止盈导航索引
		selectContractItem:{},//选择的合约
		direction:0,//买卖方向 0:买 1:卖
		confirmInfoType:0, //0提交订单 1全部平仓 2平仓 3全撤 4撤单 5止盈止损 6改单 7反手
		layerTabIndex:0,//0止损 1止盈
		stopLossType:0,//止损方式 0止损价 1动态价
		stopLossPrice:0,//设置止损价
		stopLossRate:0,//止损价幅度
		stopProfitPrice:0,//止盈价格
		stopProfitRate:0,//止盈价幅度
		selectContractLastData:[], //选择的持仓合约的最新数据
		changeOrderPrice:0,//改单委托价格
		changeOrderNum:0,//改单委托数量
		isShowKeyboard:false, //是否显示键盘
		keyboardPriceType:3,//键盘1:排队价 2:对手价 3市价 4限价
		keyboardType:-1,//1手数 2价格
		isShowPriceType:false,//是否显示价格类型选择
		sellPrice:0, //卖价
		buyPrice:0, //买价
		forceLine:0,//交易平仓线
		allOrderHandNum:0, //成交合计总手数
		templeOrderHandNum:0,//挂单合计总手数
		needMoney:0, //购买合约需要的资金
		capitalInfoLayer:null,//资金介绍弹窗
		capitalInfoTitle:'',//资金介绍弹窗头部文字
		capitalInfoContent:'',//资金介绍弹窗内容文字
		capitalType1:true,//人民币
		capitalType2:true,//美元
		positionCashDeposit:0,//持仓保证金
		finishOrderList:[],//成交订单
		isSendData:false,//是否正在请求中 防止抖动
		isLogin:isLogin,
	},
	computed:{
		choosePage:function(){
			return tradePageStore.state.choosePage;
		},
		LastData:function(){
			//选择合约的最新数据
			return marketStore.state.LastData;
		},
		chooseContract:function(){
			return tradeStore.state.chooseContract;
		},
		tradeBascData:function(){
			//交易基本数据
			return tradeStore.state.tradeBascData;
		},
		deposit:function(){
			return tradeStore.state.deposit;
		},
		totalBalance:function(){
			//总资产
			return tradeStore.state.totalBalance;
		},
		todayCanUseBalance:function(){
			//今可用
			return tradeStore.state.todayCanUseBalance;
		},
		positionList:function(){
			//持仓列表
			return tradeStore.state.positionList;
		},
		templeList:function(){
			//挂单列表
			return tradeStore.state.templeList;
		},
		allOrderList:function(){
			//委托单列表(全部列表)
			return tradeStore.state.allOrderList;
		},
		totalFloatProfit:function(){
			//总浮动盈亏
			return marketStore.state.totalFloatProfit;
		},
		internationalCommodity:function(){
			//订阅的合约
			return marketStore.state.internationalCommodity;
		},
		allSubsCommodity:function(){
			return marketStore.state.allSubsCommodity;
		},
		totalPositionNum:function(){
			return tradeStore.state.totalPositionNum;
		},
		tradeTabIndex:function(){
			return tradePageStore.state.tradeTabIndex;
		},
		RMBRate:function(){
			return marketStore.state.RMBRate;
		},
		tradeType:function(){
			return tradeStore.state.tradeType;
		},
		rateList:function(){
			return tradeStore.state.rateList;
		},
		depositList:function(){
			return marketStore.state.depositList;
		},
		feeList:function(){
			return marketStore.state.feeList;
		},
		isTradeLogin:function(){
			return tradeStore.state.isTradeLogin;
		},
		isNetworkConnect:function(){
			return tradePageStore.state.isNetworkConnect;
		},
		activityStatus:function(){
			return tradeStore.state.activityStatus;
		},
		received:function(){
			return tradeStore.state.received;
		},
		faceValue:function(){
			return tradeStore.state.faceValue;
		},
		couponName:function(){
			return tradeStore.state.couponName;
		},
		activitiesName:function(){
			return tradeStore.state.activitiesName;
		}
	},
	watch:{
		positionList:function(){
			this.positionCashDeposit = 0;
			for(var i=0;i<this.positionList.length;i++){
				this.positionCashDeposit = (this.positionCashDeposit+this.depositList[this.positionList[i].CommodityNo]*this.positionList[i].HoldNum*this.rateList[this.positionList[i].CurrencyNo]);
				if(this.selectContractItem.CommodityNo == this.positionList[i].CommodityNo){
					this.selectContractItem = this.positionList[i];
				}
			}
		},
		templeList:function(){
			this.templeOrderHandNum = 0;
			for(var i=0;i<this.templeList.length;i++){
				if(this.templeList[i].OrderStatus == 1){
					this.templeOrderHandNum+=this.templeList[i].OrderNum;
				}
			}
		},
		stopLossType:function(){
			this.setStopLossType();
		},
		allSubsCommodity:function(){
			if(this.selectContractItem){
				var allSubsCommodity = this.allSubsCommodity;
				for(var i=0,length=allSubsCommodity.length;i<length;i++){
					if(allSubsCommodity[i].commodity_no == this.selectContractItem.CommodityNo){
						this.selectContractLastData = allSubsCommodity[i].quatoData;
					}
				}
			}
		},
		LastData:function(){
			if(this.keyboardPriceType == 1){
				//排队价
				this.sellPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
				this.buyPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
			}else if(this.keyboardPriceType == 2){
				//对手价
				this.sellPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
				this.buyPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
			}else if(this.keyboardPriceType == 3){
				//市价
				this.sellPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
				this.buyPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
			}
		},
		tradeTabIndex:function(){
			if(this.tradeTabIndex != 1){
				this.isShowKeyboard = false;
				this.keyboardType = -1;
			}
		},
		deposit:function(){
			if(this.tradeBascData.RiskRatioForceStatus){
				//开启风险度风控
				this.forceLine = this.deposit/this.tradeBascData.RiskRatioForceClose;
			}else{
				if(this.tradeBascData.BalanceForceStatus){
					//开启净值风险度
					this.forceLine = this.tradeBascData.BalanceForceClose;
				}else{
					
				}
			}
		},
		allOrderList:function(){
			this.allOrderHandNum = 0;
			this.finishOrderList = [];
			for(var i=0;i<this.allOrderList.length;i++){
				if(this.allOrderList[i].OrderStatus == 3){
					this.allOrderHandNum+=this.allOrderList[i].TradeNum;
					this.finishOrderList.push(this.allOrderList[i]);
				}
			}
		},
		chooseContract:function(){
			if(this.keyboardPriceType == 4){
				this.keyboardPriceType = 3;
				this.sellPrice = this.LastData[3];
				this.buyPrice = this.LastData[3];
				this.limitPrice = '市价';
			}
		},
		isTradeLogin:function(){
			if(this.isTradeLogin){
				if(this.loginErrorLayer!=null){
					layer.close(this.loginErrorLayer);
				}
			}
		}
	},
	mounted() {
		var _this = this;
	},
	methods:{
		//切换实体盘模拟盘
		switchCapitalType(index){
			if(index == 0){
				this.capitalType1 = !this.capitalType1;
				if(!this.capitalType2&&!this.capitalType1){
					this.capitalType2 = true;
				}
			}else if(index == 1){
				this.capitalType2 = !this.capitalType2;
				if(!this.capitalType2&&!this.capitalType1){
					this.capitalType1 = true;
				}
			}
		},
		//查询活动
		checkActivity(){
			var activityType = '020';
			if(this.tradeType == 0){
				//模拟
				activityType = '020';
			}else if(this.tradeType == 1){
				//实盘
				activityType = '022,023';
			}
			request.post('/qryActivites',{
				activityType:activityType
			},{
				token:userInfo.token,
				secret:userInfo.secret
			}).then(function(res){
				if(res.success&&res.code == '010'){
					for(var i=0;i<res.data.length;i++){
						if(res.data[i].complatedStatus=='020'&&res.data[i].received=='010'){
							tradeStore.state.activityStatus = res.data[i].complatedStatus;
							tradeStore.state.received = res.data[i].received;
							var a = res.data[i].id;
							tradeStore.state.activityId = res.data[i].id;
							request.post('/activitiesCoupon',{
								activityId: a,
							},{
								token:userInfo.token,
								secret:userInfo.secret
							}).then((res2)=>{
								if(res2.success&&res2.code=='010'){
									tradeStore.state.couponId = res2.data.couponId;
									tradeStore.state.faceValue = res2.data.amount;
									tradeStore.state.couponName = res2.data.typeName;
									tradeStore.state.activitiesName = res2.data.activitiesName;
								}else{
									layer.msg(res2.message,{
										time:1500
									})
								}
							}).catch((err)=>{
								
							})
							break;
						}
					}
				}else{
					layer.msg(res.message,{
						time:1500,
					})
				}
			}).catch(function(err){
				
			})
		},
		//打开领取红包页面
		openRedLayer(index){
			if(index == 0){
				//模拟
			}else if(index == 1){
				//实盘
			}
			if(tradeStore.state.received=='010'&&tradeStore.state.activityStatus=='020'){
				request.post('/receiveCoupon',{
					activityId: tradeStore.state.activityId,
					couponId: tradeStore.state.couponId
				},{
					token:userInfo.token,
					secret:userInfo.secret
				}).then((res)=>{
					if(res.success&&res.code == '010'){
						tradeStore.state.received = '020';
						layer.msg('领取成功',{
							time:1500
						})
						layer.open({
							type:1,
							content:$('#redLayer'),
							area:['7.3rem','6rem'],
							shadeClose:true,
							title:null,
							closeBtn:0,
						})
						this.checkActivity();
					}else{
						layer.msg(res.message,{
							time:1500
						})
					}
				}).catch((err)=>{
					console.log(err);
				});
			}
		},
		//打开键盘
		showKeyboard(type){
			this.isShowKeyboard = true;
			this.keyboardType = type;
		},
		//关闭键盘
		closeKeyboard(){
			this.isShowKeyboard = false;
			if(this.handNum==''||this.handNum==0){
				this.handNum = 1;
			}
			setTimeout(function(){
				if(!this.isShowKeyboard){
					this.keyboardType = -1;
				}
			}.bind(this),500);
		},
		//输入数字
		chooseKeyboardNum(num){
			if(num == '市价'||num == '对手价'||num == '排队价'){
				this.limitPrice = num;
				this.keyboardPriceType = num=='市价'?3:num=='对手价'?2:num=='排队价'?1:4;
				if(num=='市价'){
					this.sellPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
					this.buyPrice = Number(this.LastData[3]).toFixed(this.chooseContract.dotSize);
				}else if(num=='对手价'){
					this.sellPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
					this.buyPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
				}else if(num=='排队价'){
					this.sellPrice = Number(this.LastData[11]).toFixed(this.chooseContract.dotSize);
					this.buyPrice = Number(this.LastData[13]).toFixed(this.chooseContract.dotSize);
				}
			}if(num == '限价'){
				this.keyboardPriceType = 4;
				this.limitPrice = this.LastData[3];
			}else if(typeof(num) == 'number'){
				if(this.keyboardType == 1){
					if(this.isFirstHand){
						this.handNum = num;
						this.isFirstHand = false;
					}else{
						if(this.handNum == 0){
							this.handNum = '';
						}
						this.handNum = this.handNum.toString() + num.toString();
						if(Number(this.handNum)>99){
							this.handNum = 99;
						}
					}
				}else if(this.keyboardType == 2){
					this.keyboardPriceType = 4;
					if(this.limitPrice == '市价'||this.limitPrice == '限价'||this.limitPrice == '对手价'||this.limitPrice == '排队价'){
						this.limitPrice = num.toString();
					}else{
						if(this.limitPrice == 0){
							this.limitPrice = '';
						}
						this.limitPrice = this.limitPrice.toString() + num.toString();
					}
				}
			}else if(num == '.'){
				if(this.limitPrice == '市价'||this.limitPrice == '限价'||this.limitPrice == '对手价'||this.limitPrice == '排队价'){
					return;
				}
				if(this.limitPrice.indexOf('.') == -1&&(this.limitPrice !='0'||this.limitPrice !='')){
					this.limitPrice = this.limitPrice.toString() + num.toString();
				}
			}else if(num == 'back'){
				if(this.keyboardType == 1){
					this.handNum = this.handNum.toString();
					this.handNum = this.handNum.substr(0,this.handNum.length-1);
					if(this.handNum==''){
						this.handNum = 0;
					}
				}else if(this.keyboardType == 2){
					if(this.limitPrice==''||this.limitPrice==0||this.limitPrice == '市价'||this.limitPrice == '限价'||this.limitPrice == '对手价'||this.limitPrice == '排队价'){
						return;
					};
					this.limitPrice = this.limitPrice.toString();
					this.limitPrice = this.limitPrice.substr(0,this.limitPrice.length-1);
					if(this.limitPrice==''){
						this.limitPrice = '0';
					}
				}
			}else if(num == '加'){
				if(this.keyboardType == 1){
					this.handNum = Number(this.handNum)+1;
					if(this.handNum>99){
						this.handNum = 99;
					}
				}else if(this.keyboardType == 2){
					if(this.keyboardPriceType == 4){
						this.limitPrice = (Number(this.limitPrice)+Number(this.chooseContract.mini_ticker_size)).toFixed(this.chooseContract.dotSize);
					}
				}
			}else if(num == '减'){
				if(this.keyboardType == 1){
					this.handNum = Number(this.handNum)-1;
					if(this.handNum<=0){
						this.handNum = 1;
					}
				}else if(this.keyboardType == 2){
					if(this.keyboardPriceType == 4){
						this.limitPrice = (Number(this.limitPrice)-this.chooseContract.mini_ticker_size).toFixed(this.chooseContract.dotSize);
						if(this.limitPrice<=0){
							this.limitPrice = 0;
						}
					}
				}
			}
		},
		//关闭弹窗
		closeLayer(){
			layer.closeAll();
		},
		//切换导航时候将选择的合约去掉
		switchTab(){
			this.contractIndex = -1;
		},
		//切换止盈止损
		switchLayerTab(index){
			if(this.layerTabIndex == index){
				return;
			}
			this.layerTabIndex = index;
		},
		showChooseType(){
			this.isShowPriceType = !this.isShowPriceType;
		},
		//加减手数
		chooseNum(index){
			if(index == 1){
				//加
				this.handNum++;
			}else if(index == 2){
				//减
				if(this.handNum - 1 == 0){
					this.handNum = 1;
					return;
				}
				this.handNum --;
			}
		},
		//选择合约
		selectContract(item,index){
			if(this.contractIndex == index){
				this.contractIndex = -1;
				this.selectContractItem = {};
				return;
			}
			if(item == 'all'){
				this.selectContractItem = {};
				this.contractIndex = index;
			}else{
				if(arguments[2]==1){
					//切换合约
					emitter.$emit('selectContractBtn',item);
				}
				this.selectContractItem = item;
				this.contractIndex = index;
				for(var i=0;i<this.allSubsCommodity.length;i++){
					if(item.CommodityNo == this.allSubsCommodity[i].commodity_no){
						this.selectContractLastData = this.allSubsCommodity[i].quatoData;
						break;
					}
				}
			}
		},
		//买卖按钮
		tradeBtn(index){
			this.closeKeyboard();
			if(!this.isNetworkConnect){
				//未联网
				layer.msg('未连接到网络，请检查网络设置',{
					time:2000
				});
				return;
			}
			if(!tradeStore.state.isTradeLogin||!this.isLogin){
				layer.open({
					type:1,
					content:$('#tradeLoginLayer3'),
					area:['7.3rem','6rem'],
					shadeClose:true,
					title:null,
					closeBtn:0
				});
				return;
			}
			var needMoney = (Number(this.chooseContract.deposit)*Number(this.handNum)+Number(this.chooseContract.fee)*Number(this.handNum))*this.rateList[this.chooseContract.currencyNo];
			var haveMoney = this.todayCanUseBalance+this.totalFloatProfit;
			this.needMoney = ((Number(this.chooseContract.deposit)*Number(this.handNum)+Number(this.chooseContract.fee)*Number(this.handNum))*this.rateList[this.chooseContract.currencyNo]/this.rateList.CNY);
			this.needMoney = Number(this.needMoney.toFixed(2));
			// if(needMoney>haveMoney){
			// 	//余额不足
			// 	if(this.tradeType == 0){
			// 		//模拟盘
			// 		layer.msg('余额不足，请领取模拟金',{
			// 			time:1500
			// 		});
			// 	}else{
			// 		//实体盘
			// 		layer.open({
			// 			type:1,
			// 			content:$('#balanceInfoLayer'),
			// 			area:['7.3rem','6rem'],
			// 			shadeClose:true,
			// 			title:null,
			// 			closeBtn:0,
			// 		})
			// 	}
			// 	return;
			// }
			if(index == 1){
				//买入
				this.direction = 0;
			}else if(index == 2){
				//卖出
				this.direction = 1;
			}
			this.confirmInfoType = 0;
			layer.open({
				type:1,
				content:$('#confirmOrderLayer'),
				area:['7.3rem','6rem'],
				shadeClose:true,
				title:null,
				closeBtn:0,
			})
		},
		//打开资金介绍弹窗
		openCapitalInfo(index){
			if(index == 1){
				//总资产
				this.capitalInfoTitle = '总资产';
				this.capitalInfoContent = '当前账户的全部资产，包括已买入持仓的保证金、盈亏和未出金的剩余资金。';
			}else if(index == 2){
				//可用资金
				this.capitalInfoTitle = '可用资金';
				this.capitalInfoContent = '可用于新买入持仓或进行提现的资金。';
			}else if(index == 3){
				//风险度
				this.capitalInfoTitle = '风险度';
				this.capitalInfoContent = '根据您的总资产和平仓线计算出的账户风险情况，当达到100%时，持仓将被系统强平。';
			}else if(index == 4){
				//平仓线
				this.capitalInfoTitle = '平仓线';
				this.capitalInfoContent = '被系统强制平仓的资产底线，当总资产小于该数值时，您的持仓将被系统强平。';
			}else if(index == 5){
				//持仓保证金
				this.capitalInfoTitle = '持仓保证金';
				this.capitalInfoContent = '被持仓占用的资金，持仓越多占用的保证金数值越大，平仓后该资金将会进行释放。';
			}
			this.capitalInfoLayer = layer.open({
				type:1,
				content:$('#capitalInfoLayer2'),
				area:['7.3rem','6rem'],
				shadeClose:true,
				title:null,
				closeBtn:0,
			})
		},
		//关闭资金信息介绍弹窗
		closeCapitalInfo(){
			layer.close(this.capitalInfoLayer);
		},
		//持仓列表的操作按钮
		positionBtn(index){
			if(this.positionList.length==0){
				layer.msg('暂无持仓',{
					time:1000,
					area:'inherit'
				});
				return;
			}
			if(index == 1){
				//全部平仓
				this.confirmInfoType = 1;
				layer.open({
					type:1,
					content:$('#confirmAllayer'),
					area:['7.3rem','6rem'],
					shadeClose:true,
					title:null,
					closeBtn:0,
				})
			}else if(index == 2){
				if(this.contractIndex<0){
					layer.msg('请先选择一条合约',{
						time:1000,
						area:'inherit'
					});
					return;
				}
				//平仓
				this.confirmInfoType = 2;
				layer.open({
					type:1,
					content:$('#confirmInfoLayer'),
					area:['7.3rem','6rem'],
					shadeClose:true,
					title:null,
					closeBtn:0,
				})
			}else if(index == 3){
				//止盈止损
				if(this.contractIndex<0){
					layer.msg('请先选择一条合约',{
						time:1000,
						area:'inherit'
					});
					return;
				}
				this.confirmInfoType = 5;
				layer.open({
					type:1,
					content:$('#stopProfitLossLayer'),
					area:['8.27rem','5.8666rem'],
					shadeClose:true,
					title:null,
					closeBtn:0,
				});
				var internationalCommodity = this.internationalCommodity;
				for(var i=0,length=internationalCommodity.length;i<length;i++){
					if(internationalCommodity[i].commodity_no == this.selectContractItem.CommodityNo){
						this.selectContractLastData = internationalCommodity[i].quatoData;
					}
				}
				this.stopLossType = 0;
				this.stopLossPrice = this.selectContractLastData[3];
				this.stopProfitPrice = this.selectContractLastData[3];
				this.stopHandNum = this.selectContractItem.HoldNum;
				if(this.selectContractItem.Direction == 0){
					//多
					this.stopLossRate = (this.stopLossPrice-this.selectContractItem.OpenAvgPrice)/this.selectContractItem.OpenAvgPrice*100;
					this.stopProfitRate = (this.stopProfitPrice-this.selectContractItem.OpenAvgPrice)/this.selectContractItem.OpenAvgPrice*100;
				}else if(this.selectContractItem.Direction == 1){
					//空
					this.stopLossRate = (this.selectContractItem.OpenAvgPrice-this.stopLossPrice)/this.selectContractItem.OpenAvgPrice*100;
					this.stopProfitRate = (this.selectContractItem.OpenAvgPrice-this.stopProfitPrice)/this.selectContractItem.OpenAvgPrice*100;
				}
			}else if(index == 4){
				//反手
				if(this.contractIndex<0){
					layer.msg('请先选择一条合约',{
						time:1000,
						area:'inherit'
					});
					return;
				}
				this.confirmInfoType = 7;
				layer.open({
					type:1,
					content:$('#confirmInfoLayer'),
					area:['7.3rem','6rem'],
					shadeClose:true,
					title:null,
					closeBtn:0,
				})
			}
		},
		//撤单改单操作按钮
		changeOrderBtn(index){
			if(this.templeList.length==0){
				layer.msg('暂无挂单',{
					time:1000,
					area:'inherit'
				});
				return;
			}
			if(index == 1){
				//全撤
				this.confirmInfoType = 3;
				layer.open({
					type:1,
					content:$('#confirmAllayer'),
					area:['7.3rem','6rem'],
					shadeClose:true,
					title:null,
					closeBtn:0,
				})
			}else if(index == 2){
				//撤单
				if(this.contractIndex<0){
					layer.msg('请先选择一条合约',{
						time:1000,
						area:'inherit'
					});
					return;
				}
				this.confirmInfoType = 4;
				layer.open({
					type:1,
					content:$('#confirmInfoLayer'),
					area:['7.3rem','6rem'],
					shadeClose:true,
					title:null,
					closeBtn:0,
				})
			}else if(index == 3){
				//改单
				if(this.contractIndex<0){
					layer.msg('请先选择一条合约',{
						time:1000,
						area:'inherit'
					});
					return;
				}
				this.changeOrderPrice = this.selectContractItem.OrderPrice;
				this.changeOrderNum = this.selectContractItem.OrderNum;
				this.confirmInfoType = 6;
				layer.open({
					type:1,
					content:$('#changeOrderLayer'),
					area:['7.3rem','6rem'],
					shadeClose:true,
					title:null,
					closeBtn:0,
				})
				
			}
		},
		//确认信息弹窗按钮
		layerInfoBtn(index){
			if(index == 1){
				//取消
				this.layerTabIndex = 0;
				layer.closeAll();
			}else if(index == 2){
				if(this.isSendData){
					return;
				}
				if(this.confirmInfoType == 0){
					//提交订单
					console.log('提交订单');
					var method = 'InsertOrder'; //调用方法
					var params = {
						CommodityType:Number(this.chooseContract.typeCode), //1国际期货
						ExchangeNo:this.chooseContract.exchange_no,// 交易所代码
						CommodityNo:this.chooseContract.commodity_no,//品种代码
						ContractNo:this.chooseContract.main_contract_no,//合约代码
						OrderNum:Number(this.handNum),//订单数量
						Direction:this.direction,//买卖方向 0:买 1:卖
						PriceType:this.keyboardPriceType==3?1:0,//价格类型 0:限价 1:市价
						LimitPrice:this.keyboardPriceType==3?0:this.keyboardPriceType==4?Number(this.limitPrice):this.direction==0?Number(this.buyPrice):Number(this.sellPrice),//限价价格
						OrderRef:'',//自定义数据
						OpenCloseType:1,//开平类型 1-开仓 2-平仓 3-平今
					}; //传入参数
					this.isSendData = true;
					tradeStore.dispatch('sendWS',{method,params});
				}else if(this.confirmInfoType == 1){
					//全部平仓
					console.log('全部平仓');
					this.contractIndex = -1;
					var positionList = this.positionList;
					var method = 'InsertOrder'; //调用方法
					for(var i=0,length=positionList.length;i<length;i++){
						var params = {
							CommodityType:Number(positionList[i].CommodityType), //1国际期货
							ExchangeNo:positionList[i].ExchangeNo,// 交易所代码
							CommodityNo:positionList[i].CommodityNo,//品种代码
							ContractNo:positionList[i].ContractNo,//合约代码
							OrderNum:Number(positionList[i].HoldNum),//订单数量
							Direction:positionList[i].Direction==0?1:0,//买卖方向 0:买 1:卖
							PriceType:1,//价格类型 0:限价 1:市价
							LimitPrice:0,//限价价格
							OrderRef:'',//自定义数据
							OpenCloseType: 3,
						}; 
						//传入参数
						this.isSendData = true;
						tradeStore.dispatch('sendWS',{method,params});
					}
				}else if(this.confirmInfoType == 2){
					//平仓
					console.log('平仓');
					var method = 'InsertOrder'; //调用方法
					var params = {
						CommodityType:Number(this.selectContractItem.CommodityType), //1国际期货
						ExchangeNo:this.selectContractItem.ExchangeNo,// 交易所代码
						CommodityNo:this.selectContractItem.CommodityNo,//品种代码
						ContractNo:this.selectContractItem.ContractNo,//合约代码
						OrderNum:Number(this.selectContractItem.HoldNum),//订单数量
						Direction:this.selectContractItem.Direction==0?1:0,//买卖方向 0:买 1:卖
						PriceType:1,//价格类型 0:限价 1:市价
						LimitPrice:0,//限价价格
						OrderRef:'',//自定义数据
						OpenCloseType:2,//开平类型 1-开仓 2-平仓 3-平今
					}; //传入参数
					this.isSendData = true;
					tradeStore.dispatch('sendWS',{method,params});
					this.contractIndex = -1;
				}else if(this.confirmInfoType == 3){
					//全撤
					console.log('全撤');
					this.contractIndex = -1;
					var templeList = this.templeList;
					var method = 'CancelOrder'; //调用方法
					for(var i=0,length=templeList.length;i<length;i++){
						var params = {
							OrderSysID:templeList[i].OrderSysID, //1系统编号
							OrderID:templeList[i].OrderID, //1订单号
						}; //传入参数
						var req_id = '撤单';
						this.isSendData = true;
						tradeStore.dispatch('sendWS',{method,params,req_id});
					}
				}else if(this.confirmInfoType == 4){
					//撤单
					console.log('撤单');
					var method = 'CancelOrder'; //调用方法
					var params = {
						OrderSysID:this.selectContractItem.OrderSysID, //1系统编号
						OrderID:this.selectContractItem.OrderID, //1订单号
					}; //传入参数
					var req_id = '撤单';
					this.isSendData = true;
					tradeStore.dispatch('sendWS',{method,params,req_id});
					this.contractIndex = -1;
				}else if(this.confirmInfoType == 5){
					//止损止盈
					if(this.stopLossPrice==''||this.stopHandNum==''){
						layer.msg('请输入值',{
							time:1000,
						});
						return;
					}
					if(this.stopHandNum>this.selectContractItem.HoldNum){
						this.stopHandNum = this.selectContractItem.HoldNum;
						layer.msg('手数不能超过持仓手数',{
							time:1000
						});
						return;
					}
					if(this.stopHandNum<=0){
						this.stopHandNum = this.selectContractItem.HoldNum;
						layer.msg('手数不能小于0',{
							time:1000
						});
						return;
					}
					this.confrimStopOrder();
				}else if(this.confirmInfoType == 6){
					//改单
					var method = 'ModifyOrder'; //调用方法
					var params = {
						OrderSysID:this.selectContractItem.OrderSysID, //1系统编号
						OrderID:this.selectContractItem.OrderID, //1订单号
						OrderNum:Number(this.changeOrderNum), //1订单号
						OrderPrice:Number(this.changeOrderPrice), //1订单号
					}; //传入参数
					var req_id = '改单';
					this.isSendData = true;
					tradeStore.dispatch('sendWS',{method,params,req_id});
					this.contractIndex = -1;
				}else if(this.confirmInfoType == 7){
					//反手
					console.log('反手');
// 					var method = 'InsertOrder'; //调用方法
// 					var params = {
// 						CommodityType:1, //1国际期货
// 						ExchangeNo:this.selectContractItem.ExchangeNo,// 交易所代码
// 						CommodityNo:this.selectContractItem.CommodityNo,//品种代码
// 						ContractNo:this.selectContractItem.ContractNo,//合约代码
// 						OrderNum:Number(this.selectContractItem.HoldNum),//订单数量
// 						Direction:this.selectContractItem.Direction==0?1:0,//买卖方向 0:买 1:卖
// 						PriceType:1,//价格类型 0:限价 1:市价
// 						LimitPrice:0,//限价价格
// 						OrderRef:'',//自定义数据
// 						// OpenCloseType:2,//开平类型 1-开仓 2-平仓 3-平今
// 					}; //传入参数
// 					tradeStore.dispatch('sendWS',{method,params});
					var method = 'InsertOrder'; //调用方法
					var params = {
						CommodityType:Number(this.selectContractItem.CommodityType), //1国际期货
						ExchangeNo:this.selectContractItem.ExchangeNo,// 交易所代码
						CommodityNo:this.selectContractItem.CommodityNo,//品种代码
						ContractNo:this.selectContractItem.ContractNo,//合约代码
						OrderNum:Number(this.selectContractItem.HoldNum)*2,//订单数量
						Direction:this.selectContractItem.Direction==0?1:0,//买卖方向 0:买 1:卖
						PriceType:1,//价格类型 0:限价 1:市价
						LimitPrice:0,//限价价格
						OrderRef:'',//自定义数据
					}; //传入参数
					this.isSendData = true;
					tradeStore.dispatch('sendWS',{method,params});
					this.contractIndex = -1;
				}
				this.layerTabIndex = 0;
				layer.closeAll();
				setTimeout(function(){
					this.isSendData = false;
				}.bind(this),500);
			}
		},
		//设置止损类型
		setStopLossType(){
			if(this.stopLossType == 0){
				//止损价
				this.stopLossPrice = this.selectContractLastData[3];
			}else if(this.stopLossType == 1){
				//动态价
				this.stopLossPrice = this.selectContractItem.mini_ticker_size;
				this.stopLossRate = -this.stopLossPrice/this.selectContractItem.OpenAvgPrice*100;
			}
		},
		//设置止损价格
		setStopLossPrice(){
			if(this.stopLossType == 0){
				if(this.selectContractItem.Direction == 0){
					//多
					this.stopLossRate = (this.stopLossPrice-this.selectContractItem.OpenAvgPrice)/this.selectContractItem.OpenAvgPrice*100;
				}else if(this.selectContractItem.Direction == 1){
					//空
					this.stopLossRate = (this.selectContractItem.OpenAvgPrice-this.stopLossPrice)/this.selectContractItem.OpenAvgPrice*100;
				}
			}else if(this.stopLossType == 1){
				this.stopLossRate = -this.stopLossPrice/this.selectContractItem.OpenAvgPrice*100;
			}
		},
		//设置止盈价格
		setStopProfitPrice(){
			if(this.selectContractItem.Direction == 0){
				//多
				this.stopProfitRate = (this.stopProfitPrice-this.selectContractItem.OpenAvgPrice)/this.selectContractItem.OpenAvgPrice*100;
			}else if(this.selectContractItem.Direction == 1){
				//空
				this.stopProfitRate = (this.selectContractItem.OpenAvgPrice-this.stopProfitPrice)/this.selectContractItem.OpenAvgPrice*100;
			}
		},
		//设置止损手数
		setStopHandNum(){
			if(this.stopHandNum>this.selectContractItem.HoldNum){
				layer.msg('不能超过最大手数',{
					time:1000,
					area:'inherit'
				});
				this.stopHandNum = this.selectContractItem.HoldNum;
			}
		},
		//止盈止损确认按钮
		confrimStopOrder(){
			var method = 'InsertStopLoss'; //调用方法
			var params = {
				CommodityType:Number(this.selectContractItem.CommodityType), //1国际期货
				ExchangeNo:this.selectContractItem.ExchangeNo,// 交易所代码
				CommodityNo:this.selectContractItem.CommodityNo,//品种代码
				ContractNo:this.selectContractItem.ContractNo,//合约代码
				Num:Number(this.stopHandNum),//订单数量
				StopLossType:this.layerTabIndex==0?this.stopLossType==0?0:2:1,//止损类型0-限价触发止损1-限价触发止盈2-浮动止损
				StopLossPrice:this.layerTabIndex==0?Number(this.stopLossPrice):Number(this.stopProfitPrice),//止损(赢)价 
				StopLossDiff:this.stopLossType==0?0:Number(this.stopLossPrice),//动态止损的点差
				HoldAvgPrice:this.selectContractItem.HoldAvgPrice,//持仓均价
				HoldDirection:this.selectContractItem.Direction,//持仓方向
				OrderType:1,
			}
			if(this.layerTabIndex == 0){
				//止损确认
				params.StopLossType = this.stopLossType==0?0:2;
			}else if(this.layerTabIndex == 1){
				//止盈确认
				params.StopLossType = 1;
			}
			this.isSendData = true;
			tradeStore.dispatch('sendWS',{method,params});
		},
		closeLayer(){
			layer.closeAll();
		},
		goToPage(path){
			var isLayer = false;
			if(arguments[1]==1){
				isLayer = true;
			}
			var params = {
				tradeTabIndex:tradePageStore.state.tradeTabIndex,
			}
			if(isLayer){
				params.money = this.needMoney;
			}
			pushRoute({
				page:path,
				params:params
			})
		},
		//打开资金弹窗
		openCapitalLayer(){
			layer.open({
				type:1,
				content:$('#capitalInfoLayer'),
				area:['7.3rem','8rem'],
				shadeClose:true,
				title:null,
				closeBtn:0,
			})
		},
		//切换实盘模拟盘
		switchTradeType(index){
			layer.closeAll();
			tradePageStore.state.tradeType = index;
			localStorage.setItem('tradeType',index);
			pushRoute({
				page:''
			})
			tradeStore.state.tradeType = index;
			if(tradeStore.state.isTradeLogin){
				tradeStore.dispatch('connectTrade');
			}else{
				//未登录
				if(isLogin){
					tradeStore.dispatch('connectTrade');
				}else{
					
				}
			}
			if(arguments[1] == 'bottom'){
				
			}else{
				mui('.mui-off-canvas-wrap').offCanvas().close();
			}
		}
	}
});
//头部弹出框
var topPopover = new Vue({
	el:'#offCanvasSide',
	data:{
		isLogin:isLogin, //是否登录
		simPrice:0, //；领取金额
		waitTime:1000,
		isSendData:false,
	},
	computed:{
		tradeType:function(){
			return tradePageStore.state.tradeType;
		},
	},
	mounted() {
		layui.use('layer', function(){
			var layer = layui.layer;
		});
		this.getMoneyData();
	},
	methods:{
		goToPage(path){
			if(isLogin){
				if(!mui.os.plus) {
					pushRoute({
						page:path,
						params:{
							tradeTabIndex:tradePageStore.state.tradeTabIndex,
						}
					})
					return;
				}else{
					mui.openWindow({
						url:'../'+path+'/'+path+'.html?sourcePage=home&sourcePage2=trade&pageIndex='+tradePageStore.state.tabIndex+'&klineName='+tradePageStore.state.klineName+'&chartType='+tradePageStore.state.chartType,
						id:path+'.html'
					})
				}
			}else{
				if(arguments[1] == 1){
					pushRoute({
						page:path,
						params:{
							tradeTabIndex:tradePageStore.state.tradeTabIndex,
						}
					})
					return;
				}else{
					mui('.mui-off-canvas-wrap').offCanvas('close');
					emitter.$emit('openLayer');
				}
			}
		},
		//切换实盘模拟盘
		switchTradeType(index){
			tradePageStore.state.tradeType = index;
			localStorage.setItem('tradeType',index);
			tradeStore.state.tradeType = index;
			if(tradeStore.state.isTradeLogin){
				tradeStore.dispatch('connectTrade');
			}else{
				//未登录
				if(isLogin){
					tradeStore.dispatch('connectTrade');
				}else{
					
				}
			}
			mui('.mui-off-canvas-wrap').offCanvas('close');
		},
		//领取模拟金
		getMoney(){
			if(this.isSendData){
				return;
			}
			this.isSendData = true;
			request.post('/receiveSimulatedMoney',{
				amount:this.simPrice
			},{
				token:userInfo.token,
				secret:userInfo.secret,
			}).then((res)=>{
				if(res.success&&res.code == '010'){
					layer.msg('领取成功',{
						time:1500
					});
					mui('.mui-off-canvas-wrap').offCanvas('close');
					setTimeout(function(){
						this.isSendData = false;
					}.bind(this),this.waitTime)
				}else{
					layer.msg(res.message,{
						time:1500
					});
					mui('.mui-off-canvas-wrap').offCanvas('close');
					setTimeout(function(){
						this.isSendData = false;
					}.bind(this),this.waitTime)
				}
			}).catch((err)=>{
				mui('.mui-off-canvas-wrap').offCanvas('close');
				setTimeout(function(){
					this.isSendData = false;
				}.bind(this),this.waitTime)
			})
		},
		//获取模拟金金额
		getMoneyData(){
			request.post('/qryParameters',{
				paramStr:'vs.sim.amount'
			}).then((res)=>{
				if(res.success&&res.code == '010'){
					this.simPrice = res.data['vs.sim.amount'];
				}else{
					layer.msg(res.message,{
						time:1500
					})
				}
			}).catch((err)=>{
				
			})
		},
	}
})
//合约选择列表
var contractSelect = new Vue({
	el:'#contractSelect',
	data:{
		chartUrl:'../../../common/f2Chart/f2Chart.html',
		contractData:[{
			Title:'',
			List:[{
				contractName:''
			}]
		}],
	},
	computed:{
		internationalCommodity:function(){
			return marketStore.state.internationalCommodity;
		},
		allSubsCommodity:function(){
			return marketStore.state.allSubsCommodity;
		},
		domesticCommodity:function(){
			return marketStore.state.domesticCommodity;
		},
		contractList:function(){
			return marketStore.state.contractList;
		},
		period:function(){
			return tradePageStore.state.period;
		},
		priceType:function(){
			return tradePageStore.state.priceType;
		},
		chooseContract:function(){
			return tradeStore.state.chooseContract;
		},
		chooseQuatoType:function(){
			return marketStore.state.chooseQuatoType;
		},
	},
	watch:{
		allSubsCommodity:function(){
			if(this.allSubsCommodity.length==0){
				return;
			}
			var contractData = this.allSubsCommodity.slice(0);
			contractData = contractData.sort(compare('firstLetter'),false);
			function compare(prop){
				return function(a,b){
					var value1 = a[prop];
					var value2 = b[prop];
					return value1.charCodeAt()- value2.charCodeAt();
				}
			}
			this.contractData = formatList(contractData,'firstLetter');
			function formatList(arr,keyword) {
				let newArr1 = [];
				let tempArr = [];
				let reg = /\b(\w)|\s(\w)/g;
				let k = 0;
				let firstWord = arr[0][keyword].charAt(0).toUpperCase();//获取第一个分类字母
				arr.map((v) => {
					v[keyword] = v[keyword].replace(reg,m=>m.toUpperCase());//首字母大写
					if(firstWord == v[keyword].charAt(0)){
					  tempArr.push(v);
					  newArr1[k] = {
						Title:firstWord,
						List:tempArr
					  }
					}else{
					  //这里循环到这表示已经第二个字母了
					  firstWord = v[keyword].charAt(0);//设置第二字母
					  tempArr = [];//把之前的清除掉
					  tempArr.push(v);//添加第一个
					  newArr1[++k] = {//自增
						Title: firstWord,
						List : tempArr
					  }
					}
				});
				return newArr1;
			}
		},
		// internationalCommodity:function(){
		// 	if(this.internationalCommodity.length==0||tradePageStore.state.quatoType != 1){
		// 		return;
		// 	}
		// 	var contractData = this.internationalCommodity.slice(0);
		// 	contractData = contractData.sort(compare('firstLetter'),false);
		// 	function compare(prop){
		// 		return function(a,b){
		// 			var value1 = a[prop];
		// 			var value2 = b[prop];
		// 			return value1.charCodeAt()- value2.charCodeAt();
		// 		}
		// 	}
		// 	this.contractData = formatList(contractData,'firstLetter');
		// 	function formatList(arr,keyword) {
		// 		let newArr1 = [];
		// 		let tempArr = [];
		// 		let reg = /\b(\w)|\s(\w)/g;
		// 		let k = 0;
		// 		let firstWord = arr[0][keyword].charAt(0).toUpperCase();//获取第一个分类字母
		// 		arr.map((v) => {
		// 			v[keyword] = v[keyword].replace(reg,m=>m.toUpperCase());//首字母大写
		// 			if(firstWord == v[keyword].charAt(0)){
		// 			  tempArr.push(v);
		// 			  newArr1[k] = {
		// 				Title:firstWord,
		// 				List:tempArr
		// 			  }
		// 			}else{
		// 			  //这里循环到这表示已经第二个字母了
		// 			  firstWord = v[keyword].charAt(0);//设置第二字母
		// 			  tempArr = [];//把之前的清除掉
		// 			  tempArr.push(v);//添加第一个
		// 			  newArr1[++k] = {//自增
		// 				Title: firstWord,
		// 				List : tempArr
		// 			  }
		// 			}
		// 		});
		// 		return newArr1;
		// 	}
		// },
		// domesticCommodity:function(){
		// 	if(this.domesticCommodity.length==0||tradePageStore.state.quatoType != 2){
		// 		return;
		// 	}
		// 	var contractData = this.domesticCommodity.slice(0);
		// 	contractData = contractData.sort(compare('firstLetter'),false);
		// 	function compare(prop){
		// 		return function(a,b){
		// 			var value1 = a[prop];
		// 			var value2 = b[prop];
		// 			return value1.charCodeAt()- value2.charCodeAt();
		// 		}
		// 	}
		// 	this.contractData = formatList(contractData,'firstLetter');
		// 	function formatList(arr,keyword) {
		// 		let newArr1 = [];
		// 		let tempArr = [];
		// 		let reg = /\b(\w)|\s(\w)/g;
		// 		let k = 0;
		// 		let firstWord = arr[0][keyword].charAt(0).toUpperCase();//获取第一个分类字母
		// 		arr.map((v) => {
		// 			v[keyword] = v[keyword].replace(reg,m=>m.toUpperCase());//首字母大写
		// 			if(firstWord == v[keyword].charAt(0)){
		// 			  tempArr.push(v);
		// 			  newArr1[k] = {
		// 				Title:firstWord,
		// 				List:tempArr
		// 			  }
		// 			}else{
		// 			  //这里循环到这表示已经第二个字母了
		// 			  firstWord = v[keyword].charAt(0);//设置第二字母
		// 			  tempArr = [];//把之前的清除掉
		// 			  tempArr.push(v);//添加第一个
		// 			  newArr1[++k] = {//自增
		// 				Title: firstWord,
		// 				List : tempArr
		// 			  }
		// 			}
		// 		});
		// 		return newArr1;
		// 	}
		// },
	},
	mounted() {
		mui('#contractScroll').scroll({
			scrollY:true,
			scrollX:true,
			indicators:false,
			bounce:false,
		});
		emitter.$on('selectContractBtn',(item)=>{
			if(item.CommodityNo==this.chooseContract.commodity_no){
				return;
			}
			var chooseItem = {};
			for(var i=0,len=this.allSubsCommodity.length;i<len;i++){
				if(item.CommodityNo==this.allSubsCommodity[i].commodity_no){
					chooseItem = this.allSubsCommodity[i];
					break;
				}
			}
			this.selectContractBtn(chooseItem);
		})
	},
	methods:{
		//选择当前选择的合约
		selectContractBtn(item){
			if(item.commodity_no == this.chooseContract.commodity_no){
				layer.close(tradePageStore.state.contractLayer);
				return;
			}
			if(isLogin){
				//登录实盘
				tradePageStore.state.WSUrl = address2;
			}else{
				//未登录游客
				tradePageStore.state.WSUrl = address1;
			}
			marketStore.dispatch('cancelDepthSubscribe');
			marketStore.dispatch('cancelTickerSubscribe');
			tradeStore.state.chooseContract = item;
			localStorage.setItem('chooseContract',JSON.stringify(item));
			if(item.quatoData){
				marketStore.state.LastData = item.quatoData;
			}else{
				marketStore.state.LastData[3] = '0';
				marketStore.state.LastData[6] = '0';
				marketStore.state.LastData[10] = '0';
				marketStore.state.LastData[11] = '0';
				marketStore.state.LastData[12] = '0';
				marketStore.state.LastData[13] = '0';
				marketStore.state.LastData[14] = '0';
			}
			marketStore.state.currentQuato = this.chooseContract.security_type + '_' + this.chooseContract.commodity_no;
			if(tradePageStore.state.tradeTabIndex == 4){
				marketStore.dispatch('depthSubscribe');
				marketStore.dispatch('tickerSubscribe');
			}
			tradePageStore.state.headerTextTop = item.commodity_name;
			tradePageStore.state.headerTextBottom = item.commodity_no+item.main_contract_no;
			tradePageStore.state.chartUrl = this.chartUrl + "?period='"+this.period+"'&contractNo='"+item.security_type + '_' + this.chooseContract.commodity_no + '_' + this.chooseContract.mainContract +"'&contractName='"+this.chooseContract.commodity_name+"'&priceType='"+this.priceType+"'" + "&apiUrl=" + tradePageStore.state.apiUrl + "&WSUrl=" + tradePageStore.state.WSUrl;
			layer.close(tradePageStore.state.contractLayer);
		},
	}
})
