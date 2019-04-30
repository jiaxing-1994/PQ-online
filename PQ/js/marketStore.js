window.marketStore = new Vuex.Store({
	state:{
		isReConnect:false,//是否重连
		isConnectMarket:false,//是否连接行情
		isMarketLogin:false,//是否行情登录
		isCanConnectTrade:false,//是否可以链接交易
		_internationalCommodity:[],
		internationalCommodity:[], //国际期货行情数据
		domesticCommodity:[], //国内期货行情数据
		contractList:[], //静态订阅行情 用于切换合约 避免重复渲染
		allCommodity:[],//全部合约
		allSubsCommodity:[],//全部订阅的合约
		subsCommodity:[],//订阅的所有行情数据
		marketSocket:null, //行情WS实例
		marketConfig:{
			version: '2.0',
			url_address:'', //ws://192.168.0.232:9102 ws://quote.vs.com:8888
			userName:'chenlin',
			password:'a123456',
			subscribeType:['FO','FI'], //需要订阅的合约类型
		},
		chooseQuatoType:'FO',
		currentQuato:'', //当前选择的行情
		LastData:{},//选择的行情的最新数据
		isDepth:false,//是否深度订阅了
		depthLastData:{},//深度行情数据
		subscribeContract:['CL'], //订阅的合约 为空则订阅全部数据
		contractIndex:-1,
		totalFloatProfit:0,//总浮动盈亏
		heartCheck:{
			timeout:20000,
			timeoutObj:null,
		},
		RMBRate:1,
		currencyRate:[],//汇率数据
		tickerList:[],
		depositList:{}, //合约保证金列表
		feeList:{},//手续费列表
		loginNum:0,
		quatoType:1,//1国际 2国内
	},
	mutations:{
		//获取所有合约
		getAllCommodity(state){
			if(localStorage.getItem('allContract')){
				state.allCommodity = JSON.parse(localStorage.getItem('allContract'));
				state.isCanConnectTrade = true;
				state.currencyRate = JSON.parse(localStorage.getItem('currencyRate'));
				for(var i=0;i<state.currencyRate.length;i++){
					if(state.currencyRate[i].currencyNo == 'CNY'){
						state.RMBRate = state.currencyRate[i].exchangeRate;
						break;
					}
				}
				return true;
			}else{
				return false;
			}
		},
		reset:function(state){
			if(state.heartCheck.timeoutObj == null){
				return;
			}
			clearTimeout(state.heartCheck.timeoutObj);
			this.commit('start');
		},
		start:function(state){
			state.heartCheck.timeoutObj = setTimeout(function(){
				state.isReConnect = true;
				clearTimeout(state.heartCheck.timeoutObj);
				layer.msg('行情断开，正在重连',{
					time:2000
				});
				this.dispatch('connectQuato');
			}.bind(this),state.heartCheck.timeout);
		}
	},
	actions:{
		//连接行情
		connectQuato(context){
			if(context.state.heartCheck.timeoutObj!=null){
				clearTimeout(context.state.heartCheck.timeoutObj);
			}
			if(context.state.marketSocket){
				context.state.marketSocket.close();
				context.state.marketSocket = null;
			}
			//判断连接行情地址
			if(isLogin&&context.state.loginNum != 2){
				//登录
				context.state.marketConfig.url_address = address2[0];
				context.state.marketConfig.userName = userInfo.mobile;
				context.state.marketConfig.password = userInfo.password;
			}else{
				//未登录
				context.state.marketConfig.url_address = address1[0];
			}
			if(!context.state.marketConfig.url_address){
// 				layer.msg('未获取到交易地址',{
// 					time:1500
// 				});
				return;
			}
			context.state.marketSocket = new WebSocket(context.state.marketConfig.url_address);
			context.state.marketSocket.onopen = function(){
				context.state.isConnectMarket = true;
				if(context.state.isReConnect){
					layer.msg('行情重连成功',{
						time:1000
					})
					context.state.isReConnect = false;
				}
				var loginParam = {
					method:'req_login',
					req_id:'',
					data:{
						user_name:context.state.marketConfig.userName,
						password:context.state.marketConfig.password,
						protoc_version:context.state.marketConfig.version
					}
				};
				context.state.marketSocket.send(JSON.stringify(loginParam));

			};
			context.state.marketSocket.onmessage = function(message){
				context.dispatch('WSmessage',message.data)
			};
			context.state.marketSocket.onclose = function(){
				context.state.isConnectMarket = false;
				context.state.isCanConnectTrade = false;
				context.state.isMarketLogin = false;
			};
			context.state.marketSocket.onerror = function(){
// 				layer.msg('行情连接失败',{
// 					time:2000
// 				});
			};
		},
		//ws返回数据处理
		WSmessage(context,message){
			message = JSON.parse(message);
			if(message.method == 'on_rsp_login'){
				if(message.error_code == 0){
					context.state.isMarketLogin = true;
					console.log('连接行情服务器成功');
					//如果没有获取全部合约则重新查一次
					request.post('/contractList',{typeCode:'1,2'},5000)
					.then(function(acct){
						if(acct.success&&acct.data.length>0){
							//处理合约数据
							var ContractList = [];
							for(var z=0;z<acct.data.length;z++){
								var contractList = acct.data[z].contractList;
								for(var i=0;i<contractList.length;i++){
									contractList[i].commodity_no = contractList[i].contractCode;
									contractList[i].commodity_name = contractList[i].contractName;
									contractList[i].contract_size = contractList[i].contractSize;
									contractList[i].currency_no = contractList[i].currencyNo;
									contractList[i].dot_size = contractList[i].dotSize;
									contractList[i].exchange_no = contractList[i].exchangeCode;
									contractList[i].main_contract_no = contractList[i].mainContract;
									contractList[i].mini_ticker_size = contractList[i].miniTikeSize;
									contractList[i].security_type = contractList[i].typeCode=='1'?'FO':contractList[i].typeCode=='2'?'FI':contractList[i].typeCode=='3'?'C':'FO';
									if(location.pathname.indexOf('home.html') != -1){
										//首页订阅数据
										//热门
										context.state.subscribeContract.push(contractList[i].security_type+'_'+contractList[i].contractCode);
									}
									context.state.depositList[contractList[i].contractCode] = contractList[i].deposit;
									context.state.feeList[contractList[i].contractCode] = contractList[i].fee;
								}
								ContractList = ContractList.concat(contractList);
								// for(var i=0;i<contractList.length;i++){
								// 	context.state.depositList[contractList[i].contractCode] = contractList[i].deposit;
								// 	context.state.feeList[contractList[i].contractCode] = contractList[i].fee;
								// }
							}
							context.state.allCommodity = ContractList;
							localStorage.setItem('allContract',JSON.stringify(ContractList));
							context.dispatch('sendHeartBeat');
							if(context.state.subscribeContract.length == 0){
								//订阅全部
								context.dispatch('subscribeAllContract');
							}else{
								//只订阅一个
								context.dispatch('subscribeOneContract');
							}
						}else{
							if(localStorage.getItem('allContract')){
								//处理合约数据
								var contractList = JSON.parse(localStorage.getItem('allContract'));
								for(var i=0;i<contractList.length;i++){
									contractList[i].commodity_no = contractList[i].contractCode;
									contractList[i].commodity_name = contractList[i].contractName;
									contractList[i].contract_size = contractList[i].contractSize;
									contractList[i].currency_no = contractList[i].currencyNo;
									contractList[i].dot_size = contractList[i].dotSize;
									contractList[i].exchange_no = contractList[i].exchangeCode;
									contractList[i].main_contract_no = contractList[i].mainContract;
									contractList[i].mini_ticker_size = contractList[i].miniTikeSize;
									contractList[i].security_type = contractList[i].typeCode=='1'?'FO':contractList[i].typeCode=='2'?'FI':contractList[i].typeCode=='3'?'C':'FO';
									if(location.pathname.indexOf('home.html') != -1){
										//首页订阅数据
										//热门
										context.state.subscribeContract.push(contractList[i].contractCode);
									}
								}
								context.state.allCommodity = contractList;
								for(var i=0;i<contractList.length;i++){
									context.state.depositList[contractList[i].contractCode] = contractList[i].deposit;
								}
								context.state.isCanConnectTrade = true;
								if(context.state.subscribeContract.length == 0){
									//订阅全部
									context.dispatch('subscribeAllContract');
								}else{
									//只订阅一个
									context.dispatch('subscribeOneContract');
								}
							}else{
								//行情获取失败
								layer.msg('行情合约获取失败',{
									time:1500
								})
							}
						}
					}).catch(function(err){
						console.log(err);
						layer.msg('系统错误',{
							time:1500
						});
					})
				}else{
					console.log('登录失败');
					if(isLogin){
						if(context.state.loginNum==2){
							layer.msg('系统错误',{
								time:1500
							})
							return;
						}
						context.state.loginNum++;
						context.dispatch('connectQuato');
					}
				}
			}else if(message.method == 'on_rtn_quote'){
				//行情
				var lastData = message.data;//最新行情
				//国际
				var internationalList = context.state.internationalCommodity.slice(0);
				for(var i=0;i<internationalList.length;i++){
					if(lastData[0].split('_')[1] == internationalList[i].commodity_no){
						if(internationalList[i].quatoData&&internationalList[i].quatoData[0]!=0){
							internationalList[i].color = lastData[3]>internationalList[i].quatoData[3]?'colorUpBackground':lastData[3]-internationalList[i].quatoData[3]==0?'':'colorDownBackground';
						}
						internationalList[i].quatoData = lastData;
						if(context.state.quatoType == 1){
							context.state.contractIndex = i;
						}
						break;
					}
				}
				context.state.internationalCommodity = internationalList.slice(0);
				//国内
				var domesticList = context.state.domesticCommodity.slice(0);
				for(var i=0;i<domesticList.length;i++){
					if(lastData[0].split('_')[1] == domesticList[i].commodity_no){
						if(domesticList[i].quatoData){
							domesticList[i].color = lastData[3]>domesticList[i].quatoData[3]?'colorUpBackground':lastData[3]-domesticList[i].quatoData[3]==0?'':'colorDownBackground';
						}else{
							domesticList[i].color = "";
						}
						domesticList[i].quatoData = lastData;
						if(context.state.quatoType == 2){
							context.state.contractIndex = i;
						}
						break;
					}
				}
				context.state.domesticCommodity = domesticList.slice(0);
				//选择的合约的最新数据
				if(context.state.currentQuato!=''&&context.state.currentQuato.split('_')[1] == message.data[0].split("_")[1]){
					context.state.LastData = message.data.slice(0);
				}
				if(tradeStore.state.isTradeLogin&&tradeStore.state.positionList.length>0){
					//如果交易登录的话并且有持仓的话 则计算持仓浮动盈亏
					context.dispatch('positionFloatProfit',message.data);
				}else{
					context.state.totalFloatProfit = 0;
				}
			}else if(message.method == 'on_rtn_depth'){
				//深度订阅推送行情
				context.state.depthLastData = message.data.slice(0);
			}else if(message.method == 'on_rsp_subscribe'){
				//深度订阅返回
				if(message.error_code == 0&&message.data.fail_list&&message.data.fail_list.length>0){
					var list = context.state._internationalCommodity.slice(0);
					var domesticList = context.state.domesticCommodity.slice(0);
					var failList = message.data.fail_list;
					for(var i=0;i<list.length;i++){
						for(var j=0,len2=failList.length;j<len2;j++){
							if(failList[j].err_msg != '重复订阅'){
								if(failList[j].contract_code.split('_')[1]==list[i].commodity_no){
									list.splice(i,1);
									i--;
									break;
								}
							}
						}
					}
					for(var i=0;i<domesticList.length;i++){
						for(var j=0,len2=failList.length;j<len2;j++){
							if(failList[j].err_msg != '重复订阅'){
								if(failList[j].contract_code.split('_')[1]==domesticList[i].commodity_no){
									domesticList.splice(i,1);
									i--;
									break;
								}
							}
						}
					}
					context.state.internationalCommodity = list;
					context.state.domesticCommodity = domesticList;
					context.state.allSubsCommodity = [];
					context.state.allSubsCommodity = context.state.allSubsCommodity.concat(list).concat(domesticList);
				}else{
					context.state.allSubsCommodity = [];
					context.state.internationalCommodity = context.state._internationalCommodity.slice(0);
					context.state.allSubsCommodity = context.state.allSubsCommodity.concat(context.state.internationalCommodity).concat(context.state.domesticCommodity);
				}
				if(message.error_code == 0&&message.data.succ_list&&message.data.succ_list.length>0){
					context.state.isDepth = true;
				}
				context.state.isCanConnectTrade = true;
			}else if(message.method == 'on_rsp_unsubscribe'){
				//取消订阅返回
				context.state.isDepth = false;
			}else if(message.method == 'on_rtn_ticker'){
				//订阅逐笔
				context.state.tickerList.unshift(message.data);
				if(context.state.tickerList.length>100){
					context.state.tickerList.splice(context.state.tickerList.length-1,1);
				}
			}else if(message.method == 'on_rsp_heartbeat'){
				context.commit('reset');
				setTimeout(()=>{
					this.dispatch('sendHeartBeat');
				},2000);
			}
		},
		//发送心跳
		sendHeartBeat(context){
			var heartBeatParam = {
				method:'req_heartbeat',
				req_id:'',
				data:{
					ref:'123'
				}
			};
			context.state.marketSocket.send(JSON.stringify(heartBeatParam));
		},
		//计算持仓浮动盈亏
		positionFloatProfit(context,lastData){
			if(lastData[3] == 0){
				return;
			}
			var positionList = tradeStore.state.positionList;
			var totalFloatProfit = 0;
			for(var i=0,length=positionList.length;i<length;i++){
				if(lastData[0].split('_')[1] == positionList[i].CommodityNo){
					if(positionList[i].Direction == 0){
						//买多
						positionList[i]['floatProfit'] = ((lastData[3]-positionList[i].HoldAvgPrice)*positionList[i].HoldNum*positionList[i].contractNum).toFixed(0);
					}else{
						//卖空
						positionList[i]['floatProfit'] = ((positionList[i].HoldAvgPrice-lastData[3])*positionList[i].HoldNum*positionList[i].contractNum).toFixed(0);
					}
					if(positionList[i].HoldAvgPrice==0){
						positionList[i]['floatProfit'] = 0;
					}
					totalFloatProfit+=parseFloat(positionList[i].floatProfit)*(positionList[i].currencyRate);
					// break;
				}else if((positionList[i].floatProfit||positionList[i].floatProfit==0)&&positionList[i].floatProfit!='获取中...'){
					totalFloatProfit+=parseFloat(positionList[i].floatProfit)*(positionList[i].currencyRate);
					// console.log(positionList[i].currencyRate);
				}
			};
			var capitalList = tradeStore.state.capitalList;
			for(var i=0,length=capitalList.length;i<length;i++){
				capitalList[i].floatProfit=0;
				for(var j=0,length2=positionList.length;j<length2;j++){
					if(capitalList[i].CurrencyNo == positionList[j].CurrencyNo){
						if(!positionList[j].floatProfit){
							positionList[j].floatProfit = 0;
						}
						capitalList[i].floatProfit=parseFloat(capitalList[i].floatProfit)+parseFloat(positionList[j].floatProfit);
					}
				}
			}
			tradeStore.state.capitalList = capitalList.slice(0);
			context.state.totalFloatProfit = totalFloatProfit;
		},
		//订阅所有合约
		subscribeAllContract(context){
			var commodityList = context.state.allCommodity;
			var length = commodityList.length;
			var _subscribeList = [];
			for(var i = 0;i<length;i++){
				if(context.state.marketConfig.subscribeType.indexOf(commodityList[i].security_type) != -1){
					//获取需要订阅的期货和外汇等等
					commodityList[i].quatoData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
					_subscribeList.push(commodityList[i]);
				}
			}
			//存入订阅的行情
			context.state.subsCommodity = _subscribeList;
			//循环去订阅
			var subsLength = _subscribeList.length;
			var contractList = [];//订阅传的参数
			for(var i = 0;i<subsLength;i++){
				var obj = _subscribeList[i].security_type + '_' + _subscribeList[i].commodity_no;
				contractList.push(obj);
			}
			var subscribeParam={
				method:'req_subscribe',
				req_id:'',
				data:{
					contract_list:contractList,
					mode:'MODE_SNAP'
				}
			};
			context.state.marketSocket.send(JSON.stringify(subscribeParam));
			var _list = _subscribeList;
			var internationalList = [];
			var domesticList = [];
			for(var i=0;i<_list.length;i++){
				if(_list[i].security_type == 'FO'){
					internationalList.push(_list[i]);
				}else if(_list[i].security_type == 'FI'){
					domesticList.push(_list[i]);
				}
			}
			//去重
			var _internationalList=[];
			for (var i = 0; i < internationalList.length; i++) {
				for (var j = i+1; j < internationalList.length; j++) {
					if(internationalList[i].contractCode===internationalList[j].contractCode){
						++i;
					}
				}
				_internationalList.push(internationalList[i]);
			}
			var _domesticList=[];
			for (var i = 0; i < domesticList.length; i++) {
				for (var j = i+1; j < domesticList.length; j++) {
					if(domesticList[i].contractCode===domesticList[j].contractCode){
						++i;
					}
				}
				_domesticList.push(domesticList[i]);
			}
			context.state._internationalCommodity = _internationalList;
			context.state.internationalCommodity = _internationalList;
			context.state.domesticCommodity = _domesticList;
			context.state.contractList = internationalList;
		},
		//深度订阅选择的合约
		depthSubscribe(context){
			var contractList = [];//订阅传的参数
			contractList.push(context.state.currentQuato);
			var subscribeParam={
				method:'req_subscribe',
				req_id:'',
				data:{
					contract_list:contractList,
					mode:'MODE_DEPTH'
				}
			};
			context.state.marketSocket.send(JSON.stringify(subscribeParam));
		},
		//取消深度订阅
		cancelDepthSubscribe(context){
			if(context.state.isDepth){
				var contractList = [];//订阅传的参数
				contractList.push(context.state.currentQuato);
				var subscribeParam={
					method:'req_unsubscribe',
					req_id:'',
					data:{
						contract_list:contractList,
						mode:'MODE_DEPTH'
					}
				};
				context.state.marketSocket.send(JSON.stringify(subscribeParam));
			}
		},
		//订阅逐笔
		tickerSubscribe(context){
			var contractList = [];//订阅传的参数
			contractList.push(context.state.currentQuato);
			var subscribeParam={
				method:'req_subscribe',
				req_id:'',
				data:{
					contract_list:contractList,
					mode:'MODE_TICKER'
				}
			};
			context.state.marketSocket.send(JSON.stringify(subscribeParam));
		},
		//取消订阅逐笔
		cancelTickerSubscribe(context){
			var contractList = [];//订阅传的参数
			contractList.push(context.state.currentQuato);
			var subscribeParam={
				method:'req_unsubscribe',
				req_id:'',
				data:{
					contract_list:contractList,
					mode:'MODE_TICKER'
				}
			};
			context.state.marketSocket.send(JSON.stringify(subscribeParam));
		},
		//订阅指定的合约
		subscribeOneContract(context){
			if(context.state.subscribeContract.length==0){
				return;
			}
			var contractList = [];
			for(var i=0,length=context.state.subscribeContract.length;i<length;i++){
				var params = context.state.subscribeContract[i];
				contractList.push(params)
			}
			var subscribeParam={
				method:'req_subscribe',
				req_id:'',
				data:{
					contract_list:contractList,
					mode:'MODE_SNAP'
				}
			};
			context.state.marketSocket.send(JSON.stringify(subscribeParam));
			var _list = context.state.allCommodity;
			var internationalList = [];
			var domesticList = [];
			for(var i=0;i<_list.length;i++){
				_list[i].quatoData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
				if(_list[i].security_type == 'FO'){
					internationalList.push(_list[i]);
				}else if(_list[i].security_type == 'FI'){
					domesticList.push(_list[i]);
				}
			}
			context.state._internationalCommodity = internationalList;
			context.state.internationalCommodity = internationalList;
			context.state.domesticCommodity = domesticList;
			context.state.contractList = internationalList;
		}
	}
})