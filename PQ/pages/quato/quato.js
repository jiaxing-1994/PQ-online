var quato = new Vue({
	el:'#quato',
	data:{
		switchRate:true,//切换涨跌额/涨跌幅 true涨跌幅 false涨跌额
		addressStatus:false,
		quatoList:[],
		isNetworkConnect:false,
		tradeType:1,
		quatoType:1,
		_internationalCommodity:[],
		_domesticCommodity:[],
		classTimer:null,
	},
	computed:{
		internationalCommodity:function(){
			return marketStore.state.internationalCommodity;
		},
		contractIndex:function(){
			return marketStore.state.contractIndex
		},
		domesticCommodity:function(){
			return marketStore.state.domesticCommodity;
		}
	},
	mounted(){
		if(GetURLParam()){
			this.quatoType = Number(GetURLParam().quatoType);
		}
		this.getTradeType();
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
		var _this = this;
		layui.use('layer',function(){
			layer = layui.layer;
			_this.networkChange();
		})
		marketStore.state.currentQuato = '';
		marketStore.state.subscribeContract = [];
	},
	watch:{
		contractIndex:function(n,v){
			if(this.quatoType == 1){
				var backgroundColorClass = this.internationalCommodity[n].color;
			}else if(this.quatoType == 2){
				var backgroundColorClass = this.domesticCommodity[n].color;
			}
			if(backgroundColorClass&&document.getElementsByClassName('quato-item').length>0){
				document.getElementsByClassName('quato-item')[n].classList.add(backgroundColorClass);
				this.classTimer = setTimeout(function(){
					if(document.getElementsByClassName('quato-item').length>0){
						document.getElementsByClassName('quato-item')[n].classList.remove(backgroundColorClass);
					}
				}.bind(this),500);
			}
		},
		addressStatus:function(){
			if(this.addressStatus&&this.isNetworkConnect){
				marketStore.dispatch('connectQuato');
			}
		},
		internationalCommodity:function(){
			var list = this.internationalCommodity;
			for(var i=0,len=list.length;i<len;i++){
				list[i].isOnTrade = this.checkTradeTime(list[i].tradingTime,list[i].notTradingTime);
				if(list[i].commodity_no == 'CN'){
					// console.log(list[i].tradingTime)
				}
				var timeList = list[i].tradingTime.split('，');
				var a = timeList[0].split('-')[0];
				var b = timeList[timeList.length - 1].split('-')[1];
				list[i].handleTime = a + '-' + b;
			}
			if(!localStorage.getItem('chooseContract')){
				localStorage.setItem('chooseContract',JSON.stringify(list[0]));
			}
			this._internationalCommodity = list;
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
			this._domesticCommodity = _list;
			if(this.quatoType == 2){
				this.quatoList = this._domesticCommodity;
			}
		},
		isNetworkConnect:function(){
			if(this.isNetworkConnect){
				this.getAddress();
			}
		}
	},
	methods:{
		//判断是否是模拟交易
		getTradeType(){
			if(localStorage.getItem('tradeType')){
				this.tradeType = localStorage.getItem('tradeType');
			}else{
				this.tradeType = 1;
			}
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
			}
			return false;
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
					url:'/PQ/pages/quato/quatoDetail/quatoDetail.html?sourcePage=home',
					id:'quatoDetail.html'
				})
			}
		},
		//切换涨跌额涨跌幅
		switchRateBtn(){
			this.switchRate = !this.switchRate;
		},
		//网络变化
		networkChange(){
			var _this = this;
			if(window.navigator.onLine==true) {
				this.isNetworkConnect = true;
		　　}else {
				layer.msg('未连接网络',{
					time:1500
				})
				this.isNetworkConnect = false;
				this.addressStatus = false;
		　　}
		　　window.addEventListener("online", online, false);
		　　window.addEventListener("offline", offline, false);
		　　function online(){
				_this.isNetworkConnect = true;
				console.log(layer);
				layer.msg('网络连接',{
					time:1500
				})
			}
		　　function offline() {
				_this.isNetworkConnect = false;
				_this.addressStatus = false;
				layer.msg('网络断开，请检查网络',{
					time:2000
				})
			}
		},
		switchQuatoType(index){
			this.quatoType = index;
			marketStore.state.quatoType = index;
			switch(index){
				case 1:this.quatoList = this._internationalCommodity;
					if(this.classTimer!=null){
						clearTimeout(this.classTimer);
						this.classTimer = null;
					};
					break;
				case 2:
					this.quatoList = this._domesticCommodity.slice(0);
					if(this.classTimer!=null){
						clearTimeout(this.classTimer);
						this.classTimer = null;
					};
					break;
			}
		}
	}
})